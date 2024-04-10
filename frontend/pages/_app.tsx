import { Navbar } from '@/components';
import { defaultAccentColor } from '@/components/utils/theme/theme';
import {
    SnackbarContext,
    UserContext,
    useSystemTheme,
    useTheme,
} from '@/hooks';
import { useUserInfo } from '@/hooks';
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
import { useEffect, useState } from 'react';
import useLocalStorage from 'use-local-storage';
import '@/styles/globals.css';
import '@/styles/spacing.css';

/**
 * A toast
 */
const ToastComponent = ({ message, severity, title, action }: {
    /** The message to display */
    message: string;
    /** The severity of the toast */
    severity?: ToastIntent;
    /** The title of the toast */
    title?: string;
    /** The action to display */
    action?: JSX.Element;
}) => {
    return (
        <Toast>
            {severity && (
                <ToastTitle action={action}>
                    {title || severity.charAt(0).toUpperCase() + severity.slice(1)}
                </ToastTitle>
            )}
            <ToastBody>{message}</ToastBody>
        </Toast>
    )
}

function App({ Component, pageProps, renderer }: AppProps & {
    renderer?: GriffelRenderer;
}) {
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
            <ToastComponent
                message={message || ''}
                severity={severity}
                title={title}
                action={action}
            />,
            {
                intent: severity,
                pauseOnWindowBlur: true,
                pauseOnHover: true,
                timeout: 6000,
            }
        );
    };

    /** user info */
    console.log(useUserInfo);
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
