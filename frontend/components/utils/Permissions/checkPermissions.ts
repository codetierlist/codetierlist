import { FetchedUser } from "codetierlist-types";

export function isProfForCourse(userInfo: FetchedUser, course_id: string) {
    for (let i = 0; i < userInfo.roles.length; i++) {
        const role = userInfo.roles[i];
        if (role.course_id == course_id && role.type == 'INSTRUCTOR') {
            return true;
        }
    }
    return false;
}