import {AssignmentCard, CourseSessionChip} from '@/components';
// import { type Course, getCourses } from '@/contexts/UserContext';
import styles from './page.module.css';
import {Title2} from '@fluentui/react-text';
import axios from "@/axios";
import {FetchedCourseWithTiers} from "codetierlist-types";
import {useEffect, useState} from "react";
import {notFound} from "next/navigation";
// import { notFound } from 'next/navigation';

export default function Page({params}: { params: { courseID: string } }) {
    const [course, setCourse] = useState<FetchedCourseWithTiers | null>(null);
    useEffect(() => {
        axios.get<FetchedCourseWithTiers>(`/courses/${params.courseID}`, {skipErrorHandling: true}).then((res) => setCourse(res.data)).catch(notFound);
    }, [params.courseID]);

    return (
        <main>
            <header className={styles.header}>
                <Title2>
                    <CourseSessionChip session="Fall">
                        {params.courseID}
                    </CourseSessionChip>
                </Title2>
                <Title2>
                    {course?.name || 'Course not found'}
                </Title2>
            </header>
            <div className="flex-wrap">
                {course ? course.assignments.map((assignment) => (
                    <AssignmentCard key={assignment.title.replaceAll(" ", "_")} id={assignment.title.replaceAll(" ", "_")} name={assignment.title} dueDate={assignment.due_date ?? undefined}  tier={assignment.tier}/>
                )) : "Loading..."}
            </div>
        </main>
    );
}
