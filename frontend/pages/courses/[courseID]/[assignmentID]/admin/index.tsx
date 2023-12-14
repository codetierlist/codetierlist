import axios, { handleError } from "@/axios";
import { CourseSessionChip, HeaderToolbar, getSession } from '@/components';
import { UserContext } from "@/contexts/UserContext";
import {
    ToolbarButton
} from "@fluentui/react-components";
import { Add24Filled, PersonAdd24Regular, PersonDelete24Regular, ArrowLeft24Regular, HatGraduation24Filled } from '@fluentui/react-icons';
import { Title2 } from '@fluentui/react-text';
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
    TableHeaderCell,
    Card
} from "@fluentui/react-components";
import Head from "next/head";
import {isProfForCourse} from "@/components/utils/Permissions/checkPermissions";

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
                appearance="primary"
                icon={<HatGraduation24Filled />}
                onClick={() => router.push(`/courses/${courseID}/${router.query.assignmentID}`)}
            >
                Student View
            </ToolbarButton>

            <ToolbarButton
                appearance="subtle"
                icon={<PersonAdd24Regular />}
                onClick={() => router.push(`/courses/${courseID}/admin/add`)}
            >
                Add People
            </ToolbarButton>

            <ToolbarButton
                appearance="subtle"
                icon={<PersonDelete24Regular />}
                onClick={() => router.push(`/courses/${courseID}/admin/remove`)}
            >
                Remove People
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

// Future extension: filestab content
// const FilesTab = ({ fetchAssignment, assignment, assignmentID, routeName, route }: { fetchAssignment: () => Promise<void>, assignment: FetchedAssignmentWithTier, assignmentID: string, routeName: string, route: "testcases" | "submissions" }) => {
//     const [content, setContent] = useState<Commit>({ "files": [], "log": [] } as Commit);
//     const { showSnackSev } = useContext(SnackbarContext);

//     const getTestData = async () => {
//         await axios.get<Commit>(`/courses/${assignment.course_id}/assignments/${assignmentID}/${route}`, { skipErrorHandling: true })
//             .then((res) => setContent(res.data))
//             .catch(e => {
//                 handleError(showSnackSev)(e);
//                 setContent({ "files": [], "log": [] } as Commit);
//             });
//     };

//     const submitTest = async (files: FileList) => {
//         const formData = new FormData();
//         for (let i = 0; i < files!.length; i++) {
//             formData.append("files", files![i]);
//         }

//         axios.post(`/courses/${assignment.course_id}/assignments/${assignmentID}/${route}`,
//             formData,
//             {
//                 headers: { "Content-Type": "multipart/form-data" }
//             })
//             .then(() => {
//                 fetchAssignment();
//             })
//             .catch(handleError(showSnackSev));
//     };

//     useEffect(() => {
//         void getTestData();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [assignmentID, fetchAssignment, route, routeName, assignment.submissions]);

//     return (
//         <div className={styles.gutter}>
//             <div className={`${flex["d-flex"]} ${flex["justify-content-between"]}`}>
//                 <Subtitle1 block>Uploaded {routeName}s <TestCaseStatus status={content.valid}/></Subtitle1>
//                 <Button
//                     icon={<Add24Filled />}
//                     appearance="subtle"
//                     onClick={async () => {
//                         promptForFileObject(".py", true)
//                             .then(file => {
//                                 if (file) {
//                                     submitTest(file);
//                                 }
//                             })
//                             .catch(handleError(showSnackSev));
//                     }}
//                 >
//                     Upload a {routeName}
//                 </Button>
//             </div>

//             <Text block className={styles.commitId} font="numeric">{content.log[0]}</Text>

//             <Card>
//                 <ListFiles
//                     commit={content}
//                     route={route}
//                     assignment={assignment}
//                     assignmentID={assignmentID}
//                     update={getTestData}
//                 />
//             </Card>
//         </div>
//     );
// };

export default function Page() {
    const { userInfo } = useContext(UserContext);
    const [course, setCourse] = useState<FetchedCourseWithTiers | null>(null);
    const { courseID, assignmentID } = useRouter().query;
    const { showSnackSev } = useContext(SnackbarContext);
    const [assignment, setAssignment] = useState<FetchedAssignmentWithTier | null>(null);
    const [studentData, setStudentData] = useState<AssignmentStudentStats>([]);
    const router = useRouter();

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

            {userInfo.admin || isProfForCourse(userInfo, courseID as string) ? <AdminToolbar courseID={courseID as string} fetchCourse={fetchCourse} /> : undefined}

            <main>
                <HeaderToolbar>
                    <ToolbarButton
                        icon={<ArrowLeft24Regular />}
                        onClick={() => router.push(`/courses/${router.query.courseID}`)}
                    >
                        Back to Course
                    </ToolbarButton>
                </HeaderToolbar>

                {/* Future extension: create tab system
                <Tab value="tab0" onClick={() => setStage(0)}>
                    Assignment details
                </Tab>
                <Tab value="tab1" onClick={() => setStage(1)}>
                    Upload
                </Tab> */}

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

                {/* Future extension: Upload content from frontend
                <div className={`${styles.gutter} ${styles.massiveGap}`}>
                            <FilesTab
                                routeName="solution"
                                route="submissions"
                                fetchAssignment={fetchAssignment}
                                assignment={assignment}
                                assignmentID={assignmentID as string}
                            />

                            <FilesTab
                                routeName="test"
                                route="testcases"
                                fetchAssignment={fetchAssignment}
                                assignment={assignment}
                                assignmentID={assignmentID as string}
                            />
                        </div> */}
            </main >
        </>
    );
}
