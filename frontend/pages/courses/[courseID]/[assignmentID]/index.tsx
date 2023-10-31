// import { CourseSessionChip, AssignmentCard } from '@/components';
import styles from './page.module.css';
import {Subtitle2, Title1, Title2} from '@fluentui/react-text';
import Error from 'next/error';
import {useRouter} from 'next/router';
import {
    colourHash,
    convertDate,
    convertTime,
    TierChip,
    TierList
} from '@/components';
import {Button, Card, CardHeader, Title3} from '@fluentui/react-components';
import {Add16Regular, Clock16Regular} from '@fluentui/react-icons';
import {CheckedTodoItem} from '@/components/CheckedTodo/CheckedTodo';
import Editor from '@monaco-editor/react';
import {useEffect, useState} from 'react';
import {FetchedAssignmentWithTier, Tierlist} from "codetierlist-types";
import axios from "@/axios";
import {notFound} from "next/navigation";

// TODO: clean technical debt

const UploadHeader = ({title, action}: { title: string, action: () => void }) => {
    return (
        <div className="d-flex justify-content-between">
            <Title1>{title}</Title1>
            <Button appearance="subtle" onClick={() => action()}
                icon={<Add16Regular/>}>
                Upload {title.toLowerCase()}
            </Button>
        </div>
    );
};

const NoUploadPlaceholder = ({title}: { title: string }) => {
    return (
        <>
            <div
                className="d-flex flex-column align-items-center justify-content-center h-100">
                <Title2>
                    Nothing to see here...
                </Title2>
                <p>
                    Upload a {title} to get started!
                </p>
            </div>
        </>
    );
};

const uploader = (url: string, fetchAssignment: ()=>void) => () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.type = 'file';
    input.name = 'files';
    input.oninput = async () => {
        const formData = new FormData();
        const filesLength=input.files!.length;
        for(let i=0;i<filesLength;i++){
            formData.append("files", input.files![i]);
        }
        await axios.post<void>(url, formData, {headers:{
            'Content-Type': 'multipart/form-data'
        }});
        document.body.removeChild(form);
        fetchAssignment();
    };
    document.body.append(form);
    input.click();
};

const TestUpload = ({uploadedTests, fetchAssignment}: { uploadedTests: unknown[], fetchAssignment: ()=>void }) => {
    const router = useRouter();
    const {courseID, assignmentID} = router.query;
    return (
        <div className="col-12 col-lg-8 mt-4">
            <UploadHeader title="Test" action={() => {
            }}/>
            <Card className={"mt-4 d-flex flex-column " + styles.editor}>
                {uploadedTests.length === 0 ? (
                    <NoUploadPlaceholder title="test"/>
                ) : (
                    <Editor
                        defaultLanguage="python"
                        defaultValue='sdfasdf'
                        height="90vh"
                        options={{readOnly: true}}
                        theme="light"
                    />
                )}
            </Card>
            <div className="d-flex justify-content-end mt-4">
                <Button appearance="primary"
                    onClick={uploader(`/courses/${courseID}/assignments/${assignmentID}/testcases`, fetchAssignment)}>
                    Submit
                </Button>
            </div>
        </div>
    );
};
const SolutionUpload = ({uploadedSolutions, fetchAssignment}: { uploadedSolutions: unknown[],  fetchAssignment: ()=>void }) => {
    const router = useRouter();
    const {courseID, assignmentID} = router.query;
    return (
        <div className="col-12 col-lg-8 mt-4">
            <UploadHeader title="Solution" action={() => {
            }}/>
            <Card className={"mt-4 d-flex flex-column " + styles.editor}>
                {
                    uploadedSolutions.length === 0 ? (
                        <NoUploadPlaceholder title="solution"/>
                    ) :
                        (
                            <Editor
                                defaultLanguage="python"
                                defaultValue='sdfasdf'
                                height="90vh"
                                options={{readOnly: true}}
                                theme="light"
                            />
                        )
                }

            </Card>
            <div className="d-flex justify-content-end mt-4">
                <Button appearance="primary"
                    onClick={()=>{
                        console.log("test");
                        uploader(`/courses/${courseID}/assignments/${assignmentID}/submissions`, fetchAssignment)();
                    }}>
                    Submit
                </Button>
            </div>
        </div>
    );
};

const ViewTierList = ({tierlist}: { tierlist: Tierlist }) => {
    return (
        <div className="col-12 col-lg-8 mt-4">
            <Title2>
                Tier List
            </Title2>
            <Card className="mt-4">
                <TierList tierlist={tierlist}/>
            </Card>
        </div>
    );
};

export default function Page() {
    const router = useRouter();
    const [stage, setStage] = useState(0);
    const [assignment, setAssignment] = useState<FetchedAssignmentWithTier | null>(null);
    const [tierlist, setTierlist] = useState<Tierlist | null>(null);
    const [solutionContent, setSolutionContent] = useState<string>("");
    const [testContent, setTestContent] = useState<string>("");

    // TODO: guard against invalid courseID, invalid assignmentID
    const {courseID, assignmentID} = router.query;

    const fetchAssignment = async () => {
        await axios.get<FetchedAssignmentWithTier>(`/courses/${courseID}/assignments/${assignmentID}`, {skipErrorHandling: true}).then((res) => setAssignment(res.data)).catch(e => {
            console.log(e);
            notFound();
        });
    };
    const fetchTierlist = async () => {
        await axios.get<Tierlist>(`/courses/${courseID}/assignments/${assignmentID}/tierlist`, {skipErrorHandling: true}).then((res) => setTierlist(res.data)).catch(e => {
            console.log(e);
            notFound();
        });
    };
    useEffect(() => {
        if (!courseID || !assignmentID) {
            return;
        }
        void fetchAssignment();
        void fetchTierlist();
    }, [courseID, assignmentID]);

    if (!courseID || !assignmentID) {
        return <Error statusCode={404}/>;
    }
    if (!assignment) {
        return <p>Loading...</p>;
    }
    return (
        <main className="container">
            <Card className={styles.header}>
                <div className={"d-flex justify-content-between"}>
                    <div
                        className={styles.assignmentHeaderContent + " flex-column d-flex"}>
                        <CardHeader
                            header={
                                <>
                                    <Clock16Regular
                                        className={styles.dueDateIcon}/>
                                    <Subtitle2 className={styles.dueDate}>
                                        Due {convertDate(assignment.due_date)} at {convertTime(assignment.due_date)}
                                    </Subtitle2>
                                </>
                            }
                        />
                        <Title2>
                            <span
                                className={colourHash(courseID as string) + ' ' + styles.courseCode}>
                                {courseID}
                            </span>
                            {assignment.title}
                        </Title2>
                    </div>
                    <div>
                        <TierChip tier={assignment.tier}/>
                    </div>
                </div>
            </Card>

            <div className="mt-4 mb-4">
                <Button appearance="primary" onClick={() => setStage(1)}>
                    Submit a test
                </Button>
                <Button className="mx-2" onClick={() => setStage(2)}>
                    Upload a solution
                </Button>
                <Button disabled={assignment.tier === "?"}
                    onClick={() => setStage(3)}>
                    View tier list
                </Button>
            </div>

            <div className="row">
                <div className="col-12 col-lg-4 mt-4">
                    <Card className="mb-5">
                        <CardHeader
                            header={<Title3>Status</Title3>}
                        />
                        <div className="d-flex flex-column">
                            <Button onClick={() => setStage(1)}
                                appearance="subtle" className="d-block">
                                <CheckedTodoItem todo="Submit a valid test"
                                    checked={assignment.test_cases.length > 0}/>
                            </Button>
                            <Button onClick={() => setStage(2)}
                                appearance="subtle" className="d-block">
                                <CheckedTodoItem todo="Submit your code"
                                    checked={assignment.submissions.length > 0}/>
                            </Button>
                            <Button onClick={() => setStage(3)}
                                appearance="subtle" className="d-block"
                                disabled={assignment.tier === "?"}>
                                <CheckedTodoItem todo="View tier list"
                                    checked={assignment.tier !== "?"}/>
                            </Button>
                        </div>
                    </Card>

                    <Card className="mb-5">
                        <CardHeader
                            header={<Title3>Uplodaded Tests</Title3>}
                        />
                        {
                            assignment.test_cases.length === 0 && (
                                <p>No tests uploaded yet</p>
                            )
                        }
                        <ul className={"d-flex flex-column " + styles.uploadedTests}>
                            {assignment.test_cases.map((test, index) => (
                                // TODO this is not very informative
                                <li className={styles.uploadedTest}
                                    key={index}>{test.git_id}</li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="mb-5">
                        <CardHeader
                            header={<Title3>Uplodaded Solutions</Title3>}
                        />
                        {
                            assignment.submissions.length === 0 && (
                                <p>No solutions uploaded yet</p>
                            )
                        }
                        <ul className={"d-flex flex-column " + styles.uploadedSolutions}>
                            {assignment.submissions.map((test, index) => (
                                <li className={styles.uploadedTest}
                                    key={index}>{test.git_id}</li>
                            ))}
                        </ul>
                    </Card>
                </div>
                {
                    stage === 1 && (
                        <TestUpload uploadedTests={assignment.test_cases} fetchAssignment={fetchAssignment}/>
                    )
                }{
                    stage === 2 && (
                        <SolutionUpload uploadedSolutions={assignment.submissions} fetchAssignment={fetchAssignment}/>
                    )
                }{
                    stage === 3 && (
                        tierlist ?
                            <ViewTierList tierlist={tierlist}/> : "No tierlist found"
                    )
                }
            </div>
        </main>
    );
}
