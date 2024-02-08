import axios, { handleError } from '@/axios';
import { UserContext } from '@/contexts/UserContext';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { SnackbarContext } from '@/contexts/SnackbarContext';
import { BaseToolbarDeleteButton } from '@/components/AssignmentAdminToolbar/BaseToolbarDeleteButton/BaseToolbarDeleteButton';

/**
 * A button that deletes a course
 * @property {string} courseID the course ID of the course
 */
export const AdminToolbarDeleteCourseButton = ({ courseID }: { courseID: string }) => {
    const { showSnackSev } = useContext(SnackbarContext);
    const { fetchUserInfo } = useContext(UserContext);

    const router = useRouter();

    const deleteCourse = async () => {
        await axios
            .delete(`/courses/${courseID}`)
            .then(() => router.push('/'))
            .catch(handleError(showSnackSev))
            .finally(() => fetchUserInfo());
    };

    return <BaseToolbarDeleteButton noun="course" deleteFunction={deleteCourse} />;
};
