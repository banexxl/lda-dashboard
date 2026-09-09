import Head from 'next/head';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography, TablePagination } from '@mui/material';
import { useRouter } from 'next/router';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ActivityTable } from '@/sections/activities/activity-table';
import { EntitySearch } from '@/components/entity-search';
import { ActivitiesServices } from '../../utils/activity-services'
import { useFilterableList } from 'src/hooks/use-filterable-list';
import { Activity } from '@/sections/activities/activity-type';

const searchableFields: (keyof Activity)[] = ['title', 'activityURL', 'author', 'status', 'category', 'locale'];

const Page = (props: { activities: Activity[] }) => {
     const router = useRouter();
     const {
          searchQuery, setSearchQuery, page, rowsPerPage,
          pagedItems, filteredItems, handlePageChange, handleRowsPerPageChange,
     } = useFilterableList(props.activities, searchableFields);

     return (
          <Box>
               <Head>
                    <title>Aktivnosti</title>
               </Head>
               <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                    <Container maxWidth="xl">
                         <Stack spacing={3}>
                              <Stack direction="row" justifyContent="space-between" spacing={4}>
                                   <Stack spacing={1}>
                                        <Typography variant="h4">Aktivnosti</Typography>
                                   </Stack>
                                   <Button
                                        startIcon={(<SvgIcon fontSize="small"><PlusIcon /></SvgIcon>)}
                                        variant="contained"
                                        onClick={() => router.push('/activities/new')}
                                   >
                                        Dodaj aktivnost
                                   </Button>
                              </Stack>
                              <EntitySearch
                                   value={searchQuery}
                                   onChange={setSearchQuery}
                                   placeholder="Search activity"
                              />
                              <ActivityTable items={pagedItems} />
                              <TablePagination
                                   component="div"
                                   count={filteredItems.length}
                                   onPageChange={handlePageChange}
                                   onRowsPerPageChange={handleRowsPerPageChange}
                                   page={page}
                                   rowsPerPage={rowsPerPage}
                                   rowsPerPageOptions={[5, 10, 25]}
                                   showFirstButton
                                   showLastButton
                                   labelRowsPerPage={'Broj po stranici'}
                              />
                         </Stack>
                    </Container>
               </Box>
          </Box>
     );
};

export async function getServerSideProps() {
     try {
          const activities = await ActivitiesServices().getAllActivities();

          return {
               props: {
                    activities: JSON.parse(JSON.stringify(activities)),
               },
          };
     } catch (error) {
          return {
               props: {
                    activities: [],
                    error: "Failed to fetch activities. Please try again later.",
               },
          };
     }
}

Page.getLayout = (page: any) => (
     <DashboardLayout>
          {page}
     </DashboardLayout>
);

export default Page;
