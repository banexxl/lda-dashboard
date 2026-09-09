import Head from 'next/head';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography, TablePagination } from '@mui/material';
import { useRouter } from 'next/router';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ProjectActivityTable } from '@/sections/project-activities/project-activity-table';
import { EntitySearch } from '@/components/entity-search';
import { projectActivitiesServices } from '../../utils/project-activity-services'
import { projectSummaryServices } from '../../utils/project-summary-services'
import { useFilterableList } from 'src/hooks/use-filterable-list';
import { ProjectActivity } from '@/sections/project-activities/project-activity-type';
import { ProjectSummary } from '@/sections/project-summaries/project-summary-type';

const searchableFields: (keyof ProjectActivity)[] = ['title', 'subTitle', 'title_eng', 'subTitle_eng', 'projectURL', 'projectSummaryURL'];

type PageProps = {
     projectActivities: ProjectActivity[];
     projectSummaries: ProjectSummary[];
};

const Page = (props: PageProps) => {
     const router = useRouter();
     const {
          searchQuery, setSearchQuery, page, rowsPerPage,
          pagedItems, filteredItems, handlePageChange, handleRowsPerPageChange,
     } = useFilterableList(props.projectActivities, searchableFields);

     return (
          <Box>
               <Head>
                    <title>Projektne aktivnosti</title>
               </Head>
               <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                    <Container maxWidth="xl">
                         <Stack spacing={3}>
                              <Stack direction="row" justifyContent="space-between" spacing={4}>
                                   <Stack spacing={1}>
                                        <Typography variant="h4">Projektne aktivnosti</Typography>
                                   </Stack>
                                   <Button
                                        startIcon={(<SvgIcon fontSize="small"><PlusIcon /></SvgIcon>)}
                                        variant="contained"
                                        onClick={() => router.push('/project-activities/new')}
                                   >
                                        Dodaj projektnu aktivnost
                                   </Button>
                              </Stack>
                              <EntitySearch
                                   value={searchQuery}
                                   onChange={setSearchQuery}
                                   placeholder="Search project activity..."
                              />
                              <ProjectActivityTable items={pagedItems} projectSummaries={props.projectSummaries} />
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
          const projectActivities = await projectActivitiesServices().getAllProjectActivities();
          const projectSummaries = await projectSummaryServices().getAllProjectSummaries();

          return {
               props: {
                    projectActivities: JSON.parse(JSON.stringify(projectActivities)),
                    projectSummaries: JSON.parse(JSON.stringify(projectSummaries)),
               },
          };
     } catch (error) {
          return {
               props: {
                    projectActivities: [],
                    projectSummaries: [],
                    error: "Failed to fetch project activities. Please try again later.",
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
