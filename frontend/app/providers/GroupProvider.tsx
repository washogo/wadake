'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { apiClient } from '../../utils/api'
import { useAuth } from './AuthProvider'

interface Group {
  id: string
  name: string
}

interface GroupContextType {
  groups: Group[]
  currentGroupId: string | null
  setCurrentGroupId: (id: string) => void
}

const GroupContext = createContext<GroupContextType | undefined>(undefined)

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      apiClient.getGroups(user.id).then((res) => {
        setGroups(res.data || [])
        if (!currentGroupId && res.data && res.data.length > 0) {
          setCurrentGroupId(res.data[0].id)
        }
      })
    }
  }, [user])

  return (
    <GroupContext.Provider value={{ groups, currentGroupId, setCurrentGroupId }}>
      {children}
    </GroupContext.Provider>
  )
}

export function useGroup() {
  const context = useContext(GroupContext)
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider')
  }
  return context
} 