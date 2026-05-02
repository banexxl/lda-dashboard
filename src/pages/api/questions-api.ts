import { QuestionsServices } from '@/utils/questions-services';
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

const questionsServices = QuestionsServices();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     try {
          switch (req.method) {
               case 'GET': {
                    const questions = await questionsServices.getAllQuestions();
                    return res.status(200).json(questions);
               }
               case 'PUT': {
                    const { id, updatedQuestion } = req.body;

                    if (!id || !updatedQuestion) {
                         return res.status(400).json({ error: 'Missing question id or data' });
                    }

                    const normalizedQuestionDate = updatedQuestion.questionDateTime
                         ? new Date(updatedQuestion.questionDateTime)
                         : null;
                    if (normalizedQuestionDate && isNaN(normalizedQuestionDate.getTime())) {
                         return res.status(400).json({ error: 'Invalid questionDateTime' });
                    }

                    const normalizedAnswerDate = updatedQuestion.answerDateTime
                         ? new Date(updatedQuestion.answerDateTime)
                         : null;
                    if (normalizedAnswerDate && isNaN(normalizedAnswerDate.getTime())) {
                         return res.status(400).json({ error: 'Invalid answerDateTime' });
                    }

                    const answerText = (updatedQuestion.answer || '').trim();
                    const derivedAnswerDate = answerText
                         ? normalizedAnswerDate || new Date()
                         : null;

                    const updated = await questionsServices.updateQuestion(id, {
                         ...updatedQuestion,
                         questionDateTime: normalizedQuestionDate || updatedQuestion.questionDateTime,
                         answer: answerText,
                         answerDateTime: derivedAnswerDate,
                    });

                    if (updated) {
                         if (answerText) {
                              const sendNotification = async () => {
                                   try {
                                        const host = process.env.EMAIL_SERVER_HOST;
                                        const user = process.env.EMAIL_SERVER_USER;
                                        const pass = process.env.EMAIL_SERVER_PASSWORD;
                                        const port = Number(process.env.EMAIL_SERVER_PORT || 465);

                                        if (!host || !user || !pass) {
                                             throw new Error('Missing email server configuration');
                                        }

                                        const transporter = nodemailer.createTransport({
                                             host,
                                             port,
                                             secure: port === 465,
                                             auth: { user, pass },
                                        });

                                        console.log('email: sending notification to', updatedQuestion.email);
                                        const emailResponse = await Promise.race([
                                             transporter.sendMail({
                                                  from: 'LDA Subotica - Postavi Pitanje <noreply@lda-subotica.org>',
                                                  to: updatedQuestion.email,
                                                  subject: 'Your question has been answered',
                                                  html: `
                                                       <p>Hello ${updatedQuestion.fullName || ''},</p>
                                                       <p>Your question has been answered. You can view and ask more questions here:</p>
                                                       <p>
                                                            <a href="https://lda-subotica.org/postavi-pitanje/" 
                                                               style="display:inline-block;padding:10px 16px;background:#1976d2;color:#ffffff;text-decoration:none;border-radius:4px;">
                                                                 Open the Q&amp;A page
                                                            </a>
                                                       </p>
                                                       <p>Thank you.</p>
                                                  `,
                                             }),
                                             new Promise((_, reject) =>
                                                  setTimeout(() => reject(new Error('Email send timed out')), 10000)
                                             )
                                        ]);
                                        console.log('email: sent', emailResponse);
                                   } catch (error: any) {
                                        console.error('email: failed', error);
                                   }
                              };

                              void sendNotification();
                         }

                         return res.status(200).json({
                              message: 'Question updated successfully.'
                         });
                    }

                    return res.status(500).json({ error: 'Failed to update question' });
               }
               case 'DELETE': {
                    const { id } = req.query;

                    if (!id || typeof id !== 'string') {
                         return res.status(400).json({ error: 'Missing question id for deletion' });
                    }

                    const deleted = await questionsServices.deleteQuestion(id);

                    if (deleted) {
                         return res.status(200).json({ message: 'Question deleted successfully' });
                    }

                    return res.status(500).json({ error: 'Failed to delete question' });
               }
               default:
                    return res.status(405).json({ error: 'Method Not Allowed' });
          }
     } catch (error) {
          console.error('Error handling questions API:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
     }
}
