'use client';

import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography, TablePagination } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ProjectSummaryTable } from './project-summary-table';
import { EntitySearch } from '@/components/entity-search';
import { useFilterableList } from 'src/hooks/use-filterable-list';
import { ProjectSummary } from './project-summary-type';

const searchableFields: (keyof ProjectSummary)[] = ['title', 'project_summary_url', 'status', 'locale', 'category'];

export const ProjectSummaryList = ({ projects }: { projects: ProjectSummary[] }) => {
     const router = useRouter();
     const {
          searchQuery, setSearchQuery, page, rowsPerPage,
          pagedItems, filteredItems, handlePageChange, handleRowsPerPageChange,
     } = useFilterableList(projects, searchableFields);

     return (
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="xl">
                    <Stack spacing={3}>
                         <Stack direction="row" justifyContent="space-between" spacing={4}>
                              <Stack spacing={1}>
                                   <Typography variant="h4">Projekti</Typography>
                              </Stack>
                              <Button
                                   startIcon={(<SvgIcon fontSize="small"><PlusIcon /></SvgIcon>)}
                                   variant="contained"
                                   onClick={() => router.push('/project-summaries/new')}
                              >
                                   Dodaj projekat
                              </Button>
                         </Stack>
                         <EntitySearch
                              value={searchQuery}
                              onChange={setSearchQuery}
                              placeholder="Search project"
                         />
                         <ProjectSummaryTable items={pagedItems} />
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
