import { SnackbarContext } from '@/hooks';
import { Button, TreeItem, TreeItemLayout } from '@fluentui/react-components';
import { Delete20Regular } from '@fluentui/react-icons';
import { basename } from 'path';
import { useContext } from 'react';
import styles from './AssignmentPageFilesTab.module.css';
import { deletePath } from '@/components/AssignmentPageFilesTab/helpers';

export declare type FileListingProps = {
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
};

export const FileListing = ({
    fullRoute,
    update,
    path,
    changeFile,
    currentFile,
}: FileListingProps) => {
    const { showSnackSev } = useContext(SnackbarContext);

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
                                void deletePath({
                                    changePath: changeFile,
                                    currentPath: currentFile,
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
                {currentFile === path && <strong>{basename(path)}</strong>}
                {currentFile !== path && <>{basename(path)}</>}
            </TreeItemLayout>
        </TreeItem>
    );
};
