import {
    Image,
    MessageBar,
    MessageBarTitle,
    MessageBarBody,
    Link,
} from '@fluentui/react-components';
import {extname} from 'path';
import {Monaco} from '@/components';
import styles from './FileRender.module.css';
import {useEffect, useState} from 'react';
import filetype from 'magic-bytes.js'

const languages = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    css: 'css',
    scss: 'scss',
    md: 'markdown',
    json: 'json',
    yml: 'yaml',
    yaml: 'yaml',
    xml: 'xml',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    py: 'python',
    rb: 'ruby',
    php: 'php',
    sh: 'shell',
    go: 'go',
    rs: 'rust',
    kt: 'kotlin',
    swift: 'swift',
    sql: 'sql',
    pl: 'perl',
    r: 'r',
    cs: 'csharp',
    mdx: 'markdown',
    txt: 'text',
};

const imgExt = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico'];
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

    let ext: string | undefined =pathExt;
    let fileType;
    if(fileTypes.length > 0){
        ext = fileTypes[0].extension;
        fileType = fileTypes[0];
    }
    ext = ext?.toLowerCase();

    const [viewAnyway, setViewAnyway] = useState(false);


    useEffect(() => {
        setViewAnyway(false);
    }, [path, content]);

    if(ext) {
        if ((fileType && fileType.mime?.startsWith("image")) || imgExt.includes(ext)) {
            return (
                <Image
                    draggable="false"
                    src={URL.createObjectURL(new Blob([content], {type: fileType?.mime || `image/${fileType?.extension ?? ext}`}))}
                    alt={path}
                    width="100%"
                />
            );
        }
        if ((fileType && fileType.mime?.startsWith("video")) || videoExt.includes(ext)) {
            return (
                <video draggable="false"  controls width="100%" height="50vh">
                    <source
                        src={URL.createObjectURL(
                            new Blob([content], {type: `video/${fileType?.extension ?? ext}`})
                        )}
                    />
                </video>
            );
        }
        if ((fileType && fileType.mime?.startsWith("audio")) || audioExt.includes(ext)) {
            return (
                <audio draggable="false" controls>
                    <source
                        src={URL.createObjectURL(
                            new Blob([content], {type: `audio/${fileType?.extension ?? ext}`})
                        )}
                    />
                </audio>
            );
        }
        if (fileType?.mime === "application/pdf") {
            return (
                <iframe
                    draggable="false"
                    src={URL.createObjectURL(
                        new Blob([content], {type: `application/pdf`})
                    )}
                    title={path}
                    width="100%"
                    height="50vh"
                    style={{height: '50vh'}}
                />
            );
        }
    }
    const language = ext ? languages[ext as keyof typeof languages] : undefined;
    const decoder = new TextDecoder('utf-8');
    const decoded = decoder.decode(content);
    if (!viewAnyway && /\ufffd/.test(decoded)) {
        return (
            <MessageBar intent={'error'}>
                <MessageBarBody>
                    <MessageBarTitle>Binary Data</MessageBarTitle>
                    This file contains binary data that cannot be rendered.{' '}
                    <Link onClick={() => setViewAnyway(true)}>View anyway</Link>
                </MessageBarBody>
            </MessageBar>
        );
    }
    if (ext === 'svg') {
        return (
            <Image
                draggable="false"
                src={URL.createObjectURL(new Blob([content], {type: `image/svg+xml`}))}
                alt={path}
            />
        );
    }

    return (
        <Monaco
            language={language ?? 'text'}
            value={new TextDecoder().decode(content)}
            height="50vh"
        />
    );
};

export const FileRender = ({path, content}: {
    path: string;
    content: ArrayBuffer
}) => {
    return (
        <div className={styles.filerenderer}
             onClick={(event) => event.stopPropagation()}>
            <ProcessedFileRender path={path} content={content}/>
        </div>
    );
};