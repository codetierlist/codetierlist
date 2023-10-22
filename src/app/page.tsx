'use client';

import { CourseOverviewCard } from '@/components';
import { type Course, getCourses } from '../contexts/UserContext';
import styles from './page.module.css';

export default function Home () {
    const courses = getCourses();

    return (
        <main className={styles.main}>
            <div className="flex-wrap">
                {courses.map((course: Course, i) => {
                    return (
                        <CourseOverviewCard
                            name={course.code}
                            image="https://i.imgur.com/XXlaSS3.png"
                            session={course.session}
                            key={i}
                        />
                    );
                })}
            </div>
        </main>
    );
}
