import { getRoleName, HeaderToolbar, PeopleModifier } from "@/components";
import { Body2, LargeTitle, ToolbarButton } from "@fluentui/react-components";
import { ArrowLeft24Regular } from '@fluentui/react-icons';
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container } from "react-grid-system";
import { RoleType } from "codetierlist-types";

export default function Page(): JSX.Element {
    const router = useRouter();
    const { type } = useRouter().query;
    const [add, isAdd] = useState(true);
    const [role, setRole] = useState("");

    useEffect(() => {
        switch (type) {
        case "add-students":
            setRole("STUDENT");
            isAdd(true);
            break;
        case "add-tas":
            setRole("TA");
            isAdd(true);
            break;
        case "add-instructors":
            setRole("INSTRUCTOR");
            isAdd(true);
            break;
        case "remove-students":
            setRole("STUDENT");
            isAdd(false);
            break;
        case "remove-tas":
            setRole("TA");
            isAdd(false);
            break;
        case "remove-instructors":
            setRole("INSTRUCTOR");
            isAdd(false);
            break;
        default:
            setRole("invalid");
            break;
        }
    }, [type]);

    return (
        <>
            <Head>
                <title>{`${add ? "Add" : "Remove"} ${getRoleName(role)}s - Codetierlist`}</title>
            </Head>

            <HeaderToolbar>
                <ToolbarButton
                    icon={<ArrowLeft24Regular />}
                    onClick={() => router.push(`/courses/${router.query.courseID}`)}
                >
                    Back to Course
                </ToolbarButton>
            </HeaderToolbar>


            <Container component="main" className="m-t-xxxl">
                {role === "invalid" && <>
                    <LargeTitle block as="h1">Error 404</LargeTitle>
                    <Body2 block as="p">
                        The only valid types are <code>add-students</code>, <code>add-tas</code>, <code>add-instructors</code>, <code>remove-students</code>, <code>remove-tas</code>, and <code>remove-instructors</code>.
                    </Body2>
                </>
                }

                {role !== "invalid" &&
                    <PeopleModifier
                        title={`${add ? "Add" : "Remove"} ${getRoleName(role)}s`}
                        description={`Update the ${getRoleName(role)}s enrolled in this course by uploading a list of UTORids, separated by newlines.`}
                        action={add ? "add" : "remove"}
                        roleType={role as RoleType}
                    />
                }
            </Container>
        </>
    );
}
