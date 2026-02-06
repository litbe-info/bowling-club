import { MemberLayoutClient } from './layout-client'

export const dynamic = 'force-dynamic'

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MemberLayoutClient>{children}</MemberLayoutClient>
}
