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
import { ProjectActivityTable } from '@/sections/project-activities/project-activity-table';
import { ProjectsActivitySearch } from '@/sections/project-activities/project-activity-search';
import { applyPagination } from 'src/utils/apply-pagination';
import { projectActivitiesServices } from '../utils/project-activity-services'
import { projectSummaryServices } from '../utils/project-summary-services'
import { AddProjectActivityForm } from '../sections/project-activities/project-activity-form'
import { useRouter } from 'next/navigation';
import { TablePagination } from '@mui/material'


const Page = (props: any) => {

     const ProjectsIds = useMemo(() => {
          if (!Array.isArray(props.projects)) {
               return [];
          }
          return props.projects.map((project: any) => project._id);
     }, [props.projects]);

     const [open, setOpen] = useState(false)
     const ProjectsSelection = useSelection(ProjectsIds);
     const router = useRouter();
     const [loading, setLoading] = useState(false)

     const handleSubmitSuccess = () => {
          setOpen(false); // Close the dialog
     };

     const handleSubmitFail = () => {
          setOpen(false)
     }

     const handleRowsPerPageChange = (event: any) => {
          router.push(`project-activities/?page=${props.page}&limit=${event.target.value || 5}`);
          return (event.target.value)
     }

     const handlePageChange = (event: any, newPage: any) => {
          router.push(`/project-activities?page=${newPage}&limit=${props.limit || 5}`);
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
                         text: 'Projekti uspešno poslati! Sačekajte par minuta i osvežite stranicu!',
                    })
                    router.push('/')
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
                         Projektne aktivnosti
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
                                             Projektne aktivnosti
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
                                                  Dodaj projektnu aktivnost
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
                                                       Pošalji projektnu aktivnost na sajt
                                                  </Typography>
                                             }
                                        </Button>
                                   </Box>
                              </Stack>
                              <ProjectsActivitySearch />
                              <ProjectActivityTable
                                   projectActivitiesCount={props.projectActivities.length || 0}
                                   items={props.projectActivities}
                                   page={props.page}
                                   rowsPerPage={props.limit}
                                   selected={ProjectsSelection.selected}
                                   projectSummaries={props.projectSummaries}
                              />
                              <TablePagination
                                   component="div"
                                   count={props.projectActivitiesCount}
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
                    <DialogTitle>Dodaj projektnu aktivnost</DialogTitle>
                    <DialogContent dividers >
                         <AddProjectActivityForm
                              projectSummaries={props.projectSummaries}
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

          const projectActivities = await projectActivitiesServices().getProjectActivitiesByPage(page, limit);
          const projectActivitiesCount = await projectActivitiesServices().getProjectActivitiesCount();
          const projectSummaries = await projectSummaryServices().getAllProjectSummaries();

          return {
               props: {
                    projectActivities: JSON.parse(JSON.stringify(projectActivities)),
                    projectActivitiesCount: JSON.parse(JSON.stringify(projectActivitiesCount)),
                    page: parseInt(context.query.page),
                    limit: parseInt(context.query.limit),
                    projectSummaries: JSON.parse(JSON.stringify(projectSummaries)),
               },
          };
     } catch (error) {
          console.error("Error fetching projects:", error);
          return {
               props: {
                    projects: [],
                    projectActivitiesCount: 0,
                    page: 1,
                    limit: 5,
                    error: "Failed to fetch projects. Please try again later.",
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