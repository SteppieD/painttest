import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // Redirect to the chat interface for a unified experience
  redirect('/chat/new')
}
