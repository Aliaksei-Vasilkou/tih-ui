import { Link } from 'react-router-dom';
import { Code2, ArrowLeft } from 'lucide-react';

export default function PracticePage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
      <div className="p-4 rounded-full bg-primary-600/10 text-primary-600">
        <Code2 className="w-10 h-10" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Practice</h1>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Coming soon</p>
      </div>

      <p className="max-w-md text-foreground-secondary">
        Reinforce your knowledge with spaced repetition and interactive Q&A sessions. Practice mode will help you retain
        what you have learned through active recall.
      </p>

      <Link
        to="/"
        aria-label="Back to Home"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border-strong rounded-lg text-muted hover:bg-surface-alt transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Home
      </Link>
    </div>
  );
}
