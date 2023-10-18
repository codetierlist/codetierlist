import { Caption1, Card, CardHeader, Subtitle2, Title3 } from "@fluentui/react-components";
import Link from "next/link";
import styles from "./AssignmentCard.module.css";
import { Clock12Filled } from "@fluentui/react-icons/lib/fonts";

export declare type AssignmentCardProps = {
    id: string;
    name: string;
    dueDate: Date;
    tier: "s" | "a" | "b" | "c" | "d" | "idk";
}

export const AssignmentCard = ({ id, name, dueDate, tier }: AssignmentCardProps): JSX.Element => {
    return (
        <Link href={`/assignments/${id}`} className={styles.cardLink}>
            <Card className={styles.card}>
                <CardHeader
                    header={<div className={styles[`tier-${tier}`]}>{tier}</div>}
                >
                </CardHeader>
                <div className={styles.cardContent}>
                    <Caption1>{ dueDate.toLocaleDateString() }</Caption1>
                    <Title3>{name}</Title3>
                </div>
            </Card>
        </Link>
    )
}
