import { Button } from "@fluentui/react-components";

import styles from "./ReturnHomeButton.module.css";

export const ReturnHomeButton = (): JSX.Element => {

    return (
        <Button style={{backgroundColor: "#3C3C3C", color: "white", width: 200, height: 40}}>
            Return Home
        </Button>
    );
};