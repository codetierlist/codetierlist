import { Text, Title3 } from '@fluentui/react-components';
import styles from './DueDate.module.css';

export declare interface DueDateProps {
    daysUntilDue: number;
}

export const DueDate = ({ daysUntilDue }: DueDateProps): JSX.Element => {
    return (
        <div className={styles.container}>
            <Text style={{ fontSize: 10 }}>DUE IN</Text>
            <Title3 style={{ fontSize: 20 }}>{daysUntilDue} DAYS</Title3>
        </div>
    );
};
