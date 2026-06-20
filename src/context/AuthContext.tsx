import React, { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  user: any;
  profile: any;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, user, profile }: { children: ReactNode, user: any, profile: any }) {
  const isAdmin = profile?.role === 'admin';
  
  return (
    <AuthContext.Provider value={{ user, profile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
