import axios, { handleError } from "@/axios";
import { themes, ControlCard } from "@/components";
import { SnackbarContext } from "@/contexts/SnackbarContext";
import { UserContext } from "@/contexts/UserContext";
import { Dropdown, Option, Subtitle1, Subtitle2, Title3 } from "@fluentui/react-components";
import { Color24Regular } from "@fluentui/react-icons";
import { Theme } from "codetierlist-types";
import Head from "next/head";
import { useContext } from "react";
import { Container } from "react-grid-system";

const toSentenceCase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const ThemeSelector = () => {
    const { userInfo, fetchUserInfo } = useContext(UserContext);
    const { showSnackSev } = useContext(SnackbarContext);

    /**
     * Change the user's theme.
     * @param theme the theme to change to
     */
    const changeTheme = (theme: Theme) => {
        axios
            .post('/users/theme', {
                theme,
            })
            .catch((e) => {
                handleError(showSnackSev)(e);
            })
            .finally(() => {
                fetchUserInfo();
            });
    };

    return (
        <Dropdown value={toSentenceCase(userInfo.theme)} appearance="filled-darker">
            {
                Object.keys(themes).map((theme) => (
                    <Option
                        key={theme}
                        value={theme}
                        onClick={() => changeTheme(theme as Theme)}
                    >
                        {toSentenceCase(theme)}
                    </Option>
                ))
            }
        </Dropdown>
    );
}

export const Settings = () => {
    return (
        <>
            <Head>
                <title>Settings | Codetierlist</title>
            </Head>
            <Container component="main" className="m-t-xxxl">
                <Title3 block className="m-b-xl">Settings</Title3>
                <Subtitle2 className="m-t-xl">Appearance</Subtitle2>
                <form className="m-t-l">
                    <ControlCard
                        title="Theme"
                        description="Select which app theme to display"
                        icon={<Color24Regular />}
                    >
                        <ThemeSelector />
                    </ControlCard>
                </form>
            </Container>
        </>
    );
}

export default Settings;
