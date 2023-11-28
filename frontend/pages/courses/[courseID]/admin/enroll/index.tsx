import axios, { handleError } from "@/axios";
import { HeaderToolbar, promptForFileReader } from "@/components";
import { SnackbarContext } from "@/contexts/SnackbarContext";
import flex from '@/styles/flex-utils.module.css';
import { Body2, Button, ToolbarButton } from "@fluentui/react-components";
import { Add24Filled, ArrowLeft24Regular } from '@fluentui/react-icons';
import { Title2 } from '@fluentui/react-text';
import { Editor } from "@monaco-editor/react";
import { isUTORid } from 'is-utorid';
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useState } from "react";

/**
 * given a csv of students, enroll them in the course
 *
 * @param courseID the course to enroll them in
 * @param csv the csv of students in the format utorid,email with a header row
 *
 * @returns void on success, throws an error on failure
 */
async function massEnroll(courseID: string, csv: string) {
    const table = csv.split("\n").map((row) => row.trim().split(","));

    if (table.length < 2) {
        throw new Error("CSV must have at least 2 rows");
    }

    const headers = table.shift() || [];
    const utoridIndex = headers.indexOf("utorid");

    const students = table.map((row) => ({
        utorid: row[utoridIndex],
    }));

    students.forEach((student) => {
        if (!isUTORid(student.utorid)) {
            throw new Error(`Invalid UTORid: ${student.utorid}`);
        }
    });

    const utoridList = students.map((student) => student.utorid);

    await axios.post(`/courses/${courseID}/enroll`, {
        utorids: utoridList,
        role: "STUDENT"
    })
        .catch((e) => { throw new Error(e.message); });
}

export default function Page(): JSX.Element {
    const [editorValue, setEditorValue] = useState("");
    const { showSnackSev } = useContext(SnackbarContext);

    const router = useRouter();

    return (
        <>
            <Head>
                <title>Enroll Students - Codetierlist</title>
            </Head>

            <HeaderToolbar>
                <ToolbarButton
                    icon={<ArrowLeft24Regular />}
                    onClick={() => router.push(`/courses/${router.query.courseID}`)}
                >
                    Back
                </ToolbarButton>
            </HeaderToolbar>

            <main>
                <div className={`${flex["d-flex"]} ${flex["justify-content-between"]}`}>
                    <header>
                        <Title2 block>Enroll Students</Title2>
                        <Body2 block>Enter a CSV of students to enroll in this course. The CSV must have a header row with the columns <code>utorid</code>.</Body2>
                    </header>

                    <Button
                        icon={<Add24Filled />}
                        onClick={async () => {
                            promptForFileReader(".csv")
                                .then((csv) => {
                                    if (csv) {
                                        setEditorValue(csv.result as string);
                                    }
                                });
                        }}
                    >
                        Load CSV from file
                    </Button>
                </div>

                <br />

                <Editor
                    height="56vh"
                    defaultLanguage="csv"
                    defaultValue="utorid"
                    value={editorValue}
                    onChange={(value) => setEditorValue(value || "")}
                />
                <Button
                    appearance="primary"
                    onClick={() => {
                        massEnroll(router.query.courseID as string, editorValue)
                            .then(() => showSnackSev("Enrolled students successfully", "success"))
                            .catch((e) => handleError(e.message, showSnackSev));
                    }}>
                    Enroll
                </Button>
            </main>
        </>
    );
}
