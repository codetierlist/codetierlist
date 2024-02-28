import { Caption1, Title3 } from '@fluentui/react-text';
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
    Link
} from '@fluentui/react-components';
import { Container } from 'react-grid-system';
import Head from 'next/head';
import styles from './help.module.css';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React, { Attributes, FunctionComponent, ReactNode } from 'react';

const markdown = `# Codetierlist Full Student Guide
This guide will help you get started with the Codetierlist as a student.
## Table of Contents
- [Testing in Software Development](#testing-in-software-development)
- [What is Codetierlist?](#what-is-codetierlist)
- [Getting Started](#getting-started)
- [Courses](#courses)
  - [Enrollment](#enrollment)
- [Assignments](#assignments)
  - [Submission](#submission)
    - [Code](#code)
    - [Test Cases](#test-cases) 
  - [Tierlist](#tierlist)
  - [Due Dates](#due-dates)
- [Data Privacy](#data-privacy)
- [Contact and Support](#contact-and-support)

## Testing in Software Development
Testing is a major part of the software development process. Many development models like Agile and Waterfall include testing as a key part of the development process. There are many ways to develop testcases alongside the code, Codetierlist is inspired by ping-pong pair programing where the testcases are developed alongside the code by a fellow peer. Ping-pong pair programming is a technique where one peer programs and the other peer writes the testcases. This is a great way to develop testcases as the person writing the testcases is not the person who wrote the code, so they are less likely to be biased towards the code.

## What is Codetierlist?
Ever wondered when you complete an assignment and do not know how well you're doing compared to other students? Introducing the Codetierlist! We provide students an opportunity to test their code and know how they compare to their peers, without sharing the complete testcases. This makes coding and testing more interactive, fun, and easier.

On Codetierlist, instructors can create individual assignments for students to complete. In each assignment, students are able to upload their own test cases and code. How well students do will be based on the accuracy of the students' code in their own test cases. This will be shown in a tier list for students to see.

## Getting Started
To get started go to https://codetierlist.utm.utoronto.ca/ and sign in with your UofT credentials. Once you are signed in, you will be able to see the courses you are enrolled in.
> [!NOTE]
> If you are not enrolled in any courses, you will not be able to see any courses on the home page. If you think you should be enrolled in a course, please contact your instructors.

## Courses
Each course will have its own page where you can view individual assignments for the course. Clicking on a course you will see all assignments (past and present) for the course.

### Enrollment
You will be automatically enrolled in a course by your instructor. If you are not enrolled in a course, please contact your instructor.

## Assignments
From the course page, you can select individual assignment to view. Each assignment will have its own page where you can view the tier list and submit your code and test cases.

### Submission
You can submit your code and test cases for an assignment by navigating to the "upload" tab on the assignment page. You can submit your code and test cases by clicking on the upload button and selecting the file you want to upload.
You can submit multiple files at once by selecting multiple files in the file picker.
> [!NOTE]
> Alternatively, you can drag and drop the files into the upload area.

#### Code
Your code should be uploaded under the "uploaded solutions" sections. Make sure you upload every file required for the assignment to run properly. If you are unsure of what files are required, please contact your instructor.

#### Test Cases
Your test cases should be uploaded under the "uploaded test cases" section. Make sure you upload every file required for the test cases to run properly. If you are unsure of what files are required, please contact your instructor.

### Tierlist
After you submit **both** your code and your test cases, you will be able to view the tier list for the assignment. The tier list will show you how well you did compared to your peers. The tier list will be anonymized, so you will not be able to see who submitted what code and test cases. The tier list will be updated every time a new submission is made.
The tierlist is dynamic and will update if your classmates update their code and test cases. This means that you can see how well you are doing compared to your peers in real-time.

> [!NOTE]
> The tierlist may not be updated immediately after you submit your code and test cases. Depending on the system load, it may take a few minutes for the tier list to update with your submission.

> [!WARNING]
> The tierlist does not reflect the accuracy of your code in the instructor's test cases (or final mark). The tierlist only reflects the accuracy of your code in your test cases.
> The tierlist is only as good as the testcases submitted by your peers. If the testcases are not comprehensive, the tierlist may not accurately reflect the accuracy of your code. So make sure to submit comprehensive test cases!

### Due Dates
Each assignment will have a due date. The due date will be displayed on the assignment page. Make sure to submit your code and test cases before the due date. Late submissions will not be accepted unless stated otherwise.
> [!NOTE]
> Some instructors may choose to allow late submissions. If you are unsure of the late submission policy, please contact your instructor.

## Data Privacy
Anything you upload to Codetierlist will be visible to the instructors and TAs of the course, however, your uploads will not be used for grading the assignment. 
The tierlist will be anonymized to students, so your peers will not be able to see who submitted what code and test cases.
> [!WARNING]
> **Only submit your own code and test cases.**
>
> Do not share your code and test cases with your peers. Sharing your code and test cases with your peers may be considered academic dishonesty.
> If you are unsure of what is considered academic dishonesty, please contact your instructor.

## Contact and Support
If you have any questions about Codetierlist, please contact any of the following people:
- Ido Ben Haim ([ido.benhaim@mail.utoronto.ca](mailto:ido.benhaim@mail.utoronto.ca))
- Daksh Malhotra ([d.malhotra@utoronto.ca](mailto:d.malhotra@utoronto.ca))
- Jackson Lee ([jacks.lee@utoronto.ca](mailto:jacks.lee@utoronto.ca))

If you have any questions about a specific course or assignment, please contact your instructor or TA. You can find their contact information on the course page.`;

const getNodeText = (node: React.ReactNode): string => {
    if (['string', 'number'].includes(typeof node)) return (node || '').toString();
    if (Array.isArray(node)) return node.map(getNodeText).join('');
    if (typeof node === 'object' && node)
        return getNodeText('props' in node ? node.props.children : []);
    return '';
};

const HeaderWrapper =
    (component: FunctionComponent, hr = false) =>
    ({ children }: { children: ReactNode[] }) => (
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
    if (typeof children === 'string') return children.replace(/^\[!\w+]\n/gi, '');
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
        text.trimStart().toLowerCase().startsWith(`[!${key}]\n`.toLowerCase())
    );
    if (intent) {
        children = clearedIntent(children);
        return (
            <MessageBar className={'m-y-m'} layout={'multiline'} intent={intents[intent]}>
                <MessageBarTitle>
                    {intent.length > 0
                        ? intent.charAt(0).toUpperCase() + intent.slice(1).toLowerCase()
                        : ''}
                </MessageBarTitle>
                <MessageBarBody>{children}</MessageBarBody>
            </MessageBar>
        );
    }
    return <blockquote>{children}</blockquote>;
};
export const HelpPage = (): JSX.Element => {
    return (
        <>
            <Head>
                <title>Help - Codetierlist</title>
            </Head>
            <Container component="main" className="m-t-xxxl">
                <header className={styles.header}>
                    <Title3>Help</Title3>
                    <Caption1>
                        This page is for support and documentation regarding Codetierlist.
                        For help with your assignments, please contact your instructor.
                    </Caption1>
                </header>

                <Subtitle2 block className="p-t-xl p-b-m">
                    FAQ
                </Subtitle2>

                <Accordion multiple className={styles.accordion}>
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

                <div>
                    <Markdown
                        components={{
                            h1: HeaderWrapper(Title3),
                            h2: HeaderWrapper(Subtitle1),
                            h3: HeaderWrapper(Subtitle2),
                            h4: HeaderWrapper(Subtitle2),
                            blockquote: Quote,
                            p: Text,
                            ul: ({ children }) => (
                                <ul className={'p-l-xl'}>{children}</ul>
                            ),
                            li: ({ children }) => <li>{children}</li>,
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
