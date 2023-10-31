import { Dialog, Divider, Input, Title2, Title3, Card, Button, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Title1 } from "@fluentui/react-components";
import styles from "./AddAssignmentModal.module.css";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { AddCourseButton } from "../AddCourseButton/AddCourseButton";
import * as React from "react";

export const AddAssignmentModal = (): JSX.Element => {
    //const styles = useStyles();
    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        alert("form submitted!");
    };  // TODO
    return (
        <Dialog>
            <DialogTrigger>
                <Button style={{width: 260, height: 75}}>
                    <Title1>+</Title1>
                </Button>
            </DialogTrigger>
            <DialogSurface style={{height: "50%"}}>
                <form onSubmit={handleSubmit}>
                    <DialogBody>
                        <DialogContent style={{display: "flex", flexDirection: "column"}}>
                            <Title2 style={{marginBottom: 7}}>Create Assignment</Title2>
                            <Title3 style={{fontSize: 18}}>Name</Title3>
                            <Input style={{marginBottom: 10}} required/>
                            <Title3 style={{fontSize: 18}}>Due Date</Title3>
                            <DatePicker style={{marginBottom: 6}} />
                            <Title3 style={{fontSize: 18}}>Solution</Title3>
                            <input type="file" required/>
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






// export const AddAssignmentModal = (): JSX.Element => {
//     return (
//         <Dialog className={styles.modal}>
//             <Title2>Create Assignment</Title2>
//             <Divider></Divider>

//         </Dialog>
//     )
// };

{/* <Title3>Name</Title3>
            <Input/>
            <Title3>Due Date</Title3>
            <DatePicker />
            <Title3>Solution</Title3>
            <input type="file" /> */}
