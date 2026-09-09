'use client';

import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography, TablePagination } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ProjectActivityTable } from './project-activity-table';
import { EntitySearch } from '@/components/entity-search';
import { useFilterableList } from 'src/hooks/use-filterable-list';
import { ProjectActivity } from './project-activity-type';
import { ProjectSummary } from '../project-summaries/project-summary-type';

const searchableFields: (keyof ProjectActivity)[] = ['title', 'sub_title', 'title_eng', 'sub_title_eng', 'project_url'];

type ProjectActivityListProps = {
     projectActivities: ProjectActivity[];
     projectSummaries: ProjectSummary[];
};

export const ProjectActivityList = ({ projectActivities, projectSummaries }: ProjectActivityListProps) => {
     const router = useRouter();
     const {
          searchQuery, setSearchQuery, page, rowsPerPage,
          pagedItems, filteredItems, handlePageChange, handleRowsPerPageChange,
     } = useFilterableList(projectActivities, searchableFields);

     return (
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
                         <ProjectActivityTable items={pagedItems} projectSummaries={projectSummaries} />
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
     );
};
