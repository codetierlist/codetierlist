import { handleError } from "@/axios";
import { HeaderToolbar, promptForFileReader, Monaco, modifyEnrollment } from "@/components";
import { SnackbarContext } from "@/contexts/SnackbarContext";
import flex from '@/styles/flex-utils.module.css';
import { Body2, Button, ToolbarButton } from "@fluentui/react-components";
import { Add24Filled, ArrowLeft24Regular } from '@fluentui/react-icons';
import { Title2 } from '@fluentui/react-text';
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useState } from "react";

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
                        <Body2 block>Update the students enrolled in this course by uploading a CSV of students. The CSV must have a header row with the column <code>utorid</code>.</Body2>
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

                <Monaco
                    height="56vh"
                    defaultLanguage="csv"
                    defaultValue="utorid"
                    value={editorValue}
                    onChange={(value) => setEditorValue(value || "")}
                />
                <Button
                    appearance="primary"
                    onClick={() => {
                        modifyEnrollment(router.query.courseID as string, editorValue, "enroll")
                            .then(() => showSnackSev("Enrolled students successfully", "success"))
                            .then(() => router.push(`/courses/${router.query.courseID}`))
                            .catch((e) => handleError(e.message, showSnackSev));
                    }}>
                    Enroll
                </Button>
            </main>
        </>
    );
}
