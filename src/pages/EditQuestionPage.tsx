import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { questionsApi } from '@/api/questions';
import QuestionForm from '@/components/question/QuestionForm';
import BackButton from '@/components/common/BackButton';
import PageLoader from '@/components/common/PageLoader';
import PageError from '@/components/common/PageError';

export default function EditQuestionPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: question,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['questions', Number(id)],
    queryFn: () => questionsApi.getById(Number(id)),
    enabled: Boolean(id),
  });

  if (isLoading) return <PageLoader />;
  if (isError || !question) return <PageError message="Question not found." />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <BackButton />
      <div className="bg-surface rounded-2xl border border-border shadow-theme-sm p-6">
        <QuestionForm initialData={question} title="Edit Question" />
      </div>
    </div>
  );
}
