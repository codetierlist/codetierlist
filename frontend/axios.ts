import axios from "axios";

declare module "axios" {
    export interface AxiosRequestConfig {
        skipErrorHandling?: boolean;
    }
}
/**
 * Axios instance
 */
export const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URI || "/api"
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
        if ('skipLoadingWheel' in response.config && response.config.skipLoadingWheel === true) {
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
        console.log(error);
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
        handleError(error.message);
        return Promise.reject(error);
    },
);
const handleError = (message: string) => {
    // TODO: show error message
    console.error(message);
    console.error(message);
    console.error(message);
    console.error(message);
    console.error(message);
    console.error(message);
    console.error(message);
    console.error(message);
    console.error(message);
    console.error(message);
    console.error(message);
};
axios.interceptors.response.use((response) => {
    return response;
}, error => {
    if (error.response) {
        if (error.response.config.skipErrorHandling) {
            return Promise.reject(error);
        }
        handleError(error.response.data.message);
    }
    handleError("Server was unresponsive, please try again later");
});

export default instance;
