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
import { convertDate } from '../utils/TimeUtils/TimeUtils';

export declare interface AssignmentCardProps {
    id: string
    name: string
    dueDate?: Date
    tier: UserTier | Tier,
    courseID: string
}

export const AssignmentCard = ({
    id,
    name,
    dueDate,
    tier,
    courseID
}: AssignmentCardProps): JSX.Element => {
    const formattedDueDate = dueDate ? convertDate(dueDate) :null;
    return (
        <Link href={`${courseID}/${id}`} className={styles.cardLink}>
            <Card className={styles.card}>
                <CardHeader
                    header={(<TierChip tier={tier as UserTier}/>)}
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
