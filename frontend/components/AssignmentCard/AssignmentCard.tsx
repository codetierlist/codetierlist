import { Caption1, Card, CardHeader, Title3 } from "@fluentui/react-components";
import styles from "./AssignmentCard.module.css";
import { TierChip } from "@/components";
import { type Tier, type UserTier } from "codetierlist-types";
import { convertDate } from "../utils/TimeUtils/TimeUtils";
import Link from "next/link";

export declare interface AssignmentCardProps {
    /** The ID of the assignment */
    id: string;

    /** The name of the assignment */
    name: string;

    /** The due date of the assignment */
    dueDate?: Date;

    /** The tier of the user */
    tier: UserTier | Tier;

    /** The ID of the course this assignment belongs to */
    courseID: string;
}

export const AssignmentCard = ({
    id,
    name,
    dueDate,
    tier,
    courseID,
}: AssignmentCardProps): JSX.Element => {
    const formattedDueDate = dueDate ? convertDate(dueDate) : null;

    return (
        <Link
            href={`${courseID}/${id}`}
            className={styles.cardLink}
            aria-label={`View assignment ${name}, due ${formattedDueDate}. ${tier == "?" ? "Tier not set." : `You are in ${tier} tier.`}`}
        >
            <Card className={styles.card} selected={false}>
                <CardHeader header={<TierChip tier={tier as UserTier} />} />
                <div className={styles.cardContent}>
                    {dueDate && (
                        <Caption1 className={styles.cardText}>
                            <strong>Due</strong> {formattedDueDate}
                        </Caption1>
                    )}
                    <Title3 className={styles.cardText}>{name}</Title3>
                </div>
            </Card>
        </Link>
    );
};
