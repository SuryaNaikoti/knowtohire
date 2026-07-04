import type { UserRole } from '../constants/roles';
export type { UserRole };

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  companyName?: string;
}

export interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}
