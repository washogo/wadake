'use client';

import { useState } from 'react';

interface GroupMember {
  userId: string;
  groupId: string;
  role: string;
  user: {
    id: string;
    name: string;
  };
}

interface GroupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (groupName: string) => void;
  loading: boolean;
}

export function GroupCreateModal({ isOpen, onClose, onSubmit, loading }: GroupCreateModalProps) {
  const [groupName, setGroupName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim()) {
      onSubmit(groupName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">新しいグループを作成</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
              グループ名
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 text-black"
              placeholder="家族、チーム名など"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!groupName.trim() || loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface GroupInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string, role: string) => void;
  loading: boolean;
}

export function GroupInviteModal({ isOpen, onClose, onSubmit, loading }: GroupInviteModalProps) {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('member');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      onSubmit(userId.trim(), role);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">メンバーを招待</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
              ユーザーID
            </label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black"
              placeholder="招待するユーザーのID"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              役割
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black"
            >
              <option value="member">メンバー</option>
              <option value="admin">管理者</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!userId.trim() || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '招待中...' : '招待'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface GroupMemberCardProps {
  member: GroupMember;
  currentUserId: string;
}

export function GroupMemberCard({ member, currentUserId }: GroupMemberCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-green-600 font-semibold">{member.user.name.charAt(0)}</span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{member.user.name}</p>
          <p className="text-sm text-gray-500">ID: {member.userId}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}
        >
          {member.role === 'admin' ? '管理者' : 'メンバー'}
        </span>
        {member.userId === currentUserId && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">あなた</span>
        )}
      </div>
    </div>
  );
}
