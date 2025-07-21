'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../../utils/api';
import { useAuth } from './AuthProvider';

interface Group {
  id: string;
  name: string;
}

interface GroupContextType {
  groups: Group[];
  currentGroupId: string | null;
  setCurrentGroupId: (id: string) => void;
  isLoading: boolean;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user && !isInitialized) {
      apiClient.getGroups(user.id).then((res) => {
        setGroups(res.data || []);
        if (!currentGroupId && res.data && res.data.length > 0) {
          setCurrentGroupId(res.data[0].id);
        }
        setIsInitialized(true);
      });
    } else if (!user && !authLoading) {
      // ユーザーがいない場合（ログアウト状態）も初期化完了とする
      setIsInitialized(true);
    }
  }, [user, authLoading, isInitialized, currentGroupId]);

  // 初期化が完了していない場合はローディング状態
  const isLoading = authLoading || !isInitialized;

  return (
    <GroupContext.Provider value={{ groups, currentGroupId, setCurrentGroupId, isLoading }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
}
