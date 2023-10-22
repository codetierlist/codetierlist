import { Caption1, Card, CardHeader, Title3 } from '@fluentui/react-components';
import Link from 'next/link';
import styles from './AssignmentCard.module.css';
import { TierChip } from '@/components';
import { type DisplayTier, type Tier } from '@/lib/types';

export declare interface AssignmentCardProps {
  id: string
  name: string
  dueDate: Date
  tier: DisplayTier | Tier
}

export const AssignmentCard = ({ id, name, dueDate, tier }: AssignmentCardProps): JSX.Element => {
    return (
        <Link href={`/assignments/${id}`} className={styles.cardLink}>
            <Card className={styles.card}>
                <CardHeader
                    header={(<TierChip tier={tier} />)}
                >
                </CardHeader>
                <div className={styles.cardContent}>
                    <Caption1>{ dueDate.toLocaleDateString() }</Caption1>
                    <Title3>{name}</Title3>
                </div>
            </Card>
        </Link>
    );
};
