import axios from "@/axios";
import {
    TierChip,
    TierList,
    colourHash,
    convertDate,
    convertTime
} from '@/components';
import flex from '@/styles/flex-utils.module.css';
import {
    Button, Card, CardHeader,
    MessageBar,
    MessageBarActions,
    MessageBarBody,
    MessageBarTitle,
    Tab, TabList, Title3
} from '@fluentui/react-components';
import { Add16Regular, Clock16Regular } from '@fluentui/react-icons';
import { Subtitle2, Title1, Title2 } from '@fluentui/react-text';
import Editor from '@monaco-editor/react';
import { FetchedAssignmentWithTier, TestCase, Tierlist } from "codetierlist-types";
import Error from 'next/error';
import { notFound } from "next/navigation";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Col, Container, Row } from "react-grid-system";
import styles from './page.module.css';

// TODO: clean technical debt

const UploadHeader = ({ title, action }: { title: string, action: () => void }) => {
    return (
        <div className={`${flex["d-flex"]} ${flex["justify-content-between"]}`}>
            <Title1>{title}</Title1>
            <Button appearance="subtle" onClick={() => action()}
                icon={<Add16Regular />}>
                Upload {title.toLowerCase()}
            </Button>
        </div>
    );
};

const NoUploadPlaceholder = ({ title }: { title: string }) => {
    return (
        <div className={`${flex["d-flex"]} ${flex["flex-column"]} ${flex["align-items-center"]} ${flex["justify-content-center"]}`}>
            <Title2>
                Nothing to see here...
            </Title2>
            <p>
                Upload a {title} to get started!
            </p>
        </div>
    );
};

const uploader = (url: string, fetchAssignment: () => void, setContent: (content: string) => void) => () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.type = 'file';
    input.name = 'files';
    input.oninput = async () => {
        const formData = new FormData();
        const filesLength = input.files!.length;
        for (let i = 0; i < filesLength; i++) {
            formData.append("files", input.files![i]);
        }
        await axios.post<void>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        document.body.removeChild(form);
        // read file
        const reader = new FileReader();
        reader.readAsText(input.files![0]);
        reader.onloadend = () => {
            console.log(reader.result);
            setContent(reader.result as string);
        };
        setContent("Loading...");
        fetchAssignment();
    };
    document.body.append(form);
    input.click();
};

const TestUpload = ({ uploadedTests, fetchAssignment, content, setContent }: { uploadedTests: unknown[], fetchAssignment: () => void, content: string, setContent: (content: string) => void }) => {
    const router = useRouter();
    const { courseID, assignmentID } = router.query;
    return (
        <Col sm={12}>
            <UploadHeader
                title="Test"
                action={
                    uploader(`/courses/${courseID}/assignments/${assignmentID}/testcases`, fetchAssignment, setContent)
                }
            />

            <Card className={styles.editor}>
                {/* {uploadedTests.length === 0 ? ( */}
                {content === null ? (
                    <NoUploadPlaceholder title="test" />
                ) : (
                    <Editor
                        defaultLanguage="python"
                        defaultValue={content}
                        height="90vh"
                        options={{ readOnly: true }}
                        theme="light"
                    />
                )}
            </Card>
        </Col>
    );
};
const SolutionUpload = (
    { uploadedSolutions,
        fetchAssignment,
        content,
        setContent
    }: {
        uploadedSolutions: unknown[],
        fetchAssignment: () => void,
        content: string,
        setContent: (content: string) => void
    }) => {
    const router = useRouter();
    const { courseID, assignmentID } = router.query;
    return (
        <Col sm={12}>
            <UploadHeader
                title="Solution"
                action={
                    uploader(`/courses/${courseID}/assignments/${assignmentID}/submissions`, fetchAssignment, setContent)
                }
            />

            <Card className={styles.editor}>
                {
                    // uploadedSolutions.length === 0 ? (
                    content === null ? (
                        <NoUploadPlaceholder title="solution" />
                    ) :
                        (
                            <Editor
                                defaultLanguage="python"
                                defaultValue={content}
                                height="90vh"
                                options={{ readOnly: true }}
                                theme="light"
                            />
                        )
                }

            </Card>
        </Col>
    );
};

const ViewTierList = ({ tierlist }: { tierlist: Tierlist }) => {
    return (
        <Col sm={12} lg={8} mt={4}>
            <Title2>
                Tier List
            </Title2>
            <Card>
                {/*TODO show actual tierlist*/}
                <TierList tierlist={tierlist} />
            </Card>
        </Col>
    );
};

export default function Page() {
    const router = useRouter();
    const [stage, setStage] = useState(0);
    const [assignment, setAssignment] = useState<FetchedAssignmentWithTier | null>(null);
    const [tierlist, setTierlist] = useState<Tierlist | null>(null);
    const [solutionContent, setSolutionContent] = useState<string | null>(null);
    const [testContent, setTestContent] = useState<string | null>(null);

    // TODO: guard against invalid courseID, invalid assignmentID
    const { courseID, assignmentID } = router.query;

    const fetchAssignment = async () => {
        await axios.get<FetchedAssignmentWithTier>(`/courses/${courseID}/assignments/${assignmentID}`, { skipErrorHandling: true }).then((res) => setAssignment(res.data)).catch(e => {
            // console.log(e);
            notFound();
        });
    };
    const fetchTierlist = async () => {
        await axios.get<Tierlist>(`/courses/${courseID}/assignments/${assignmentID}/tierlist`, { skipErrorHandling: true }).then((res) => setTierlist(res.data)).catch(e => {
            // console.log(e);
            notFound();
        });
    };
    useEffect(() => {
        if (!courseID || !assignmentID) {
            return;
        }
        void fetchAssignment();
        void fetchTierlist();
    }, [courseID, assignmentID]);

    if (!courseID || !assignmentID) {
        return <Error statusCode={404} />;
    }
    if (!assignment) {
        return <p>Loading...</p>;
    }
    return (
        <>
            <TabList className={styles.tabList} size="large" selectedValue={`tab${stage}`}>
                <Tab value="tab0" onClick={() => setStage(0)}>
                    Assignment details
                </Tab>
                <Tab value="tab1" onClick={() => setStage(1)}>
                    Submit a test
                </Tab>
                <Tab value="tab2" onClick={() => setStage(2)}>
                    Upload a solution
                </Tab>
                <Tab value="tab3" onClick={() => setStage(3)} disabled={testContent === null || solutionContent === null}>
                    View tier list
                </Tab>
            </TabList>
            <Container fluid component="main">
                {
                    stage === 0 && (
                        <>
                            <Row>
                                <Col sm={12}>
                                    <Card className={styles.header} orientation="horizontal">
                                        <CardHeader
                                            className={styles.assignmentHeaderContent}
                                            header={
                                                <div className={styles.assignmentHeaderContent}>
                                                    <Subtitle2 className={styles.dueDate}>
                                                        <Clock16Regular
                                                            className={styles.dueDateIcon} />
                                                        Due {convertDate(assignment.due_date)} at {convertTime(assignment.due_date)}
                                                    </Subtitle2>
                                                    <Title2>
                                                        <span
                                                            className={`${colourHash(courseID as string)} ${styles.courseCode}`}>
                                                            {courseID}
                                                        </span>
                                                        {assignment.title}
                                                    </Title2>
                                                </div>
                                            }
                                            action={
                                                <TierChip tier={testContent !== null && solutionContent !== null ? "B" : "?"} />
                                            }
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            <Row>
                                <Col sm={12} lg={4} md={4} className={styles.sidebarCards}>
                                    <Card>
                                        <CardHeader
                                            header={<Title3>Uplodaded Tests</Title3>}
                                        />
                                        {
                                            assignment.test_cases.length === 0 && (
                                                <p>No tests uploaded yet</p>
                                            )
                                        }
                                        <ul className={"d-flex flex-column " + styles.uploadedTests}>
                                            {assignment.test_cases.map((test: TestCase, index: number) => (
                                                // TODO this is not very informative
                                                <li className={styles.uploadedTest}
                                                    key={index}>{test.git_id}</li>
                                            ))}
                                        </ul>
                                    </Card>

                                    <Card>
                                        <CardHeader
                                            header={<Title3>Uplodaded Solutions</Title3>}
                                        />
                                        {
                                            assignment.submissions.length === 0 && (
                                                <p>No solutions uploaded yet</p>
                                            )
                                        }
                                        <ul className={"d-flex flex-column " + styles.uploadedSolutions}>
                                            {assignment.submissions.map((test: TestCase, index: number) => (
                                                <li className={styles.uploadedTest}
                                                    key={index}>{test.git_id}</li>
                                            ))}
                                        </ul>
                                    </Card>
                                </Col>
                                <Col sm={12} lg={8} md={8}>
                                    {solutionContent === null && (
                                        <MessageBar intent={"warning"} className={styles.messageBar}>
                                            <MessageBarBody>
                                                <MessageBarTitle>You have not submitted a solution yet.</MessageBarTitle>
                                                You can submit a solution by clicking on the "Upload a solution" tab.
                                                You will not be able to see the tier list until you submit a solution.
                                            </MessageBarBody>
                                            <MessageBarActions>
                                                <Button onClick={() => setStage(2)}>Upload a solution</Button>
                                            </MessageBarActions>
                                        </MessageBar>
                                    )}

                                    {testContent === null && (
                                        <MessageBar intent={"warning"} className={styles.messageBar}>
                                            <MessageBarBody>
                                                <MessageBarTitle>You have not submitted a test yet.</MessageBarTitle>
                                                You can submit a test by clicking on the "Submit a test" tab.
                                                You will not be able to see the tier list until you submit a test.
                                            </MessageBarBody>
                                            <MessageBarActions
                                            >
                                                <Button onClick={() => setStage(1)}>Submit a test</Button>
                                            </MessageBarActions>
                                        </MessageBar>
                                    )}

                                    <Card>
                                        <CardHeader
                                            header={<Title3>Assignment Description</Title3>}
                                        />
                                        <p>
                                            {assignment.description}
                                        </p>
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    )
                }{
                    stage === 1 && (
                        <Row>
                            <TestUpload
                                uploadedTests={assignment.test_cases}
                                fetchAssignment={fetchAssignment}
                                content={testContent ?? ""}
                                setContent={setTestContent} />
                        </Row>
                    )
                }{
                    stage === 2 && (
                        <Row>
                            <SolutionUpload
                                uploadedSolutions={assignment.submissions}
                                fetchAssignment={fetchAssignment}
                                content={solutionContent ?? ""}
                                setContent={setSolutionContent} />
                        </Row>
                    )
                }{
                    stage === 3 && (
                        tierlist ?
                            <ViewTierList tierlist={tierlist} /> : "No tierlist found"
                    )
                }
            </Container >
        </>
    );
}
