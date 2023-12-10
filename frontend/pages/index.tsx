import axios, { handleError } from "@/axios";
import { CourseOverviewCard, getSession } from '@/components';
import { UserContext } from "@/contexts/UserContext";
import {
    Button,
    Caption1,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent, DialogOpenChangeData, DialogOpenChangeEvent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Input,
    Label,
    Title2
} from "@fluentui/react-components";
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { useContext, useState } from "react";
import { SnackbarContext } from '../contexts/SnackbarContext';

const inter = Inter({ subsets: ['latin'] });

function CreateCourseForm({ closeDialog }: { closeDialog: () => void }) {
    const [courseCode, setCourseCode] = useState("");
    const [courseName, setCourseName] = useState("");
    const { fetchUserInfo } = useContext(UserContext);
    const { showSnackSev } = useContext(SnackbarContext);

    return (
        <DialogSurface>
            <DialogBody>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    axios.post("/courses", {
                        code: courseCode,
                        name: courseName
                    })
                        .then(fetchUserInfo)
                        .then(closeDialog)
                        .catch(handleError(showSnackSev));
                }}>
                    <DialogTitle>Create Course</DialogTitle>
                    <DialogContent>
                        <Label htmlFor="courseCode">Course Code:</Label><br />
                        <Input type="text" id="courseCode" name="courseCode"
                            value={courseCode}
                            onChange={e => setCourseCode(e.target.value)} /><br />
                        <Label htmlFor="courseName">Course Name:</Label><br />
                        <Input type="text" id="courseName" name="courseName"
                            value={courseName}
                            onChange={e => setCourseName(e.target.value)} /><br /><br />
                    </DialogContent>
                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary">Close</Button>
                        </DialogTrigger>
                        <Button type="submit"
                            appearance="primary">Create</Button>
                    </DialogActions>
                </form>
            </DialogBody>
        </DialogSurface>
    );
}

export default function Home() {
    const { userInfo } = useContext(UserContext);
    const [showDialog, setShowDialog] = useState(false);
    return (
        <>
            <Head>
                <title>Codetierlist</title>
                <meta name="description"
                    content="Testing made simple" />
                <meta name="viewport"
                    content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${inter.className}`}>
                <div className="flex-wrap">
                    {userInfo.roles.map(role => role).map(role => (
                        <CourseOverviewCard
                            key={role.course.id} id={role.course.id}
                            name={role.course.code} admin={userInfo.admin}
                            role={role.type} session={getSession(new Date(role.course.createdAt))}
                            image={process.env.NEXT_PUBLIC_API_URL + "/courses/" + role.course.id + "/cover"}
                        />
                    ))}

                    {(!userInfo.admin && userInfo.roles.length == 0) &&
                        <Caption1>You are not enrolled in any courses. If your believe that this message you are
                            receiving is incorrect, please contact your instructor to correct this issue.</Caption1>
                    }

                    {userInfo.admin ?
                        <Dialog open={showDialog} onOpenChange={(e: DialogOpenChangeEvent, data: DialogOpenChangeData) => setShowDialog(data.open)}>
                            <DialogTrigger disableButtonEnhancement>
                                <Button style={{
                                    width: 300,
                                }}>
                                    <Title2>+</Title2>
                                </Button>
                            </DialogTrigger>
                            <CreateCourseForm closeDialog={() => setShowDialog(false)} />
                        </Dialog>
                        : undefined}
                </div>
            </main>
        </>
    );
}
