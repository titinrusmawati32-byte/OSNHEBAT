import mammoth from 'mammoth';
import { ParsedQuestion } from '../../types/question';
import { parseQuestionsFromRawText } from './questionParser';

export interface WordParseResult {
  questions: ParsedQuestion[];
  rawText: string;
  hasImageReferences: boolean;
  messages: string[];
}

export async function parseWordDocument(fileBuffer: ArrayBuffer): Promise<WordParseResult> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
    const rawText = result.value || '';
    const messages = (result.messages || []).map((m: any) => m.message || String(m));

    // Detect if text indicates figures/images (e.g. "[Gambar]", "pada gambar", "diagram di bawah")
    const imageKeywords = [
      'gambar',
      'diagram',
      'grafik',
      'tabel',
      'skema',
      'peta',
      'foto',
      '[gambar]',
      'figure',
    ];
    const lowerText = rawText.toLowerCase();
    const hasImageReferences = imageKeywords.some((kw) => lowerText.includes(kw));

    const questions = parseQuestionsFromRawText(rawText);

    return {
      questions,
      rawText,
      hasImageReferences,
      messages,
    };
  } catch (error: any) {
    console.error('Word extraction error:', error);
    throw new Error('Gagal mengekstrak teks dari dokumen Word (.docx): ' + (error.message || 'File rusak atau tidak kompatibel'));
  }
}
