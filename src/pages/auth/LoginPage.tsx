import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Award,
  User,
  Lock,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  BookOpen,
  Atom,
  Globe,
  Calculator,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, profile } = useAuth();
  const { showToast } = useToast();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Harap masukkan username Anda.');
      return;
    }

    if (!password) {
      setErrorMessage('Harap masukkan password Anda.');
      return;
    }

    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);

    if (result.success) {
      showToast('Berhasil masuk ke sistem!', 'success');
      // Redirect happens via route state or will be handled when profile loads
    } else {
      setErrorMessage(result.error || 'Login gagal.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center transition-colors relative selection:bg-blue-100">
      {/* Absolute Theme Toggle at top right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'Mode terang' : 'Mode gelap'}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Branding & Academic Information (Desktop only) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform CBT Pembinaan Prestasi SD</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                  <Award className="w-7 h-7" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  OLYMPIAD CBT
                </h1>
              </div>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
                Sistem Ujian Pembinaan Olimpiade
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
              Solusi ujian berbasis komputer modern yang dirancang khusus untuk simulasi pembinaan olimpiade tingkat Sekolah Dasar (SD) secara terstruktur, terukur, dan profesional.
            </p>

            {/* 4 Subjects Mini Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs">
                <Atom className="w-4 h-4 text-emerald-600 mb-1" />
                <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">IPA</div>
                <div className="text-[10px] text-slate-400">Sains SD</div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-800/80 shadow-2xs">
                <Globe className="w-4 h-4 text-orange-600 mb-1" />
                <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">IPS</div>
                <div className="text-[10px] text-slate-400">Sosial SD</div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-800/80 shadow-2xs">
                <Calculator className="w-4 h-4 text-violet-600 mb-1" />
                <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Matematika</div>
                <div className="text-[10px] text-slate-400">Aritmetika SD</div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/80 shadow-2xs">
                <BookOpen className="w-4 h-4 text-blue-600 mb-1" />
                <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">B. Inggris</div>
                <div className="text-[10px] text-slate-400">Literasi SD</div>
              </div>
            </div>
          </div>

          {/* Right: Login Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="mb-6 text-left">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Masuk ke Sistem
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Gunakan username dan password yang diberikan sekolah/panitia.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Username"
                  placeholder="Masukkan username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Ingat saya</span>
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      showToast('Silakan hubungi administrator sekolah untuk reset password.', 'info')
                    }
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Lupa password?
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full mt-2"
                  disabled={isLoading}
                  isLoading={isLoading}
                  rightIcon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
                >
                  {isLoading ? 'MASUK...' : 'MASUK'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
