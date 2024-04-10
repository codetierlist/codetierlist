import { AchievementCard, RawAchievementCard } from '@/components';
import { useAchievements } from '@/hooks';
import { Title2 } from '@fluentui/react-text';
import { useEffect } from 'react';
import { Col, Container, Row } from 'react-grid-system';

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
