import axios, { handleError } from '@/axios';
import { Monaco, TestCaseStatus, promptForFileObject } from '@/components';
import { SnackbarContext } from '@/contexts/SnackbarContext';
import {
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    Button,
    Caption1,
    Card,
    Subtitle1,
    Text,
    Tree,
    TreeItem,
    Tooltip,
    Link,
    TreeItemLayout,
} from '@fluentui/react-components';
import {
    Add24Filled,
    Delete16Filled,
    Delete20Regular,
    DocumentMultiple24Regular,
} from '@fluentui/react-icons';
import { Commit, UserFetchedAssignment } from 'codetierlist-types';
import { useSearchParams } from 'next/navigation';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './AssignmentPageFilesTab.module.css';

const dummy: Commit = {
    files: [
        'e.py',
        'subfolder/asdfsaf.py',
        'subfolder/lab10.py',
        'subfolder/subsubfolder/lab10_tests.py',
    ],
    log: [
        '64ab39e9cadef44c03b2624bd32221bd42f13e1f',
        '0e0706aa37b1d16b6350bd1a0832544c8a712082',
        'b2e858144bba8903417ba3cbe5915d2b5197f98d',
    ],
    valid: 'VALID',
};

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

    paths.forEach(path => {
        let currentNode = root;
        const names = path.split('/');

        names.forEach(name => {
            let childNode = currentNode.children.find(child => child.name === name);
            if (!childNode) {
                childNode = { name, children: [] };
                currentNode.children.push(childNode);
            }
            currentNode = childNode;
        });
    });

    return root;
};

const FileListing = ({
    fullRoute,
    update,
    path,
    changeFile,
    currentFile
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
    const searchParams = useSearchParams();

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

    return (
        <TreeItem itemType="leaf">
            <TreeItemLayout
                className={`${currentFile === path ? styles.currentFile : ''}`}
                actions={
                    <>
                        <Button
                            aria-label="Delete"
                            appearance="subtle"
                            icon={<Delete20Regular />}
                            onClick={() => deleteFile(path)}
                        />
                    </>
                }
            >
                {/* todo: make this span the whole width */}
                <div onClick={() => changeFile && changeFile(path)}>
                    {
                        currentFile === path && (
                            <strong>{path}</strong>
                        )
                    }{
                        currentFile !== path && (
                            <>{path}</>
                        )
                    }
                </div>
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
    currentFile
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
    /** the current file */
    currentFile?: string;
}) => {
    const { showSnackSev } = useContext(SnackbarContext);
    const searchParams = useSearchParams();
    const FULL_ROUTE = `${fullRoute}${path}/`;

    /** delete a file from the server
     * @param file the file to delete
     */
    const deleteFile = async (file: string) => {
        await axios
            .delete(`${FULL_ROUTE}${file}`, {
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

    return (
        <TreeItem itemType="branch" actions={<></>}>
            <TreeItemLayout>
                {path}
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
                                path={file.name}
                                update={update}
                            />
                        ) : (
                            <FolderListing
                                key={key}
                                changeFile={changeFile}
                                currentFile={currentFile}
                                fullRoute={fullRoute}
                                path={file.name}
                                subtree={file}
                                update={update}
                            />
                        );
                    })}
                </Tree>
            }
        </TreeItem>
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
}: ListFilesProps) => {
    const { showSnackSev } = useContext(SnackbarContext);
    const searchParams = useSearchParams();
    const [currentFile, setCurrentFile] = useState<string>("");
    const [currentFileContent, setCurrentFileContent] = useState<string | null>(null);

    // turn the files into a tree
    const files = convertPathsToTree(dummy.files);

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
        console.log('currentFile', currentFile);

        if (currentFile) {
            void getFileContents(currentFile);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentFile]);

    return (
        <>
            {
                // for each folder in the first level of the tree (the root) create a folder
                commit.files &&
                <Tree aria-label={route}>
                    {
                        Object.entries(files.children).map(([key, file]) => {
                            return file.children.length === 0 ? (
                                <FileListing
                                    key={key}
                                    fullRoute={FULL_ROUTE}
                                    update={update}
                                    changeFile={setCurrentFile}
                                    path={file.name}
                                    currentFile={currentFile}
                                />
                            ) : (
                                <FolderListing
                                    key={key}
                                    fullRoute={FULL_ROUTE}
                                    update={update}
                                    path={file.name}
                                    changeFile={setCurrentFile}
                                    subtree={file}
                                    currentFile={currentFile}
                                />
                            );
                        })
                    }
                </Tree>
            }

            {currentFile !== "" && (
                <Monaco
                    height="50vh"
                    language="python"
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
            .then((res) => setContent(res.data))
            .catch((e) => {
                handleError(showSnackSev)(e);
                setContent({ files: [], log: [] } as Commit);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignment.course_id, assignmentID, route]);

    /**
     * submit files to the server
     * @param files the files to submit
     */
    const submitFiles = async (files: File[]) => {
        const formData = new FormData();
        for (let i = 0; i < files!.length; i++) {
            formData.append('files', files![i]);
        }

        axios
            .post(
                `/courses/${assignment.course_id}/assignments/${assignmentID}/${route}`,
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

    // create a dropzone for the user to upload files
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: submitFiles,
        noClick: true,
        noKeyboard: true,
        multiple: true,
        autoFocus: false,
        disabled: searchParams.has('utorid'),
    });

    /**
     * upload a file to the server
     */
    const uploadFile = async () => {
        // todo: make the language based on the runner
        promptForFileObject('.py', true)
            .then((file) => {
                if (file) {
                    submitFiles(Array.from(file));
                }
            })
            .catch((e) => {
                handleError(showSnackSev)(e);
            });
    };

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
                <div className="m-y-xxxl">
                    <div className={`${styles.uploadHeader} m-b-xl`}>
                        <Subtitle1 className={styles.testCaseHeader} block>
                            Uploaded {routeName}s
                            <TestCaseStatus status={content.valid} />
                        </Subtitle1>

                        {!searchParams.has('utorid') && (
                            <Button
                                icon={<Add24Filled />}
                                appearance="subtle"
                                onClick={uploadFile}
                            >
                                Upload a {routeName}
                            </Button>
                        )}
                    </div>

                    {content.log[0] && (
                        <Text block className={styles.commitId} font="numeric">
                            {content.log[0]}
                        </Text>
                    )}

                    <Card className="m-t-xl">
                        <input {...getInputProps()} />
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
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};
