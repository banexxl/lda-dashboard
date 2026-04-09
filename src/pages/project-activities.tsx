import { useMemo, useState } from 'react';
import Head from 'next/head';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ProjectActivityTable } from '@/sections/project-activities/project-activity-table';
import { ProjectsActivitySearch } from '@/sections/project-activities/project-activity-search';
import { projectActivitiesServices } from '../utils/project-activity-services'
import { projectSummaryServices } from '../utils/project-summary-services'
import { AddProjectActivityForm } from '../sections/project-activities/project-activity-form'
import { TablePagination } from '@mui/material'
import { SessionProvider } from 'next-auth/react';


const Page = (props: any) => {

     const ProjectsIds = useMemo(() => {
          if (!Array.isArray(props.projects)) {
               return [];
          }
          return props.projects.map((project: any) => project._id);
     }, [props.projects]);

     const [open, setOpen] = useState(false)
     const ProjectsSelection = useSelection(ProjectsIds);
     const [loading, setLoading] = useState(false)
     const [searchQuery, setSearchQuery] = useState('')
     const [page, setPage] = useState(0)
     const [rowsPerPage, setRowsPerPage] = useState(5)

     const filteredProjectActivities = useMemo(() => {
          const query = searchQuery.trim().toLowerCase()
          if (!query) return props.projectActivities
          return (props.projectActivities || []).filter((activity: any) => {
               const fieldsToSearch = [
                    activity?.title,
                    activity?.subTitle,
                    activity?.title_eng,
                    activity?.subTitle_eng,
                    activity?.projectURL,
                    activity?.projectSummaryURL
               ]
               return fieldsToSearch
                    .filter((value) => typeof value === 'string')
                    .some((value: string) => value.toLowerCase().includes(query))
          })
     }, [props.projectActivities, searchQuery])

     const pagedProjectActivities = useMemo(() => {
          const startIndex = page * rowsPerPage
          return filteredProjectActivities.slice(startIndex, startIndex + rowsPerPage)
     }, [filteredProjectActivities, page, rowsPerPage])

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

                                        </Box>
                                   </Stack>
                                   <ProjectsActivitySearch
                                        value={searchQuery}
                                        onChange={setSearchQuery}
                                   />
                                   <ProjectActivityTable
                                        projectActivitiesCount={pagedProjectActivities.length || 0}
                                        items={pagedProjectActivities}
                                        page={page + 1}
                                        rowsPerPage={rowsPerPage}
                                        selected={ProjectsSelection.selected}
                                        projectSummaries={props.projectSummaries}
                                   />
                                   <TablePagination
                                        component="div"
                                        count={filteredProjectActivities.length}
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
                         <DialogTitle>Dodaj projektnu aktivnost</DialogTitle>
                         <DialogContent dividers sx={{ overflowX: 'hidden', px: 2 }}>
                              <AddProjectActivityForm
                                   onSubmitSuccess={handleSubmitSuccess}
                                   onSubmitFail={handleSubmitFail}
                                   projectSummaries={props.projectSummaries}
                              />
                         </DialogContent>
                    </Dialog>
               </Box >
          </SessionProvider>
     );
};


export async function getServerSideProps(context: any) {

     try {
          const projectActivities = await projectActivitiesServices().getAllProjectActivities();
          const projectActivitiesCount = Array.isArray(projectActivities) ? projectActivities.length : 0;
          const projectSummaries = await projectSummaryServices().getAllProjectSummaries();

          return {
               props: {
                    projectActivities: JSON.parse(JSON.stringify(projectActivities)),
                    projectActivitiesCount: JSON.parse(JSON.stringify(projectActivitiesCount)),
                    projectSummaries: JSON.parse(JSON.stringify(projectSummaries)),
               },
          };
     } catch (error) {
          console.error("Error fetching projects:", error);
          return {
               props: {
                    projects: [],
                    projectActivitiesCount: 0,
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
