'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(true)

  const toggleSidebar = (): void => {
    setIsOpen(!isOpen)
  }

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isOpen: true,
      toggleSidebar: () => {}
    };
  }
  return context;
}
