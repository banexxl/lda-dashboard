
import Head from 'next/head';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import {
     Alert,
     Box,
     Button,
     Card,
     Stack,
     Typography
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import Image from 'next/image';

const errorMessages: Record<string, string> = {
     OAuthAccountNotLinked: 'This email is linked to a different sign-in method.',
     AccessDenied: 'Access denied. Please contact your administrator.',
     Configuration: 'There is a configuration issue. Please try again later.',
     Verification: 'The verification link is invalid or has expired.',
     Default: 'Unable to sign you in. Please try again.'
};

const Page = () => {
     const router = useRouter();
     const { error, callbackUrl } = router.query as { error?: string; callbackUrl?: string };
     const [loading, setLoading] = useState(false);

     const errorText = useMemo(() => {
          if (!error) return undefined;
          return errorMessages[error] ?? errorMessages.Default;
     }, [error]);

     const onGoogleSignIn = async () => {
          try {
               setLoading(true);
               await signIn('google', { callbackUrl: callbackUrl || '/' });
          } finally {
               // NextAuth will navigate on success; keep responsive feedback regardless.
               setLoading(false);
          }
     };

     return (
          <Box component="main" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
               <Head>
                    <title>Login</title>
                    <meta name="description" content="Sign in to access your LDA Dashboard." />
               </Head>

               <Card
                    sx={{
                         backgroundColor: 'background.paper',
                         flex: '1 1 auto',
                         alignItems: 'center',
                         display: 'flex',
                         justifyContent: 'center',
                         p: { xs: 2, sm: 3, md: 4 },
                         borderRadius: { xs: 0, sm: 2 }
                    }}
               >
                    <Box
                         sx={{
                              width: '100%',
                              maxWidth: { xs: 360, sm: 440, md: 520 },
                              px: { xs: 2, sm: 4, md: 6 },
                              py: { xs: 4, sm: 6, md: 8 }
                         }}
                    >
                         <Stack spacing={{ xs: 2.5, md: 3 }} alignItems="center">
                              <Image
                                   src={`https://lda-su.s3.eu-central-1.amazonaws.com/logoAca/viber_slika_2024-01-25_20-26-42-218.png`}
                                   alt="LDA Dashboard logo"
                                   width={220}
                                   height={160}
                                   priority
                                   sizes="(max-width: 600px) 160px, 220px"
                                   style={{ width: 'min(60vw, 220px)', height: 'auto' }}
                              />

                              <Stack spacing={0.5} alignItems="center">
                                   <Typography component="h1" sx={{ typography: { xs: 'h5', md: 'h4' } }}>
                                        Welcome back
                                   </Typography>
                                   <Typography variant="body2" color="text.secondary" align="center">
                                        Sign in with your organization Google account to continue.
                                   </Typography>
                              </Stack>

                              {errorText && (
                                   <Alert severity="error" sx={{ width: '100%' }} role="alert">
                                        {errorText}
                                   </Alert>
                              )}

                              <Button
                                   onClick={onGoogleSignIn}
                                   disabled={loading}
                                   variant="contained"
                                   startIcon={<GoogleIcon />}
                                   fullWidth
                                   size="large"
                                   aria-label="Sign in with Google"
                              >
                                   Sign in with Google
                              </Button>

                              <Typography variant="caption" color="text.secondary" align="center" sx={{ px: 1 }}>
                                   By continuing, you agree to our acceptable use and data policies.
                              </Typography>
                         </Stack>
                    </Box>
               </Card>
          </Box>
     );
};

Page.getLayout = (page: any) => (
     <AuthLayout>
          {page}
     </AuthLayout>
);

export default Page;
