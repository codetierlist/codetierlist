// import { CourseSessionChip, AssignmentCard } from '@/components';
import styles from './page.module.css';
import { Subtitle2, Title2 } from '@fluentui/react-text';
import Error from 'next/error';
import { useRouter } from 'next/router';
import { colourHash } from '@/components';
import { Card, CardHeader } from '@fluentui/react-components';
import { Clock16Regular } from '@fluentui/react-icons';
import { convertDate, convertTime } from '../../../../components/utils/TimeUtils/TimeUtils';

const assignment = {
    dueDate: new Date(),
};

export default function Page () {
    const router = useRouter();

    // TODO: guard against invalid courseID, invalid assignmentID
    //eslint-disable-next-line no-constant-condition
    if (false) { // your code goes here
        return <Error statusCode={404} />;
    }

    const { courseID, assignmentID } = router.query;

    return (
        <main>
            <Card className={styles.header}>
                <CardHeader
                    header={
                        <>
                            <Clock16Regular className={styles.dueDateIcon} />
                            <Subtitle2 className={styles.dueDate}>
                                Due {convertDate(assignment.dueDate)} at {convertTime(assignment.dueDate)}
                            </Subtitle2>
                        </>
                    }
                />
                <Title2>
                    <span className={colourHash(courseID) + ' ' + styles.courseCode}>
                        {courseID}
                    </span>
                    {assignmentID}
                </Title2>
            </Card>
            <div className="flex-wrap">

            </div>
        </main>
    );
}
