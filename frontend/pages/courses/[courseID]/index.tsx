import { AssignmentCard, CourseSessionChip } from '@/components';
// import { type Course, getCourses } from '@/contexts/UserContext';
import styles from './page.module.css';
import { Title2 } from '@fluentui/react-text';
import axios from "@/axios";
import { FetchedCourseWithTiers } from "codetierlist-types";
import { useContext, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useRouter } from "next/router";
import { UserContext } from "@/contexts/UserContext";
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
    Textarea,
<<<<<<< HEAD
    Title3
=======
    Title1
>>>>>>> 6da6e4901afe2d71166e4a5308a41ed81af007d7
} from "@fluentui/react-components";
import { CourseBlockLarge } from '@/components/CourseBlock/CourseBlockLarge';

// import { notFound } from 'next/navigation';
// TODO this code is duplicated from course page
function CreateAssignmentForm({ closeDialog }: { closeDialog: () => void }) {
    const [assignmentName, setAssignmentName] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState(new Date());
    const { courseID } = useRouter().query;
    const { fetchUserInfo } = useContext(UserContext);
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
                        <Label htmlFor="name">Name:</Label><br />
                        <Input type="text" id="name" name="courseCode"
                            value={assignmentName}
                            onChange={e => setAssignmentName(e.target.value)} /><br />
                        <Label htmlFor="description">Description:</Label><br />
                        <Textarea id="description" name="courseName"
                            value={description}
                            onChange={e => setDescription(e.target.value)} /><br />
                        <Label htmlFor="dueDate">Due Date:</Label><br />
                        <Input type="datetime-local" id="dueDate" name="dueDate"
                            value={dueDate.toISOString().slice(0, -8)}
                            onChange={e => setDueDate(new Date(e.target.value))} />
                        <br /><br />
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

function parseFileContent(content: string) {

}

function EnrollStudentsForm({ closeDialog }: { closeDialog: () => void }) {
    const [csvText, setCsvText] = useState("");
    const { courseID } = useRouter().query;
    const { fetchUserInfo } = useContext(UserContext);
  
    const handleSubmit = (e) => {
      e.preventDefault();
    
      // Split the input text into lines
      const lines = csvText.split('\n');
  
      // Initialize an array to store the extracted data
      const data :string[]= [];
  
      lines.forEach((line) => {
        // Split each line by a comma
        const [utorid] = line.trim().split('\n');
  
        // Check if both utorid and role exist
        if (utorid) {
          // Push the data to the array
          data.push(utorid);
        }
      });
  
      // Now 'data' contains an array of objects with 'utorid' and 'role'
  
      // Send 'data' to the server endpoint using axios or your preferred method
      axios.post(`/courses/${courseID}/enroll`, { utorids: data, role:"STUDENT" })
        .then(() => {
          fetchUserInfo();
          closeDialog();
        })
        .catch((error) => {
          console.error("Error sending data to the server:", error);
        });
    };
  
    return (
      <DialogSurface>
        <DialogBody>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Title2 style={{ marginBottom: 7 }}>Enroll Students</Title2>
              <Title3 style={{ fontSize: 18 }}>Input a list of students</Title3>
              <Textarea
                id="csvText"
                placeholder="utorid,role"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                required
              />
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Close</Button>
              </DialogTrigger>
              <Button type="submit" appearance="primary">Submit</Button>
            </DialogActions>
          </form>
        </DialogBody>
      </DialogSurface>
    );
  }

export default function Page() {
    const { userInfo } = useContext(UserContext);
    const [course, setCourse] = useState<FetchedCourseWithTiers | null>(null);
    const { courseID } = useRouter().query;
    const [showDialog, setShowDialog] = useState(false);

    const fetchCourse = async () => {
        if (!courseID) return;
        await axios.get<FetchedCourseWithTiers>(`/courses/${courseID}`, { skipErrorHandling: true }).then((res) => setCourse(res.data)).catch(e => {
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
                {userInfo.admin ?
                    <Dialog open={showDialog}
                        onOpenChange={(e: DialogOpenChangeEvent, data: DialogOpenChangeData) => setShowDialog(data.open)}>
                        <DialogTrigger disableButtonEnhancement>
                            <Button><Title1>+</Title1></Button>
                        </DialogTrigger>
                        <CreateAssignmentForm
                            closeDialog={() => fetchCourse().then(() => setShowDialog(false))} />
                    </Dialog>
                    : undefined}
            </div>
        </main>
    );
}