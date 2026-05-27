import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { languagesApi } from '@/api/languages';
import { categoriesApi } from '@/api/categories';
import { questionsApi } from '@/api/questions';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import Select from '@/components/common/Select';

type ExportStatus = 'idle' | 'success' | 'error';

export default function BatchExport() {
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(null);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [status, setStatus] = useState<ExportStatus>('idle');

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: languagesApi.getAll,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', selectedLanguageId],
    queryFn: () => categoriesApi.getAll(selectedLanguageId ?? undefined),
    enabled: Boolean(selectedLanguageId),
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      questionsApi.batchExport({
        languageCode: selectedLanguageCode || undefined,
        categoryName: selectedCategoryName || undefined,
      }),
    onSuccess: () => setStatus('success'),
    onError: () => setStatus('error'),
  });

  const handleLanguageChange = (val: string | number) => {
    const id = val === '' ? null : Number(val);
    const lang = languages.find((l) => l.id === id);
    setSelectedLanguageId(id);
    setSelectedLanguageCode(lang?.code ?? '');
    setSelectedCategoryName('');
    setStatus('idle');
  };

  const handleCategoryChange = (val: string | number) => {
    setSelectedCategoryName(String(val));
    setStatus('idle');
  };

  const handleExport = () => {
    setStatus('idle');
    exportMutation.mutate();
  };

  const selectedLanguageName = languages.find((l) => l.code === selectedLanguageCode)?.name;

  function renderExportDescription() {
    if (!selectedLanguageCode) {
      return 'Exporting all questions across every language and category.';
    }
    if (selectedCategoryName) {
      return (
        <>
          Exporting <span className="font-medium text-foreground-secondary">{selectedCategoryName}</span> questions for{' '}
          <span className="font-medium text-foreground-secondary">{selectedLanguageName}</span>.
        </>
      );
    }
    return (
      <>
        Exporting all <span className="font-medium text-foreground-secondary">{selectedLanguageName}</span> questions.
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted uppercase tracking-wide">Language</label>
        <Select
          value={selectedLanguageId ?? ''}
          onChange={handleLanguageChange}
          options={languages.map((l) => ({ value: l.id, label: l.name }))}
          placeholder="All Languages"
          disabled={exportMutation.isPending}
          className="w-full"
        />
      </div>

      {selectedLanguageId && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted uppercase tracking-wide">Category</label>
          <Select
            value={selectedCategoryName}
            onChange={handleCategoryChange}
            options={categories.map((c) => ({
              value: c.name,
              label: c.name,
            }))}
            placeholder="All Categories"
            disabled={exportMutation.isPending}
            className="w-full"
          />
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={exportMutation.isPending}
        className={clsx(
          'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
          exportMutation.isPending
            ? 'bg-primary-400 text-white cursor-not-allowed opacity-70'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        )}
      >
        {exportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {exportMutation.isPending ? 'Exporting…' : 'Export JSON'}
      </button>

      <p className="text-sm text-muted">{renderExportDescription()}</p>

      {status === 'success' && (
        <div className="flex items-center gap-2 text-sm text-success bg-success-bg border border-success-light rounded-lg px-4 py-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Export downloaded successfully. The file can be re-imported on any device.</span>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-sm text-error bg-error-bg border border-error-light rounded-lg px-4 py-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Export failed. Please try again.</span>
        </div>
      )}
    </div>
  );
}
