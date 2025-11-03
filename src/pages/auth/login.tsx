
import Head from 'next/head';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import {
     Alert,
     Box,
     Card,
     Stack,
     Typography
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
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
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '70dvh' }}>
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
                         p: { xs: 2, md: 4 }
                    }}
               >
                    <Box
                         sx={{
                              maxWidth: 520,
                              width: '100%',
                              px: { xs: 2, md: 4 },
                              py: { xs: 4, md: 8 }
                         }}
                    >
                         <Stack spacing={3} alignItems="center">
                              <Image
                                   src={`https://lda-su.s3.eu-central-1.amazonaws.com/logoAca/viber_slika_2024-01-25_20-26-42-218.png`}
                                   alt="LDA Dashboard logo"
                                   width={220}
                                   height={160}
                                   priority
                              />

                              <Stack spacing={0.5} alignItems="center">
                                   <Typography variant="h4" component="h1">
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

                              <LoadingButton
                                   onClick={onGoogleSignIn}
                                   variant="contained"
                                   loading={loading}
                                   loadingPosition="start"
                                   startIcon={<GoogleIcon />}
                                   fullWidth
                                   size="large"
                                   aria-label="Sign in with Google"
                              >
                                   Sign in with Google
                              </LoadingButton>

                              <Typography variant="caption" color="text.secondary" align="center">
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
