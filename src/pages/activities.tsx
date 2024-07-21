import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Swal from 'sweetalert2'
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ActivityTable } from '@/sections/activities/activity-table';
import { ActivitySearch } from '@/sections/activities/activity-search'
import { applyPagination } from 'src/utils/apply-pagination';
import { ActivitiesServices } from '../utils/activity-services'
import { AddActivityForm } from '../sections/activities/activity-form'
import { useRouter } from 'next/navigation';
import { TablePagination } from '@mui/material'


const Page = (props: any) => {

     const ActivityIds = useMemo(() => {
          if (!Array.isArray(props.activities)) {
               return [];
          }
          return props.activities.map((activity: any) => activity._id);
     }, [props.activities]);

     const [open, setOpen] = useState(false)
     const ActivitySelection = useSelection(ActivityIds);
     const router = useRouter();
     const [loading, setLoading] = useState(false)

     const handleSubmitSuccess = () => {
          setOpen(false); // Close the dialog
     };

     const handleSubmitFail = () => {
          setOpen(false)
     }

     const handleRowsPerPageChange = (event: any) => {
          router.push(`activities/?page=${props.page}&limit=${event.target.value || 5}`);
          return (event.target.value)
     }

     const handlePageChange = (event: any, newPage: any) => {
          router.push(`/activities?page=${newPage}&limit=${props.limit || 5}`);
     }

     const handleRebuild = async () => {

          try {
               const response = await fetch('https://api.vercel.com/v1/integrations/deploy/prj_kIxJglN591xV8HcSkVOzbL6T3oLj/grTojSC3fc', {
                    method: 'POST'
               })

               if (response.ok) {

                    Swal.fire({
                         icon: 'success',
                         title: 'Success',
                         text: 'Projekti uspešno poslati! Sačekajte desetak minuta i osvežite stranicu!',
                    })
                    router.push('/activities')
               } else {
                    const errorData = await response.json(); // Parse the error response

                    Swal.fire({
                         icon: 'error',
                         title: 'Oops...',
                         text: 'Something went wrong! Error: ' + errorData,
                    })
               }
          } catch (error) {
               Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong! Error: ' + error,
               })
          }
     }

     return (
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
                                        <Button
                                             sx={{ padding: '10px', height: '50px' }}
                                             startIcon={(
                                                  <SvgIcon fontSize="small">
                                                       <PlusIcon />
                                                  </SvgIcon>
                                             )}
                                             variant="contained"
                                             onClick={handleRebuild}
                                             disabled={loading}
                                        >
                                             {loading ?
                                                  <Typography>
                                                       Šaljem
                                                  </Typography>
                                                  :
                                                  <Typography>
                                                       Pošalji aktivnost na sajt
                                                  </Typography>
                                             }
                                        </Button>
                                   </Box>
                              </Stack>
                              <ActivitySearch />
                              <ActivityTable
                                   count={props.activities.length || 0}
                                   items={props.activities}
                                   page={props.page}
                                   rowsPerPage={props.limit}
                                   selected={ActivitySelection.selected}
                                   activityCount={props.activitiesCount}
                              />
                              <TablePagination
                                   component="div"
                                   count={props.activitiesCount}
                                   onPageChange={handlePageChange}
                                   onRowsPerPageChange={handleRowsPerPageChange}
                                   page={props.page}
                                   rowsPerPage={props.limit || 5}
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
     );
};


export async function getServerSideProps(context: any) {

     try {
          const page = context.query.page || 1
          const limit = context.query.limit || 5

          const activities = await ActivitiesServices().getActivitiesByPage(page, limit);
          const activitiesCount = await ActivitiesServices().getActivitiesCount();

          return {
               props: {
                    activities: JSON.parse(JSON.stringify(activities)),
                    activitiesCount: JSON.parse(JSON.stringify(activitiesCount)),
                    page: parseInt(context.query.page),
                    limit: parseInt(context.query.limit)
               },
          };
     } catch (error) {
          return {
               props: {
                    activities: [],
                    activitiesCount: 0,
                    page: 1,
                    limit: 5,
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