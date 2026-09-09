import Head from 'next/head';
import { Box, Container, Stack, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ProjectSummaryForm } from '@/sections/project-summaries/project-summary-form';

const Page = () => (
     <Box>
          <Head>
               <title>Dodaj projekat</title>
          </Head>
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Dodaj projekat</Typography>
                         <ProjectSummaryForm mode="create" />
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
