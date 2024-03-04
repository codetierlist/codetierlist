import { deletePath } from '@/components/AssignmentPageFilesTab/helpers';
import { SnackbarContext } from '@/hooks';
import {
    Button,
    Tree,
    TreeItem,
    TreeItemLayout,
    useRestoreFocusTarget,
} from '@fluentui/react-components';
import {
    Delete20Regular,
    Folder16Filled,
    FolderOpen16Filled,
} from '@fluentui/react-icons';
import { basename, join } from 'path';
import { useContext, useState } from 'react';
import styles from './AssignmentPageFilesTab.module.css';
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
    const focusTargetAttribute = useRestoreFocusTarget();

    const [expanded, setExpanded] = useState(false);

    const treeChildren = Array.from(subtree.children).map((file) => {
        return file.children.length === 0 ? (
            <FileListing
                key={join(path, file.name)}
                changeFile={changeFile}
                currentFile={currentFile}
                fullRoute={fullRoute}
                path={join(path, file.name)}
                update={update}
            />
        ) : (
            <FolderListing
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
                open={expanded}
                itemType="branch"
                aria-description="has actions"
                value={path}
                {...focusTargetAttribute}
                {...props}
            >
                <TreeItemLayout
                    onClick={(e) => {
                        e.stopPropagation();
                        changeFolder && changeFolder(path);
                        setExpanded(!expanded);
                    }}
                    iconBefore={
                        <>
                            {expanded && <FolderOpen16Filled className="m-r-xs" />}
                            {!expanded && <Folder16Filled className="m-r-xs" />}
                        </>
                    }
                    className={currentFolder === path ? styles.currentFile : ''}
                    actions={
                        <>
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
