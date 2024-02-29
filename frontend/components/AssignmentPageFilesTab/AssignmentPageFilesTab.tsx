import axios, { handleError } from '@/axios';
import { TestCaseStatus, promptForFileObject } from '@/components';
import { SnackbarContext } from '@/hooks';
import { Button, Caption1, Card, Link, Subtitle1 } from '@fluentui/react-components';
import {
    Add24Filled,
    DocumentMultiple24Regular,
    Folder24Filled,
} from '@fluentui/react-icons';
import { Commit, UserFetchedAssignment } from 'codetierlist-types';
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

    const getTestData = useCallback(async () => {
        await axios
            .get<Commit>(
                `/courses/${assignment.course_id}/assignments/${assignmentID}/${route}`,
                {
                    skipErrorHandling: true,
                    params: {
                        utorid: searchParams.get('utorid') ?? undefined,
                    },
                }
            )
            .then((res) => {
                if (
                    res.data.log[0] != content.log[0] ||
                    res.data.valid != content.valid
                )
                    setContent(res.data);
                    // TODO why is this needed on production build?
                    content = res.data;
            })
            .catch((e) => {
                handleError(showSnackSev)(e);
                setContent({ files: [], log: [] } as Commit);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignment.course_id, assignmentID, route]);

    useEffect(() => {
        if (currentFolder && !content.files.includes(currentFile)) {
            setCurrentFolder('');
        }
        if (currentFile && !content.files.includes(currentFile)) {
            setCurrentFile('');
        }
    }, [content.files, currentFile, currentFolder]);

    const submitFolder = async (fileslist: File[], target?: string) => {
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
            <div className={`${styles.uploadHeader} m-b-xl`}>
                <Subtitle1 className={styles.testCaseHeader} block>
                    Uploaded {routeName}s
                    <TestCaseStatus status={content.valid} />
                </Subtitle1>

                {!searchParams.has('utorid') && (
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
