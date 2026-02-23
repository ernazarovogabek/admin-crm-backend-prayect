'use client'

import { useState, useEffect } from 'react'
import { UserOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useSidebar } from '@/context/SidebarContext'
import { MdLightMode, MdDarkMode } from 'react-icons/md'
import { RiSidebarUnfoldFill } from 'react-icons/ri'

function Navbar() {
  const { token, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { toggleSidebar } = useSidebar()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const userFullName = user?.fullName || user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : "Ernazarov Og'abek"
  const userRole = user?.role || ''
  const userImage = user?.image || user?.profile_img || user?.avatar || null

  return (
    <header className="flex justify-between items-center h-16 px-6 bg-white shadow dark:bg-[#1a1a1a]">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <RiSidebarUnfoldFill className="text-2xl text-gray-700 dark:text-gray-300" />
        </button>
        
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
            {!mounted ? 'Loading...' : (token ? userFullName : 'Not logged in')}
          </span>

          {mounted && token && (
            <div className="flex items-center justify-end text-gray-500 dark:text-gray-400 text-xs">
              <UserOutlined className="mr-1" />
              <span>{userRole}</span>
            </div>
          )}
        </div>

        <Tooltip title="Profil">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl text-gray-700 dark:text-white overflow-hidden">
            {userImage ? (
              <img 
                src={userImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <UserOutlined />
            )}
          </div>
        </Tooltip>
      </div>
    </header>
  )
}

export default Navbar
