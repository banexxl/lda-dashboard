import type { Metadata } from 'next';
import { QuestionsServices } from '@/utils/questions-services';
import { QuestionList } from '@/sections/questions/question-list';

export const metadata: Metadata = { title: 'Questions' };

export default async function Page() {
     const questions = await QuestionsServices().getAllQuestions();
     return <QuestionList questions={Array.isArray(questions) ? questions : []} />;
}
