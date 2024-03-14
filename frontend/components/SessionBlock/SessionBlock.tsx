import { Badge } from '@fluentui/react-components';
import styles from './SessionBlock.module.css';
import { Session } from 'codetierlist-types';
import { CSSProperties } from 'react';

/**
 * The styles for the session badge per session
 */
const sessionStyles: Record<Session, CSSProperties> = {
    SUMMER: {
        color: 'var(--colorNeutralForegroundInverted)',
        backgroundColor: 'var(--colorPaletteGreenForeground2)',
    },
    FALL: {
        color: 'var(--colorNeutralForegroundInverted)',
        backgroundColor: 'var(--colorPaletteRedForeground2)',
    },
    WINTER: {
        color: 'var(--colorNeutralForegroundInverted)',
        backgroundColor: 'var(--colorPaletteBlueForeground2)',
    },
};

/**
 * A badge that displays the session
 */
export const SessionBlock = ({
    session,
}: {
    /** the session to display */
    session: Session;
}): JSX.Element => {
    return (
        <Badge
            shape="square"
            appearance="filled"
            className={styles.badge}
            style={sessionStyles[session]}
        >
            {session}
        </Badge>
    );
};
