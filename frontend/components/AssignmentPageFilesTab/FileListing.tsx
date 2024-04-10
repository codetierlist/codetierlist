import { deletePath } from '@/components/AssignmentPageFilesTab/helpers';
import { SnackbarContext } from '@/hooks';
import { Button, TreeItem, TreeItemLayout } from '@fluentui/react-components';
import { getFileTypeIconAsUrl } from '@fluentui/react-file-type-icons';
import { ArrowDownload24Regular, Delete20Regular } from '@fluentui/react-icons';
import Image from 'next/image';
import { basename, dirname } from 'path';
import { useContext, useMemo } from 'react';
import styles from './AssignmentPageFilesTab.module.css';
import { useFileListingProps } from './FileListingContext';
import { ToolTipIcon } from '..';
import { getFileContents } from './ListFiles';
import { useSearchParams } from 'next/navigation';

export declare type FileListingProps = {
    /** the full path of the file to display */
    path: string;
};

export const FileListing = ({ path, ...props }: FileListingProps) => {
    const { showSnack } = useContext(SnackbarContext);
    const searchParams = useSearchParams();
    const {
        update,
        changeFile,
        currentFile,
        isEditable,
        fullRoute,
        changeFolder,
        commit,
        commitId,
    } = useFileListingProps();

    const iconType = useMemo(() => {
        const extension = path.split('.').pop() ?? '';
        return getFileTypeIconAsUrl({ extension, size: 16 });
    }, [path]);

    /**
     * Actions for when there is writing permission
     */
    const WritableFileListingActions = () =>
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

    /**
     * Actions for when there is reading permission
     */
    const ReadableFileListingActions = () => (
        <>
            <ToolTipIcon
                tooltip={`Download ${basename(path)}`}
                icon={
                    <Button
                        appearance="subtle"
                        icon={<ArrowDownload24Regular />}
                        onClick={(e) => {
                            e.stopPropagation();
                            getFileContents(
                                fullRoute,
                                commitId || (commit.log[0]?.id ?? ''),
                                currentFile || path,
                                searchParams.get('utorid')
                            ).then((res) => {
                                const blob = new Blob([res.data]);
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = basename(path);
                                a.click();
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
                    } else {
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
                actions={
                    <>
                        <WritableFileListingActions />
                        <ReadableFileListingActions />
                    </>
                }
            >
                {currentFile === path && <strong>{basename(path)}</strong>}
                {currentFile !== path && <>{basename(path)}</>}
            </TreeItemLayout>
        </TreeItem>
    );
};
