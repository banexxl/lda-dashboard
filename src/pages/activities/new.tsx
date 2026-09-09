import Head from 'next/head';
import { Box, Container, Stack, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ActivityForm } from '@/sections/activities/activity-form';

const Page = () => (
     <Box>
          <Head>
               <title>Dodaj aktivnost</title>
          </Head>
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Dodaj aktivnost</Typography>
                         <ActivityForm mode="create" />
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
