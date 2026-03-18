import { useQuery } from '@tanstack/react-query'
import { languagesApi } from '@/api/languages'
import { useFilterStore } from '@/store/filterStore'
import Select from '@/components/common/Select'

export default function LanguageSelector() {
  const { selectedLanguageId, setLanguage, reset } = useFilterStore()

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: languagesApi.getAll,
  })

  const handleChange = (val: string | number) => {
    if (val === '') {
      reset()
    } else {
      setLanguage(Number(val))
    }
  }

  const options = languages
    .filter((lang) => lang.code !== 'general')
    .map((lang) => ({ value: lang.id, label: lang.name }))

  return (
    <Select
      value={selectedLanguageId ?? ''}
      onChange={handleChange}
      options={options}
      placeholder="All Languages"
      size="sm"
      className="min-w-[140px]"
    />
  )
}
