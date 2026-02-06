import { redirect } from 'next/navigation'

// Middleware handles redirecting / to /dashboard or /login
// This is a fallback in case middleware doesn't catch it
export default function HomePage() {
  redirect('/dashboard')
}
