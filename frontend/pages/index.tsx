import {
    AllCoursesList,
    CourseOverviewCard,
    CreateCourseDialogSurface,
    getSession,
} from '@/components';
import { UserContext } from '@/hooks';
import {
    Button,
    Caption1,
    Dialog,
    DialogOpenChangeData,
    DialogOpenChangeEvent,
    DialogTrigger,
    Title2,
    Tooltip,
} from '@fluentui/react-components';
import Head from 'next/head';
import { useContext, useState } from 'react';
import { Container } from 'react-grid-system';

export default function Home() {
    const { userInfo } = useContext(UserContext);
    const [showDialog, setShowDialog] = useState(false);

    return (
        <>
            <Head>
                <title>Codetierlist</title>
                <meta name="description" content="Testing made simple" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Container component="main" className="m-t-xxxl">
                <div className="flex-wrap">
                    {userInfo.roles
                        .map((role) => role)
                        .map((role) => (
                            <CourseOverviewCard
                                key={role.course.id}
                                id={role.course.id}
                                name={role.course.name}
                                role={role.type}
                                session={role.course.session}
                                image={`${process.env.NEXT_PUBLIC_API_URL}/courses/${role.course.id}/cover`}
                            />
                        ))}

                    {!userInfo.admin && userInfo.roles.length == 0 && (
                        <Caption1>
                            You are not enrolled in any courses. If your believe that this
                            message you are receiving is incorrect, please contact your
                            instructor to correct this issue.
                        </Caption1>
                    )}

                    {userInfo.admin ? (
                        <Dialog
                            open={showDialog}
                            onOpenChange={(
                                e: DialogOpenChangeEvent,
                                data: DialogOpenChangeData
                            ) => setShowDialog(data.open)}
                        >
                            <DialogTrigger disableButtonEnhancement>
                                <Tooltip content="Create a course" relationship="label">
                                    <Button
                                        style={{
                                            width: 300,
                                        }}
                                    >
                                        <Title2>+</Title2>
                                    </Button>
                                </Tooltip>
                            </DialogTrigger>

                            <CreateCourseDialogSurface
                                closeDialog={() => setShowDialog(false)}
                            />
                        </Dialog>
                    ) : undefined}
                </div>

                {userInfo.admin && <AllCoursesList />}
            </Container>
        </>
    );
}
