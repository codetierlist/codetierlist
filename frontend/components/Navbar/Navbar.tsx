import {
    NavbarUserPopover,
    generateInitials,
    generateInitialsAvatarProps,
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
    Tooltip,
} from '@fluentui/react-components';
import { Question24Regular, Settings24Regular } from '@fluentui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
            avatar={generateInitialsAvatarProps(generateInitials(userInfo), {
                badge: userInfo.new_achievements ? { status: 'busy' } : undefined,
                className: styles.avatar
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
const NavbarUserPopoverButton = (): JSX.Element => {
    const { userInfo } = useContext(UserContext);

    return (
        <Popover size="small">
            <PopoverTrigger>
                <Button
                    appearance="subtle"
                    size="small"
                    className={`m-none ${styles.popoverButton}`}
                    aria-label={`Account manager for ${userInfo.givenName} ${userInfo.surname}`}
                >
                    <UserAvatar />
                </Button>
            </PopoverTrigger>
            <PopoverSurface className="p-none m-none">
                <NavbarUserPopover />
            </PopoverSurface>
        </Popover>
    );
};

/**
 * Skeleton for the user avatar in the navbar. It is used when the user
 * is not logged in.
 */
const NavbarUserPopoverSkeleton = (): JSX.Element => {
    return (
        <div className={styles.skeletonPersona}>
            <div className={`${styles.skeletonName} ${styles.subtext}`}>
                <SkeletonItem size={12} />
                <SkeletonItem size={12} />
            </div>
            <SkeletonItem shape="circle" size={36} />
        </div>
    );
};

/**
 * The brand button is the button that contains the logo and the name of the
 * website. It is a link to the home page.
 */
const BrandButton = (): JSX.Element => {
    return (
        <h1 className={styles.title}>
            <Link className={styles.brand} href="/" aria-label="Code tier list">
                Codetierlist
            </Link>
        </h1>
    );
};

const NavbarButtonIconLink = ({
    icon,
    href,
    label,
}: {
    icon: JSX.Element;
    href: string;
    label: string;
}): JSX.Element => {
    const router = useRouter();

    return (
        <Tooltip content={label} relationship="label">
            <Button
                appearance="subtle"
                size="large"
                className="m-none"
                aria-label={label}
                icon={icon}
                onClick={() => router.push(href)}
            />
        </Tooltip>
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
            <BrandButton />

            <div className={styles.navbarButtons}>
                <NavbarButtonIconLink
                    icon={<Question24Regular />}
                    href="/help"
                    label="Help"
                />

                <NavbarButtonIconLink
                    icon={<Settings24Regular />}
                    href="/settings"
                    label="Settings"
                />

                {userInfo !== defaultUser && <NavbarUserPopoverButton />}

                {userInfo === defaultUser && <NavbarUserPopoverSkeleton />}
            </div>
        </header>
    );
};
