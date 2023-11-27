import axios, { handleError } from "@/axios";
import {
    TierChip,
    TierList,
    colourHash,
    convertDate,
    convertTime,
    promptForFileObject
} from '@/components';
import { SnackbarContext } from "@/contexts/SnackbarContext";
import flex from '@/styles/flex-utils.module.css';
import {
    Body1,
    Button, Caption1, Card, CardHeader,
    DataGrid,
    MessageBar,
    MessageBarActions,
    MessageBarBody,
    MessageBarTitle,
    Subtitle1,
    Tab, TabList,
    ToastIntent,
    PresenceBadgeStatus,
    Avatar,
    DataGridBody,
    DataGridRow,
    DataGridHeader,
    DataGridHeaderCell,
    DataGridCell,
    TableCellLayout,
    TableColumnDefinition,
    createTableColumn,
    TableRowId,
    DataGridProps,
} from '@fluentui/react-components';
import { Add16Regular, Add24Filled, Clock16Regular } from '@fluentui/react-icons';
import { Subtitle2, Title1, Title2 } from '@fluentui/react-text';
import Editor from '@monaco-editor/react';
import { Commit, FetchedAssignmentWithTier, TestCase, Tierlist } from "codetierlist-types";
import Error from 'next/error';
import Head from "next/head";
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { Col, Container } from "react-grid-system";
import styles from './page.module.css';

const TestUpload = ({ fetchAssignment, assignment, assignmentID }: { fetchAssignment: () => Promise<void>, assignment: FetchedAssignmentWithTier, assignmentID: string }) => {
    const [content, setContent] = useState<Commit>({} as Commit);
    const { showSnackSev } = useContext(SnackbarContext);

    const submitTest = async (file: File) => {
        axios.post(`/courses/${assignment.course_id}/assignments/${assignmentID}/testcases`, {
            files: [file]
        })
            .then(() => {
                fetchAssignment();
            });
    };

    const getTestData = async () => {
        await axios.get<Commit>(`/courses/${assignment.course_id}/assignments/${assignmentID}/testcases`, { skipErrorHandling: true })
            .then((res) => setContent(res.data))
            .catch(e => {
                handleError(e.message, showSnackSev);
                setContent({"files": {}, "log": {}} as Commit);
            });
    };

    useEffect(() => {
        void getTestData();
        console.log(content);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignmentID]);

    return (
        <>
            <Button
                icon={<Add24Filled />}
                onClick={async () => {
                    promptForFileObject(".py")
                        .then(file => {
                            if (file) {
                                submitTest(file);
                            }
                        })
                        .catch(e => {
                            handleError(e.message, showSnackSev);
                        });
                }}
            >
                Upload test
            </Button>

            <Col sm={12} lg={8} md={4}>
            </Col>
        </>
    );
};


const ViewTierList = ({ tierlist }: { tierlist: Tierlist }) => {
    return (
        <Col sm={12} lg={8} md={4}>
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
    const { showSnackSev } = useContext(SnackbarContext);
    const { courseID, assignmentID } = router.query;

    const fetchAssignment = async () => {
        await axios.get<FetchedAssignmentWithTier>(`/courses/${courseID}/assignments/${assignmentID}`, { skipErrorHandling: true })
            .then((res) => setAssignment(res.data))
            .catch(e => {
                handleError(e.message, showSnackSev);
                setStage(-404);
            });
    };
    const fetchTierlist = async () => {
        await axios.get<Tierlist>(`/courses/${courseID}/assignments/${assignmentID}/tierlist`, { skipErrorHandling: true })
            .then((res) => setTierlist(res.data))
            .catch(e => {
                handleError(e.message, showSnackSev);
                setStage(-404);
            });
    };

    useEffect(() => {
        if (!courseID || !assignmentID) {
            return;
        }
        void fetchAssignment();
        void fetchTierlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseID, assignmentID]);

    if (stage === -404) {
        return <Error statusCode={404} />;
    } else if (!assignment || !courseID || !assignmentID) {
        return <p>Loading...</p>;
    }


    return (
        <>
            <Head>
                <title>{assignment.title} - Codetierlist</title>
            </Head>

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
                <Tab value="tab3" onClick={() => setStage(3)} disabled={assignment.test_cases.length === 0 || assignment.submissions.length === 0}>
                    View tier list
                </Tab>
            </TabList>
            <Container component="main" className={styles.container}>
                {
                    stage === 0 && (
                        <>
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
                                        <TierChip tier={assignment.tier} />
                                    }
                                />
                            </Card>

                            {assignment.submissions.length === 0 && (
                                <MessageBar intent={"warning"} className={styles.messageBar}>
                                    <MessageBarBody>
                                        <MessageBarTitle>You have not submitted a solution yet.</MessageBarTitle>
                                        You can submit a solution by clicking on the &ldquo;Upload a solution&rdquo; tab.
                                        You will not be able to see the tier list until you submit a solution.
                                    </MessageBarBody>
                                    <MessageBarActions>
                                        <Button onClick={() => setStage(2)}>Upload a solution</Button>
                                    </MessageBarActions>
                                </MessageBar>
                            )}

                            {assignment.test_cases.length === 0 && (
                                <MessageBar intent={"warning"} className={styles.messageBar}>
                                    <MessageBarBody>
                                        <MessageBarTitle>You have not submitted a test yet.</MessageBarTitle>
                                        You can submit a test by clicking on &ldquo;Submit a test&rdquo; tab.
                                        You will not be able to see the tier list until you submit a test.
                                    </MessageBarBody>
                                    <MessageBarActions
                                    >
                                        <Button onClick={() => setStage(1)}>Submit a test</Button>
                                    </MessageBarActions>
                                </MessageBar>
                            )}

                            <Subtitle1 block>Assignment Description</Subtitle1>
                            <Card className={styles.gutter}>
                                <p>
                                    {assignment.description}
                                </p>
                            </Card>

                            <div className={`${flex["d-flex"]} ${flex["justify-content-between"]}`}>
                                <Subtitle1 block>Uplodaded Tests</Subtitle1>
                                <Button appearance="subtle" onClick={() => setStage(1)}
                                    icon={<Add16Regular />}>
                                    Upload a test
                                </Button>
                            </div>

                            <Card className={styles.gutter}>
                                {
                                    assignment.test_cases.length === 0 && (
                                        <>
                                            <Caption1>No tests uploaded yet</Caption1>
                                            <Body1>
                                                Click &ldquo;Submit a test&rdquo; to upload a test!
                                            </Body1>
                                        </>
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

                            <div className={`${flex["d-flex"]} ${flex["justify-content-between"]}`}>
                                <Subtitle1 block>Uploaded Solutions</Subtitle1>
                                <Button appearance="subtle" onClick={() => setStage(2)}
                                    icon={<Add16Regular />}>
                                    Upload a solution
                                </Button>
                            </div>

                            <Card className={styles.gutter}>
                                {
                                    assignment.submissions.length === 0 && (
                                        <>
                                            <Caption1>No solutions uploaded yet</Caption1>
                                            <Body1>
                                                Click &ldquo;Upload a solution&rdquo; to upload a solution!
                                            </Body1>
                                        </>
                                    )
                                }
                                <ul className={"d-flex flex-column " + styles.uploadedSolutions}>
                                    {assignment.submissions.map((test: TestCase, index: number) => (
                                        <li className={styles.uploadedTest}
                                            key={index}>{test.git_id}</li>
                                    ))}
                                </ul>
                            </Card>
                        </>
                    )
                }{
                    stage === 1 && (
                        <TestUpload
                            fetchAssignment={fetchAssignment}
                            assignment={assignment}
                            assignmentID={assignmentID as string}
                        />
                    )
                }{
                    stage === 2 && (
                        // <SolutionUpload
                        // fetchAssignment={fetchAssignment}
                        // assignment={assignment}
                        // assignmentID={assignmentID as string}
                        // />
                        <></>
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
