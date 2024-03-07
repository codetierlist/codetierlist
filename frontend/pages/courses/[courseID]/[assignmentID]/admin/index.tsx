import axios, { handleError } from '@/axios';
import {
    BaseAdminToolbarDeleteButton,
    HeaderToolbar,
    checkIfCourseAdmin,
    getTierClass,
} from '@/components';
import { SnackbarContext } from '@/hooks';
import { UserContext } from '@/hooks';
import {
    Button,
    Card,
    Field,
    Input,
    Link,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    ToolbarButton,
    Tooltip,
} from '@fluentui/react-components';
import {
    ArrowCounterclockwise24Regular,
    Dismiss24Regular,
    Search24Regular,
} from '@fluentui/react-icons';
import {
    AssignmentStudentStats,
    FetchedAssignmentWithTier,
    FetchedAssignment,
    UserTier,
    Tier,
} from 'codetierlist-types';
import Error from 'next/error';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { Stage } from '..';

/**
 * Highlights the substring in the string
 */
const HighlightSubstring = ({
    str,
    substr,
}: {
    /** the string to highlight */
    str: string;
    /** the substring to highlight */
    substr: string;
}) => {
    const index = str.toLowerCase().indexOf(substr.toLowerCase());
    if (index === -1) {
        return str;
    }

    return (
        <>
            {str.substring(0, index)}
            <strong style={{ color: 'var(--colorBrandForeground1)' }}>
                {str.substring(index, index + substr.length)}
            </strong>
            {str.substring(index + substr.length)}
        </>
    );
};

/**
 * Fetches the assignment and student data
 * @param courseID the course ID
 * @param assignmentID the assignment ID
 */
const useAssignmentAdmin = (courseID: string, assignmentID: string) => {
    const [assignment, setAssignment] = useState<FetchedAssignmentWithTier | null>(null);
    const [studentData, setStudentData] = useState<AssignmentStudentStats | null>(null);
    const { showSnackSev } = useContext(SnackbarContext);

    const fetchAssignment = async () => {
        await axios
            .get<FetchedAssignmentWithTier>(
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

    const fetchAssignmentStats = async () => {
        await axios
            .get<AssignmentStudentStats>(
                `/courses/${courseID}/assignments/${assignmentID}/stats`,
                {
                    skipErrorHandling: true,
                }
            )
            .then((res) => setStudentData(res.data))
            .catch((e) => {
                handleError(showSnackSev)(e);
            });
    };

    useEffect(() => {
        if (!courseID || !assignmentID) {
            return;
        }
        void fetchAssignment();
        void fetchAssignmentStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseID, assignmentID]);

    return { assignment, studentData };
};

/**
 * A button that deletes an assignment
 */
export const AdminToolbarDeleteAssignmentButton = ({
    assignment,
}: {
    assignment: FetchedAssignment;
}) => {
    const { showSnackSev } = useContext(SnackbarContext);
    const { fetchUserInfo } = useContext(UserContext);

    const router = useRouter();

    const deleteAssignment = async () => {
        await axios
            .delete(`/courses/${assignment.course_id}/assignments/${assignment.title}`)
            .then(() => router.push('/'))
            .catch((e) => {
                handleError(showSnackSev)(e);
            })
            .finally(() => fetchUserInfo());
    };

    return (
        <BaseAdminToolbarDeleteButton
            noun="assignment"
            deleteFunction={deleteAssignment}
        />
    );
};

/**
 * A button that deletes an assignment
 */
export const AdminToolbarRevalidateAssignmentButton = ({
    assignment,
}: {
    assignment: FetchedAssignment;
}) => {
    const { showSnackSev } = useContext(SnackbarContext);
    const { fetchUserInfo } = useContext(UserContext);

    const revalidateAssignment = async () => {
        await axios
            .post(
                `/courses/${assignment.course_id}/assignments/${assignment.title}/revalidate`
            )
            .catch((e) => {
                handleError(showSnackSev)(e);
            })
            .finally(() => fetchUserInfo());
    };

    return (
        <ToolbarButton
            icon={<ArrowCounterclockwise24Regular />}
            onClick={revalidateAssignment}
        >
            Revalidate all test cases
        </ToolbarButton>
    );
};

/**
 * A button that views the submission of a student
 */
const ViewSubmissionLink = ({
    utorid,
    setStage,
}: {
    /** the utorid of the student to view the submission of */
    utorid: string;
    /** the function to set the stage */
    setStage: (stage: Stage) => void;
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const loadSubmission = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('utorid', utorid);
        router.push(`${pathname}?${params.toString()}`).then(() => setStage('upload'));
    };

    return (
        <Link appearance="subtle" onClick={loadSubmission}>
            View Submission
        </Link>
    );
};

/**
 * A button that views the tierlist of a student
 */
const ViewTierlistLink = ({
    utorid,
    setStage,
    tier,
}: {
    /** the utorid of the student to view the tierlist of */
    utorid: string;
    /** the function to set the stage */
    setStage: (stage: Stage) => void;
    /** the tier of the student */
    tier: UserTier | Tier;
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const loadTierlist = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('utorid', utorid);
        router.push(`${pathname}?${params.toString()}`).then(() => setStage('tierlist'));
    };

    return (
        <Button
            appearance="subtle"
            className={getTierClass(tier)}
            onClick={loadTierlist}
            icon={tier}
        >
            View Tierlist
        </Button>
    );
};

export default function Page({ setStage }: { setStage: (stage: Stage) => void }) {
    const { courseID, assignmentID } = useRouter().query;
    const { assignment, studentData } = useAssignmentAdmin(
        courseID as string,
        assignmentID as string
    );
    const [filterValue, setFilterValue] = useState<string>('');
    const { userInfo } = useContext(UserContext);

    useEffect(() => {
        document.title = `${assignment?.title || assignmentID} - Codetierlist`;
    }, [assignment, assignmentID]);

    if (!courseID || !assignmentID || !assignment) {
        return <Error statusCode={404} />;
    }

    const columns = [
        { columnKey: 'tier', label: 'Tier' },
        { columnKey: 'utorid', label: 'UTORid' },
        { columnKey: 'name', label: 'Full Name' },
        { columnKey: 'testsPassed', label: 'Tests Passed' },
    ];

    // If the user is not an admin, error 403
    if (!checkIfCourseAdmin(userInfo, courseID as string)) {
        return <Error statusCode={403} />;
    }

    return (
        <section className="p-b-xxxl">
            <HeaderToolbar>
                <AdminToolbarDeleteAssignmentButton assignment={assignment} />
                <AdminToolbarRevalidateAssignmentButton assignment={assignment} />
            </HeaderToolbar>

            <Card className="m-x-l m-t-xxl">
                <div className="m-y-s m-x-xxxl">
                    <Field>
                        <Input
                            size="large"
                            placeholder="Filter by UTORid or name"
                            contentBefore={<Search24Regular />}
                            contentAfter={
                                <>
                                    {filterValue !== '' && (
                                        <Tooltip
                                            content="Clear filter"
                                            relationship="label"
                                            showDelay={0}
                                            hideDelay={300}
                                        >
                                            <Button
                                                icon={<Dismiss24Regular />}
                                                appearance="subtle"
                                                onClick={() => setFilterValue('')}
                                            />
                                        </Tooltip>
                                    )}
                                </>
                            }
                            appearance="filled-darker"
                            value={filterValue}
                            onChange={(e) => {
                                setFilterValue(e.target.value);
                            }}
                        />
                    </Field>
                </div>

                <Table arial-label="Admin table" className="m-xs m-t-s">
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
                        {studentData &&
                            studentData.map((item) => (
                                <TableRow
                                    key={item.utorid}
                                    style={{
                                        display:
                                            filterValue === '' ||
                                            item.utorid.includes(filterValue) ||
                                            `${item.givenName} ${item.surname}`.includes(
                                                filterValue
                                            )
                                                ? undefined
                                                : 'none',
                                    }}
                                >
                                    <TableCell>
                                        <ViewTierlistLink
                                            utorid={item.utorid}
                                            setStage={setStage}
                                            tier={item.tier}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <HighlightSubstring
                                            str={item.utorid}
                                            substr={filterValue}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <HighlightSubstring
                                            str={`${item.givenName} ${item.surname}`}
                                            substr={filterValue}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {item.testsPassed}/{item.totalTests}
                                    </TableCell>
                                    <TableCell>
                                        <ViewSubmissionLink
                                            utorid={item.utorid}
                                            setStage={setStage}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>

                {!studentData && (
                    <Spinner
                        className="m-y-xxxl"
                        labelPosition="below"
                        label="Fetching the latest data for you&hellip;"
                    />
                )}
            </Card>
        </section>
    );
}
