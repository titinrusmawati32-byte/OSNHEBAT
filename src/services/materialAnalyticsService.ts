import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TrainingMaterial } from '../types/material';

const MATERIALS_COL = 'materials';

export interface MaterialStats {
  total: number;
  pdfCount: number;
  youtubeCount: number;
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
}

export interface SubjectDistribution {
  subjectId: string;
  name: string;
  count: number;
}

export interface TypeDistribution {
  type: string;
  count: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface TeacherContribution {
  teacherId: string;
  teacherName: string;
  count: number;
}

export interface ActivityPoint {
  date: string;
  count: number;
}

export const materialAnalyticsService = {
  getMaterialStatistics: async (teacherId?: string): Promise<MaterialStats> => {
    try {
      let q = collection(db, MATERIALS_COL);
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => doc.data() as TrainingMaterial);

      const filtered = teacherId 
        ? docs.filter(d => d.createdBy === teacherId)
        : docs;

      let pdfCount = 0;
      let youtubeCount = 0;
      let publishedCount = 0;
      let draftCount = 0;
      let archivedCount = 0;

      filtered.forEach(m => {
        if (m.type === 'pdf') pdfCount++;
        if (m.type === 'youtube') youtubeCount++;
        if (m.status === 'published') publishedCount++;
        if (m.status === 'draft') draftCount++;
        if (m.status === 'archived') archivedCount++;
      });

      return {
        total: filtered.length,
        pdfCount,
        youtubeCount,
        publishedCount,
        draftCount,
        archivedCount,
      };
    } catch (error) {
      console.error('Failed to fetch material statistics:', error);
      return { total: 0, pdfCount: 0, youtubeCount: 0, publishedCount: 0, draftCount: 0, archivedCount: 0 };
    }
  },

  getMaterialsBySubject: async (teacherId?: string): Promise<SubjectDistribution[]> => {
    try {
      const snapshot = await getDocs(collection(db, MATERIALS_COL));
      const docs = snapshot.docs.map(doc => doc.data() as TrainingMaterial);
      const filtered = teacherId ? docs.filter(d => d.createdBy === teacherId) : docs;

      const map: Record<string, number> = {
        ipa: 0,
        ips: 0,
        matematika: 0,
        bahasa_inggris: 0,
      };

      filtered.forEach(m => {
        if (map[m.subjectId] !== undefined) {
          map[m.subjectId]++;
        } else {
          map[m.subjectId] = 1;
        }
      });

      const names: Record<string, string> = {
        ipa: 'IPA',
        ips: 'IPS',
        matematika: 'Matematika',
        bahasa_inggris: 'Bahasa Inggris',
      };

      return Object.entries(map).map(([subjectId, count]) => ({
        subjectId,
        name: names[subjectId] || subjectId.toUpperCase(),
        count,
      }));
    } catch (error) {
      console.error('Failed to get materials by subject:', error);
      return [];
    }
  },

  getMaterialsByType: async (teacherId?: string): Promise<TypeDistribution[]> => {
    try {
      const snapshot = await getDocs(collection(db, MATERIALS_COL));
      const docs = snapshot.docs.map(doc => doc.data() as TrainingMaterial);
      const filtered = teacherId ? docs.filter(d => d.createdBy === teacherId) : docs;

      let pdf = 0;
      let youtube = 0;

      filtered.forEach(m => {
        if (m.type === 'pdf') pdf++;
        if (m.type === 'youtube') youtube++;
      });

      return [
        { type: 'PDF', count: pdf },
        { type: 'YouTube', count: youtube },
      ];
    } catch (error) {
      console.error('Failed to get materials by type:', error);
      return [
        { type: 'PDF', count: 0 },
        { type: 'YouTube', count: 0 },
      ];
    }
  },

  getMaterialsByStatus: async (teacherId?: string): Promise<StatusDistribution[]> => {
    try {
      const snapshot = await getDocs(collection(db, MATERIALS_COL));
      const docs = snapshot.docs.map(doc => doc.data() as TrainingMaterial);
      const filtered = teacherId ? docs.filter(d => d.createdBy === teacherId) : docs;

      let published = 0;
      let draft = 0;
      let archived = 0;

      filtered.forEach(m => {
        if (m.status === 'published') published++;
        else if (m.status === 'draft') draft++;
        else if (m.status === 'archived') archived++;
      });

      return [
        { status: 'Published', count: published },
        { status: 'Draft', count: draft },
        { status: 'Archived', count: archived },
      ];
    } catch (error) {
      console.error('Failed to get materials by status:', error);
      return [];
    }
  },

  getMaterialsByTeacher: async (): Promise<TeacherContribution[]> => {
    try {
      const snapshot = await getDocs(collection(db, MATERIALS_COL));
      const docs = snapshot.docs.map(doc => doc.data() as TrainingMaterial);

      const map: Record<string, { name: string; count: number }> = {};

      docs.forEach(m => {
        const id = m.createdBy || 'unknown';
        const name = m.createdByName || 'Guru Pembina';
        if (!map[id]) {
          map[id] = { name, count: 0 };
        }
        map[id].count++;
      });

      return Object.entries(map).map(([teacherId, val]) => ({
        teacherId,
        teacherName: val.name,
        count: val.count,
      })).sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Failed to get teacher contributions:', error);
      return [];
    }
  },

  getMaterialActivity: async (teacherId?: string): Promise<ActivityPoint[]> => {
    try {
      const snapshot = await getDocs(collection(db, MATERIALS_COL));
      const docs = snapshot.docs.map(doc => doc.data() as TrainingMaterial);
      const filtered = teacherId ? docs.filter(d => d.createdBy === teacherId) : docs;

      const dateMap: Record<string, number> = {};

      filtered.forEach(m => {
        if (m.createdAt) {
          const date = m.createdAt instanceof Timestamp 
            ? m.createdAt.toDate().toISOString().split('T')[0]
            : new Date(m.createdAt).toISOString().split('T')[0];
          
          dateMap[date] = (dateMap[date] || 0) + 1;
        }
      });

      return Object.entries(dateMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-7); // Last 7 active days
    } catch (error) {
      console.error('Failed to get material activity:', error);
      return [];
    }
  }
};
