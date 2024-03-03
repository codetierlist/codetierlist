import { MarkdownRender } from '@/components';
import {
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    Link,
} from '@fluentui/react-components';
import { Caption1, Title1, Title2 } from '@fluentui/react-text';
import Head from 'next/head';
import { Container } from 'react-grid-system';
import styles from './help.module.css';
import markdown from '@/public/docs/user/README.md';

export const HelpPage = (): JSX.Element => {
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
                            What directory structure should I use?
                        </AccordionHeader>
                        <AccordionPanel className={styles.accordionPanel}>
                            <p>
                                The way testcases are run against the solutions is
                                determined by the instructor when they create the
                                assignment, if you are unsure please confirm with them.
                                Generally, the directory structure should be as follows:
                                Place your code in the root directory (not in a
                                subfolder!), and upload your testcases separately in the
                                root of the testcases upload area.
                            </p>
                        </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem value="faq5" className={styles.accordionItem}>
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
                    <MarkdownRender markdown={markdown} imagePath={'/docs/user'} />
                </div>
            </Container>
        </>
    );
};

export default HelpPage;
