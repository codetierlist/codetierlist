import { Caption1, Title3 } from '@fluentui/react-text';
import {
    Accordion,
    AccordionItem,
    Link,
    AccordionHeader,
    AccordionPanel,
    Subtitle2,
} from '@fluentui/react-components';
import { Container } from 'react-grid-system';
import Head from 'next/head';
import styles from './help.module.css';

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
                                importance of testing, there a great example of the
                                consequences of inadequate testing can be found in a
                                Canadian radiation therapy machine, the{' '}
                                <Link
                                    inline
                                    href="https://en.wikipedia.org/wiki/Therac-25"
                                >
                                    Therac-25
                                </Link>
                                . Its lack of independent code review, complete disregard
                                for testing, and engineering issues led to six known cases
                                of severe radiation overdoses, some of which were{' '}
                                <strong>fatal</strong>.
                            </p>
                            <p>
                                For students, the lack of testing may not be as
                                life-threating, but it can be the difference between
                                passing and failing a course, which can impact job
                                prospects and future opportunities.
                            </p>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            </Container>
        </>
    );
};

export default HelpPage;
