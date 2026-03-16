import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, PlusCircle, Upload, X } from 'lucide-react'
import LanguageSelector from '@/components/common/LanguageSelector'
import { useUIStore } from '@/store/uiStore'

export default function Header() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isSearchPage = pathname === '/search' || pathname === '/'
  const { showUpload, toggleUpload } = useUIStore()

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo + language selector */}
          <div className="flex items-center gap-4">
            <Link to="/search" className="flex items-center gap-2 text-primary-700 font-bold text-lg hover:text-primary-900 transition-colors">
              <BookOpen className="w-6 h-6" />
              <span className="hidden sm:block">Tech Interview Helper</span>
              <span className="sm:hidden">TIH</span>
            </Link>

            {isSearchPage && <LanguageSelector />}
          </div>

          {/* Actions */}
          <nav className="flex items-center gap-2">
            <button
              onClick={() => navigate('/questions/new')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:block">New Question</span>
            </button>

            {isSearchPage && (
              <button
                onClick={toggleUpload}
                title="Batch upload"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {showUpload ? <X className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                <span className="hidden sm:block">{showUpload ? 'Close' : 'Import'}</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
