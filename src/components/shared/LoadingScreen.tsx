import { Spinner } from '@/components/ui/Spinner'

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <Spinner size={40} />
        <p className="text-gray-600 font-medium">טוען...</p>
      </div>
    </div>
  )
}
