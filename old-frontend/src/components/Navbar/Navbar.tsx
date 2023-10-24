import { getEmail, getUtorid } from '@/lib/frontendUtils';
import { Persona } from '@/components/fluent';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { GenerateInitalsAvatarProps } from '../server';

/**
 * The navbar component is the top bar of the website. It contains the
 * logo and the user's name and role.
 * @returns {JSX.Element} the navbar
 */
export const Navbar = (): JSX.Element => {
    const user = { utorid: getUtorid(), email: getEmail() };

    return (
        <header className={styles.navbar}>
            <h1 className={styles.title}>
                <Link className={styles.brand} href="/">Codetierlist</Link>
            </h1>

            <Persona
                textPosition="before"
                avatar={GenerateInitalsAvatarProps(user.utorid)}
                primaryText={user.email.split('@')[0]}
                secondaryText={user.utorid}
            />
        </header>
    );
};
