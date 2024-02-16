import axios, { handleError } from '@/axios';
import {
    HeaderToolbar,
    Monaco,
    checkIfCourseAdmin,
    promptForFileReader,
} from '@/components';
import { SnackbarContext } from '@/contexts/SnackbarContext';
import {
    Body2,
    Button,
    Card,
    LargeTitle,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    ToolbarButton,
} from '@fluentui/react-components';
import { Add24Filled, ArrowLeft24Regular } from '@fluentui/react-icons';
import { Title2 } from '@fluentui/react-text';
import { RoleType } from 'codetierlist-types';
import { isUTORid } from 'is-utorid';
import Head from 'next/head';
import Error from 'next/error';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { Container } from 'react-grid-system';
import { UserContext } from '@/contexts/UserContext';

/**
 * Get the role name from the role type
 */
export const getRoleName = (roleName: RoleType | string | undefined): string =>
    roleName ? (roleName === 'TA' ? roleName : roleName.toLocaleLowerCase()) : 'user';

/**
 * Like getRoleName, but returns teaching assistant instead of ta
 */
export const getLongRoleName = (roleName: RoleType | string | undefined): string =>
    roleName
        ? roleName === 'TA'
            ? 'Teaching Assistant'
            : getRoleName(roleName)
        : 'user';

/**
 * given a csv of students, enroll them in or remove them from the course
 *
 * @param courseID the course to modify
 * @param csv a list of utorids that are newline separated
 * @param action the action to perform on the enrolment of students (enrol or remove from course)
 *
 * @returns void on success, throws an error on failure
 */
async function modifyEnrollment(
    courseID: string,
    csv: string,
    action: 'add' | 'remove',
    role: RoleType,
    showSnackSev: (message: string, severity: 'success' | 'error') => void
): Promise<void> {
    const utorids = csv.split('\n').map((utorid) => utorid.trim());

    if (!csv || !utorids.length) {
        showSnackSev('Please enter some UTORids', 'error');
    } else if (utorids.some((utorid: string) => !isUTORid(utorid))) {
        showSnackSev('One of the UTORids are invalid', 'error');
    } else {
        await axios
            .post(`/courses/${courseID}/${action}`, { utorids, role })
            .then(() =>
                showSnackSev(
                    `${action == 'add' ? 'Added' : 'Removed'} ${getRoleName(role)} successfully`,
                    'success'
                )
            )
            .catch((e) => {
                handleError(showSnackSev)(e);
            });
    }
}

export default function Page(): JSX.Element {
    const router = useRouter();
    const { courseID, type } = useRouter().query;
    const [add, isAdd] = useState(true);
    const [role, setRole] = useState(undefined as RoleType | undefined | 'invalid');
    const [editorValue, setEditorValue] = useState('');
    const { showSnackSev } = useContext(SnackbarContext);
    const { userInfo } = useContext(UserContext);

    useEffect(() => {
        switch (type) {
            case 'add-students':
                setRole('STUDENT');
                isAdd(true);
                break;
            case 'add-tas':
                setRole('TA');
                isAdd(true);
                break;
            case 'add-instructors':
                setRole('INSTRUCTOR');
                isAdd(true);
                break;
            case 'remove-students':
                setRole('STUDENT');
                isAdd(false);
                break;
            case 'remove-tas':
                setRole('TA');
                isAdd(false);
                break;
            case 'remove-instructors':
                setRole('INSTRUCTOR');
                isAdd(false);
                break;
            case 'remove':
                setRole(undefined);
                isAdd(false);
                break;
            default:
                setRole('invalid');
                break;
        }
    }, [type]);

    // If the user is not an admin, error 403
    if (!checkIfCourseAdmin(userInfo, courseID as string)) {
        return <Error statusCode={403} />;
    }

    return (
        <>
            <Head>
                <title>{`${add ? 'Add' : 'Remove'} ${getLongRoleName(role)}s - Codetierlist`}</title>
            </Head>

            <HeaderToolbar>
                <ToolbarButton
                    icon={<ArrowLeft24Regular />}
                    onClick={() => router.push(`/courses/${router.query.courseID}`)}
                >
                    Back to Course
                </ToolbarButton>
                <ToolbarButton
                    icon={<Add24Filled />}
                    onClick={async () => {
                        promptForFileReader('.csv').then((csv) => {
                            if (csv) {
                                setEditorValue(csv.result as string);
                            }
                        });
                    }}
                >
                    Load from file
                </ToolbarButton>
            </HeaderToolbar>

            <Container component="main" className="m-t-xxxl">
                {role === 'invalid' && (
                    <>
                        <LargeTitle block as="h1">
                            Error 404
                        </LargeTitle>
                        <Body2 block as="p">
                            The only valid types are <code>add-students</code>,{' '}
                            <code>add-tas</code>, <code>add-instructors</code>,{' '}
                            <code>remove</code>, <code>remove-students</code>,{' '}
                            <code>remove-tas</code>, and <code>remove-instructors</code>.
                        </Body2>
                    </>
                )}

                {role !== 'invalid' && (
                    <>
                        <header className={`m-b-xl`}>
                            <Title2
                                block
                                aria-label={`Add or remove ${getLongRoleName(role)}s`}
                            >
                                {`${add ? 'Add' : 'Remove'} ${getRoleName(role)}s`}{' '}
                            </Title2>
                            <Body2
                                block
                                className="m-b-l"
                            >{`Update the ${getLongRoleName(role)}s enrolled in this course by uploading a list of UTORids, separated by newlines.`}</Body2>
                            {role == 'TA' && (
                                <MessageBar intent="warning">
                                    <MessageBarBody>
                                        <MessageBarTitle>Warning!</MessageBarTitle>{' '}
                                        Teaching assistants have the same permission as
                                        instructors. This includes destructive actions
                                        like deleting the course, deleting assignments,
                                        and sensitive actions like viewing student
                                        submissions.{' '}
                                        <strong>Be careful when adding TAs.</strong>
                                    </MessageBarBody>
                                </MessageBar>
                            )}
                        </header>

                        <Card>
                            <Monaco
                                height="56vh"
                                defaultLanguage="csv"
                                value={editorValue}
                                onChange={(value) => setEditorValue(value || '')}
                            />
                        </Card>

                        <Button
                            appearance="primary"
                            className={`m-y-xxl`}
                            style={{ float: 'right' }}
                            onClick={() => {
                                modifyEnrollment(
                                    router.query.courseID as string,
                                    editorValue,
                                    add ? 'add' : 'remove',
                                    (role as RoleType) || undefined,
                                    showSnackSev
                                ).catch((e) => handleError(showSnackSev, e.message));
                            }}
                        >
                            Submit
                        </Button>
                    </>
                )}
            </Container>
        </>
    );
}
