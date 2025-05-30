import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function Home() {
  try {
    const session = await getSession()
    
    if (session.isLoggedIn && session.companyId) {
      redirect('/dashboard')
    } else {
      redirect('/login')
    }
  } catch (error) {
    redirect('/login')
  }
}