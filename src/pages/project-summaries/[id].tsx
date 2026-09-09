import Head from 'next/head';
import { Box, Container, Stack, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ProjectSummaryForm } from '@/sections/project-summaries/project-summary-form';
import { projectSummaryServices } from '../../utils/project-summary-services';
import { ProjectSummary } from '@/sections/project-summaries/project-summary-type';

const Page = ({ project }: { project: ProjectSummary }) => (
     <Box>
          <Head>
               <title>Izmeni projekat</title>
          </Head>
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Izmeni projekat</Typography>
                         <ProjectSummaryForm mode="edit" initialValues={project} />
                    </Stack>
               </Container>
          </Box>
     </Box>
);

export async function getServerSideProps(context: any) {
     const { id } = context.params;

     const project = await projectSummaryServices().getProjectSummaryById(id);

     if (!project) {
          return { notFound: true };
     }

     return {
          props: {
               project: JSON.parse(JSON.stringify(project)),
          },
     };
}

Page.getLayout = (page: any) => (
     <DashboardLayout>
          {page}
     </DashboardLayout>
);

export default Page;
