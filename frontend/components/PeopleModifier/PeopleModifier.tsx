import { handleError } from "@/axios";
import { Monaco, promptForFileReader } from "@/components";
import { SnackbarContext } from "@/contexts/SnackbarContext";
import flex from '@/styles/flex-utils.module.css';
import { Body2, Button } from "@fluentui/react-components";
import { Add24Filled } from '@fluentui/react-icons';
import { Title2 } from '@fluentui/react-text';
import { RoleType } from 'codetierlist-types';
import { useRouter } from "next/router";
import { useContext, useState } from "react";

import axios from "@/axios";
import { isUTORid } from 'is-utorid';
import styles from './PeopleModifier.module.css';

/**
 * Get the role name from the role type
 */
export const getRoleName = (roleName: RoleType | string): string => roleName === "TA" ? roleName : roleName.toLocaleLowerCase();

/**
 * given a csv of students, enroll them in or remove them from the course
 *
 * @param courseID the course to modify
 * @param csv a list of utorids that are newline separated
 * @param action the action to perform on the enrolment of students (enrol or remove from course)
 *
 * @returns void on success, throws an error on failure
 */
async function modifyEnrollment(courseID: string, csv: string, action: "add" | "remove", role: RoleType, showSnackSev: (message: string, severity: "success" | "error") => void): Promise<void> {
    const utorids = csv.split("\n");

    if (!csv || !utorids.length) {
        showSnackSev("Please enter some UTORids", "error");
    } else if (utorids.some((utorid: string) => !isUTORid(utorid))) {
        showSnackSev("One of the UTORids are invalid", "error");
    } else {
        await axios.post(`/courses/${courseID}/${action}`, { utorids, role })
            .then(() => showSnackSev(`${action == "add" ? "Added" : "Removed"} ${getRoleName(role)} successfully`, "success"))
            .catch((e) => { showSnackSev(e.message, "error"); throw e; });
    }
}

export declare interface PeopleModifierProps {
    /**
     * The title of the component to display
     */
    title: string
    /**
     * The description of the component to display
     */
    description: string
    /**
     * The action of the component, either add or remove
     */
    action: "add" | "remove"
    /**
     * The role type to enroll
     */
    roleType: RoleType
}

export const PeopleModifier = ({
    title,
    description,
    action,
    roleType
}: PeopleModifierProps): JSX.Element => {
    const [editorValue, setEditorValue] = useState("");
    const { showSnackSev } = useContext(SnackbarContext);

    const router = useRouter();

    return (
        <>
            <div className={`${flex["d-flex"]} ${flex["justify-content-between"]} m-b-xl`}>
                <header>
                    <Title2 block>{title}</Title2>
                    <Body2 block>{description}</Body2>
                </header>

                <Button
                    icon={<Add24Filled />}
                    onClick={async () => {
                        promptForFileReader(".csv")
                            .then((csv) => {
                                if (csv) {
                                    setEditorValue(csv.result as string);
                                }
                            });
                    }}
                >
                    Load CSV from file
                </Button>
            </div>

            <Monaco
                height="56vh"
                defaultLanguage="csv"
                value={editorValue}
                onChange={(value) => setEditorValue(value || "")}
            />

            <Button
                appearance="primary"
                className={`m-y-xxl ${styles.submitButton}`}
                onClick={() => {
                    modifyEnrollment(router.query.courseID as string, editorValue, action, roleType, showSnackSev)
                        .catch((e) => handleError(showSnackSev, e.message));
                }}>
                Submit
            </Button>
        </>
    );
};
