import { Image, MessageBar, MessageBarTitle, MessageBarBody, Link } from '@fluentui/react-components';
import { extname } from 'path';
import { Monaco } from '@/components';
import styles from './FileRender.module.css';
import {useEffect, useState} from "react";

const langauges = {
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

const ProcessedFileRender = ({ path, content }: { path: string; content: ArrayBuffer }) => {
    const ext = extname(path).slice(1);
    const [viewAnyway, setViewAnyway] = useState(false);
    useEffect(() => {
        setViewAnyway(false);
    }, [path, content]);
    if (imgExt.includes(ext)) {
        return (
            <Image
                src={URL.createObjectURL(new Blob([content], { type: `image/${ext}` }))}
                alt={path}
                width="100%"
            />
        );
    }
    if (videoExt.includes(ext)) {
        return (
            <video controls width="100%" height="50vh">
                <source
                    src={URL.createObjectURL(
                        new Blob([content], { type: `video/${ext}` })
                    )}
                />
            </video>
        );
    }
    if (audioExt.includes(ext)) {
        return (
            <audio controls>
                <source
                    src={URL.createObjectURL(
                        new Blob([content], { type: `audio/${ext}` })
                    )}
                />
            </audio>
        );
    }
    if (ext === 'pdf') {
        return (
            <iframe
                src={URL.createObjectURL(
                    new Blob([content], { type: `application/pdf` })
                )}
                title={path}
                width="100%"
                height="50vh"
                style={{ height: '50vh'}}
            />
        );
    }
    const language = langauges[ext as keyof typeof langauges];
    const decoder = new TextDecoder("utf-8");
    const decoded = decoder.decode(content);
    if(!viewAnyway && /\ufffd/.test(decoded)) {
        return (        <MessageBar intent={"error"}>
          <MessageBarBody>
            <MessageBarTitle>Binary Data</MessageBarTitle>
            This file contains binary data that cannot be rendered.{" "}
              <Link onClick={()=>setViewAnyway(true)}>View anyway</Link>
          </MessageBarBody>
        </MessageBar>)
    }
    if(ext === 'svg') {
        return (<Image src={URL.createObjectURL(
                        new Blob([content], { type: `image/svg+xml` })
                    )} alt={path}/>)
    }

    return <Monaco language={language ?? "text"} value={new TextDecoder().decode(content)} height="50vh" />;
};

export const FileRender = ({ path, content }: { path: string, content: ArrayBuffer }) => {
    return (<div className={styles.filerenderer} onClick={event => event.stopPropagation()}><ProcessedFileRender path={path} content={content} /></div>)
}