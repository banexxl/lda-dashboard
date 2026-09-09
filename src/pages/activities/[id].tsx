import Head from 'next/head';
import { Box, Container, Stack, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ActivityForm } from '@/sections/activities/activity-form';
import { ActivitiesServices } from '../../utils/activity-services';
import { Activity } from '@/sections/activities/activity-type';

const Page = ({ activity }: { activity: Activity }) => (
     <Box>
          <Head>
               <title>Izmeni aktivnost</title>
          </Head>
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Izmeni aktivnost</Typography>
                         <ActivityForm mode="edit" initialValues={activity} />
                    </Stack>
               </Container>
          </Box>
     </Box>
);

export async function getServerSideProps(context: any) {
     const { id } = context.params;

     const activity = await ActivitiesServices().getActivityById(id);

     if (!activity) {
          return { notFound: true };
     }

     return {
          props: {
               activity: JSON.parse(JSON.stringify(activity)),
          },
     };
}

Page.getLayout = (page: any) => (
     <DashboardLayout>
          {page}
     </DashboardLayout>
);

export default Page;
