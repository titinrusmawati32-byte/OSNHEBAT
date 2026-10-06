import { useState, useEffect } from 'react';
import { 
  materialAnalyticsService, 
  MaterialStats, 
  SubjectDistribution, 
  TypeDistribution, 
  StatusDistribution, 
  TeacherContribution, 
  ActivityPoint 
} from '../services/materialAnalyticsService';

export function useMaterialAnalytics(teacherId?: string) {
  const [stats, setStats] = useState<MaterialStats>({
    total: 0,
    pdfCount: 0,
    youtubeCount: 0,
    publishedCount: 0,
    draftCount: 0,
    archivedCount: 0,
  });
  const [bySubject, setBySubject] = useState<SubjectDistribution[]>([]);
  const [byType, setByType] = useState<TypeDistribution[]>([]);
  const [byStatus, setByStatus] = useState<StatusDistribution[]>([]);
  const [teachers, setTeachers] = useState<TeacherContribution[]>([]);
  const [activity, setActivity] = useState<ActivityPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [s, sub, typ, stat, tList, act] = await Promise.all([
          materialAnalyticsService.getMaterialStatistics(teacherId),
          materialAnalyticsService.getMaterialsBySubject(teacherId),
          materialAnalyticsService.getMaterialsByType(teacherId),
          materialAnalyticsService.getMaterialsByStatus(teacherId),
          materialAnalyticsService.getMaterialsByTeacher(),
          materialAnalyticsService.getMaterialActivity(teacherId),
        ]);

        if (isMounted) {
          setStats(s);
          setBySubject(sub);
          setByType(typ);
          setByStatus(stat);
          setTeachers(tList);
          setActivity(act);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error loading material analytics:', err);
          setError('Gagal memuat analitik materi.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [teacherId]);

  return {
    stats,
    bySubject,
    byType,
    byStatus,
    teachers,
    activity,
    loading,
    error,
  };
}
