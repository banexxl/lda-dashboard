'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import {
     Box, Button, CircularProgress, Container, Stack, TextField, Typography,
} from '@mui/material';
import { QuestionItem } from '@/utils/questions-services';

const formatDate = (value?: string | Date | null) => {
     if (!value) return '-';
     const date = new Date(value);
     if (isNaN(date.getTime())) return '-';
     return date.toLocaleString();
};

export const QuestionDetail = ({ question: initialQuestion }: { question: QuestionItem }) => {
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
                         id: question.id,
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
               const response = await fetch(`/api/questions-api?id=${question.id}`, { method: 'DELETE' });
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
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="md">
                    <Stack spacing={3}>
                         <Typography variant="h4">Answer question</Typography>

                         <Stack spacing={2} sx={{ opacity: isSaving ? .5 : 1 }}>
                              <TextField label="Full name" value={question.full_name || ''} fullWidth disabled />
                              <TextField label="Email" value={question.email || ''} fullWidth disabled />
                              <TextField label="Asked" value={formatDate(question.question_date_time)} fullWidth disabled />
                              <TextField
                                   label="Question"
                                   value={question.question || ''}
                                   fullWidth
                                   multiline
                                   minRows={3}
                                   disabled={!!question.archived}
                                   onChange={(event) => handleFieldChange('question', event.target.value)}
                              />
                              <TextField
                                   label="Answer"
                                   value={question.answer || ''}
                                   fullWidth
                                   multiline
                                   minRows={3}
                                   disabled={!!question.archived}
                                   onChange={(event) => handleFieldChange('answer', event.target.value)}
                              />
                         </Stack>

                         <Stack direction="row" justifyContent="space-between" sx={{ pt: 2 }}>
                              <Stack direction="row" spacing={2}>
                                   <Button
                                        variant="contained"
                                        onClick={handleSave}
                                        disabled={isSaving || !!question.archived}
                                   >
                                        {isSaving ? <CircularProgress size={18} color="inherit" /> : 'Save'}
                                   </Button>
                                   <Button color="inherit" onClick={() => router.push('/questions')} disabled={isSaving}>
                                        Cancel
                                   </Button>
                              </Stack>
                              {!question.archived && (
                                   <Button onClick={handleArchive} color="error" disabled={isSaving}>
                                        Archive question
                                   </Button>
                              )}
                         </Stack>
                    </Stack>
               </Container>
          </Box>
     );
};
