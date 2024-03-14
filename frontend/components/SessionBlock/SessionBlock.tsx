import { Badge } from '@fluentui/react-components';
import styles from './SessionBlock.module.css';
import { Session } from 'codetierlist-types';
import { CSSProperties } from 'react';

/**
 * Get the style for the session
 * @param session the session
 * @returns the style for the session
 */
const getSessionStyle = (session: Session): CSSProperties => {
    switch (session) {
        case 'SUMMER':
            return {
                color: 'var(--colorNeutralForegroundInverted)',
                backgroundColor: 'var(--colorPaletteGreenForeground2)',
            };
        case 'FALL':
            return {
                color: 'var(--colorNeutralForegroundInverted)',
                backgroundColor: 'var(--colorPaletteRedForeground2)',
            };
        case 'WINTER':
            return {
                color: 'var(--colorNeutralForegroundInverted)',
                backgroundColor: 'var(--colorPaletteBlueForeground2)',
            };
    }
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
            style={getSessionStyle(session)}
        >
            {session}
        </Badge>
    );
};
