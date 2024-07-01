
import Head from 'next/head';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';

import { signIn } from 'next-auth/react';
import { Box, Button, Card, Stack, Typography } from '@mui/material';

const Page = () => {


     return (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '70dvh' }}>
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
                              </Stack>
                              <Button
                                   variant="contained"
                                   onClick={() => signIn('google')}
                              >
                                   Login
                              </Button>
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
