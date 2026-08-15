export type TranslationEngine = 'ollama' | 'google';

export type TonePreset = 'formal' | 'fluent' | 'literary' | 'colloquial';

export interface OllamaModel {
  name: string;
  size: number;
  digest?: string;
  modified_at?: string;
  details?: {
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface TranslationChunk {
  id: number;
  source: string;
  target: string;
  status: 'pending' | 'translating' | 'done' | 'error';
  errorMsg?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  size: string;
  type: string;
  rawText: string;
  chunks: TranslationChunk[];
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export interface AppSettings {
  theme: 'dark' | 'light';
  engine: TranslationEngine;
  ollamaHost: string;
  ollamaModel: string;
  ollamaTemp: number;
  googleApiKey: string;
  chunkSize: number;
  concurrency: number;
  autoHalfSpace: boolean;
  tone: TonePreset;
  systemPrompt: string;
  syncScroll: boolean;
}

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}
