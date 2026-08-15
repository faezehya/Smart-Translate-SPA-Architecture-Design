import { AppSettings, OllamaModel } from '../types';
import { PersianNormalizer } from './persianNormalizer';

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}

export const TranslationEngines = {
  /**
   * Probe Ollama local servers and retrieve list of available models
   */
  async probeOllama(
    hostInput: string
  ): Promise<{ connectedHost: string | null; models: OllamaModel[]; error?: string }> {
    const cleanHost = hostInput.trim().replace(/\/$/, '');
    const candidates = [
      cleanHost,
      'http://127.0.0.1:11434',
      'http://localhost:11434'
    ];

    const uniqueCandidates = Array.from(new Set(candidates)).filter(Boolean);

    for (const host of uniqueCandidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

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
      error: 'خطای دسترسی یا CORS: ارتباط با سرویس محلی Ollama برقرار نشد.'
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
    if (!settings.ollamaModel) {
      throw new Error('مدلی برای Ollama انتخاب نشده است.');
    }

    const host = settings.ollamaHost.trim().replace(/\/$/, '') || 'http://127.0.0.1:11434';
    const systemPromptWithTone = `${settings.systemPrompt}\nلحن ترجمه: ${settings.tone}`;

    const payload = {
      model: settings.ollamaModel,
      prompt: `متن زیر را با دقت بالا به زبان فارسی شیوا و روان ترجمه کن. فقط ترجمه نهایی را بازگردان:\n\n${chunkText}`,
      system: systemPromptWithTone,
      stream: false,
      options: {
        temperature: settings.ollamaTemp
      }
    };

    const res = await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal
    });

    if (!res.ok) {
      throw new Error(`خطای پاسخ از سرور Ollama (کد ${res.status})`);
    }

    const data = await res.json();
    let result = data.response ? data.response.trim() : '';

    if (settings.autoHalfSpace) {
      result = PersianNormalizer.normalize(result);
    } else {
      result = PersianNormalizer.cleanUnicode(result);
    }

    return result;
  },

  /**
   * Translate a chunk via Google Translate (API key or free client fallback)
   */
  async translateGoogle(
    chunkText: string,
    settings: AppSettings,
    signal?: AbortSignal
  ): Promise<string> {
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
        throw new Error(`خطای Google API (کد ${res.status})`);
      }

      const json = await res.json();
      result = json.data?.translations?.[0]?.translatedText || '';
    } else {
      // Fallback client-side web translator
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fa&dt=t&q=${encodeURIComponent(
        chunkText
      )}`;
      const res = await fetch(url, { signal });

      if (!res.ok) {
        throw new Error(`خطای اتصال به سرور ترجمه (کد ${res.status})`);
      }

      const json = await res.json();
      if (Array.isArray(json[0])) {
        result = json[0].map((item: any) => item[0]).join('');
      } else {
        throw new Error('فرمت پاسخ دریافتی نامعتبر است.');
      }
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
   * Universal translation dispatcher
   */
  async translate(
    chunkText: string,
    settings: AppSettings,
    signal?: AbortSignal
  ): Promise<string> {
    if (settings.engine === 'ollama') {
      return await this.translateOllama(chunkText, settings, signal);
    } else {
      return await this.translateGoogle(chunkText, settings, signal);
    }
  }
};
