import { FetchedUser } from 'codetierlist-types';

/**
 * Returns true if the user is an admin or has a role in the course
 */
export const checkIfCourseAdmin = (user: FetchedUser, courseId: string) => {
    return user.roles.some((role) => role.course_id === courseId) || user.admin;
};
