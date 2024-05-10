import axios, { handleError } from '@/axios';
import { SnackbarContext, UserContext } from '@/hooks';
import { AchievementConfig } from 'codetierlist-types';
import { notFound } from 'next/navigation';
import { useContext, useEffect, useMemo, useState } from 'react';

/**
 * Fetches the achievements from the server and returns them
 * along with the count of hidden achievements.
 */
export const useAchievements = () => {
    const [achievements, setAchievements] = useState<AchievementConfig[] | null>(null);
    const { showSnack } = useContext(SnackbarContext);
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
                handleError(showSnack)(e);
                notFound();
            });
    };

    useEffect(() => {
        void fetchAchievements();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { achievements, hiddenAchievementCount };
};
