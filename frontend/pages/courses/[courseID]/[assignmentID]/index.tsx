import axios, { handleError } from "@/axios";
import {
    AssignmentPageFilesTab,
    TierChip,
    TierList,
    checkIfCourseAdmin,
    convertDate,
    convertTime
} from '@/components';
import { SnackbarContext } from "@/contexts/SnackbarContext";
import { UserContext } from "@/contexts/UserContext";
import {
    Button,
    Card, CardHeader,
    MessageBar,
    MessageBarActions,
    MessageBarBody,
    MessageBarTitle,
    Subtitle1,
    Tab, TabList
} from '@fluentui/react-components';
import { Subtitle2, Title2 } from '@fluentui/react-text';
import {
    Tierlist, UserFetchedAssignment,
    UserTier
} from "codetierlist-types";
import Error from 'next/error';
import Head from "next/head";
import { useRouter } from 'next/router';
import {useCallback, useContext, useEffect, useState} from 'react';
import { Col, Container } from "react-grid-system";
import AdminPage from "./admin/index";
import styles from './page.module.css';
import {usePathname, useSearchParams } from "next/navigation";

/**
 * Displays the tierlist
 * @param tierlist
 */
const ViewTierList = (props: { tierlist: Tierlist } & React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <Col sm={12} {...props}>
            <Subtitle1 className={styles.gutter} block>Tierlist</Subtitle1>
            <TierList tierlist={props.tierlist} />
        </Col>
    );
};

/**
 * Checks if the tierlist should be displayed
 * @param assignment
 * @param tierlist can be null
 */
const shouldViewTierList = (assignment: UserFetchedAssignment, tierlist: Tierlist | null) => {
    if (tierlist === null) {
        return false;
    }
    if (Object.values(tierlist).every((tier) => tier.length === 0)) {
        return false;
    }
    return (assignment.submissions.length > 0 && assignment.test_cases.length > 0);
};

/**
 * Gets the tier of the user
 *
 * @param tierlist the tierlist
 */
const getMyTier = (tierlist: Tierlist): UserTier => {
    // iterate through both keys and values in the tierlsit array
    for (const [tier, entries] of Object.entries(tierlist)) {
        // iterate through the entries
        for (const entry of entries) {
            // if the entry is the user, return the tier
            if (entry.you) {
                return tier as UserTier;
            }
        }
    }

    return "?";
};

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    let defaultStage = parseInt(searchParams.get("stage") || "0");
    if (isNaN(defaultStage)) {
        defaultStage = 0;
    }

    const [stage, setStageState] = useState(defaultStage);
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("utorid");
            params.set(name, value);

            return params.toString();
        },
        [searchParams]);
    const setStage = (newStage: number) => {
        setStageState(newStage);
        router.replace(pathname + "?" + createQueryString("stage", newStage.toString()));
    };
    useEffect(() => {
        setStageState(defaultStage);
    }, [defaultStage, searchParams]);
    const [assignment, setAssignment] = useState<UserFetchedAssignment | null>(null);
    const [tierlist, setTierlist] = useState<Tierlist | null>(null);
    const { showSnackSev } = useContext(SnackbarContext);
    const { courseID, assignmentID } = router.query;
    const { userInfo } = useContext(UserContext);

    const fetchAssignment = async () => {
        await axios.get<UserFetchedAssignment>(`/courses/${courseID}/assignments/${assignmentID}`, { skipErrorHandling: true })
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
    const POLLING_RATE = 60000;

    useEffect(() => {
        const interval = setInterval(() => {
            if (!courseID || !assignmentID) {
                return;
            }

            void fetchAssignment();
            void fetchTierlist();
        }, POLLING_RATE);

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
                    <></>
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
                <Tab value="tab2" onClick={() => setStage(2)} disabled={!shouldViewTierList(assignment, tierlist) && !checkIfCourseAdmin(userInfo, assignment.course_id)}>
                    View tierlist
                </Tab>

                {
                    checkIfCourseAdmin(userInfo, assignment.course_id) && (
                        <Tab value="tab3" onClick={() => setStage(3)}>
                            Admin
                        </Tab>
                    )
                }
            </TabList>

            <Container component="main" className="m-t-xxxl">
                {
                    stage === 0 && (
                        <>
                            <Card className="m-b-l" orientation="horizontal">
                                <CardHeader
                                    className={styles.assignmentHeaderContent}
                                    action={<TierChip tier={(tierlist && getMyTier(tierlist)) || "?"} />}
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
                        <div className={`${styles.massiveGap}`}>
                            <AssignmentPageFilesTab
                                routeName="solution"
                                route="submissions"
                                fetchAssignment={fetchAssignment}
                                assignment={assignment}
                                assignmentID={assignmentID as string}
                            />

                            <AssignmentPageFilesTab
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
                            ? <ViewTierList tierlist={tierlist} className="m-t-xxxl" />
                            : "No tierlist found"
                    )
                }{
                    (stage === 3 && checkIfCourseAdmin(userInfo, assignment.course_id)) && (
                        <AdminPage />
                    )
                }
            </Container>
        </>
    );
}
