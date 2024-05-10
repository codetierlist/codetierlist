import axios, { handleError } from '@/axios';
import { SnackbarContext } from '@/hooks';
import { UserFetchedAssignment } from 'codetierlist-types';
import { useContext, useEffect, useState } from 'react';

/**
 * A hook that fetches the assignment and tierlist for the assignment page
 * @param courseID the course ID
 * @param assignmentID the assignment ID
 */
export const useAssignment = (courseID: string, assignmentID: string) => {
    const [assignment, setAssignment] = useState<UserFetchedAssignment | null>(null);
    const { showSnack } = useContext(SnackbarContext);

    const fetchAssignment = async () => {
        await axios
            .get<UserFetchedAssignment>(
                `/courses/${courseID}/assignments/${assignmentID}`,
                {
                    skipErrorHandling: true,
                }
            )
            .then((res) => setAssignment(res.data))
            .catch((e) => {
                handleError(showSnack)(e);
            });
    };

    useEffect(() => {
        if (!courseID || !assignmentID) {
            return;
        }
        void fetchAssignment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseID, assignmentID]);

    return { assignment, fetchAssignment };
};
