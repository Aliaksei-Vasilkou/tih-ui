import { Loader2 } from 'lucide-react'

interface PageLoaderProps {
  message?: string
}

export default function PageLoader({ message = 'Loading…' }: PageLoaderProps) {
  return (
    <div className="flex justify-center items-center py-20 text-muted-light">
      <Loader2 className="w-8 h-8 animate-spin mr-3" />
      <span className="text-lg">{message}</span>
    </div>
  )
}
