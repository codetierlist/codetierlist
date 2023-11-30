import { lightTheme, Navbar } from '@/components';
import '@/styles/globals.css';
import {
    createDOMRenderer,
    FluentProvider,
    GriffelRenderer,
    SSRProvider,
    RendererProvider,
    ProgressBar,
    Field,
} from '@fluentui/react-components';
import type { AppProps } from 'next/app';
import { defaultUser, UserContext } from '@/contexts/UserContext';
import { FetchedUser } from "codetierlist-types";
import { useEffect, useState } from "react";
import axios from "@/axios";

type EnhancedAppProps = AppProps & { renderer?: GriffelRenderer };

function MyApp({ Component, pageProps, renderer }: EnhancedAppProps) {
    /*
     * user data initialization into context and fetching
     */
    const [userInfo, setUserInfo] = useState<FetchedUser>(defaultUser);

    const fetchUserInfo = async () => {
        await axios("/")
            .then(({ data }) => {
                setUserInfo(data as FetchedUser);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    useEffect(() => {
        void fetchUserInfo();
    }, []);

    return (
        // 👇 Accepts a renderer from <Document /> or creates a default one
        //    Also triggers rehydration a client
        <RendererProvider renderer={renderer || createDOMRenderer()}>
            <SSRProvider>
                <UserContext.Provider
                    value={{ userInfo, setUserInfo, fetchUserInfo }}>
                    <FluentProvider theme={lightTheme}>
                        <Field validationState="none" id="axios-loading-backdrop">
                            <ProgressBar />
                        </Field>
                        <Navbar />
                        <Component {...pageProps} />
                    </FluentProvider>
                </UserContext.Provider>
            </SSRProvider>
        </RendererProvider>
    );
}

export default MyApp;
