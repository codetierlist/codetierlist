import { defaultAccentColor, getThemes, Navbar } from '@/components';
import '@/styles/globals.css';
import '@/styles/spacing.css';
import {
    createDOMRenderer,
    Field,
    FluentProvider,
    GriffelRenderer,
    ProgressBar,
    RendererProvider,
    SSRProvider,
    Toast,
    ToastBody,
    Toaster,
    ToastIntent,
    ToastTitle,
    useId,
    useToastController,
} from '@fluentui/react-components';
import type { AppProps } from 'next/app';
import { defaultUser, UserContext } from '@/contexts/UserContext';
import { FetchedUser, Theme } from 'codetierlist-types';
import { useEffect, useState } from 'react';
import axios, { handleError } from '@/axios';
import { SnackbarContext } from '@/contexts/SnackbarContext';
import useLocalStorage from 'use-local-storage';

type EnhancedAppProps = AppProps & { renderer?: GriffelRenderer };

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

    /* user data initialization into context and fetching */
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
    const computeTheme = (newTheme: Theme) => {
        if (newTheme === 'SYSTEM') {
            return window.matchMedia &&
                window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'DARK'
                : 'LIGHT';
        }
        return newTheme;
    };
    const [theme, setTheme] = useState(computeTheme(userInfo.theme));

    useEffect(() => {
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => {
                if (userInfo.theme === 'SYSTEM') {
                    setTheme(e.matches ? 'DARK' : 'LIGHT');
                } else {
                    setTheme(computeTheme(userInfo.theme));
                }
            });
    }, [userInfo.theme]);

    useEffect(() => {
        setTheme(computeTheme(userInfo.theme));
    }, [userInfo.theme]);
    // change system colour scheme based on current user theme
    useEffect(() => {
        if (theme === 'DARK') {
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.style.colorScheme = 'light';
        }
    }, [userInfo.theme]);

    // custom background image
    const [background, _] = useLocalStorage('background', undefined);

    // avoid hydration mismatch
    const [backgroundProps, setBackgroundProps] = useState<React.CSSProperties>({});

    useEffect(() => {
        setBackgroundProps({
            '--background': background,
        } as React.CSSProperties);
    }, [background]);

    const [themes, setThemes] = useState(
        getThemes(userInfo.accent_color || defaultAccentColor)
    );

    useEffect(() => {
        setThemes(getThemes(userInfo.accent_color || defaultAccentColor));
    }, [userInfo]);

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
