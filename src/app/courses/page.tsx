// import { CourseOverviewCard } from '@/components';
// import { type Course } from '../../contexts/UserContext';
import styles from './page.module.css';
import { GET as getCourses } from '../api/courses/route';
import { headers } from "next/headers";

export default function Home() {
    const headersList = headers();

    const courses = getCourses(
        {
            method: 'GET',
            headers: headersList as Headers,
            cache: 'default',
            credentials: 'include',
            destination: '',
            integrity: '',
            keepalive: false,
            mode: 'same-origin',
            redirect: 'error',
            referrer: '',
            referrerPolicy: '',
            signal: new AbortController().signal,
            url: '',
            clone: function (): Request {
                throw new Error('Function not implemented.');
            },
            body: null,
            bodyUsed: false,
            arrayBuffer: function (): Promise<ArrayBuffer> {
                throw new Error('Function not implemented.');
            },
            blob: function (): Promise<Blob> {
                throw new Error('Function not implemented.');
            },
            formData: function (): Promise<FormData> {
                throw new Error('Function not implemented.');
            },
            json: function (): Promise<never> {
                throw new Error('Function not implemented.');
            },
            text: function (): Promise<string> {
                throw new Error('Function not implemented.');
            }
        }
    );

    return (
        <main className={styles.mainz}>
            <div className="flex-wrap">
                { JSON.stringify(courses) }
            </div>
        </main>
    );
}
