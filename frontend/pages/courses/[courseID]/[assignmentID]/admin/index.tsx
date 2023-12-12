import axios, { handleError } from "@/axios";
import { CourseSessionChip, HeaderToolbar, getSession } from '@/components';
import { UserContext } from "@/contexts/UserContext";
import {
    ToolbarButton
} from "@fluentui/react-components";
import { Add24Filled, PersonAdd24Regular, PersonDelete24Regular } from '@fluentui/react-icons';
import { Title2, Title3 } from '@fluentui/react-text';
import {
    FetchedCourseWithTiers,
    FetchedAssignmentWithTier,
    AssignmentStudentStats
} from "codetierlist-types";
import { notFound } from "next/navigation";
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from "react";
import { SnackbarContext } from '../../../../../contexts/SnackbarContext';
import styles from './page.module.css';
import Error from 'next/error';
import {
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableHeader,
    TableHeaderCell
} from "@fluentui/react-components";

/**
 * Toolbar for admin page
 * @property {string} courseID the course ID of the course
 * @returns {JSX.Element} the toolbar
 */
const AdminToolbar = ({ courseID }: { courseID: string, fetchCourse: () => Promise<void> }) => {
    const router = useRouter();

    return (
        <HeaderToolbar
            aria-label="Admin Toolbar"
        >
            <ToolbarButton
                appearance="subtle"
                icon={<PersonAdd24Regular />}
                onClick={() => router.push(`/courses/${courseID}/admin/enroll`)}
            >
                Enroll Students
            </ToolbarButton>

            <ToolbarButton
                appearance="subtle"
                icon={<PersonDelete24Regular />}
                onClick={() => router.push(`/courses/${courseID}/admin/remove`)}
            >
                Remove Students
            </ToolbarButton>

            <ToolbarButton
                appearance="subtle"
                icon={<Add24Filled />}
                onClick={() => router.push(`/courses/${courseID}/admin/create_assignment`)}
            >
                Add assignment
            </ToolbarButton>
        </HeaderToolbar>
    );
};

export default function Page() {
    const { userInfo } = useContext(UserContext);
    const [course, setCourse] = useState<FetchedCourseWithTiers | null>(null);
    const { courseID, assignmentID } = useRouter().query;
    const { showSnackSev } = useContext(SnackbarContext);
    const [assignment, setAssignment] = useState<FetchedAssignmentWithTier | null>(null);
    const [studentData, setStudentData] = useState<AssignmentStudentStats>([]);
    const fetchAssignment = async () => {
        await axios.get<FetchedAssignmentWithTier>(`/courses/${courseID}/assignments/${assignmentID}`, { skipErrorHandling: true })
            .then((res) => setAssignment(res.data))
            .catch(e => {
                handleError(e.message, showSnackSev);
            });
    };
    const fetchAssignmentStats = async () => {
        await axios.get<AssignmentStudentStats>(`/courses/${courseID}/assignments/${assignmentID}/stats`, { skipErrorHandling: true })
            .then((res) => setStudentData(res.data))
            .catch(e => {
                handleError(e.message, showSnackSev);
            });
    };

    const fetchCourse = async () => {
        if (!courseID) return;
        await axios.get<FetchedCourseWithTiers>(`/courses/${courseID}`, { skipErrorHandling: true })
            .then((res) => setCourse(res.data))
            .catch(e => {
                handleError(e.message, showSnackSev);
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
            {userInfo.admin ? <AdminToolbar courseID={courseID as string} fetchCourse={fetchCourse} /> : undefined}

            <main>
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

                {/* <Title3>Student Data</Title3> */}
                <Table arial-label="Default table">
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
            </main >
        </>
    );
}
