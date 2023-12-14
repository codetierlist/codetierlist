import { darkTheme, lightTheme, Navbar } from '@/components';
import '@/styles/globals.css';
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
import { FetchedUser } from "codetierlist-types";
import { useEffect, useState } from "react";
import axios, { handleError } from "@/axios";
import { SnackbarContext } from '../contexts/SnackbarContext';

type EnhancedAppProps = AppProps & { renderer?: GriffelRenderer };

function MyApp({ Component, pageProps, renderer }: EnhancedAppProps) {
    /** snackbar */
    const toasterId = useId("toaster");
    const { dispatchToast } = useToastController(toasterId);

    const showSnack = (message?: string, action?: JSX.Element, content?: JSX.Element) => {
        if (message) {
            dispatchToast(
                <Toast>
                    <ToastTitle>{message}</ToastTitle>
                </Toast>,
                { intent: "info" });
        } else {
            dispatchToast(content, { intent: "info" });
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
        await axios("/")
            .then(({ data }) => {
                setUserInfo(data as FetchedUser);
            })
            .catch(handleError(showSnackSev));
    };

    useEffect(() => {
        void fetchUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // change system colour scheme based on current user theme
    useEffect(() => {
        if (userInfo.theme === "DARK") {
            document.documentElement.style.colorScheme = "dark";
        } else {
            document.documentElement.style.colorScheme = "light";
        }
    }, [userInfo.theme]);

    return (
        // 👇 Accepts a renderer from <Document /> or creates a default one
        //    Also triggers rehydration a client
        <RendererProvider renderer={renderer || createDOMRenderer()}>
            <SSRProvider>
                <UserContext.Provider
                    value={{ userInfo, setUserInfo, fetchUserInfo }}>
                    <FluentProvider theme={userInfo.theme === "DARK" ? darkTheme : lightTheme}>
                        <SnackbarContext.Provider
                            value={{ showSnack, showSnackSev }}
                        >
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
