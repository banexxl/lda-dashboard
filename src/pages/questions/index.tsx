import { useMemo, useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import {
     Box, Container, Stack, Table, TableBody, TableCell, TableHead, TableRow,
     TablePagination, Tabs, Tab, Typography,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { QuestionsServices, QuestionItem } from '@/utils/questions-services';
import { EntitySearch } from '@/components/entity-search';
import { SeverityPill } from '@/components/severity-pill';
import { useFilterableList } from 'src/hooks/use-filterable-list';

interface QuestionsPageProps {
     questions: QuestionItem[];
     error?: string;
}

const searchableFields: (keyof QuestionItem)[] = ['fullName', 'email', 'question', 'answer'];

const formatDate = (value?: string | Date | null) => {
     if (!value) return '-';
     const date = new Date(value);
     if (isNaN(date.getTime())) return '-';
     return date.toLocaleString();
};

const QuestionsPage = ({ questions, error }: QuestionsPageProps) => {
     const router = useRouter();
     const [tabValue, setTabValue] = useState(0);

     const tabFilteredRows = useMemo(() => {
          const targetArchived = tabValue === 0 ? 0 : 1;
          return questions.filter((row) => (row.archived ?? 0) === targetArchived);
     }, [questions, tabValue]);

     const {
          searchQuery, setSearchQuery, page, rowsPerPage,
          pagedItems, filteredItems, handlePageChange, handleRowsPerPageChange,
     } = useFilterableList(tabFilteredRows, searchableFields);

     const handleTabChange = (_event: any, newValue: number) => {
          setTabValue(newValue);
     };

     return (
          <Box>
               <Head>
                    <title>Questions</title>
               </Head>
               <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                    <Container maxWidth="xl">
                         <Stack spacing={3}>
                              <Stack direction="row" justifyContent="space-between" spacing={4}>
                                   <Stack spacing={1}>
                                        <Typography variant="h4">Questions</Typography>
                                   </Stack>
                              </Stack>

                              {error && <Typography color="error.main">{error}</Typography>}

                              <Tabs value={tabValue} onChange={handleTabChange}>
                                   <Tab label="Active" />
                                   <Tab label="Archived" />
                              </Tabs>

                              <EntitySearch
                                   value={searchQuery}
                                   onChange={setSearchQuery}
                                   placeholder="Search questions"
                              />

                              <Table>
                                   <TableHead>
                                        <TableRow>
                                             <TableCell>Full name</TableCell>
                                             <TableCell>Email</TableCell>
                                             <TableCell>Question</TableCell>
                                             <TableCell>Answered</TableCell>
                                             <TableCell>Questioned</TableCell>
                                        </TableRow>
                                   </TableHead>
                                   <TableBody>
                                        {pagedItems.length > 0 ? (
                                             pagedItems.map((question) => (
                                                  <TableRow
                                                       hover
                                                       key={question._id}
                                                       onClick={() => router.push(`/questions/${question._id}`)}
                                                       sx={{ cursor: 'pointer' }}
                                                  >
                                                       <TableCell>{question.fullName}</TableCell>
                                                       <TableCell>{question.email}</TableCell>
                                                       <TableCell sx={{ maxWidth: 280 }}>
                                                            <Typography noWrap>{question.question}</Typography>
                                                       </TableCell>
                                                       <TableCell>
                                                            <SeverityPill color={question.answer ? 'success' : 'warning'}>
                                                                 {question.answer ? 'Da' : 'Ne'}
                                                            </SeverityPill>
                                                       </TableCell>
                                                       <TableCell>{formatDate(question.questionDateTime)}</TableCell>
                                                  </TableRow>
                                             ))
                                        ) : (
                                             <TableRow>
                                                  <TableCell colSpan={5}>
                                                       <Typography>No questions found.</Typography>
                                                  </TableCell>
                                             </TableRow>
                                        )}
                                   </TableBody>
                              </Table>
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

export const getServerSideProps: GetServerSideProps = async () => {
     try {
          const questions = await QuestionsServices().getAllQuestions();
          const normalized = questions.map((question: any) => ({
               ...question,
               _id: typeof question._id === 'string' ? question._id : question._id?.toString?.() || '',
          }));
          return {
               props: {
                    questions: JSON.parse(JSON.stringify(normalized)),
               },
          };
     } catch (error) {
          return {
               props: {
                    questions: [],
                    error: 'Failed to fetch questions. Please try again later.',
               },
          };
     }
};

QuestionsPage.getLayout = (page: any) => <DashboardLayout>{page}</DashboardLayout>;

export default QuestionsPage;
