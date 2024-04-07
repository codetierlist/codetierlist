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
 * Get the file contents from the server for the current file given the commit id
 *
 * @param fullRoute the full route to the file, e.g., all the stuff before the commit id
 * @param commitId the commit id to get the file from
 * @param currentFile the current file to get the contents of
 *
 * @returns the file contents as an ArrayBuffer
 */
export const getFileContents = async (
    fullRoute: string,
    commitId: string,
    currentFile: string,
    utorid: string | null
) => {
    return await axios.get<ArrayBuffer>(`${fullRoute}/${commitId}/${currentFile}`, {
        responseType: 'arraybuffer',
        skipErrorHandling: true,
        params: {
            utorid: utorid ?? undefined,
        },
    });
};

/**
 * Hook to get the file contents. This will fetch the file contents when the current file changes
 * Expects the current file to be set in the FileListingContext
 *
 * @returns the file contents as an ArrayBuffer
 */
const useFileContents = () => {
    const { showSnack } = useContext(SnackbarContext);
    const [currentFileContent, setCurrentFileContent] = useState<ArrayBuffer | null>(
        null
    );
    const searchParams = useSearchParams();
    const { currentFile, commit, fullRoute, commitId } = useFileListingProps();

    useEffect(() => {
        if (currentFile) {
            getFileContents(
                fullRoute,
                commitId || (commit.log[0]?.id ?? ''),
                currentFile,
                searchParams.get('utorid')
            )
                .then((res) => {
                    setCurrentFileContent(res.data);
                })
                .catch((e) => {
                    handleError(showSnack)(e);
                });
        }

        return () => {
            setCurrentFileContent(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentFile, commit, fullRoute, commitId, searchParams]);

    return currentFileContent;
};

/**
 * A list of files for a commit
 */
export const ListFiles = () => {
    const { currentFile, commit, route } = useFileListingProps();

    const currentFileContent = useFileContents();

    // turn the files into a tree
    const files = convertPathsToTree(commit.files);

    const focusTargetAttribute = useRestoreFocusTarget();

    /** for each folder in the first level of the tree (the root) create a folder */
    const treeChildren = Array.from(files.children).map((file) => {
        return file.children.length === 0 ? (
            <FileListing key={file.name} path={file.name} {...focusTargetAttribute} />
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
