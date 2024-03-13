import { Link } from '@fluentui/react-components';

/**
 * All this link does is refresh the page
 */
export const ReloadLink = () => {
    return (
        <Link href="#" onClick={() => window.location.reload()}>
            Reload page
        </Link>
    );
};
