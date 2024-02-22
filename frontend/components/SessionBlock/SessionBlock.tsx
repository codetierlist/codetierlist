import { Badge } from '@fluentui/react-components';
import styles from './SessionBlock.module.css';
import { Session } from 'codetierlist-types';
import { CSSProperties } from 'react';

export declare type SessionBlockProps = {
    /** the session to display */
    session: Session;
};

/**
 * Get the style for the session badge
 */
const getSessionStyle = (session: Session): CSSProperties | undefined => {
    switch (session) {
        case 'Summer':
            return {
                color: 'var(--colorNeutralForegroundInverted)',
                backgroundColor: 'var(--colorPaletteGreenForeground2)',
            };
        case 'Fall':
            return {
                color: 'var(--colorNeutralForegroundInverted)',
                backgroundColor: 'var(--colorPaletteRedForeground2)',
            };
        case 'Winter':
            return {
                color: 'var(--colorNeutralForegroundInverted)',
                backgroundColor: 'var(--colorPaletteBlueForeground2)',
            };
        default:
            return undefined;
    }
};

/**
 * A badge that displays the session
 */
export const SessionBlock = ({ session }: SessionBlockProps): JSX.Element => {
    return (
        <Badge
            appearance="filled"
            className={styles.badge}
            style={getSessionStyle(session)}
        >
            {session}
        </Badge>
    );
};
