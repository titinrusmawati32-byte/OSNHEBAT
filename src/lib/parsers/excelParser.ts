import * as XLSX from 'xlsx';
import { ParsedQuestion, QuestionDifficulty } from '../../types/question';

export interface ExcelParseResult {
  questions: ParsedQuestion[];
  sheetNames: string[];
  totalRows: number;
}

// Normalize column key for flexible header matching
function normalizeHeaderKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function parseExcelDocument(
  fileBuffer: ArrayBuffer,
  sheetIndex: number = 0
): ExcelParseResult {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sheetNames = workbook.SheetNames || [];

    if (sheetNames.length === 0) {
      throw new Error('File Excel tidak memiliki lembar kerja (sheet).');
    }

    const selectedSheetName = sheetNames[sheetIndex] || sheetNames[0];
    const worksheet = workbook.Sheets[selectedSheetName];
    if (!worksheet) {
      throw new Error(`Sheet "${selectedSheetName}" tidak ditemukan.`);
    }

    // Convert sheet to array of rows (objects)
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

    if (rawData.length === 0) {
      return { questions: [], sheetNames, totalRows: 0 };
    }

    const questions: ParsedQuestion[] = [];

    rawData.forEach((row, index) => {
      // Find matching keys
      let numVal: number | undefined = undefined;
      let qText = '';
      let optA = '';
      let optB = '';
      let optC = '';
      let optD = '';
      let keyVal = '';
      let explanation = '';
      let difficulty: QuestionDifficulty = 'medium';
      let imageUrl = '';

      Object.entries(row).forEach(([colName, val]) => {
        const valStr = String(val ?? '').trim();
        const normKey = normalizeHeaderKey(colName);

        if (normKey === 'no' || normKey === 'nomor' || normKey === 'num') {
          const parsed = parseInt(valStr, 10);
          if (!isNaN(parsed)) numVal = parsed;
        } else if (
          normKey.includes('soal') ||
          normKey.includes('pertanyaan') ||
          normKey.includes('question')
        ) {
          qText = valStr;
        } else if (normKey === 'a' || normKey.includes('pilihana') || normKey.includes('opsia')) {
          optA = valStr;
        } else if (normKey === 'b' || normKey.includes('pilihanb') || normKey.includes('opsib')) {
          optB = valStr;
        } else if (normKey === 'c' || normKey.includes('pilihanc') || normKey.includes('opsic')) {
          optC = valStr;
        } else if (normKey === 'd' || normKey.includes('pilihand') || normKey.includes('opsid')) {
          optD = valStr;
        } else if (
          normKey.includes('kunci') ||
          normKey === 'jawaban' ||
          normKey.includes('correct') ||
          normKey === 'key'
        ) {
          const k = valStr.toUpperCase();
          if (['A', 'B', 'C', 'D'].includes(k)) {
            keyVal = k;
          }
        } else if (
          normKey.includes('pembahasan') ||
          normKey.includes('penjelasan') ||
          normKey.includes('explanation')
        ) {
          explanation = valStr;
        } else if (normKey.includes('kesulitan') || normKey.includes('diff')) {
          const diffStr = valStr.toLowerCase();
          if (diffStr.includes('mudah') || diffStr.includes('easy')) difficulty = 'easy';
          else if (diffStr.includes('sulit') || diffStr.includes('hard')) difficulty = 'hard';
          else difficulty = 'medium';
        } else if (normKey.includes('gambar') || normKey.includes('image')) {
          imageUrl = valStr;
        }
      });

      // If headers didn't match standard names, try positional fallback from raw row values
      if (!qText && Object.keys(row).length >= 5) {
        const values = Object.values(row).map((v) => String(v ?? '').trim());
        // Assume [No, Soal, A, B, C, D, Kunci...] or [Soal, A, B, C, D...]
        if (values.length >= 6 && !isNaN(parseInt(values[0], 10))) {
          numVal = parseInt(values[0], 10);
          qText = values[1];
          optA = values[2];
          optB = values[3];
          optC = values[4];
          optD = values[5];
          if (values[6]) {
            const k = values[6].toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(k)) keyVal = k;
          }
        } else if (values.length >= 5) {
          qText = values[0];
          optA = values[1];
          optB = values[2];
          optC = values[3];
          optD = values[4];
          if (values[5]) {
            const k = values[5].toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(k)) keyVal = k;
          }
        }
      }

      // Check validation and review status
      const reviewReasons: string[] = [];
      let confidence: 'high' | 'medium' | 'low' = 'high';

      if (!qText) {
        reviewReasons.push('Pertanyaan kosong.');
        confidence = 'low';
      }
      if (!optA || !optB) {
        reviewReasons.push('Pilihan A atau B belum lengkap.');
        confidence = 'low';
      }
      if (!optC) {
        reviewReasons.push('Pilihan C belum terisi.');
        confidence = 'medium';
      }
      if (!optD) {
        reviewReasons.push('Pilihan D belum terisi.');
        confidence = 'medium';
      }
      if (!keyVal) {
        reviewReasons.push('Kunci jawaban belum ditentukan.');
        if (confidence === 'high') confidence = 'medium';
      }

      const needsReview = reviewReasons.length > 0;

      // Only add if there is some question content or options
      if (qText || optA || optB) {
        questions.push({
          id: `parsed_excel_${Date.now()}_${index + 1}`,
          questionNumber: numVal || index + 1,
          questionText: qText || `Soal baris ke-${index + 2}`,
          options: {
            A: optA,
            B: optB,
            C: optC,
            D: optD,
          },
          correctAnswer: (keyVal as any) || '',
          explanation: explanation || undefined,
          imageUrl: imageUrl || undefined,
          difficulty,
          needsReview,
          reviewReason: reviewReasons.join(' ') || undefined,
          confidence,
          originalText: JSON.stringify(row, null, 2),
        });
      }
    });

    return {
      questions,
      sheetNames,
      totalRows: rawData.length,
    };
  } catch (error: any) {
    console.error('Excel extraction error:', error);
    throw new Error('Gagal membaca dokumen Excel (.xlsx/.xls): ' + (error.message || 'Format tidak valid.'));
  }
}
