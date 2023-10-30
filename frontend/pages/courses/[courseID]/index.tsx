// Remember to change back t [courseID]

import { CourseSessionChip, AssignmentCard } from '@/components';
// import { type Course, getCourses } from '@/contexts/UserContext';
import styles from './page.module.css';
import { Title2 } from '@fluentui/react-text';
import { CourseBlockLarge } from '@/components/CourseBlock/CourseBlockLarge';
import { UpcomingDeadlinesCard } from '@/components/UpcomingDeadlines/UpcomingDeadlinesCard/UpcomingDeadlinesCard';
// import { notFound } from 'next/navigation';

export default function Page ({ params }: { params: { courseID: string } }) {
    // const courses = getCourses();

    // let courseObject: Course | undefined;

    // if (!courses.find((course) => course.code === params.courseID)) {
    //     notFound();
    // } else {
    //     courseObject = courses.find((course) => course.code === params.courseID);
    // }

    return (
        <main className={styles.info}>
            <div className={styles.assignments}>
                <header className={styles.header}>
                    {/* <Title2>
                        <CourseSessionChip session="Fall">
                            {params.courseID}
                        </CourseSessionChip>
                    </Title2> */}
                    <CourseBlockLarge courseID='CSCXXX'/>
                    <Title2 className={styles.title}>
                        Temporary Course Name{/* {courseObject?.name || 'Course not found'} */}
                    </Title2>
                </header>
                <div className="flex-wrap">
                    <AssignmentCard id="1" name="Assignment 1" dueDate={new Date()} tier="S" />
                    <AssignmentCard id="1" name="Assignment 2" dueDate={new Date()} tier="A" />
                    <AssignmentCard id="1" name="Assignment 3" dueDate={new Date()} tier="B" />
                    <AssignmentCard id="1" name="Assignment 4" dueDate={new Date()} tier="C" />
                    <AssignmentCard id="1" name="Assignment 5" dueDate={new Date()} tier="D" />
                    <AssignmentCard id="1" name="Assignment 5" dueDate={new Date()} tier="F" />
                    <AssignmentCard id="1" name="Assignment 6" dueDate={new Date()} tier="?" />
                </div>
            </div>
            <div className={styles.upcoming}>
                <UpcomingDeadlinesCard />
            </div>
        </main>
    );
}

// ---------------------------------------------

// export default function Home() {

//     return (
//         <main>
//             <div className="course">
//                 <div className="assignments" style={{ backgroundColor: 'red'}}>
//                     <p> hi hi hi</p>
//                 </div>
//                 <div>
//                     <p> yo yo yo</p>
//                 </div>
//             </div>
//         </main>
//     );
// }