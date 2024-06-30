import Head from 'next/head';
import { CacheProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { SessionProvider, useSession } from "next-auth/react"
import { useNProgress } from 'src/hooks/use-nprogress';
import { createTheme } from 'src/theme';
import { createEmotionCache } from 'src/utils/create-emotion-cache';
import 'simplebar-react/dist/simplebar.min.css';
import { AutoLogoutProvider } from '@/utils/auto-logout';
import { useEffect } from 'react';
import moment from 'moment';

const clientSideEmotionCache = createEmotionCache();

const SplashScreen = () => null;

const App = (props: any) => {
     const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

     useNProgress();

     const getLayout = Component.getLayout ?? ((page: any) => page);

     const theme = createTheme();

     return (
          // <AutoLogoutProvider timeoutMs={600000}>
          <CacheProvider value={emotionCache}>
               <Head>
                    <title>
                         LDA Subotica
                    </title>
                    <meta
                         name="viewport"
                         content="initial-scale=1, width=device-width"
                    />
               </Head>
               <SessionProvider>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                         <ThemeProvider theme={theme}>
                              <CssBaseline />

                              {getLayout(<Component {...pageProps} />)}

                         </ThemeProvider>
                    </LocalizationProvider>
               </SessionProvider>
          </CacheProvider>
          // </AutoLogoutProvider>
     );
};

export default App;
