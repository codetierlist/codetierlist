import { useContext } from "react";
import { UserContext, SnackbarContext, defaultUser } from "@/hooks";
import axios, { handleError } from "@/axios";

export const useAccentColour = () => {
    const { userInfo, setUserInfo, fetchUserInfo } = useContext(UserContext);
    const { showSnackSev } = useContext(SnackbarContext);

    const updateAccent = () => {
        axios
            .post('/users/accent', { accent_color: userInfo.accent_color })
            .then(async () => {
                await fetchUserInfo();
                showSnackSev('Accent color updated', 'success');
            })
            .catch((err) => {
                handleError(showSnackSev)(err);
            });
    };

    const setAccent = (accent: string) => {
        setUserInfo({ ...userInfo, accent_color: accent });
    }

    return {
        /**
         * The accent color
         */
        accent: userInfo.accent_color || (defaultUser.accent_color as string),
        /**
         * Update the accent color in the API
         */
        updateAccent,
        /**
         * Set the accent color but do not push to API
         */
        setAccent,
    }
};
