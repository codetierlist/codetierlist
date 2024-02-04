import axios, { handleError } from "@/axios";
import { AdminToolbarDeleteAssignmentButton, HeaderToolbar } from '@/components';
import {
    Card,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    Tooltip,
    TableRow,
    Button,
    Field,
    Input
} from "@fluentui/react-components";
import {
    AssignmentStudentStats,
    FetchedAssignmentWithTier
} from "codetierlist-types";
import Error from 'next/error';
import Head from "next/head";
import { Search24Regular, Dismiss24Regular } from "@fluentui/react-icons";
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from "react";
import { SnackbarContext } from '../../../../../contexts/SnackbarContext';

export default function Page() {
    const { courseID, assignmentID } = useRouter().query;

    useEffect(() => {
        document.title = `${courseID} - Codetierlist`;
    }, [courseID]);

    const { showSnackSev } = useContext(SnackbarContext);
    const [assignment, setAssignment] = useState<FetchedAssignmentWithTier | null>(null);
    const [studentData, setStudentData] = useState<AssignmentStudentStats>([]);
    const [filterValue, setFilterValue] = useState<string>("");

    const fetchAssignment = async () => {
        await axios.get<FetchedAssignmentWithTier>(`/courses/${courseID}/assignments/${assignmentID}`, { skipErrorHandling: true })
            .then((res) => setAssignment(res.data))
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


    if (!assignment || !courseID || !assignmentID) {
        return <Error statusCode={404} />;
    }

    const columns = [
        { columnKey: "utorid", label: "UTORid" },
        { columnKey: "name", label: "Full Name" },
        // { columnKey: "gitRepo", label: "GitHub Repository" },
        { columnKey: "testsPassed", label: "Tests Passed" },
        // { columnKey: "submitSol", label: "Submitted Solutions" },
        // { columnKey: "submitTest", label: "Submitted Tests" }
    ];

    return (
        <>
            <Head>
                <title>{assignment.title} - Codetierlist</title>
            </Head>

            <main>
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
                                onChange={(e) => setFilterValue(e.target.value)}
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
                                    hidden={
                                        !item.utorid.includes(filterValue) &&
                                        !item.givenName.includes(filterValue) &&
                                        !item.surname.includes(filterValue)
                                    }
                                >
                                    <TableCell> {item.utorid} </TableCell>
                                    <TableCell> {item.givenName + " " + item.surname} </TableCell>
                                    {/* <TableCell onClick={openRepo(item.gitRepo.label)} style={{ cursor: 'pointer', textDecoration: 'underline' }}> Link </TableCell> */}
                                    <TableCell> {item.testsPassed}/{item.totalTests} </TableCell>
                                    {/*<TableCell> {item.submitSol.label} </TableCell>*/}
                                    {/*<TableCell> {item.submitTest.label} </TableCell>*/}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </main>
        </>
    );
}
