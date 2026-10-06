import * as pdfjsLib from 'pdfjs-dist';
import { ParsedQuestion } from '../../types/question';
import { parseQuestionsFromRawText } from './questionParser';

// Set up worker source for browser environment safely
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface PdfParseResult {
  questions: ParsedQuestion[];
  numPages: number;
  rawText: string;
  isScanOnly: boolean;
  scanWarning?: string;
}

export async function parsePdfDocument(fileBuffer: ArrayBuffer): Promise<PdfParseResult> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    const pageTexts: string[] = [];

    for (let p = 1; p <= numPages; p++) {
      const page = await pdfDoc.getPage(p);
      const textContent = await page.getTextContent();
      const pageStr = textContent.items
        .map((item: any) => (item?.str ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (pageStr) {
        pageTexts.push(pageStr);
      }
    }

    const fullRawText = pageTexts.join('\n\n');

    // Check if PDF appears to be a scan / image-only (negligible selectable text)
    if (fullRawText.length < 50 && numPages >= 1) {
      return {
        questions: [],
        numPages,
        rawText: fullRawText,
        isScanOnly: true,
        scanWarning:
          'PDF ini tampaknya berupa scan/gambar tanpa lapisan teks. Teks tidak dapat diekstrak secara langsung (Memerlukan pemrosesan OCR).',
      };
    }

    const questions = parseQuestionsFromRawText(fullRawText);

    return {
      questions,
      numPages,
      rawText: fullRawText,
      isScanOnly: false,
    };
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    throw new Error('Gagal mengekstrak teks dari dokumen PDF (.pdf): ' + (error.message || 'File rusak atau dilindungi password.'));
  }
}
