import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTrigger, Input, Title1, Title2, Title3 } from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import * as React from "react";
import styles from "./AddAssignmentModal.module.css";

export const AddAssignmentModal = (): JSX.Element => {
    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        alert("form submitted!");
    };  // TODO
    return (
        <Dialog>
            <DialogTrigger>
                <Button className={styles.plusButton}>
                    <Title1>+</Title1>
                </Button>
            </DialogTrigger>
            <DialogSurface style={{ height: "50%" }}>
                <form onSubmit={handleSubmit}>
                    <DialogBody>
                        <DialogContent style={{ display: "flex", flexDirection: "column" }}>
                            <Title2 style={{ marginBottom: 7 }}>Create Assignment</Title2>
                            <Title3 style={{ fontSize: 18 }}>Name</Title3>
                            <Input style={{ marginBottom: 10 }} required />
                            <Title3 style={{ fontSize: 18 }}>Due Date</Title3>
                            <DatePicker style={{ marginBottom: 6 }} />
                            <Title3 style={{ fontSize: 18 }}>Solution</Title3>
                            <input type="file" required />
                        </DialogContent>
                        <DialogActions>
                            <DialogTrigger disableButtonEnhancement>
                                <Button appearance="secondary">Close</Button>
                            </DialogTrigger>
                            <Button type="submit" appearance="primary">
                                Submit
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </form>
            </DialogSurface>
        </Dialog>
    );
};
