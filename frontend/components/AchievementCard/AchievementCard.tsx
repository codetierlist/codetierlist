import {
    Caption1,
    Card,
    CardPreview,
    Text
} from "@fluentui/react-components";
import { AchievementConfig } from "codetierlist-types";

export const AchievementCard = ({ achievement }: { achievement: AchievementConfig }) => {
    return (
        <Card orientation="horizontal">
            <CardPreview>
                <img
                    src={`achievements/${achievement.icon}`}
                    alt=""
                />
            </CardPreview>

            <div>
                <Text as="h3" weight="semibold">{achievement.name}</Text>
                <br />
                <Caption1 as="p">
                    {achievement.description}
                </Caption1>
            </div>
        </Card>
    );
};
