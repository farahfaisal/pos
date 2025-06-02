import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '../types/User';

// Sample admin user for demonstration
const ADMIN_USER: User = {
  id: '1',
  name: 'مدير النظام',
  email: 'admin@example.com',
  role: UserRole.ADMIN,
};

// Sample cashier user for demonstration
const CASHIER_USER: User = {
  id: '2',
  name: 'أمين الصندوق',
  email: 'cashier@example.com',
  role: UserRole.CASHIER,
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCashier: boolean;
  canManageCashDrawer: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
  isCashier: false,
  canManageCashDrawer: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Check if user is logged in from localStorage on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('pos_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  
  // Mock authentication functionality
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo purposes, we'll accept any non-empty password
    if (!email || !password) return false;
    
    // Mock users for demonstration
    if (email === 'admin@example.com' && password === 'admin123') {
      setUser(ADMIN_USER);
      localStorage.setItem('pos_user', JSON.stringify(ADMIN_USER));
      return true;
    } else if (email === 'cashier@example.com' && password === 'cashier123') {
      setUser(CASHIER_USER);
      localStorage.setItem('pos_user', JSON.stringify(CASHIER_USER));
      return true;
    }
    
    return false;
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('pos_user');
  };
  
  const isAuthenticated = user !== null;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isCashier = user?.role === UserRole.CASHIER;
  const canManageCashDrawer = isAdmin || isCashier;
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      isAdmin,
      isCashier,
      canManageCashDrawer
    }}>
      {children}
    </AuthContext.Provider>
  );
};