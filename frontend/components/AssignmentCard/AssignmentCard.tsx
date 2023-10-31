import {
    Caption1,
    Card,
    CardHeader,
    Link,
    Title3
} from '@fluentui/react-components';
import styles from './AssignmentCard.module.css';
import {TierChip} from '@/components';
import {type Tier, type UserTier} from "codetierlist-types";

export declare interface AssignmentCardProps {
    id: string
    name: string
    dueDate?: Date
    tier: UserTier | Tier,
    courseID: string
}
const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};
export const AssignmentCard = ({
    id,
    name,
    dueDate,
    tier,
    courseID
}: AssignmentCardProps): JSX.Element => {
    const formattedDueDate = dueDate ? formatDate(dueDate) :null;
    return (
        <Link href={`${courseID}/${id}`} className={styles.cardLink}>
            <Card className={styles.card}>
                <CardHeader
                    header={(<TierChip tier={tier}/>)}
                >
                </CardHeader>
                <div className={styles.cardContent}>
                    {dueDate ?
                        <Caption1>{formattedDueDate}</Caption1> : null}
                    <Title3>{name}</Title3>
                </div>
            </Card>
        </Link>
    );
};