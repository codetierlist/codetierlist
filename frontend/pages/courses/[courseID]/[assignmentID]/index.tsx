import { CourseSessionChip, AssignmentCard } from '@/components';
// import { type Course, getCourses } from '@/contexts/UserContext';
import styles from './page.module.css';
import { Title2 } from '@fluentui/react-text';
import Error from 'next/error';
import { useRouter } from 'next/router';
import { colourHash } from '@/components';

export default function Page () {
    // TODO: guard against invalid courseID, invalid assignmentID
    if (false) { // your code goes here
        return <Error statusCode={404} />
    }

    const router = useRouter();
    const { courseID, assignmentID } = router.query;

    return (
        <main>
            <header className={styles.header}>
                <Title2>
                    <span className={colourHash(courseID)}>
                        {courseID}
                    </span>
                    {assignmentID}
                </Title2>
                <Title2>
                    {/* {courseObject?.name || 'Course not found'} */}
                </Title2>
            </header>
            <div className="flex-wrap">

            </div>
        </main>
    );
}
