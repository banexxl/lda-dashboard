import Head from 'next/head';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography, TablePagination } from '@mui/material';
import { useRouter } from 'next/router';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { PublicationTable } from '@/sections/publications/publication-table';
import { EntitySearch } from '@/components/entity-search';
import { PublicationsServices } from '../../utils/publication-services'
import { useFilterableList } from 'src/hooks/use-filterable-list';
import { Publication } from '@/sections/publications/publication-type';

const searchableFields: (keyof Publication)[] = ['publicationTitle'];

const Page = (props: { publications: Publication[]; error?: string }) => {
     const router = useRouter();
     const {
          searchQuery, setSearchQuery, page, rowsPerPage,
          pagedItems, filteredItems, handlePageChange, handleRowsPerPageChange,
     } = useFilterableList(props.publications, searchableFields);

     return (
          <Box>
               <Head>
                    <title>Publications</title>
               </Head>
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
                              {props.error && <Typography color="error.main">{props.error}</Typography>}
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
          </Box>
     );
};

export async function getServerSideProps() {
     try {
          const publications = await PublicationsServices().getAllPublications();

          return {
               props: {
                    publications: JSON.parse(JSON.stringify(publications)),
               },
          };
     } catch (error) {
          return {
               props: {
                    publications: [],
                    error: 'Failed to fetch publications. Please try again later.',
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
