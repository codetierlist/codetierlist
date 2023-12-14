import {modifyEnrollment, Monaco, promptForFileReader} from "@/components";
import {handleError} from "@/axios";
import { RoleType } from 'codetierlist-types';
import { Title2 } from '@fluentui/react-text';
import { Body2, Button } from "@fluentui/react-components";
import flex from '@/styles/flex-utils.module.css';
import { Add24Filled } from '@fluentui/react-icons';
import {useContext, useState} from "react";
import {SnackbarContext} from "@/contexts/SnackbarContext";
import { useRouter } from "next/router";

import styles from './PeopleModifier.module.css';

export declare interface PeopleModifierProps {
    title: string
    description: string
    action: "add" | "remove"
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

    const peopleType = roleType == "STUDENT" ? "students" : roleType == "TA" ? "TAs" : "instructors";
    const modalActionText = action == "add" ? "Added" : "Removed";
    return (
        <>
            <div className={`${flex["d-flex"]} ${flex["justify-content-between"]}`}>
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

            <br />

            <Monaco
                height="56vh"
                defaultLanguage="csv"
                defaultValue="utorid"
                value={editorValue}
                onChange={(value) => setEditorValue(value || "")}
            />
            <Button
                appearance="primary"
                className={`m-y-xxl ${styles.submitButton}`}
                onClick={() => {
                    modifyEnrollment(router.query.courseID as string, editorValue, action, roleType)
                        .then(() => showSnackSev(`${modalActionText} ${peopleType} successfully`, "success"))
                        .catch((e) => handleError(showSnackSev, e.message));

                }}>
                Submit
            </Button>
        </>
    );
};
