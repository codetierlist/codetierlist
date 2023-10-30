import { Caption1, Card, CardHeader, Title3, Link } from '@fluentui/react-components';
import styles from './AssignmentCard.module.css';
import { TierChip } from '@/components';
import { type Tier, type UserTier } from "codetierlist-types";

export declare interface AssignmentCardProps {
  id: string
  name: string
  dueDate: Date
  tier?: UserTier | Tier
}

export const AssignmentCard = ({ id, name, dueDate, tier }: AssignmentCardProps): JSX.Element => {
    const formattedDueDate = formatDate(dueDate);
    return (
        <Link href={`/assignments/${id}`} className={styles.cardLink}>
            <Card className={styles.card}>
                
                { tier && <CardHeader header={<TierChip tier={tier} />} />}
                
                <div className={styles.cardContent}>
                    <Caption1>{formattedDueDate}</Caption1>
                    <Title3>{name}</Title3>
                </div>
            </Card>
        </Link>
    );
};

const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };