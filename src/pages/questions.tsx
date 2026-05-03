import { useMemo, useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Swal from 'sweetalert2';
import {
     Box,
     Button,
     CircularProgress,
     Container,
     Dialog,
     DialogActions,
     DialogContent,
     DialogTitle,
     Stack,
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableRow,
     TablePagination,
     Tabs,
     Tab,
     TextField,
     Typography,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { QuestionsServices, QuestionItem } from '@/utils/questions-services';
import { SessionProvider } from 'next-auth/react';

interface QuestionsPageProps {
     questions: QuestionItem[];
     error?: string;
}

const formatDate = (value?: string | Date | null) => {
     if (!value) return '-';
     const date = new Date(value);
     if (isNaN(date.getTime())) return '-';
     return date.toLocaleString();
};

const QuestionsPage = ({ questions, error }: QuestionsPageProps) => {
     const [rows, setRows] = useState<QuestionItem[]>(questions);
     const [isModalOpen, setIsModalOpen] = useState(false);
     const [activeQuestion, setActiveQuestion] = useState<QuestionItem | null>(null);
     const [isSaving, setIsSaving] = useState(false);
     const [page, setPage] = useState(0);
     const [rowsPerPage, setRowsPerPage] = useState(10);
     const [tabValue, setTabValue] = useState(0);

     const filteredRows = useMemo(() => {
          const targetArchived = tabValue === 0 ? 0 : 1;
          return rows.filter((row) => (row.archived ?? 0) === targetArchived);
     }, [rows, tabValue]);

     const hasRows = useMemo(() => filteredRows.length > 0, [filteredRows.length]);
     const pagedRows = useMemo(() => {
          const startIndex = page * rowsPerPage;
          return filteredRows.slice(startIndex, startIndex + rowsPerPage);
     }, [filteredRows, page, rowsPerPage]);

     const handlePageChange = (event: any, newPage: number) => {
          setPage(newPage);
     };

     const handleRowsPerPageChange = (event: any) => {
          const nextRowsPerPage = parseInt(event.target.value, 10) || 10;
          setRowsPerPage(nextRowsPerPage);
          setPage(0);
     };

     const handleTabChange = (event: any, newValue: number) => {
          setTabValue(newValue);
          setPage(0);
     };

     const handleOpenModal = (question: QuestionItem) => {
          setActiveQuestion({ ...question });
          setIsModalOpen(true);
     };

     const handleCloseModal = () => {
          setIsModalOpen(false);
          setActiveQuestion(null);
     };

     const handleFieldChange = (field: keyof QuestionItem, value: string) => {
          if (!activeQuestion) return;
          setActiveQuestion({
               ...activeQuestion,
               [field]: value,
          });
     };

     const handleSave = async () => {
          if (!activeQuestion) return;

          setIsSaving(true);
          try {
               const response = await fetch('/api/questions-api', {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         id: activeQuestion._id,
                         updatedQuestion: {
                              ...activeQuestion,
                         },
                    }),
               });

               const result = await response.json();
               if (response.ok) {
                    setRows((prev) =>
                         prev.map((row) =>
                              row._id === activeQuestion._id
                                   ? {
                                        ...activeQuestion,
                                        answerDateTime:
                                             activeQuestion.answer?.trim().length > 0
                                                  ? new Date()
                                                  : null,
                                   }
                                   : row
                         )
                    );
                    handleCloseModal();
                    Swal.fire({
                         title: 'Success',
                         text: result.message || 'Question updated successfully',
                         icon: 'success',
                         confirmButtonText: 'OK',
                    });
                    return;
               }

               Swal.fire({
                    title: 'Error',
                    text: result.error || 'Failed to update question',
                    icon: 'error',
                    confirmButtonText: 'OK',
               });
          } catch (error) {
               Swal.fire({
                    title: 'Error',
                    text: 'Failed to update question',
                    icon: 'error',
                    confirmButtonText: 'OK',
               });
          } finally {
               setIsSaving(false);
          }
     };

     const handleDelete = async (id: string) => {
          const confirmation = await Swal.fire({
               title: 'Archive question?',
               text: 'You can restore it from the Archived tab later.',
               icon: 'warning',
               showCancelButton: true,
               confirmButtonText: 'Archive',
               cancelButtonText: 'Cancel',
          });

          if (!confirmation.isConfirmed) {
               return;
          }

          const response = await fetch(`/api/questions-api?id=${id}`, {
               method: 'DELETE',
          });

          const result = await response.json();
          if (response.ok) {
               setRows((prev) =>
                    prev.map((row) =>
                         row._id === id ? { ...row, archived: 1 } : row
                    )
               );
               Swal.fire({
                    title: 'Archived',
                    text: result.message || 'Question archived successfully',
                    icon: 'success',
                    confirmButtonText: 'OK',
               });
               return;
          }

          Swal.fire({
               title: 'Error',
               text: result.error || 'Failed to archive question',
               icon: 'error',
               confirmButtonText: 'OK',
          });
     };

     return (
          <SessionProvider>
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

                              <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                                   <Tab label="Active" />
                                   <Tab label="Archived" />
                              </Tabs>
                              <Table>
                                   <TableHead>
                                        <TableRow>
                                             <TableCell>Full name</TableCell>
                                             <TableCell>Email</TableCell>
                                             <TableCell>Question</TableCell>
                                             <TableCell>Answer</TableCell>
                                             <TableCell>Questioned</TableCell>
                                             <TableCell>Answered</TableCell>
                                             <TableCell>Actions</TableCell>
                                        </TableRow>
                                   </TableHead>
                                   <TableBody>
                                        {hasRows ? (
                                             pagedRows.map((question) => (
                                                  <TableRow key={question._id}>
                                                       <TableCell>{question.fullName}</TableCell>
                                                       <TableCell>{question.email}</TableCell>
                                                       <TableCell sx={{ maxWidth: 200 }}>
                                                            <Typography noWrap>
                                                                 {question.question}
                                                            </Typography>
                                                       </TableCell>
                                                       <TableCell sx={{ maxWidth: 200 }}>
                                                            <Typography noWrap>
                                                                 {question.answer || '-'}
                                                            </Typography>
                                                       </TableCell>
                                                       <TableCell>{formatDate(question.questionDateTime)}</TableCell>
                                                       <TableCell>{formatDate(question.answerDateTime)}</TableCell>
                                                       <TableCell>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                 <Button
                                                                      variant="contained"
                                                                      onClick={() => handleOpenModal(question)}
                                                                 >
                                                                      Answer
                                                                 </Button>
                                                                 <Button
                                                                      variant="outlined"
                                                                      color="error"
                                                                      onClick={() => handleDelete(question._id)}
                                                                 >
                                                                      Delete
                                                                 </Button>
                                                            </Stack>
                                                       </TableCell>
                                                  </TableRow>
                                             ))
                                        ) : (
                                             <TableRow>
                                                  <TableCell colSpan={7}>
                                                       <Typography>No questions found.</Typography>
                                                  </TableCell>
                                             </TableRow>
                                        )}
                                   </TableBody>
                              </Table>
                              <TablePagination
                                   component="div"
                                   count={filteredRows.length}
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

               <Dialog
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    fullWidth
                    maxWidth="md"
               >
                    <DialogTitle>Answer question</DialogTitle>
                    <DialogContent dividers>
                         <Stack spacing={2}>
                              <TextField
                                   label="Full name"
                                   value={activeQuestion?.fullName || ''}
                                   fullWidth
                                   disabled
                              />
                              <TextField
                                   label="Email"
                                   value={activeQuestion?.email || ''}
                                   fullWidth
                                   disabled
                              />
                              <TextField
                                   label="Question"
                                   value={activeQuestion?.question || ''}
                                   fullWidth
                                   multiline
                                   minRows={3}
                                   onChange={(event) => handleFieldChange('question', event.target.value)}
                              />
                              <TextField
                                   label="Answer"
                                   value={activeQuestion?.answer || ''}
                                   fullWidth
                                   multiline
                                   minRows={3}
                                   onChange={(event) => handleFieldChange('answer', event.target.value)}
                              />
                         </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                         <Button onClick={handleCloseModal} variant="text" disabled={isSaving}>
                              {isSaving ? (
                                   <CircularProgress size={18} />
                              ) : (
                                   'Cancel'
                              )}
                         </Button>
                         <Button onClick={handleSave} variant="contained" disabled={isSaving}>
                              {isSaving ? (
                                   <CircularProgress size={18} color="inherit" />
                              ) : (
                                   'Save'
                              )}
                         </Button>
                    </DialogActions>
               </Dialog>
          </SessionProvider>
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
