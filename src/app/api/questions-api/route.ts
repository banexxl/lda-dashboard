import { NextRequest, NextResponse } from 'next/server';
import { QuestionsServices } from '@/utils/questions-services';
import nodemailer from 'nodemailer';

const questionsServices = QuestionsServices();

export async function GET() {
     try {
          const questions = await questionsServices.getAllQuestions();
          return NextResponse.json(questions);
     } catch (error) {
          console.error('Error handling questions API:', error);
          return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
     }
}

export async function PUT(request: NextRequest) {
     try {
          const { id, updatedQuestion } = await request.json();

          if (!id || !updatedQuestion) {
               return NextResponse.json({ error: 'Missing question id or data' }, { status: 400 });
          }

          const normalizedQuestionDate = updatedQuestion.question_date_time
               ? new Date(updatedQuestion.question_date_time)
               : null;
          if (normalizedQuestionDate && isNaN(normalizedQuestionDate.getTime())) {
               return NextResponse.json({ error: 'Invalid question_date_time' }, { status: 400 });
          }

          const normalizedAnswerDate = updatedQuestion.answer_date_time
               ? new Date(updatedQuestion.answer_date_time)
               : null;
          if (normalizedAnswerDate && isNaN(normalizedAnswerDate.getTime())) {
               return NextResponse.json({ error: 'Invalid answer_date_time' }, { status: 400 });
          }

          const answerText = (updatedQuestion.answer || '').trim();
          const derivedAnswerDate = answerText ? (normalizedAnswerDate || new Date()) : null;

          const updated = await questionsServices.updateQuestion(id, {
               ...updatedQuestion,
               question_date_time: (normalizedQuestionDate || updatedQuestion.question_date_time)?.toISOString?.() ?? updatedQuestion.question_date_time,
               answer: answerText,
               answer_date_time: derivedAnswerDate ? derivedAnswerDate.toISOString() : null,
          });

          if (!updated) {
               return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
          }

          const archivedFlag = updatedQuestion?.archived ?? false;
          if (answerText && !archivedFlag) {
               const sendNotification = async () => {
                    try {
                         const host = process.env.EMAIL_SERVER_HOST;
                         const user = process.env.EMAIL_SERVER_USER;
                         const pass = process.env.EMAIL_SERVER_PASSWORD;
                         const port = 587;

                         if (!host || !user || !pass) {
                              throw new Error('Missing email server configuration');
                         }

                         const transporter = nodemailer.createTransport({
                              host,
                              port,
                              secure: false,
                              auth: { user, pass },
                         });

                         const emailResponse = await transporter.sendMail({
                              from: 'LDA Subotica - Postavi Pitanje <noreply@lda-subotica.org>',
                              to: updatedQuestion.email,
                              subject: 'Your question has been answered',
                              html: `
                                        <p>Hello ${updatedQuestion.full_name || ''},</p>
                                        <p>Your question has been answered. You can view and ask more questions here:</p>
                                        <p>
                                             <a href="https://lda-subotica.org/postavi-pitanje/"
                                                style="display:inline-block;padding:10px 16px;background:#1976d2;color:#ffffff;text-decoration:none;border-radius:4px;">
                                                  Open the Q&amp;A page
                                             </a>
                                        </p>
                                        <p>Thank you.</p>
                                   `,
                         });
                         console.log('email: sent', emailResponse);
                    } catch (error: any) {
                         console.error('email: failed', error);
                    }
               };

               void sendNotification();
          }

          return NextResponse.json({ message: 'Question updated successfully.' });
     } catch (error) {
          console.error('Error handling questions API:', error);
          return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
     }
}

export async function DELETE(request: NextRequest) {
     try {
          const id = request.nextUrl.searchParams.get('id');
          if (!id) {
               return NextResponse.json({ error: 'Missing question id for deletion' }, { status: 400 });
          }

          const archived = await questionsServices.archiveQuestion(id);
          if (archived) {
               return NextResponse.json({ message: 'Question archived successfully' });
          }
          return NextResponse.json({ error: 'Failed to archive question' }, { status: 500 });
     } catch (error) {
          console.error('Error handling questions API:', error);
          return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
     }
}
