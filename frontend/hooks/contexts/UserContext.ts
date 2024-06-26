/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';
import { type FetchedUser } from 'codetierlist-types';
import { defaultAccentColor } from '@/components/utils/theme/theme';

/**
 * The user that is shown when the user's information is still loading.
 */
export const defaultUser: FetchedUser = {
    utorid: 'mikuhats',
    email: 'hatsune.miku@utoronto.ca',
    roles: [],
    admin: false,
    surname: 'Hatsune',
    givenName: 'Miku',
    theme: 'LIGHT',
    new_achievements: false,
    accent_color: defaultAccentColor,
};

/**
 * The context for the user's information.
 */
export const UserContext = createContext({
    userInfo: defaultUser,
    setUserInfo: (user: FetchedUser) => {},
    fetchUserInfo: async () => {},
} as {
    /**
     * The user's information. This is set to defaultUser until the user's
     * information is fetched from the backend.
     */
    userInfo: FetchedUser;

    /**
     * Sets the user's information to the global state.
     * @param user the user's information to set
     */
    setUserInfo: (user: FetchedUser) => void;

    /**
     * Fetches the user's information from the backend and sets it to
     * the global state.
     */
    fetchUserInfo: () => Promise<void>;
});
