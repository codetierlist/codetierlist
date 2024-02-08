import { Caption1, Card, CardPreview, Text } from '@fluentui/react-components';
import { AchievementConfig } from 'codetierlist-types';
import Image from 'next/image';

export const RawAchievementCard = ({
    icon,
    description,
    name,
}: Omit<AchievementConfig, 'id' | 'config' | 'type' | 'depends_on'>) => {
    return (
        <Card orientation="horizontal" className="p-y-none" style={{ height: 100 }}>
            <CardPreview
                style={{
                    width: 100,
                    height: 100,
                }}
            >
                <Image
                    src={`/achievements/${icon}`}
                    alt=""
                    width="100"
                    height="100"
                    style={{ objectFit: 'contain' }}
                />
            </CardPreview>

            <div>
                <Text as="h3" weight="semibold">
                    {name}
                </Text>
                <br />
                <Caption1 as="p">{description}</Caption1>
            </div>
        </Card>
    );
};

export const AchievementCard = ({ achievement }: { achievement: AchievementConfig }) => {
    return <RawAchievementCard {...achievement} />;
};
