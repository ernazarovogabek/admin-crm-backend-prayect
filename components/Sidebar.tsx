'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useSidebar } from '@/context/SidebarContext'

const links = [
  { to: '/dashboard', label: 'Asosiy' },
  { to: '/menegerlar', label: 'Menegerlar' },
  { to: '/adminlar', label: 'Adminlar' },
  { to: '/ustozlar', label: 'Ustozlar' },
  { to: '/studentlar', label: 'Studentlar' },
  { to: '/guruhlar', label: 'Guruhlar' },
  { to: '/kurslar', label: 'Kurslar' },
  { to: '/payment', label: 'Payment' },
  { to: '/profile', label: 'Profil' },
  { to: '/sozlamalar', label: 'Sozlamalar' },
]

function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const { isOpen } = useSidebar()

  const handleLogout = () => {
    logout()
    // Cookie ni o'chirish
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/login')
  }

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-0'} bg-white shadow-md dark:bg-[#141414] transition-all duration-300 overflow-hidden`}>
      <nav className="flex flex-col p-4 space-y-2">
        <h1 className="text-[20px] font-bold mb-[20px] text-gray-900 dark:text-white">Admin CRM</h1>
        <p className="text-[18px] font-semibold mb-[1px] text-gray-900 dark:text-white">Menu</p>

        {links.map((link) => {
          const isActive = pathname === link.to
          return (
            <Link
              key={link.to}
              href={link.to}
              className={`px-4 py-2 rounded text-sm font-medium ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          )
        })}

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition text-left"
        >
          Chiqish
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar
