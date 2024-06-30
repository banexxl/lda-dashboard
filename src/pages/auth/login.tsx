import { useCallback, useState } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, Box, Button, FormHelperText, Link, Stack, Tab, Tabs, TextField, Typography, Card, CardMedia, useMediaQuery, createTheme } from '@mui/material';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import Swal from 'sweetalert2';
import moment from 'moment';
import { signIn } from 'next-auth/react';

const Page = () => {
     const router = useRouter();

     const [method, setMethod] = useState('email');
     const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
     const formik = useFormik({
          initialValues: {
               email: '',
               password: '',
               submit: null
          },
          validationSchema: Yup.object({
               email: Yup
                    .string()
                    .email('Must be a valid email')
                    .max(255)
                    .required('Email is required'),
               password: Yup
                    .string()
                    .max(255)
                    .required('Password is required')
          }),
          onSubmit: async (values: any, helpers: any) => {
               try {
                    const response = await fetch(`/api/auth/login`, {
                         method: 'POST',
                         headers: {
                              'Content-Type': 'application/json'
                         },
                         body: JSON.stringify(values)
                    });

                    if (response.ok) {
                         Swal.fire({
                              icon: 'success',
                              title: 'Success',
                              text: 'Login successful!',
                         });
                         window.sessionStorage.setItem('authenticated', 'true');
                         window.sessionStorage.setItem('sessionExpires', moment().add(2, 'hour').add(1, 'minute').toISOString())
                         localStorage.setItem('lastActivity', moment().format('YYYY-MM-DD HH:mm:ss'));
                         localStorage.setItem('email', values.email);
                         router.push('/');
                    } else {
                         Swal.fire({
                              icon: 'error',
                              title: 'Oops...',
                              text: 'Something went wrong! Error: ',
                         });
                    }
               } catch (err: any) {
                    helpers.setStatus({ success: false });
                    helpers.setErrors({ submit: err.message });
                    helpers.setSubmitting(false);
               }
          }
     });

     // const handleMethodChange = useCallback(
     //           (event, value) => {
     //                     setMethod(value);
     //           },
     //           []
     // );

     // const handleSkip = useCallback(
     //           () => {
     //                     auth.skip();
     //                     router.push('/');
     //           },
     //           [auth, router]
     // );

     return (
          <Box sx={{ display: 'flex', flexDirection: 'column', ml: mdDown ? '10px' : '200px', mt: '120px', width: mdDown ? '90dvw' : '70dvw', height: '70dvh' }}>
               <Head>
                    <title>
                         Login
                    </title>
               </Head>
               <Card sx={{ backgroundColor: 'background.paper', flex: '1 1 auto', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
                    <Box
                         sx={{
                              maxWidth: 550,
                              px: 3,
                              py: '100px',
                              width: '100%'
                         }}
                    >
                         <div>
                              <Stack
                                   spacing={1}
                                   sx={{ mb: 3 }}
                              >
                                   <Typography variant="h4">
                                        Login
                                   </Typography>
                                   {/* <Typography
                                        color="text.secondary"
                                        variant="body2"
                                   >
                                        Don&apos;t have an account?
                                        &nbsp;
                                        <Link
                                             component={NextLink}
                                             href="/auth/register"
                                             underline="hover"
                                             variant="subtitle2"
                                        >
                                             Register
                                        </Link>
                                   </Typography> */}
                              </Stack>
                              <Tabs
                                   // onChange={handleMethodChange}
                                   sx={{ mb: 3 }}
                                   value={method}
                              >
                                   <Tab
                                        label="Google"
                                        value="Google"
                                        onClick={() => signIn('google')}
                                   />
                              </Tabs>

                         </div>
                    </Box>
               </Card >
          </Box >
     );
};

Page.getLayout = (page: any) => (
     <AuthLayout>
          {page}
     </AuthLayout>
);

export default Page;
