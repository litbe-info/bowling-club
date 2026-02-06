export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface Member {
  id: string
  full_name: string
  phone: string
  email: string | null
  birthday: string | null
  photo_url: string | null
  joined_at: string
  total_redemptions: number
  is_active: boolean
  notes: string | null
  user_id: string | null
  approval_status: ApprovalStatus
  receive_mailings: boolean
  created_at: string
  updated_at: string
}

export type MemberInsert = Omit<Member, 'id' | 'created_at' | 'updated_at' | 'joined_at' | 'total_redemptions'>

export type MemberUpdate = Partial<MemberInsert>
