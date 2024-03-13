import { Assignment } from 'codetierlist-types';
import { MessageBar, MessageBarBody, MessageBarTitle } from '@fluentui/react-components';
import styles from './CreateCourseForm.module.css';

/**
 * Show a message if the assignment due date has passed.
 */
export const DueDateMessageBar = ({
    assignment,
}: {
    /** The assginment object */
    assignment: Assignment;
}) => {
    if (!assignment.due_date || new Date(assignment.due_date) >= new Date()) {
        return null;
    }
    return (
        <MessageBar
            className={styles.messageBar}
            intent={assignment.strict_deadline ? 'error' : 'warning'}
            layout="auto"
        >
            <MessageBarBody>
                <MessageBarTitle>
                    This assignment&apos;s due date has past.
                </MessageBarTitle>
                {assignment.strict_deadline
                    ? 'This assignment does not accept submissions past the deadline.'
                    : 'Codetierlist will accept submissions past the deadline; however, other students may not be updating their solutions and testcases anymore.'}{' '}
            </MessageBarBody>
        </MessageBar>
    );
};
