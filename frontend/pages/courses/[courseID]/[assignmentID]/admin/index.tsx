import axios, { handleError } from "@/axios";
import { AssignmentCard, CourseSessionChip, HeaderToolbar, getSession } from '@/components';
import { UserContext } from "@/contexts/UserContext";
import {
    Caption1,
    ToolbarButton
} from "@fluentui/react-components";
import { Add24Filled, PersonAdd24Regular, PersonDelete24Regular } from '@fluentui/react-icons';
import { Title2, Title3 } from '@fluentui/react-text';
import { FetchedCourseWithTiers, FetchedAssignmentWithTier } from "codetierlist-types";
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

    const fetchAssignment = async () => {
        await axios.get<FetchedAssignmentWithTier>(`/courses/${courseID}/assignments/${assignmentID}`, { skipErrorHandling: true })
            .then((res) => setAssignment(res.data))
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

    if (!assignment || !courseID || !assignmentID) {
        return <Error statusCode={404} />;
    }

    // Hard coded data; change later
    const items = [
        {
            utorid: { label: "zhan8725" },
            name: {label: "something"},
            // gitRepo: { label: "https://github.com/" },
            testsPassed: { label: "13/20" },
            tier: { label: "S" },
            submitSol: {label: "5"},
            submitTest: {label: "3"}
        },
        {
            utorid: { label: "zhan8725" },
            name: {label: "something"},
            // gitRepo: { label: "https://github.com/" },
            testsPassed: { label: "13/20" },
            tier: { label: "S" },
            submitSol: {label: "5"},
            submitTest: {label: "3"}
        },
        {
            utorid: { label: "zhan8725" },
            name: {label: "something"},
            // gitRepo: { label: "https://github.com/" },
            testsPassed: { label: "13/20" },
            tier: { label: "S" },
            submitSol: {label: "5"},
            submitTest: {label: "3"}
        },
        {
            utorid: { label: "zhan8725" },
            name: {label: "something"},
            // gitRepo: { label: "https://github.com/" },
            testsPassed: { label: "13/20" },
            tier: { label: "S" },
            submitSol: {label: "5"},
            submitTest: {label: "3"}
        },
    ];
    
    const columns = [
        { columnKey: "utorid", label: "UTORid" },
        { columnKey: "name", label: "Full Name" },
        // { columnKey: "gitRepo", label: "GitHub Repository" },
        { columnKey: "testsPassed", label: "Tests Passed" },
        { columnKey: "submitSol", label: "Submitted Solutions" },
        { columnKey: "submitTest", label: "Submitted Tests" }
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

                <Title3>Student Data</Title3>
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
                        {items.map((item) => (
                            <TableRow key={item.utorid.label}>
                                <TableCell> {item.utorid.label} </TableCell>
                                <TableCell> {item.name.label} </TableCell>
                                {/* <TableCell onClick={openRepo(item.gitRepo.label)} style={{ cursor: 'pointer', textDecoration: 'underline' }}> Link </TableCell> */}
                                <TableCell> {item.testsPassed.label} </TableCell>
                                <TableCell> {item.submitSol.label} </TableCell>
                                <TableCell> {item.submitTest.label} </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </main >
        </>
    );
}
