import axios, { handleError } from '@/axios';
import { Monaco } from '@/components';
import { SnackbarContext } from '@/hooks';
import {
    Tree
} from '@fluentui/react-components';
import { Commit, UserFetchedAssignment } from 'codetierlist-types';
import { useSearchParams } from 'next/navigation';
import { join, normalize } from 'path';
import { useContext, useEffect, useState } from 'react';
import { FileListing } from './FileListing';
import { FolderListing } from './FolderListing';

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

export declare type TreeType = {
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

/**
 * A list of files for a commit
 */
export const ListFiles = ({
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
