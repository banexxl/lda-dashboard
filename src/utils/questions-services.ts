import { MongoClient, ObjectId } from 'mongodb';

export type QuestionItem = {
     _id: string;
     fullName: string;
     email: string;
     question: string;
     answer: string;
     questionDateTime: Date;
     answerDateTime: Date | null;
     archived?: number;
};

export const QuestionsServices = () => {
     const client = new MongoClient(process.env.MONGODB_URI!);

     const getAllQuestions = async (archived?: number) => {
          try {
               await client.connect();
               const database = client.db('LDA_DB');
               const collection = database.collection('Q&A');
               const filter = typeof archived === 'number' ? { archived } : {};
               const questions = await collection
                    .find(filter)
                    .sort({ questionDateTime: -1 })
                    .toArray();
               return questions;
          } catch (error: any) {
               console.error('Error while fetching questions:', error);
               return [];
          } finally {
               await client.close();
          }
     };

     const updateQuestion = async (id: string, updatedQuestion: any) => {
          try {
               await client.connect();
               const database = client.db('LDA_DB');
               const collection = database.collection('Q&A');
               const result = await collection.updateOne(
                    { _id: new ObjectId(id) },
                    {
                         $set: {
                              fullName: updatedQuestion.fullName,
                              email: updatedQuestion.email,
                              question: updatedQuestion.question,
                              answer: updatedQuestion.answer,
                              questionDateTime: updatedQuestion.questionDateTime,
                              answerDateTime: updatedQuestion.answerDateTime,
                         },
                    }
               );

               return result.modifiedCount > 0;
          } catch (error: any) {
               console.error('Error while updating question:', error);
               return false;
          } finally {
               await client.close();
          }
     };

     const archiveQuestion = async (id: string) => {
          try {
               await client.connect();
               const database = client.db('LDA_DB');
               const collection = database.collection('Q&A');
               const result = await collection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { archived: 1 } }
               );
               return result.modifiedCount > 0;
          } catch (error: any) {
               console.error('Error while archiving question:', error);
               return false;
          } finally {
               await client.close();
          }
     };

     return {
          getAllQuestions,
          updateQuestion,
          archiveQuestion,
     };
};
