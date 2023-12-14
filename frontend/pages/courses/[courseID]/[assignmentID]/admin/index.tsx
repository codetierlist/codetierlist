import axios, { handleError } from "@/axios";
import { CourseSessionChip, getSession, AdminToolbarDeleteAssignmentButton } from '@/components';
import {
    Card,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow
} from "@fluentui/react-components";
import { Title2 } from '@fluentui/react-text';
import {
    AssignmentStudentStats,
    FetchedAssignmentWithTier,
    FetchedCourseWithTiers
} from "codetierlist-types";
import Error from 'next/error';
import Head from "next/head";
import { notFound } from "next/navigation";
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from "react";
import { SnackbarContext } from '../../../../../contexts/SnackbarContext';
import styles from './page.module.css';

export default function Page() {
    const [course, setCourse] = useState<FetchedCourseWithTiers | null>(null);
    const { courseID, assignmentID } = useRouter().query;
    const { showSnackSev } = useContext(SnackbarContext);
    const [assignment, setAssignment] = useState<FetchedAssignmentWithTier | null>(null);
    const [studentData, setStudentData] = useState<AssignmentStudentStats>([]);

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

    const fetchCourse = async () => {
        if (!courseID) return;
        await axios.get<FetchedCourseWithTiers>(`/courses/${courseID}`, { skipErrorHandling: true })
            .then((res) => setCourse(res.data))
            .catch(e => {
                handleError(showSnackSev)(e);
                notFound();
            });
    };

    useEffect(() => {
        void fetchCourse();
        document.title = `${courseID} - Codetierlist`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseID]);

    useEffect(() => {

        if (!courseID || !assignmentID) {
            return;
        }
        void fetchAssignment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseID, assignmentID]);

    useEffect(() => {
        if (!courseID || !assignmentID) {
            return;
        }
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
                <AdminToolbarDeleteAssignmentButton assignment={assignment} />

                <Card className={styles.mainCard}>
                    <div className={styles.cardContents}>
                        <header className={styles.header}>
                            <Title2 className={styles.courseTitle}>
                                {course &&
                                    <CourseSessionChip
                                        session={getSession(new Date(course.createdAt))}>
                                        {courseID}
                                    </CourseSessionChip>
                                }
                            </Title2>
                            <Title2>{assignment.title}</Title2>
                        </header>

                        <Table arial-label="Default table" className={styles.table}>
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
                                    <TableRow key={item.utorid}>
                                        <TableCell> {item.utorid} </TableCell>
                                        <TableCell> {item.givenName + " " + item.surname} </TableCell>
                                        {/* <TableCell onClick={openRepo(item.gitRepo.label)} style={{ cursor: 'pointer', textDecoration: 'underline' }}> Link </TableCell> */}
                                        <TableCell> {item.testsPassed} </TableCell>
                                        {/*<TableCell> {item.submitSol.label} </TableCell>*/}
                                        {/*<TableCell> {item.submitTest.label} </TableCell>*/}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </main>
        </>
    );
}
