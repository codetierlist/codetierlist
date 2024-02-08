import { Card, Divider, Title3 } from "@fluentui/react-components";
import { UpcomingDeadlineEntry } from "../UpcomingDeadlineEntry/UpcomingDeadlineEntry";
import styles from "./UpcomingDeadlinesCard.module.css";
import { useEffect } from "react";

export declare interface UpcomingDeadlinesCardProps {
    /** The parameters for the page */
    params: {
        /** The course ID */
        courseID: string;
    };
}

export const UpcomingDeadlinesCard = ({
    params,
}: UpcomingDeadlinesCardProps): JSX.Element => {
    useEffect(() => {
        params.courseID;
    }, [params.courseID]);

    // TODO: comment the following out! This is just for mock data
    const dueDate = new Date("2023-11-04");
    // Add 5 days to the current date
    return (
        <Card className={styles.mainCard}>
            <Title3>Upcoming</Title3>
            <Divider></Divider>
            <UpcomingDeadlineEntry
                courseID="CSC108"
                assignmentName="A1"
                dueDate={dueDate}
            />
            <UpcomingDeadlineEntry
                courseID="CSC108"
                assignmentName="Lab 1"
                dueDate={dueDate}
            />
            <UpcomingDeadlineEntry
                courseID="CSC108"
                assignmentName="Lab 2"
                dueDate={dueDate}
            />
            <UpcomingDeadlineEntry
                courseID="CSC108"
                assignmentName="A2"
                dueDate={dueDate}
            />
        </Card>
    );
};
