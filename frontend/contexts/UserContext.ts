/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';
import { type FetchedUser } from 'codetierlist-types';

/**
 * The user that is shown when the user's information is still loading.
 */
export const defaultUser: FetchedUser = {
    utorid: "mikuhats",
    email: "hatsune.miku@utoronto.ca",
    roles: [],
    admin: false,
};

/**
 * The context for the user's information.
 */
export const UserContext = createContext({
    /**
     * The user's information. This is set to defaultUser until the user's
     * information is fetched from the backend.
     */
    userInfo: defaultUser,
    /**
     * Sets the user's information to the global state.
     * @property user the user's information to set
     */
    setUserInfo: (user: FetchedUser) => {},
    /**
     * Fetches the user's information from the backend and sets it to
     * the global state.
     */
    fetchUserInfo: async () => {},
} as {
    userInfo: FetchedUser,
    setUserInfo: (user: FetchedUser) => void,
    fetchUserInfo: () => Promise<void>,
});
