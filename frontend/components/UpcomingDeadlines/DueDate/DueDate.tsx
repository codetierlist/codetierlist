import { Text, Title3 } from '@fluentui/react-components';
import styles from './DueDate.module.css';

export declare type DueDateProps = {
    /**the number of days until the due date */
    daysUntilDue: number;
};

export const DueDate = ({ daysUntilDue }: DueDateProps): JSX.Element => {
    return (
        <div className={styles.container} style={{ textTransform: 'uppercase' }}>
            <Text style={{ fontSize: 10 }}>Due in</Text>
            <Title3 style={{ fontSize: 20 }}>{daysUntilDue} days</Title3>
        </div>
    );
};
