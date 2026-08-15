import mammoth from 'mammoth';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import { PersianNormalizer } from './persianNormalizer';

// Configure pdfjs worker with standard ESM URL
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch (err) {
    console.warn('Could not set pdfjs workerSrc:', err);
  }
}

/**
 * Smartly decodes an ArrayBuffer into a normalized Unicode string.
 * Supports UTF-8 (with/without BOM), UTF-16LE, UTF-16BE, Windows-1252 (Western Latin), Windows-1256 (Persian/Arabic ANSI), and ISO-8859.
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
    // UTF-16 LE (Windows Unicode default)
    return new TextDecoder('utf-16le').decode(bytes.subarray(2)).normalize('NFC');
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    // UTF-16 BE
    return new TextDecoder('utf-16be').decode(bytes.subarray(2)).normalize('NFC');
  }

  // 2. Try strict UTF-8 decoding
  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
    return utf8Decoder.decode(bytes).normalize('NFC');
  } catch {
    // 3. Fallback for non-UTF8 legacy ANSI encodings (Windows Notepad)
    // Check if there are Persian/Arabic byte sequences or Western Latin (Windows-1252)
    let hasHighBytes = false;
    for (let i = 0; i < Math.min(bytes.length, 500); i++) {
      if (bytes[i] >= 0x80) {
        hasHighBytes = true;
        break;
      }
    }

    if (hasHighBytes) {
      try {
        const win1256 = new TextDecoder('windows-1256').decode(bytes);
        // If it successfully decodes Persian/Arabic letters, return it
        if (/[\u0600-\u06FF]/.test(win1256)) {
          return win1256.normalize('NFC');
        }
      } catch {}

      try {
        const win1252 = new TextDecoder('windows-1252').decode(bytes);
        return win1252.normalize('NFC');
      } catch {}
    }

    const fallbackDecoder = new TextDecoder('iso-8859-1');
    return fallbackDecoder.decode(bytes).normalize('NFC');
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

  // 3. Decode hex escapes \'hh
  text = text.replace(/\\'([0-9a-fA-F]{2})/g, (_, hex) => {
    const code = parseInt(hex, 16);
    return String.fromCharCode(code);
  });

  // 4. Remove header/font/color tables: {\*...} or {\fonttbl...} or {\colortbl...}
  text = text.replace(/\{\\\*?[^{}]+(?:\{[^{}]*\}[^{}]*)*\}/g, '');

  // 5. Strip remaining RTF control words and braces
  text = text.replace(/\\[a-zA-Z]+-?\d*[ ]?/g, '');
  text = text.replace(/[{}]/g, '');

  // 6. Clean up duplicate newlines/spaces
  text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Robust extraction of text from PDF documents with spatial layout reconstruction
 */
async function parsePdfBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
  const uint8Array = new Uint8Array(arrayBuffer);
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useSystemFonts: true
  });
  const pdf = await loadingTask.promise;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    let lastY: number | null = null;
    let lastX: number | null = null;
    let lastWidth = 0;
    let currentLine = '';
    const lines: string[] = [];

    for (const item of textContent.items) {
      if (!('str' in item) || !item.str) continue;

      const str = item.str;
      const tx = item.transform[4];
      const ty = item.transform[5];

      if (lastY === null) {
        currentLine = str;
      } else if (Math.abs(ty - lastY) > 5) {
        // Vertical shift exceeds tolerance -> New line
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        currentLine = str;
      } else {
        // Same horizontal line: compute horizontal gap between text items
        const gap = tx - (lastX! + lastWidth);
        const needsSpace = gap > 2 && !currentLine.endsWith(' ') && !str.startsWith(' ');
        currentLine += (needsSpace ? ' ' : '') + str;
      }

      lastY = ty;
      lastX = tx;
      lastWidth = item.width || 0;
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    // Join lines and normalize paragraph breaks
    const pageString = lines
      .join('\n')
      // Merge hyphenated words across lines (e.g. "connec-\ntion" -> "connection")
      .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
      .trim();

    if (pageString) {
      pageTexts.push(pdf.numPages > 1 ? `[صفحه ${pageNum}]\n${pageString}` : pageString);
    }
  }

  const result = pageTexts.join('\n\n');
  if (!result || !result.trim()) {
    throw new Error('متن قابل استخراجی در فایل PDF یافت نشد (ممکن است سند اسکن شده یا تصویر باشد).');
  }
  return result;
}

export const DocumentParsers = {
  async parse(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    switch (ext) {
      case 'txt':
      case 'md':
      case 'markdown':
      case 'csv':
      case 'json':
      case 'log': {
        const buffer = await file.arrayBuffer();
        return smartDecodeBuffer(buffer);
      }

      case 'html':
      case 'htm': {
        const buffer = await file.arrayBuffer();
        const raw = smartDecodeBuffer(buffer);
        const doc = new DOMParser().parseFromString(raw, 'text/html');
        const text = doc.body.innerText || doc.body.textContent || '';
        return text.trim();
      }

      case 'rtf': {
        const buffer = await file.arrayBuffer();
        return parseRtfBuffer(buffer);
      }

      case 'docx': {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = (result.value || '').trim();
        if (!text) {
          throw new Error('فایل Word فاقد متن قابل خواندن است.');
        }
        return text;
      }

      case 'doc': {
        throw new Error('فرمت قدیمی .doc پشتیبانی نمی‌شود. لطفاً فایل را با فرمت .docx یا .pdf ذخیره و مجدداً آپلود نمایید.');
      }

      case 'pdf': {
        const arrayBuffer = await file.arrayBuffer();
        return await parsePdfBuffer(arrayBuffer);
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
              combinedText += text.trim() + '\n\n';
            }
          }
          const result = combinedText.trim();
          if (!result) {
            throw new Error('متن قابل استخراجی در فایل کتاب الکترونیکی یافت نشد.');
          }
          return result;
        } catch (epubErr: any) {
          throw new Error(`خطا در پردازش فایل EPUB: ${epubErr.message}`);
        }
      }

      default: {
        const buffer = await file.arrayBuffer();
        return smartDecodeBuffer(buffer);
      }
    }
  }
};
