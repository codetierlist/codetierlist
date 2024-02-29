import axios, { handleError } from '@/axios';
import { Monaco, TestCaseStatus, promptForFileObject } from '@/components';
import { SnackbarContext } from '@/contexts/SnackbarContext';
import {
    Button,
    Caption1,
    Card,
    Subtitle1,
    Tree,
    TreeItem,
    Link,
    TreeItemLayout,
} from '@fluentui/react-components';
import {
    Add24Filled,
    Delete20Regular,
    DocumentMultiple24Regular,
    Folder24Filled,
} from '@fluentui/react-icons';
import { Commit, UserFetchedAssignment } from 'codetierlist-types';
import { useSearchParams } from 'next/navigation';
import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { DropEvent, FileRejection, useDropzone } from 'react-dropzone';
import styles from './AssignmentPageFilesTab.module.css';
import { basename, join, normalize } from 'path';
import JSZip from 'jszip';

declare type ListFilesProps = {
    /** the commit to display */
    commit: Commit;
    /** the route to use */
    route: 'testcases' | 'submissions';
    /** the assignment to display */
    assignment: UserFetchedAssignment;
    /** the ID of the assignment */
    assignmentID: string;
    /** a function to call when the files are updated */
    update?: () => void;
    /** the current folder */
    currentFolder: string;
    /** a function to call when the folder is changed */
    setCurrentFolder: (folder: string) => void;
    /** the current file */
    currentFile: string;
    /** a function to call when the file is changed */
    setCurrentFile: (file: string) => void;
    /** a function to submit files */
    submitFiles: (files: File[]) => void;
};

declare type TreeType = {
    name: string;
    children: TreeType[];
};

/**
 * Given a list of file paths, construct a tree
 * @see https://stackoverflow.com/a/57344759
 */
const convertPathsToTree = (paths: string[]): TreeType => {
    const root: TreeType = { name: '', children: [] };

    paths.forEach((path) => {
        let currentNode = root;
        const names = path.split('/');

        names.forEach((name) => {
            let childNode = currentNode.children.find((child) => child.name === name);
            if (!childNode) {
                childNode = { name, children: [] };
                currentNode.children.push(childNode);
            }
            currentNode = childNode;
        });
    });

    return root;
};
const Dropzone = ({
    submitFiles,
    children,
    routeName,
}: {
    submitFiles: <T extends File>(
        acceptedFiles: T[],
        fileRejections: FileRejection[],
        event: DropEvent
    ) => void;
    children: ReactNode | ReactNode[];
    routeName: string;
}): JSX.Element => {
    const searchParams = useSearchParams();
    // create a dropzone for the user to upload files
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: submitFiles,
        noClick: true,
        noKeyboard: true,
        multiple: true,
        disabled: searchParams.has('utorid'),
        noDragEventsBubbling: true,
    });
    return (
        <div {...getRootProps({ className: styles.dropZone })}>
            {isDragActive ? (
                <div className={styles.dropZoneOverlay}>
                    <Subtitle1 block as="p" className={styles.dropZoneText}>
                        Drop files to upload as a {routeName}
                    </Subtitle1>
                </div>
            ) : null}
            <div className={styles.dropZoneChild}>
                <input {...getInputProps()} />
                {children}
            </div>
        </div>
    );
};
const FileListing = ({
    fullRoute,
    update,
    path,
    changeFile,
    currentFile,
}: {
    /** the full path of the file to display */
    path: string;
    /** a function to call when the files are updated */
    update?: () => void;
    /** the full route to the file */
    fullRoute: string;
    /** a function to call when the file is changed */
    changeFile?: (file: string) => void;
    /** the current file */
    currentFile?: string;
}) => {
    const { showSnackSev } = useContext(SnackbarContext);

    /** delete a file from the server
     * @param file the file to delete
     */
    const deleteFile = async (file: string) => {
        await axios
            .delete(`${fullRoute}${file}`, {
                skipErrorHandling: true,
            })
            .then((res) => {
                if (res.status === 200) {
                    showSnackSev('File deleted', 'success');
                }
            })
            .catch((e) => {
                handleError(showSnackSev)(e);
            })
            .finally(() => {
                if (currentFile === path) {
                    changeFile && changeFile('');
                }
                update && update();
            });
    };

    return (
        <TreeItem itemType="leaf">
            <TreeItemLayout
                className={`${currentFile === path ? styles.currentFile : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    changeFile && changeFile(path);
                }}
                actions={
                    <>
                        <Button
                            aria-label="Delete"
                            appearance="subtle"
                            icon={<Delete20Regular />}
                            onClick={(e) => {
                                e.stopPropagation();
                                void deleteFile(path);
                            }}
                        />
                    </>
                }
            >
                {currentFile === path && <strong>{basename(path)}</strong>}
                {currentFile !== path && <>{basename(path)}</>}
            </TreeItemLayout>
        </TreeItem>
    );
};

const FolderListing = ({
    fullRoute,
    update,
    path,
    changeFile,
    subtree,
    currentFile,
    changeFolder,
    currentFolder,
    submitFiles,
    routeName,
}: {
    /** the full path of the file to display */
    path: string;
    /** a function to call when the files are updated */
    update?: () => void;
    /** the full route to the file */
    fullRoute: string;
    /** the subtree to display */
    subtree: TreeType;
    /** a function to call when the file is changed */
    changeFile?: (file: string) => void;
    /** a function to call when the folder is changed */
    changeFolder?: (folder: string) => void;
    /** the current file */
    currentFile?: string;
    /** the current folder */
    currentFolder?: string;
    /** a function to submit files */
    submitFiles: (files: File[], path?: string) => void;
    /** the name of the route */
    routeName: string;
}) => {
    const { showSnackSev } = useContext(SnackbarContext);

    /** delete a file from the server
     * @param file the file to delete
     */
    const deleteFile = async (file: string) => {
        await axios
            .delete(`${fullRoute}${file}`, {
                skipErrorHandling: true,
            })
            .then((res) => {
                if (res.status === 200) {
                    showSnackSev('File deleted', 'success');
                }
            })
            .catch((e) => {
                handleError(showSnackSev)(e);
            })
            .finally(() => {
                update && update();
            });
    };
    const [expanded, setExpanded] = useState(false);

    return (
        <Dropzone
            submitFiles={(files) => {
                submitFiles(files, path);
            }}
            routeName={routeName}
        >
            <TreeItem
                itemType="branch"
                open={expanded}
            >
                <TreeItemLayout
                    onClick={(e) => {
                        e.stopPropagation();
                        changeFolder && changeFolder(path);
                        setExpanded(!expanded);
                    }}
                    className={currentFolder === path ? styles.currentFile : ''}
                    actions={
                    <>
                        {' '}
                        <Button
                            aria-label="Delete"
                            appearance="subtle"
                            icon={<Delete20Regular />}
                            onClick={(e) => {
                                e.stopPropagation();
                                void deleteFile(path);
                            }}
                        />
                    </>
                }
                >
                    {basename(path)}
                </TreeItemLayout>
                {
                    <Tree>
                        {Object.entries(subtree.children).map(([key, file]) => {
                            return file.children.length === 0 ? (
                                <FileListing
                                    key={key}
                                    changeFile={changeFile}
                                    currentFile={currentFile}
                                    fullRoute={fullRoute}
                                    path={join(path, file.name)}
                                    update={update}
                                />
                            ) : (
                                <FolderListing
                                    key={key}
                                    changeFile={changeFile}
                                    changeFolder={changeFolder}
                                    currentFile={currentFile}
                                    fullRoute={fullRoute}
                                    path={join(path, file.name)}
                                    subtree={file}
                                    update={update}
                                    currentFolder={currentFolder}
                                    submitFiles={submitFiles}
                                    routeName={routeName}
                                />
                            );
                        })}
                    </Tree>
                }
            </TreeItem>
        </Dropzone>
    );
};

/**
 * A list of files for a commit
 */
const ListFiles = ({
    commit,
    route,
    assignment,
    assignmentID,
    update,
    currentFolder,
    setCurrentFolder,
    currentFile,
    setCurrentFile,
    submitFiles,
}: ListFilesProps) => {
    const { showSnackSev } = useContext(SnackbarContext);
    const searchParams = useSearchParams();
    const [currentFileContent, setCurrentFileContent] = useState<string | null>(null);

    // turn the files into a tree
    const files = convertPathsToTree(commit.files);

    const FULL_ROUTE = `/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/`;

    /** get the contents of a file and set it in the state
     * @param file the file to get the contents of
     */
    const getFileContents = async (file: string) => {
        await axios
            .get<string>(
                `/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/${commit.log[0]}/${file}`,
                {
                    skipErrorHandling: true,
                    transformResponse: (res) => res,
                    params: {
                        utorid: searchParams.get('utorid') ?? undefined,
                    },
                }
            )
            .then((res) => {
                // read the file contents from buffer
                setCurrentFileContent(Buffer.from(res.data).toString('utf-8'));
            })
            .catch((e) => {
                handleError(showSnackSev)(e);
            });
    };

    useEffect(() => {
        if (currentFile) {
            void getFileContents(currentFile);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentFile]);

    return (
        <>
            {
                // for each folder in the first level of the tree (the root) create a folder
                commit.files && (
                    <Tree aria-label={route}>
                        {Object.entries(files.children).map(([key, file]) => {
                            return file.children.length === 0 ? (
                                <FileListing
                                    key={key}
                                    fullRoute={FULL_ROUTE}
                                    update={update}
                                    changeFile={(val) => {
                                        setCurrentFile(val);
                                        setCurrentFolder(
                                            val
                                                ? normalize(join('/', val, '..')).slice(1)
                                                : ''
                                        );
                                    }}
                                    path={file.name}
                                    currentFile={currentFile}
                                />
                            ) : (
                                <FolderListing
                                    key={key}
                                    fullRoute={FULL_ROUTE}
                                    update={update}
                                    path={file.name}
                                    changeFile={(val) => {
                                        setCurrentFile(val);
                                        setCurrentFolder(
                                            val ? normalize(join(val, '..')) : ''
                                        );
                                    }}
                                    changeFolder={(val) => {
                                        setCurrentFolder && setCurrentFolder(val);
                                        setCurrentFile('');
                                    }}
                                    subtree={file}
                                    currentFile={currentFile}
                                    currentFolder={currentFolder}
                                    submitFiles={submitFiles}
                                    routeName={route}
                                />
                            );
                        })}
                    </Tree>
                )
            }

            {currentFile !== '' && (
                <Monaco
                    height="50vh"
                    language={assignment.runner_image.split('/', 2)[0]}
                    value={currentFileContent ?? ''}
                />
            )}
        </>
    );
};

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
    const [content, setContent] = useState<Commit>({
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
                    res.data.log[0] !== content.log[0] ||
                    res.data.valid !== content.valid
                )
                    setContent(res.data);
            })
            .catch((e) => {
                handleError(showSnackSev)(e);
                setContent({ files: [], log: [] } as Commit);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignment.course_id, assignmentID, route]);

    useEffect(() => {
        if (!content.files.includes(currentFolder)) {
            setCurrentFile('');
        }
    }, [content.files]);

    const submitFolder = async (fileslist: File[]) => {
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
                        `/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/${currentFolder}`,
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
        if (!target) target = currentFolder;
        if (
            files.some((file) => {
                const path =
                    'path' in file && typeof file.path === 'string'
                        ? file.path
                        : file.webkitRelativePath;
                return path !== basename(path);
            })
        ) {
            await submitFolder(files);
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
                    <Dropzone
                        submitFiles={(files) => {
                            void submitFiles(files, '');
                        }}
                        routeName={routeName}
                    >
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
                    </Dropzone>
                </Card>
            </div>
        </div>
    );
};
