import axios, { handleError } from '@/axios';
import { Navbar } from '@/components';
import { defaultAccentColor } from '@/components/utils/theme/theme';
import {
    defaultUser,
    ShowSnackType,
    SnackbarContext,
    UserContext,
    useSystemTheme,
    useTheme,
} from '@/hooks';
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
const useUserInfo = (showSnack: ShowSnackType) => {
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

const App = ({ Component, pageProps, renderer }: EnhancedAppProps) => {
    /** snackbar */
    const toasterId = useId('toaster');
    const { dispatchToast } = useToastController(toasterId);

    const showSnack = (
        message?: string,
        severity?: ToastIntent,
        title?: string,
        action?: JSX.Element
    ) => {
        dispatchToast(
            <Toast>
                {severity && (
                    <ToastTitle action={action}>
                        {title || severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </ToastTitle>
                )}
                <ToastBody>{message}</ToastBody>
            </Toast>,
            {
                intent: severity,
                pauseOnWindowBlur: true,
                pauseOnHover: true,
                timeout: 6000,
            }
        );
    };

    /** user info */
    const { userInfo, setUserInfo, fetchUserInfo } = useUserInfo(showSnack);

    /*
     * themes
     */
    const themes = useTheme(userInfo.accent_color || defaultAccentColor);

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
                        <SnackbarContext.Provider value={{ showSnack, toasterId }}>
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

export default App;
