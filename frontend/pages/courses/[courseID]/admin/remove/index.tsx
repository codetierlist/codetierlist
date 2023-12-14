import { HeaderToolbar, PeopleModifier } from "@/components";
import { Tab, TabList, ToolbarButton } from "@fluentui/react-components";
import { ArrowLeft24Regular } from '@fluentui/react-icons';
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { Container } from "react-grid-system";
import styles from "./page.module.css";

export default function Page(): JSX.Element {

    const router = useRouter();
    const [stage, setStage] = useState(0);

    return (
        <>
            <Head>
                <title>Remove people - Codetierlist</title>
            </Head>

            <HeaderToolbar>
                <ToolbarButton
                    icon={<ArrowLeft24Regular />}
                    onClick={() => router.push(`/courses/${router.query.courseID}`)}
                >
                    Back to Course
                </ToolbarButton>
            </HeaderToolbar>

            <TabList className={styles.tabList} size="large" selectedValue={`tab${stage}`}>
                <Tab value="tab0" onClick={() => setStage(0)}>
                    Remove Students
                </Tab>
                <Tab value="tab1" onClick={() => setStage(1)}>
                    Remove TAs
                </Tab>
                <Tab value="tab2" onClick={() => setStage(2)}>
                    Remove Instructors
                </Tab>
            </TabList>

            <Container component="main" className="m-t-xxxl">
                {stage === 0 &&
                    <PeopleModifier
                        title={"Remove Students"}
                        description={"Remove the students enrolled in this course by uploading a CSV of students. The CSV must have a header row with the column \"utorid\"."}
                        action={"remove"}
                        roleType={"STUDENT"}
                    />}
                {stage === 1 &&
                    <PeopleModifier
                        title={"Remove TAs"}
                        description={"Remove the TAs in this course by uploading a CSV of TAs. The CSV must have a header row with the column \"utorid\"."}
                        action={"remove"}
                        roleType={"TA"}
                    />}
                {stage === 2 &&
                    <PeopleModifier
                        title={"Remove Instructors"}
                        description={"Remove the instructors in this course by uploading a CSV of instructors. The CSV must have a header row with the column \"utorid\"."}
                        action={"remove"}
                        roleType={"INSTRUCTOR"}
                    />}
            </Container>
        </>
    );
}
