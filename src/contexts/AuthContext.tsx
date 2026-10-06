import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  loginWithUsername,
  logoutUser,
  SESSION_STORAGE_KEY,
} from '../services/authService';
import {
  getUserProfile,
} from '../services/userService';
import { UserProfile, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load profile for a given UID
  const fetchAndSetProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const p = await getUserProfile(uid);
      if (p) {
        if (!p.isActive) {
          console.warn('Account is inactive. Signing out.');
          await logoutUser();
          setUser(null);
          setProfile(null);
          return null;
        }
        setProfile(p);
        return p;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      // 1. Check local persistent session
      const savedSessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSessionRaw) {
        try {
          const session = JSON.parse(savedSessionRaw);
          if (session?.uid) {
            const p = await getUserProfile(session.uid);
            if (p && p.isActive && isMounted) {
              setProfile(p);
            } else if (p && !p.isActive) {
              localStorage.removeItem(SESSION_STORAGE_KEY);
            }
          }
        } catch (e) {
          console.warn('Session parse note:', e);
        }
      }

      // 2. Setup Firebase Auth state listener
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log('Firebase Auth State Changed:', firebaseUser ? `User: ${firebaseUser.uid}` : 'Logged Out');
        if (!isMounted) return;

        if (firebaseUser) {
          setUser(firebaseUser);
          await fetchAndSetProfile(firebaseUser.uid);
        } else {
          setUser(null);
        }

        if (isMounted) {
          setLoading(false);
        }
      });

      if (isMounted) {
        setLoading(false);
      }

      return () => {
        unsubscribe();
      };
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (usernameInput: string, passwordInput: string) => {
    setLoading(true);
    try {
      const res = await loginWithUsername(usernameInput, passwordInput);
      if (res.success && res.profile) {
        if (res.user) {
          setUser(res.user);
        }
        setProfile(res.profile);
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, error: res.error || 'Login gagal.' };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error.message || 'Terjadi kesalahan sistem.' };
    }
  };

  const logout = async () => {
    setLoading(true);
    await logoutUser();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const refreshProfile = async (): Promise<UserProfile | null> => {
    const activeUid = profile?.uid || user?.uid;
    if (activeUid) {
      return await fetchAndSetProfile(activeUid);
    }
    return null;
  };

  // Helper object for convenient access across pages
  const currentUser = profile
    ? {
        ...profile,
        name: profile.displayName || profile.name || profile.username,
        grade: profile.className || profile.grade || 'Kelas 5 SD',
        school: profile.school || 'SD Mitra Prestasi',
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        currentUser,
        loading,
        isAuthenticated: !!profile && profile.isActive,
        login,
        logout,
        refreshProfile,
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
