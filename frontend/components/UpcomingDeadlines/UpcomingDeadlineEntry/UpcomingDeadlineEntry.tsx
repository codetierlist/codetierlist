import { Divider, Title3 } from '@fluentui/react-components';
import { DueDate, daysUntilDate, CourseBlockSmall } from '@/components';
import styles from './UpcomingDeadlineEntry.module.css';

export declare interface UpcomingDeadlineEntryProps {
    courseID: string;
    assignmentName: string;
    dueDate: Date;
}

export const UpcomingDeadlineEntry = ({
    courseID,
    assignmentName,
    dueDate,
}: UpcomingDeadlineEntryProps): JSX.Element => {
    return (
        <div>
            <div className={styles.entry}>
                <div className={styles.assignmentIdentifyingInfo}>
                    <CourseBlockSmall courseID={courseID} />
                    <Title3 className={styles.assignmentName}>{assignmentName}</Title3>
                </div>
                <div>
                    <DueDate daysUntilDue={daysUntilDate(dueDate)} />
                </div>
            </div>
            <Divider></Divider>
        </div>
    );
};
