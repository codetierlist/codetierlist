import { Container } from "react-grid-system";

export const HelpPage = (): JSX.Element => {
    return (
        <Container component="main" className="m-t-xxxl">
            <h1>Help</h1>
            <p>
                This is the help page. It will contain information about how to use the website.
            </p>
        </Container>
    );
}

export default HelpPage;
