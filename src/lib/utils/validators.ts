import { z } from 'zod'

export const phoneRegex = /^05[0-9]{8}$/

export const memberSchema = z.object({
  full_name: z
    .string()
    .min(3, 'שם מלא חייב להכיל לפחות 3 תווים')
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: 'יש להזין שם פרטי ושם משפחה',
    }),
  phone: z
    .string()
    .regex(phoneRegex, 'מספר טלפון לא תקין (פורמט: 05XXXXXXXX)'),
  email: z
    .string()
    .email('כתובת אימייל לא תקינה')
    .or(z.literal(''))
    .nullable()
    .optional(),
  birthday: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_active: z.boolean(),
})

export type MemberFormData = z.infer<typeof memberSchema>

export const loginSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  full_name: z
    .string()
    .min(3, 'שם מלא חייב להכיל לפחות 3 תווים')
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: 'יש להזין שם פרטי ושם משפחה',
    }),
  phone: z
    .string()
    .regex(phoneRegex, 'מספר טלפון לא תקין (פורמט: 05XXXXXXXX)'),
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
  birthday: z.string().nullable().optional(),
})

export type RegisterFormData = z.infer<typeof registerSchema>
