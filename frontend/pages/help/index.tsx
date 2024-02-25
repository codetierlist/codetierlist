import { Caption1, LargeTitle } from '@fluentui/react-text';
import { Container } from 'react-grid-system';
import styles from './help.module.css';

export const HelpPage = (): JSX.Element => {
    return (
        <Container component="main" className="m-t-xxxl">
            <header className={styles.header}>
                <LargeTitle>Help</LargeTitle>
                <Caption1>
                    This page is for support and documentation regarding Codetierlist. For
                    help with your assignments, please contact your instructor.
                </Caption1>
            </header>
        </Container>
    );
};

export default HelpPage;
