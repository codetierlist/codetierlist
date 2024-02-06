import {
    Menu,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    ToolbarButton
} from "@fluentui/react-components";
import { ChevronDown16Regular, PersonAdd24Regular, PersonDelete24Regular } from '@fluentui/react-icons';
import { useRouter } from 'next/router';

declare type AddRemovePeopleButtonProps = {
    /**
     * the course ID of the course
     */
    courseID: string;
    /**
     * the type of people to add/remove
     */
    type: 'students' | 'tas' | 'instructors';
    /**
     * whether to add or remove people. True for add, false for remove
     */
    add: boolean;
}

/**
 * Menu item for adding/removing people
 */
const AddRemovePeopleButton = ({ courseID, type, add }: AddRemovePeopleButtonProps) => {
    const router = useRouter();

    return (
        <MenuItem
            onClick={() => router.push(`/courses/${courseID}/admin/people/${add ? 'add' : 'remove'}-${type}`)}
            aria-label={`${add ? 'Add' : 'Remove'} ${type === 'tas' ? 'Teaching Assistants' : type} ${add ? 'to' : 'from'} course`}
        >
            {add ? 'Add' : 'Remove'} {type === 'tas' ? 'TAs' : type.charAt(0).toUpperCase() + type.slice(1)}
        </MenuItem>
    );
};

export declare type AddRemovePeopleMenuProps = {
    /**
     * the course ID of the course
     */
    courseID: string;
    /**
     * whether to add or remove people. True for add, false for remove
     */
    add: boolean;
}

/**
 * Menu for adding/removing people
 */
export const AddRemovePeopleMenu = ({ courseID, add }: AddRemovePeopleMenuProps) => {
    return (
        <Menu>
            <MenuTrigger>
                <ToolbarButton
                    appearance="subtle"
                    icon={add ? <PersonAdd24Regular /> : <PersonDelete24Regular />}
                >
                    {add ? 'Add' : 'Remove'} people <ChevronDown16Regular className="m-l-xs" />
                </ToolbarButton>
            </MenuTrigger>

            <MenuPopover>
                <MenuList>
                    <AddRemovePeopleButton courseID={courseID} type="students" add={add} />
                    <AddRemovePeopleButton courseID={courseID} type="tas" add={add} />
                    <AddRemovePeopleButton courseID={courseID} type="instructors" add={add} />
                </MenuList>
            </MenuPopover>
        </Menu>
    );
};
