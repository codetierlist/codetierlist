import { Link, Persona } from '@fluentui/react-components';
import styles from './Navbar.module.css';
import { GenerateInitalsAvatarProps } from '@/components';

/**
 * The navbar component is the top bar of the website. It contains the
 * logo and the user's name and role.
 * @returns {JSX.Element} the navbar
 */
export const Navbar = (): JSX.Element => {
    const user = { utorid: "michael", email: "liut" };

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
