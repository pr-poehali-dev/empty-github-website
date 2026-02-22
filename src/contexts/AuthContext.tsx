import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, UserActivity, ChatMessage, Purchase, Application } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'fitness_app_data';

interface AppData {
  users: User[];
  chatMessages: ChatMessage[];
  purchases: Purchase[];
  applications: Application[];
  userActivities: UserActivity[];
}

const getStoredData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  const initialData: AppData = {
    users: [
      {
        id: 'director-1',
        email: 'dima260208@bk.ru',
        password: 'Sempay666',
        name: 'Дмитрий Болотин',
        role: 'director',
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true
      },
    ],
    chatMessages: [],
    purchases: [],
    applications: [],
    userActivities: []
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
};

const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const data = getStoredData();
    const foundUser = data.users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const updatedUser = { ...foundUser, lastActivity: new Date() };
      const updatedUsers = data.users.map(u => u.id === foundUser.id ? updatedUser : u);
      saveData({ ...data, users: updatedUsers });
      
      localStorage.setItem('current_user', JSON.stringify(updatedUser));
      localStorage.setItem('current_user_id', updatedUser.id);
      setUser(updatedUser);
      
      const activity: UserActivity = {
        id: Date.now().toString(),
        userId: foundUser.id,
        action: 'login',
        details: `Вход в систему: ${email}`,
        timestamp: new Date()
      };
      saveData({ ...data, users: updatedUsers, userActivities: [...data.userActivities, activity] });
      
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string, age?: number): Promise<boolean> => {
    const data = getStoredData();
    const exists = data.users.find(u => u.email === email);
    
    if (exists) return false;
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      role: 'client',
      age,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true
    };
    
    const updatedData = { ...data, users: [...data.users, newUser] };
    saveData(updatedData);
    localStorage.setItem('current_user', JSON.stringify(newUser));
    localStorage.setItem('current_user_id', newUser.id);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('current_user');
    localStorage.removeItem('current_user_id');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
