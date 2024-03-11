import axios, { handleError } from '@/axios';
import { TestCaseStatus, promptForFileObject, checkIfCourseAdmin } from '@/components';
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
    Folder24Filled,
} from '@fluentui/react-icons';
import { Commit, JobResult, UserFetchedAssignment } from 'codetierlist-types';
import JSZip from 'jszip';
import { useSearchParams } from 'next/navigation';
import { basename, normalize } from 'path';
import { useCallback, useContext, useEffect, useState } from 'react';
import styles from './AssignmentPageFilesTab.module.css';
import { Dropzone } from './Dropzone';
import { ListFiles } from './ListFiles';

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

const ValidationError = ({ validationResult }: { validationResult?: JobResult }) => {
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

    const submitFolder = async (fileslist: File[], target?: string) => {
        if (commitID !== '') {
            showSnackSev('You can only update the latest submission', 'error');
            return;
        }
        if (fileslist.length > 100 || fileslist.reduce((a, x) => a + x.size, 0) >= 1e9) {
            showSnackSev(
                'Please upload less than 1000 files and less than 1GB at a time',
                'error'
            );
            return;
        }
        if (target === undefined) target = currentFolder;
        if (fileslist) {
            const zip = new JSZip();
            if (!zip) {
                throw new Error('Failed to create zip folder');
            }
            for (let i = 0; i < fileslist.length; i++) {
                const file = fileslist[i];
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
    const POLLING_RATE = 1000;

    useEffect(() => {
        if (content.valid === 'PENDING') {
            const interval = setInterval(() => {
                getTestData().then(() => {
                    if (content.valid !== 'PENDING') {
                        clearInterval(interval);
                        void fetchAssignment();
                    }
                });
            }, POLLING_RATE);
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
        // todo: make the language based on the runner
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

    return (
        <div className="m-y-xxxl">
            {content.valid === 'INVALID' &&
                checkIfCourseAdmin(userInfo, assignment.course_id) && (
                    <MessageBar className="m-y-m" intent={'error'}>
                        <MessageBarBody>
                            <MessageBarTitle>
                                This testcase failed instructor&apos;s solution
                            </MessageBarTitle>
                            <ValidationError
                                validationResult={content.validation_result}
                            />
                        </MessageBarBody>
                    </MessageBar>
                )}
            <div className={`${styles.uploadHeader} m-b-xl`}>
                <Subtitle1 className={styles.testCaseHeader} block>
                    Uploaded {routeName}s
                    <TestCaseStatus status={content.valid} />
                </Subtitle1>

                {!searchParams.has('utorid') &&
                    (!assignment.strict_deadline ||
                        assignment.due_date === undefined ||
                        new Date(assignment.due_date) >= new Date()) && (
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
            <Dropdown
                onOptionSelect={(_, data) => {
                    setCommitID(data.optionValue || '');
                    void getTestData(data.optionValue);
                }}
                defaultValue={"Latest - " + (content.log[0] ? new Date(content.log[0].date).toLocaleString() : '')}
            >
                {content.log[0] && (
                    <Option
                        value=""
                        text={`Latest - ${content.log[0] ? new Date(content.log[0].date).toLocaleString() : ''}`}
                    >
                        Latest - {new Date(content.log[0]?.date).toLocaleString()}
                    </Option>
                )}
                {content.log.slice(1).map((commit) => (
                    <Option
                        key={commit.id}
                        value={commit.id}
                        text={new Date(commit.date).toLocaleString()}
                    >
                        {new Date(commit.date).toLocaleString()}
                    </Option>
                ))}
            </Dropdown>

            {/* {content.log[0] && (
                        <Text block className={styles.commitId} font="numeric">
                            {content.log[0]}
                        </Text>
                    )} */}
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
                    routeName={routeName}
                >
                    <Card className="m-t-xl">
                        {!content.files || content.files.length === 0 ? (
                            <div className={styles.noFiles}>
                                <DocumentMultiple24Regular />
                                <Caption1>
                                    No files uploaded yet. Drag and drop files here or{' '}
                                    <Link inline={true} onClick={uploadFile}>
                                        choose files
                                    </Link>{' '}
                                    to upload.
                                </Caption1>
                            </div>
                        ) : null}
                        <ListFiles
                            commitID={commitID}
                            commit={content}
                            route={route}
                            assignment={assignment}
                            assignmentID={assignmentID}
                            update={getTestData}
                            currentFolder={currentFolder}
                            setCurrentFolder={setCurrentFolder}
                            currentFile={currentFile}
                            setCurrentFile={setCurrentFile}
                            submitFiles={submitFiles}
                        />
                    </Card>
                </Dropzone>
            </div>
        </div>
    );
};
