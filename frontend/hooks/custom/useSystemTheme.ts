import { useMediaQuery } from '@/hooks';
import { Theme } from 'codetierlist-types';
import { useMemo } from 'react';

/**
 * Conditionally sets the theme based on the system theme
 */
export const useSystemTheme = (theme: Theme): Omit<Theme, 'SYSTEM'> => {
    const darkQuery = useMediaQuery('(prefers-color-scheme: dark)');
    const contrastQuery = useMediaQuery('(prefers-contrast: more)');

    return useMemo(() => {
        // set scrollbar color
        if (typeof document !== 'undefined') {
            document.documentElement.style.colorScheme =
                theme === 'SYSTEM' ? (darkQuery ? 'dark' : 'light') : theme;
        }

        if (theme === 'SYSTEM') {
            return contrastQuery ? 'CONTRAST' : darkQuery ? 'DARK' : 'LIGHT';
        } else {
            return theme;
        }
    }, [darkQuery, contrastQuery, theme]);
};
