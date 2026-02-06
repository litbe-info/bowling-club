import { ReceptionistLayoutClient } from './layout-client'

export const dynamic = 'force-dynamic'

export default function ReceptionistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ReceptionistLayoutClient>{children}</ReceptionistLayoutClient>
}
