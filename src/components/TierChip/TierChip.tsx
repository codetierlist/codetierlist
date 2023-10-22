import { type DisplayTier, type Tier } from '@/lib/types';
import styles from './TierChip.module.css';

export declare interface TierChipProps {
  /** the tier of the course */
  tier: DisplayTier | Tier

  /** the props of the component */
  props?: React.HTMLAttributes<HTMLDivElement>
}

export const TierChip = ({ tier, ...props }: TierChipProps): JSX.Element => {
    return (
        <div className={
            tier === '?' ? styles['tier-idk'] : styles[`tier-${tier}`]
        } {...props} >{tier}</div>
    );
};
