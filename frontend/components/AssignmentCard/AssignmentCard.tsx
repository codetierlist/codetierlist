import {
    Caption1,
    Card,
    CardHeader,
    Title3
} from '@fluentui/react-components';
import styles from './AssignmentCard.module.css';
import {TierChip} from '@/components';
import {type Tier, type UserTier} from "codetierlist-types";
import { convertDate } from '../utils/TimeUtils/TimeUtils';
import Link from 'next/link';

export declare interface AssignmentCardProps {
    id: string
    name: string
    dueDate?: Date
    tier: UserTier | Tier,
    courseID: string
    isAdmin: boolean
}

export const AssignmentCard = ({
    id,
    name,
    dueDate,
    tier,
    courseID,
    isAdmin
}: AssignmentCardProps): JSX.Element => {
    const formattedDueDate = dueDate ? convertDate(dueDate) : null;

    return (
        <>
            {isAdmin ? (
                <Link href={`${courseID}/${id}/admin`} className={styles.cardLink}>
                    <Card className={styles.card} selected={false}>
                        <CardHeader header={(<TierChip tier={tier as UserTier}/>)} />
                        <div className={styles.cardContent}>
                            {dueDate && <Caption1 className={styles.cardText}><strong>Due</strong> {formattedDueDate}</Caption1>}
                            <Title3 className={styles.cardText}>{name}</Title3>
                        </div>
                    </Card>
                </Link>
            ) : (
                <Link href={`${courseID}/${id}`} className={styles.cardLink}>
                    <Card className={styles.card} selected={false}>
                        <CardHeader header={(<TierChip tier={tier as UserTier}/>)} />
                        <div className={styles.cardContent}>
                            {dueDate && <Caption1 className={styles.cardText}><strong>Due</strong> {formattedDueDate}</Caption1>}
                            <Title3 className={styles.cardText}>{name}</Title3>
                        </div>
                    </Card>
                </Link>
            )}
        </>
    );
};