import type { Metadata } from 'next';
import { Box, Container, Stack, Typography } from '@mui/material';
import { ActivityForm } from '@/sections/activities/activity-form';

export const metadata: Metadata = { title: 'Dodaj aktivnost' };

export default function Page() {
     return (
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Dodaj aktivnost</Typography>
                         <ActivityForm mode="create" />
                    </Stack>
               </Container>
          </Box>
     );
}
