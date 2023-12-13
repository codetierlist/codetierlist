import axios, { handleError } from "@/axios";
import { ControlCard, HeaderToolbar, ToolTipIcon } from "@/components";
import { SnackbarContext } from "@/contexts/SnackbarContext";
import { UserContext } from "@/contexts/UserContext";
import {
    Button, Dropdown,
    Input,
    Label,
    Option,
    OptionGroup,
    Textarea, Title2, ToolbarButton
} from "@fluentui/react-components";
import {
    ArrowLeft24Regular, QuestionCircle16Regular,
    QuestionCircle24Regular
} from '@fluentui/react-icons';
import { RunnerImage } from "codetierlist-types";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Container } from "react-grid-system";

import styles from "./page.module.css";

export default function Page(): JSX.Element {
    const { showSnackSev } = useContext(SnackbarContext);
    const [assignmentName, setAssignmentName] = useState("");
    const [description, setDescription] = useState("");
    const [runners, setRunners] = useState<Record<string, string[]>>({});
    const [selectedRunner, setSelectedRunner] = useState<RunnerImage | null>(null);
    const [dueDate, setDueDate] = useState(new Date());
    const { courseID } = useRouter().query;
    const { fetchUserInfo } = useContext(UserContext);

    const router = useRouter();

    const submitAssignment = async () => {
        axios.post(`/courses/${courseID}/assignments`, {
            name: assignmentName,
            description: description,
            dueDate: dueDate.toISOString(),
            ...selectedRunner
        })
            .then(fetchUserInfo)
            .then(() => router.push(`/courses/${courseID}`))
            .catch((error) => {
                handleError(error.message, showSnackSev);
            });
    };

    const fetchRunners = async () => {
        const res = await axios.get<RunnerImage[]>("/runner/images");
        setRunners(res.data.reduce((a, x) => {
            a[x.image] = a[x.image] ?? [];
            a[x.image].push(x.image_version);
            return a;
        }, {} as Record<string, string[]>));
        setSelectedRunner(res.data[0]);
    };
    useEffect(() => {
        void fetchRunners();
    }, []);

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

            <Container component="main" className={styles.main}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    void submitAssignment();
                }}>
                    <Title2 className={styles.title} block>Create Assignment</Title2>

                    <ControlCard
                        title="Name"
                        icon={<QuestionCircle24Regular />}
                        htmlFor="name">
                        <Input required type="text" id="name" name="courseCode"
                            value={assignmentName}
                            onChange={e => setAssignmentName(e.target.value)} />
                    </ControlCard>

                    <Label htmlFor="description">Description:</Label><br />
                    <Textarea required id="description" name="courseName"
                        value={description}
                        onChange={e => setDescription(e.target.value)} /><br />

                    <Label htmlFor="dueDate">Due Date:</Label><br />
                    <Input required type="datetime-local" id="dueDate"
                        name="dueDate"
                        value={dueDate.toISOString().slice(0, -8)}
                        onChange={e => setDueDate(new Date(e.target.value))} /><br />
                    <Label htmlFor="runner">Runner image
                        <ToolTipIcon
                            tooltip={"The runner image is the image that the runners use to run uploaded code. If you think an image is missing please contact the maintainers."}
                            icon={<QuestionCircle16Regular />} />
                    </Label>
                    <br />
                    <Dropdown id="runner" name="runner"
                        value={selectedRunner?.image + "/" + selectedRunner?.image_version}
                        onOptionSelect={(_, data) => setSelectedRunner(JSON.parse(data.optionValue ?? "undefined") as RunnerImage)}
                    >{Object.keys(runners).map(image => <OptionGroup
                        label={image} key={image}>
                        {runners[image].map(version =>
                            <Option key={`${image}/${version}`}
                                text={`${image}/${version}`}
                                value={JSON.stringify({ image, image_version: version })}>
                                {image}/{version}
                            </Option>
                        )}
                    </OptionGroup>)}
                    </Dropdown>


                    <Button type="submit"
                        appearance="primary">Create</Button>
                </form>
            </Container>
        </>
    );
}
