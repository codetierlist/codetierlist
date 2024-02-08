/* eslint-disable @next/next/no-img-element */
import { SessionBlock, generatePlaceholderImage } from '@/components';
import {
    Badge,
    Card,
    CardFooter,
    CardHeader,
    CardPreview,
    Link,
    Title3,
} from '@fluentui/react-components';
import { RoleType, Session } from 'codetierlist-types';
import { useRouter } from 'next/navigation';
import styles from './CourseOverviewCard.module.css';

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
    const router = useRouter();

    return (
        <Card
            className={styles.courseCard}
            onClick={(e) => {
                e.preventDefault();
                router.push(`/courses/${id}`);
            }}
            aria-label={`${name} course in the ${session} session. You are a ${role}.`}
            {...props}
        >
            <CardPreview className={styles.coursePreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    style={{ objectFit: 'cover', height: 200, width: 300 }}
                    src={image}
                    width={300}
                    alt=""
                    height={200}
                    onError={(event) => {
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
