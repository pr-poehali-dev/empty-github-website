export type UserRole = 'client' | 'admin' | 'director';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  age?: number;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  response: string;
  timestamp: Date;
}

export interface Purchase {
  id: string;
  userId: string;
  program: string;
  amount: number;
  date: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Application {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  program: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, age?: number) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date;
}
