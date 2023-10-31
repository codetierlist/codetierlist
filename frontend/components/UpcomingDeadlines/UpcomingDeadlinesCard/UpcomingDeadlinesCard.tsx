import { Card, Divider, Title3 } from '@fluentui/react-components';
import styles from './UpcomingDeadlinesCard.module.css';
import { UpcomingDeadlineEntry } from '../UpcomingDeadlineEntry/UpcomingDeadlineEntry';


export const UpcomingDeadlinesCard = ({ params }: { params: { courseID: string } }): JSX.Element => {


    // TODO: comment the following out! This is just for mock data    
    const dueDate = new Date('2023-11-04');
    // Add 5 days to the current date
    console.log(dueDate);
    return (
        <Card className={styles.mainCard}>
            <Title3>Upcoming</Title3>
            <Divider></Divider>
            <UpcomingDeadlineEntry courseID="CSC108" assignmentName="A1" dueDate={dueDate}/>
            <UpcomingDeadlineEntry courseID="CSC108" assignmentName="Lab 1" dueDate={dueDate} />
            <UpcomingDeadlineEntry courseID="CSC108" assignmentName="Lab 2" dueDate={dueDate} />
            <UpcomingDeadlineEntry courseID="CSC108" assignmentName="A2" dueDate={dueDate} />
        </Card>
    );
};