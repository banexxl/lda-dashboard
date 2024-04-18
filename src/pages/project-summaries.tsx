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
import { ProjectSummaryTable } from '@/sections/projects/project-summary-table';
import { ProjectsSearch } from 'src/sections/projects/project-search';
import { applyPagination } from 'src/utils/apply-pagination';
import { ProjectSummariesServices } from '../utils/project-summaries-services'
import { AddProjectSummaryForm } from '../sections/projects/project-summary-form'
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
          router.push(`project-summaries/?page=${props.page}&limit=${event.target.value || 5}`);
          return (event.target.value)
     }

     const handlePageChange = (event: any, newPage: any) => {
          router.push(`/project-summaries?page=${newPage}&limit=${props.limit || 5}`);
     }

     const handleRebuild = async () => {

          try {
               const response = await fetch('https://api.vercel.com/v1/integrations/deploy/prj_8oTQMbXR6nd6jPsw1OWW2Ku6vXIi/bag2X5T5DK', {
                    method: 'POST'
               })

               if (response.ok) {

                    Swal.fire({
                         icon: 'success',
                         title: 'Success',
                         text: 'Projekti uspešno poslati! Sačekajte par minuta i osvežite stranicu!',
                    })
                    router.push('/projects/?page=0&limit=10')
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
                         Projekti
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
                                             Projekti
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
                                                  Dodaj projekat
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
                                                       Pošalji projekat na sajt
                                                  </Typography>
                                             }
                                        </Button>
                                   </Box>
                              </Stack>
                              <ProjectsSearch />
                              <ProjectSummaryTable
                                   count={props.projects.length || 0}
                                   items={props.projects}
                                   page={props.page}
                                   rowsPerPage={props.limit}
                                   selected={ProjectsSelection.selected}
                                   ProjectsCount={props.projectSummariesCount}
                              />
                              <TablePagination
                                   component="div"
                                   count={props.projectSummariesCount}
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
                         <AddProjectSummaryForm
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
          console.log('page', page, 'limit', limit);

          const projects = await ProjectSummariesServices().getProjectsByPage(page, limit);
          const projectSummariesCount = await ProjectSummariesServices().getProjectSummariesCount();

          return {
               props: {
                    projects: JSON.parse(JSON.stringify(projects)),
                    projectSummariesCount: JSON.parse(JSON.stringify(projectSummariesCount)),
                    page: parseInt(context.query.page),
                    limit: parseInt(context.query.limit)
               },
          };
     } catch (error) {
          console.error("Error fetching projects:", error);
          return {
               props: {
                    projects: [],
                    projectSummariesCount: 0,
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