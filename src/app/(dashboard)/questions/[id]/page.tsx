import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { QuestionsServices } from '@/utils/questions-services';
import { QuestionDetail } from '@/sections/questions/question-detail';

export const metadata: Metadata = { title: 'Answer question' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
     const { id } = await params;
     const question = await QuestionsServices().getQuestionById(id);

     if (!question) {
          notFound();
     }

     return <QuestionDetail question={question} />;
}
