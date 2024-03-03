import { Subtitle1 } from '@fluentui/react-components';
import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';
import { DropEvent, DropzoneOptions, FileRejection, useDropzone } from 'react-dropzone';
import styles from './AssignmentPageFilesTab.module.css';

export const Dropzone = ({
    submitFiles,
    children,
    routeName,
    ...props
}: {
    submitFiles: <T extends File>(
        acceptedFiles: T[],
        fileRejections: FileRejection[],
        event: DropEvent
    ) => void;
    children: ReactNode | ReactNode[];
    routeName: string;
} & (DropzoneOptions | undefined)): JSX.Element => {
    const searchParams = useSearchParams();
    // create a dropzone for the user to upload files
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: submitFiles,
        noClick: true,
        noKeyboard: true,
        multiple: true,
        disabled: searchParams.has('utorid'),
        noDragEventsBubbling: true,
        maxFiles: 100,
        maxSize: 1e9,
        ...props,
    });
    return (
        <div {...getRootProps({ className: styles.dropZone })}>
            {isDragActive ? (
                <div className={styles.dropZoneOverlay}>
                    <Subtitle1 block as="p" className={styles.dropZoneText}>
                        Drop files to upload as a {routeName}
                    </Subtitle1>
                </div>
            ) : null}
            <div className={styles.dropZoneChild}>
                <input {...getInputProps()} />
                {children}
            </div>
        </div>
    );
};
