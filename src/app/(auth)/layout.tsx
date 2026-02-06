export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-purple-600 via-purple-400 to-yellow-400 flex items-center justify-center px-4 py-8">
      {children}
    </div>
  )
}
