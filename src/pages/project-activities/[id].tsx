import Head from 'next/head';
import { Box, Container, Stack, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ProjectActivityForm } from '@/sections/project-activities/project-activity-form';
import { projectActivitiesServices } from '../../utils/project-activity-services';
import { projectSummaryServices } from '../../utils/project-summary-services'
import { ProjectActivity } from '@/sections/project-activities/project-activity-type';
import { ProjectSummary } from '@/sections/project-summaries/project-summary-type';

type PageProps = {
     activity: ProjectActivity;
     projectSummaries: ProjectSummary[];
};

const Page = ({ activity, projectSummaries }: PageProps) => (
     <Box>
          <Head>
               <title>Izmeni projektnu aktivnost</title>
          </Head>
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Izmeni projektnu aktivnost</Typography>
                         <ProjectActivityForm mode="edit" initialValues={activity} projectSummaries={projectSummaries} />
                    </Stack>
               </Container>
          </Box>
     </Box>
);

export async function getServerSideProps(context: any) {
     const { id } = context.params;

     const activity = await projectActivitiesServices().getProjectActivityById(id);

     if (!activity) {
          return { notFound: true };
     }

     const projectSummaries = await projectSummaryServices().getAllProjectSummaries();

     return {
          props: {
               activity: JSON.parse(JSON.stringify(activity)),
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
