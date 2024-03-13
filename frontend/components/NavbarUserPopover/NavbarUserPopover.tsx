import { generateInitials, generateInitialsAvatarProps } from '@/components';
import { UserContext } from '@/hooks';
import { Badge, Button, Persona } from '@fluentui/react-components';
import {
    SignOut24Regular,
    Trophy24Regular,
} from '@fluentui/react-icons';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import styles from './NavbarUserPopover.module.css';

/**
 * The user popover content is the content that appears when
 * the user clicks on their avatar.
 */
export const NavbarUserPopover = (): JSX.Element => {
    const { userInfo } = useContext(UserContext);
    const router = useRouter();

    return (
        <>
            <div className="m-xl">
                <Persona
                    size="huge"
                    className={styles.popoverPersona}
                    avatar={generateInitialsAvatarProps(generateInitials(userInfo))}
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
                    Achievements
                    {userInfo.new_achievements ? (
                        <Badge appearance="filled" color="danger" className={styles.newAchievementsBadge}>
                            New
                        </Badge>
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
