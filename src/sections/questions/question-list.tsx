'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
     Box, Container, Stack, Table, TableBody, TableCell, TableHead, TableRow,
     TablePagination, Tabs, Tab, Typography,
} from '@mui/material';
import { QuestionItem } from '@/utils/questions-services';
import { EntitySearch } from '@/components/entity-search';
import { SeverityPill } from '@/components/severity-pill';
import { useFilterableList } from 'src/hooks/use-filterable-list';

const searchableFields: (keyof QuestionItem)[] = ['full_name', 'email', 'question', 'answer'];

const formatDate = (value?: string | Date | null) => {
     if (!value) return '-';
     const date = new Date(value);
     if (isNaN(date.getTime())) return '-';
     return date.toLocaleString();
};

export const QuestionList = ({ questions }: { questions: QuestionItem[] }) => {
     const router = useRouter();
     const [tabValue, setTabValue] = useState(0);

     const tabFilteredRows = useMemo(() => {
          const targetArchived = tabValue === 1;
          return questions.filter((row) => !!row.archived === targetArchived);
     }, [questions, tabValue]);

     const {
          searchQuery, setSearchQuery, page, rowsPerPage,
          pagedItems, filteredItems, handlePageChange, handleRowsPerPageChange,
     } = useFilterableList(tabFilteredRows, searchableFields);

     const handleTabChange = (_event: any, newValue: number) => {
          setTabValue(newValue);
     };

     return (
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="xl">
                    <Stack spacing={3}>
                         <Stack direction="row" justifyContent="space-between" spacing={4}>
                              <Stack spacing={1}>
                                   <Typography variant="h4">Questions</Typography>
                              </Stack>
                         </Stack>

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
                                                  key={question.id}
                                                  onClick={() => router.push(`/questions/${question.id}`)}
                                                  sx={{ cursor: 'pointer' }}
                                             >
                                                  <TableCell>{question.full_name}</TableCell>
                                                  <TableCell>{question.email}</TableCell>
                                                  <TableCell sx={{ maxWidth: 280 }}>
                                                       <Typography noWrap>{question.question}</Typography>
                                                  </TableCell>
                                                  <TableCell>
                                                       <SeverityPill color={question.answer ? 'success' : 'warning'}>
                                                            {question.answer ? 'Da' : 'Ne'}
                                                       </SeverityPill>
                                                  </TableCell>
                                                  <TableCell>{formatDate(question.question_date_time)}</TableCell>
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
     );
};
