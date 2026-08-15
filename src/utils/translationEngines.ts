import { AppSettings, OllamaModel } from '../types';
import { PersianNormalizer } from './persianNormalizer';

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}

/**
 * Split a chunk into smaller sentences/parts if it exceeds URL character limits for free Google Translate
 */
function splitIntoSubSentences(text: string, maxLen = 800): string[] {
  if (text.length <= maxLen) return [text];

  const sentences = text.match(/[^.!?؟\n]+[.!?؟\n]+|[^.!?؟\n]+$/g) || [text];
  const parts: string[] = [];
  let current = '';

  for (const s of sentences) {
    if ((current + s).length > maxLen && current.length > 0) {
      parts.push(current);
      current = s;
    } else {
      current += s;
    }
  }

  if (current.length > 0) {
    parts.push(current);
  }

  return parts.length > 0 ? parts : [text];
}

export const TranslationEngines = {
  /**
   * Probe Ollama local servers and retrieve list of available models
   */
  async probeOllama(
    hostInput: string
  ): Promise<{ connectedHost: string | null; models: OllamaModel[]; error?: string }> {
    const cleanHost = (hostInput || '').trim().replace(/\/$/, '') || 'http://127.0.0.1:11434';
    const candidates = [
      cleanHost,
      'http://127.0.0.1:11434',
      'http://localhost:11434'
    ];

    const uniqueCandidates = Array.from(new Set(candidates)).filter(Boolean);

    for (const host of uniqueCandidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`${host}/api/tags`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const models: OllamaModel[] = data.models || [];
          return { connectedHost: host, models };
        }
      } catch {
        // Continue to next candidate
      }
    }

    return {
      connectedHost: null,
      models: [],
      error: 'خطای اتصال: سرویس محلی Ollama یافت نشد یا دسترسی CORS فعال نیست.'
    };
  },

  /**
   * Translate a chunk via Ollama API
   */
  async translateOllama(
    chunkText: string,
    settings: AppSettings,
    signal?: AbortSignal
  ): Promise<string> {
    if (!chunkText || !chunkText.trim()) return '';

    if (!settings.ollamaModel) {
      throw new Error('هیچ مدل هوش مصنوعی در تنظیمات Ollama انتخاب نشده است.');
    }

    const host = (settings.ollamaHost || '').trim().replace(/\/$/, '') || 'http://127.0.0.1:11434';
    const systemPromptWithTone = `${settings.systemPrompt}\nلحن ترجمه: ${settings.tone}`;

    const payload = {
      model: settings.ollamaModel,
      prompt: `متن زیر را به زبان فارسی شیوا، رسا و بدون حاشیه‌نویسی ترجمه کن. فقط ترجمه فارسی را بازگردان:\n\n${chunkText}`,
      system: systemPromptWithTone,
      stream: false,
      options: {
        temperature: settings.ollamaTemp
      }
    };

    let res: Response;
    try {
      res = await fetch(`${host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal
      });
    } catch (fetchErr: any) {
      if (signal?.aborted) throw fetchErr;
      throw new Error(`عدم امکان ارتباط با Ollama (${fetchErr.message}). بررسی کنید که Ollama در حال اجرا و OLLAMA_ORIGINS فعال باشد.`);
    }

    if (!res.ok) {
      throw new Error(`پاسخ ناموفق از Ollama (کد ${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    let result = data.response ? data.response.trim() : '';

    if (!result) {
      throw new Error('مدل Ollama پاسخی تولید نکرد.');
    }

    if (settings.autoHalfSpace) {
      result = PersianNormalizer.normalize(result);
    } else {
      result = PersianNormalizer.cleanUnicode(result);
    }

    return result;
  },

  /**
   * Single sub-request to Google Translate
   */
  async translateGoogleSingle(text: string, signal?: AbortSignal): Promise<string> {
    if (!text.trim()) return '';

    // Primary endpoint: translate_a/single
    const primaryUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fa&dt=t&q=${encodeURIComponent(text)}`;
    
    try {
      const res = await fetch(primaryUrl, { signal });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && Array.isArray(json[0])) {
          const joined = json[0]
            .filter((item: any) => item && typeof item[0] === 'string')
            .map((item: any) => item[0])
            .join('');
          if (joined) return joined;
        }
      }
    } catch (err: any) {
      if (signal?.aborted) throw err;
    }

    // Secondary fallback endpoint
    try {
      const fallbackUrl = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=fa&q=${encodeURIComponent(text)}`;
      const res2 = await fetch(fallbackUrl, { signal });
      if (res2.ok) {
        const json2 = await res2.json();
        if (Array.isArray(json2) && typeof json2[0] === 'string') {
          return json2.join('');
        }
        if (Array.isArray(json2) && Array.isArray(json2[0])) {
          return json2[0].map((item: any) => (Array.isArray(item) ? item[0] : item)).join('');
        }
      }
    } catch (err2: any) {
      if (signal?.aborted) throw err2;
    }

    throw new Error('سرویس ترجمه در دسترس نیست یا اتصال اینترنت با وقفه مواجه شد.');
  },

  /**
   * Translate a chunk via Google Translate (API key or free client fallback)
   */
  async translateGoogle(
    chunkText: string,
    settings: AppSettings,
    signal?: AbortSignal
  ): Promise<string> {
    if (!chunkText || !chunkText.trim()) return '';

    let result = '';

    if (settings.googleApiKey && settings.googleApiKey.trim()) {
      // Official Google Cloud Translate API v2
      const url = `https://translation.googleapis.com/language/translate/v2?key=${settings.googleApiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: chunkText,
          target: 'fa',
          format: 'text'
        }),
        signal
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.error?.message || `کد ${res.status}`;
        throw new Error(`خطای Google Cloud API: ${errMsg}`);
      }

      const json = await res.json();
      result = json.data?.translations?.[0]?.translatedText || '';
    } else {
      // Split into safe sub-sentences if the chunk is very long
      const subSentences = splitIntoSubSentences(chunkText, 700);
      const translatedParts: string[] = [];

      for (const sub of subSentences) {
        if (signal?.aborted) break;
        const translatedPart = await this.translateGoogleSingle(sub, signal);
        translatedParts.push(translatedPart);
      }

      result = translatedParts.join(' ');
    }

    // Decode any HTML entities returned by translation service
    result = decodeHtmlEntities(result);

    if (settings.autoHalfSpace) {
      result = PersianNormalizer.normalize(result);
    } else {
      result = PersianNormalizer.cleanUnicode(result);
    }

    return result;
  },

  /**
   * Main Translation Entry Point
   */
  async translate(
    chunkText: string,
    settings: AppSettings,
    signal?: AbortSignal
  ): Promise<string> {
    if (!chunkText || !chunkText.trim()) return '';

    if (settings.engine === 'ollama') {
      return await this.translateOllama(chunkText, settings, signal);
    } else {
      return await this.translateGoogle(chunkText, settings, signal);
    }
  }
};
