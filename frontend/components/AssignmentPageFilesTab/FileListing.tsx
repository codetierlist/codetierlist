import { deletePath } from '@/components/AssignmentPageFilesTab/helpers';
import { SnackbarContext } from '@/hooks';
import { Button, TreeItem, TreeItemLayout } from '@fluentui/react-components';
import { getFileTypeIconAsUrl } from '@fluentui/react-file-type-icons';
import { Delete20Regular } from '@fluentui/react-icons';
import Image from 'next/image';
import { basename, dirname } from 'path';
import { useContext, useMemo } from 'react';
import styles from './AssignmentPageFilesTab.module.css';
import { useFileListingProps } from './FileListingContext';
import { ToolTipIcon } from '..';

export declare type FileListingProps = {
    /** the full path of the file to display */
    path: string;
};

export const FileListing = ({ path, ...props }: FileListingProps) => {
    const { showSnackSev } = useContext(SnackbarContext);
    const { update, changeFile, currentFile, isEditable, fullRoute, changeFolder } =
        useFileListingProps();

    const iconType = useMemo(() => {
        const extension = path.split('.').pop() ?? '';
        return getFileTypeIconAsUrl({ extension, size: 16 });
    }, [path]);

    const FileListingActions = () =>
        isEditable && (
            <>
                <ToolTipIcon
                    tooltip={`Delete ${basename(path)}`}
                    icon={
                        <Button
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
                                    editable: isEditable,
                                });
                            }}
                        />
                    }
                />
            </>
        );

    return (
        <TreeItem itemType="leaf" value={path} {...props}>
            <TreeItemLayout
                className={`${currentFile === path ? styles.currentFile : ''}`}
                onClick={(e) => {
                    e.stopPropagation();

                    if (currentFile !== path) {
                        changeFile && changeFile(path);
                        changeFolder && changeFolder(dirname(path));
                    }
                    else {
                        changeFile && changeFile('');
                        changeFolder && changeFolder('');
                    }
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
                actions={<FileListingActions />}
            >
                {currentFile === path && <strong>{basename(path)}</strong>}
                {currentFile !== path && <>{basename(path)}</>}
            </TreeItemLayout>
        </TreeItem>
    );
};
