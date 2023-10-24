import { GenerateInitalsAvatarProps } from '@/components/client';
import { getUserFromUTORidAndEmail } from '@/lib/apiUtils';
import { getEmail, getUtorid } from '@/lib/frontendUtils';
import { Persona } from '@fluentui/react-components';
import Link from 'next/link';
import styles from './Navbar.module.css';

/**
 * The navbar component is the top bar of the website. It contains the
 * logo and the user's name and role.
 * @returns {JSX.Element} the navbar
 */
export const Navbar = () => {
    const user = getUserFromUTORidAndEmail(getUtorid(), getEmail());

    return (
        <header className={styles.navbar}>
            <h1 className={styles.title}>
                <Link className={styles.brand} href="/">Codetierlist</Link>
            </h1>

            <Persona
                textPosition="before"
                avatar={GenerateInitalsAvatarProps(user.utorid)}
                primaryText={user.utorid}
                secondaryText={user.utorid}
            />
        </header>
    );
};
