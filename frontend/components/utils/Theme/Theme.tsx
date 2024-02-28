import {
    createDarkTheme,
    createLightTheme,
    createHighContrastTheme,
} from '@fluentui/react-components';
import { Theme as ThemeTypes } from 'codetierlist-types';
import type { BrandVariants, Theme } from '@fluentui/react-components';

import { Space_Grotesk, Inter, Space_Mono } from 'next/font/google';
import { Palette } from './types';
import { hexColorsFromPalette, hex_to_LCH } from './palettes';

export const defaultAccentColor = '#004A4C';

type Options = {
    darkCp?: number;
    lightCp?: number;
    hueTorsion?: number;
};

function getBrandTokensFromPalette(keyColor: string, options: Options = {}) {
    const { darkCp = 2 / 3, lightCp = 1 / 3, hueTorsion = 0 } = options;
    const brandPalette: Palette = {
        keyColor: hex_to_LCH(keyColor),
        darkCp,
        lightCp,
        hueTorsion,
    };
    const hexColors = hexColorsFromPalette(keyColor, brandPalette, 16, 1);
    return hexColors.reduce((acc: Record<string, string>, hexColor, h) => {
        acc[`${(h + 1) * 10}`] = hexColor;
        return acc;
    }, {}) as BrandVariants;
}

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

export const getThemes = (accentColor: string) => {
    const brandTheme = getBrandTokensFromPalette(accentColor, {
        darkCp: 2 / 3,
        lightCp: 1 / 3,
        hueTorsion: 0,
    });
    const lightTheme: Theme = {
        ...createLightTheme(brandTheme),
    };

    const darkTheme: Theme = {
        ...createDarkTheme(brandTheme),
    };

    const highContrastTheme: Theme = {
        ...createHighContrastTheme(),
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

    highContrastTheme.fontFamilyNumeric = spaceGrotesk.style.fontFamily;
    highContrastTheme.fontFamilyBase = inter.style.fontFamily;
    highContrastTheme.fontFamilyMonospace = spaceMono.style.fontFamily;

    return themes;
};
