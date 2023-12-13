import axios, { handleError } from "@/axios";
import {
    TierChip,
    TierList,
    convertDate,
    convertTime,
    promptForFileObject,
    Monaco,
    ToolTipIcon
} from '@/components';
import { SnackbarContext } from "@/contexts/SnackbarContext";
import flex from '@/styles/flex-utils.module.css';
import {
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    Button, Caption1, Card, CardHeader,
    MessageBar,
    MessageBarActions,
    MessageBarBody,
    MessageBarTitle,
    Tooltip,
    Subtitle1,
    Tab, TabList,
    Text
} from '@fluentui/react-components';
import {
    Add24Filled,
    ArrowCounterclockwiseDashes24Filled, CheckmarkCircle24Regular,
    Delete16Filled,
    DismissCircle24Regular, Settings24Regular
} from '@fluentui/react-icons';
import { Subtitle2, Title2 } from '@fluentui/react-text';
import {
    Commit,
    FetchedAssignmentWithTier,
    TestCaseStatus,
    Tierlist
} from "codetierlist-types";
import Error from 'next/error';
import Head from "next/head";
import { useRouter } from 'next/router';
import { useContext, useEffect, useState} from 'react';
import { Col, Container } from "react-grid-system";
import styles from './page.module.css';
import { UserContext } from "@/contexts/UserContext";
import Link from 'next/link';

const ListFiles = ({ commit, route, assignment, assignmentID, update }: { commit: Commit, route: "testcases" | "submissions", assignment: FetchedAssignmentWithTier, assignmentID: string, update?: () => void }) => {
    const { showSnackSev } = useContext(SnackbarContext);
    const [files, setFiles] = useState<{ [key: string]: string }>({});

    const getFileContents = async (file: string) => {
        await axios.get<string>(`/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/${commit.log[0]}/${file}`, { skipErrorHandling: true })
            .then((res) => {
                // read the file contents from buffer
                setFiles((prev) => {
                    return { ...prev, [file]: Buffer.from(res.data).toString("utf-8") };
                });
            })
            .catch(handleError(showSnackSev));
    };

    const deleteFile = async (file: string) => {
        await axios.delete(`/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/${file}`, { skipErrorHandling: true })
            .then(() => {
                update && update();
                showSnackSev("File deleted", "success");
            })
            .catch(handleError(showSnackSev));
    };

    useEffect(() => {
        if (commit.files) {
            setFiles({});

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            Object.keys(commit.files).forEach((_, file) => {
                void getFileContents(commit.files[file]);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [commit, assignment, route]);

    return (
        commit.files && Object.keys(commit.files).length === 0 ? (
            <Caption1>No files uploaded yet</Caption1>
        ) : (
            <Accordion collapsible>
                {
                    Object.keys(commit.files).map((key, index) => (
                        <AccordionItem value={index} key={key}>
                            <AccordionHeader className={`${styles.accordionHeader}`}>
                                <div className={`${flex["d-flex"]} ${flex["justify-content-between"]} ${flex["align-items-center"]} ${styles.accordionHeaderContent}`}>
                                    <span>{commit.files[index]}</span>

                                    <Tooltip content="Delete file" relationship="label">
                                        <Button icon={<Delete16Filled />} onClick={() => deleteFile(commit.files[index])} />
                                    </Tooltip>
                                </div>
                            </AccordionHeader>
                            <AccordionPanel>
                                <pre>
                                    <Monaco
                                        height="50vh"
                                        language="python"
                                        value={files[commit.files[index]]}
                                        options={{
                                            readOnly: true
                                        }}
                                    />
                                </pre>
                            </AccordionPanel>
                        </AccordionItem>
                    ))
                }
            </Accordion>
        )
    );
};

/**
 * return an icon reflecting the status of the testcase
 * @param status the status of the testcase
 */
const TestCaseStatusIcon = ({status}: {status:TestCaseStatus}): JSX.Element=>{
    switch (status) {
    case "INVALID":
        return <DismissCircle24Regular fill={"var(--colorStatusDangerForeground1)"} primaryFill={"var(--colorStatusDangerForeground1)"}/>;
    case "PENDING":
        return <ArrowCounterclockwiseDashes24Filled fill={"var(--colorPaletteGoldForeground2)"} primaryFill={"var(--colorPaletteGoldForeground2)"}/>;
    case "VALID":
        return <CheckmarkCircle24Regular fill={"var(--colorStatusSuccessForeground1)"} primaryFill={"var(--colorStatusSuccessForeground1)"}/>;
    default: return <></>;
    }
};
/**
 * return an icon with tooltip reflecting the status of the testcase
 * @param status the status of the testcase
 */
const TestCaseStatus = ({status}: {status?:TestCaseStatus})=>{
    if(!status || status === "EMPTY"){
        return undefined;
    }
    const contents : Record<Exclude<TestCaseStatus,"EMPTY">, string> = {
        "INVALID": "One or more of your uploaded tests are invalid and did not pass the solution",
        "VALID": "All uploaded testcases are valid and passed the solution",
        "PENDING": "Your testcases are currently in the queue for validation",
    };
    return <ToolTipIcon tooltip={contents[status]} icon={TestCaseStatusIcon({status})}/>;
};
const FilesTab = ({ fetchAssignment, assignment, assignmentID, routeName, route }: { fetchAssignment: () => Promise<void>, assignment: FetchedAssignmentWithTier, assignmentID: string, routeName: string, route: "testcases" | "submissions" }) => {
    const [content, setContent] = useState<Commit>({ "files": [], "log": [] } as Commit);
    const { showSnackSev } = useContext(SnackbarContext);

    const getTestData = async () => {
        await axios.get<Commit>(`/courses/${assignment.course_id}/assignments/${assignmentID}/${route}`, { skipErrorHandling: true })
            .then((res) => setContent(res.data))
            .catch(e => {
                handleError(showSnackSev)(e);
                setContent({ "files": [], "log": [] } as Commit);
            });
    };

    const submitTest = async (files: FileList) => {
        const formData = new FormData();
        for (let i = 0; i < files!.length; i++) {
            formData.append("files", files![i]);
        }

        axios.post(`/courses/${assignment.course_id}/assignments/${assignmentID}/${route}`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" }
            })
            .then(() => {
                fetchAssignment();
            })
            .catch(handleError(showSnackSev));
    };

    useEffect(() => {
        void getTestData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignmentID, fetchAssignment, route, routeName, assignment.submissions]);

    return (
        <div className={styles.gutter}>
            <div className={`${flex["d-flex"]} ${flex["justify-content-between"]}`}>
                <Subtitle1 block>Uploaded {routeName}s <TestCaseStatus status={content.valid}/></Subtitle1>
                <Button
                    icon={<Add24Filled />}
                    appearance="subtle"
                    onClick={async () => {
                        promptForFileObject(".py", true)
                            .then(file => {
                                if (file) {
                                    submitTest(file);
                                }
                            })
                            .catch(handleError(showSnackSev));
                    }}
                >
                    Upload a {routeName}
                </Button>
            </div>

            <Text block className={styles.commitId} font="numeric">{content.log[0]}</Text>

            <Card>
                <ListFiles
                    commit={content}
                    route={route}
                    assignment={assignment}
                    assignmentID={assignmentID}
                    update={getTestData}
                />
            </Card>
        </div>
    );
};


const ViewTierList = ({ tierlist }: { tierlist: Tierlist }) => {
    return (
        <Col sm={12}>
            <Subtitle1 className={styles.gutter} block>Tierlist</Subtitle1>
            <TierList tierlist={tierlist} />
        </Col>
    );
};

/**
 * Checks if the tierlist should be displayed
 * @param assignment
 * @param tierlist can be null
 */
const shouldViewTierList = (assignment: FetchedAssignmentWithTier, tierlist: Tierlist | null) => {
    if (tierlist === null) {
        return false;
    }
    if (Object.values(tierlist).every((tier) => tier.length === 0)) {
        return false;
    }
    return (assignment.submissions.length > 0 && assignment.test_cases.length > 0);
};

export default function Page() {
    const router = useRouter();
    const [stage, setStage] = useState(0);
    const [assignment, setAssignment] = useState<FetchedAssignmentWithTier | null>(null);
    const [tierlist, setTierlist] = useState<Tierlist | null>(null);
    const { showSnackSev } = useContext(SnackbarContext);
    const { courseID, assignmentID } = router.query;
    const { userInfo } = useContext(UserContext);

    const fetchAssignment = async () => {
        await axios.get<FetchedAssignmentWithTier>(`/courses/${courseID}/assignments/${assignmentID}`, { skipErrorHandling: true })
            .then((res) => setAssignment(res.data))
            .catch(e => {
                handleError(showSnackSev)(e);
                setStage(-404);
            });
    };
    const fetchTierlist = async () => {
        await axios.get<Tierlist>(`/courses/${courseID}/assignments/${assignmentID}/tierlist`, { skipErrorHandling: true })
            .then((res) => setTierlist(res.data))
            .catch(e => {
                handleError(showSnackSev)(e);
                setStage(-404);
            });
    };

    /**
     * the polling rate for fetching the assignment and tierlist
     */
    const POLLING_RATE = 5000;

    useEffect(() => {
        const interval = setInterval(() => {
            if (!courseID || !assignmentID) {
                return;
            }

            void fetchAssignment();
            void fetchTierlist();
        }
        , POLLING_RATE);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    });

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
        return (
            <>
                <Head> <title>Codetierlist</title> </Head>
                <TabList className={styles.tabList} size="large" selectedValue={`tab${stage}`}>
                    <Tab value="tab0" disabled> Assignment details </Tab>
                    <Tab value="tab1" disabled> Upload </Tab>
                    <Tab value="tab2" disabled> View tierlist </Tab>
                </TabList>
                <Container component="main" className={styles.container}>
                </Container>
            </>
        );
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
                    Upload
                </Tab>
                <Tab value="tab2" onClick={() => setStage(2)} disabled={!shouldViewTierList(assignment, tierlist)}>
                    View tierlist
                </Tab>

                {
                    /* TODO proper permissions check */

                    userInfo.admin && (
                        <div className={styles.adminButton}>
                            <Tooltip content="Admin page" relationship="label">
                                <Link href={`/courses/${courseID}/${assignmentID}/admin`}>
                                    <Button
                                        appearance="subtle"
                                        icon={<Settings24Regular />}
                                        aria-label="Admin page"
                                    />
                                </Link>
                            </Tooltip>
                        </div>
                    )
                }
            </TabList>


            <Container component="main" className={styles.container}>
                {
                    stage === 0 && (
                        <>
                            <Card className={styles.header} orientation="horizontal">
                                <CardHeader
                                    className={styles.assignmentHeaderContent}
                                    action={<TierChip tier={assignment.tier} />}
                                    header={
                                        <div className={styles.assignmentHeaderContent}>
                                            <Subtitle2 className={styles.dueDate}>
                                                <strong>Due</strong> {convertDate(assignment.due_date)} at {convertTime(assignment.due_date)}
                                            </Subtitle2>
                                            <Title2>
                                                {assignment.title}
                                            </Title2>
                                        </div>
                                    }
                                />
                            </Card>

                            {assignment.submissions.length === 0 && (
                                <MessageBar intent={"warning"} className={styles.messageBar}>
                                    <MessageBarBody>
                                        <MessageBarTitle>You have not submitted a solution yet.</MessageBarTitle>
                                        You can submit a solution by clicking on the &ldquo;Upload&rdquo; tab.
                                        You will not be able to see the tierlist until you submit a solution.
                                    </MessageBarBody>
                                    <MessageBarActions>
                                        <Button onClick={() => setStage(1)}>Upload a solution</Button>
                                    </MessageBarActions>
                                </MessageBar>
                            )}

                            {assignment.test_cases.length === 0 && (
                                <MessageBar intent={"warning"} className={styles.messageBar}>
                                    <MessageBarBody>
                                        <MessageBarTitle>You have not submitted a test yet.</MessageBarTitle>
                                        You can submit a test by clicking on &ldquo;Upload&rdquo; tab.
                                        You will not be able to see the tierlist until you submit a test.
                                    </MessageBarBody>
                                    <MessageBarActions>
                                        <Button onClick={() => setStage(1)}>Submit a test</Button>
                                    </MessageBarActions>
                                </MessageBar>
                            )}

                            <Subtitle1 block className={styles.gutterTop}>Assignment Description</Subtitle1>
                            <Card className={styles.gutter}>
                                <p>
                                    {assignment.description}
                                </p>
                            </Card>
                        </>
                    )
                }{
                    stage === 1 && (
                        <div className={`${styles.gutter} ${styles.massiveGap}`}>
                            <FilesTab
                                routeName="solution"
                                route="submissions"
                                fetchAssignment={fetchAssignment}
                                assignment={assignment}
                                assignmentID={assignmentID as string}
                            />

                            <FilesTab
                                routeName="test"
                                route="testcases"
                                fetchAssignment={fetchAssignment}
                                assignment={assignment}
                                assignmentID={assignmentID as string}
                            />
                        </div>
                    )
                }{
                    stage === 2 && (
                        tierlist
                            ? <ViewTierList tierlist={tierlist} />
                            : "No tierlist found"
                    )
                }
            </Container>
        </>
    );
}
