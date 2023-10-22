import { Tier } from "@/lib/types";
import styles from "./TierChip.module.css";

export declare type TierChipProps = {
    tier: Tier;
    props?: React.HTMLAttributes<HTMLDivElement>;
}

export const TierChip = ({ tier, ...props }: TierChipProps): JSX.Element => {
    return (
        <div className={
            tier === "?" ? styles['tier-idk'] : styles[`tier-${tier}`]
        } {...props} >{tier}</div>
    )
}
