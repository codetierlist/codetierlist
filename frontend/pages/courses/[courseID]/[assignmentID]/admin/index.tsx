import axios, { handleError } from "@/axios";
import { AdminToolbarDeleteAssignmentButton, HeaderToolbar } from '@/components';
import {
    Button,
    Card,
    Field,
    Input, Link,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Tooltip
} from "@fluentui/react-components";
import { Dismiss24Regular, Search24Regular } from "@fluentui/react-icons";
import {
    AssignmentStudentStats,
    FetchedAssignmentWithTier
} from "codetierlist-types";
import Error from 'next/error';
import {useRouter} from 'next/router';
import {useCallback, useContext, useEffect, useState} from "react";
import { SnackbarContext } from '../../../../../contexts/SnackbarContext';
import {usePathname, useSearchParams} from "next/navigation";

/**
 * Highlights the substring in the string
 * @param str the string to highlight
 * @param substr the substring to highlight
 */
const highlightSubstring = (str: string, substr: string) => {
    const index = str.toLowerCase().indexOf(substr.toLowerCase());
    if (index === -1) {
        return str;
    }

    return (
        <>
            {str.substring(0, index)}
            <strong style={{ color: "var(--colorBrandForeground1)" }}>
                {str.substring(index, index + substr.length)}
            </strong>
            {str.substring(index + substr.length)}
        </>
    );
};

export default function Page() {
    const { courseID, assignmentID } = useRouter().query;
    const { showSnackSev } = useContext(SnackbarContext);
    const [assignment, setAssignment] = useState<FetchedAssignmentWithTier | null>(null);
    const [studentData, setStudentData] = useState<AssignmentStudentStats>([]);
    const [filterValue, setFilterValue] = useState<string>("");
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);

            return params.toString();
        },
        [searchParams]);

    const loadSubmission = (utorid: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("utorid", utorid);
        params.set("stage", "1");
        void router.push(`${pathname}?${params.toString()}`);
    };

    const fetchAssignment = async () => {
        await axios.get<FetchedAssignmentWithTier>(`/courses/${courseID}/assignments/${assignmentID}`, { skipErrorHandling: true })
            .then((res) => {
                setAssignment(res.data);
            })
            .catch(handleError(showSnackSev));
    };

    const fetchAssignmentStats = async () => {
        await axios.get<AssignmentStudentStats>(`/courses/${courseID}/assignments/${assignmentID}/stats`, { skipErrorHandling: true })
            .then((res) => setStudentData(res.data))
            .catch(handleError(showSnackSev));
    };

    useEffect(() => {
        if (!courseID || !assignmentID) {
            return;
        }
        void fetchAssignment();
        void fetchAssignmentStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseID, assignmentID]);

    useEffect(() => {
        document.title = `${assignment?.title || assignmentID} - Codetierlist`;
    }, [assignment, assignmentID]);

    if (!assignment || !courseID || !assignmentID) {
        return <Error statusCode={404} />;
    }

    const columns = [
        { columnKey: "utorid", label: "UTORid" },
        { columnKey: "name", label: "Full Name" },
        { columnKey: "testsPassed", label: "Tests Passed" },
        // { columnKey: "submitSol", label: "Submitted Solutions" },
        // { columnKey: "submitTest", label: "Submitted Tests" }
    ];

    return (
        <section className="p-b-xxxl">
            <HeaderToolbar>
                <AdminToolbarDeleteAssignmentButton assignment={assignment} />
            </HeaderToolbar>

            <Card className="m-x-l m-t-xxl">
                <div className="m-y-s m-x-xxxl">
                    <Field>
                        <Input
                            size="large"
                            placeholder="Search"
                            contentBefore={<Search24Regular />}
                            contentAfter={
                                <>
                                    {
                                        (filterValue !== "") &&
                                        <Tooltip content="Clear search" relationship="label" showDelay={0} hideDelay={300} >
                                            <Button
                                                icon={<Dismiss24Regular />}
                                                appearance="subtle"
                                                onClick={() => setFilterValue("")}
                                            />
                                        </Tooltip>
                                    }
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

                <Table arial-label="Default table" className="m-xs m-t-s">
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
                        {studentData.map((item) => (
                            <TableRow
                                key={item.utorid}
                                style={{
                                    display: (filterValue === "" || item.utorid.includes(filterValue) || (item.givenName + " " + item.surname).includes(filterValue)) ? undefined : "none"
                                }}
                            >
                                <TableCell> {highlightSubstring(item.utorid, filterValue)} </TableCell>
                                <TableCell> {highlightSubstring(`${item.givenName} ${item.surname}`, filterValue)} </TableCell>
                                <TableCell> {item.testsPassed}/{item.totalTests} </TableCell>
                                <TableCell> <Link appearance="subtle" onClick={()=>loadSubmission(item.utorid)}>View Submission</Link> </TableCell>
                                {/*<TableCell> {item.submitTest.label} </TableCell>*/}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </section>
    );
}
