import { cn } from '@/lib/utils/cn'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ size = 'md', className }: LogoProps) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-bold', sizes[size])}>
        <span className="text-purple-600">Bowling</span>
        <span className="text-yellow-500">Club</span>
      </span>
    </div>
  )
}
