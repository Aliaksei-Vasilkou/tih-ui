interface PageErrorProps {
  message?: string
}

export default function PageError({ message = 'Something went wrong.' }: PageErrorProps) {
  return (
    <div className="text-center py-20 text-error">
      <p className="text-lg font-medium">{message}</p>
    </div>
  )
}
