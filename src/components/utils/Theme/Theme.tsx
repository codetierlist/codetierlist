import { createDarkTheme, createLightTheme } from '@fluentui/react-components';

import type { BrandVariants, Theme } from '@fluentui/react-components';

import { Space_Grotesk } from 'next/font/google';

const greenTheme: BrandVariants = {
    10: '#020402',
    20: '#141B11',
    30: '#1E2D1B',
    40: '#253A21',
    50: '#2D4828',
    60: '#34562E',
    70: '#3C6535',
    80: '#44733C',
    90: '#4B8343',
    100: '#53924A',
    110: '#5BA251',
    120: '#64B258',
    130: '#6CC35F',
    140: '#74D367',
    150: '#7DE46E',
    160: '#85F575'
};

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--spaceGrotesk' });

export const lightTheme: Theme = {
    ...createLightTheme(greenTheme)
};

export const darkTheme: Theme = {
    ...createDarkTheme(greenTheme)
};

lightTheme.fontFamilyNumeric = spaceGrotesk.style.fontFamily;
