import { promptForFileObject, ToolTipIcon } from '@/components';
import { deletePath } from '@/components/AssignmentPageFilesTab/helpers';
import { SnackbarContext } from '@/hooks';
import { Button, Tree, TreeItem, TreeItemLayout } from '@fluentui/react-components';
import { FileIconType, getFileTypeIconAsUrl } from '@fluentui/react-file-type-icons';
import {
    Delete20Regular,
    DocumentArrowUp20Regular,
    FolderArrowUp20Regular,
} from '@fluentui/react-icons';
import Image from 'next/image';
import { basename, join } from 'path';
import { useContext } from 'react';
import { Dropzone } from './Dropzone';
import { FileListing, FileListingProps } from './FileListing';
import { useFileListingProps } from './FileListingContext';
import { TreeType } from './ListFiles';

export declare type FolderListingProps = FileListingProps & {
    /** the subtree to display */
    subtree: TreeType;
};

export const FolderListing = ({ path, subtree, ...props }: FolderListingProps) => {
    const {
        update,
        changeFolder,
        fullRoute,
        currentFolder,
        submitFiles,
        submitFolder,
        isEditable,
    } = useFileListingProps();

    const { showSnack } = useContext(SnackbarContext);

    /**
     * The children of the subtree
     */
    const treeChildren = Array.from(subtree.children).map((file) => {
        return file.children.length === 0 ? (
            <FileListing
                {...props}
                key={join(path, file.name)}
                path={join(path, file.name)}
            />
        ) : (
            <FolderListing
                {...props}
                key={join(path, file.name)}
                path={join(path, file.name)}
                subtree={file}
            />
        );
    });

    /**
     * The actions for the folder
     */
    const FolderListingActions = () =>
        isEditable && (
            <>
                <ToolTipIcon
                    tooltip={`Upload files to ${basename(path)}`}
                    icon={
                        <Button
                            appearance="subtle"
                            icon={<DocumentArrowUp20Regular />}
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

                <ToolTipIcon
                    tooltip={`Upload folder to ${basename(path)}`}
                    icon={
                        <Button
                            appearance="subtle"
                            icon={<FolderArrowUp20Regular />}
                            onClick={(e) => {
                                e.stopPropagation();
                                promptForFileObject({
                                    folders: true,
                                    multiple: false,
                                }).then((files) => {
                                    submitFolder(Array.from(files), path);
                                });
                            }}
                        />
                    }
                />

                <ToolTipIcon
                    tooltip={`Delete ${basename(path)} folder`}
                    icon={
                        <Button
                            appearance="subtle"
                            icon={<Delete20Regular />}
                            onClick={(e) => {
                                e.stopPropagation();
                                void deletePath({
                                    changePath: changeFolder,
                                    currentPath: changeFolder ? currentFolder : undefined,
                                    fullRoute,
                                    path,
                                    showSnack,
                                    update,
                                    editable: isEditable,
                                });
                            }}
                        />
                    }
                />
            </>
        );

    return (
        <Dropzone
            disabled={isEditable === false}
            submitFiles={(files) => {
                submitFiles(files, path);
            }}
            dropText={`Drop files to upload to ${path}`}
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
                    actions={<FolderListingActions />}
                >
                    {basename(path)}
                </TreeItemLayout>
                <Tree>{treeChildren}</Tree>
            </TreeItem>
        </Dropzone>
    );
};
