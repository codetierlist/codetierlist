import axios, { handleError } from "@/axios";
import { CourseOverviewCard } from '@/components';
import { UserContext } from "@/contexts/UserContext";
import {
    Button,
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
                        .catch((error) => { handleError(error.message, showSnackSev); });
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
                    {userInfo.roles.map(x => x.course).map(x => (
                        // TODO session probably shouldn't be hardcoded, image placeholder should be replaced with actual course image
                        <CourseOverviewCard key={x.id} id={x.id} name={x.code} admin={userInfo.admin}
                            image={process.env.NEXT_PUBLIC_API_URL+"/courses/"+x.id+"/cover"}
                            session={"Fall"}></CourseOverviewCard>
                    ))}

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
