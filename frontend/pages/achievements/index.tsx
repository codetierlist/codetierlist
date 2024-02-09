import axios, { handleError } from '@/axios';
import { AchievementCard, RawAchievementCard } from '@/components';
import { SnackbarContext } from '@/contexts/SnackbarContext';
import { UserContext } from '@/contexts/UserContext';
import { Title2 } from '@fluentui/react-text';
import { AchievementConfig } from 'codetierlist-types';
import { notFound } from 'next/navigation';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-grid-system';

/**
 * Fetches the achievements from the server and returns them
 * along with the count of hidden achievements.
 */
const useAchievements = () => {
    const [achievements, setAchievements] = useState<AchievementConfig[] | null>(null);
    const { showSnackSev } = useContext(SnackbarContext);
    const { userInfo, setUserInfo } = useContext(UserContext);

    const hiddenAchievementCount = useMemo(() => {
        if (!achievements) return 0;

        return achievements.filter((achievement) => achievement.id === -1).length;
    }, [achievements]);

    const fetchAchievements = async () => {
        await axios
            .get<AchievementConfig[]>(`/users/achievements`, { skipErrorHandling: true })
            .then((res) => {
                setAchievements(res.data);
                setUserInfo({ ...userInfo, new_achievements: false });
            })
            .catch((e) => {
                handleError(showSnackSev)(e);
                notFound();
            });
    };

    useEffect(() => {
        void fetchAchievements();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { achievements, hiddenAchievementCount };
}

export default function Page() {
    const { achievements, hiddenAchievementCount } = useAchievements();

    useEffect(() => {
        document.title = `Achievements - Codetierlist`;
    }, []);

    return (
        <Container component="main" className="m-t-xxxl">
            <header className={'m-b-l'}>
                <Title2 as="h2">Achievements</Title2>
                <br />
            </header>
            <Row>
                {achievements
                    ?.filter((achievement) => achievement.id !== -1)
                    .map((achievement) => (
                        <Col key={achievement.id} sm={12} className="m-b-l">
                            <AchievementCard
                                key={achievement.id}
                                achievement={achievement}
                            />
                        </Col>
                    ))}
            </Row>

            {hiddenAchievementCount > 0 && (
                <Row>
                    <Col sm={12} className="m-b-l">
                        <RawAchievementCard
                            icon="unknown.png"
                            name={`${hiddenAchievementCount} hidden achievement${hiddenAchievementCount > 1 ? 's' : ''} remaining`}
                            description="Details of these achievements are hidden until you unlock them."
                        />
                    </Col>
                </Row>
            )}
        </Container>
    );
}
