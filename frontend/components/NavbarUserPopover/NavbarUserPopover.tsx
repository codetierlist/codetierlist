import axios, { handleError } from "@/axios";
import { GenerateInitalsAvatarProps, generateInitals } from '@/components';
import { SnackbarContext } from '@/contexts/SnackbarContext';
import { UserContext } from '@/contexts/UserContext';
import { Badge, Button, Persona, Switch } from '@fluentui/react-components';
import { Theme } from 'codetierlist-types';
import Link from 'next/link';
import { useContext } from 'react';
import styles from './NavbarUserPopover.module.css';
import {ErrorCircle24Filled} from "@fluentui/react-icons";

/**
 * The user popover content is the content that appears when
 * the user clicks on their avatar.
 */
export const NavbarUserPopover = (): JSX.Element => {
    const { userInfo, fetchUserInfo } = useContext(UserContext);
    const { showSnackSev } = useContext(SnackbarContext);

    /**
     * Change the user's theme.
     * @param theme the theme to change to
     */
    const changeTheme = (theme: Theme) => {
        axios.post('/users/theme', {
            theme,
        }).catch(handleError(showSnackSev)).finally(() => {
            fetchUserInfo();
        });
    };

    return (
        <div>
            <div className={styles.popoverButtonContainer}>
                <Switch
                    className={styles.popoverRight}
                    checked={userInfo.theme === "DARK"}
                    onChange={() => changeTheme(userInfo.theme === "DARK" ? "LIGHT" : "DARK")}
                    label={userInfo.theme === "DARK" ? "Dark Mode" : "Light Mode"}
                />

                <Link href="https://codetierlist.utm.utoronto.ca/Shibboleth.sso/Logout">
                    <Button appearance="subtle" className={styles.popoverLeft}>
                        Sign out
                    </Button>
                </Link>
            </div>

            <Persona
                size="huge"
                className={styles.popoverPersona}
                avatar={GenerateInitalsAvatarProps(generateInitals(userInfo))}
                primaryText={
                    <>
                        {`${userInfo.givenName} ${userInfo.surname}` == " " ? userInfo.utorid : `${userInfo.givenName} ${userInfo.surname}`}
                        {userInfo.admin && <Badge className={styles.adminBadge} appearance="outline">Admin</Badge>}
                    </>
                }
                secondaryText={userInfo.email}
                tertiaryText={userInfo.utorid}
            /><br/><hr/>
            <div className={"m-t-l"}>
                <Link style={{width: "100%"}} href="/achievements" className={styles.popoverLink}>
                    <Button style={{width: "100%"}} appearance="subtle" className={styles.popoverButton}>
                        Achievements {userInfo.new_achievements ? <ErrorCircle24Filled fill="red" color="red"/> : null}
                    </Button>
                </Link>
            </div>
        </div>
    );
};
