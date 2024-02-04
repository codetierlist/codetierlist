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
    Tooltip
} from '@fluentui/react-components';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import styles from './CourseOverviewCard.module.css';
import { RoleType, Session } from 'codetierlist-types';
import { ImageAdd20Regular } from "@fluentui/react-icons";
import axios, { handleError } from "@/axios";
import { promptForFileObject, checkIfCourseAdmin, SessionBlock } from "@/components";
import { SnackbarContext } from "@/contexts/SnackbarContext";
import { UserContext } from '@/contexts/UserContext';

/**
 * generates a placeholder image for the course
 * @param course the course id
 */
const generatePlaceholderCard = (course: string): string =>
    `data:image/svg+xml,%3Csvg viewBox='0 0 300 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23777' d='M0 0h300v200H0z'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' fill='%23fff' font-family='sans-serif' font-size='50' text-anchor='middle' %3E${course}%3C/text%3E%3C/svg%3E`;

export declare interface CourseSessionChipProps {
    /** the session of the course */
    session: Session
    /** the children of the component */
    children?: React.ReactNode
    /** the props of the component */
    props?: React.HTMLAttributes<HTMLDivElement>
}

/**
 * @returns a generic div so it's easier to style
 */
export const CourseSessionChip = ({
    session,
    children,
    props
}: CourseSessionChipProps): JSX.Element => {
    return (
        <div className={styles.sessionChip + ' ' + styles[session]} {...props}>
            {children || session}
        </div>
    );
};

export declare interface CourseOverviewCardProps {
    /** the id of the course */
    id: string
    /** the name of the course */
    name: string
    /** the image of the course */
    image: string
    /** the session of the course */
    session: Session,
    /** the role of the user */
    role: RoleType,
    /** the props of the component */
    props?: React.HTMLAttributes<HTMLDivElement>
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
    role
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
            onClick={(e) => {
                e.preventDefault();
                router.push(`/courses/${id}`);
            }}
            aria-label={`${name} course in the ${session} session. You are a ${role}.`}
            floatingAction={
                <>
                    {
                        (checkIfCourseAdmin(userInfo, id)) &&
                        <Tooltip content="Change cover image" relationship="label">
                            <Button
                                appearance="primary"
                                icon={<ImageAdd20Regular />}
                                shape="circular"
                                className="m-t-m m-r-m"
                                onClick={async (event) => {
                                    event.stopPropagation();
                                    const files = await promptForFileObject("image/*");
                                    if (!files || files.length != 1) { return; }

                                    const formData = new FormData();
                                    formData.append("file", files[0]);

                                    axios.post(`/courses/${id}/cover`,
                                        formData,
                                        {
                                            headers: { "Content-Type": "multipart/form-data" }
                                        })
                                        .then(() => {
                                            reset();
                                        }).catch(handleError(showSnackSev));
                                }}
                            />
                        </Tooltip>
                    }
                </>
            }
            {...props}
        >
            <CardPreview className={styles.coursePreview}>
                <img
                    style={{ objectFit: "cover", height: 200, width: 300 }}
                    src={image + "?" + seed}
                    width={300}
                    alt=""
                    height={200}
                    onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = generatePlaceholderCard(id); }}
                />
            </CardPreview>

            <CardHeader
                header={
                    <Title3 className={styles.courseTitle}>
                        {name}
                    </Title3>
                }
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
