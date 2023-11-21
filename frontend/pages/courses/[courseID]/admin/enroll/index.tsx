import axios, { handleError } from "@/axios";
import { HeaderToolbar } from "@/components";
import { SnackbarContext } from "@/contexts/SnackbarContext";
import { Body2, Button, ToolbarButton } from "@fluentui/react-components";
import { ArrowLeft24Regular, Add24Filled } from '@fluentui/react-icons';
import { Title2 } from '@fluentui/react-text';
import { Editor } from "@monaco-editor/react";
import { isUTORid, isUofTEmail } from 'is-utorid';
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import flex from '@/styles/flex-utils.module.css';

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
    const emailIndex = headers.indexOf("email");

    const students = table.map((row) => ({
        utorid: row[utoridIndex],
        email: row[emailIndex]
    }));

    students.forEach((student) => {
        if (!isUTORid(student.utorid)) {
            throw new Error(`Invalid UTORid: ${student.utorid}`);
        } else if (!isUofTEmail(student.email)) {
            throw new Error(`Invalid email: ${student.email}`);
        }
    });

    // todo: backend only accepts utorids..? make it accept emails too

    const utoridList = students.map((student) => student.utorid);

    await axios.post(`/courses/${courseID}/enroll`, {
        utorids: utoridList
    })
        .catch((e) => { throw new Error(e.message); });
}

/**
 * prompt the user to select a csv file
 * @returns the contents of the csv file
 */
async function promptForFile(type: string): Promise<string | undefined> {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = type;

    return new Promise((resolve) => {
        fileInput.addEventListener("change", () => {
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.addEventListener("load", () => {
                    if (typeof reader.result === "string") {
                        resolve(reader.result);
                    }
                });
                reader.readAsText(file);
            }
        });
        fileInput.click();
    });
}

export default function Page(): JSX.Element {
    const [editorValue, setEditorValue] = useState("");
    const { showSnackSev } = useContext(SnackbarContext);

    const router = useRouter();

    return (
        <>
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
                        <Body2 block>Enter a CSV of students to enroll in this course. The CSV must have a header row with the columns <code>utorid</code> and <code>email</code>.</Body2>
                    </header>

                    <Button
                        icon={<Add24Filled />}
                        onClick={async () => {
                            promptForFile(".csv")
                                .then((csv) => {
                                    if (csv) {
                                        setEditorValue(csv);
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
                    defaultValue="utorid,email"
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
