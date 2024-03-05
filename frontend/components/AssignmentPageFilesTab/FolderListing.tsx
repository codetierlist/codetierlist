import { promptForFileObject, ToolTipIcon } from '@/components';
import { deletePath } from '@/components/AssignmentPageFilesTab/helpers';
import { SnackbarContext } from '@/hooks';
import { Button, Tree, TreeItem, TreeItemLayout } from '@fluentui/react-components';
import { FileIconType, getFileTypeIconAsUrl } from '@fluentui/react-file-type-icons';
import { ArrowUpload20Regular, Delete20Regular } from '@fluentui/react-icons';
import Image from 'next/image';
import { basename, join } from 'path';
import { useContext } from 'react';
import { Dropzone } from './Dropzone';
import { FileListing, FileListingProps } from './FileListing';
import { TreeType } from './ListFiles';

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
};

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
    ...props
}: FolderListingProps) => {
    const { showSnackSev } = useContext(SnackbarContext);

    const treeChildren = Array.from(subtree.children).map((file) => {
        return file.children.length === 0 ? (
            <FileListing
                {...props}
                key={join(path, file.name)}
                changeFile={changeFile}
                currentFile={currentFile}
                fullRoute={fullRoute}
                path={join(path, file.name)}
                update={update}
            />
        ) : (
            <FolderListing
                {...props}
                key={join(path, file.name)}
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
    });

    return (
        <Dropzone
            submitFiles={(files) => {
                submitFiles(files, path);
            }}
            routeName={routeName}
            customDropText={`Drop files to upload to ${path}`}
        >
            <TreeItem
                itemType="branch"
                aria-description="has actions"
                value={path}
                {...props}
            >
                <TreeItemLayout
                    iconBefore={
                        <Image
                            src={
                                getFileTypeIconAsUrl({
                                    type: FileIconType.folder,
                                    size: 16,
                                }) ?? ''
                            }
                            className="m-r-xs"
                            alt=""
                            width={16}
                            height={16}
                        />
                    }
                    actions={
                        <>
                            <ToolTipIcon
                                tooltip={`Upload files to ${basename(path)}`}
                                icon={
                                    <Button
                                        aria-label="Upload"
                                        appearance="subtle"
                                        icon={<ArrowUpload20Regular />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            promptForFileObject({
                                                folders: false,
                                                multiple: true,
                                            }).then((files) => {
                                                submitFiles(Array.from(files), path);
                                            });
                                        }}
                                    />
                                }
                            />

                            <Button
                                aria-label="Delete"
                                appearance="subtle"
                                icon={<Delete20Regular />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    void deletePath({
                                        changePath: changeFolder,
                                        currentPath: changeFolder
                                            ? currentFolder
                                            : undefined,
                                        fullRoute,
                                        path,
                                        showSnackSev,
                                        update,
                                    });
                                }}
                            />
                        </>
                    }
                >
                    {basename(path)}
                </TreeItemLayout>
                <Tree>{treeChildren}</Tree>
            </TreeItem>
        </Dropzone>
    );
};
