import { ToastIntent } from '@fluentui/react-components';
import axios, { AxiosError } from 'axios';

declare module 'axios' {
    export interface AxiosRequestConfig {
        skipErrorHandling?: boolean;
    }
}

export const handleError =
    (
        showSnackSev?: (message?: string, severity?: ToastIntent) => void,
        message?: string
    ) =>
    (error: AxiosError) => {
        if (!error.isAxiosError) {
            throw error;
        }
        let res: string;
        if (message) {
            res = message;
        } else if (error.response) {
            if ((error.response.data as { message: string } | undefined)?.message) {
                res = (error.response.data as { message: string })?.message;
            } else {
                res = error.message;
            }
        } else {
            res = 'Server was unresponsive, please try again later';
        }
        if (showSnackSev) {
            showSnackSev(res, 'error');
        } else {
            console.error(res);
        }
    };

/**
 * Axios instance
 */
const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
});

let loading = 0;
instance.interceptors.request.use((config) => {
    if ('skipLoadingWheel' in config && config.skipLoadingWheel === true) {
        return config;
    }
    const loadingWheel = document.getElementById('axios-loading-backdrop');
    if (!loadingWheel) {
        return config;
    }
    loadingWheel.style.display = 'flex';
    loading += 1;
    return config;
});

instance.interceptors.response.use(
    (response) => {
        const loadingWheel = document.getElementById('axios-loading-backdrop');
        if (!loadingWheel) {
            return response;
        }
        if (
            'skipLoadingWheel' in response.config &&
            response.config.skipLoadingWheel === true
        ) {
            return response;
        }
        loading -= 1;
        setTimeout(() => {
            if (loading === 0) {
                loadingWheel.style.display = 'none';
            }
        }, 500);
        return response;
    },
    (error) => {
        loading -= 1;
        const loadingWheel = document.getElementById('axios-loading-backdrop');
        if (!loadingWheel) {
            return;
        }
        setTimeout(() => {
            if (loading === 0) {
                loadingWheel.style.display = 'none';
            }
        }, 500);
        return Promise.reject(error);
    }
);

export default instance;
