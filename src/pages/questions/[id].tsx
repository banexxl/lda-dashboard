import { useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import {
     Box, Button, CircularProgress, Container, Stack, TextField, Typography,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { QuestionsServices, QuestionItem } from '@/utils/questions-services';

interface QuestionPageProps {
     question: QuestionItem;
}

const formatDate = (value?: string | Date | null) => {
     if (!value) return '-';
     const date = new Date(value);
     if (isNaN(date.getTime())) return '-';
     return date.toLocaleString();
};

const QuestionPage = ({ question: initialQuestion }: QuestionPageProps) => {
     const router = useRouter();
     const [question, setQuestion] = useState<QuestionItem>(initialQuestion);
     const [isSaving, setIsSaving] = useState(false);

     const handleFieldChange = (field: keyof QuestionItem, value: string) => {
          setQuestion((prev) => ({ ...prev, [field]: value }));
     };

     const handleSave = async () => {
          setIsSaving(true);
          try {
               const response = await fetch('/api/questions-api', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                         id: question._id,
                         updatedQuestion: { ...question },
                    }),
               });

               const result = await response.json();
               if (response.ok) {
                    Swal.fire({
                         title: 'Success',
                         text: result.message || 'Question updated successfully',
                         icon: 'success',
                         confirmButtonText: 'OK',
                    })
                    router.push('/questions')
                    return;
               }

               Swal.fire({ title: 'Error', text: result.error || 'Failed to update question', icon: 'error', confirmButtonText: 'OK' });
          } catch (error) {
               Swal.fire({ title: 'Error', text: 'Failed to update question', icon: 'error', confirmButtonText: 'OK' });
          } finally {
               setIsSaving(false);
          }
     };

     const handleArchive = async () => {
          const confirmation = await Swal.fire({
               title: 'Archive question?',
               text: 'You can restore it from the Archived tab later.',
               icon: 'warning',
               showCancelButton: true,
               confirmButtonText: 'Archive',
               cancelButtonText: 'Cancel',
          });

          if (!confirmation.isConfirmed) return;

          setIsSaving(true);
          try {
               const response = await fetch(`/api/questions-api?id=${question._id}`, { method: 'DELETE' });
               const result = await response.json();
               if (response.ok) {
                    Swal.fire({ title: 'Archived', text: result.message || 'Question archived successfully', icon: 'success', confirmButtonText: 'OK' })
                    router.push('/questions')
                    return;
               }
               Swal.fire({ title: 'Error', text: result.error || 'Failed to archive question', icon: 'error', confirmButtonText: 'OK' });
          } finally {
               setIsSaving(false);
          }
     };

     return (
          <Box>
               <Head>
                    <title>Answer question</title>
               </Head>
               <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                    <Container maxWidth="md">
                         <Stack spacing={3}>
                              <Typography variant="h4">Answer question</Typography>

                              <Stack spacing={2} sx={{ opacity: isSaving ? .5 : 1 }}>
                                   <TextField label="Full name" value={question.fullName || ''} fullWidth disabled />
                                   <TextField label="Email" value={question.email || ''} fullWidth disabled />
                                   <TextField label="Asked" value={formatDate(question.questionDateTime)} fullWidth disabled />
                                   <TextField
                                        label="Question"
                                        value={question.question || ''}
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        disabled={question.archived === 1}
                                        onChange={(event) => handleFieldChange('question', event.target.value)}
                                   />
                                   <TextField
                                        label="Answer"
                                        value={question.answer || ''}
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        disabled={question.archived === 1}
                                        onChange={(event) => handleFieldChange('answer', event.target.value)}
                                   />
                              </Stack>

                              <Stack direction="row" justifyContent="space-between" sx={{ pt: 2 }}>
                                   <Stack direction="row" spacing={2}>
                                        <Button
                                             variant="contained"
                                             onClick={handleSave}
                                             disabled={isSaving || question.archived === 1}
                                        >
                                             {isSaving ? <CircularProgress size={18} color="inherit" /> : 'Save'}
                                        </Button>
                                        <Button color="inherit" onClick={() => router.push('/questions')} disabled={isSaving}>
                                             Cancel
                                        </Button>
                                   </Stack>
                                   {question.archived !== 1 && (
                                        <Button onClick={handleArchive} color="error" disabled={isSaving}>
                                             Archive question
                                        </Button>
                                   )}
                              </Stack>
                         </Stack>
                    </Container>
               </Box>
          </Box>
     );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
     const { id } = context.params as { id: string };

     const question = await QuestionsServices().getQuestionById(id);

     if (!question) {
          return { notFound: true };
     }

     return {
          props: {
               question: JSON.parse(JSON.stringify({
                    ...question,
                    _id: (question as any)._id?.toString?.() || id,
               })),
          },
     };
};

QuestionPage.getLayout = (page: any) => <DashboardLayout>{page}</DashboardLayout>;

export default QuestionPage;
