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
import { useRouter } from 'next/navigation';
import { TablePagination } from '@mui/material'
import { ProjectSummary } from '@/sections/project-summaries/project-summary-type';
import { SessionProvider } from 'next-auth/react';

type PageProps = {
     projects: ProjectSummary[];
     projectSummariesCount: number;
     page: number;
     limit: number;
}

const Page = (props: PageProps) => {
     const [open, setOpen] = useState(false)
     const router = useRouter();
     const [searchQuery, setSearchQuery] = useState('')

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
          const page = props.page || 1
          const limit = props.limit || 5
          const startIndex = (page - 1) * limit
          return filteredProjects.slice(startIndex, startIndex + limit)
     }, [filteredProjects, props.page, props.limit])

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
                    projectSummariesCount: JSON.parse(JSON.stringify(projectSummariesCount)),
                    page: parseInt(context.query.page) || 1,
                    limit: parseInt(context.query.limit) || 5
               },
          };
     } catch (error) {
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