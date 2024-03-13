import axios, { handleError } from '@/axios';
import {
    TestCaseStatus,
    promptForFileObject,
    checkIfCourseAdmin,
    HeaderToolbar,
    ToolTipIcon,
} from '@/components';
import { SnackbarContext, UserContext } from '@/hooks';
import {
    Button,
    Caption1,
    Card,
    Dropdown,
    Link,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    Subtitle1,
    Option,
} from '@fluentui/react-components';
import {
    Add24Filled,
    DocumentMultiple24Regular,
    EditProhibited24Filled,
    Folder24Filled,
} from '@fluentui/react-icons';
import { Commit, JobResult, UserFetchedAssignment } from 'codetierlist-types';
import JSZip from 'jszip';
import { useSearchParams } from 'next/navigation';
import { basename, normalize } from 'path';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styles from './AssignmentPageFilesTab.module.css';
import { Dropzone } from './Dropzone';
import { ListFiles } from './ListFiles';
import { FileListingContext } from './FileListingContext';

export declare type AssignmentPageFilesTabProps = {
    /** a function that fetches the assignment */
    fetchAssignment: () => Promise<void>;
    /** the assignment to display */
    assignment: UserFetchedAssignment;
    /** the ID of the assignment */
    assignmentID: string;
    /** the name of the route */
    routeName: string;
    /** the route to use */
    route: 'testcases' | 'submissions';
};

/**
 * Shows the validation error
 */
const ValidationError = ({
    validationResult,
}: {
    /** the job result if it exists */
    validationResult?: JobResult;
}) => {
    if (!validationResult)
        return "This testcase failed instructor's solution for unknown reason";
    if (validationResult.status === 'PASS')
        return "This testcase passed instructor's solution";
    if (validationResult.status === 'FAIL')
        return (
            <>
                The instructor&apos;s solution failed{' '}
                {validationResult.amount - validationResult.score} out of{' '}
                {validationResult.amount} testcases.
                <br />
                <br />
                <b>Failed cases:</b>
                <ul>
                    {validationResult.failed.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </>
        );
    if (validationResult.status === 'ERROR')
        return (
            <>
                This testcase errored when running instructor&apos;s solution.
                {'error' in validationResult && (
                    <>
                        <br />
                        <br />
                        <b>Error:</b> {validationResult.error}
                    </>
                )}
            </>
        );
    if (validationResult.status === 'TESTCASE_EMPTY')
        return 'No testcases were provided for this testcase';
    return "This testcase failed instructor's solution for unknown reason";
};

/**
 * Shows the validation error message bar
 */
const ValidationErrorMessageBar = ({
    commit,
}: {
    /** the commit info */
    commit: Commit;
}) => {
    if (commit.valid === 'INVALID') {
        return (
            <MessageBar className="m-y-m" intent={'error'}>
                <MessageBarBody>
                    <MessageBarTitle>
                        This testcase failed instructor&apos;s solution
                    </MessageBarTitle>
                    <ValidationError validationResult={commit.validation_result} />
                </MessageBarBody>
            </MessageBar>
        );
    }
    return null;
};

/**
 * The admin bar for the file selector
 */
const FileSelectorAdminBar = ({
    content,
    setCommitID,
    getTestData,
}: {
    /** the commit info */
    content: Commit;
    /** a function to set the commit id */
    setCommitID: (commitID: string) => void;
    /** a function to get the test data */
    getTestData: (commit: string) => Promise<void>;
}) => {
    const values = useMemo(() => {
        return content.log.map((commit) => ({
            key: commit.id,
            text: `${new Date(commit.date).toLocaleString()}${commit.id === content.log[0].id ? ' (Latest)' : ''}`,
        }));
    }, [content.log]);

    return (
        <HeaderToolbar className="m-none p-xs">
            <Dropdown
                appearance="filled-darker"
                clearable={true}
                placeholder={values.length > 0 ? "Select a commit" : "No commits available"}
                onOptionSelect={(_, data) => {
                    setCommitID(data.optionValue || '');
                    data.optionValue && void getTestData(data.optionValue);
                }}
                defaultValue={values[0] && values[0].key}
            >
                {values.map((value) => (
                    <Option key={value.key} value={value.key}>
                        {value.text}
                    </Option>
                ))}
            </Dropdown>
        </HeaderToolbar>
    );
};

/**
 * A tab that displays the files for an assignment
 */
export const AssignmentPageFilesTab = ({
    fetchAssignment,
    assignment,
    assignmentID,
    routeName,
    route,
}: AssignmentPageFilesTabProps): JSX.Element => {
    // eslint-disable-next-line prefer-const
    let [content, setContent] = useState<Commit>({
        files: [],
        log: [],
    } as Commit);
    const { showSnackSev } = useContext(SnackbarContext);
    const searchParams = useSearchParams();
    const [currentFolder, setCurrentFolder] = useState<string>('');
    const [currentFile, setCurrentFile] = useState<string>('');
    const { userInfo } = useContext(UserContext);
    const [commitID, setCommitID] = useState<string>('');

    const getTestData = useCallback(
        async (commit = '') => {
            await axios
                .get<Commit>(
                    `/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/${commit}`,
                    {
                        skipErrorHandling: true,
                        params: {
                            utorid: searchParams.get('utorid') ?? undefined,
                        },
                    }
                )
                .then((res) => {
                    if (
                        res.data.log[0]?.id != content.log[0]?.id ||
                        res.data.valid != content.valid ||
                        res.data.files.length != content.files.length ||
                        res.data.files.some((x) => !content.files.includes(x))
                    ) {
                        setContent(res.data);
                    }
                    // TODO why is this needed on production build?
                    content = res.data;
                })
                .catch((e) => {
                    handleError(showSnackSev)(e);
                    setContent({ files: [], log: [] } as Commit);
                });
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [assignment.course_id, assignmentID, route]
    );

    useEffect(() => {
        if (currentFile && !content.files.includes(currentFile)) {
            if (currentFolder) {
                setCurrentFolder('');
            }
            setCurrentFile('');
        }
    }, [content.files, currentFile, currentFolder]);

    /**
     * Upload a folder to the system.
     *
     * By default, the target is the current folder selected. Otherwise
     * it is the root of the submission.
     */
    const submitFolder = async (files: File[], target?: string) => {
        if (commitID !== '') {
            showSnackSev('You can only update the latest submission', 'error');
            return;
        }
        if (files.length > 100 || files.reduce((a, x) => a + x.size, 0) >= 1e9) {
            showSnackSev(
                'Please upload less than 1000 files and less than 20mb at a time',
                'error'
            );
            return;
        }
        if (target === undefined) target = currentFolder;
        if (files) {
            const zip = new JSZip();
            if (!zip) {
                throw new Error('Failed to create zip folder');
            }
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const path =
                    'path' in file && typeof file.path === 'string'
                        ? file.path
                        : file.webkitRelativePath;
                zip.file(normalize(`/${path}`).slice(1), file.arrayBuffer(), {
                    binary: true,
                });
            }

            zip.generateAsync({ type: 'blob' }).then(function (blob) {
                const formData = new FormData();
                formData.append('files', blob, 'files.zip');

                axios
                    .post(
                        `/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/${target}`,
                        formData,
                        {
                            params: { unzip: true },
                            headers: { 'Content-Type': 'multipart/form-data' },
                        }
                    )
                    .then((res) => {
                        if (res.status === 200) {
                            showSnackSev('Files uploaded', 'success');
                        }
                    })
                    .catch((e) => {
                        handleError(showSnackSev)(e);
                    })
                    .finally(() => {
                        fetchAssignment();
                    });
            });
        }
    };

    /**
     * submit files to the server
     *
     * By default, the target is the current folder selected. Otherwise
     * it is the root of the submission.
     *
     * @param files the files to submit
     * @param target the path to submit the files to
     */
    const submitFiles = async (files: File[], target?: string) => {
        if (commitID !== '') {
            showSnackSev('You can only update the latest submission', 'error');
            return;
        }
        if (target === undefined) target = currentFolder;
        if (
            files.some((file) => {
                const path =
                    'path' in file && typeof file.path === 'string'
                        ? file.path
                        : file.webkitRelativePath;
                return path !== basename(path);
            })
        ) {
            await submitFolder(files, target);
            return;
        }
        const formData = new FormData();
        for (let i = 0; i < files!.length; i++) {
            formData.append('files', files![i]);
        }

        axios
            .post(
                `/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/${target}`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            )
            .then((res) => {
                if (res.status === 200) {
                    showSnackSev('Files uploaded', 'success');
                }
            })
            .catch((e) => {
                handleError(showSnackSev)(e);
            })
            .finally(() => {
                fetchAssignment();
            });
    };

    /**
     * increased polling rate while test is pending
     * since we expect runners to be fast
     */
    const PENDING_POLLING_RATE = 1000;

    useEffect(() => {
        if (content.valid === 'PENDING') {
            const interval = setInterval(() => {
                getTestData().then(() => {
                    if (content.valid !== 'PENDING') {
                        clearInterval(interval);
                        void fetchAssignment();
                    }
                });
            }, PENDING_POLLING_RATE);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content.valid, getTestData]);

    useEffect(() => {
        void getTestData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignmentID, fetchAssignment, route, routeName, assignment.submissions]);

    /**
     * upload a file to the server
     */
    const uploadFile = async () => {
        promptForFileObject({ folders: false, multiple: true })
            .then((file) => {
                if (file) {
                    submitFiles(Array.from(file));
                }
            })
            .catch((e) => {
                handleError(showSnackSev)(e);
            });
    };

    const uploadFolder = async () => {
        promptForFileObject({ folders: true, multiple: false })
            .then((files) => submitFolder(Array.from(files)))
            .catch((e) => {
                handleError(showSnackSev)(e);
            });
    };

    /**
     * conditions for if the file is editable:
     * - if the utorid is not in the search params (i.e. viewing another student's submission)
     * - if the assignment is not strict deadline
     * - the due date has not passed yet
     */
    const isEditable = useMemo(() => {
        return (
            !searchParams.has('utorid') &&
            (!assignment.strict_deadline ||
                assignment.due_date === undefined ||
                new Date(assignment.due_date) >= new Date()) &&
            commitID === ''
        );
    }, [assignment.due_date, assignment.strict_deadline, searchParams, commitID]);

    return (
        <div className="m-y-xxxl">
            {checkIfCourseAdmin(userInfo, assignment.course_id) && (
                <ValidationErrorMessageBar commit={content} />
            )}

            <div className={`${styles.uploadHeader} m-b-xl`}>
                <Subtitle1 className={styles.testCaseHeader} block>
                    Uploaded {routeName}s
                    <TestCaseStatus status={content.valid} />
                    {!isEditable && (
                        <ToolTipIcon
                            tooltip="This file selector is currently read only"
                            icon={<EditProhibited24Filled />}
                        />
                    )}
                </Subtitle1>

                {isEditable && (
                    <div>
                        <Button
                            icon={<Folder24Filled />}
                            appearance="subtle"
                            onClick={uploadFolder}
                        >
                            Upload a folder
                            {currentFolder && ` to ${basename(currentFolder)}`}
                        </Button>
                        <Button
                            icon={<Add24Filled />}
                            appearance="subtle"
                            onClick={uploadFile}
                        >
                            Upload a {routeName}{' '}
                            {currentFolder ? ` to ${basename(currentFolder)}` : null}
                        </Button>
                    </div>
                )}
            </div>

            {checkIfCourseAdmin(userInfo, assignment.course_id) && (
                <FileSelectorAdminBar
                    content={content}
                    setCommitID={setCommitID}
                    getTestData={getTestData}
                />
            )}

            <div
                onClick={() => {
                    setCurrentFolder('');
                    setCurrentFile('');
                }}
            >
                <Dropzone
                    submitFiles={(files) => {
                        void submitFiles(files, '');
                    }}
                    dropText={`Drop files to upload as a ${routeName}`}
                    disabled={isEditable === false}
                >
                    <Card className="m-t-xl">
                        {!content.files || content.files.length === 0 ? (
                            <div className={styles.noFiles}>
                                <DocumentMultiple24Regular />
                                <Caption1>
                                    No files uploaded
                                    {isEditable && (
                                        <>
                                            {' '}
                                            yet. Drag and drop files here or{' '}
                                            <Link inline={true} onClick={uploadFile}>
                                                choose files
                                            </Link>{' '}
                                            to upload.
                                        </>
                                    )}
                                </Caption1>
                            </div>
                        ) : null}

                        <FileListingContext.Provider
                            value={{
                                update: getTestData,
                                changeFile: setCurrentFile,
                                currentFile,
                                changeFolder: setCurrentFolder,
                                currentFolder,
                                submitFolder,
                                submitFiles,
                                isEditable,
                                assignmentId: assignmentID,
                                assignment,
                                commit: content,
                                commitId: commitID,
                                route,
                                fullRoute: `/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/`,
                            }}
                        >
                            <ListFiles />
                        </FileListingContext.Provider>
                    </Card>
                </Dropzone>
            </div>
        </div>
    );
};
