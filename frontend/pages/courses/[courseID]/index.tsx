import axios, { handleError } from "@/axios";
import { AssignmentCard, CourseSessionChip, HeaderToolbar } from '@/components';
import { UserContext } from "@/contexts/UserContext";
import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogOpenChangeData,
    DialogOpenChangeEvent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Input,
    Label,
    Textarea,
    Title1,
    Title3,
    ToolbarButton
} from "@fluentui/react-components";
import { Add24Filled, PersonAdd24Regular, Shield24Filled } from '@fluentui/react-icons';
import { Title2 } from '@fluentui/react-text';
import { FetchedCourseWithTiers } from "codetierlist-types";
import { notFound } from "next/navigation";
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from "react";
import { SnackbarContext } from '../../../contexts/SnackbarContext';
import styles from './page.module.css';

/**
 * Toolbar for admin page
 * @property {string} courseID the course ID of the course
 * @returns {JSX.Element} the toolbar
 */
const AdminToolbar = ({ courseID }: { courseID: string, fetchCourse: () => Promise<void> }) => {
    const router = useRouter();

    return (
        <HeaderToolbar
            aria-label="Admin Toolbar"
        >
            <ToolbarButton
                appearance="primary"
                icon={<Shield24Filled />}
                onClick={() => router.push(`/courses/${courseID}/admin`)}
            >
                Admin page
            </ToolbarButton>

            <ToolbarButton
                appearance="subtle"
                icon={<PersonAdd24Regular />}
                onClick={() => router.push(`/courses/${courseID}/admin/enroll`)}
            >
                Enroll Students
            </ToolbarButton>

            <ToolbarButton
                appearance="subtle"
                icon={<Add24Filled />}
                onClick={() => router.push(`/courses/${courseID}/admin/create_assignment`)}
            >
                Add assignment
            </ToolbarButton>
        </HeaderToolbar>
    );
};

export default function Page() {
    const { userInfo } = useContext(UserContext);
    const [course, setCourse] = useState<FetchedCourseWithTiers | null>(null);
    const { courseID } = useRouter().query;
    const { showSnackSev } = useContext(SnackbarContext);

    const fetchCourse = async () => {
        if (!courseID) return;
        await axios.get<FetchedCourseWithTiers>(`/courses/${courseID}`, { skipErrorHandling: true })
            .then((res) => setCourse(res.data))
            .catch(e => {
                handleError(e.message, showSnackSev);
                notFound();
            });
    };

    useEffect(() => {
        void fetchCourse();
    }, [courseID]);

    return (
        <>
            {userInfo.admin ? <AdminToolbar courseID={courseID as string} fetchCourse={fetchCourse} /> : undefined}
            <main>
                <header className={styles.header}>
                    <Title2>
                        <CourseSessionChip session="Fall">
                            {courseID}
                        </CourseSessionChip>
                    </Title2>
                    <Title2>
                        {course?.name || 'Course not found'}
                    </Title2>
                </header>
                <div className="flex-wrap">
                    {course ? course.assignments.map((assignment) => (
                        <AssignmentCard key={assignment.title.replaceAll(" ", "_")}
                            id={assignment.title.replaceAll(" ", "_")}
                            name={assignment.title}
                            dueDate={assignment.due_date ? new Date(assignment.due_date) : undefined}
                            tier={assignment.tier}
                            courseID={courseID as string}
                        />
                    )) : "Loading..."}
                </div>
            </main >
        </>
    );
}
