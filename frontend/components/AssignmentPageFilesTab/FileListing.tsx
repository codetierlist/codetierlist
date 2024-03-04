import { deletePath } from '@/components/AssignmentPageFilesTab/helpers';
import { SnackbarContext } from '@/hooks';
import {
    Button,
    TreeItem,
    TreeItemLayout,
    useRestoreFocusTarget,
} from '@fluentui/react-components';
import { Delete20Regular } from '@fluentui/react-icons';
import { basename } from 'path';
import { useContext, useMemo } from 'react';
import { getFileTypeIconAsUrl } from '@fluentui/react-file-type-icons';
import styles from './AssignmentPageFilesTab.module.css';
import Image from 'next/image';

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
    ...props
}: FileListingProps) => {
    const { showSnackSev } = useContext(SnackbarContext);
    const focusTargetAttribute = useRestoreFocusTarget();

    const iconType = useMemo(() => {
        const extension = path.split('.').pop() ?? '';
        return getFileTypeIconAsUrl({ extension, size: 16 });
    }, [path]);

    return (
        <TreeItem {...focusTargetAttribute} {...props} itemType="leaf">
            <TreeItemLayout
                className={`${currentFile === path ? styles.currentFile : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (currentFile !== path) changeFile && changeFile(path);
                    else changeFile && changeFile('');
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
                <div className={styles.fileListing}>
                    {!iconType && <div style={{ width: 16, height: 16 }}></div>}
                    {iconType && <Image src={iconType} alt="" width={16} height={16} />}
                    {currentFile === path && <strong>{basename(path)}</strong>}
                    {currentFile !== path && <>{basename(path)}</>}
                </div>
            </TreeItemLayout>
        </TreeItem>
    );
};
