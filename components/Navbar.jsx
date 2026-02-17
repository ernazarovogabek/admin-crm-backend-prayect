'use client'

import { UserOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { MdLightMode, MdDarkMode } from 'react-icons/md'

function Navbar() {
  const { token, user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const userFullName = user?.fullName || "Ernazarov Og'abek"
  const userRole = user?.role || ''

  return (
    <header className="flex justify-between items-center h-16 px-6 bg-white shadow dark:bg-[#1a1a1a]">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <MdLightMode className="text-2xl text-yellow-400" />
          ) : (
            <MdDarkMode className="text-2xl text-gray-700" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-col text-right">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {token ? userFullName : 'Not logged in'}
          </span>

          {token && (
            <div className="flex items-center justify-end text-gray-500 dark:text-gray-400 text-xs">
              <UserOutlined className="mr-1" />
              <span>{userRole}</span>
            </div>
          )}
        </div>

        <Tooltip title="Profil">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl text-gray-700 dark:text-white">
            <UserOutlined />
          </div>
        </Tooltip>
      </div>
    </header>
  )
}

export default Navbar
