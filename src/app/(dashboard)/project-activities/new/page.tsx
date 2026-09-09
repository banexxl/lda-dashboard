import type { Metadata } from 'next';
import { Box, Container, Stack, Typography } from '@mui/material';
import { ProjectActivityForm } from '@/sections/project-activities/project-activity-form';
import { projectSummaryServices } from '@/utils/project-summary-services';

export const metadata: Metadata = { title: 'Dodaj projektnu aktivnost' };

export default async function Page() {
     const projectSummaries = await projectSummaryServices().getAllProjectSummaries();

     return (
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Dodaj projektnu aktivnost</Typography>
                         <ProjectActivityForm mode="create" projectSummaries={Array.isArray(projectSummaries) ? projectSummaries : []} />
                    </Stack>
               </Container>
          </Box>
     );
}
