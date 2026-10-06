import { Timestamp } from 'firebase/firestore';

export type MaterialSubject = 'ipa' | 'ips' | 'matematika' | 'bahasa_inggris';
export type MaterialType = 'pdf' | 'youtube';
export type MaterialStatus = 'draft' | 'published' | 'archived';

export interface TrainingMaterial {
  id: string;
  title: string;
  description?: string;
  subjectId: MaterialSubject;
  gradeLevel?: string;
  topic?: string;
  type: MaterialType;
  status: MaterialStatus;

  // PDF specific
  fileName?: string;
  fileSize?: number;
  filePath?: string;
  fileUrl?: string;

  // YouTube specific
  youtubeUrl?: string;
  youtubeVideoId?: string;
  youtubeEmbedUrl?: string;

  createdBy: string;
  createdByName: string;

  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
  publishedAt?: Timestamp | any;
}
