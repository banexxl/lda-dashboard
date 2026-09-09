import Head from 'next/head';
import { Box, Container, Stack, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ProjectActivityForm } from '@/sections/project-activities/project-activity-form';
import { projectSummaryServices } from '../../utils/project-summary-services'
import { ProjectSummary } from '@/sections/project-summaries/project-summary-type';

const Page = ({ projectSummaries }: { projectSummaries: ProjectSummary[] }) => (
     <Box>
          <Head>
               <title>Dodaj projektnu aktivnost</title>
          </Head>
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Dodaj projektnu aktivnost</Typography>
                         <ProjectActivityForm mode="create" projectSummaries={projectSummaries} />
                    </Stack>
               </Container>
          </Box>
     </Box>
);

export async function getServerSideProps() {
     const projectSummaries = await projectSummaryServices().getAllProjectSummaries();

     return {
          props: {
               projectSummaries: JSON.parse(JSON.stringify(projectSummaries)),
          },
     };
}

Page.getLayout = (page: any) => (
     <DashboardLayout>
          {page}
     </DashboardLayout>
);

export default Page;
