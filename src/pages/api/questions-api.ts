import { QuestionsServices } from '@/utils/questions-services';
import { NextApiRequest, NextApiResponse } from 'next';

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
                         return res.status(200).json({ message: 'Question updated successfully' });
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
