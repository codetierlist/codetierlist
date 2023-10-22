import { type DisplayTier, type Tier } from '@/lib/types';
import styles from './TierChip.module.css';

export declare interface TierChipProps {
  /** the tier of the course */
  tier: DisplayTier | Tier

  /** the props of the component */
  props?: React.HTMLAttributes<HTMLDivElement>
}

/**
 * A tier chip displays a single tier inside of a div. This makes it easy
 * to extend and change the styling of this component.
 * @property {DisplayTier | Tier} tier the tier of the course
 * @returns {JSX.Element} the tier chip
 */
export const TierChip = ({ tier, ...props }: TierChipProps): JSX.Element => {
    return (
        <div className={
            tier === '?' ? styles['tier-IDK'] : styles[`tier-${tier}`]
        } {...props} >{tier}</div>
    );
};
