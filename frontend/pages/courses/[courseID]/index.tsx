import axios, { handleError } from '@/axios';
import {
    AssignmentCard,
    BaseAdminToolbarDeleteButton,
    CourseSessionChip,
    EnrollRemovePeopleMenu,
    HeaderToolbar,
    checkIfCourseAdmin,
    getSession,
    promptForFileObject,
} from '@/components';
import { SnackbarContext, UserContext, useSeed } from '@/hooks';
import { Caption1, Spinner, ToolbarButton } from '@fluentui/react-components';
import {
    Add24Filled,
    ImageAdd20Regular,
    PersonDelete24Regular,
} from '@fluentui/react-icons';
import { Title2 } from '@fluentui/react-text';
import { FetchedCourseWithTiers } from 'codetierlist-types';
import { notFound } from 'next/navigation';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { Container } from 'react-grid-system';
import styles from './page.module.css';

/**
 * Fetches the course with the given courseID
 * @param courseID The courseID to fetch
 */
const useCourse = (courseID: string) => {
    const [course, setCourse] = useState<FetchedCourseWithTiers | null | undefined>(
        undefined
    );
    const { showSnack } = useContext(SnackbarContext);

    const fetchCourse = async () => {
        if (!courseID) return;
        await axios
            .get<FetchedCourseWithTiers>(`/courses/${courseID}`, {
                skipErrorHandling: true,
            })
            .then((res) => setCourse(res.data))
            .catch((e) => {
                setCourse(null);
                handleError(showSnack)(e);
                notFound();
            });
    };

    useEffect(() => {
        void fetchCourse();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseID]);

    return { course, fetchCourse };
};

/**
 * A button that deletes a course
 */
export const AdminToolbarDeleteCourseButton = ({
    courseID,
}: {
    /** the course ID of the course */
    courseID: string;
}) => {
    const { showSnack } = useContext(SnackbarContext);
    const { fetchUserInfo } = useContext(UserContext);

    const router = useRouter();

    const deleteCourse = async () => {
        await axios
            .delete(`/courses/${courseID}`)
            .then(() => router.push('/'))
            .catch((e) => {
                handleError(showSnack)(e);
            })
            .finally(() => fetchUserInfo());
    };

    return <BaseAdminToolbarDeleteButton noun="course" deleteFunction={deleteCourse} />;
};

/**
 * Toolbar for admin page
 */
const CourseAdminToolbar = ({
    courseID,
    fetchCourse,
    updateSeed,
}: {
    /** the course ID of the course */
    courseID: string;
    /** fetches the course */
    fetchCourse: () => Promise<void>;
    /** updates the seed */
    updateSeed: () => void;
}): JSX.Element => {
    const router = useRouter();
    const { showSnack } = useContext(SnackbarContext);

    return (
        <HeaderToolbar aria-label="Admin Toolbar">
            <ToolbarButton
                appearance="subtle"
                icon={<Add24Filled />}
                onClick={() =>
                    router.push(`/courses/${courseID}/admin/create_assignment`)
                }
            >
                Add assignment
            </ToolbarButton>

            <EnrollRemovePeopleMenu courseID={courseID} add={true} />

            <ToolbarButton
                appearance="subtle"
                icon={<PersonDelete24Regular />}
                onClick={() => router.push(`/courses/${courseID}/admin/people/remove`)}
            >
                Remove people
            </ToolbarButton>

            <ToolbarButton
                appearance="subtle"
                icon={<ImageAdd20Regular />}
                onClick={async (event) => {
                    event.stopPropagation();
                    const files = await promptForFileObject({ type: 'image/*' });
                    if (!files || files.length != 1) {
                        return;
                    }

                    const formData = new FormData();
                    formData.append('file', files[0]);

                    axios
                        .post(`/courses/${courseID}/cover`, formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        })
                        .then(updateSeed)
                        .catch((e) => {
                            handleError(showSnack)(e);
                        })
                        .finally(() => {
                            void fetchCourse();
                        });
                }}
            >
                Change cover image
            </ToolbarButton>

            <AdminToolbarDeleteCourseButton courseID={courseID} />
        </HeaderToolbar>
    );
};

export default function Page() {
    const { userInfo } = useContext(UserContext);
    const { courseID } = useRouter().query;
    const { course, fetchCourse } = useCourse(courseID as string);
    const { seed, setSeed } = useSeed();

    useEffect(() => {
        void fetchCourse();
        document.title = `${courseID} - Codetierlist`;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseID]);

    return (
        <Container component="main" className="m-t-xxxl">
            <header
                style={{
                    backgroundImage: `
                        linear-gradient(color-mix(in srgb, var(--colorNeutralBackground3) 60%, transparent),
                                        color-mix(in srgb, var(--colorNeutralBackground3) 80%, transparent)),
                        url("${process.env.NEXT_PUBLIC_API_URL}/courses/${courseID as string}/cover?seed=${seed}")`,
                }}
                className={`${styles.banner} m-b-xxxl m-x-l`}
            >
                <div className={styles.header}>
                    {course !== null && (
                        <Title2 className={styles.courseTitle}>
                            <CourseSessionChip
                                session={course?.session ?? getSession(new Date())}
                            >
                                {courseID}
                            </CourseSessionChip>
                        </Title2>
                    )}
                    {course === null && <Title2>Course not found</Title2>}
                    {course === undefined && <Title2>Loading...</Title2>}
                    {course !== null && course !== undefined && (
                        <Title2>{course?.name}</Title2>
                    )}
                </div>
            </header>

            {checkIfCourseAdmin(userInfo, courseID as string) ? (
                <CourseAdminToolbar
                    courseID={courseID as string}
                    fetchCourse={fetchCourse}
                    updateSeed={setSeed}
                />
            ) : undefined}

            <section className="m-y-xxxl m-x-l">
                <div className="flex-wrap">
                    {course !== null &&
                        course !== undefined &&
                        course.assignments.length === 0 && (
                            <Caption1>
                                This course has no assignments yet. If your believe that
                                this message you are receiving is incorrect, please
                                contact your instructor to correct this issue.
                            </Caption1>
                        )}

                    {course &&
                        course.assignments.map((assignment) => (
                            <AssignmentCard
                                key={assignment.title}
                                id={assignment.title}
                                name={assignment.title}
                                dueDate={
                                    assignment.due_date
                                        ? new Date(assignment.due_date)
                                        : undefined
                                }
                                tier={assignment.tier}
                                courseID={courseID as string}
                            />
                        ))}
                </div>
                {course === undefined && <Spinner />}
            </section>
        </Container>
    );
}
