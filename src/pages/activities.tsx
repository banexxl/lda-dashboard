import { useMemo, useState } from 'react';
import Head from 'next/head';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ActivityTable } from '@/sections/activities/activity-table';
import { ActivitySearch } from '@/sections/activities/activity-search'
import { ActivitiesServices } from '../utils/activity-services'
import { AddActivityForm } from '../sections/activities/activity-form'
import { TablePagination } from '@mui/material'
import { SessionProvider } from 'next-auth/react';


const Page = (props: any) => {

     const ActivityIds = useMemo(() => {
          if (!Array.isArray(props.activities)) {
               return [];
          }
          return props.activities.map((activity: any) => activity._id);
     }, [props.activities]);

     const [open, setOpen] = useState(false)
     const ActivitySelection = useSelection(ActivityIds);
     const [searchQuery, setSearchQuery] = useState('')
     const [page, setPage] = useState(0)
     const [rowsPerPage, setRowsPerPage] = useState(5)

     const filteredActivities = useMemo(() => {
          const query = searchQuery.trim().toLowerCase()
          if (!query) return props.activities
          return (props.activities || []).filter((activity: any) => {
               const fieldsToSearch = [
                    activity?.title,
                    activity?.activityURL,
                    activity?.author,
                    activity?.status,
                    activity?.category,
                    activity?.locale
               ]
               return fieldsToSearch
                    .filter((value) => typeof value === 'string')
                    .some((value) => value.toLowerCase().includes(query))
          })
     }, [props.activities, searchQuery])

     const pagedActivities = useMemo(() => {
          const startIndex = page * rowsPerPage
          return filteredActivities.slice(startIndex, startIndex + rowsPerPage)
     }, [filteredActivities, page, rowsPerPage])
     const handleSubmitSuccess = () => {
          setOpen(false); // Close the dialog
     };

     const handleSubmitFail = () => {
          setOpen(false)
     }

     const handleRowsPerPageChange = (event: any) => {
          const newRowsPerPage = parseInt(event.target.value, 10) || 5
          setRowsPerPage(newRowsPerPage)
          setPage(0)
     }

     const handlePageChange = (event: any, newPage: any) => {
          setPage(newPage)
     }

     return (
          <SessionProvider>
               <Box>
                    <Head>
                         <title>
                              Aktivnosti
                         </title>
                    </Head>
                    <Box
                         component="main"
                         sx={{
                              flexGrow: 1,
                              py: 8
                         }}
                    >
                         <Container maxWidth="xl">
                              <Stack spacing={3}>
                                   <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        spacing={4}
                                   >
                                        <Stack spacing={1}>
                                             <Typography variant="h4">
                                                  Aktivnosti
                                             </Typography>
                                        </Stack>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', height: '40px', width: '40%', gap: '10px' }}>
                                             <Button
                                                  sx={{ padding: '10px', height: '50px' }}
                                                  startIcon={(
                                                       <SvgIcon fontSize="small">
                                                            <PlusIcon />
                                                       </SvgIcon>
                                                  )}
                                                  variant="contained"
                                                  onClick={() => {
                                                       setOpen(true)
                                                  }}
                                             >
                                                  <Typography>
                                                       Dodaj aktivnost
                                                  </Typography>
                                             </Button>

                                        </Box>
                                   </Stack>
                                   <ActivitySearch
                                        value={searchQuery}
                                        onChange={setSearchQuery}
                                   />
                                   <ActivityTable
                                        count={pagedActivities.length || 0}
                                        items={pagedActivities}
                                        page={page + 1}
                                        rowsPerPage={rowsPerPage}
                                        selected={ActivitySelection.selected}
                                        activityCount={props.activitiesCount}
                                   />
                                   <TablePagination
                                        component="div"
                                        count={filteredActivities.length}
                                        onPageChange={handlePageChange}
                                        onRowsPerPageChange={handleRowsPerPageChange}
                                        page={page}
                                        rowsPerPage={rowsPerPage}
                                        rowsPerPageOptions={[5, 10, 25]}
                                        showFirstButton
                                        showLastButton
                                        labelRowsPerPage={'Broj po stranici'}
                                   //labelDisplayedRows={({ from, to, count }) => { return `${ from }–${ to } od ${ count !== -1 ? count : `više od ${ to }` }`; }}
                                   />
                              </Stack>
                         </Container>
                    </Box>
                    <Dialog open={open}
                         PaperProps={{
                              sx: {
                                   width: '600px'
                              }
                         }}
                    >
                         <DialogTitle>Dodaj projekat</DialogTitle>
                         <DialogContent dividers >
                              <AddActivityForm
                                   onSubmitSuccess={handleSubmitSuccess}
                                   onSubmitFail={handleSubmitFail} />
                         </DialogContent>
                    </Dialog>
               </Box >
          </SessionProvider>
     );
};


export async function getServerSideProps(context: any) {

     try {
          const activities = await ActivitiesServices().getAllActivities();
          const activitiesCount = Array.isArray(activities) ? activities.length : 0;

          return {
               props: {
                    activities: JSON.parse(JSON.stringify(activities)),
                    activitiesCount: JSON.parse(JSON.stringify(activitiesCount))
               },
          };
     } catch (error) {
          return {
               props: {
                    activities: [],
                    activitiesCount: 0,
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