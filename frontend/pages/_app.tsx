import axios, { handleError } from '@/axios';
import { Navbar } from '@/components';
import { SnackbarContext, UserContext, defaultUser, useSystemTheme, useTheme } from '@/hooks';
import '@/styles/globals.css';
import '@/styles/spacing.css';
import {
    Field,
    FluentProvider,
    GriffelRenderer,
    ProgressBar,
    RendererProvider,
    SSRProvider,
    Toast,
    ToastBody,
    ToastIntent,
    ToastTitle,
    Toaster,
    createDOMRenderer,
    useId,
    useToastController,
} from '@fluentui/react-components';
import { FetchedUser } from 'codetierlist-types';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import useLocalStorage from 'use-local-storage';

type EnhancedAppProps = AppProps & {
    renderer?: GriffelRenderer;
};

/**
 * Fetches user info
 */
const useUserInfo = (
    showSnackSev: (message?: string, severity?: ToastIntent) => void
) => {
    const [userInfo, setUserInfo] = useState<FetchedUser>(defaultUser);

    const fetchUserInfo = async () => {
        await axios('/users')
            .then(({ data }) => {
                setUserInfo(data as FetchedUser);
            })
            .catch((e) => {
                handleError(showSnackSev)(e);
            });
    };

    useEffect(() => {
        void fetchUserInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { userInfo, setUserInfo, fetchUserInfo };
};

function MyApp({ Component, pageProps, renderer }: EnhancedAppProps) {
    /** snackbar */
    const toasterId = useId('toaster');
    const { dispatchToast } = useToastController(toasterId);

    const showSnack = (message?: string, action?: JSX.Element, content?: JSX.Element) => {
        if (message) {
            dispatchToast(
                <Toast>
                    <ToastTitle>{message}</ToastTitle>
                </Toast>,
                { intent: 'info' }
            );
        } else {
            dispatchToast(content, { intent: 'info' });
        }
    };

    const showSnackSev = (message?: string, severity?: ToastIntent) =>
        dispatchToast(
            <Toast>
                <ToastTitle>{severity}</ToastTitle>
                <ToastBody>{message}</ToastBody>
            </Toast>,
            { intent: severity }
        );

    /** user info */
    const { userInfo, setUserInfo, fetchUserInfo } = useUserInfo(showSnackSev);

    /*
     * themes
     */
    const themes = useTheme(userInfo.accent_color || defaultUser.accent_color as string);

    const theme = useSystemTheme(userInfo.theme);

    // custom background image
    const [background, _] = useLocalStorage('background', undefined);

    // avoid hydration mismatch
    const [backgroundProps, setBackgroundProps] = useState<React.CSSProperties>({});

    useEffect(() => {
        setBackgroundProps({
            '--background': background,
        } as React.CSSProperties);
    }, [background]);

    return (
        // 👇 Accepts a renderer from <Document /> or creates a default one
        //    Also triggers rehydration a client
        <RendererProvider renderer={renderer || createDOMRenderer()}>
            <SSRProvider>
                <UserContext.Provider value={{ userInfo, setUserInfo, fetchUserInfo }}>
                    <FluentProvider theme={themes[theme]} style={backgroundProps}>
                        <SnackbarContext.Provider value={{ showSnack, showSnackSev }}>
                            <Field validationState="none" id="axios-loading-backdrop">
                                <ProgressBar />
                            </Field>
                            <Navbar />
                            <Component {...pageProps} />
                            <Toaster toasterId={toasterId} />
                        </SnackbarContext.Provider>
                    </FluentProvider>
                </UserContext.Provider>
            </SSRProvider>
        </RendererProvider>
    );
}

export default MyApp;
