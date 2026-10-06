import { useState, useEffect } from 'react';
import { onSnapshot, Query } from 'firebase/firestore';
import { TrainingMaterial, MaterialStatus } from '../types/material';
import { materialService } from '../services/materialService';

interface UseMaterialsOptions {
  subjectId?: string;
  type?: string;
  status?: MaterialStatus | 'all';
  createdBy?: string;
  onlyPublished?: boolean;
}

export function useMaterials(options: UseMaterialsOptions = {}) {
  const [materials, setMaterials] = useState<TrainingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    let q: Query;

    if (options.onlyPublished) {
      q = materialService.getPublishedMaterials({
        subjectId: options.subjectId,
        type: options.type,
      });
    } else {
      q = materialService.getMaterials({
        subjectId: options.subjectId,
        type: options.type,
        status: options.status as MaterialStatus,
        createdBy: options.createdBy,
      });
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => doc.data() as TrainingMaterial);
        setMaterials(docs);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching materials:', err);
        setError('Gagal memuat materi pembinaan.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [
    options.subjectId,
    options.type,
    options.status,
    options.createdBy,
    options.onlyPublished,
  ]);

  return { materials, loading, error };
}
