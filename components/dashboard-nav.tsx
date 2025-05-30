'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Settings, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DashboardNav() {
  const pathname = usePathname()

  const links = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: Home
    },
    {
      href: '/quotes',
      label: 'Quotes',
      icon: FileText
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings
    }
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 px-6 h-16 border-b">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center text-sm transition-colors hover:text-primary",
            pathname === href
              ? "text-primary font-medium"
              : "text-muted-foreground"
          )}
        >
          <Icon className="h-4 w-4 mr-2" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
