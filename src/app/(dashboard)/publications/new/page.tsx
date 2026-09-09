import type { Metadata } from 'next';
import { Box, Container, Stack, Typography } from '@mui/material';
import { PublicationForm } from '@/sections/publications/publication-form';

export const metadata: Metadata = { title: 'Add Publication' };

export default function Page() {
     return (
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Add Publication</Typography>
                         <PublicationForm mode="create" />
                    </Stack>
               </Container>
          </Box>
     );
}
