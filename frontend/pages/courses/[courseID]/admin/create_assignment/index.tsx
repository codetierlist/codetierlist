import axios, { handleError } from '@/axios';
import { ControlCard, HeaderToolbar, Monaco, checkIfCourseAdmin } from '@/components';
import { SnackbarContext } from '@/contexts/SnackbarContext';
import { UserContext } from '@/contexts/UserContext';
import {
    Button,
    Caption1,
    Card,
    CardHeader,
    Dropdown,
    Input,
    Label,
    Option,
    OptionGroup,
    Switch,
    Title3,
    ToolbarButton,
} from '@fluentui/react-components';
import {
    ArrowLeft24Regular,
    Calendar24Regular,
    ClipboardTextLtr24Regular,
    People24Regular,
    Rename24Regular,
    Run24Regular,
    TextDescription24Regular,
} from '@fluentui/react-icons';
import { RunnerImage } from 'codetierlist-types';
import Error from 'next/error';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { Container } from 'react-grid-system';
import styles from './page.module.css';

/**
 * Converts an ISO string to a date object
 */
const updateTimezoneOffset = (date: string) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d;
};

/**
 * Custom hook to fetch the runner images
 */
const useRunners = () => {
    const [runners, setRunners] = useState<Record<string, string[]>>({});
    const [selectedRunner, setSelectedRunner] = useState<RunnerImage | null>(null);
    const { showSnackSev } = useContext(SnackbarContext);

    useEffect(() => {
        const fetchRunners = async () => {
            const res = await axios.get<RunnerImage[]>('/runner/images').catch((e) => {
                handleError(showSnackSev)(e);
            });
            if (!res) {
                return;
            }
            setRunners(
                res.data.reduce(
                    (acc, runner) => {
                        acc[runner.runner_image] = acc[runner.runner_image] ?? [];
                        acc[runner.runner_image].push(runner.image_version);
                        return acc;
                    },
                    {} as Record<string, string[]>
                )
            );

            setSelectedRunner(res.data[0]);
        };

        void fetchRunners();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { runners, setSelectedRunner, selectedRunner };
};

export default function Page(): JSX.Element {
    const { showSnackSev } = useContext(SnackbarContext);
    const [assignmentName, setAssignmentName] = useState('');
    const [description, setDescription] = useState('');
    const { runners, setSelectedRunner, selectedRunner } = useRunners();
    const [dueDate, setDueDate] = useState(new Date());
    const { courseID } = useRouter().query;
    const { fetchUserInfo } = useContext(UserContext);
    const [groupSize, setGroupSize] = useState<number | null>(null);
    const [strictDeadlines, setStrictDeadlines] = useState(false);
    const { userInfo } = useContext(UserContext);
    const router = useRouter();

    /**
     * Exports the assignment to a JSON file and copies it to the clipboard
     */
    const exportFormData = async () => {
        const serialized = JSON.stringify({
            name: assignmentName,
            description: description,
            dueDate: dueDate.toISOString(),
            groupSize,
            strictDeadlines,
            ...selectedRunner,
        });

        await navigator.clipboard
            .writeText(serialized)
            .catch((e) => {
                showSnackSev(`Failed to write to clipboard: ${e.message}`, 'error');
            })
            .then(() => {
                showSnackSev('Copied to clipboard', 'success');
            });
    };

    /**
     * Imports the assignment from a JSON file in the clipboard
     */
    const importFormData = async () => {
        const serialized = await navigator.clipboard.readText().catch((e) => {
            showSnackSev(`Failed to read from clipboard: ${e.message}`, 'error');
            return '';
        });

        let data;

        try {
            data = JSON.parse(serialized);
        } catch (e) {
            showSnackSev('Invalid JSON', 'error');
            return;
        }

        if (
            !data.name ||
            !data.description ||
            !data.dueDate ||
            !data.image ||
            !data.image_version
        ) {
            showSnackSev('Invalid assignment data', 'error');
            return;
        }

        setAssignmentName(data.name);
        setDescription(data.description);
        setStrictDeadlines(data.strictDeadlines);
        setDueDate(new Date(data.dueDate));
        setGroupSize(data.groupSize);
        setSelectedRunner(data);
    };

    /**
     * Submits the assignment to the backend
     */
    const submitAssignment = async () => {
        if (!description) {
            showSnackSev('Description is required', 'error');
            return;
        }

        axios
            .post(`/courses/${courseID}/assignments`, {
                name: assignmentName,
                description: description,
                dueDate: dueDate.toISOString(),
                groupSize,
                strictDeadlines,
                ...selectedRunner,
            })
            .then(fetchUserInfo)
            .then(() => router.push(`/courses/${courseID}`))
            .catch((e) => {
                handleError(showSnackSev)(e);
            });
    };

    // If the user is not an admin, error 403
    if (!checkIfCourseAdmin(userInfo, courseID as string)) {
        return <Error statusCode={403} />;
    }

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
                    Back to Course
                </ToolbarButton>
                <ToolbarButton
                    appearance="subtle"
                    icon={<ClipboardTextLtr24Regular />}
                    onClick={
                        assignmentName && description && selectedRunner
                            ? exportFormData
                            : importFormData
                    }
                >
                    {assignmentName && description && selectedRunner
                        ? 'Export Assignment to Clipboard'
                        : 'Import Assignment from Clipboard'}
                </ToolbarButton>
            </HeaderToolbar>

            <Container component="main" className="p-y-xxxl">
                <form
                    className={styles.form}
                    onSubmit={(e) => {
                        e.preventDefault();
                        void submitAssignment();
                    }}
                >
                    <Title3 className={styles.title} block>
                        Create Assignment
                    </Title3>

                    <ControlCard
                        required
                        title="Name"
                        description="The name that will be displayed to the students."
                        icon={<Rename24Regular />}
                        htmlFor="name"
                    >
                        <Input
                            required
                            type="text"
                            id="name"
                            name="courseCode"
                            value={assignmentName}
                            onChange={(e) => setAssignmentName(e.target.value)}
                        />
                    </ControlCard>

                    <ControlCard
                        required
                        title="Due date"
                        description="The date and time when the assignment is due."
                        icon={<Calendar24Regular />}
                        htmlFor="dueDate"
                    >
                        <Input
                            required
                            type="datetime-local"
                            id="dueDate"
                            name="dueDate"
                            value={dueDate.toISOString().slice(0, -8)}
                            onChange={(e) => {
                                // check if the date is valid
                                if (
                                    new Date(e.target.value).toString() !== 'Invalid Date'
                                )
                                    setDueDate(updateTimezoneOffset(e.target.value));
                            }}
                        />
                    </ControlCard>
                    <ControlCard
                        title="Strict deadlines"
                        description="If strict deadlines are enabled, students will not be able to submit after the due date."
                        icon={<Calendar24Regular />}
                        htmlFor="strictDeadlines"
                    >
                        <Switch
                            id="strictDeadlines"
                            label={strictDeadlines ? 'On' : 'Off'}
                            labelPosition="before"
                            checked={strictDeadlines}
                            onChange={(_, data) =>
                                setStrictDeadlines(data.checked ?? false)
                            }
                        />
                    </ControlCard>
                    <ControlCard
                        required
                        title="Runner image"
                        description="The runner image is the image that the runners use to run uploaded code. If you think an image is missing please contact the maintainers."
                        icon={<Run24Regular />}
                        htmlFor="runner"
                    >
                        <Dropdown
                            id="runner"
                            name="runner"
                            value={
                                selectedRunner?.runner_image +
                                '/' +
                                selectedRunner?.image_version
                            }
                            onOptionSelect={(_, data) =>
                                setSelectedRunner(
                                    data.optionValue
                                        ? (JSON.parse(data.optionValue) as RunnerImage)
                                        : selectedRunner
                                )
                            }
                        >
                            {Object.keys(runners).map((image) => (
                                <OptionGroup label={image} key={image}>
                                    {runners[image].map((version) => (
                                        <Option
                                            key={`${image}/${version}`}
                                            text={`${image}/${version}`}
                                            value={JSON.stringify({
                                                runner_image: image,
                                                image_version: version,
                                            })}
                                        >
                                            {image}/{version}
                                        </Option>
                                    ))}
                                </OptionGroup>
                            ))}
                        </Dropdown>
                    </ControlCard>

                    <ControlCard
                        title="Group size"
                        description="The maximum number of students that can be in a group. Students in groups will be tested against each other. "
                        icon={<People24Regular />}
                        htmlFor="groupSize"
                    >
                        <Input
                            type="number"
                            min={0}
                            id="groupSize"
                            name="groupSize"
                            value={groupSize ? groupSize.toString() : ''}
                            onChange={(e) =>
                                setGroupSize(
                                    isNaN(e.target.valueAsNumber)
                                        ? null
                                        : e.target.valueAsNumber
                                )
                            }
                        />
                    </ControlCard>

                    <Card size="large">
                        <CardHeader
                            image={<TextDescription24Regular />}
                            header={
                                <Label
                                    required
                                    className={styles.semibold}
                                    htmlFor="description"
                                >
                                    Description
                                </Label>
                            }
                            description={
                                <Caption1>
                                    The description is displayed to the students.
                                </Caption1>
                            }
                        />

                        <Monaco
                            value={description}
                            onChange={(value) => setDescription(value || '')}
                            language="markdown"
                            height="500px"
                        />
                    </Card>

                    <div className={styles.submit}>
                        <Button type="submit" appearance="primary">
                            Create
                        </Button>
                    </div>
                </form>
            </Container>
        </>
    );
}
