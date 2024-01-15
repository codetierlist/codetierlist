import { HeaderToolbar } from '@/components';
import { AdminToolbarDeleteCourseButton } from '@/components/AssignmentAdminToolbar/BaseToolbarDeleteButton/AdminToolbarDeleteCourseButton/AdminToolbarDeleteCourseButton';
import { AddRemovePeopleMenu } from '@/components/AssignmentAdminToolbar/AddRemovePeopleMenu/AddRemovePeopleMenu';
import {
    ToolbarButton
} from "@fluentui/react-components";
import { Add24Filled } from '@fluentui/react-icons';
import { useRouter } from 'next/router';

export declare type AdminToolbarProps = {
    /**
     * the course ID of the course
     */
    courseID: string;
    /**
     * fetches the course
     */
    fetchCourse: () => Promise<void>;
};

/**
 * Toolbar for admin page
 * @property {string} courseID the course ID of the course
 * @returns {JSX.Element} the toolbar
 */
export const AssignmentAdminToolbar = ({ courseID }: AdminToolbarProps): JSX.Element => {
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

            <AddRemovePeopleMenu courseID={courseID} add={true} />

            <AddRemovePeopleMenu courseID={courseID} add={false} />

            <AdminToolbarDeleteCourseButton courseID={courseID} />
        </HeaderToolbar>
    );
};
