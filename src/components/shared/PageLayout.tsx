'use client'

import Header from './Header'

interface PageLayoutProps {
  children: React.ReactNode
  variant?: 'home' | 'app'
  showHeader?: boolean
  className?: string
}

export default function PageLayout({ 
  children, 
  variant = 'app', 
  showHeader = true,
  className = ''
}: PageLayoutProps) {
  const backgroundClasses = variant === 'home' 
    ? "bg-gradient-to-br from-blue-50 via-white to-cyan-50"
    : "bg-gradient-to-br from-blue-50 via-slate-50 to-green-50"

  return (
    <div className={`min-h-screen ${backgroundClasses} ${className}`}>
      {showHeader && <Header variant={variant} showBackground={variant !== 'home'} />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 