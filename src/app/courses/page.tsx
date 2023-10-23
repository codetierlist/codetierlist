// import { CourseOverviewCard } from '@/components';
// import { type Course } from '../../contexts/UserContext';
import styles from './page.module.css';
import { getEnrolledCourses } from '../api/courses/route';
import { getUtorid } from '@/lib/frontendUtils';

export default function Home() {
    const utorid = getUtorid();

    const courses = getEnrolledCourses(utorid);

    return (
        <main className={styles.mainz}>
            <div className="flex-wrap">
                { JSON.stringify(courses) }
                { utorid}
            </div>
        </main>
    );
}
