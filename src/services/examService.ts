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
    const q = query(collection(db, EXAMS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamPackage));
  },

  async getExamsByTeacher(teacherId: string) {
    const q = query(
      collection(db, EXAMS_COLLECTION), 
      where('createdBy', '==', teacherId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamPackage));
  },

  async getActiveExams() {
    const q = query(
      collection(db, EXAMS_COLLECTION),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamPackage));
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
    const docRef = await addDoc(collection(db, EXAMS_COLLECTION), {
      ...examData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async updateExam(id: string, examData: Partial<ExamPackage>) {
    const docRef = doc(db, EXAMS_COLLECTION, id);
    await updateDoc(docRef, {
      ...examData,
      updatedAt: serverTimestamp()
    });
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
