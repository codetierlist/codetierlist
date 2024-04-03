import { Subtitle1 } from '@fluentui/react-components';
import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';
import { DropEvent, DropzoneOptions, FileRejection, useDropzone } from 'react-dropzone';
import styles from './AssignmentPageFilesTab.module.css';

/**
 * A container that accepts files that are dropped onto it
 */
export const Dropzone = ({
    submitFiles,
    children,
    dropText,
    ...props
}: {
    /** a function to call when the files are submitted */
    submitFiles: <T extends File>(
        acceptedFiles: T[],
        fileRejections: FileRejection[],
        event: DropEvent
    ) => void;

    /** the children to display */
    children: ReactNode | ReactNode[];

    /** the text to display when the user is dragging files */
    dropText: string;
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
                        {dropText}
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
