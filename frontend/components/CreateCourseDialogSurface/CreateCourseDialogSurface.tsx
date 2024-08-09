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
    Dropdown,
    Input,
    Label,
    Option,
} from '@fluentui/react-components';
import { useContext, useState, forwardRef } from 'react';

import styles from './CreateCourseForm.module.css';

export declare type CreateCourseFormProps = {
    /** function to close the dialog */
    closeDialog: () => void;
};

/**
 * Form for creating a course
 */
export const CreateCourseDialogSurface = forwardRef(({ closeDialog }: CreateCourseFormProps, ref: React.Ref<HTMLDivElement>) => {
    let defaultSession;
    const date = new Date();
    const month = date.getMonth();
    if (month >= 8 && month <= 11) {
        defaultSession = 'FALL';
    } else if (month >= 0 && month <= 3) {
        defaultSession = 'WINTER';
    } else {
        defaultSession = 'SUMMER';
    }

    const [code, setCourseCode] = useState('');
    const [name, setCourseName] = useState('');
    const [session, setSession] = useState(defaultSession);
    const { fetchUserInfo } = useContext(UserContext);
    const { showSnack } = useContext(SnackbarContext);

    return (
        <DialogSurface ref={ref}>
            <form
                onSubmit={(event) => {
                    event.preventDefault();

                    axios
                        .post('/courses', { code, name, session })
                        .then(closeDialog)
                        .catch((e) => {
                            handleError(showSnack)(e);
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

                        <div className={styles.input}>
                            <Label required htmlFor={'courseSession'}>
                                Course Session:
                            </Label>
                            <Dropdown
                                id="courseSession"
                                name="courseSession"
                                value={session}
                                defaultValue={defaultSession}
                                onOptionSelect={(_, data) =>
                                    setSession(data.optionValue as string)
                                }
                            >
                                <Option value="FALL">Fall</Option>
                                <Option value="WINTER">Winter</Option>
                                <Option value="SUMMER">Summer</Option>
                            </Dropdown>
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
});

CreateCourseDialogSurface.displayName = 'CreateCourseDialogSurface';
