import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { languagesApi } from '@/api/languages'
import { useFilterStore } from '@/store/filterStore'

export default function LanguageSelector() {
  const { selectedLanguageId, setLanguage, reset } = useFilterStore()

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: languagesApi.getAll,
  })

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === '') {
      reset()
    } else {
      setLanguage(Number(val))
    }
  }

  return (
    <div className="relative flex items-center">
      <select
        value={selectedLanguageId ?? ''}
        onChange={handleChange}
        className="appearance-none pl-3 pr-8 py-1.5 text-sm font-medium
                   border border-gray-300 rounded-lg bg-white text-gray-700
                   hover:border-primary-400 focus:outline-none focus:ring-2
                   focus:ring-primary-400 focus:border-primary-400 transition-colors
                   cursor-pointer"
      >
        <option value="">All Languages</option>
        {languages
          .filter((lang) => lang.code !== 'general')
          .map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 w-3.5 h-3.5 text-gray-500" />
    </div>
  )
}
