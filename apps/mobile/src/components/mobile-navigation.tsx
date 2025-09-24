import React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Home, Map, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigationItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Map', href: '/_protected/map', icon: Map },
  { name: 'Report', href: '/_protected/report', icon: Plus },
  { name: 'Profile', href: '/_protected/profile', icon: User },
]

export function MobileNavigation() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-area-bottom">
      <div className="flex justify-around items-center py-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
