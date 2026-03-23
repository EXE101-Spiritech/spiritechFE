import React, { createContext, useContext, useState, useCallback } from 'react';

interface User {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, phone: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Mock login
    await new Promise(r => setTimeout(r, 800));
    setUser({ name: 'Nguyễn Văn A', email, phone: '0912345678', address: '123 Nguyễn Trãi, Phường 2, Quận 5, TP. Hồ Chí Minh' });
    return true;
  }, []);

  const register = useCallback(async (name: string, phone: string, email: string, _password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    setUser({ name, email, phone, address: '' });
    return true;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}