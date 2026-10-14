import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ExamPackage, ExamStatus } from '../types/exam';

const EXAMS_COLLECTION = 'exams';

export const examService = {
  async getAllExams() {
    const q = collection(db, EXAMS_COLLECTION);
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamPackage));
    return list.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeB - timeA;
    });
  },

  async getExamsByTeacher(teacherId: string) {
    const q = query(
      collection(db, EXAMS_COLLECTION), 
      where('createdBy', '==', teacherId)
    );
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamPackage));
    return list.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeB - timeA;
    });
  },

  async getActiveExams() {
    const q = query(
      collection(db, EXAMS_COLLECTION),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamPackage));
    return list.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeB - timeA;
    });
  },

  async getExamById(id: string) {
    const docRef = doc(db, EXAMS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ExamPackage;
    }
    return null;
  },

  async createExam(examData: Omit<ExamPackage, 'id' | 'createdAt' | 'updatedAt'>) {
    const cleanData: any = {};
    for (const [key, value] of Object.entries(examData)) {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    }

    const docRef = await addDoc(collection(db, EXAMS_COLLECTION), {
      ...cleanData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async updateExam(id: string, examData: Partial<ExamPackage>) {
    const docRef = doc(db, EXAMS_COLLECTION, id);
    const cleanData: any = {
      updatedAt: serverTimestamp()
    };
    for (const [key, value] of Object.entries(examData)) {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    }
    await updateDoc(docRef, cleanData);
  },

  async deleteExam(id: string) {
    const docRef = doc(db, EXAMS_COLLECTION, id);
    await deleteDoc(docRef);
  },

  async updateStatus(id: string, status: ExamStatus) {
    const docRef = doc(db, EXAMS_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  }
};
