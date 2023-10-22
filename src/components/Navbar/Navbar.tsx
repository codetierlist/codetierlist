import { GenerateInitalsAvatarProps } from '@/components';
import styles from './Navbar.module.css';
import { Persona } from '@fluentui/react-components';
import { UserContext } from '@/contexts/UserContext';
import { useContext } from 'react';
import Link from 'next/link';

/**
 * The navbar component is the top bar of the website. It contains the
 * logo and the user's name and role.
 * @returns {JSX.Element} the navbar
 */
export const Navbar = () => {
    const defaultUser = useContext(UserContext);

    return (
        <header className={styles.navbar}>
            <h1 className={styles.title}>
                <Link className={styles.brand} href="/">Codetierlist</Link>
            </h1>

            <Persona
                textPosition="before"
                avatar={GenerateInitalsAvatarProps(defaultUser.name)}
                primaryText={defaultUser.name}
                secondaryText={defaultUser.role}
            />
        </header>
    );
};
