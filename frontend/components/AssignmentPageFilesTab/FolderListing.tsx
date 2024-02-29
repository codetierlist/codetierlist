import axios, { handleError } from '@/axios';
import { SnackbarContext } from '@/hooks';
import {
    Button,
    Tree,
    TreeItem,
    TreeItemLayout
} from '@fluentui/react-components';
import {
    Delete20Regular
} from '@fluentui/react-icons';
import { basename, join } from 'path';
import { useContext, useState } from 'react';
import { Dropzone } from './Dropzone';
import { TreeType } from './ListFiles';
import styles from './AssignmentPageFilesTab.module.css';
import { FileListing, FileListingProps } from './FileListing';

export declare type FolderListingProps = FileListingProps & {
    /** the subtree to display */
    subtree: TreeType;
    /** a function to call when the folder is changed */
    changeFolder?: (folder: string) => void;
    /** the current folder */
    currentFolder: string;
    /** a function to submit files */
    submitFiles: (files: File[], path?: string) => void;
    /** the name of the route */
    routeName: string;
}

export const FolderListing = ({
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
}: FolderListingProps) => {
    const { showSnackSev } = useContext(SnackbarContext);

    /** delete a file from the server
     * @param file the file to delete
     */
    const deleteFile = async (file: string) => {
        if (currentFolder === file) {
            changeFolder && changeFolder('');
        }
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
            <TreeItem itemType="branch" open={expanded}>
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
