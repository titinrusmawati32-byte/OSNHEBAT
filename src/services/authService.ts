import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  getUserByUsername,
  getUserProfile,
  createUserProfile,
  sanitizeUsername,
  hashPassword,
} from './userService';
import { UserProfile } from '../types/auth';

const INTERNAL_DOMAIN = 'olympiad.cbt.internal';
export const SESSION_STORAGE_KEY = 'olympiad_cbt_session';

// Helper to convert username to internal email for Firebase Auth
export function usernameToInternalEmail(username: string): string {
  const clean = sanitizeUsername(username);
  return `${clean}@${INTERNAL_DOMAIN}`;
}

// User-friendly error message translator
function mapAuthErrorToMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Username atau password salah.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan masuk. Silakan tunggu beberapa saat sebelum mencoba lagi.';
    case 'auth/network-request-failed':
      return 'Terjadi masalah koneksi internet. Silakan periksa jaringan Anda.';
    case 'auth/user-disabled':
      return 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.';
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return 'Autentikasi Firestore aktif.';
    default:
      return 'Terjadi kesalahan sistem saat mencoba masuk. Silakan coba lagi.';
  }
}

// Core login with username and password
export async function loginWithUsername(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: FirebaseUser; profile?: UserProfile; error?: string }> {
  const clean = sanitizeUsername(usernameInput);

  if (!clean || !passwordInput) {
    return { success: false, error: 'Harap isi username dan password.' };
  }

  try {
    // 1. Check if user profile exists in Firestore
    const existingProfile = await getUserByUsername(clean);
    if (!existingProfile) {
      return { success: false, error: 'Username atau password salah.' };
    }

    // 2. Check if account is active before proceeding
    if (!existingProfile.isActive) {
      return {
        success: false,
        error: 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.',
      };
    }

    // 3. Verify password via secure SHA-256 hash
    const inputHash = await hashPassword(passwordInput);
    if (existingProfile.passwordHash) {
      if (existingProfile.passwordHash !== inputHash) {
        return { success: false, error: 'Username atau password salah.' };
      }
    } else {
      // Legacy fallback for initial unhashed accounts
      const defaultPass =
        clean === 'admin'
          ? 'admin123'
          : clean.startsWith('guru')
          ? 'guru123'
          : 'siswa123';
      if (
        passwordInput !== defaultPass &&
        passwordInput !== 'admin123' &&
        passwordInput !== 'guru123' &&
        passwordInput !== 'siswa123'
      ) {
        return { success: false, error: 'Username atau password salah.' };
      }
      // Upgrade to hashed password
      existingProfile.passwordHash = inputHash;
      await createUserProfile(existingProfile);
    }

    // 4. Attempt optional Firebase Auth session (swallows admin-restricted-operation safely)
    let firebaseUser: FirebaseUser | undefined = undefined;
    try {
      const internalEmail = usernameToInternalEmail(clean);
      const userCredential = await signInWithEmailAndPassword(auth, internalEmail, passwordInput);
      firebaseUser = userCredential.user;
    } catch (authErr: any) {
      // If user not in Firebase Auth, attempt create
      if (
        authErr?.code === 'auth/user-not-found' ||
        authErr?.code === 'auth/invalid-credential'
      ) {
        try {
          const internalEmail = usernameToInternalEmail(clean);
          const cred = await createUserWithEmailAndPassword(auth, internalEmail, passwordInput);
          firebaseUser = cred.user;
        } catch {
          // Gracefully continue with Firestore verified session
        }
      }
      // Ignore admin-restricted-operation or operation-not-allowed
    }

    // 5. Save local persistent session
    try {
      const sessionData = {
        uid: existingProfile.uid,
        username: existingProfile.username,
        role: existingProfile.role,
        timestamp: Date.now(),
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (err) {
      console.warn('LocalStorage session note:', err);
    }

    return {
      success: true,
      user: firebaseUser,
      profile: existingProfile,
    };
  } catch (err: any) {
    console.error('Login process error:', err);
    return {
      success: false,
      error: 'Terjadi masalah koneksi atau konfigurasi. Silakan coba lagi.',
    };
  }
}

// Logout session
export async function logoutUser(): Promise<void> {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
}
