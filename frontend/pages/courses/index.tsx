import styles from '@/styles/courses.module.css';
import Head from 'next/head';


export default function Home() {
    // const utorid = getUtorid();

    // const courses = getEnrolledCourses(utorid);

    return (
        <>
            <Head>
                <title>Courses - Codetierlist</title>
            </Head>

            <main className={styles.mainz}>
                <div className="flex-wrap">
                    {/* { JSON.stringify(courses) } */}
                    {/* { utorid} */}
                    courses
                </div>
            </main>
        </>
    );
}
