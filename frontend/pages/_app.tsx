import {lightTheme, Navbar} from '@/components';
import '@/styles/globals.css';
import '@/styles/bootstrap-grid.css';
import {
    createDOMRenderer,
    FluentProvider,
    GriffelRenderer,
    SSRProvider,
    RendererProvider,
} from '@fluentui/react-components';
import type {AppProps} from 'next/app';
import {defaultUser, UserContext} from '@/contexts/UserContext';
import {FetchedUser} from "codetierlist-types";
import {useEffect, useState} from "react";
import axios from "@/axios";

type EnhancedAppProps = AppProps & { renderer?: GriffelRenderer };

function MyApp({Component, pageProps, renderer}: EnhancedAppProps) {
    /*
     * user data initialization into context and fetching
     */
    const [userInfo, setUserInfo] = useState<FetchedUser>(defaultUser);

    const fetchUserInfo = async () => {
        await axios.get<FetchedUser>("/")
            .then(({ data }) => {
                // check if data has certain properties
                if (!data.utorid || !data.email || !data.admin) {
                    throw new Error("Invalid user data");
                }

                setUserInfo(data);
            })
            .catch((err) => {
                console.error(err);
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
                    value={{userInfo, setUserInfo, fetchUserInfo}}>
                    <FluentProvider theme={lightTheme}>
                        <Navbar/>
                        <Component {...pageProps} />
                    </FluentProvider>
                </UserContext.Provider>
            </SSRProvider>
        </RendererProvider>
    );
}

export default MyApp;
