import { Title2, Title3 } from '@fluentui/react-components';
import styles from './CourseBlock.module.css';

export declare type CourseBlockProps = {
    /** the course ID to display */
    courseID: string;
};

export const CourseBlockSmall = ({ courseID }: CourseBlockProps): JSX.Element => {
    return (
        <div className={styles.blockSmall}>
            <Title3 style={{ color: 'white', fontSize: 20 }}>{courseID}</Title3>
        </div>
    );
};

export const CourseBlockLarge = ({ courseID }: CourseBlockProps): JSX.Element => {
    return (
        <div className={styles.blockLarge}>
            <Title2 style={{ color: 'white' }}>{courseID}</Title2>
        </div>
    );
};
