'use client';

import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography, TablePagination } from '@mui/material';
import { useRouter } from 'next/navigation';
import { PublicationTable } from './publication-table';
import { EntitySearch } from '@/components/entity-search';
import { useFilterableList } from 'src/hooks/use-filterable-list';
import { Publication } from './publication-type';

const searchableFields: (keyof Publication)[] = ['publication_title'];

export const PublicationList = ({ publications }: { publications: Publication[] }) => {
     const router = useRouter();
     const {
          searchQuery, setSearchQuery, page, rowsPerPage,
          pagedItems, filteredItems, handlePageChange, handleRowsPerPageChange,
     } = useFilterableList(publications, searchableFields);

     return (
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="xl">
                    <Stack spacing={3}>
                         <Stack direction="row" justifyContent="space-between" spacing={4}>
                              <Stack spacing={1}>
                                   <Typography variant="h4">Publications</Typography>
                              </Stack>
                              <Button
                                   startIcon={(<SvgIcon fontSize="small"><PlusIcon /></SvgIcon>)}
                                   variant="contained"
                                   onClick={() => router.push('/publications/new')}
                              >
                                   Add Publication
                              </Button>
                         </Stack>
                         <EntitySearch
                              value={searchQuery}
                              onChange={setSearchQuery}
                              placeholder="Search publications"
                         />
                         <PublicationTable items={pagedItems} />
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
