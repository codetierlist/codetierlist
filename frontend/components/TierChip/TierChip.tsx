import { type UserTier, type Tier } from 'codetierlist-types';
import styles from './TierChip.module.css';

export declare interface TierChipProps {
  /** the tier of the course */
  tier: UserTier | Tier;

  /** the class name of the tier chip */
  className?: string;

  /** the props of the tier chip */
  props?: React.HTMLAttributes<HTMLDivElement>;
}

/**
 * A tier chip displays a single tier inside of a div. This makes it easy
 * to extend and change the styling of this component.
 * @property {UserTier | Tier} tier the tier of the course
 * @returns {JSX.Element} the tier chip
 */
export const TierChip = ({ tier, className, ...props }: TierChipProps): JSX.Element => {
    return (
        <div className={
            `${tier === '?' ? styles['tier-IDK'] : styles[`tier-${tier}`]} ${className ?? ''}`
        } {...props} >{tier}</div>
    );
};
