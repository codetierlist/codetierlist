import axios, { handleError } from "@/axios";
import { AdminToolbarDeleteCourseButton, AssignmentCard, CourseSessionChip, HeaderToolbar, checkIfCourseAdmin, getSession } from '@/components';
import { UserContext } from "@/contexts/UserContext";
import {
    Caption1,
    ToolbarButton
} from "@fluentui/react-components";
import { Add24Filled, PersonAdd24Regular, PersonDelete24Regular } from '@fluentui/react-icons';
import { Title2 } from '@fluentui/react-text';
import { FetchedCourseWithTiers } from "codetierlist-types";
import { notFound } from "next/navigation";
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from "react";
import { Container } from "react-grid-system";
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
                appearance="subtle"
                icon={<Add24Filled />}
                onClick={() => router.push(`/courses/${courseID}/admin/create_assignment`)}
            >
                Add assignment
            </ToolbarButton>

            <ToolbarButton
                appearance="subtle"
                icon={<PersonAdd24Regular />}
                onClick={() => router.push(`/courses/${courseID}/admin/enroll`)}
            >
                Add People
            </ToolbarButton>

            <ToolbarButton
                appearance="subtle"
                icon={<PersonDelete24Regular />}
                onClick={() => router.push(`/courses/${courseID}/admin/remove`)}
            >
                Remove People
            </ToolbarButton>

            <AdminToolbarDeleteCourseButton courseID={courseID} />
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
                handleError(showSnackSev)(e);
                notFound();
            });
    };

    useEffect(() => {
        void fetchCourse();
        document.title = `${courseID} - Codetierlist`;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseID]);

    return (
        <>
            {checkIfCourseAdmin(userInfo, courseID as string)? <AdminToolbar courseID={courseID as string} fetchCourse={fetchCourse} /> : undefined}

            <Container component="main" className="m-t-xxxl">
                <header className={styles.header}>
                    <Title2 className={styles.courseTitle}>
                        {course &&
                            <CourseSessionChip
                                session={getSession(new Date(course.createdAt))}>
                                {courseID}
                            </CourseSessionChip>
                        }
                    </Title2>
                    <Title2>
                        {course?.name || 'Course not found'}
                    </Title2>
                </header>
                <div className="flex-wrap">
                    {((course !== null) && course.assignments.length === 0) &&
                        <Caption1>This course has no assignments yet. If your believe that this message you are
                            receiving is incorrect, please contact your instructor to correct this issue.</Caption1>
                    }

                    {course ? (
                        course.assignments.map((assignment) => (
                            <AssignmentCard
                                key={assignment.title}
                                id={assignment.title}
                                name={assignment.title}
                                dueDate={assignment.due_date ? new Date(assignment.due_date) : undefined}
                                tier={assignment.tier}
                                courseID={courseID as string}
                            />
                        ))
                    ) : (
                        "Loading..."
                    )}
                </div>
            </Container>
        </>
    );
}
