export interface Campaign {
  id: string
  name: string
  month: number
  year: number
  total_sent: number
  sent_at: string | null
  created_at: string
}
