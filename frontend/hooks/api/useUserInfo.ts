import axios, { handleError } from '@/axios';
import {
    defaultUser,
    ShowSnackType
} from '@/hooks';
import { FetchedUser } from 'codetierlist-types';
import { useEffect, useState } from 'react';

/**
 * Fetches user info
 */
export const useUserInfo = (showSnack: ShowSnackType) => {
    const [userInfo, setUserInfo] = useState<FetchedUser>(defaultUser);

    const fetchUserInfo = async () => {
        await axios('/users')
            .then(({ data }) => {
                setUserInfo(data as FetchedUser);
            })
            .catch((e) => {
                handleError(showSnack)(e);
            });
    };

    useEffect(() => {
        void fetchUserInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { userInfo, setUserInfo, fetchUserInfo };
};
