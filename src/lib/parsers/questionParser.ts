import { ParsedQuestion, QuestionDifficulty } from '../../types/question';

// Normalize text for duplicate detection
export function normalizeQuestionText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Calculate similarity between two strings (0 to 1)
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeQuestionText(str1);
  const s2 = normalizeQuestionText(str2);
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const words1 = new Set(s1.split(' '));
  const words2 = new Set(s2.split(' '));
  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }
  const union = new Set([...words1, ...words2]).size;
  return union > 0 ? intersection / union : 0;
}

// Parse free-form text blocks into structured ParsedQuestion objects
export function parseQuestionsFromRawText(rawText: string): ParsedQuestion[] {
  if (!rawText || !rawText.trim()) {
    return [];
  }

  // Normalize line endings
  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  const parsedQuestions: ParsedQuestion[] = [];

  // Regex patterns for question start:
  // e.g. "1.", "1)", "1 .", "Soal 1.", "Soal 1:", "[1]", "No. 1"
  const questionStartRegex = /^(?:(?:soal|no\.?|pertanyaan)?\s*(\d+)[\.\)\:\-]\s*|\[(\d+)\]\s*)(.+)/i;
  // Fallback for simple number alone on a line: e.g. "1" followed by question on next line
  const standaloneNumberRegex = /^(\d+)[\.\)]?$/;

  // Regex for option labels
  const optionRegex = /^(?:[\[\(]?([A-Da-d])[\]\)\.\:\-]\s*)(.+)$/;
  // Regex for correct answer
  const keyRegex = /^(?:kunci(?:\s*jawaban)?|jawaban(?:\s*benar)?|ans(?:wer)?|key)\s*[\:\=\-]?\s*([A-Da-d])/i;
  // Regex for explanation
  const expRegex = /^(?:pembahasan|penjelasan|explanation)\s*[\:\=\-]?\s*(.+)$/i;

  let currentBlock: {
    num?: number;
    lines: string[];
    originalLines: string[];
  } | null = null;

  const questionBlocks: Array<{ num?: number; lines: string[]; rawText: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const qMatch = line.match(questionStartRegex);
    const numOnlyMatch = line.match(standaloneNumberRegex);

    if (qMatch) {
      if (currentBlock && currentBlock.lines.length > 0) {
        questionBlocks.push({
          num: currentBlock.num,
          lines: currentBlock.lines,
          rawText: currentBlock.originalLines.join('\n'),
        });
      }
      const num = parseInt(qMatch[1] || qMatch[2], 10);
      currentBlock = {
        num: isNaN(num) ? undefined : num,
        lines: [qMatch[3]],
        originalLines: [line],
      };
    } else if (numOnlyMatch && i + 1 < lines.length && !lines[i + 1].match(optionRegex)) {
      if (currentBlock && currentBlock.lines.length > 0) {
        questionBlocks.push({
          num: currentBlock.num,
          lines: currentBlock.lines,
          rawText: currentBlock.originalLines.join('\n'),
        });
      }
      const num = parseInt(numOnlyMatch[1], 10);
      currentBlock = {
        num: isNaN(num) ? undefined : num,
        lines: [],
        originalLines: [line],
      };
    } else {
      if (currentBlock) {
        currentBlock.lines.push(line);
        currentBlock.originalLines.push(line);
      } else {
        // First lines before question 1 (header or instructions), ignore or start block
        if (line.length > 15 && !line.toLowerCase().includes('petunjuk')) {
          currentBlock = {
            num: 1,
            lines: [line],
            originalLines: [line],
          };
        }
      }
    }
  }

  if (currentBlock && currentBlock.lines.length > 0) {
    questionBlocks.push({
      num: currentBlock.num,
      lines: currentBlock.lines,
      rawText: currentBlock.originalLines.join('\n'),
    });
  }

  // Now process each question block into a structured ParsedQuestion
  questionBlocks.forEach((block, index) => {
    let qTextLines: string[] = [];
    let optA = '';
    let optB = '';
    let optC = '';
    let optD = '';
    let currentOpt: 'A' | 'B' | 'C' | 'D' | null = null;
    let key: 'A' | 'B' | 'C' | 'D' | '' = '';
    let explanation = '';
    let inExplanation = false;

    for (const line of block.lines) {
      // Check answer key line
      const kMatch = line.match(keyRegex);
      if (kMatch) {
        key = kMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
        currentOpt = null;
        inExplanation = false;
        continue;
      }

      // Check explanation line
      const expMatch = line.match(expRegex);
      if (expMatch) {
        explanation = expMatch[1];
        inExplanation = true;
        currentOpt = null;
        continue;
      }

      // Check option line
      const optMatch = line.match(optionRegex);
      if (optMatch) {
        const letter = optMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
        const content = optMatch[2];
        inExplanation = false;

        if (letter === 'A') {
          optA = content;
          currentOpt = 'A';
        } else if (letter === 'B') {
          optB = content;
          currentOpt = 'B';
        } else if (letter === 'C') {
          optC = content;
          currentOpt = 'C';
        } else if (letter === 'D') {
          optD = content;
          currentOpt = 'D';
        }
        continue;
      }

      // Continuation line
      if (inExplanation) {
        explanation += ' ' + line;
      } else if (currentOpt === 'A') {
        optA += ' ' + line;
      } else if (currentOpt === 'B') {
        optB += ' ' + line;
      } else if (currentOpt === 'C') {
        optC += ' ' + line;
      } else if (currentOpt === 'D') {
        optD += ' ' + line;
      } else {
        qTextLines.push(line);
      }
    }

    const questionText = qTextLines.join(' ').trim();
    const needsReviewReasons: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'high';

    if (!questionText) {
      needsReviewReasons.push('Pertanyaan kosong atau tidak terdeteksi.');
      confidence = 'low';
    }

    if (!optA || !optB) {
      needsReviewReasons.push('Pilihan A atau B belum lengkap.');
      confidence = 'low';
    }

    if (!optC) {
      needsReviewReasons.push('Pilihan C belum terisi.');
      confidence = 'medium';
    }

    if (!optD) {
      needsReviewReasons.push('Pilihan D belum terisi.');
      confidence = 'medium';
    }

    if (!key) {
      needsReviewReasons.push('Kunci jawaban belum ditentukan.');
      if (confidence === 'high') confidence = 'medium';
    }

    const needsReview = needsReviewReasons.length > 0;

    parsedQuestions.push({
      id: `parsed_${Date.now()}_${index + 1}`,
      questionNumber: block.num || index + 1,
      questionText: questionText || `Soal No. ${block.num || index + 1}`,
      options: {
        A: optA.trim(),
        B: optB.trim(),
        C: optC.trim(),
        D: optD.trim(),
      },
      correctAnswer: key || '',
      explanation: explanation.trim() || undefined,
      difficulty: 'medium',
      needsReview,
      reviewReason: needsReviewReasons.join(' ') || undefined,
      confidence,
      originalText: block.rawText,
    });
  });

  return parsedQuestions;
}
