import {
    createDarkTheme,
    createLightTheme,
    createHighContrastTheme,
} from '@fluentui/react-components';
import { Theme as ThemeTypes } from 'codetierlist-types';
import type { BrandVariants, Theme } from '@fluentui/react-components';

import { Space_Grotesk, Inter, Space_Mono } from 'next/font/google';

const brandTheme: BrandVariants = {
    10: '#010405',
    20: '#081C1E',
    30: '#022F32',
    40: '#003D3F',
    50: '#004A4C',
    60: '#005958',
    70: '#006765',
    80: '#007671',
    90: '#00867D',
    100: '#009589',
    110: '#16A594',
    120: '#2DB49F',
    130: '#41C4AA',
    140: '#55D4B5',
    150: '#69E3C0',
    160: '#86F1CD',
};

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--spaceGrotesk' });
const inter = Inter({ subsets: ['latin'], variable: '--inter' });
const spaceMono = Space_Mono({
    subsets: ['latin'],
    variable: '--spaceMono',
    weight: '400',
});

export const lightTheme: Theme = {
    ...createLightTheme(brandTheme),
};

export const darkTheme: Theme = {
    ...createDarkTheme(brandTheme),
};

export const highContrastTheme: Theme = {
    ...createHighContrastTheme(),
};

export const themes: Record<Exclude<ThemeTypes, 'SYSTEM'>, Theme> = {
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
