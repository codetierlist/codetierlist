import axios, { handleError } from "@/axios";
import { UserContext } from "@/contexts/UserContext";
import { useRouter } from 'next/router';
import { useContext } from "react";
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { BaseToolbarDeleteButton } from '../BaseToolbarDeleteButton/BaseToolbarDeleteButton';
import { FetchedAssignment } from "codetierlist-types";

/**
 * A button that deletes an assignment
 *
 * @param {FetchedAssignment} assignment the assignment to delete
 */
export const AdminToolbarDeleteAssignmentButton = ({ assignment }: { assignment: FetchedAssignment }) => {
    const { showSnackSev } = useContext(SnackbarContext);
    const { fetchUserInfo } = useContext(UserContext);

    const router = useRouter();

    const deleteAssignment = async () => {
        await axios.delete(`/courses/${assignment.course_id}/assignments/${assignment.title}`)
            .then(() => router.push('/'))
            .catch(handleError(showSnackSev))
            .finally(() => fetchUserInfo());
    };

    return (
        <BaseToolbarDeleteButton noun="assignment" deleteFunction={deleteAssignment} />
    );
};
