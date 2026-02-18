'use client'

import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-[#0e0e0e] transition-colors">
          {children}
        </main>
      </div>
    </div>
  )
}
