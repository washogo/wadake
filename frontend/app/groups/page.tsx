'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { useGroup } from '../providers/GroupProvider'
import { apiClient } from '../../utils/api'
import { GroupCreateModal, GroupInviteModal, GroupMemberCard } from '../../components/GroupComponents'

interface GroupMember {
  userId: string
  groupId: string
  role: string
  user: {
    id: string
    name: string
  }
}

interface GroupDetail {
  id: string
  name: string
  members: GroupMember[]
}

export default function GroupsPage() {
  const { user } = useAuth()
  const { groups, currentGroupId } = useGroup()
  const [currentGroup, setCurrentGroup] = useState<GroupDetail | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // 現在のグループ詳細を取得
  const loadGroupDetail = useCallback(async (groupId: string) => {
    setLoading(true)
    try {
      const membersResult = await apiClient.getGroupMembers(groupId)
      if (membersResult.data) {
        const group = groups.find(g => g.id === groupId)
        if (group) {
          setCurrentGroup({
            id: group.id,
            name: group.name,
            members: membersResult.data
          })
        }
      }
    } catch {
      setError('グループ詳細の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [groups])

  useEffect(() => {
    if (currentGroupId) {
      loadGroupDetail(currentGroupId)
    }
  }, [currentGroupId, loadGroupDetail])

  const handleCreateGroup = async (groupName: string) => {
    if (!user) return

    setLoading(true)
    setError('')
    try {
      const result = await apiClient.createGroup({
        name: groupName,
        userId: user.id
      })
      
      if (result.data) {
        setSuccessMessage('グループを作成しました')
        setIsCreateModalOpen(false)
        // グループ一覧を再読み込み
        window.location.reload()
      } else {
        setError(result.error || 'グループ作成に失敗しました')
      }
    } catch {
      setError('グループ作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async (userId: string, role: string) => {
    if (!currentGroupId) return

    setLoading(true)
    setError('')
    try {
      const result = await apiClient.inviteGroupMember(currentGroupId, {
        userId,
        role
      })
      
      if (result.data) {
        setSuccessMessage('メンバーを招待しました')
        setIsInviteModalOpen(false)
        // グループ詳細を再読み込み
        loadGroupDetail(currentGroupId)
      } else {
        setError(result.error || 'メンバー招待に失敗しました')
      }
    } catch {
      setError('メンバー招待に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getUserRole = (userId: string): string => {
    if (!currentGroup) return ''
    const member = currentGroup.members.find(m => m.userId === userId)
    return member?.role || ''
  }

  const isAdmin = user ? getUserRole(user.id) === 'admin' : false

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">グループ管理</h1>
        <p className="text-gray-600">グループの作成、メンバーの管理を行うことができます。</p>
      </div>

      {/* エラー・成功メッセージ */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600">{successMessage}</p>
        </div>
      )}

      {/* グループ作成セクション */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">新しいグループを作成</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            作成する
          </button>
        </div>
        <p className="text-gray-600">
          家族やチームでの家計簿共有を開始するために、新しいグループを作成できます。
        </p>
      </div>

      {/* 現在のグループ情報 */}
      {currentGroup && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentGroup.name} のメンバー管理
            </h2>
            {isAdmin && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                メンバー招待
              </button>
            )}
          </div>

          {/* メンバー一覧 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              メンバー ({currentGroup.members.length}人)
            </h3>
            <div className="space-y-3">
              {currentGroup.members.map((member) => (
                <GroupMemberCard
                  key={member.userId}
                  member={member}
                  currentUserId={user?.id || ''}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* グループが選択されていない場合 */}
      {!currentGroup && groups.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <p className="text-gray-600">管理するグループを選択してください。</p>
            <p className="text-sm text-gray-500 mt-2">
              ヘッダーのグループ切り替えドロップダウンからグループを選択できます。
            </p>
          </div>
        </div>
      )}

      {/* グループがない場合 */}
      {groups.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">まだグループに所属していません。</p>
            <p className="text-sm text-gray-500">
              上の「新しいグループを作成」からグループを作成するか、他のユーザーからの招待を受けてください。
            </p>
          </div>
        </div>
      )}

      {/* モーダル */}
      <GroupCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGroup}
        loading={loading}
      />

      <GroupInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInviteMember}
        loading={loading}
      />
    </div>
  )
}
