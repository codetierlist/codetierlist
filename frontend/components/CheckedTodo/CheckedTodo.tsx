import { DismissCircle24Filled, CheckmarkCircle24Filled } from '@fluentui/react-icons';
import styles from './CheckedTodo.module.css';

export declare type CheckedTodoItemProps = {
    /** The text to put inside the todo */
    todo: string;
    /** Whether the todo is checked or not */
    checked: boolean;
}

export const CheckedTodoItem = ({ todo, checked }: CheckedTodoItemProps) => {
    return (
        <div className={"d-flex align-items-center " + styles.checkedTodoItem}>
            {
                checked ? (
                    <CheckmarkCircle24Filled primaryFill={'var(--colorStatusSuccessBackground3)'} />
                ) : (
                    <DismissCircle24Filled />
                )
            }
            <span className={styles.todoText}>{todo}</span>
        </div>
    );
}
