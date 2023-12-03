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
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    Button, Caption1, Card, CardHeader,
    MessageBar,
    MessageBarActions,
    MessageBarBody,
    MessageBarTitle,
    Subtitle1,
    Tab, TabList,
    Text
} from '@fluentui/react-components';
import { Add24Filled, Clock16Regular, Delete16Filled } from '@fluentui/react-icons';
import { Subtitle2, Title2 } from '@fluentui/react-text';
import Editor from '@monaco-editor/react';
import { Commit, FetchedAssignmentWithTier, Tierlist } from "codetierlist-types";
import Error from 'next/error';
import Head from "next/head";
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { Col, Container } from "react-grid-system";
import styles from './page.module.css';

const ListFiles = ({ commit, route, assignment, assignmentID, update }: { commit: Commit, route: "testcases" | "submissions", assignment: FetchedAssignmentWithTier, assignmentID: string, update?: () => void }) => {
    const { showSnackSev } = useContext(SnackbarContext);
    const [files, setFiles] = useState<{ [key: string]: string }>({});

    const getFileContents = async (file: string) => {
        await axios.get<string>(`/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/${commit.log[0]}/${file}`, { skipErrorHandling: true })
            .then((res) => {
                const fileContent = Object.values(res.data).map(value => {
                    // each key one byte, convert to char
                    return String.fromCharCode(Number(value));
                }).join("");

                setFiles((prev) => {
                    return { ...prev, [file]: fileContent };
                });
            })
            .catch(e => {
                handleError(e.message, showSnackSev);
            });
    };

    const deleteFile = async (file: string) => {
        await axios.delete(`/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/${file}`, { skipErrorHandling: true })
            .then(() => {
                update && update();
                showSnackSev("File deleted", "success");
            })
            .catch(e => {
                handleError(e.message, showSnackSev);
            });
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
                                    <Button icon={<Delete16Filled />} onClick={() => deleteFile(commit.files[index])} />
                                </div>
                            </AccordionHeader>
                            <AccordionPanel>
                                <pre>
                                    <Editor
                                        height="50vh"
                                        language="python"
                                        value={files[commit.files[index]]}
                                        options={{
                                            readOnly: true,
                                            minimap: {
                                                enabled: false
                                            }
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

const FilesTab = ({ fetchAssignment, assignment, assignmentID, routeName, route }: { fetchAssignment: () => Promise<void>, assignment: FetchedAssignmentWithTier, assignmentID: string, routeName: string, route: "testcases" | "submissions" }) => {
    const [content, setContent] = useState<Commit>({ "files": [], "log": [] } as Commit);
    const { showSnackSev } = useContext(SnackbarContext);

    const getTestData = async () => {
        await axios.get<Commit>(`/courses/${assignment.course_id}/assignments/${assignmentID}/${route}`, { skipErrorHandling: true })
            .then((res) => setContent(res.data))
            .catch(e => {
                handleError(e.message, showSnackSev);
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
            .catch(e => {
                handleError(e.message, showSnackSev);
            });
    };

    useEffect(() => {
        void getTestData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignmentID, fetchAssignment, route, routeName, assignment.submissions]);

    return (
        <>
            <div className={`${flex["d-flex"]} ${flex["justify-content-between"]}`}>
                <Subtitle1 block>Uplodaded {routeName}s</Subtitle1>
                <Button
                    icon={<Add24Filled />}
                    appearance="subtle"
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
        </>
    );
};


const ViewTierList = ({ tierlist }: { tierlist: Tierlist }) => {
    return (
        <Col sm={12}>
            <Title2>
                Tier List
            </Title2>
            <TierList tierlist={tierlist} />
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
                <Tab value="tab1" onClick={() => setStage(1)} disabled={assignment.test_cases.length === 0 || assignment.submissions.length === 0}>
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

                            <div className={styles.gutter}>
                                <FilesTab
                                    routeName="solution"
                                    route="submissions"
                                    fetchAssignment={fetchAssignment}
                                    assignment={assignment}
                                    assignmentID={assignmentID as string}
                                />
                            </div>

                            <div className={styles.gutter}>
                                <FilesTab
                                    routeName="test"
                                    route="testcases"
                                    fetchAssignment={fetchAssignment}
                                    assignment={assignment}
                                    assignmentID={assignmentID as string}
                                />
                            </div>
                        </>
                    )
                }{
                    stage === 1 && (
                        tierlist ?
                            <ViewTierList tierlist={tierlist} /> : "No tierlist found"
                    )
                }
            </Container >
        </>
    );
}
