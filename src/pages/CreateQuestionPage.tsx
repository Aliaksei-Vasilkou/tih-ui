import QuestionForm from '@/components/question/QuestionForm';
import BackButton from '@/components/common/BackButton';

export default function CreateQuestionPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <BackButton />
      <div className="bg-surface rounded-2xl border border-border shadow-theme-sm p-6">
        <QuestionForm title="New Question" />
      </div>
    </div>
  );
}
