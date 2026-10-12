import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/database';
import { initialUsers } from '../data/mockData';

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  allUsers: User[];
  deans: User[];
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  isAdmin: boolean;
  isDean: boolean;
  isLecturer: boolean;
  canApprove: boolean;
  canEditOperational: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  isDeanOfDepartment: (departmentDeanUserId?: string | null) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'apdo_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(() => {
    const saved = localStorage.getItem('apdo_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = [...parsed];
        for (const u of initialUsers) {
          if (!merged.some(m => m.id === u.id)) {
            merged.push(u);
          }
        }
        return merged;
      } catch {
        return initialUsers;
      }
    }
    return initialUsers;
  });
  
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (saved && initialUsers.some(u => u.id === saved)) {
      return saved;
    }
    return '1'; // Default to Dr. Sarah Sterling (ADMIN)
  });

  useEffect(() => {
    localStorage.setItem(AUTH_USER_KEY, currentUserId);
  }, [currentUserId]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const currentRole = currentUser.role;

  const deans = users.filter(u => u.role === 'DEAN' && u.is_active);

  const switchRole = (role: UserRole) => {
    // Find the first user with this role
    const matched = users.find(u => u.role === role);
    if (matched) {
      setCurrentUserId(matched.id);
    }
  };

  const switchUser = (userId: string) => {
    if (users.some(u => u.id === userId)) {
      setCurrentUserId(userId);
    }
  };

  const isAdmin = currentRole === 'ADMIN';
  const isDean = currentRole === 'DEAN';
  const isLecturer = currentRole === 'LECTURER';

  const canApprove = isAdmin || isDean;
  const canEditOperational = isAdmin || isDean;
  const canManageUsers = isAdmin;
  const canManageSettings = isAdmin;

  const isDeanOfDepartment = (departmentDeanUserId?: string | null) => {
    if (isAdmin) return true; // Administrator can oversee
    if (!departmentDeanUserId) return false;
    return currentUser.id === departmentDeanUserId;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        allUsers: users,
        deans,
        switchRole,
        switchUser,
        isAdmin,
        isDean,
        isLecturer,
        canApprove,
        canEditOperational,
        canManageUsers,
        canManageSettings,
        isDeanOfDepartment
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
