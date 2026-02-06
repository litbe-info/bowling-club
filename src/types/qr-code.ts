export interface QRCode {
  id: string
  member_id: string
  month: number
  year: number
  qr_code: string
  qr_image_url: string | null
  is_redeemed: boolean
  redeemed_at: string | null
  redeemed_by_user_id: string | null
  redeemed_by_name: string | null
  created_at: string
}

export interface QRCodeWithMember extends QRCode {
  member: {
    id: string
    full_name: string
    phone: string
    photo_url: string | null
  }
}

export interface RedeemResult {
  success: boolean
  message: string
  error_code?: 'QR_NOT_FOUND' | 'ALREADY_REDEEMED'
  member?: {
    id: string
    name: string
    phone: string
    email: string | null
    photo_url: string | null
    total_redemptions: number
    joined_at: string
  }
  redeemed_at?: string
  redeemed_by?: string
}

export interface GenerateResult {
  success: boolean
  total_members: number
  codes_generated: number
  month: number
  year: number
  error?: string
  message?: string
}
