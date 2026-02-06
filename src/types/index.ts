export type { Member, MemberInsert, MemberUpdate, ApprovalStatus } from './member'
export type { QRCode, QRCodeWithMember, RedeemResult, GenerateResult } from './qr-code'
export type { Campaign } from './campaign'

export type UserRole = 'admin' | 'receptionist' | 'member'

export interface UserRoleRecord {
  id: string
  user_id: string
  role: UserRole
  created_at: string
}

export interface MonthlyStats {
  month: number
  year: number
  total_codes_generated: number
  total_redeemed: number
  redemption_rate_percentage: number
}
