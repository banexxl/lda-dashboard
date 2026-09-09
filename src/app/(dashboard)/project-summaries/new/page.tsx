import type { Metadata } from 'next';
import { Box, Container, Stack, Typography } from '@mui/material';
import { ProjectSummaryForm } from '@/sections/project-summaries/project-summary-form';

export const metadata: Metadata = { title: 'Dodaj projekat' };

export default function Page() {
     return (
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Dodaj projekat</Typography>
                         <ProjectSummaryForm mode="create" />
                    </Stack>
               </Container>
          </Box>
     );
}
