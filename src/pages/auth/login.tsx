
import Head from 'next/head';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';

import { signIn } from 'next-auth/react';
import { Avatar, Box, Button, Card, Stack, Typography } from '@mui/material';
import Image from 'next/image';

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
                              width: '80%',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center'
                         }}
                    >


                         <Image
                              src={`https://lda-su.s3.eu-central-1.amazonaws.com/logoAca/viber_slika_2024-01-25_20-26-42-218.png`}
                              alt="Viber"
                              width={350}
                              height={250}
                         />

                         <Button
                              variant="contained"
                              onClick={() => signIn('google')}
                         >
                              Login
                         </Button>

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
