import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Box, Container, Stack, Typography } from '@mui/material';
import { PublicationForm } from '@/sections/publications/publication-form';
import { PublicationsServices } from '@/utils/publication-services';

export const metadata: Metadata = { title: 'Edit Publication' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
     const { id } = await params;
     const publication = await PublicationsServices().getPublicationById(id);

     if (!publication) {
          notFound();
     }

     return (
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Edit Publication</Typography>
                         <PublicationForm mode="edit" initialValues={publication} />
                    </Stack>
               </Container>
          </Box>
     );
}
