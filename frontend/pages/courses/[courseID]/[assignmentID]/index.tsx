// import { CourseSessionChip, AssignmentCard } from '@/components';
import styles from './page.module.css';
import { Subtitle2, Title2, Title1 } from '@fluentui/react-text';
import Error from 'next/error';
import { useRouter } from 'next/router';
import { TierChip, colourHash } from '@/components';
import { Button, Card, CardHeader, Title3 } from '@fluentui/react-components';
import { Add16Regular, Clock16Regular } from '@fluentui/react-icons';
import { convertDate, convertTime } from '../../../../components/utils/TimeUtils/TimeUtils';
import { CheckedTodoItem } from '@/components/CheckedTodo/CheckedTodo';
import Editor from '@monaco-editor/react';

// TODO: clean technical debt

const assignment = {
    dueDate: new Date(),
    tier: '?',
    uploadedTests: [],
    uploadedSolutions: ['solution1.py']
};

export default function Page() {
    const router = useRouter();

    // TODO: guard against invalid courseID, invalid assignmentID
    //eslint-disable-next-line no-constant-condition
    if (false) { // your code goes here
        return <Error statusCode={404} />;
    }

    const { courseID, assignmentID } = router.query;

    return (
        <main className="container-fluid">
            <Card className={styles.header}>
                <div className={"d-flex justify-content-between"}>
                    <div className={styles.assignmentHeaderContent + " flex-column d-flex"}>
                        <CardHeader
                            header={
                                <>
                                    <Clock16Regular className={styles.dueDateIcon} />
                                    <Subtitle2 className={styles.dueDate}>
                                        Due {convertDate(assignment.dueDate)} at {convertTime(assignment.dueDate)}
                                    </Subtitle2>
                                </>
                            }
                        />
                        <Title2>
                            <span className={colourHash(courseID) + ' ' + styles.courseCode}>
                                {courseID}
                            </span>
                            {assignmentID}
                        </Title2>
                    </div>
                    <div>
                        <TierChip tier={assignment.tier} />
                    </div>
                </div>
            </Card>

            <div className="mt-4 mb-4">
                <Button appearance="primary">
                    Submit a test
                </Button>
                <Button className="mx-2">
                    Upload a solution
                </Button>
                <Button disabled={assignment.tier === "?"}>
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
                            <CheckedTodoItem todo="Submit a valid test" checked={assignment.uploadedTests.length > 0} />
                            <CheckedTodoItem todo="Submit your code" checked={assignment.uploadedSolutions.length > 0} />
                            <CheckedTodoItem todo="View tier list" checked={assignment.tier !== "?"} />
                        </div>
                    </Card>

                    <Card className="mb-5">
                        <CardHeader
                            header={<Title3>Uplodaded Tests</Title3>}
                        />
                        {
                            assignment.uploadedTests.length === 0 && (
                                <p>No tests uploaded yet</p>
                            )
                        }
                        <ul className={"d-flex flex-column " + styles.uploadedTests}>
                            {assignment.uploadedTests.map((test, index) => (
                                <li className={styles.uploadedTest} key={index}>{test}</li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="mb-5">
                        <CardHeader
                            header={<Title3>Uplodaded Solutions</Title3>}
                        />
                        {
                            assignment.uploadedSolutions.length === 0 && (
                                <p>No solutions uploaded yet</p>
                            )
                        }
                        <ul className={"d-flex flex-column " + styles.uploadedSolutions}>
                            {assignment.uploadedSolutions.map((test, index) => (
                                <li className={styles.uploadedTest} key={index}>{test}</li>
                            ))}
                        </ul>
                    </Card>
                </div>
                <div className="col-12 col-lg-8 mt-4">
                    <div className="d-flex justify-content-between">
                        <Title1>Upload Test</Title1>
                        <Button appearance="subtle">
                            <Add16Regular />
                            Upload test
                        </Button>
                    </div>
                    <Card className={"mt-4 d-flex flex-column " + styles.editor}>
                        {
                            assignment.uploadedTests.length > 0 ? (
                                <Editor
                                    defaultLanguage="python"
                                    defaultValue='sdfasdf'
                                    height="90vh"
                                    options={{ readOnly: true }}
                                    theme="light"
                                />
                            ) : (
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                    <Title2>
                                        Nothing to see here...
                                    </Title2>
                                    <p>
                                        Upload a test to get started!
                                    </p>
                                </div>
                            )
                        }
                    </Card>
                    <div className="d-flex justify-content-end mt-4">
                        <Button appearance="primary">
                            Submit
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
