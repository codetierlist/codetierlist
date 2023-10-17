"use client"

import { Card, CardPreview, CardFooter, CardHeader, Link, Title3, Button, Caption1, Body1 } from "@fluentui/react-components";
import styles from "./CourseOverviewCard.module.css";
import { useState } from "react";
import { useRouter } from 'next/navigation'

export declare type CourseSessionChipProps = {
  /** the session of the course */
  session: "Fall" | "Winter" | "Summer";

  /** the children of the component */
  children?: React.ReactNode;
}

export const CourseSessionChip = ({ session, children }: CourseSessionChipProps): JSX.Element => {
  return (
    <div className={styles.sessionChip + " " + styles[session]}>
      <Body1>
        {children ? children : session}
      </Body1>
    </div>
  )
}


export declare type CourseOverviewCardProps = {
  /** the name of the course */
  name: string;
  /** the description of the course */
  description: string;
  /** the image of the course */
  image: string;
  /** the session of the course */
  session: "Fall" | "Winter" | "Summer";
}

export const CourseOverviewCard = ({ name, description, image, session, props }: CourseOverviewCardProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState(false);
  const router = useRouter();

  return (
      <Card
        className={styles.courseCard}
        selected={isSelected}
        onSelectionChange={(_, { isSelected }: { isSelected: boolean }) => setIsSelected(isSelected)}
        onClick={(_) => router.push(`/courses/${name}`)}
        {...props}
      >
        <CardPreview>
          <img
            src="https://i.imgur.com/XXlaSS3.png"
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
  )
}
