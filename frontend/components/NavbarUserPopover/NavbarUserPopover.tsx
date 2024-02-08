import axios, { handleError } from '@/axios';
import { GenerateInitalsAvatarProps, generateInitals } from '@/components';
import { SnackbarContext } from '@/contexts/SnackbarContext';
import { UserContext } from '@/contexts/UserContext';
import { Badge, Button, Persona, Switch } from '@fluentui/react-components';
import {
    ErrorCircle12Filled,
    SignOut24Regular,
    Trophy24Regular,
} from '@fluentui/react-icons';
import { Theme } from 'codetierlist-types';
import { useContext } from 'react';
import { useRouter } from 'next/router';
import styles from './NavbarUserPopover.module.css';

/**
 * The user popover content is the content that appears when
 * the user clicks on their avatar.
 */
export const NavbarUserPopover = (): JSX.Element => {
    const { userInfo, fetchUserInfo } = useContext(UserContext);
    const { showSnackSev } = useContext(SnackbarContext);
    const router = useRouter();

    /**
     * Change the user's theme.
     * @param theme the theme to change to
     */
    const changeTheme = (theme: Theme) => {
        axios
            .post('/users/theme', {
                theme,
            })
            .catch(handleError(showSnackSev))
            .finally(() => {
                fetchUserInfo();
            });
    };

    return (
        <>
            <div className="m-xl">
                <Persona
                    size="huge"
                    className={styles.popoverPersona}
                    avatar={GenerateInitalsAvatarProps(generateInitals(userInfo))}
                    primaryText={
                        <>
                            {`${userInfo.givenName} ${userInfo.surname}` == ' '
                                ? userInfo.utorid
                                : `${userInfo.givenName} ${userInfo.surname}`}
                            {userInfo.admin && (
                                <Badge className={styles.adminBadge} appearance="outline">
                                    Admin
                                </Badge>
                            )}
                        </>
                    }
                    secondaryText={userInfo.email}
                    tertiaryText={userInfo.utorid}
                />
            </div>
            <div className={`${styles.popoverFooter} p-l`}>
                <Switch
                    className={styles.popoverRight}
                    checked={userInfo.theme === 'DARK'}
                    onChange={() =>
                        changeTheme(userInfo.theme === 'DARK' ? 'LIGHT' : 'DARK')
                    }
                    label={userInfo.theme === 'DARK' ? 'Dark Mode' : 'Light Mode'}
                />

                <Button
                    appearance="subtle"
                    className={`${styles.popoverButton} m-x-none p-r-none`}
                    icon={<Trophy24Regular />}
                    as={'a'}
                    href="/achievements"
                    onClick={(e) => {
                        e.preventDefault();
                        router.push('/achievements');
                    }}
                >
                    Achievements{' '}
                    {userInfo.new_achievements ? (
                        <ErrorCircle12Filled
                            fill="red"
                            color="red"
                            className="m-l-s-nudge"
                        />
                    ) : null}
                </Button>

                <Button
                    appearance="subtle"
                    className={`${styles.popoverButton} m-x-none p-r-none`}
                    icon={<SignOut24Regular />}
                    as={'a'}
                    href="https://codetierlist.utm.utoronto.ca/Shibboleth.sso/Logout"
                >
                    Sign out
                </Button>
            </div>
        </>
    );
};
