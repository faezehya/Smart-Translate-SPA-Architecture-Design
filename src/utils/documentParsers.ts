import mammoth from 'mammoth';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// Set up pdfjs worker using unpkg / cdnjs fallback to prevent build/worker path issues
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  } catch {
    // fallback
  }
}

export const DocumentParsers = {
  async parse(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    switch (ext) {
      case 'txt':
      case 'md':
      case 'markdown':
        return await file.text();

      case 'html':
      case 'htm': {
        const raw = await file.text();
        const doc = new DOMParser().parseFromString(raw, 'text/html');
        return doc.body.innerText || doc.body.textContent || '';
      }

      case 'rtf': {
        const raw = await file.text();
        // Strip RTF formatting tags
        let clean = raw.replace(/\\par[d]?/g, '\n');
        clean = clean.replace(/\{\*?\\[^{}]+}|[{}]|\\\w+/g, '');
        return clean.trim();
      }

      case 'docx': {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value || '';
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
            fullText += `[صفحه ${i}]\n${pageText}\n\n`;
          }
          return fullText.trim() || 'متن قابل استخراجی از فایل PDF یافت نشد.';
        } catch (pdfErr: any) {
          console.warn('PDF.js parse error, trying text fallback:', pdfErr);
          return await file.text();
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
            const fileData = await zip.files[filename].async('string');
            const doc = new DOMParser().parseFromString(fileData, 'text/html');
            const text = doc.body.innerText || doc.body.textContent || '';
            if (text.trim()) {
              combinedText += text + '\n\n';
            }
          }
          return combinedText.trim() || 'متن قابل استخراجی در فایل کتاب یافت نشد.';
        } catch (epubErr: any) {
          throw new Error(`خطا در گشودن فایل EPUB: ${epubErr.message}`);
        }
      }

      default:
        return await file.text();
    }
  }
};
