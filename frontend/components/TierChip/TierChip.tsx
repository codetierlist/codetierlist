import { type UserTier, type Tier } from "codetierlist-types";
import styles from "./TierChip.module.css";

export declare interface TierChipProps {
    /** the tier of the course */
    tier: UserTier | Tier;

    /** the class name of the tier chip */
    className?: string;

    /** the props of the tier chip */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props?: any;
}

export declare interface RawTierChipProps extends TierChipProps {
    /** the slot of the tier chip */
    Slot: keyof JSX.IntrinsicElements | React.ComponentType;
}

/**
 * Get the class of the tier chip based on the tier.
 * @param {UserTier | Tier} tier the tier of the course
 * @returns {string} the class of the tier chip
 */
export const getTierClass = (tier: UserTier | Tier): string => {
    return tier === "?" ? styles["tier-IDK"] : styles[`tier-${tier}`];
};

/**
 * A tier chip displays a single tier inside of a div. This makes it easy
 * to extend and change the styling of this component.
 * @property {UserTier | Tier} tier the tier of the course
 * @returns {JSX.Element} the tier chip
 */
export const RawTierChip = ({
    tier,
    Slot,
    className,
    ...props
}: RawTierChipProps): JSX.Element => {
    return (
        <Slot className={`${getTierClass(tier)} ${className ?? ""}`} {...props}>
            {tier}
        </Slot>
    );
};

/**
 * A tier chip displays a single tier inside of a div. This makes it easy
 * to extend and change the styling of this component.
 * @property {UserTier | Tier} tier the tier of the course
 * @returns {JSX.Element} the tier chip
 */
export const TierChip = ({ tier, className, ...props }: TierChipProps): JSX.Element => {
    return (
        <RawTierChip
            tier={tier}
            Slot="div"
            className={`${styles.tier} ${className ?? ""}`}
            {...props}
        />
    );
};
