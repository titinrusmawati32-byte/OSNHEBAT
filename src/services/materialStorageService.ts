import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from '../lib/firebase';

export interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
  downloadUrl?: string;
}

export const materialStorageService = {
  /**
   * Uploads a PDF to Firebase Storage
   * Path: materials/{subjectId}/{materialId}/document.pdf
   */
  uploadMaterialPdf: (
    subjectId: string,
    materialId: string,
    file: File,
    onProgress: (progress: number) => void
  ) => {
    return new Promise<string>((resolve, reject) => {
      const storageRef = ref(storage, `materials/${subjectId}/${materialId}/document.pdf`);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: 'application/pdf',
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          console.error('Storage upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  },

  /**
   * Deletes a PDF from Firebase Storage
   */
  deleteMaterialPdf: async (subjectId: string, materialId: string) => {
    const storageRef = ref(storage, `materials/${subjectId}/${materialId}/document.pdf`);
    try {
      await deleteObject(storageRef);
    } catch (error: any) {
      // Ignore if file doesn't exist
      if (error.code !== 'storage/object-not-found') {
        console.error('Storage delete error:', error);
        throw error;
      }
    }
  },

  /**
   * Gets the download URL for a file path
   */
  getMaterialDownloadUrl: async (path: string) => {
    const storageRef = ref(storage, path);
    return getDownloadURL(storageRef);
  }
};
