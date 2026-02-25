'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useSidebar } from '@/context/SidebarContext'
import { useLanguage } from '@/context/LanguageContext'
import { Home, Users, UserCog, GraduationCap, User, UsersRound, BookOpen, Wallet, UserCircle, Settings, LogOut } from 'lucide-react'

function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const { isOpen } = useSidebar()
  const { t } = useLanguage()

  const links = [
    { to: '/dashboard', label: t('dashboard'), icon: Home },
    { to: '/menegerlar', label: t('managers'), icon: Users },
    { to: '/adminlar', label: t('admins'), icon: UserCog },
    { to: '/ustozlar', label: t('teachers'), icon: GraduationCap },
    { to: '/studentlar', label: t('students'), icon: User },
    { to: '/guruhlar', label: t('groups'), icon: UsersRound },
    { to: '/kurslar', label: t('courses'), icon: BookOpen },
    { to: '/payment', label: t('payments'), icon: Wallet },
  ]

  const otherLinks = [
    { to: '/sozlamalar', label: t('settings'), icon: Settings },
    { to: '/profile', label: t('profile'), icon: UserCircle },
  ]

  const handleLogout = () => {
    logout()
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
          const Icon = link.icon
          return (
            <Link
              key={link.to}
              href={link.to}
              className={`flex items-center gap-3 px-4 py-2 rounded text-sm font-medium ${isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
                }`}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          )
        })}

        <p className="text-[18px] font-semibold mb-[1px] mt-4 text-gray-900 dark:text-white">Boshqalar</p>

        {otherLinks.map((link) => {
          const isActive = pathname === link.to
          const Icon = link.icon
          return (
            <Link
              key={link.to}
              href={link.to}
              className={`flex items-center gap-3 px-4 py-2 rounded text-sm font-medium ${isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
                }`}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          )
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition text-left"
        >
          <LogOut size={20} />
          Chiqish
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar
