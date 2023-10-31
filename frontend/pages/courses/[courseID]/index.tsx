import {AssignmentCard, CourseSessionChip} from '@/components';
// import { type Course, getCourses } from '@/contexts/UserContext';
import styles from './page.module.css';
import {Title2} from '@fluentui/react-text';
import axios from "@/axios";
import {FetchedCourseWithTiers} from "codetierlist-types";
import {useContext, useEffect, useState} from "react";
import {notFound} from "next/navigation";
import {useRouter} from "next/router";
import {UserContext} from "@/contexts/UserContext";
import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogOpenChangeData,
    DialogOpenChangeEvent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Input,
    Label,
    Textarea
} from "@fluentui/react-components";

// import { notFound } from 'next/navigation';
// TODO this code is duplicated from course page
function CreateAssignmentForm({closeDialog}: { closeDialog: () => void }) {
    const [assignmentName, setAssignmentName] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState(new Date());
    const {courseID} = useRouter().query;
    const {fetchUserInfo} = useContext(UserContext);
    return (
        <DialogSurface>
            <DialogBody>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    axios.post(`/courses/${courseID}/assignments`, {
                        name: assignmentName,
                        description: description,
                        dueDate: dueDate.toISOString()
                    }).then(fetchUserInfo).then(closeDialog);
                }}>
                    <DialogTitle>Create Course</DialogTitle>
                    <DialogContent>
                        <Label htmlFor="name">Name:</Label><br/>
                        <Input type="text" id="name" name="courseCode"
                            value={assignmentName}
                            onChange={e => setAssignmentName(e.target.value)}/><br/>
                        <Label htmlFor="description">Description:</Label><br/>
                        <Textarea id="description" name="courseName"
                            value={description}
                            onChange={e => setDescription(e.target.value)}/><br/>
                        <Label htmlFor="dueDate">Due Date:</Label><br/>
                        <Input type="datetime-local" id="dueDate" name="dueDate"
                            value={dueDate.toISOString().slice(0, -8)}
                            onChange={e => setDueDate(new Date(e.target.value))}/>
                        <br/><br/>
                    </DialogContent>
                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary">Close</Button>
                        </DialogTrigger>
                        <Button type="submit"
                            appearance="primary">Create</Button>
                    </DialogActions>
                </form>
            </DialogBody>
        </DialogSurface>
    );
}

export default function Page() {
    const {userInfo} = useContext(UserContext);
    const [course, setCourse] = useState<FetchedCourseWithTiers | null>(null);
    const {courseID} = useRouter().query;
    const [showDialog, setShowDialog] = useState(false);


    const fetchCourse = async () => {
        if (!courseID) return;
        await axios.get<FetchedCourseWithTiers>(`/courses/${courseID}`, {skipErrorHandling: true}).then((res) => setCourse(res.data)).catch(e => {
            notFound();
        });
    };
    useEffect(() => {
        void fetchCourse();
    }, [courseID]);

    return (
        <main>
            <header className={styles.header}>
                <Title2>
                    <CourseSessionChip session="Fall">
                        {courseID}
                    </CourseSessionChip>
                </Title2>
                <Title2>
                    {course?.name || 'Course not found'}
                </Title2>
                {userInfo.admin ?
                    <Dialog open={showDialog}
                        onOpenChange={(e: DialogOpenChangeEvent, data: DialogOpenChangeData) => setShowDialog(data.open)}>
                        <DialogTrigger disableButtonEnhancement>
                            <Button>Create Assignment</Button>
                        </DialogTrigger>
                        <CreateAssignmentForm
                            closeDialog={() => fetchCourse().then(()=>setShowDialog(false))}/>
                    </Dialog>
                    : undefined}
            </header>
            <div className="flex-wrap">
                {course ? course.assignments.map((assignment) => (
                    <AssignmentCard key={assignment.title.replaceAll(" ", "_")}
                        id={assignment.title.replaceAll(" ", "_")}
                        name={assignment.title}
                        dueDate={assignment.due_date ? new Date(assignment.due_date) : undefined}
                        tier={assignment.tier}
                        courseID={courseID as string}
                    />
                )) : "Loading..."}
            </div>
        </main>
    );
}

// ---------------------------------------------

// export default function Home() {

//     return (
//         <main>
//             <div className="course">
//                 <div className="assignments" style={{ backgroundColor: 'red'}}>
//                     <p> hi hi hi</p>
//                 </div>
//                 <div>
//                     <p> yo yo yo</p>
//                 </div>
//             </div>
//         </main>
//     );
// }