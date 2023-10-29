import { lightTheme } from '@/components';
import '@/styles/globals.css'
import {
  createDOMRenderer,
  FluentProvider,
  GriffelRenderer,
  SSRProvider,
  RendererProvider,
} from '@fluentui/react-components';
import type { AppProps } from 'next/app';
import { Navbar } from '@/components';
import { UserContext, defaultUser } from '@/contexts/UserContext';

type EnhancedAppProps = AppProps & { renderer?: GriffelRenderer };

function MyApp({ Component, pageProps, renderer }: EnhancedAppProps) {
  return (
    // 👇 Accepts a renderer from <Document /> or creates a default one
    //    Also triggers rehydration a client
    <RendererProvider renderer={renderer || createDOMRenderer()}>
      <SSRProvider>
        <UserContext.Provider value={{ userInfo: defaultUser, setUserInfo: () => {}, fetchUserInfo: async () => {} }}>
          <FluentProvider theme={lightTheme}>
            <Navbar />
            <Component {...pageProps} />
          </FluentProvider>
        </UserContext.Provider>
      </SSRProvider>
    </RendererProvider>
  );
}

export default MyApp;
