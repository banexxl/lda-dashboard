import { createAdminClient } from '@/utils/supabase/admin';

export type QuestionItem = {
     id: string;
     full_name: string;
     email: string;
     question: string;
     answer: string;
     question_date_time: string;
     answer_date_time: string | null;
     archived?: boolean;
};

export const QuestionsServices = () => {

     const getQuestionById = async (id: string) => {
          const supabase = createAdminClient();
          const { data, error } = await supabase.from('questions').select('*').eq('id', id).maybeSingle();
          if (error) {
               console.error('Error while fetching question:', error);
               return null;
          }
          return data;
     };

     const getAllQuestions = async (archived?: boolean) => {
          const supabase = createAdminClient();
          let query = supabase.from('questions').select('*').order('question_date_time', { ascending: false });
          if (typeof archived === 'boolean') {
               query = query.eq('archived', archived);
          }
          const { data, error } = await query;
          if (error) {
               console.error('Error while fetching questions:', error);
               return [];
          }
          return data;
     };

     const updateQuestion = async (id: string, updatedQuestion: any) => {
          const supabase = createAdminClient();
          const { error } = await supabase
               .from('questions')
               .update({
                    full_name: updatedQuestion.full_name,
                    email: updatedQuestion.email,
                    question: updatedQuestion.question,
                    answer: updatedQuestion.answer,
                    question_date_time: updatedQuestion.question_date_time,
                    answer_date_time: updatedQuestion.answer_date_time,
               })
               .eq('id', id);

          if (error) {
               console.error('Error while updating question:', error);
               return false;
          }
          return true;
     };

     const archiveQuestion = async (id: string) => {
          const supabase = createAdminClient();
          const { error } = await supabase.from('questions').update({ archived: true }).eq('id', id);
          if (error) {
               console.error('Error while archiving question:', error);
               return false;
          }
          return true;
     };

     return {
          getQuestionById,
          getAllQuestions,
          updateQuestion,
          archiveQuestion,
     };
};
