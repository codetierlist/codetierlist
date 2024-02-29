import { Caption1, Title1, Title2, Title3 } from '@fluentui/react-text';
import {
    Accordion,
    AccordionItem,
    AccordionHeader,
    AccordionPanel,
    Subtitle2,
    Subtitle1,
    MessageBarBody,
    MessageBar,
    MessageBarIntent,
    MessageBarTitle,
    Text,
    Link,
} from '@fluentui/react-components';
import { Container } from 'react-grid-system';
import Head from 'next/head';
import styles from './help.module.css';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React, {
    Attributes,
    FunctionComponent,
    ReactNode,
    useEffect,
    useState,
} from 'react';

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

const intents: { [key: string]: MessageBarIntent } = {
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
export const HelpPage = (): JSX.Element => {
    const [markdown, setMarkdown] = useState('');
    useEffect(() => {
        fetch('/help.md')
            .then((response) => response.text())
            .then((text) => setMarkdown(text));
    }, []);
    return (
        <>
            <Head>
                <title>Help - Codetierlist</title>
            </Head>
            <Container component="main" className="m-t-xxxl">
                <header className={styles.header}>
                    <Title1>Help</Title1>
                    <Caption1>
                        This page is for support and documentation regarding Codetierlist.
                        For help with your assignments, please contact your instructor.
                    </Caption1>
                </header>

                <Title2 block className="p-t-xl p-b-m">
                    FAQ
                </Title2>

                <Accordion multiple collapsible className={styles.accordion}>
                    <AccordionItem value="faq1" className={styles.accordionItem}>
                        <AccordionHeader as="h2" expandIconPosition="end">
                            What is Codetierist?
                        </AccordionHeader>
                        <AccordionPanel className={styles.accordionPanel}>
                            <p>
                                Codetierlist is a tool that allows students to compare
                                their code and tests with others without revealing their
                                identity or committing an academic offense. This allows
                                students to see how their code and tests compare to others
                                and to learn from their peers.
                            </p>
                        </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem value="faq2" className={styles.accordionItem}>
                        <AccordionHeader as="h2" expandIconPosition="end">
                            Why can&apos;t I access the tierlist?
                        </AccordionHeader>
                        <AccordionPanel className={styles.accordionPanel}>
                            <p>
                                If you are unable to access the tierlist, it is possible
                                that you have not uploaded your code or tests yet. Please
                                ensure that you have uploaded your code and tests before
                                trying to access the tierlist.
                            </p>
                            <p>
                                If you are still unable to access the tierlist, there are
                                a few other reasons that you may be unable to access the
                                tierlist including uploading an incorrect test case. If
                                you are still experiencing issues, please contact your
                                instructor.
                            </p>
                        </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem value="faq3" className={styles.accordionItem}>
                        <AccordionHeader as="h2" expandIconPosition="end">
                            Why should I use Codetierlist?
                        </AccordionHeader>
                        <AccordionPanel className={styles.accordionPanel}>
                            <p>
                                Codetierlist provides an advantage to students by allowing
                                them to compare their code and tests with others without
                                revealing their identity or committing an academic
                                offense. This allows students to see how their code and
                                tests compare to others and to learn from their peers.
                            </p>
                        </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem value="faq4" className={styles.accordionItem}>
                        <AccordionHeader as="h2" expandIconPosition="end">
                            Why is testing important?
                        </AccordionHeader>
                        <AccordionPanel className={styles.accordionPanel}>
                            <p>
                                Programs are often complex and can have many different
                                inputs and outputs. By testing your code across a variety
                                of inputs, you can be more confident that your code is
                                working as expected.
                            </p>
                            <p>
                                For example, in a safety-critical system, such as a
                                medical device or a self-driving car, one would hope that
                                the software has been thoroughly tested to ensure that it
                                works as expected. In these cases, testing is not only
                                important, it is critical and can be a matter of life and
                                death.
                            </p>
                            <p>
                                To learn more about safety-critical systems and the
                                importance of testing, consider reading about the{' '}
                                <Link
                                    inline
                                    href="https://en.wikipedia.org/wiki/Therac-25"
                                >
                                    Therac-25
                                </Link>
                                , a Canadian radiation therapy machine. Its lack of
                                independent code review, complete disregard for testing,
                                and engineering issues led to six known cases of severe
                                radiation overdoses, some of which were{' '}
                                <strong>fatal</strong>. The Therac-25 is a sobering
                                reminder of the importance of testing and code review, and
                                its consequences when improperly done.
                            </p>
                            <p>
                                For students, the lack of testing may not be as
                                life-threatening, but it can be the difference between
                                passing and failing an assignment, which can impact job
                                prospects and future opportunities.
                            </p>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>

                <div className={`${styles.accordionPanel} p-y-xl`}>
                    <Markdown
                        components={{
                            h1: HeaderWrapper(Title2),
                            h2: HeaderWrapper(Title3),
                            h3: HeaderWrapper(Subtitle1),
                            h4: HeaderWrapper(Subtitle2),
                            blockquote: ({ children }) => <Quote>{children}</Quote>,
                            p: ({ children }) => <Text>{children}</Text>,
                            div: ({ children }) => <div>{children}</div>,
                            ul: ({ children }) => (
                                <ul className={'p-l-xl'}>{children}</ul>
                            ),
                            a: ({ children, href }) => (
                                <Link href={href || '#'}>{children}</Link>
                            ),
                        }}
                        remarkPlugins={[remarkGfm]}
                    >
                        {markdown}
                    </Markdown>
                </div>
            </Container>
        </>
    );
};

export default HelpPage;
