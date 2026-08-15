import { TranslationChunk } from '../types';

export const ChunkEngine = {
  split(text: string, wordLimit = 180): TranslationChunk[] {
    if (!text || !text.trim()) return [];

    // Split text into paragraphs
    const rawParagraphs = text.split(/\n\s*\n/);
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentWordCount = 0;

    for (const paragraph of rawParagraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) continue;

      const words = trimmed.split(/\s+/).filter(Boolean);

      // If a single paragraph is larger than the word limit, segment it by sentences
      if (words.length > wordLimit) {
        const sentences = trimmed.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [trimmed];
        for (const sentence of sentences) {
          const sTrimmed = sentence.trim();
          if (!sTrimmed) continue;
          const sWordsCount = sTrimmed.split(/\s+/).filter(Boolean).length;

          if (currentWordCount + sWordsCount > wordLimit && currentChunk.length > 0) {
            chunks.push(currentChunk.join('\n\n'));
            currentChunk = [];
            currentWordCount = 0;
          }
          currentChunk.push(sTrimmed);
          currentWordCount += sWordsCount;
        }
      } else {
        if (currentWordCount + words.length > wordLimit && currentChunk.length > 0) {
          chunks.push(currentChunk.join('\n\n'));
          currentChunk = [];
          currentWordCount = 0;
        }
        currentChunk.push(trimmed);
        currentWordCount += words.length;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n\n'));
    }

    return chunks.map((source, index) => ({
      id: index + 1,
      source,
      target: '',
      status: 'pending'
    }));
  }
};
