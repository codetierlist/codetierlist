import { deletePath } from '@/components/AssignmentPageFilesTab/helpers';
import { SnackbarContext } from '@/hooks';
import { Button, TreeItem, TreeItemLayout } from '@fluentui/react-components';
import { getFileTypeIconAsUrl } from '@fluentui/react-file-type-icons';
import { Delete20Regular } from '@fluentui/react-icons';
import Image from 'next/image';
import { basename } from 'path';
import { useContext, useMemo } from 'react';
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
    /** is the file editable */
    editable?: boolean;
};

export const FileListing = ({
    fullRoute,
    update,
    path,
    changeFile,
    currentFile,
    editable,
    ...props
}: FileListingProps) => {
    const { showSnackSev } = useContext(SnackbarContext);

    const iconType = useMemo(() => {
        const extension = path.split('.').pop() ?? '';
        return getFileTypeIconAsUrl({ extension, size: 16 });
    }, [path]);

    return (
        <TreeItem itemType="leaf" value={path} {...props}>
            <TreeItemLayout
                className={`${currentFile === path ? styles.currentFile : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (currentFile !== path) changeFile && changeFile(path);
                    else changeFile && changeFile('');
                }}
                iconBefore={
                    <>
                        {!iconType && (
                            <div className="m-r-xs" style={{ width: 16, height: 16 }} />
                        )}
                        {iconType && (
                            <Image
                                src={iconType}
                                className="m-r-xs"
                                alt=""
                                width={16}
                                height={16}
                            />
                        )}
                    </>
                }
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
                                    editable,
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
