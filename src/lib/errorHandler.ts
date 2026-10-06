import { FirebaseError } from 'firebase/app';

export interface NormalizedError {
  type: string;
  message: string;
  userMessage: string;
  code?: string;
  stack?: string;
  component?: string;
  route?: string;
  timestamp: string;
}

export function normalizeError(error: unknown, componentName = 'UnknownComponent'): NormalizedError {
  const timestamp = new Date().toISOString();
  const route = window.location.pathname;

  if (error instanceof FirebaseError) {
    let userMessage = 'Terjadi kesalahan pada server Firebase.';
    switch (error.code) {
      case 'permission-denied':
        userMessage = 'Anda tidak memiliki izin untuk melakukan tindakan ini.';
        break;
      case 'unauthenticated':
        userMessage = 'Sesi login Anda telah berakhir. Silakan login kembali.';
        break;
      case 'not-found':
        userMessage = 'Data yang diminta tidak ditemukan.';
        break;
      case 'unavailable':
        userMessage = 'Layanan sedang tidak tersedia. Silakan periksa koneksi internet Anda.';
        break;
      case 'failed-precondition':
        userMessage = 'Operasi gagal karena kondisi sistem belum terpenuhi.';
        break;
      case 'deadline-exceeded':
        userMessage = 'Waktu permintaan habis. Silakan coba lagi.';
        break;
      case 'resource-exhausted':
        userMessage = 'Batas kuota atau sumber daya tercapai.';
        break;
      case 'already-exists':
        userMessage = 'Data sudah ada dalam sistem.';
        break;
      case 'invalid-argument':
        userMessage = 'Argumen atau data yang diberikan tidak valid.';
        break;
      case 'network-request-failed':
        userMessage = 'Koneksi ke server gagal. Periksa koneksi internet Anda.';
        break;
      default:
        userMessage = error.message || 'Terjadi kesalahan pada database.';
    }

    return {
      type: 'FirebaseError',
      message: error.message,
      userMessage,
      code: error.code,
      stack: error.stack,
      component: componentName,
      route,
      timestamp,
    };
  }

  if (error instanceof Error) {
    return {
      type: error.name || 'Error',
      message: error.message,
      userMessage: getUserFriendlyMessage(error.message),
      stack: error.stack,
      component: componentName,
      route,
      timestamp,
    };
  }

  return {
    type: 'UnknownError',
    message: String(error),
    userMessage: 'Terjadi kendala yang tidak diketahui pada sistem.',
    component: componentName,
    route,
    timestamp,
  };
}

function getUserFriendlyMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('connection')) {
    return 'Koneksi ke server sedang bermasalah. Periksa koneksi internet dan coba lagi.';
  }
  if (lower.includes('permission') || lower.includes('unauthorized')) {
    return 'Anda tidak memiliki izin untuk mengakses data ini.';
  }
  if (lower.includes('not found') || lower.includes('undefined')) {
    return 'Data yang diminta tidak tersedia.';
  }
  return message || 'Terjadi kesalahan saat memproses permintaan Anda.';
}

export function logError(error: NormalizedError) {
  // Safe logging that strips any accidental sensitive tokens
  const sanitized = {
    ...error,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  };
  console.error('[Olympiad CBT System Error]', JSON.stringify(sanitized, null, 2));
}
