/* eslint-disable @next/next/no-img-element */
import { Card, CardFooter, CardHeader, CardPreview, Link, Title3 } from '@fluentui/react-components';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './CourseOverviewCard.module.css';
import { Session } from '@/lib/types';

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
export const CourseSessionChip = ({ session, children, props }: CourseSessionChipProps): JSX.Element => {
    return (
        <div className={styles.sessionChip + ' ' + styles[session]} {...props}>
            {children || session}
        </div>
    );
};

export declare interface CourseOverviewCardProps {
  /** the name of the course */
  name: string
  /** the image of the course */
  image: string
  /** the session of the course */
  session: Session
  /** the props of the component */
  props?: React.HTMLAttributes<HTMLDivElement>
}

/**
 * A card shown in the dashboard representing the overview of a course.
 * @property {string} name the name of the course
 * @property {string} image the image of the course
 * @property {Session} session the session of the course
 * @returns {JSX.Element} the course overview card
 */
export const CourseOverviewCard = ({ name, image, session, props }: CourseOverviewCardProps): JSX.Element => {
    const [isSelected, setSelected] = useState(false);
    const router = useRouter();

    return (
        <Card
            className={styles.courseCard}
            selected={isSelected}
            onSelectionChange={(_, { selected }) => { setSelected(selected); }}
            onClick={() => { router.push(`/courses/${name}`); }}
            {...props}
        >
            <CardPreview>
                <img
                    src={ image }
                    alt="Developer Art"
                />
            </CardPreview>

            <CardHeader
                header={
                    <Title3 className={styles.courseTitle}>
                        {name}
                    </Title3>
                }
                className={styles.courseHeader}
                description={<CourseSessionChip session={session} />}
            />

            <CardFooter>
                <Link appearance="subtle">
            View more
                </Link>
            </CardFooter>
        </Card>
    );
};
