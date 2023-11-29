import axios, { handleError } from "@/axios";
import { HeaderToolbar } from "@/components";
import { SnackbarContext } from "@/contexts/SnackbarContext";
import { UserContext } from "@/contexts/UserContext";
import {
    Button,
    Input,
    Label,
    Textarea, Title2, ToolbarButton
} from "@fluentui/react-components";
import { ArrowLeft24Regular } from '@fluentui/react-icons';
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useState } from "react";

export default function Page(): JSX.Element {
    const { showSnackSev } = useContext(SnackbarContext);
    const [assignmentName, setAssignmentName] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState(new Date());
    const { courseID } = useRouter().query;
    const { fetchUserInfo } = useContext(UserContext);

    const router = useRouter();

    const submitAssignment = async () => {
        axios.post(`/courses/${courseID}/assignments`, {
            name: assignmentName,
            description: description,
            dueDate: dueDate.toISOString()
        })
            .then(fetchUserInfo)
            .then(() => router.push(`/courses/${courseID}`))
            .catch((error) => { handleError(error.message, showSnackSev); });
    };

    return (
        <>
            <Head>
                <title>Create Assignment - Codetierlist</title>
            </Head>

            <HeaderToolbar>
                <ToolbarButton
                    icon={<ArrowLeft24Regular />}
                    onClick={() => router.push(`/courses/${router.query.courseID}`)}
                >
                    Back
                </ToolbarButton>
            </HeaderToolbar>

            <main>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    submitAssignment();
                }}>
                    <Title2 block>Create Assignment</Title2>

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

                    <Button type="submit"
                        appearance="primary">Create</Button>
                </form>
            </main>
        </>
    );
}
