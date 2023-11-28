import { AssignmentCard, CourseSessionChip } from '@/components';
// import { type Course, getCourses } from '@/contexts/UserContext';
import axios from "@/axios";
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
    Title1,
    Title3,
    Toolbar,
    ToolbarButton
} from "@fluentui/react-components";
import { Title2 } from '@fluentui/react-text';
import { FetchedCourseWithTiers } from "codetierlist-types";
import { notFound } from "next/navigation";
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from "react";
import styles from './page.module.css';
import { FetchedAssignmentWithTier } from "codetierlist-types";
import Error from 'next/error';
import {
    FolderRegular,
    EditRegular,
    OpenRegular,
    DocumentRegular,
    PeopleRegular,
    DocumentPdfRegular,
    VideoRegular,
  } from "@fluentui/react-icons";
  import {
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableHeader,
    TableHeaderCell,
    TableCellLayout,
    PresenceBadgeStatus,
    Avatar,
  } from "@fluentui/react-components";

// import { notFound } from 'next/navigation';
import { Add24Filled, Shield24Filled, PersonAdd24Regular } from '@fluentui/react-icons';
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
                    <DialogTitle>Create Assignment</DialogTitle>
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Split the input text into lines
        const lines = csvText.split('\n');

        // Initialize an array to store the extracted data
        const data: string[] = [];

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
        axios.post(`/courses/${courseID}/enroll`, { utorids: data, role: "STUDENT" })
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
                        <Title2 style={{ marginBottom: 7 }}>Enroll Students</Title2><br/>
                        <Title3 style={{ fontSize: 18 }}>Input a list of students</Title3>
                        <Textarea
                            id="csvText"
                            placeholder="utorid1,utorid2,utorid3,..."
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
    const [assignment, setAssignment] = useState<FetchedAssignmentWithTier | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [showEnrollDialog, setShowEnrollDialog] = useState(false);
    const router = useRouter();

    // TODO: guard against invalid courseID, invalid assignmentID
    const { courseID, assignmentID } = router.query;

    const fetchAssignment = async () => {
        await axios.get<FetchedAssignmentWithTier>(`/courses/${courseID}/assignments/${assignmentID}`, { skipErrorHandling: true }).then((res) => setAssignment(res.data)).catch(e => {
            // console.log(e);
            notFound();
        });
    };

    useEffect(() => {
        if (!courseID || !assignmentID) {
            return;
        }
        void fetchAssignment();
    }, [courseID, assignmentID]);

    if (!courseID || !assignmentID) {
        return <Error statusCode={404} />;
    }
    if (!assignment) {
        return <p>Loading...</p>;
    }

    // Hard coded data; change later
    const items = [
        {
        utorid: { label: "zhan8725" },
        gitRepo: { label: "https://github.com/" },
        bestMark: { label: "13/20" },
        placeholder: { label: "" },
        },
        {
        utorid: { label: "zhan8725" },
        gitRepo: { label: "https://github.com/" },
        bestMark: { label: "15/20" },
        placeholder: { label: "" },
        },
        {
        utorid: { label: "zhan8725" },
        gitRepo: { label: "https://github.com/" },
        bestMark: { label: "9/20" },
        placeholder: { label: "" },
        },
        {
        utorid: { label: "zhan8725" },
        gitRepo: { label: "https://github.com/" },
        bestMark: { label: "17/20" },
        placeholder: { label: "" },
        },
    ];

    const columns = [
        { columnKey: "utorid", label: "UTORid" },
        { columnKey: "gitRepo", label: "GitHub Repository" },
        { columnKey: "bestMark", label: "Best Mark" },
        { columnKey: "placeholder", label: "Placeholder" },
    ];

    const openRepo = (url: string) => () => {
        window.open(url, '_blank');
      };

    return (
        <>
            {
                userInfo.admin ? (
                    <Toolbar
                        aria-label="Large Toolbar"
                        size="large"
                        className={styles.toolbar}
                    >
                        <ToolbarButton
                            appearance="primary"
                            icon={<Shield24Filled />}
                            onClick={() => router.push(`/courses/${courseID}/admin`)}
                        >
                            Admin page
                        </ToolbarButton>

                        <ToolbarButton
                            appearance="subtle"
                            icon={<PersonAdd24Regular />}
                            onClick={() => setShowEnrollDialog(true)}
                        >
                            Enroll Students
                        </ToolbarButton>

                        <ToolbarButton
                            appearance="subtle"
                            icon={<Add24Filled />}
                            onClick={() => setShowDialog(true)}
                        >
                            Add assignment
                        </ToolbarButton>
                    </Toolbar>
                ) : undefined
            }


            <main>
                <header className={styles.header}>
                    <Title2>
                        <CourseSessionChip session="Fall">
                            {courseID}
                        </CourseSessionChip>
                    </Title2>
                    <Title2>
                        {assignment.title}
                    </Title2>
                </header>

                <Table arial-label="Default table">
                <TableHeader>
                    <TableRow>
                    {columns.map((column) => (
                        <TableHeaderCell key={column.columnKey}>
                        {column.label}
                        </TableHeaderCell>
                    ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                    <TableRow key={item.utorid.label}>
                        <TableCell> {item.utorid.label} </TableCell>
                        <TableCell onClick={openRepo(item.gitRepo.label)} style={{ cursor: 'pointer', textDecoration: 'underline' }}> Link </TableCell>
                        <TableCell> {item.bestMark.label} </TableCell>
                        <TableCell> {item.placeholder.label} </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </main >
        </>
    );
}
