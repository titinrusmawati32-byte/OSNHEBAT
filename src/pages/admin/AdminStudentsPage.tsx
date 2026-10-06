import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Input';
import { useToast } from '../../contexts/ToastContext';
import {
  getStudents,
  getTeachers,
  updateUserStatus,
  createUserProfile,
  checkUsernameExists,
  sanitizeUsername,
} from '../../services/userService';
import { UserProfile } from '../../types/auth';
import { GraduationCap, Plus, Search, ShieldCheck, ShieldAlert, Users, ToggleLeft, ToggleRight } from 'lucide-react';

export const AdminStudentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form state
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('siswa123');
  const [newClass, setNewClass] = useState('Kelas 5 SD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data siswa.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleStatus = async (student: UserProfile) => {
    const nextStatus = !student.isActive;
    try {
      await updateUserStatus(student.uid, nextStatus);
      setStudents((prev) =>
        prev.map((s) => (s.uid === student.uid ? { ...s, isActive: nextStatus } : s))
      );
      showToast(
        `Status siswa @${student.username} diubah menjadi ${nextStatus ? 'Aktif' : 'Nonaktif'}`,
        'success'
      );
    } catch (err) {
      showToast('Gagal mengubah status siswa.', 'error');
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeUsername(newUsername);
    if (!clean || !newName.trim()) {
      showToast('Harap isi nama dan username.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const exists = await checkUsernameExists(clean);
      if (exists) {
        showToast('Username tersebut sudah digunakan oleh pengguna lain.', 'error');
        setIsSubmitting(false);
        return;
      }

      const uid = `stu_${Date.now()}`;
      const newStudent: UserProfile = {
        uid,
        username: clean,
        displayName: newName.trim(),
        name: newName.trim(),
        role: 'student',
        className: newClass,
        grade: newClass,
        school: 'SD Mitra Prestasi',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createUserProfile(newStudent, newPassword || 'siswa123');
      showToast(`Siswa @${clean} berhasil didaftarkan!`, 'success');
      setIsModalOpen(false);
      setNewUsername('');
      setNewName('');
      setNewPassword('siswa123');
      fetchStudents();
    } catch (err) {
      console.error(err);
      showToast('Gagal mendaftarkan siswa.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = students.filter((s) => {
    if (!search.trim()) return true;
    return (
      s.displayName.toLowerCase().includes(search.toLowerCase()) ||
      s.username.toLowerCase().includes(search.toLowerCase()) ||
      s.className?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Data Siswa Olimpiade SD
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Daftar peserta pembinaan dan manajemen status akun aktif/nonaktif.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tambah Siswa
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
          Memuat daftar siswa...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
          Tidak ada data siswa ditemukan.
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table */}
          <div className="hidden sm:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 sm:px-6">Nama Siswa</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Status Akun</th>
                    <th className="py-3 px-4 text-right">Aksi Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((st) => (
                    <tr key={st.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 sm:px-6 font-bold text-slate-900 dark:text-slate-100">
                        {st.displayName}
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-400 font-semibold">
                        @{st.username}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {st.className || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            st.isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200'
                          }`}
                        >
                          {st.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(st)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            st.isActive
                              ? 'border-rose-200 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                        >
                          {st.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="sm:hidden space-y-3">
            {filtered.map((st) => (
              <div
                key={st.uid}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    {st.displayName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      st.isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200'
                    }`}
                  >
                    {st.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono text-blue-600 dark:text-blue-400">@{st.username}</span>
                  <span>{st.className || '-'}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(st)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer"
                  >
                    {st.isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal Tambah Siswa */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Akun Siswa Baru"
        description="Daftarkan akun peserta olimpiade dengan username unik"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4 text-left">
          <Input
            label="Nama Lengkap Siswa"
            placeholder="Contoh: Budi Pratama"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />

          <Input
            label="Username (Login)"
            placeholder="Contoh: siswa_budi (tanpa spasi)"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            helperText="Username harus unik dan digunakan siswa untuk masuk."
            required
          />

          <Input
            label="Password Awal"
            type="text"
            placeholder="Contoh: siswa123"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Password awal untuk siswa login (default: siswa123)."
            required
          />

          <Select
            label="Tingkat Kelas SD"
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
            options={[
              { value: 'Kelas 4 SD', label: 'Kelas 4 SD' },
              { value: 'Kelas 5 SD', label: 'Kelas 5 SD' },
              { value: 'Kelas 6 SD', label: 'Kelas 6 SD' },
            ]}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Simpan Siswa
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const AdminTeachersPage: React.FC = () => {
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('guru123');
  const [newSubject, setNewSubject] = useState<'ipa' | 'ips' | 'matematika' | 'bahasa_inggris'>('ipa');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data guru.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleToggleStatus = async (teacher: UserProfile) => {
    const nextStatus = !teacher.isActive;
    try {
      await updateUserStatus(teacher.uid, nextStatus);
      setTeachers((prev) =>
        prev.map((t) => (t.uid === teacher.uid ? { ...t, isActive: nextStatus } : t))
      );
      showToast(
        `Status guru @${teacher.username} diubah menjadi ${nextStatus ? 'Aktif' : 'Nonaktif'}`,
        'success'
      );
    } catch (err) {
      showToast('Gagal mengubah status guru.', 'error');
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeUsername(newUsername);
    if (!clean || !newName.trim()) {
      showToast('Harap isi nama dan username.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const exists = await checkUsernameExists(clean);
      if (exists) {
        showToast('Username tersebut sudah digunakan.', 'error');
        setIsSubmitting(false);
        return;
      }

      const uid = `tch_${Date.now()}`;
      const newTeacher: UserProfile = {
        uid,
        username: clean,
        displayName: newName.trim(),
        name: newName.trim(),
        role: 'teacher',
        subject: newSubject,
        school: 'SD Pelita Harapan',
        grade: 'Guru Pembina',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createUserProfile(newTeacher, newPassword || 'guru123');
      showToast(`Guru pembina @${clean} berhasil didaftarkan!`, 'success');
      setIsModalOpen(false);
      setNewUsername('');
      setNewName('');
      setNewPassword('guru123');
      fetchTeachers();
    } catch (err) {
      console.error(err);
      showToast('Gagal mendaftarkan guru.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Data Guru Pembina Olimpiade
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Daftar pembina bidang olimpiade dan hak akses sistem.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Tambah Guru
        </Button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
          Memuat data guru...
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
          {teachers.map((tc) => (
            <div key={tc.uid} className="py-3.5 flex items-center justify-between text-xs sm:text-sm">
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{tc.displayName}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Bidang:{' '}
                  <span className="font-semibold uppercase text-blue-600 dark:text-blue-400">
                    {tc.subject || 'Umum'}
                  </span>{' '}
                  • <span className="font-mono">@{tc.username}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    tc.isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200'
                  }`}
                >
                  {tc.isActive ? 'Aktif' : 'Nonaktif'}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(tc)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    tc.isActive
                      ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {tc.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Guru */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Akun Guru Pembina"
        description="Daftarkan akun pembina bidang olimpiade"
      >
        <form onSubmit={handleCreateTeacher} className="space-y-4 text-left">
          <Input
            label="Nama Lengkap Guru"
            placeholder="Contoh: Ibu Siti Rahmawati, S.Pd."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />

          <Input
            label="Username (Login)"
            placeholder="Contoh: guru_siti"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
          />

          <Input
            label="Password Awal"
            type="text"
            placeholder="Contoh: guru123"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Password awal untuk guru login (default: guru123)."
            required
          />

          <Select
            label="Bidang Binaan"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value as any)}
            options={[
              { value: 'ipa', label: 'IPA (Ilmu Pengetahuan Alam)' },
              { value: 'ips', label: 'IPS (Ilmu Pengetahuan Sosial)' },
              { value: 'matematika', label: 'Matematika' },
              { value: 'bahasa_inggris', label: 'Bahasa Inggris' },
            ]}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Simpan Guru
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
