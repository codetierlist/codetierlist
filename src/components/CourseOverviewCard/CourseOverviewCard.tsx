/* eslint-disable @next/next/no-img-element */
'use client';

import { Card, CardFooter, CardHeader, CardPreview, Link, Title3 } from '@fluentui/react-components';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './CourseOverviewCard.module.css';

export declare interface CourseSessionChipProps {
  /** the session of the course */
  session: 'Fall' | 'Winter' | 'Summer'

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
  image?: string
  /** the session of the course */
  session: 'Fall' | 'Winter' | 'Summer'
  /** the props of the component */
  props?: React.HTMLAttributes<HTMLDivElement>
}

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
                    src={
                        image || "https://i.imgur.com/XXlaSS3.png"
                    }
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
