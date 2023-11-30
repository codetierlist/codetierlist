// Remember to change back t [courseID]

import axios from "@/axios";
import {
    AddAssignmentModal,
    AssignmentCard,
    CourseBlockLarge,
    ReturnHomeButton
} from '@/components';
import { Title2 } from '@fluentui/react-text';
import { FetchedCourseWithTiers } from "codetierlist-types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from './page.module.css';
import { notFound } from 'next/navigation';

export default function Page (): JSX.Element {
    // const courses = getCourses();

    // let courseObject: Course | undefined;

    // if (!courses.find((course) => course.code === params.courseID)) {
    //     notFound();
    // } else {
    //     courseObject = courses.find((course) => course.code === params.courseID);
    // }

    const router = useRouter();
    const params = router.query;

    // TODO this code is duplicated from assignment page
    const [course, setCourse] = useState<FetchedCourseWithTiers | null>(null);
    useEffect(() => {
        axios.get<FetchedCourseWithTiers>(`/courses/${params.courseID}`, { skipErrorHandling: true }).then((res) => setCourse(res.data)).catch(notFound);
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
                    <CourseBlockLarge courseID='CSCXXX' />
                    <Title2 className={styles.title}>
                        Temporary Course Name{/* {courseObject?.name || 'Course not found'} */}
                    </Title2>
                </header>
                <div className="flex-wrap">
                    {course ? course.assignments.map((assignment) => (
                        <AssignmentCard
                            key={assignment.title.replaceAll(" ", "_")}
                            id={assignment.title.replaceAll(" ", "_")}
                            name={assignment.title}
                            dueDate={assignment.due_date ? new Date(assignment.due_date) : undefined}
                            tier={assignment.tier}
                            courseID={params.courseID as string}
                        />
                    )) : "Loading..."}
                    <AddAssignmentModal />
                </div>
                <div className={styles.bottomButtons}>
                    <ReturnHomeButton />
                    {/* <EnrollModal /> */}
                </div>
            </div>
        </main>
    );
}
