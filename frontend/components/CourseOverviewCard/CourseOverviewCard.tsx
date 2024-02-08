/* eslint-disable @next/next/no-img-element */
import {
    Badge,
    Button,
    Card,
    CardFooter,
    CardHeader,
    CardPreview,
    Link,
    Title3,
    Tooltip,
} from '@fluentui/react-components';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import styles from './CourseOverviewCard.module.css';
import { RoleType, Session } from 'codetierlist-types';
import { ImageAdd20Regular } from '@fluentui/react-icons';
import axios, { handleError } from '@/axios';
import {
    promptForFileObject,
    checkIfCourseAdmin,
    SessionBlock,
    generatePlaceholderImage,
} from '@/components';
import { SnackbarContext } from '@/contexts/SnackbarContext';
import { UserContext } from '@/contexts/UserContext';

export declare interface CourseSessionChipProps {
    /** the session of the course */
    session: Session;
    /** the children of the component */
    children?: React.ReactNode;
    /** the props of the component */
    props?: React.HTMLAttributes<HTMLDivElement>;
}

/**
 * @returns a generic div so it's easier to style
 */
export const CourseSessionChip = ({
    session,
    children,
    props,
}: CourseSessionChipProps): JSX.Element => {
    return (
        <div className={styles.sessionChip + ' ' + styles[session]} {...props}>
            {children || session}
        </div>
    );
};

export declare interface CourseOverviewCardProps {
    /** the id of the course */
    id: string;
    /** the name of the course */
    name: string;
    /** the image of the course */
    image: string;
    /** the session of the course */
    session: Session;
    /** the role of the user */
    role: RoleType;
    /** the props of the component */
    props?: React.HTMLAttributes<HTMLDivElement>;
}

/**
 * A card shown in the dashboard representing the overview of a course.
 */
export const CourseOverviewCard = ({
    id,
    name,
    image,
    session,
    props,
    role,
}: CourseOverviewCardProps): JSX.Element => {
    // trigger reset of image
    const [seed, setSeed] = useState(1);
    const reset = () => {
        setSeed(Math.random());
    };
    const router = useRouter();
    const { showSnackSev } = useContext(SnackbarContext);
    const { userInfo } = useContext(UserContext);

    return (
        <Card
            className={styles.courseCard}
            onClick={e => {
                e.preventDefault();
                router.push(`/courses/${id}`);
            }}
            aria-label={`${name} course in the ${session} session. You are a ${role}.`}
            floatingAction={
                <>
                    {checkIfCourseAdmin(userInfo, id) && (
                        <Tooltip content="Change cover image" relationship="label">
                            <Button
                                appearance="primary"
                                icon={<ImageAdd20Regular />}
                                shape="circular"
                                className="m-t-m m-r-m"
                                onClick={async event => {
                                    event.stopPropagation();
                                    const files = await promptForFileObject('image/*');
                                    if (!files || files.length != 1) {
                                        return;
                                    }

                                    const formData = new FormData();
                                    formData.append('file', files[0]);

                                    axios
                                        .post(`/courses/${id}/cover`, formData, {
                                            headers: {
                                                'Content-Type': 'multipart/form-data',
                                            },
                                        })
                                        .then(() => {
                                            reset();
                                        })
                                        .catch(handleError(showSnackSev));
                                }}
                            />
                        </Tooltip>
                    )}
                </>
            }
            {...props}
        >
            <CardPreview className={styles.coursePreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    style={{ objectFit: 'cover', height: 200, width: 300 }}
                    src={image + '?' + seed}
                    width={300}
                    alt=""
                    height={200}
                    onError={event => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = generatePlaceholderImage(id);
                    }}
                />
            </CardPreview>

            <CardHeader
                header={<Title3 className={styles.courseTitle}>{name}</Title3>}
                className={styles.courseHeader}
                description={
                    <div className={styles.badges}>
                        <SessionBlock session={session} />
                        <Badge className={styles.role} appearance="filled">
                            {role}
                        </Badge>
                    </div>
                }
            />

            <CardFooter>
                <Link appearance="subtle" aria-label={`Open ${name}`}>
                    View more
                </Link>
            </CardFooter>
        </Card>
    );
};
