import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, UserRole, SubjectType } from '../types/auth';

const USERS_COL = 'users';
const USERNAMES_COL = 'usernames';

// Helper to normalize username (lowercase, trim, alphanumeric with underscore)
export function sanitizeUsername(username: string): string {
  return username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
}

// Secure client-side password hasher for offline & firestore auth resilience
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`olympiad_sd_salt_${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Convert Firestore doc to UserProfile
function docToProfile(docData: any, uid: string): UserProfile {
  const displayName = docData.displayName || docData.name || docData.username || '';
  const className = docData.className || docData.grade || 'Kelas 5 SD';
  const school = docData.school || 'SD Mitra Prestasi';

  return {
    uid,
    username: docData.username || '',
    displayName,
    name: displayName,
    role: docData.role || 'student',
    subject: docData.subject,
    className,
    grade: className,
    school,
    photoURL: docData.photoURL || docData.avatar,
    isActive: docData.isActive !== false,
    passwordHash: docData.passwordHash || '',
    createdAt: docData.createdAt || null,
    updatedAt: docData.updatedAt || null,
  };
}

// Get user profile by UID
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, USERS_COL, uid));
    if (snap.exists()) {
      return docToProfile(snap.data(), snap.id);
    }
    return null;
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
}

// Check if username already exists in usernames collection
export async function checkUsernameExists(username: string): Promise<boolean> {
  const clean = sanitizeUsername(username);
  try {
    const snap = await getDoc(doc(db, USERNAMES_COL, clean));
    return snap.exists();
  } catch (error) {
    console.error('Failed to check username:', error);
    return false;
  }
}

// Get user profile by username
export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  const clean = sanitizeUsername(username);
  try {
    // 1. Try lookup via usernames mapping collection
    const mappingSnap = await getDoc(doc(db, USERNAMES_COL, clean));
    if (mappingSnap.exists()) {
      const { uid } = mappingSnap.data();
      if (uid) {
        return await getUserProfile(uid);
      }
    }

    // 2. Fallback query on users collection
    const q = query(collection(db, USERS_COL), where('username', '==', clean));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const docSnap = querySnap.docs[0];
      return docToProfile(docSnap.data(), docSnap.id);
    }

    return null;
  } catch (error) {
    console.error('Failed to get user by username:', error);
    return null;
  }
}

// Create or save user profile in Firestore
export async function createUserProfile(
  profile: UserProfile,
  plainPassword?: string
): Promise<void> {
  const cleanUser = sanitizeUsername(profile.username);
  const now = serverTimestamp();

  // If plainPassword provided or profile already has passwordHash
  let pwdHash = profile.passwordHash || '';
  if (plainPassword) {
    pwdHash = await hashPassword(plainPassword);
  }

  // 1. Save to users collection
  await setDoc(
    doc(db, USERS_COL, profile.uid),
    {
      uid: profile.uid,
      username: cleanUser,
      displayName: profile.displayName || profile.name || cleanUser,
      name: profile.displayName || profile.name || cleanUser,
      role: profile.role,
      subject: profile.subject || null,
      className: profile.className || profile.grade || 'Kelas 5 SD',
      grade: profile.className || profile.grade || 'Kelas 5 SD',
      school: profile.school || 'SD Mitra Prestasi',
      photoURL: profile.photoURL || null,
      isActive: profile.isActive ?? true,
      ...(pwdHash ? { passwordHash: pwdHash } : {}),
      createdAt: profile.createdAt || now,
      updatedAt: now,
    },
    { merge: true }
  );

  // 2. Claim unique username in usernames mapping collection
  await setDoc(
    doc(db, USERNAMES_COL, cleanUser),
    {
      uid: profile.uid,
      username: cleanUser,
      createdAt: now,
    },
    { merge: true }
  );
}

// Get all users, optionally filtered by role
export async function getUsers(role?: UserRole): Promise<UserProfile[]> {
  try {
    let q;
    if (role) {
      q = query(collection(db, USERS_COL), where('role', '==', role));
    } else {
      q = collection(db, USERS_COL);
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToProfile(d.data(), d.id));
  } catch (error) {
    console.error('Failed to get users:', error);
    return [];
  }
}

// Specific helper: Get all students
export async function getStudents(): Promise<UserProfile[]> {
  return getUsers('student');
}

// Specific helper: Get all teachers
export async function getTeachers(): Promise<UserProfile[]> {
  return getUsers('teacher');
}

// Update user active status (activate / deactivate)
export async function updateUserStatus(uid: string, isActive: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, USERS_COL, uid), {
      isActive,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to update user status:', error);
    throw error;
  }
}
