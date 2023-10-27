import { Caption1, Card, CardHeader, Title3, Link } from '@fluentui/react-components';
import styles from './AssignmentCard.module.css';
import { TierChip } from '../TierChip/TierChip';
import { type DisplayTier, type Tier } from '../../../backend/src/types/global';

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
