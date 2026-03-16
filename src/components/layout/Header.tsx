import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, PlusCircle } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/search" className="flex items-center gap-2 text-primary-700 font-bold text-lg hover:text-primary-900 transition-colors">
            <BookOpen className="w-6 h-6" />
            <span className="hidden sm:block">Tech Interview Helper</span>
            <span className="sm:hidden">TIH</span>
          </Link>

          {/* Actions */}
          <nav className="flex items-center gap-2">
            <button
              onClick={() => navigate('/questions/new')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:block">New Question</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
