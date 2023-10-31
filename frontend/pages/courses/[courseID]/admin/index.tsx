// Remember to change back t [courseID]

import { CourseSessionChip, AssignmentCard } from '@/components';
// import { type Course, getCourses } from '@/contexts/UserContext';
import styles from './page.module.css';
import { Title2 } from '@fluentui/react-text';
import { CourseBlockLarge } from '@/components/CourseBlock/CourseBlockLarge';
import { UpcomingDeadlinesCard } from '@/components/UpcomingDeadlines/UpcomingDeadlinesCard/UpcomingDeadlinesCard';
import { AddAssignmentModal } from '@/components/AddAssignmentModal/AddAssignmentModal';
import { ReturnHomeButton } from '@/components/ReturnHomeButton/ReturnHomeButton';
import {useEffect, useState} from "react";
import {FetchedCourseWithTiers} from "codetierlist-types";
import axios from "@/axios";
import {notFound} from "next/navigation";
// import { notFound } from 'next/navigation';

export default function Page ({ params }: { params: { courseID: string } }) {
    // const courses = getCourses();

    // let courseObject: Course | undefined;

    // if (!courses.find((course) => course.code === params.courseID)) {
    //     notFound();
    // } else {
    //     courseObject = courses.find((course) => course.code === params.courseID);
    // }
    // TODO this code is duplicated from assignment page
    const [course, setCourse] = useState<FetchedCourseWithTiers | null>(null);
    useEffect(() => {
        axios.get<FetchedCourseWithTiers>(`/courses/${params.courseID}`, {skipErrorHandling: true}).then((res) => setCourse(res.data)).catch(notFound);
    }, [params.courseID]);
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
                    {course ? course.assignments.map((assignment) => (
                        <AssignmentCard key={assignment.title.replaceAll(" ", "_")} id={assignment.title.replaceAll(" ", "_")} name={assignment.title} dueDate={assignment.due_date ?? undefined}  tier={assignment.tier}/>
                    )) : "Loading..."}
                    <AddAssignmentModal />
                </div>
                <div style={{marginTop: 20}}>
                    <ReturnHomeButton />
                </div>
            </div>
            
        </main>
    );
}