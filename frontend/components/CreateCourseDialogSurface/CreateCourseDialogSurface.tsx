import axios, { handleError } from '@/axios';
import { SnackbarContext, UserContext } from '@/hooks';
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
    Label,
} from '@fluentui/react-components';
import { useContext, useState } from 'react';

import styles from './CreateCourseForm.module.css';

export declare type CreateCourseFormProps = {
    /** function to close the dialog */
    closeDialog: () => void;
};

/**
 * Form for creating a course
 */
export const CreateCourseDialogSurface = ({
    closeDialog,
}: CreateCourseFormProps): JSX.Element => {
    const [code, setCourseCode] = useState('');
    const [name, setCourseName] = useState('');
    const { fetchUserInfo } = useContext(UserContext);
    const { showSnackSev } = useContext(SnackbarContext);

    return (
        <DialogSurface>
            <form
                onSubmit={(event) => {
                    event.preventDefault();

                    axios
                        .post('/courses', { code, name })
                        .then(closeDialog)
                        .catch((e) => {
                            handleError(showSnackSev)(e);
                        })
                        .finally(fetchUserInfo);
                }}
            >
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
                            <Label required htmlFor="courseCode">
                                Course Code:
                            </Label>
                            <Input
                                required
                                type="text"
                                id="courseCode"
                                name="courseCode"
                                value={code}
                                maxLength={10}
                                onChange={(e) => setCourseCode(e.target.value)}
                            />
                        </div>

                        <div className={styles.input}>
                            <Label required htmlFor="courseName">
                                Course Name:
                            </Label>
                            <Input
                                required
                                type="text"
                                id="courseName"
                                name="courseName"
                                value={name}
                                maxLength={50}
                                onChange={(e) => setCourseName(e.target.value)}
                            />
                        </div>
                    </DialogContent>

                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary">Close</Button>
                        </DialogTrigger>
                        <Button type="submit" appearance="primary">
                            Create
                        </Button>
                    </DialogActions>
                </DialogBody>
            </form>
        </DialogSurface>
    );
};
