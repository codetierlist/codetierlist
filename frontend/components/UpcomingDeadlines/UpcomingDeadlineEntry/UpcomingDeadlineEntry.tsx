import { Divider, Title3 } from "@fluentui/react-components";
import React from "react";
import styles from "./UpcomingDeadlineEntry.module.css"
import { CourseBlockSmall } from "../../CourseBlock/CourseBlockSmall";
import { Text } from "@fluentui/react-components";
import { DueDate } from "../DueDate/DueDate";

export declare interface UpcomingDeadlineEntryProps {
    courseID: string;
    assignmentName: string;
    dueDate: Date;
}
  

export const UpcomingDeadlineEntry = ({ courseID, assignmentName, dueDate }: UpcomingDeadlineEntryProps): JSX.Element => {
    return (
        <div>
            <div className={styles.entry}>
                <div className={styles.assignmentIdentifyingInfo}>
                    <CourseBlockSmall courseID={courseID} />
                    <Title3 className={styles.assignmentName}>{assignmentName}</Title3>
                </div>
                <div>
                    <DueDate daysUntilDue={daysUntilDate(dueDate)} />
                </div>
            </div>
            <Divider></Divider>
        </div>
    );
};


function daysUntilDate(targetDate: Date) {
    const today = new Date();
    
    // Set both dates to the same time of day (midnight)
    today.setUTCHours(0, 0, 0, 0);
    targetDate.setUTCHours(0, 0, 0, 0);

    // Calculate the time difference in milliseconds
    const timeDifference = targetDate.getTime() - today.getTime();

    // Convert the time difference to days
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
}

// 
  