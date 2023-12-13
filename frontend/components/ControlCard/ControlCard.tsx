import {
    Caption1,
    Card,
    CardHeader,
    Label
} from "@fluentui/react-components";

import styles from "./ControlCard.module.css";

export declare type ControlCardProps = {
    /**
     * The title of the card.
     */
    title: string;
    /**
     * The description of the card, or any additional information.
     */
    description?: string;
    /**
     * The icon to display on the left side of the card.
     */
    icon: JSX.Element;
    /**
     * The id of the control, for labeling purposes.
     */
    htmlFor?: string;
    /**
     * The control that should be displayed on the right side of the card.
     */
    children: JSX.Element;
};

/**
 * Displays a control in a card. Should be used with multiple controls on a page,
 * should also be used in a form for semantics
 */
export const ControlCard = (props: ControlCardProps): JSX.Element => {
    return (
        <Card size="large">
            <CardHeader
                image={props.icon}
                header={<Label className={styles.semibold} htmlFor={props.htmlFor}>{props.title}</Label>}
                description={
                    props.description && (
                        <Caption1>
                            {props.description}
                        </Caption1>
                    )
                }
                action={
                    props.children
                }
            />
        </Card>
    );
};
