import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Box, Container, Stack, Typography } from '@mui/material';
import { ActivityForm } from '@/sections/activities/activity-form';
import { ActivitiesServices } from '@/utils/activity-services';

export const metadata: Metadata = { title: 'Izmeni aktivnost' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
     const { id } = await params;
     const activity = await ActivitiesServices().getActivityById(id);

     if (!activity) {
          notFound();
     }

     return (
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Izmeni aktivnost</Typography>
                         <ActivityForm mode="edit" initialValues={activity} />
                    </Stack>
               </Container>
          </Box>
     );
}
