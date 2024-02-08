import axios, { handleError } from '@/axios';
import { Monaco, TestCaseStatus, promptForFileObject } from '@/components';
import { SnackbarContext } from '@/contexts/SnackbarContext';
import {
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    Button,
    Caption1,
    Card,
    Subtitle1,
    Text,
    Tooltip,
} from '@fluentui/react-components';
import { Add24Filled, Delete16Filled } from '@fluentui/react-icons';
import { Commit, UserFetchedAssignment } from 'codetierlist-types';
import { useContext, useEffect, useState, useCallback } from 'react';
import styles from './AssignmentPageFilesTab.module.css';
import { useSearchParams } from 'next/navigation';

interface ListFilesProps {
    /** the commit to display */
    commit: Commit;
    /** the route to use */
    route: 'testcases' | 'submissions';
    /** the assignment to display */
    assignment: UserFetchedAssignment;
    /** the ID of the assignment */
    assignmentID: string;
    /** a function to call when the files are updated */
    update?: () => void;
}

/**
 * A list of files for a commit
 *
 * @returns {JSX.Element} the list of files
 */
const ListFiles = ({
    commit,
    route,
    assignment,
    assignmentID,
    update,
}: ListFilesProps) => {
    const { showSnackSev } = useContext(SnackbarContext);
    const [files, setFiles] = useState<{ [key: string]: string }>({});
    const searchParams = useSearchParams();

    const getFileContents = async (file: string) => {
        await axios
            .get<string>(
                `/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/${commit.log[0]}/${file}`,
                {
                    skipErrorHandling: true,
                    params: {
                        utorid: searchParams.get('utorid') ?? undefined,
                    },
                }
            )
            .then((res) => {
                // read the file contents from buffer
                setFiles((prev) => {
                    return {
                        ...prev,
                        [file]: Buffer.from(res.data).toString('utf-8'),
                    };
                });
            })
            .catch(handleError(showSnackSev));
    };

    const deleteFile = async (file: string) => {
        await axios
            .delete(
                `/courses/${assignment.course_id}/assignments/${assignmentID}/${route}/${file}`,
                {
                    skipErrorHandling: true,
                }
            )
            .then(() => {
                update && update();
                showSnackSev('File deleted', 'success');
            })
            .catch(handleError(showSnackSev));
    };

    useEffect(() => {
        if (commit.files) {
            setFiles({});

            Object.keys(commit.files).forEach((_, file) => {
                void getFileContents(commit.files[file]);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [commit, assignment, route]);

    return commit.files && Object.keys(commit.files).length === 0 ? (
        <Caption1>No files uploaded yet</Caption1>
    ) : (
        <Accordion collapsible>
            {Object.keys(commit.files).map((key, index) => (
                <AccordionItem value={index} key={key}>
                    <div className={styles.accordionHeaderContainer}>
                        <AccordionHeader className={styles.accordionHeader}>
                            <div className={styles.accordionHeaderContent}>
                                <span>{commit.files[index]}</span>
                            </div>
                        </AccordionHeader>

                        <Tooltip content="Delete file" relationship="label">
                            <Button
                                icon={<Delete16Filled />}
                                onClick={() => deleteFile(commit.files[index])}
                            />
                        </Tooltip>
                    </div>

                    <AccordionPanel>
                        <pre>
                            <Monaco
                                height="50vh"
                                language="python"
                                value={files[commit.files[index]]}
                                options={{
                                    readOnly: true,
                                }}
                            />
                        </pre>
                    </AccordionPanel>
                </AccordionItem>
            ))}
        </Accordion>
    );
};

export declare interface AssignmentPageFilesTabProps {
    /** a function that fetches the assignment */
    fetchAssignment: () => Promise<void>;
    /** the assignment to display */
    assignment: UserFetchedAssignment;
    /** the ID of the assignment */
    assignmentID: string;
    /** the name of the route */
    routeName: string;
    /** the route to use */
    route: 'testcases' | 'submissions';
}

/**
 * A tab that displays the files for an assignment
 *
 * @returns {JSX.Element} the files tab
 */
export const AssignmentPageFilesTab = ({
    fetchAssignment,
    assignment,
    assignmentID,
    routeName,
    route,
}: AssignmentPageFilesTabProps): JSX.Element => {
    const [content, setContent] = useState<Commit>({
        files: [],
        log: [],
    } as Commit);
    const { showSnackSev } = useContext(SnackbarContext);
    const searchParams = useSearchParams();

    const getTestData = useCallback(async () => {
        await axios
            .get<Commit>(
                `/courses/${assignment.course_id}/assignments/${assignmentID}/${route}`,
                {
                    skipErrorHandling: true,
                    params: {
                        utorid: searchParams.get('utorid') ?? undefined,
                    },
                }
            )
            .then((res) => setContent(res.data))
            .catch((e) => {
                handleError(showSnackSev)(e);
                setContent({ files: [], log: [] } as Commit);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignment.course_id, assignmentID, route]);

    const submitTest = async (files: FileList) => {
        const formData = new FormData();
        for (let i = 0; i < files!.length; i++) {
            formData.append('files', files![i]);
        }

        axios
            .post(
                `/courses/${assignment.course_id}/assignments/${assignmentID}/${route}`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            )
            .then(() => {
                fetchAssignment();
            })
            .catch(handleError(showSnackSev));
    };

    /**
     * increased polling rate while test is pending
     * since we expect runners to be fast
     */
    const POLLING_RATE = 1000;

    useEffect(() => {
        if (content.valid === 'PENDING') {
            const interval = setInterval(() => {
                getTestData().then(() => {
                    if (content.valid !== 'PENDING') {
                        clearInterval(interval);
                        void fetchAssignment();
                    }
                });
            }, POLLING_RATE);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content.valid, getTestData]);

    useEffect(() => {
        void getTestData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignmentID, fetchAssignment, route, routeName, assignment.submissions]);

    return (
        <div className="m-y-xxxl">
            <div className={styles.uploadHeader}>
                <Subtitle1 className={styles.testCaseHeader} block>
                    Uploaded {routeName}s
                    <TestCaseStatus status={content.valid} />
                </Subtitle1>

                {!searchParams.has('utorid') && (
                    <Button
                        icon={<Add24Filled />}
                        appearance="subtle"
                        onClick={async () => {
                            promptForFileObject('.py', true)
                                .then((file) => {
                                    if (file) {
                                        submitTest(file);
                                    }
                                })
                                .catch(handleError(showSnackSev));
                        }}
                    >
                        Upload a {routeName}
                    </Button>
                )}
            </div>

            <Text block className={styles.commitId} font="numeric">
                {content.log[0]}
            </Text>

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
