import { CourseSessionChip } from '@/components';
// import { type Course, getCourses } from '@/contexts/UserContext';
import axios from "@/axios";
import { UserContext } from "@/contexts/UserContext";
import {
    Toolbar,
    ToolbarButton
} from "@fluentui/react-components";
import { Title2 } from '@fluentui/react-text';
import { FetchedCourseWithTiers } from "codetierlist-types";
import { notFound } from "next/navigation";
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from "react";
import styles from './page.module.css';
import { FetchedAssignmentWithTier } from "codetierlist-types";
import Error from 'next/error';

import {
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableHeader,
    TableHeaderCell
} from "@fluentui/react-components";

// import { notFound } from 'next/navigation';
import { Add24Filled, Shield24Filled, PersonAdd24Regular } from '@fluentui/react-icons';

export default function Page() {
    const { userInfo } = useContext(UserContext);
    const [course, setCourse] = useState<FetchedCourseWithTiers | null>(null);
    const [assignment, setAssignment] = useState<FetchedAssignmentWithTier | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [showEnrollDialog, setShowEnrollDialog] = useState(false);
    const router = useRouter();

    // TODO: guard against invalid courseID, invalid assignmentID
    const { courseID, assignmentID } = router.query;

    const fetchAssignment = async () => {
        await axios.get<FetchedAssignmentWithTier>(`/courses/${courseID}/${assignmentID}`, { skipErrorHandling: true }).then((res) => setAssignment(res.data)).catch(e => {
            // console.log(e);
            notFound();
        });
    };

    useEffect(() => {
        if (!courseID || !assignmentID) {
            return;
        }
        void fetchAssignment();
    }, [courseID, assignmentID]);

    if (!courseID || !assignmentID) {
        return <Error statusCode={404} />;
    }
    if (!assignment) {
        return <p>Loading...</p>;
    }

    // Hard coded data; change later
    const items = [
        {

            utorid: { label: "zhan8725" },
            name: {label: "something"},
            gitRepo: { label: "https://github.com/" },
            bestMark: { label: "13/20" },
            tier: { label: "S" },
            submissions: {label: "5"}
        },
        {
            utorid: { label: "zhan8725" },
            name: {label: "something"},
            gitRepo: { label: "https://github.com/" },
            bestMark: { label: "15/20" },
            tier: { label: "C" },
            submissions: {label: "5"}
        },
        {
            utorid: { label: "zhan8725" },
            name: {label: "something"},
            gitRepo: { label: "https://github.com/" },
            bestMark: { label: "9/20" },
            tier: { label: "B" },
            submissions: {label: "5"}
        },
        {
            utorid: { label: "zhan8725" },
            name: {label: "something"},
            gitRepo: { label: "https://github.com/" },
            bestMark: { label: "17/20" },
            tier: { label: "A" },
            submissions: {label: "5"}
        },
    ];

    const columns = [
        { columnKey: "utorid", label: "UTORid" },
        { columnKey: "name", label: "Full Name" },
        // { columnKey: "gitRepo", label: "GitHub Repository" },
        { columnKey: "bestMark", label: "Best Mark" },
        { columnKey: "submissions", label: "Submissions" }
    ];

    // const openRepo = (url: string) => () => {
    //     window.open(url, '_blank');
    //   };

    return (
        <>
            {
                userInfo.admin ? (
                    <Toolbar
                        aria-label="Large Toolbar"
                        size="large"
                        className={styles.toolbar}
                    >
                        <ToolbarButton
                            appearance="primary"
                            icon={<Shield24Filled />}
                            onClick={() => router.push(`/courses/${courseID}/admin`)}
                        >
                            Admin page
                        </ToolbarButton>

                        <ToolbarButton
                            appearance="subtle"
                            icon={<PersonAdd24Regular />}
                            onClick={() => setShowEnrollDialog(true)}
                        >
                            Enroll Students
                        </ToolbarButton>

                        <ToolbarButton
                            appearance="subtle"
                            icon={<Add24Filled />}
                            onClick={() => setShowDialog(true)}
                        >
                            Add assignment
                        </ToolbarButton>
                    </Toolbar>
                ) : undefined
            }


            <main>
                <header className={styles.header}>
                    <Title2>
                        <CourseSessionChip session="Fall">
                            {courseID}
                        </CourseSessionChip>
                    </Title2>
                    <Title2>
                        {assignment.title}
                    </Title2>
                </header>

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
                                <TableCell> {item.bestMark.label} </TableCell>
                                <TableCell> {item.submissions.label} </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </main >
        </>
    );
}
