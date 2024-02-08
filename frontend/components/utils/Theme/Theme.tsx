import { createDarkTheme, createLightTheme } from '@fluentui/react-components';

import type { BrandVariants, Theme } from '@fluentui/react-components';

import { Space_Grotesk, Inter, Space_Mono } from 'next/font/google';

const greenTheme: BrandVariants = {
    10: `hsl(var(--accent-hue), 33.33%, 1.18%)`,
    20: `hsl(var(--accent-hue), 22.73%, 8.63%)`,
    30: `hsl(var(--accent-hue), 25%, 14.12%)`,
    40: `hsl(var(--accent-hue), 27.47%, 17.84%)`,
    50: `hsl(var(--accent-hue), 28.57%, 21.96%)`,
    60: `hsl(var(--accent-hue), 30.3%, 25.88%)`,
    70: `hsl(var(--accent-hue), 31.17%, 30.2%)`,
    80: `hsl(var(--accent-hue), 31.43%, 34.31%)`,
    90: `hsl(var(--accent-hue), 32.32%, 38.82%)`,
    100: `hsl(var(--accent-hue), 32.73%, 43.14%)`,
    110: `hsl(var(--accent-hue), 33.33%, 47.65%)`,
    120: `hsl(var(--accent-hue), 36.89%, 52.16%)`,
    130: `hsl(var(--accent-hue), 45.45%, 56.86%)`,
    140: `hsl(var(--accent-hue), 55.1%, 61.57%)`,
    150: `hsl(var(--accent-hue), 68.6%, 66.27%)`,
    160: `hsl(var(--accent-hue), 86.49%, 70.98%)`,
};

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--spaceGrotesk' });
const inter = Inter({ subsets: ['latin'], variable: '--inter' });
const spaceMono = Space_Mono({
    subsets: ['latin'],
    variable: '--spaceMono',
    weight: '400',
});

export const lightTheme: Theme = {
    ...createLightTheme(greenTheme),
};

export const darkTheme: Theme = {
    ...createDarkTheme(greenTheme),
};

lightTheme.fontFamilyNumeric = spaceGrotesk.style.fontFamily;
lightTheme.fontFamilyBase = inter.style.fontFamily;
lightTheme.fontFamilyMonospace = spaceMono.style.fontFamily;

darkTheme.fontFamilyNumeric = spaceGrotesk.style.fontFamily;
darkTheme.fontFamilyBase = inter.style.fontFamily;
darkTheme.fontFamilyMonospace = spaceMono.style.fontFamily;
