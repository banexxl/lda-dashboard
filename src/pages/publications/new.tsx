import Head from 'next/head';
import { Box, Container, Stack, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { PublicationForm } from '@/sections/publications/publication-form';

const Page = () => (
     <Box>
          <Head>
               <title>Add Publication</title>
          </Head>
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Add Publication</Typography>
                         <PublicationForm mode="create" />
                    </Stack>
               </Container>
          </Box>
     </Box>
);

Page.getLayout = (page: any) => (
     <DashboardLayout>
          {page}
     </DashboardLayout>
);

export default Page;
