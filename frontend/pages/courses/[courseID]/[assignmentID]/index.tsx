import axios, { handleError } from '@/axios';
import {
    AssignmentPageFilesTab,
    TierChip,
    TierList,
    checkIfCourseAdmin,
    convertDate,
    convertTime,
} from '@/components';
import { SnackbarContext } from '@/contexts/SnackbarContext';
import { UserContext } from '@/contexts/UserContext';
import {
    Button,
    Card,
    CardHeader,
    MessageBar,
    MessageBarActions,
    MessageBarBody,
    MessageBarTitle,
    Subtitle1,
    Tab,
    TabList,
    Text,
} from '@fluentui/react-components';
import { Subtitle2, Title2 } from '@fluentui/react-text';
import { Tierlist, UserFetchedAssignment } from 'codetierlist-types';
import Error from 'next/error';
import Head from 'next/head';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { Key, useCallback, useContext, useEffect, useState } from 'react';
import { Col, Container } from 'react-grid-system';
import ViewAdminTab from './admin/index';
import styles from './page.module.css';

export declare type Stage = 'details' | 'upload' | 'tierlist' | 'admin' | '404';

/**
 * Displays the tierlist
 * @param tierlist
 */
const ViewTierList = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const router = useRouter();
    const { courseID, assignmentID } = router.query;
    const [tierlist, setTierlist] = useState<Tierlist | null>(null);
    const { showSnackSev } = useContext(SnackbarContext);
    const searchParams = useSearchParams();

    const fetchTierlist = async () => {
        await axios
            .get<Tierlist>(`/courses/${courseID}/assignments/${assignmentID}/tierlist`, {
                skipErrorHandling: true,
                params: {
                    utorid: searchParams.get('utorid') ?? undefined,
                },
            })
            .then((res) => setTierlist(res.data))
            .catch((e) => {
                handleError(showSnackSev)(e);
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
            void fetchTierlist();
        }, POLLING_RATE);

        return () => clearInterval(interval);
    });

    useEffect(() => {
        void fetchTierlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseID, assignmentID]);

    return (
        <Col sm={12} {...props}>
            <Subtitle1 className={styles.gutter} block>
                Tierlist
            </Subtitle1>
            {tierlist ? <TierList tierlist={tierlist} /> : 'No tier list available.'}
        </Col>
    );
};

/**
 * The files tab for the assignment page
 */
const ViewFilesTab = ({
    fetchAssignment,
    assignment,
    assignmentID,
}: {
    /** The function to fetch the assignment */
    fetchAssignment: () => Promise<void>;
    /** The assignment to display */
    assignment: UserFetchedAssignment;
    /** The assignment ID */
    assignmentID: string;
}) => {
    return (
        <div className={`${styles.massiveGap}`}>
            <AssignmentPageFilesTab
                routeName="solution"
                route="submissions"
                fetchAssignment={fetchAssignment}
                assignment={assignment}
                assignmentID={assignmentID}
            />

            <AssignmentPageFilesTab
                routeName="test"
                route="testcases"
                fetchAssignment={fetchAssignment}
                assignment={assignment}
                assignmentID={assignmentID}
            />
        </div>
    );
};

/**
 * The empty message bar for the assignment page
 */
const EmptyMessageBar = ({
    thing,
    tab,
    setStage,
    stage,
}: {
    /** The thing that the user has not submitted */
    thing: string;
    /** The tab that the user has to click to submit the thing */
    tab: string;
    /** The function to set the stage */
    setStage: (stage: Stage) => void;
    /** The stage to set */
    stage: Stage;
}) => {
    return (
        <MessageBar intent="warning" className={styles.messageBar} layout="auto">
            <MessageBarBody>
                <MessageBarTitle>You have not submitted a {thing} yet.</MessageBarTitle>
                You can submit a solution by clicking on the &ldquo;{tab}&rdquo; tab. You
                will not be able to see the tier list until you submit a {thing}.
            </MessageBarBody>
            <MessageBarActions>
                <Button onClick={() => setStage(stage)}>Upload a {thing}</Button>
            </MessageBarActions>
        </MessageBar>
    );
};

/**
 * The view details tab for the assignment page
 */
const ViewDetailsTab = ({
    assignment,
    setStage,
}: {
    /** The assignment to display */
    assignment: UserFetchedAssignment;
    /** The function to set the stage */
    setStage: (stage: Stage) => void;
}) => {
    return (
        <>
            <Card className={`m-b-l ${styles.assignmentHeader}`} orientation="horizontal">
                <CardHeader
                    className={styles.assignmentHeaderContent}
                    action={<TierChip tier={assignment.tier} />}
                    header={
                        <div className={styles.assignmentHeaderContent}>
                            <Subtitle2 className={styles.dueDate}>
                                <strong>Due</strong> {convertDate(assignment.due_date)} at{' '}
                                {convertTime(assignment.due_date)}
                            </Subtitle2>

                            <Title2>{assignment.title}</Title2>
                        </div>
                    }
                />
            </Card>

            {assignment.submissions.length === 0 && (
                <EmptyMessageBar
                    thing="solution"
                    tab="Upload"
                    setStage={setStage}
                    stage={'upload'}
                />
            )}

            {assignment.test_cases.length === 0 && (
                <EmptyMessageBar
                    thing="test case"
                    tab="Upload"
                    setStage={setStage}
                    stage={'upload'}
                />
            )}

            <Subtitle1 block className={styles.gutterTop} as="h2">
                Assignment Description
            </Subtitle1>

            <Card className={styles.gutter}>
                {assignment.description.split('\n').map((line: string, i: Key) => {
                    return <Text key={i}>{line}</Text>;
                })}
            </Card>
        </>
    );
};

/**
 * For when the page is loading
 */
const LoadingSkeleton = () => {
    return (
        <>
            <Head>
                <title>Codetierlist</title>
            </Head>
            <TabList className={styles.tabList} size="large" selectedValue={`details`}>
                <Tab value="details" disabled>
                    Assignment details
                </Tab>
                <Tab value="upload" disabled>
                    Upload
                </Tab>
                <Tab value="tierlist" disabled>
                    View tierlist
                </Tab>
            </TabList>
            <Container component="main" className={styles.container}>
                <></>
            </Container>
        </>
    );
};

/**
 * Removes the utorid query from the url when not in the upload or tierlist stage
 *
 * @param queryKey the query key to remove
 * @param excludeStages the stages to exclude from removing the query
 * @param currentStage the current stage
 */
const useQueryString = (
    queryKey: string,
    excludeStages: Stage[],
    currentStage: Stage
) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const createQueryString = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(queryKey);
        return params.toString();
    }, [searchParams, queryKey]);

    return useEffect(() => {
        // remove utorid query when not in upload or tierlist stage
        if (!excludeStages.includes(currentStage) && searchParams.has(queryKey)) {
            const query = createQueryString();
            void router.replace(`${pathname}${query ? '?' : ''}${query}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStage]);
};

/**
 * A hook that fetches the assignment and tierlist for the assignment page
 */
const useAssignment = (courseID: string, assignmentID: string) => {
    const [assignment, setAssignment] = useState<UserFetchedAssignment | null>(null);
    const { showSnackSev } = useContext(SnackbarContext);

    const fetchAssignment = async () => {
        await axios
            .get<UserFetchedAssignment>(
                `/courses/${courseID}/assignments/${assignmentID}`,
                {
                    skipErrorHandling: true,
                }
            )
            .then((res) => setAssignment(res.data))
            .catch((e) => {
                handleError(showSnackSev)(e);
            });
    };

    useEffect(() => {
        if (!courseID || !assignmentID) {
            return;
        }
        void fetchAssignment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseID, assignmentID]);

    return { assignment, fetchAssignment };
}

export default function Page() {
    const router = useRouter();
    const [stage, setStage] = useState<Stage>('details');
    const { assignment, fetchAssignment } = useAssignment(router.query.courseID as string, router.query.assignmentID as string);
    const { courseID, assignmentID } = router.query;
    const { userInfo } = useContext(UserContext);

    useQueryString('utorid', ['upload', 'tierlist'], stage);

    useEffect(() => {
        if (!courseID || !assignmentID) {
            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseID, assignmentID]);

    if (stage === '404') {
        return <Error statusCode={404} />;
    } else if (!assignment || !courseID || !assignmentID) {
        return <LoadingSkeleton />;
    }

    return (
        <>
            <Head>
                <title>{assignment.title} - Codetierlist</title>
            </Head>

            <TabList className={styles.tabList} size="large" selectedValue={stage}>
                <Tab value="details" onClick={() => setStage('details')}>
                    Assignment details
                </Tab>
                <Tab value="upload" onClick={() => setStage('upload')}>
                    Upload
                </Tab>
                <Tab
                    value="tierlist"
                    onClick={() => setStage('tierlist')}
                    disabled={
                        !assignment.view_tierlist &&
                        !checkIfCourseAdmin(userInfo, assignment.course_id)
                    }
                >
                    View tierlist
                </Tab>

                {checkIfCourseAdmin(userInfo, assignment.course_id) && (
                    <Tab value="admin" onClick={() => setStage('admin')}>
                        Admin
                    </Tab>
                )}
            </TabList>

            <Container component="main" className="m-t-xxxl">
                {stage === 'details' && (
                    <ViewDetailsTab assignment={assignment} setStage={setStage} />
                )}
                {stage === 'upload' && (
                    <ViewFilesTab
                        fetchAssignment={fetchAssignment}
                        assignment={assignment}
                        assignmentID={assignmentID as string}
                    />
                )}
                {stage === 'upload' && <ViewTierList className="m-t-xxxl" />}
                {stage === 'admin' &&
                    checkIfCourseAdmin(userInfo, assignment.course_id) && (
                        <ViewAdminTab setStage={setStage} />
                    )}
            </Container>
        </>
    );
}
