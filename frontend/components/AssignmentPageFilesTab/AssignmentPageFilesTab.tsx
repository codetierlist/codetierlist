import axios, { handleError } from '@/axios';
import {
    HeaderToolbar,
    TestCaseStatus,
    ToolTipIcon,
    checkIfCourseAdmin,
    convertDate,
    convertTime,
    promptForFileObject,
} from '@/components';
import { SnackbarContext, UserContext } from '@/hooks';
import {
    Button,
    Caption1,
    Card,
    Dropdown,
    Link,
    MessageBar,
    MessageBarActions,
    MessageBarBody,
    MessageBarTitle,
    Option,
    ProgressBar,
    Subtitle1,
    Toast,
    ToastBody,
    ToastTitle,
    useId,
    useToastController,
} from '@fluentui/react-components';
import {
    Add24Regular,
    ArrowDownload24Regular,
    DocumentMultiple24Regular,
    EditProhibited24Regular,
    Folder24Regular,
} from '@fluentui/react-icons';
import { Commit, JobResult, UserFetchedAssignment } from 'codetierlist-types';
import JSZip from 'jszip';
import { useSearchParams } from 'next/navigation';
import { basename, normalize } from 'path';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styles from './AssignmentPageFilesTab.module.css';
import { Dropzone } from './Dropzone';
import { FileListingContext } from './FileListingContext';
import { ListFiles, getFileContents } from './ListFiles';

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
    /** the subtext to put below the header */
    description: string;
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
    const { showSnack } = useContext(SnackbarContext);

    const CopyButton = () => (
        <MessageBarActions>
            <Button
                onClick={() => {
                    navigator.clipboard
                        .writeText(JSON.stringify(commit.validation_result) ?? '')
                        .then(() => {
                            showSnack('Status copied', 'success');
                        })
                        .catch(() => {
                            showSnack('Failed to copy status', 'error');
                        });
                }}
            >
                Copy result
            </Button>
        </MessageBarActions>
    );

    if (commit.valid === 'INVALID') {
        return (
            <MessageBar className="m-y-m" intent={'error'}>
                <MessageBarBody>
                    <MessageBarTitle>
                        This testcase failed instructor&apos;s solution
                    </MessageBarTitle>
                    <ValidationError validationResult={commit.validation_result} />
                </MessageBarBody>
                <CopyButton />
            </MessageBar>
        );
    } else if (commit.valid === 'VALID') {
        return (
            <MessageBar className="m-y-m" intent={'success'}>
                <MessageBarBody>
                    <MessageBarTitle>
                        This testcase passed instructor&apos;s solution
                    </MessageBarTitle>
                </MessageBarBody>
                <CopyButton />
            </MessageBar>
        );
    }
    return null;
};

/**
 * The admin bar for the file selector
 */
const FileSelectorDropdown = ({
    content,
    setCommitID,
    update,
}: {
    /** the commit info */
    content: Commit;
    /** a function to set the commit id */
    setCommitID: (commitID: string) => void;
    /** a function to get the test data */
    update: () => Promise<void>;
}) => {
    const values = useMemo(() => {
        return content.log.map((commit) => ({
            key: commit.id,
            text: `${new Date(commit.date).toLocaleString()}${commit.id === content.log[0].id ? ' (Latest)' : ''}`,
        }));
    }, [content.log]);

    return (
        <Dropdown
            appearance="filled-lighter"
            clearable={true}
            placeholder={values.length === 0 ? 'No past uploads' : 'View past uploads'}
            onOptionSelect={(_, data) => {
                setCommitID(data.optionValue || '');
                data.optionValue && void update();
            }}
            defaultValue={values[0] && values[0].key}
        >
            {values.map((value) => (
                <Option key={value.key} value={value.key}>
                    {value.text}
                </Option>
            ))}
        </Dropdown>
    );
};

/**
 * This button downloads all the files in a submission
 */
const DownloadEverythingButton = () => {
    const { showSnack, toasterId } = useContext(SnackbarContext);
    const { dismissToast, dispatchToast } = useToastController(toasterId);
    const searchParams = useSearchParams();
    const { commitId, commit, assignment, assignmentId, route } =
        useContext(FileListingContext);
    const toastId = useId('download-toast');

    const DownloadToast = () => (
        <Toast>
            <ToastTitle>
                Downloading files
                {searchParams.get('utorid') ? ` for ${searchParams.get('utorid')}` : ''}
            </ToastTitle>
            <ToastBody>
                <ProgressBar />
            </ToastBody>
        </Toast>
    );

    /**
     * download the entire submission as a zip file by downloading each file
     * one by one and zipping them up into a single file
     */
    const downloadSubmission = async () => {
        const zip = new JSZip();

        dispatchToast(<DownloadToast />, { toastId, timeout: -1 });

        for (const file of commit.files) {
            const response = await getFileContents(
                `/courses/${assignment.course_id}/assignments/${assignmentId}/${route}`,
                commitId || (commit.log[0]?.id ?? ''),
                file,
                searchParams.get('utorid')
            ).catch(handleError(showSnack));

            if (response) {
                zip.file(file, response.data);
            } else {
                showSnack('Failed to download files', 'error');
                return null;
            }
        }

        zip.generateAsync({ type: 'blob' })
            .then(function (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${route}${searchParams.get('utorid') ? `-${searchParams.get('utorid')}` : ''}.zip`;
                a.click();
                URL.revokeObjectURL(url);
            })
            .catch((e) => {
                handleError(showSnack)(e);
            })
            .finally(() => {
                dismissToast(toastId);
                showSnack('Files downloaded', 'success');
            });
    };

    return (
        <Button
            icon={<ArrowDownload24Regular />}
            appearance="subtle"
            onClick={downloadSubmission}
        >
            Download files
        </Button>
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
    description,
}: AssignmentPageFilesTabProps): JSX.Element => {
    // eslint-disable-next-line prefer-const
    let [content, setContent] = useState<Commit>({
        files: [],
        log: [],
    } as Commit);

    const { showSnack } = useContext(SnackbarContext);
    const { userInfo } = useContext(UserContext);
    const searchParams = useSearchParams();

    const [currentFolder, setCurrentFolder] = useState<string>('');
    const [currentFile, setCurrentFile] = useState<string>('');

    // the commit id to display
    const [commitID, setCommitID] = useState<string>('');

    const getTestData = useCallback(async () => {
        await axios
            .get<Commit>(
                `/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/${commitID}`,
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
                handleError(showSnack)(e);
                setContent({ files: [], log: [] } as Commit);
            });
    }, [assignment.course_id, assignmentID, route, commitID, searchParams]);

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
            showSnack('You can only update the latest submission', 'error');
            return;
        }
        if (files.length > 100 || files.reduce((a, x) => a + x.size, 0) >= 1e9) {
            // TODO: this should sync with the backend
            showSnack(
                'Please upload less than 30 files and less than 20mb at a time',
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

                // check if the blob is less than 50 MB in size
                if (blob.size > 50 * 1024 * 1024) {
                    showSnack('Please upload a folder less than 50MB', 'error');
                    return;
                }

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
                            showSnack('Files uploaded', 'success');
                        }
                    })
                    .catch((e) => {
                        handleError(showSnack)(e);
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
            showSnack('You can only update the latest submission', 'error');
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
                    showSnack('Files uploaded', 'success');
                }
            })
            .catch((e) => {
                handleError(showSnack)(e);
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
    }, [
        assignmentID,
        fetchAssignment,
        route,
        routeName,
        assignment.submissions,
        commitID,
    ]);

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
                handleError(showSnack)(e);
            });
    };

    const uploadFolder = async () => {
        promptForFileObject({ folders: true, multiple: false })
            .then((files) => submitFolder(Array.from(files)))
            .catch((e) => {
                handleError(showSnack)(e);
            });
    };

    /**
     * The current commit object that is selected by an admin
     */
    const currentCommit = useMemo(() => {
        return content.log.find((log) => log.id === commitID)
            ? content.log.find((log) => log.id === commitID)
            : content.log[0];
    }, [commitID, content.log]);

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
            <div className="m-y-xxxl">
                <div className={`${styles.uploadHeader} m-b-xl`}>
                    <Subtitle1 className={styles.testCaseHeader} block as="h2">
                        Uploaded {routeName}s{' '}
                        {commitID &&
                            currentCommit &&
                            `from ${convertDate(
                                new Date(currentCommit.date)
                            )} at ${convertTime(new Date(currentCommit.date))}`}
                        <TestCaseStatus status={content.valid} />
                        {!isEditable && (
                            <ToolTipIcon
                                tooltip="This file selector is currently read only"
                                icon={<EditProhibited24Regular />}
                            />
                        )}
                    </Subtitle1>
                    <Caption1 className="p-y-s" block as="p">
                        {description}
                    </Caption1>
                </div>

                {checkIfCourseAdmin(userInfo, assignment.course_id) && (
                    <ValidationErrorMessageBar commit={content} />
                )}

                <HeaderToolbar className="m-none p-xs">
                    <Button
                        disabled={!isEditable}
                        icon={<Folder24Regular />}
                        appearance="subtle"
                        onClick={uploadFolder}
                    >
                        Upload folder
                        {currentFolder &&
                            currentFolder !== '.' &&
                            ` to ${basename(currentFolder)}`}
                    </Button>

                    <Button
                        disabled={!isEditable}
                        icon={<Add24Regular />}
                        appearance="subtle"
                        onClick={uploadFile}
                    >
                        Upload {routeName}{' '}
                        {currentFolder &&
                            currentFolder !== '.' &&
                            ` to ${basename(currentFolder)}`}
                    </Button>

                    <DownloadEverythingButton />

                    <FileSelectorDropdown
                        content={content}
                        setCommitID={setCommitID}
                        update={async () => {
                            setCurrentFile('');
                            setCurrentFolder('');
                            await getTestData();
                        }}
                    />
                </HeaderToolbar>

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
                                                <Link inline onClick={uploadFile}>
                                                    choose files
                                                </Link>{' '}
                                                to upload.
                                            </>
                                        )}
                                    </Caption1>
                                </div>
                            ) : null}
                            <ListFiles />
                        </Card>
                    </Dropzone>
                </div>
            </div>
        </FileListingContext.Provider>
    );
};
