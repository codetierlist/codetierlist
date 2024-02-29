/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';
import { Theme, type FetchedUser } from 'codetierlist-types';

/**
 * The temporary theme while the user's theme is still loading.
 */
export const defaultTheme: Theme = 'LIGHT';
/**
 * The context for the current theme.
 */
export const ThemeContext = createContext({
    /**
     * The selected theme.
     */
    theme: defaultTheme,
    /**
     * Sets the theme to the global state.
     * @param theme the theme to set
     */
    setTheme: (theme: Exclude<Theme, 'SYSTEM'>) => {},
} as {
    theme: Exclude<Theme, 'SYSTEM'>;
    setTheme: (theme: Exclude<Theme, 'SYSTEM'>) => void;
});
