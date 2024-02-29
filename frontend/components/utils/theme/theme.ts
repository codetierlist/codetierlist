import type { BrandVariants } from '@fluentui/react-components';

import { hexColorsFromPalette, hex_to_LCH } from './palettes';
import { Palette } from './types';

export const defaultAccentColor = '#004c20';

type Options = {
    darkCp?: number;
    lightCp?: number;
    hueTorsion?: number;
};

export function getBrandTokensFromPalette(keyColor: string, options: Options = {}) {
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
