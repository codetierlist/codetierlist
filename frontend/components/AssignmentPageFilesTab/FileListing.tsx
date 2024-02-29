import axios, { handleError } from '@/axios';
import { SnackbarContext } from '@/hooks';
import {
    Button,
    TreeItem,
    TreeItemLayout
} from '@fluentui/react-components';
import {
    Delete20Regular
} from '@fluentui/react-icons';
import { basename } from 'path';
import { useContext } from 'react';
import styles from './AssignmentPageFilesTab.module.css';

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
}

export const FileListing = ({
    fullRoute,
    update,
    path,
    changeFile,
    currentFile,
}: FileListingProps) => {
    const { showSnackSev } = useContext(SnackbarContext);

    /** delete a file from the server
     * @param file the file to delete
     */
    const deleteFile = async (file: string) => {
        if (currentFile === file) {
            changeFile && changeFile('');
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
