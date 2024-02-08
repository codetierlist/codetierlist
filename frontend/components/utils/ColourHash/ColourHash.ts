import styles from "./ColourHash.module.css";

const fluentNineColors = [
    styles.darkRed,
    styles.cranberry,
    styles.red,
    styles.pumpkin,
    styles.peach,
    styles.marigold,
    styles.gold,
    styles.brass,
    styles.brown,
    styles.forest,
    styles.seafoam,
    styles.darkGreen,
    styles.lightTeal,
    styles.teal,
    styles.steel,
    styles.blue,
    styles.royalBlue,
    styles.cornflower,
    styles.navy,
    styles.lavender,
    styles.purple,
    styles.grape,
    styles.lilac,
    styles.pink,
    styles.magenta,
    styles.plum,
    styles.beige,
    styles.mink,
    styles.platinum,
    styles.anchor,
];

/**
 * Returns a hex colour based on a string
 * @param str String to hash
 */
const getHashCode = (str: string | undefined): number => {
    let hashCode = 0;
    if (!str) return hashCode;
    for (let len = str.length - 1; len >= 0; len--) {
        const ch = str.charCodeAt(len);
        const shift = len % 8;
        hashCode ^= (ch << shift) + (ch >> (8 - shift)); // eslint-disable-line no-bitwise
    }
    return hashCode;
};

/**
 * Returns a hex colour based on a string
 * @param str String to hash
 */
export const colourHash = (str: string | undefined): string => {
    return fluentNineColors[getHashCode(str) % fluentNineColors.length];
};
