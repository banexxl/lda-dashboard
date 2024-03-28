import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import { Box, Container, Unstable_Grid2 as Grid } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';

const now = new Date();

const Page = () => (
     <>
          <Head>
               <title>
                    Overview
               </title>
          </Head>
          <Box
               component="main"
               sx={{
                    flexGrow: 1,
                    py: 8
               }}
          >
          </Box>
     </>
);

Page.getLayout = (page: any) => (
     <DashboardLayout>
          {page}
     </DashboardLayout>
);

export default Page;
