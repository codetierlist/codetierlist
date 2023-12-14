import axios, { handleError } from "@/axios";
import {
    Monaco,
    TestCaseStatus,
    promptForFileObject
} from '@/components';
import { SnackbarContext } from "@/contexts/SnackbarContext";
import flex from '@/styles/flex-utils.module.css';
import {
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    Button, Caption1, Card,
    Subtitle1,
    Text,
    Tooltip
} from '@fluentui/react-components';
import {
    Add24Filled,
    Delete16Filled
} from '@fluentui/react-icons';
import {
    Commit,
    FetchedAssignmentWithTier
} from "codetierlist-types";
import { useContext, useEffect, useState } from 'react';
import styles from './AssignmentPageFilesTab.module.css';

/**
 * A list of files for a commit
 *
 * @param {Commit} commit the commit to display
 * @param {"testcases" | "submissions"} route the route to use
 * @param {FetchedAssignmentWithTier} assignment the assignment to display
 * @param {string} assignmentID the ID of the assignment
 * @param {() => void} update a function to call when the files are updated
 *
 * @returns {JSX.Element} the list of files
 */
const ListFiles = ({ commit, route, assignment, assignmentID, update }: { commit: Commit, route: "testcases" | "submissions", assignment: FetchedAssignmentWithTier, assignmentID: string, update?: () => void }) => {
    const { showSnackSev } = useContext(SnackbarContext);
    const [files, setFiles] = useState<{ [key: string]: string }>({});

    const getFileContents = async (file: string) => {
        await axios.get<string>(`/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/${commit.log[0]}/${file}`, { skipErrorHandling: true })
            .then((res) => {
                // read the file contents from buffer
                setFiles((prev) => {
                    return { ...prev, [file]: Buffer.from(res.data).toString("utf-8") };
                });
            })
            .catch(handleError(showSnackSev));
    };

    const deleteFile = async (file: string) => {
        await axios.delete(`/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/${file}`, { skipErrorHandling: true })
            .then(() => {
                update && update();
                showSnackSev("File deleted", "success");
            })
            .catch(handleError(showSnackSev));
    };

    useEffect(() => {
        if (commit.files) {
            setFiles({});

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            Object.keys(commit.files).forEach((_, file) => {
                void getFileContents(commit.files[file]);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [commit, assignment, route]);

    return (
        commit.files && Object.keys(commit.files).length === 0 ? (
            <Caption1>No files uploaded yet</Caption1>
        ) : (
            <Accordion collapsible>
                {
                    Object.keys(commit.files).map((key, index) => (
                        <AccordionItem value={index} key={key}>
                            <AccordionHeader className={`${styles.accordionHeader}`}>
                                <div className={`${flex["d-flex"]} ${flex["justify-content-between"]} ${flex["align-items-center"]} ${styles.accordionHeaderContent}`}>
                                    <span>{commit.files[index]}</span>

                                    <Tooltip content="Delete file" relationship="label">
                                        <Button icon={<Delete16Filled />} onClick={() => deleteFile(commit.files[index])} />
                                    </Tooltip>
                                </div>
                            </AccordionHeader>
                            <AccordionPanel>
                                <pre>
                                    <Monaco
                                        height="50vh"
                                        language="python"
                                        value={files[commit.files[index]]}
                                        options={{
                                            readOnly: true
                                        }}
                                    />
                                </pre>
                            </AccordionPanel>
                        </AccordionItem>
                    ))
                }
            </Accordion>
        )
    );
};

/**
 * A tab that displays the files for an assignment
 *
 * @param {() => Promise<void>} fetchAssignment a function that fetches the assignment
 * @param {FetchedAssignmentWithTier} assignment the assignment to display
 * @param {string} assignmentID the ID of the assignment
 * @param {string} routeName the name of the route
 * @param {"testcases" | "submissions"} route the route to use
 *
 * @returns {JSX.Element} the files tab
 */
export const AssignmentPageFilesTab = ({ fetchAssignment, assignment, assignmentID, routeName, route }: { fetchAssignment: () => Promise<void>, assignment: FetchedAssignmentWithTier, assignmentID: string, routeName: string, route: "testcases" | "submissions" }) => {
    const [content, setContent] = useState<Commit>({ "files": [], "log": [] } as Commit);
    const { showSnackSev } = useContext(SnackbarContext);

    const getTestData = async () => {
        await axios.get<Commit>(`/courses/${assignment.course_id}/assignments/${assignmentID}/${route}`, { skipErrorHandling: true })
            .then((res) => setContent(res.data))
            .catch(e => {
                handleError(showSnackSev)(e);
                setContent({ "files": [], "log": [] } as Commit);
            });
    };

    const submitTest = async (files: FileList) => {
        const formData = new FormData();
        for (let i = 0; i < files!.length; i++) {
            formData.append("files", files![i]);
        }

        axios.post(`/courses/${assignment.course_id}/assignments/${assignmentID}/${route}`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" }
            })
            .then(() => {
                fetchAssignment();
            })
            .catch(handleError(showSnackSev));
    };

    useEffect(() => {
        void getTestData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignmentID, fetchAssignment, route, routeName, assignment.submissions]);

    return (
        <div className="m-y-xxxl">
            <div className={`${flex["d-flex"]} ${flex["justify-content-between"]}`}>
                <Subtitle1 className={styles.testCaseHeader} block>Uploaded {routeName}s <TestCaseStatus status={content.valid} /></Subtitle1>
                <Button
                    icon={<Add24Filled />}
                    appearance="subtle"
                    onClick={async () => {
                        promptForFileObject(".py", true)
                            .then(file => {
                                if (file) {
                                    submitTest(file);
                                }
                            })
                            .catch(handleError(showSnackSev));
                    }}
                >
                    Upload a {routeName}
                </Button>
            </div>

            <Text block className={styles.commitId} font="numeric">{content.log[0]}</Text>

            <Card>
                <ListFiles
                    commit={content}
                    route={route}
                    assignment={assignment}
                    assignmentID={assignmentID}
                    update={getTestData}
                />
            </Card>
        </div>
    );
};
