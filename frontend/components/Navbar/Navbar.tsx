import { GenerateInitalsAvatarProps, generateInitals } from '@/components';
import { UserContext, defaultUser } from '@/contexts/UserContext';
import { Badge, Persona, SkeletonItem } from '@fluentui/react-components';
import Link from 'next/link';
import { useContext } from 'react';
import styles from './Navbar.module.css';

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
            )}

            {(userInfo.email === defaultUser.email) && (
                <div className={styles.skeletonPersona}>
                    <div className={`${styles.skeletonPersonaText} ${styles.subtext}`}>
                        <SkeletonItem size={12} />
                        <SkeletonItem size={12} />
                    </div>
                    <SkeletonItem shape="circle" size={36} />
                </div>
            )}
        </header>
    );
};
