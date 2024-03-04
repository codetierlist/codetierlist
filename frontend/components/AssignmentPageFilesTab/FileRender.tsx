import {
    Image,
    MessageBar,
    MessageBarTitle,
    MessageBarBody,
    Link,
} from '@fluentui/react-components';
import { extname } from 'path';
import { Monaco } from '@/components';
import styles from './FileRender.module.css';
import { useEffect, useState } from 'react';
import filetype from 'magic-bytes.js';
import { GuessedFile } from 'magic-bytes.js/dist/model/tree';

const languages = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    md: 'markdown',
    yml: 'yaml',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    py: 'python',
    rb: 'ruby',
    sh: 'shell',
    rs: 'rust',
    kt: 'kotlin',
    pl: 'perl',
    cs: 'csharp',
    mdx: 'markdown',
    txt: 'text',
};

const imgExt = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', 'svg'];
const videoExt = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv', '3gp'];
const audioExt = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'wma', 'm4a'];

const ProcessedFileRender = ({
    path,
    content,
}: {
    path: string;
    content: ArrayBuffer;
}) => {
    const pathExt = extname(path).slice(1);
    const fileTypes = filetype(new Uint8Array(content));
    let fileType: GuessedFile | undefined;
    let ext = pathExt;
    if (fileTypes.length > 0) {
        if (fileTypes[0].extension) {
            ext = fileTypes[0].extension;
        }
        fileType = fileTypes[0];
    }
    ext = ext?.toLowerCase();

    const [viewAnyway, setViewAnyway] = useState(false);

    useEffect(() => {
        setViewAnyway(false);
    }, [path, content]);

    if (ext) {
        if ((fileType && fileType.mime?.startsWith('image')) || imgExt.includes(ext)) {
            return (
                <div className={styles.centerImage}>
                    <Image
                        draggable="false"
                        src={URL.createObjectURL(
                            new Blob([content], {
                                type:
                                    fileType?.mime ||
                                    `image/${fileType?.extension ?? ext}`,
                            })
                        )}
                        alt={path}
                        className={styles.renderedHeight}
                    />
                </div>
            );
        }
        if ((fileType && fileType.mime?.startsWith('video')) || videoExt.includes(ext)) {
            return (
                <div className={styles.centerImage}>
                    <video
                        className={styles.renderedHeight}
                        src={URL.createObjectURL(
                            new Blob([content], {
                                type:
                                    fileType?.mime ??
                                    `video/${fileType?.extension ?? ext}`,
                            })
                        )}
                        draggable="false"
                        controls
                    ></video>
                </div>
            );
        }
        if ((fileType && fileType.mime?.startsWith('audio')) || audioExt.includes(ext)) {
            return (
                <audio
                    draggable="false"
                    controls
                    src={URL.createObjectURL(
                        new Blob([content], {
                            type: fileType?.mime ?? `audio/${fileType?.extension ?? ext}`,
                        })
                    )}
                ></audio>
            );
        }
        if (fileType?.mime === 'application/pdf') {
            return (
                <iframe
                    draggable="false"
                    src={URL.createObjectURL(
                        new Blob([content], { type: `application/pdf` })
                    )}
                    title={path}
                    width="100%"
                    height="50vh"
                    style={{ height: '50vh', border: 'none' }}
                />
            );
        }
    }
    const language = ext ? languages[ext as keyof typeof languages] : undefined;
    const decoder = new TextDecoder('utf-8');
    const decoded = decoder.decode(content);

    if (!viewAnyway && /\ufffd/.test(decoded)) {
        return (
            <MessageBar className={styles.messagebar} intent={'error'}>
                <MessageBarBody>
                    <MessageBarTitle>Binary Data</MessageBarTitle>
                    This file contains binary data that cannot be rendered.{' '}
                    <Link onClick={() => setViewAnyway(true)}>View anyway</Link>
                </MessageBarBody>
            </MessageBar>
        );
    }

    return (
        <Monaco
            language={language || ext || 'text'}
            value={new TextDecoder().decode(content)}
            height="50vh"
            options={{
                readOnly: true,
            }}
        />
    );
};

export const FileRender = ({ path, content }: { path: string; content: ArrayBuffer }) => {
    return (
        <div className={styles.filerenderer} onClick={(event) => event.stopPropagation()}>
            <ProcessedFileRender path={path} content={content} />
        </div>
    );
};
