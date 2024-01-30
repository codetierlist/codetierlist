import axios, { handleError } from "@/axios";
import {
    Caption1
} from "@fluentui/react-components";
import { Title2 } from '@fluentui/react-text';
import {AchievementConfig} from "codetierlist-types";
import { notFound } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Container } from "react-grid-system";
import { SnackbarContext } from '@/contexts/SnackbarContext';
import {AchievementCard} from "@/components";
import {UserContext} from "@/contexts/UserContext";

export default function Page() {
    const [achievements, setAchievements] = useState<AchievementConfig[] | null>(null);
    const { showSnackSev } = useContext(SnackbarContext);
    const { userInfo,  setUserInfo} = useContext(UserContext);

    const fetchAchievements = async () => {
        await axios.get<AchievementConfig[]>(`/users/achievements`, { skipErrorHandling: true })
            .then((res) => {setAchievements(res.data); setUserInfo({...userInfo, new_achievements: false});})
            .catch(e => {
                handleError(showSnackSev)(e);
                notFound();
            });
    };

    useEffect(() => {
        void fetchAchievements();
        document.title = `Achievements - Codetierlist`;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Container component="main" className="m-t-xxxl">
            <header className={"m-b-l"}>
                <Title2>Achievements</Title2><br/>
                <Caption1>Your achievements will show here!</Caption1>
            </header>
            <div className="flex-wrap">
                {achievements?.map(achievement => <AchievementCard key={achievement.id} achievement={achievement} />)}
            </div>
        </Container>
    );
}
