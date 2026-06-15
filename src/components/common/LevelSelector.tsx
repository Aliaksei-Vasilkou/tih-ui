import { useSearchParams } from 'react-router-dom';

import type { LevelTag } from '@/types';
import { LEVEL_OPTIONS } from '@/constants/modes';
import Select from '@/components/common/Select';

export default function LevelSelector() {
  const [searchParams, setSearchParams] = useSearchParams();
  const levelParam = searchParams.get('level') as LevelTag | null;

  const handleChange = (val: string | number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (val === '') {
          next.delete('level');
        } else {
          next.set('level', String(val));
        }
        next.delete('page');
        return next;
      },
      { replace: true }
    );
  };

  const options = LEVEL_OPTIONS.filter((o) => o.tag !== null).map((o) => ({
    value: o.tag as string,
    label: o.label,
  }));

  return (
    <Select
      value={levelParam ?? ''}
      onChange={handleChange}
      options={options}
      placeholder="All Levels"
      size="sm"
      className="min-w-[130px]"
    />
  );
}
