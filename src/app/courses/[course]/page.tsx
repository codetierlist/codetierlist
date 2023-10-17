"use client"

import { CourseSessionChip } from "@/components"
import { getCourses } from "@/contexts/UserContext";
import { Title2 } from "@fluentui/react-components";

export default function Page({ params }: { params: { course: string } }) {
    const courses = getCourses();
    let course: Course;

    if (!courses.find((course) => course.code.toLowerCase() === params.course.toLowerCase())) {
        return (
            <main>
                <h1>Course not found</h1>
            </main>
        )
    } else {
        course = courses.find((course) => course.code.toLowerCase() === params.course.toLowerCase());
    }

    return (
        <main>
            <div>
                <CourseSessionChip session="Fall">
                    {params.course}
                </CourseSessionChip>
                <Title2>
                { course.name }
                </Title2>
            </div>
        </main>
    );
}
