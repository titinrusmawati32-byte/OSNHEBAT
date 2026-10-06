import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TrainingMaterial, MaterialStatus } from '../types/material';
import { materialStorageService } from './materialStorageService';

const MATERIALS_COL = 'materials';

export const materialService = {
  /**
   * Create a new material document in Firestore
   */
  createMaterial: async (
    materialData: Omit<TrainingMaterial, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const docRef = doc(collection(db, MATERIALS_COL));
    const now = serverTimestamp();
    
    const payload = {
      ...materialData,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
      publishedAt: materialData.status === 'published' ? now : null,
    };

    await setDoc(docRef, payload);
    return docRef.id;
  },

  /**
   * Get all materials with optional filtering
   */
  getMaterials: (filters?: {
    subjectId?: string;
    type?: string;
    status?: MaterialStatus | 'all';
    createdBy?: string;
  }) => {
    let q = query(collection(db, MATERIALS_COL), orderBy('createdAt', 'desc'));

    if (filters?.subjectId && filters.subjectId !== 'all') {
      q = query(q, where('subjectId', '==', filters.subjectId));
    }
    if (filters?.type && filters.type !== 'all') {
      q = query(q, where('type', '==', filters.type));
    }
    if (filters?.status && filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters?.createdBy) {
      q = query(q, where('createdBy', '==', filters.createdBy));
    }

    return q;
  },

  /**
   * Get published materials (for students)
   */
  getPublishedMaterials: (filters?: {
    subjectId?: string;
    type?: string;
  }) => {
    let q = query(
      collection(db, MATERIALS_COL), 
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );

    if (filters?.subjectId && filters.subjectId !== 'all') {
      q = query(q, where('subjectId', '==', filters.subjectId));
    }
    if (filters?.type && filters.type !== 'all') {
      q = query(q, where('type', '==', filters.type));
    }

    return q;
  },

  /**
   * Get material by ID
   */
  getMaterialById: async (id: string): Promise<TrainingMaterial | null> => {
    const docRef = doc(db, MATERIALS_COL, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as TrainingMaterial;
    }
    return null;
  },

  /**
   * Update material document
   */
  updateMaterial: async (
    id: string,
    updates: Partial<TrainingMaterial>
  ): Promise<void> => {
    const docRef = doc(db, MATERIALS_COL, id);
    const now = serverTimestamp();
    
    const payload: any = {
      ...updates,
      updatedAt: now,
    };

    if (updates.status === 'published') {
      payload.publishedAt = now;
    }

    await updateDoc(docRef, payload);
  },

  /**
   * Delete material document and its associated file if any
   */
  deleteMaterial: async (material: TrainingMaterial): Promise<void> => {
    // 1. Delete file from Storage if it's a PDF
    if (material.type === 'pdf' && material.filePath) {
      await materialStorageService.deleteMaterialPdf(material.subjectId, material.id);
    }

    // 2. Delete document from Firestore
    const docRef = doc(db, MATERIALS_COL, material.id);
    await deleteDoc(docRef);
  },

  /**
   * Archive material
   */
  archiveMaterial: async (id: string): Promise<void> => {
    await materialService.updateMaterial(id, { status: 'archived' });
  },

  /**
   * Publish material
   */
  publishMaterial: async (id: string): Promise<void> => {
    await materialService.updateMaterial(id, { status: 'published' });
  }
};
