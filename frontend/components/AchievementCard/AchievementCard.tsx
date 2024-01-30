import {AchievementConfig} from "codetierlist-types";
import {ToolTipIcon} from "@/components";

export const AchievementCard = ({achievement}: { achievement: AchievementConfig }) => {
    return (
        <ToolTipIcon tooltip={(<><h3>{achievement.name}</h3><br/>
            <p>{achievement.description}</p></>)}
        icon={<img src={`achievements/${achievement.icon}`} alt={achievement.name}
            // TODO make this scale better
            style={{width: "100px", height: "100px", borderRadius: "100%"}}/>}
        className={"achievementCard"}/>
    );
};