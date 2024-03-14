import axios, { handleError } from '@/axios';
import {
    BaseAdminToolbarDeleteButton,
    HeaderToolbar,
    ToolTipIcon,
    checkIfCourseAdmin,
    getTierClass,
} from '@/components';
import { SnackbarContext, UserContext } from '@/hooks';
import {
    DataGrid,
    DataGridBody,
    DataGridCell,
    DataGridHeader,
    DataGridHeaderCell,
    DataGridRow,
    RowRenderer,
} from '@fluentui-contrib/react-data-grid-react-window';
import { Button,
    Card,
    Field,
    Input,
    Link,
    Spinner,
    TableColumnDefinition,
    ToolbarButton,
    Tooltip,
    createTableColumn,
} from '@fluentui/react-components';
import {
    ArrowCounterclockwise24Regular,
    Dismiss24Regular,
    Open12Regular,
    Search24Regular,
} from '@fluentui/react-icons';
import {
    AssignmentStudentStat,
    AssignmentStudentStats,
    Tier,
    UserTier,
} from 'codetierlist-types';
import Error from 'next/error';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Stage } from '../../pages/courses/[courseID]/[assignmentID]';

/**
 * Highlights the substring in the string
 */
const HighlightSubstring = ({
    str,
    substr,
    ...props
}: {
    /** the string to highlight */
    str: string;
    /** the substring to highlight */
    substr: string;
} & React.HTMLAttributes<HTMLSpanElement>) => {
    const index = str.toLowerCase().indexOf(substr.toLowerCase());
    if (index === -1) {
        return str;
    }

    return (
        <span {...props}>
            {str.substring(0, index)}
            <strong style={{ color: 'var(--colorBrandForeground1)' }}>
                {str.substring(index, index + substr.length)}
            </strong>
            {str.substring(index + substr.length)}
        </span>
    );
};

/**
 * Fetches the assignment stats
 *
 * @param courseID the course ID
 * @param assignmentID the assignment ID
 */
const useAssignmentAdmin = (courseID: string, assignmentID: string) => {
    const { showSnack } = useContext(SnackbarContext);
    const [assignmentData, setAssignmentData] = useState<AssignmentStudentStats | null>(
        null
    );

    useEffect(() => {
        axios
            .get<AssignmentStudentStats>(
                `/courses/${courseID}/assignments/${assignmentID}/stats`,
                {
                    skipErrorHandling: true,
                }
            )
            .then((res) => {
                setAssignmentData(res.data);
            })
            .catch((e) => {
                handleError(showSnack)(e);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseID, assignmentID]);

    return assignmentData;
};

/**
 * A button that deletes an assignment
 */
export const AdminToolbarDeleteAssignmentButton = ({
    courseID,
    assignmentID,
}: {
    /** the course ID */
    courseID: string;
    /** the assignment ID */
    assignmentID: string;
}) => {
    const { showSnack } = useContext(SnackbarContext);
    const { fetchUserInfo } = useContext(UserContext);

    const router = useRouter();

    const deleteAssignment = async () => {
        await axios
            .delete(`/courses/${courseID}/assignments/${assignmentID}`)
            .then(() => router.push('/'))
            .catch((e) => {
                handleError(showSnack)(e);
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
    courseID,
    assignmentID,
}: {
    /** the course ID */
    courseID: string;
    /** the assignment ID */
    assignmentID: string;
}) => {
    const { showSnack } = useContext(SnackbarContext);
    const { fetchUserInfo } = useContext(UserContext);

    const revalidateAssignment = async () => {
        await axios
            .post(`/courses/${courseID}/assignments/${assignmentID}/revalidate`)
            .then((res) => {
                if (res.status === 200) {
                    showSnack(
                        'All student test cases will now be revalidated against the instructor solution (if it exists). This may take a few minutes.',
                        'success'
                    );
                }
            })
            .catch((e) => {
                handleError(showSnack)(e);
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

/**
 * A mapping of tier to integer for sorting reasons
 */
const TierToInt: Record<UserTier, number> = {
    S: 0,
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    F: 5,
    '?': 6,
};

/**
 * The admin tab of the assignment page
 */
export const AssignmentPageAdminTab = ({ setStage }: { setStage: (stage: Stage) => void }) => {
    const { courseID, assignmentID } = useRouter().query;
    const studentData = useAssignmentAdmin(courseID as string, assignmentID as string);
    const [filterValue, setFilterValue] = useState<string>('');

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const filteredStudentData = useMemo(() => {
        if (!studentData) {
            return [];
        }

        return studentData.filter((student: AssignmentStudentStat) => {
            return (
                student.utorid.toLowerCase().includes(filterValue.toLowerCase()) ||
                `${student.givenName} ${student.surname}`
                    .toLowerCase()
                    .includes(filterValue.toLowerCase())
            );
        });
    }, [studentData, filterValue]);

    const { userInfo } = useContext(UserContext);

    useEffect(() => {
        document.title = `${assignmentID} - Codetierlist`;
    }, [assignmentID]);

    const columns: TableColumnDefinition<AssignmentStudentStat>[] = [
        createTableColumn<AssignmentStudentStat>({
            columnId: 'tier',
            renderHeaderCell: () => 'Tier',
            compare: (a, b) => TierToInt[a.tier] - TierToInt[b.tier],
            renderCell: (item) => (
                <ViewTierlistLink
                    utorid={item.utorid}
                    setStage={setStage}
                    tier={item.tier}
                />
            ),
        }),
        createTableColumn<AssignmentStudentStat>({
            columnId: 'utorid',
            renderHeaderCell: () => 'UTORid',
            compare: (a, b) => a.utorid.localeCompare(b.utorid),
            renderCell: (item) => (
                <ToolTipIcon
                    tooltip="View submission"
                    icon={
                        <Link
                            appearance="subtle"
                            onClick={() => {
                                const params = new URLSearchParams(
                                    searchParams.toString()
                                );
                                params.set('utorid', item.utorid);
                                router
                                    .push(`${pathname}?${params.toString()}`)
                                    .then(() => setStage('upload'));
                            }}
                        >
                            <HighlightSubstring
                                str={item.utorid}
                                substr={filterValue}
                                className="m-r-s"
                            />
                            <Open12Regular />
                        </Link>
                    }
                />
            ),
        }),
        createTableColumn<AssignmentStudentStat>({
            columnId: 'name',
            renderHeaderCell: () => 'Full Name',
            compare: (a, b) => a.givenName.localeCompare(b.givenName),
            renderCell: (item) => (
                <HighlightSubstring
                    str={`${item.givenName} ${item.surname}`}
                    substr={filterValue}
                />
            ),
        }),
        createTableColumn<AssignmentStudentStat>({
            columnId: 'testsPassed',
            renderHeaderCell: () => 'Tests Passed',
            compare: (a, b) => a.testsPassed - b.testsPassed,
            renderCell: (item) => `${item.testsPassed}/${item.totalTests}`,
        }),
        createTableColumn<AssignmentStudentStat>({
            columnId: 'groupNumber',
            renderHeaderCell: () => 'Group Number',
            compare: (a, b) => Number(a.groupNumber ?? 0) - Number(b.groupNumber ?? 0),
            renderCell: (item) => item.groupNumber,
        }),
    ];

    const renderRow: RowRenderer<AssignmentStudentStat> = ({ item, rowId }, style) => (
        <DataGridRow<AssignmentStudentStat> key={rowId} style={style}>
            {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
        </DataGridRow>
    );

    // If the user is not an admin, error 403
    if (!checkIfCourseAdmin(userInfo, courseID as string)) {
        return <Error statusCode={403} />;
    }

    return (
        <section className="p-b-xxxl">
            <HeaderToolbar>
                <AdminToolbarDeleteAssignmentButton
                    courseID={courseID as string}
                    assignmentID={assignmentID as string}
                />
                <AdminToolbarRevalidateAssignmentButton
                    courseID={courseID as string}
                    assignmentID={assignmentID as string}
                />
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

                <DataGrid items={filteredStudentData} columns={columns} sortable>
                    <DataGridHeader>
                        <DataGridRow>
                            {({ renderHeaderCell }) => (
                                <DataGridHeaderCell>
                                    {renderHeaderCell()}
                                </DataGridHeaderCell>
                            )}
                        </DataGridRow>
                    </DataGridHeader>

                    {!studentData && (
                        <Spinner
                            className="m-y-xxxl"
                            labelPosition="below"
                            label="Fetching the latest data for you&hellip;"
                        />
                    )}

                    <DataGridBody<AssignmentStudentStat> itemSize={40} height={500}>
                        {renderRow}
                    </DataGridBody>
                </DataGrid>
            </Card>
        </section>
    );
}
