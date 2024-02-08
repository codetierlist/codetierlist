import axios, { handleError } from '@/axios';
import { CourseOverviewCard, getSession } from '@/components';
import { SnackbarContext } from '@/contexts/SnackbarContext';
import { UserContext } from '@/contexts/UserContext';
import { FetchedCourse } from 'codetierlist-types';
import { notFound } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

/**
 * Show all courses if admin
 */
export const AllCoursesList = () => {
    const { userInfo } = useContext(UserContext);
    const { showSnackSev } = useContext(SnackbarContext);
    const [allCourses, setAllCourses] = useState<FetchedCourse[] | null>([]);

    const fetchAllCourses = async () => {
        await axios
            .get<FetchedCourse[]>(`/courses`, { skipErrorHandling: true })
            .then(res =>
                setAllCourses(
                    res.data.filter(
                        course =>
                            !userInfo.roles.some(role => role.course_id === course.id)
                    )
                )
            )
            .catch(e => {
                handleError(showSnackSev)(e);
                notFound();
            });
    };

    useEffect(() => {
        if (!userInfo.admin) {
            return;
        }
        void fetchAllCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!userInfo.admin) {
        return <></>;
    }

    return (
        <section className="m-t-xxxl">
            {allCourses && allCourses.length === 0 ? null : (
                <h2 className="m-b-m">All Courses</h2>
            )}

            <div className="flex-wrap">
                {allCourses &&
                    allCourses.map(course => (
                        <CourseOverviewCard
                            key={course.id}
                            id={course.id}
                            name={course.name}
                            role="INSTRUCTOR"
                            session={getSession(new Date(course.createdAt))}
                            image={`${process.env.NEXT_PUBLIC_API_URL}/courses/${course.id}/cover`}
                        />
                    ))}
            </div>
        </section>
    );
};
