import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Box, Container, Stack, Typography } from '@mui/material';
import { ProjectSummaryForm } from '@/sections/project-summaries/project-summary-form';
import { projectSummaryServices } from '@/utils/project-summary-services';

export const metadata: Metadata = { title: 'Izmeni projekat' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
     const { id } = await params;
     const project = await projectSummaryServices().getProjectSummaryById(id);

     if (!project) {
          notFound();
     }

     return (
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Izmeni projekat</Typography>
                         <ProjectSummaryForm mode="edit" initialValues={project} />
                    </Stack>
               </Container>
          </Box>
     );
}
