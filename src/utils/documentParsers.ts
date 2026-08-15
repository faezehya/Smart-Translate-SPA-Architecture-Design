import mammoth from 'mammoth';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import { PersianNormalizer } from './persianNormalizer';

// Configure pdfjs worker
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  } catch {
    // fallback gracefully
  }
}

/**
 * Smartly decodes an ArrayBuffer into a normalized Unicode string.
 * Supports UTF-8 (with/without BOM), UTF-16LE, UTF-16BE, Windows-1256 (Persian/Arabic ANSI), and ISO-8859.
 */
function smartDecodeBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (bytes.length === 0) return '';

  // 1. Check for BOM (Byte Order Mark)
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    // UTF-8 with BOM
    return new TextDecoder('utf-8').decode(bytes.subarray(3)).normalize('NFC');
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    // UTF-16 LE
    return new TextDecoder('utf-16le').decode(bytes.subarray(2)).normalize('NFC');
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    // UTF-16 BE
    return new TextDecoder('utf-16be').decode(bytes.subarray(2)).normalize('NFC');
  }

  // 2. Try strict UTF-8 decoding
  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
    const decoded = utf8Decoder.decode(bytes);
    return PersianNormalizer.cleanUnicode(decoded);
  } catch {
    // UTF-8 decoding failed due to invalid byte sequence (e.g. Windows-1256 Persian text from Notepad)
    try {
      const winDecoder = new TextDecoder('windows-1256');
      const decoded = winDecoder.decode(bytes);
      return PersianNormalizer.cleanUnicode(decoded);
    } catch {
      // Fallback to iso-8859-1
      const fallbackDecoder = new TextDecoder('iso-8859-1');
      return PersianNormalizer.cleanUnicode(fallbackDecoder.decode(bytes));
    }
  }
}

/**
 * Decodes RTF documents with full support for \uN? unicode escapes and \'hh hex codes
 */
function parseRtfBuffer(buffer: ArrayBuffer): string {
  const raw = smartDecodeBuffer(buffer);
  if (!raw) return '';

  let text = raw;

  // 1. Replace paragraph and line breaks
  text = text.replace(/\\par[d]?\s*/gi, '\n');
  text = text.replace(/\\line\s*/gi, '\n');
  text = text.replace(/\\tab\s*/gi, '\t');

  // 2. Decode \uN? Unicode characters (where N can be signed 16-bit)
  text = text.replace(/\\u(-?\d+)(?:\?|[ ]?)/g, (_, codeStr) => {
    let code = parseInt(codeStr, 10);
    if (code < 0) code += 65536;
    return String.fromCharCode(code);
  });

  // 3. Remove header/font/color tables: {\*...} or {\fonttbl...} or {\colortbl...}
  text = text.replace(/\{\\\*?[^{}]+(?:\{[^{}]*\}[^{}]*)*\}/g, '');

  // 4. Strip remaining RTF control words and braces
  text = text.replace(/\\[a-zA-Z]+-?\d*[ ]?/g, '');
  text = text.replace(/[{}]/g, '');

  // 5. Clean up duplicate newlines/spaces
  text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

  return PersianNormalizer.cleanUnicode(text.trim());
}

export const DocumentParsers = {
  async parse(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    switch (ext) {
      case 'txt':
      case 'md':
      case 'markdown': {
        const buffer = await file.arrayBuffer();
        return smartDecodeBuffer(buffer);
      }

      case 'html':
      case 'htm': {
        const buffer = await file.arrayBuffer();
        const raw = smartDecodeBuffer(buffer);
        const doc = new DOMParser().parseFromString(raw, 'text/html');
        const text = doc.body.innerText || doc.body.textContent || '';
        return PersianNormalizer.cleanUnicode(text);
      }

      case 'rtf': {
        const buffer = await file.arrayBuffer();
        return parseRtfBuffer(buffer);
      }

      case 'docx': {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return PersianNormalizer.cleanUnicode(result.value || '');
      }

      case 'pdf': {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
          const pdf = await loadingTask.promise;
          let fullText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              // @ts-expect-error item.str exists on TextItem
              .map((item) => item.str || '')
              .join(' ');
            
            const normalizedPage = PersianNormalizer.cleanUnicode(pageText);
            fullText += `[صفحه ${i}]\n${normalizedPage}\n\n`;
          }
          return fullText.trim() || 'متن قابل استخراجی از فایل PDF یافت نشد.';
        } catch (pdfErr: any) {
          console.warn('PDF.js parse error, trying text fallback:', pdfErr);
          const buffer = await file.arrayBuffer();
          return smartDecodeBuffer(buffer);
        }
      }

      case 'epub': {
        try {
          const zip = await JSZip.loadAsync(file);
          let combinedText = '';
          const htmlFiles = Object.keys(zip.files).filter((name) =>
            /\.(xhtml|html|htm)$/i.test(name)
          );

          for (const filename of htmlFiles) {
            const fileData = await zip.files[filename].async('uint8array');
            const fileText = smartDecodeBuffer(fileData.buffer);
            const doc = new DOMParser().parseFromString(fileText, 'text/html');
            const text = doc.body.innerText || doc.body.textContent || '';
            if (text.trim()) {
              combinedText += PersianNormalizer.cleanUnicode(text) + '\n\n';
            }
          }
          return combinedText.trim() || 'متن قابل استخراجی در فایل کتاب یافت نشد.';
        } catch (epubErr: any) {
          throw new Error(`خطا در گشودن فایل EPUB: ${epubErr.message}`);
        }
      }

      default: {
        const buffer = await file.arrayBuffer();
        return smartDecodeBuffer(buffer);
      }
    }
  }
};
