"use client"

import { CourseSessionChip } from "@/components"
import { AssignmentCard } from "@/components/AssignmentCard/AssignmentCard";
import { Course, getCourses } from "@/contexts/UserContext";
import { Title2 } from "@fluentui/react-components";
import styles from "./page.module.css"

export default function Page({ params }: { params: { course: string } }) {
    const courses = getCourses();

    let courseObject: Course | undefined;

    if (!courses.find((course) => course.code === params.course)) {
        return (
            <main>
                <h1>Course not found</h1>
            </main>
        )
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
                    {courseObject?.name || "Course not found"}
                </Title2>
            </header>
            <div className="flex-wrap">
                <AssignmentCard id="1" name="Assignment 1" dueDate={new Date()} tier="s" />
                <AssignmentCard id="1" name="Assignment 2" dueDate={new Date()} tier="a" />
                <AssignmentCard id="1" name="Assignment 3" dueDate={new Date()} tier="b" />
                <AssignmentCard id="1" name="Assignment 4" dueDate={new Date()} tier="c" />
                <AssignmentCard id="1" name="Assignment 5" dueDate={new Date()} tier="d" />
                <AssignmentCard id="1" name="Assignment 6" dueDate={new Date()} tier="idk" />
            </div>
        </main>
    );
}
