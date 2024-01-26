import { Badge } from '@fluentui/react-components';
import styles from './SessionBlock.module.css';
import {Session} from 'codetierlist-types';

export declare interface SessionBlockProps {
    /** the session to display */
    session: Session;
}

export const SessionBlock = ({ session }: SessionBlockProps): JSX.Element => {
    switch (session) {
    case "Summer":
        return (
            <Badge
                appearance="filled"
                className={styles.badge}
                style={{
                    color: 'var(--colorNeutralForegroundInverted)',
                    backgroundColor: 'var(--colorPaletteGreenForeground2)'
                }}>
                Summer
            </Badge>
        );
    case "Fall":
        return (
            <Badge
                appearance="filled"
                className={styles.badge}
                style={{
                    color: 'var(--colorNeutralForegroundInverted)',
                    backgroundColor: 'var(--colorPaletteRedForeground2)'
                }}>
                Fall
            </Badge>
        );
    case "Winter":
        return (
            <Badge
                appearance="filled"
                className={styles.badge}
                style={{
                    color: 'var(--colorNeutralForegroundInverted)',
                    backgroundColor: 'var(--colorPaletteBlueForeground2)'
                }}>
                Winter
            </Badge>
        );
    }
};
