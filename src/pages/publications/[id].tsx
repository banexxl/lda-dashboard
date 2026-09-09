import Head from 'next/head';
import { Box, Container, Stack, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { PublicationForm } from '@/sections/publications/publication-form';
import { PublicationsServices } from '../../utils/publication-services';
import { Publication } from '@/sections/publications/publication-type';

const Page = ({ publication }: { publication: Publication }) => (
     <Box>
          <Head>
               <title>Edit Publication</title>
          </Head>
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Edit Publication</Typography>
                         <PublicationForm mode="edit" initialValues={publication} />
                    </Stack>
               </Container>
          </Box>
     </Box>
);

export async function getServerSideProps(context: any) {
     const { id } = context.params;

     const publication = await PublicationsServices().getPublicationById(id);

     if (!publication) {
          return { notFound: true };
     }

     return {
          props: {
               publication: JSON.parse(JSON.stringify(publication)),
          },
     };
}

Page.getLayout = (page: any) => (
     <DashboardLayout>
          {page}
     </DashboardLayout>
);

export default Page;
