import { GenerateInitalsAvatarProps, NavbarUserPopover, generateInitals } from '@/components';
import { UserContext, defaultUser } from '@/contexts/UserContext';
import { Badge, Button, Persona, Popover, PopoverSurface, PopoverTrigger, SkeletonItem } from '@fluentui/react-components';
import Link from 'next/link';
import { useContext } from 'react';
import styles from './Navbar.module.css';
import {
    ErrorCircle24Filled
} from '@fluentui/react-icons';

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
                    {userInfo.new_achievements ? <ErrorCircle24Filled fill="red" color="red"/> : null}
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
                        <NavbarUserPopover />
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
