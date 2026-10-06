export interface Subject {
  id: string;
  name: string;
  code: string;
  color: 'emerald' | 'orange' | 'violet' | 'blue';
  description: string;
  icon: string;
  examCount: number;
}

export const APP_SUBJECTS: Subject[] = [
  {
    id: 'ipa',
    name: 'IPA',
    code: 'OSN-IPA',
    color: 'emerald',
    description: 'Ilmu Pengetahuan Alam, Biologi & Sains Eksperimen SD',
    icon: 'Atom',
    examCount: 0,
  },
  {
    id: 'ips',
    name: 'IPS',
    code: 'OSN-IPS',
    color: 'orange',
    description: 'Ilmu Pengetahuan Sosial, Geografi & Budaya Nusantara',
    icon: 'Globe',
    examCount: 0,
  },
  {
    id: 'matematika',
    name: 'MATEMATIKA',
    code: 'OSN-MTK',
    color: 'violet',
    description: 'Aritmetika, Penalaran Spasial & Logika Kuantitatif',
    icon: 'Calculator',
    examCount: 0,
  },
  {
    id: 'bahasa_inggris',
    name: 'BAHASA INGGRIS',
    code: 'ENG-OLY',
    color: 'blue',
    description: 'English Literacy, Reading Comprehension & Grammar',
    icon: 'BookOpen',
    examCount: 0,
  },
];
