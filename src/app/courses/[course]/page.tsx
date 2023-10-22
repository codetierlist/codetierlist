'use client';

import { CourseSessionChip } from '@/components';
import { AssignmentCard } from '@/components/AssignmentCard/AssignmentCard';
import { type Course, getCourses } from '@/contexts/UserContext';
import { Title2 } from '@fluentui/react-components';
import styles from './page.module.css';
import { notFound } from 'next/navigation';

export default function Page ({ params }: { params: { course: string } }) {
    const courses = getCourses();

    let courseObject: Course | undefined;

    if (!courses.find((course) => course.code === params.course)) {
        notFound();
    } else {
        courseObject = courses.find((course) => course.code === params.course);
    }

    return (
        <main>
            <header className={styles.header}>
                <Title2>
                    <CourseSessionChip session="Fall">
                        {params.course}
                    </CourseSessionChip>
                </Title2>
                <Title2>
                    {courseObject?.name || 'Course not found'}
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
        </main>
    );
}
