import {
    Image,
    Link,
    MessageBar,
    MessageBarBody,
    MessageBarIntent,
    MessageBarTitle,
    Subtitle1,
    Subtitle2,
    Text,
} from '@fluentui/react-components';
import { Title2, Title3 } from '@fluentui/react-text';
import React, { Attributes, FunctionComponent, ReactNode } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const getNodeText = (node: React.ReactNode): string => {
    if (['string', 'number'].includes(typeof node)) return (node || '').toString();
    if (Array.isArray(node)) return node.map(getNodeText).join('');
    if (typeof node === 'object' && node)
        return getNodeText('props' in node ? node.props.children : []);
    return '';
};

const HeaderWrapper =
    (component: FunctionComponent, hr = false) =>
    // eslint-disable-next-line react/display-name
    ({ children }: { children?: ReactNode }): JSX.Element => (
        <>
            <div className={'box-flex p-y-m'}>
                {React.createElement(
                    component,
                    {
                        id: getNodeText(children)
                            .toLowerCase()
                            .replaceAll(/[^a-zA-Z\d\s:]/gi, '')
                            .replaceAll(' ', '-'),
                    } as Attributes,
                    children
                )}
                {hr ? <hr /> : null}
            </div>
        </>
    );

const intents: {
    [key: string]: MessageBarIntent;
} = {
    NOTE: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success',
};

const isFirstText = (text: React.ReactNode): boolean => {
    if (!text) return false;
    if (typeof text === 'string') {
        return text.trimStart().length > 0;
    }
    if (Array.isArray(text)) {
        if (text.length === 0) return false;
        return isFirstText(text[0]);
    }
    if (text && typeof text === 'object') {
        return isFirstText('props' in text ? text.props.children : []);
    }
    return false;
};

const clearedIntent = (children: React.ReactNode): React.ReactNode => {
    if (typeof children === 'string') return children.replace(/^\[!\w+]/gi, '');
    if (Array.isArray(children)) {
        const firstText = children.findIndex(isFirstText);
        if (firstText === -1) return children;
        return [
            ...children.slice(0, firstText),
            clearedIntent(children[firstText]),
            ...children.slice(firstText + 1),
        ];
    }
    if (children && typeof children === 'object') {
        if ('props' in children) {
            return React.cloneElement(children, {
                ...children.props,
                children: clearedIntent(children.props.children),
            });
        }
    }
    return children;
};

const Quote = ({ children }: { children: ReactNode }) => {
    const text = getNodeText(children);
    const intent = Object.keys(intents).find((key) =>
        text.trimStart().toLowerCase().startsWith(`[!${key}]`.toLowerCase())
    );
    if (intent) {
        children = clearedIntent(children);
        return (
            <MessageBar className={'m-y-m'} layout={'multiline'} intent={intents[intent]}>
                <MessageBarBody>
                    {' '}
                    <MessageBarTitle>
                        {intent.length > 0
                            ? intent.charAt(0).toUpperCase() +
                              intent.slice(1).toLowerCase() +
                              ':'
                            : ''}
                    </MessageBarTitle>
                    <br />
                    {children}
                </MessageBarBody>
            </MessageBar>
        );
    }
    return <blockquote>{children}</blockquote>;
};
export const MarkdownRender = ({
    markdown,
    imagePath,
}: {
    markdown: string;
    imagePath?: string;
}): JSX.Element => (
    <Markdown
        components={{
            h1: HeaderWrapper(Title2),
            h2: HeaderWrapper(Title3),
            h3: HeaderWrapper(Subtitle1),
            h4: HeaderWrapper(Subtitle2),
            blockquote: ({ children }) => <Quote>{children}</Quote>,
            p: ({ children }) => <Text>{children}</Text>,
            div: ({ children }) => <div>{children}</div>,
            ul: ({ children }) => <ul className={'p-l-xl'}>{children}</ul>,
            a: ({ children, href }) => <Link href={href || '#'}>{children}</Link>,
            img: ({ src, alt }) => (
                <Image
                    src={src?.startsWith('http') ? src : `${imagePath}/${src}`}
                    alt={alt}
                    width={500}
                    height={500}
                />
            ),
        }}
        remarkPlugins={[remarkGfm]}
    >
        {markdown}
    </Markdown>
);
