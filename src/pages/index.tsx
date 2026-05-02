import Head from 'next/head';
import Image from 'next/image';
import { Box, Container, Stack, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';

const Page = () => (
     <>
          <Head>
               <title>
                    Overview
               </title>
          </Head>
          <Box
               component="main"
               sx={{
                    flexGrow: 1,
                    py: 8
               }}
          >
               <Container maxWidth="md">
                    <Stack spacing={3} alignItems="center" textAlign="center">
                         <Image
                              src="https://lda-su.s3.eu-central-1.amazonaws.com/logoAca/viber_slika_2024-01-25_20-26-42-218.png"
                              alt="LDA Dashboard logo"
                              width={220}
                              height={160}
                              priority
                              sizes="(max-width: 600px) 160px, 220px"
                              style={{ width: 'min(60vw, 220px)', height: 'auto' }}
                         />
                         <Typography component="h1" sx={{ typography: { xs: 'h5', md: 'h4' } }}>
                              Welcome to the LDA Dashboard
                         </Typography>
                         <Typography variant="body1" color="text.secondary">
                              Use the navigation to manage activities, publications, projects, and questions.
                         </Typography>
                    </Stack>
               </Container>
          </Box>
     </>
);

Page.getLayout = (page: any) => (
     <DashboardLayout>
          {page}
     </DashboardLayout>
);

export default Page;
