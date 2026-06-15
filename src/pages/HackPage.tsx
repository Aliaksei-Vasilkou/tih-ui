import { Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';

export default function HackPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
      <div className="p-4 rounded-full bg-primary-600/10 text-primary-600">
        <Zap className="w-10 h-10" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Hack</h1>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Coming soon</p>
      </div>

      <p className="max-w-md text-foreground-secondary">
        Challenge yourself with timed coding exercises and get live feedback on your solutions. Hack mode will push your
        skills with real-world interview-style problems.
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
