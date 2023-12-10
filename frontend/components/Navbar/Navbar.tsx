import { GenerateInitalsAvatarProps, generateInitals } from '@/components';
import { UserContext, defaultUser } from '@/contexts/UserContext';
import { Button, Badge, Persona, SkeletonItem, Popover, Switch, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
import Link from 'next/link';
import { useContext } from 'react';
import styles from './Navbar.module.css';
import { Theme } from 'codetierlist-types';
import axios, { handleError } from "@/axios";
import { SnackbarContext } from '@/contexts/SnackbarContext';

/**
 * The user popover content is the content that appears when
 * the user clicks on their avatar.
 */
const UserPopoverContent = (): JSX.Element => {
    const { userInfo, fetchUserInfo } = useContext(UserContext);
    const { showSnackSev } = useContext(SnackbarContext);

    /**
     * Change the user's theme.
     * @param theme the theme to change to
     */
    const changeTheme = (theme: Theme) => {
        axios.post('/users/theme', {
            theme,
        }).catch((e) => {
            handleError(e.message, showSnackSev);
        }).finally(() => {
            fetchUserInfo();
        });
    };

    return (
        <div>
            <div className={styles.popoverButtonContainer}>
                <Switch
                    checked={userInfo.theme === "DARK"}
                    onChange={() => changeTheme(userInfo.theme === "DARK" ? "LIGHT" : "DARK")}
                    label={userInfo.theme === "DARK" ? "Dark Mode" : "Light Mode"}
                />

                <Link href="https://codetierlist.utm.utoronto.ca/Shibboleth.sso/Logout">
                    <Button appearance="subtle">
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
            />
        </div>
    );
};

/**
 * The user avatar is the avatar that appears in the navbar. It contains
 * the user's name and role. It is also a button that opens the user popover.
 */
const UserAvatar = (): JSX.Element => {
    const { userInfo } = useContext(UserContext);

    return (
        <Persona
            textPosition="before"
            avatar={GenerateInitalsAvatarProps(generateInitals(userInfo))}
            primaryText={
                <span className={styles.subtext}>
                    {userInfo.admin && <Badge className={styles.adminBadge} appearance="outline">Admin</Badge>}
                    {`${userInfo.givenName} ${userInfo.surname}` == " " ? userInfo.utorid : `${userInfo.givenName} ${userInfo.surname}`}
                </span>
            }
            secondaryText={
                <span className={styles.subtext}>
                    { userInfo.utorid }
                </span>
            }
        />
    );
};

/**
 * The navbar component is the top bar of the website. It contains the
 * logo and the user's name and role.
 * @returns {JSX.Element} the navbar
 */
export const Navbar = (): JSX.Element => {
    const { userInfo } = useContext(UserContext);

    return (
        <header className={styles.navbar}>
            <h1 className={styles.title}>
                <Link className={styles.brand} href="/">Codetierlist</Link>
            </h1>

            {(userInfo.email !== defaultUser.email) && (
                <Popover>
                    <PopoverTrigger>
                        <Button appearance="subtle" size="small" className={styles.userButton}>
                            <UserAvatar />
                        </Button>
                    </PopoverTrigger>
                    <PopoverSurface>
                        <UserPopoverContent />
                    </PopoverSurface>
                </Popover>
            )}

            {(userInfo.email === defaultUser.email) && (
                <div className={styles.skeletonPersona}>
                    <div className={`${styles.skeletonName} ${styles.subtext}`}>
                        <SkeletonItem size={12} />
                        <SkeletonItem size={12} />
                    </div>
                    <SkeletonItem shape="circle" size={36} />
                </div>
            )}

        </header>
    );
};
