export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PENDING_APPROVAL: '/pending-approval',

  // Admin routes
  DASHBOARD: '/dashboard',
  MEMBERS: '/members',
  MEMBER_NEW: '/members/new',
  MEMBER_DETAILS: (id: string) => `/members/${id}`,
  MEMBER_EDIT: (id: string) => `/members/${id}/edit`,
  PENDING_MEMBERS: '/members/pending',
  QR_CODES: '/qr-codes',
  QR_GENERATE: '/qr-codes/generate',
  CAMPAIGNS: '/campaigns',
  CAMPAIGN_NEW: '/campaigns/new',

  // Receptionist routes
  SCAN: '/scan',

  // Member routes
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
} as const
