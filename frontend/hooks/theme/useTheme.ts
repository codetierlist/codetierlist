import { getBrandTokensFromPalette } from '@/components';
import {
    createDarkTheme,
    createHighContrastTheme,
    createLightTheme,
} from '@fluentui/react-components';
import { Inter, Space_Grotesk, Space_Mono } from 'next/font/google';
import { useMemo } from 'react';

import type { Theme } from '@fluentui/react-components';
import { Theme as ThemeTypes } from 'codetierlist-types';

const useBrandTokens = (accentColor: string) => {
    return useMemo(() => {
        return getBrandTokensFromPalette(accentColor);
    }, [accentColor]);
};

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--spaceGrotesk',
});

const inter = Inter({ subsets: ['latin'], variable: '--inter' });

const spaceMono = Space_Mono({
    subsets: ['latin'],
    variable: '--spaceMono',
    weight: '400',
});

const highContrastTheme: Theme = {
    ...createHighContrastTheme(),
};

highContrastTheme.fontFamilyNumeric = spaceGrotesk.style.fontFamily;
highContrastTheme.fontFamilyBase = inter.style.fontFamily;
highContrastTheme.fontFamilyMonospace = spaceMono.style.fontFamily;

/**
 * Get the theme for the app based on the accent color.
 */
export const useTheme = (accentColor: string) => {
    const brandTheme = useBrandTokens(accentColor);

    return useMemo(() => {
        const lightTheme: Theme = {
            ...createLightTheme(brandTheme),
        };

        const darkTheme: Theme = {
            ...createDarkTheme(brandTheme),
        };

        const themes: Record<Exclude<ThemeTypes, 'SYSTEM'>, Theme> = {
            LIGHT: lightTheme,
            DARK: darkTheme,
            CONTRAST: highContrastTheme,
        };

        lightTheme.fontFamilyNumeric = spaceGrotesk.style.fontFamily;
        lightTheme.fontFamilyBase = inter.style.fontFamily;
        lightTheme.fontFamilyMonospace = spaceMono.style.fontFamily;

        darkTheme.fontFamilyNumeric = spaceGrotesk.style.fontFamily;
        darkTheme.fontFamilyBase = inter.style.fontFamily;
        darkTheme.fontFamilyMonospace = spaceMono.style.fontFamily;

        return themes;
    }, [brandTheme]);
};
