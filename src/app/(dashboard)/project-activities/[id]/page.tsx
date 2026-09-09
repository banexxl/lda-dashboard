import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Box, Container, Stack, Typography } from '@mui/material';
import { ProjectActivityForm } from '@/sections/project-activities/project-activity-form';
import { projectActivitiesServices } from '@/utils/project-activity-services';
import { projectSummaryServices } from '@/utils/project-summary-services';

export const metadata: Metadata = { title: 'Izmeni projektnu aktivnost' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
     const { id } = await params;
     const activity = await projectActivitiesServices().getProjectActivityById(id);

     if (!activity) {
          notFound();
     }

     const projectSummaries = await projectSummaryServices().getAllProjectSummaries();

     return (
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Izmeni projektnu aktivnost</Typography>
                         <ProjectActivityForm mode="edit" initialValues={activity} projectSummaries={Array.isArray(projectSummaries) ? projectSummaries : []} />
                    </Stack>
               </Container>
          </Box>
     );
}
