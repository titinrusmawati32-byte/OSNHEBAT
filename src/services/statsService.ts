import { 
  collection, 
  getDocs, 
  query, 
  where, 
  getCountFromServer 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalQuestions: number;
  totalExams: number;
  activeExams: number;
}

export interface TeacherStats {
  totalQuestions: number;
  totalExams: number;
  activeExams: number;
  totalParticipants: number;
}

export interface StudentStats {
  examsTaken: number;
  averageScore: number;
  highestScore: number;
  currentRank: number;
}

export const statsService = {
  getAdminStats: async (): Promise<AdminStats> => {
    try {
      console.log('Fetching admin stats...');
      
      const studentQuery = query(collection(db, 'users'), where('role', '==', 'student'));
      const teacherQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
      
      console.log('Counting students...');
      const studentCount = await getCountFromServer(studentQuery);
      
      console.log('Counting teachers...');
      const teacherCount = await getCountFromServer(teacherQuery);
      
      console.log('Counting questions...');
      const questionCount = await getCountFromServer(collection(db, 'questions'));
      
      console.log('Counting exams...');
      const examCount = await getCountFromServer(collection(db, 'exams'));
      
      console.log('Counting active exams...');
      const activeExamCount = await getCountFromServer(query(collection(db, 'exams'), where('status', '==', 'active')));

      console.log('Admin stats fetched successfully');
      return {
        totalStudents: studentCount.data().count,
        totalTeachers: teacherCount.data().count,
        totalQuestions: questionCount.data().count,
        totalExams: examCount.data().count,
        activeExams: activeExamCount.data().count,
      };
    } catch (error: any) {
      console.error('Failed to fetch admin stats detail:', error);
      // Log more specific info if available
      if (error.code) console.error('Firestore error code:', error.code);
      if (error.message) console.error('Firestore error message:', error.message);
      
      return {
        totalStudents: 0,
        totalTeachers: 0,
        totalQuestions: 0,
        totalExams: 0,
        activeExams: 0,
      };
    }
  },

  getTeacherStats: async (teacherId: string): Promise<TeacherStats> => {
    try {
      const questionCount = await getCountFromServer(query(collection(db, 'questions'), where('createdBy', '==', teacherId)));
      const examCount = await getCountFromServer(query(collection(db, 'exams'), where('createdBy', '==', teacherId)));
      const activeExamCount = await getCountFromServer(query(collection(db, 'exams'), where('createdBy', '==', teacherId), where('status', '==', 'active')));
      
      // For participants, we would ideally query the attempts collection for exams created by this teacher
      // For now, return 0 as attempts might not be fully linked yet
      const participantsCount = 0; 

      return {
        totalQuestions: questionCount.data().count,
        totalExams: examCount.data().count,
        activeExams: activeExamCount.data().count,
        totalParticipants: participantsCount,
      };
    } catch (error) {
      console.error('Failed to fetch teacher stats:', error);
      return {
        totalQuestions: 0,
        totalExams: 0,
        activeExams: 0,
        totalParticipants: 0,
      };
    }
  },

  getStudentStats: async (studentId: string): Promise<StudentStats> => {
    try {
      const attemptsSnap = await getDocs(query(collection(db, 'attempts'), where('studentId', '==', studentId), where('status', '==', 'completed')));
      const attempts = attemptsSnap.docs.map(d => d.data());
      
      const examsTaken = attempts.length;
      const totalScore = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
      const averageScore = examsTaken > 0 ? Math.round(totalScore / examsTaken) : 0;
      const highestScore = attempts.reduce((acc, curr) => Math.max(acc, curr.score || 0), 0);
      
      // Rank calculation is complex, return 0 for now or fetch from a leaderboard
      const currentRank = 0;

      return {
        examsTaken,
        averageScore,
        highestScore,
        currentRank,
      };
    } catch (error) {
      console.error('Failed to fetch student stats:', error);
      return {
        examsTaken: 0,
        averageScore: 0,
        highestScore: 0,
        currentRank: 0,
      };
    }
  }
};
