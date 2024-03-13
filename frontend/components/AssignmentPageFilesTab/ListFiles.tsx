import axios, { handleError } from '@/axios';
import { FileRender } from '@/components/AssignmentPageFilesTab/FileRender';
import { SnackbarContext } from '@/hooks';
import { Tree, useRestoreFocusTarget } from '@fluentui/react-components';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { FileListing } from './FileListing';
import { FolderListing } from './FolderListing';
import { useFileListingProps } from './FileListingContext';

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
export const ListFiles = () => {
    const {
        currentFile,
        commit,
        commitId,
        assignment,
        assignmentId,
        route,
        submitFiles,
    } = useFileListingProps();

    const { showSnackSev } = useContext(SnackbarContext);
    const searchParams = useSearchParams();
    const [currentFileContent, setCurrentFileContent] = useState<ArrayBuffer | null>(
        null
    );

    // turn the files into a tree
    const files = convertPathsToTree(commit.files);

    /** get the contents of a file and set it in the state
     * @param file the file to get the contents of
     */
    const getFileContents = async (file: string) => {
        await axios
            .get<ArrayBuffer>(
                `/courses/${assignment.course_id}/assignments/${assignmentId}/${route}/${commitId || (commit.log[0]?.id ?? '')}/${file}`,
                {
                    skipErrorHandling: true,
                    params: {
                        utorid: searchParams.get('utorid') ?? undefined,
                    },
                    responseType: 'arraybuffer',
                }
            )
            .then((res) => {
                // read the file contents from buffer
                setCurrentFileContent(res.data);
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
    }, [currentFile, submitFiles]);

    const focusTargetAttribute = useRestoreFocusTarget();

    /** for each folder in the first level of the tree (the root) create a folder */
    const treeChildren = Array.from(files.children).map((file) => {
        return file.children.length === 0 ? (
            <FileListing
                key={file.name}
                path={file.name}
                {...focusTargetAttribute}
            />
        ) : (
            <FolderListing
                key={file.name}
                path={file.name}
                subtree={file}
                {...focusTargetAttribute}
            />
        );
    });

    return (
        <>
            {commit.files && commit.files.length > 0 && (
                <Tree
                    aria-label={`Files for ${route}`}
                    checkedItems={currentFile ? [currentFile] : []}
                >
                    {treeChildren}
                </Tree>
            )}

            {currentFile && currentFile !== '' && currentFileContent && (
                <FileRender path={currentFile} content={currentFileContent} />
            )}
        </>
    );
};
