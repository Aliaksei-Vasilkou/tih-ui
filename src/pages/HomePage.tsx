import { useWindowSize } from '@/hooks/useWindowSize';
import { MODES } from '@/constants/modes';
import ModeCard from '@/components/common/ModeCard';

// Header height (h-16 = 64px) + main vertical padding (py-6 = 24px × 2 = 48px)
const CHROME_HEIGHT = 64 + 48;
// Minimum available height needed to apply centered layout with offset.
// Below this threshold, fall back to default top-aligned flow layout.
const MIN_HEIGHT_FOR_CENTERED = 650;

export default function HomePage() {
  const { height } = useWindowSize();
  const availableHeight = height - CHROME_HEIGHT;
  const isTallEnough = availableHeight >= MIN_HEIGHT_FOR_CENTERED;

  return (
    <div
      className={isTallEnough ? 'flex flex-col items-center justify-center gap-6' : 'space-y-6'}
      style={isTallEnough ? { minHeight: availableHeight, marginTop: -50 } : undefined}
    >
      <h1 className="text-2xl font-bold text-foreground text-center">Choose your mode</h1>

      <div className="flex flex-col items-center gap-4 w-full">
        {MODES.map((mode) => (
          <ModeCard key={mode.id} mode={mode} />
        ))}
      </div>
    </div>
  );
}
