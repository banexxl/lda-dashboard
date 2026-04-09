import { useMemo, useState } from 'react';
import Head from 'next/head';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ProjectSummaryTable } from '@/sections/project-summaries/project-summary-table';
import { ProjectsSearch } from '@/sections/project-summaries/project-search';
import { projectSummaryServices } from '../utils/project-summary-services'
import { AddProjectSummaryForm } from '../sections/project-summaries/project-summary-form'
import { TablePagination } from '@mui/material'
import { ProjectSummary } from '@/sections/project-summaries/project-summary-type';
import { SessionProvider } from 'next-auth/react';

type PageProps = {
     projects: ProjectSummary[];
     projectSummariesCount: number;
}

const Page = (props: PageProps) => {
     const [open, setOpen] = useState(false)
     const [searchQuery, setSearchQuery] = useState('')
     const [page, setPage] = useState(0)
     const [rowsPerPage, setRowsPerPage] = useState(5)

     const filteredProjects = useMemo(() => {
          const query = searchQuery.trim().toLowerCase()
          if (!query) return props.projects
          return (props.projects || []).filter((project) => {
               const fieldsToSearch = [
                    project?.title,
                    project?.projectSummaryURL,
                    project?.projectSummaryCoverURL,
                    project?.status,
                    project?.locale,
                    project?.category
               ]
               return fieldsToSearch
                    .filter((value) => typeof value === 'string')
                    .some((value) => value.toLowerCase().includes(query))
          })
     }, [props.projects, searchQuery])

     const pagedProjects = useMemo(() => {
          const startIndex = page * rowsPerPage
          return filteredProjects.slice(startIndex, startIndex + rowsPerPage)
     }, [filteredProjects, page, rowsPerPage])

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

                                        </Box>
                                   </Stack>
                                   <ProjectsSearch
                                        value={searchQuery}
                                        onChange={setSearchQuery}
                                   />
                                   <ProjectSummaryTable
                                        items={pagedProjects}
                                   />
                                   <TablePagination
                                        component="div"
                                        count={filteredProjects.length}
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
                              <AddProjectSummaryForm
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
          const projects = await projectSummaryServices().getAllProjectSummaries();
          const projectSummariesCount = Array.isArray(projects) ? projects.length : 0;

          return {
               props: {
                    projects: JSON.parse(JSON.stringify(projects)),
                    projectSummariesCount: JSON.parse(JSON.stringify(projectSummariesCount))
               },
          };
     } catch (error) {
          return {
               props: {
                    projects: [],
                    projectSummariesCount: 0,
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