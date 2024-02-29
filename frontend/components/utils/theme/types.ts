// source: https://github.com/microsoft/fluentui/blob/master/packages/react-components/theme-designer/src/colors

export type Vec3 = [number, number, number];

export type Curve = {
    points: [Vec3, Vec3, Vec3];
    cacheArcLengths?: number[];
};

export interface CurvePath {
    curves: Curve[];
    cacheLengths?: number[];
}

export interface CurvedHelixPath extends CurvePath {
    torsion?: number;
    torsionT0?: number;
}

export type Palette = {
    keyColor: Vec3;
    darkCp: number;
    lightCp: number;
    hueTorsion: number;
};

export type PaletteConfig = {
    range: [number, number];
    nShades: number;
    linearity?: number;
    shadeNames?: Record<number, string>;
};

export type Theme = {
    backgrounds: {
        [paletteId: string]: PaletteConfig;
    };
    foregrounds: {
        [paletteId: string]: PaletteConfig;
    };
};
