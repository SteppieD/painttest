import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'

export default async function Home() {
  const auth = await requireAuth()

  if (!auth) {
    redirect('/quotes/login')
  }

  redirect('/quotes/dashboard')
}