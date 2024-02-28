import { Caption1, Title3 } from '@fluentui/react-text';
import { Accordion, AccordionItem, AccordionHeader, AccordionPanel, Subtitle2 } from '@fluentui/react-components';
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
                        This page is for support and documentation regarding Codetierlist. For
                        help with your assignments, please contact your instructor.
                    </Caption1>
                </header>

                <Subtitle2 block className="p-t-xl p-b-m">FAQ</Subtitle2>

                <Accordion multiple className={styles.accordion}>
                    <AccordionItem value="faq1" className={styles.accordionItem}>
                        <AccordionHeader as="h2" expandIconPosition="end">
                            What is Codetierist?
                        </AccordionHeader>
                        <AccordionPanel className={styles.accordionPanel}>
                            <p>
                                Codetierlist to encourage you to start early and to test often. We’re hoping
                                that being able to compare your code and tests with others will help motivate
                                you to build good tests and will provide some feedback on how effective your
                                testing is.
                            </p>
                        </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem value="faq2" className={styles.accordionItem}>
                        <AccordionHeader as="h2" expandIconPosition="end">
                            Why can&apos;t I access the tierlist?
                        </AccordionHeader>
                        <AccordionPanel className={styles.accordionPanel}>
                            <p>
                                If you are unable to access the tierlist, it is possible that you have not uploaded
                                your code or tests yet. Please ensure that you have uploaded your code and tests
                                before trying to access the tierlist.
                            </p>
                            <p>
                                If you are still unable to access the tierlist, there are a few other reasons
                                that you may be unable to access the tierlist including uploading an incorrect
                                test case. If you are still experiencing issues, please contact your instructor.
                            </p>
                        </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem value="faq3" className={styles.accordionItem}>
                        <AccordionHeader as="h2" expandIconPosition="end">
                            Why should I use Codetierlist?
                        </AccordionHeader>
                        <AccordionPanel className={styles.accordionPanel}>
                            <p>
                                Codetierlist provides an advantage to students by allowing them to compare their
                                code and tests with others without revealing their identity or committing an
                                academic offense. This allows students to see how their code and tests compare to
                                others and to learn from their peers.
                            </p>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            </Container>
        </>
    );
};

export default HelpPage;
