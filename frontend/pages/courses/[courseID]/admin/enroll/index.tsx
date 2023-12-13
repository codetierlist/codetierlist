import { HeaderToolbar } from "@/components";
import { ToolbarButton } from "@fluentui/react-components";
import { ArrowLeft24Regular } from '@fluentui/react-icons';

import Head from "next/head";
import { useRouter } from "next/router";

import { PeopleModifier } from "@/components";

export default function Page(): JSX.Element {

    const router = useRouter();

    return (
        <>
            <Head>
                <title>Add people - Codetierlist</title>
            </Head>

            <HeaderToolbar>
                <ToolbarButton
                    icon={<ArrowLeft24Regular />}
                    onClick={() => router.push(`/courses/${router.query.courseID}`)}
                >
                    Back to Course
                </ToolbarButton>
            </HeaderToolbar>

            <main>
                <PeopleModifier
                    title={"Enroll Students"}
                    description={"Update the students enrolled in this course by uploading a CSV of students. The CSV must have a header row with the column \"utorid\"."}
                    action={"add"}
                    roleType={"STUDENT"}
                />
                <PeopleModifier
                    title={"Add TAs"}
                    description={"Update the TAs in this course by uploading a CSV of TAs. The CSV must have a header row with the column \"utorid\"."}
                    action={"add"}
                    roleType={"TA"}
                />
                <PeopleModifier
                    title={"Add Instructors"}
                    description={"Update the instructors in this course by uploading a CSV of instructors. The CSV must have a header row with the column \"utorid\"."}
                    action={"add"}
                    roleType={"INSTRUCTOR"}
                />
            </main>
        </>
    );
}
