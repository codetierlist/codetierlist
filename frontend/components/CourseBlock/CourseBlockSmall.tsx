import { Text, Title3 } from '@fluentui/react-components';
import styles from './CourseBlockSmall.module.css';

export declare interface CourseBlockProps {
    courseID: string;
}
  

export const CourseBlockSmall = ({ courseID }: CourseBlockProps): JSX.Element => {
    return (
        <div className={styles.block}>
            <Title3 style={{color: 'white', fontSize: 20}}>{courseID}</Title3>
        </div>
    );
};