import axios, { handleError } from "@/axios";
import { SnackbarContext } from '@/contexts/SnackbarContext';
import { UserContext } from "@/contexts/UserContext";
import {
    Button,
    Caption1,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Input,
    Label
} from "@fluentui/react-components";
import { useContext, useState } from "react";

import styles from "./CreateCourseForm.module.css";

/**
 * Create a course
 *
 * !!! NO DATA VALIDATION !!!
 *
 * @param courseCode
 * @param courseName
 */
const handleSubmit = async (courseCode: string, courseName: string) => {
    axios.post("/courses", {
        code: courseCode,
        name: courseName
    });
};

/**
 * Form for creating a course
 * @param {function} closeDialog function to close the dialog
 */
export const CreateCourseDialogSurface = ({ closeDialog }: { closeDialog: () => void }) => {
    const [courseCode, setCourseCode] = useState("");
    const [courseName, setCourseName] = useState("");
    const { fetchUserInfo } = useContext(UserContext);
    const { showSnackSev } = useContext(SnackbarContext);

    return (
        <DialogSurface>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(courseCode, courseName)
                    .then(fetchUserInfo)
                    .then(closeDialog)
                    .catch((error) => {
                        handleError(error.message, showSnackSev);
                    });
            }}>
                <DialogBody>
                    <DialogTitle className={styles.dialogTitle}>
                        Create a course
                        <Caption1 className={styles.dialogSubtitle}>
                            Please fill out the following information to create a course.
                            A suffix will be added to the course code to make it unique.
                        </Caption1>
                    </DialogTitle>


                    <DialogContent className={styles.dialogContent}>
                        <div className={styles.input}>
                            <Label required htmlFor="courseCode">Course Code:</Label>
                            <Input required type="text" id="courseCode" name="courseCode"
                                value={courseCode}
                                onChange={e => setCourseCode(e.target.value)} />
                        </div>

                        <div className={styles.input}>
                            <Label required htmlFor="courseName">Course Name:</Label>
                            <Input required type="text" id="courseName" name="courseName"
                                value={courseName}
                                onChange={e => setCourseName(e.target.value)} />
                        </div>
                    </DialogContent>

                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary">Close</Button>
                        </DialogTrigger>
                        <Button type="submit"
                            appearance="primary">Create</Button>
                    </DialogActions>
                </DialogBody>
            </form>
        </DialogSurface>
    );
};
