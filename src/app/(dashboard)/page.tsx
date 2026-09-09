import type { Metadata } from 'next';
import Image from 'next/image';
import { Box, Container, Stack, Typography } from '@mui/material';

export const metadata: Metadata = { title: 'Overview' };

export default function Page() {
     return (
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3} alignItems="center" textAlign="center">
                         <Image
                              src="https://lda-su.s3.eu-central-1.amazonaws.com/logoAca/viber_slika_2024-01-25_20-26-42-218.png"
                              alt="LDA Dashboard logo"
                              width={220}
                              height={160}
                              priority
                              sizes="(max-width: 600px) 160px, 220px"
                              style={{ maxWidth: '100%', height: 'auto' }}
                         />
                         <Typography component="h1" sx={{ typography: { xs: 'h5', md: 'h4' } }}>
                              Welcome to the LDA Dashboard
                         </Typography>
                         <Typography variant="body1" color="text.secondary">
                              Use the navigation to manage activities, publications, projects, and questions.
                         </Typography>
                    </Stack>
               </Container>
          </Box>
     );
}
