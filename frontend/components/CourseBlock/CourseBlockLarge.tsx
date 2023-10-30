import { Title2 } from '@fluentui/react-components';
import styles from './CourseBlockLarge.module.css';

export declare interface CourseBlockProps {
    courseID: string;
}
  

export const CourseBlockLarge = ({ courseID }: CourseBlockProps): JSX.Element => {
    return (
        <div className={styles.block}>
            <Title2 style={{color: 'white'}}>{courseID}</Title2>
        </div>
    );
};