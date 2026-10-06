import { User as FirebaseUser } from 'firebase/auth';

export type UserRole = 'admin' | 'teacher' | 'student';

export type SubjectType = 'ipa' | 'ips' | 'matematika' | 'bahasa_inggris';

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  name?: string;
  role: UserRole;
  subject?: SubjectType;
  className?: string;
  grade?: string;
  school?: string;
  photoURL?: string;
  isActive: boolean;
  passwordHash?: string;
  createdAt: any;
  updatedAt: any;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  currentUser: (UserProfile & { name: string; grade: string; school: string }) | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
}

export interface UsernameMapping {
  uid: string;
  username: string;
  createdAt: any;
}
