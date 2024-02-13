import {
    generateInitalsAvatarProps,
    NavbarUserPopover,
    generateInitals,
} from '@/components';
import { UserContext, defaultUser } from '@/contexts/UserContext';
import {
    Badge,
    Button,
    Persona,
    Popover,
    PopoverSurface,
    PopoverTrigger,
    SkeletonItem,
} from '@fluentui/react-components';
import Link from 'next/link';
import { useContext } from 'react';
import styles from './Navbar.module.css';

/**
 * The user avatar is the avatar that appears in the navbar. It contains
 * the user's name and role. It is also a button that opens the user popover.
 */
const UserAvatar = (): JSX.Element => {
    const { userInfo } = useContext(UserContext);

    return (
        <Persona
            textPosition="before"
            avatar={generateInitalsAvatarProps(generateInitals(userInfo), {
                badge: userInfo.new_achievements ? { status: 'busy' } : undefined,
            })}
            primaryText={
                <span className={styles.subtext}>
                    {userInfo.admin && (
                        <Badge className="m-x-xs" appearance="outline">
                            Admin
                        </Badge>
                    )}
                    {`${userInfo.givenName} ${userInfo.surname}` == ' '
                        ? userInfo.utorid
                        : `${userInfo.givenName} ${userInfo.surname}`}
                </span>
            }
            secondaryText={<span className={styles.subtext}>{userInfo.utorid}</span>}
        />
    );
};

/**
 * The navbar component is the top bar of the website. It contains the
 * logo and the user's name and role.
 */
export const Navbar = (): JSX.Element => {
    const { userInfo } = useContext(UserContext);

    return (
        <header className={styles.navbar}>
            <h1 className={styles.title}>
                <Link className={styles.brand} href="/" aria-label="Code tier list">
                    Codetierlist
                </Link>
            </h1>

            {userInfo !== defaultUser && (
                <Popover size="small">
                    <PopoverTrigger>
                        <Button
                            appearance="subtle"
                            size="small"
                            className={styles.userButton}
                            aria-label={`Account manager for ${userInfo.givenName} ${userInfo.surname}`}
                        >
                            <UserAvatar />
                        </Button>
                    </PopoverTrigger>
                    <PopoverSurface className="p-none m-none">
                        <NavbarUserPopover />
                    </PopoverSurface>
                </Popover>
            )}

            {userInfo === defaultUser && (
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
