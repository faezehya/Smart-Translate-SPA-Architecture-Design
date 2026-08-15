/**
 * Unicode and Persian Typography Normalizer
 * Standardizes Arabic/Persian presentation forms, Unicode normalization (NFC),
 * correct Zero-Width Non-Joiner (ZWNJ / نیم‌فاصله) placement, and Persian punctuation.
 */

// Presentation Forms to Standard Unicode Character Mapping
const ARABIC_PRESENTATION_FORMS_MAP: Record<string, string> = {
  // Arabic Presentation Forms-A & B (Ligatures & positional glyphs)
  'ﺀ': 'ء', 'ﺁ': 'آ', 'ﺂ': 'آ', 'ﺃ': 'أ', 'ﺄ': 'أ', 'ﺅ': 'ؤ', 'ﺆ': 'ؤ',
  'ﺇ': 'إ', 'ﺈ': 'إ', 'ﺉ': 'ئ', 'ﺊ': 'ئ', 'ﺋ': 'ئ', 'ﺌ': 'ئ', 'ﺍ': 'ا',
  'ﺎ': 'ا', 'ﺏ': 'ب', 'ﺐ': 'ب', 'ﺑ': 'ب', 'ﺒ': 'ب', 'ﺓ': 'ة', 'ﺔ': 'ة',
  'ﺕ': 'ت', 'ﺖ': 'ت', 'ﺗ': 'ت', 'ﺘ': 'ت', 'ﺙ': 'ث', 'ﺚ': 'ث', 'ﺛ': 'ث',
  'ﺜ': 'ث', 'ﺝ': 'ج', 'ﺞ': 'ج', 'ﺟ': 'ج', 'ﺠ': 'ج', 'ﺡ': 'ح', 'ﺢ': 'ح',
  'ﺣ': 'ح', 'ﺤ': 'ح', 'ﺥ': 'خ', 'ﺦ': 'خ', 'ﺧ': 'خ', 'ﺨ': 'خ', 'ﺩ': 'د',
  'ﺪ': 'د', 'ﺫ': 'ذ', 'ﺬ': 'ذ', 'ﺭ': 'ر', 'ﺮ': 'ر', 'ﺯ': 'ز', 'ﺰ': 'ز',
  'ﺱ': 'س', 'ﺲ': 'س', 'ﺳ': 'س', 'ﺴ': 'س', 'ﺵ': 'ش', 'ﺶ': 'ش', 'ﺷ': 'ش',
  'ﺸ': 'ش', 'ﺹ': 'ص', 'ﺺ': 'ص', 'ﺻ': 'ص', 'ﺼ': 'ص', 'ﺽ': 'ض', 'ﺾ': 'ض',
  'ﺿ': 'ض', 'ﻀ': 'ض', 'ﻂ': 'ط', 'ﻃ': 'ط', 'ﻄ': 'ط', 'ﻆ': 'ظ', 'ﻈ': 'ظ',
  'ﻉ': 'ع', 'ﻊ': 'ع', 'ﻋ': 'ع', 'ﻌ': 'ع', 'ﻍ': 'غ', 'ﻎ': 'غ', 'ﻏ': 'غ',
  'ﻐ': 'غ', 'ﻑ': 'ف', 'ﻒ': 'ف', 'ﻓ': 'ف', 'ﻔ': 'ف', 'ﻕ': 'ق', 'ﻖ': 'ق',
  'ﻗ': 'ق', 'ﻘ': 'ق', 'ﻝ': 'ل', 'ﻞ': 'ل', 'ﻟ': 'ل', 'ﻠ': 'ل', 'ﻡ': 'م',
  'ﻢ': 'م', 'ﻣ': 'م', 'ﻤ': 'م', 'ﻥ': 'ن', 'ﻦ': 'ن', 'ﻧ': 'ن', 'ﻨ': 'ن',
  'ﻩ': 'ه', 'ﻪ': 'ه', 'ﻫ': 'ه', 'ﻬ': 'ه', 'ﻭ': 'و', 'ﻮ': 'و', 'ﻯ': 'ی',
  'ﻰ': 'ی', 'ﻱ': 'ی', 'ﻲ': 'ی', 'ﻳ': 'ی', 'ﻴ': 'ی', 'ﻵ': 'لا', 'ﻶ': 'لا',
  'ﻷ': 'لأ', 'ﻸ': 'لأ', 'ﻹ': 'لإ', 'ﻺ': 'لإ', 'ﻻ': 'لا', 'ﻼ': 'لا',
  // Persian specific characters in presentation forms
  'ﭖ': 'پ', 'ﭗ': 'پ', 'ﭘ': 'پ', 'ﭙ': 'پ', 'ﭺ': 'چ', 'ﭻ': 'چ', 'ﭼ': 'چ',
  'ﭽ': 'چ', 'ﮊ': 'ژ', 'ﮋ': 'ژ', 'ﮎ': 'ک', 'ﮏ': 'ک', 'ﮐ': 'ک', 'ﮑ': 'ک',
  'ﮒ': 'گ', 'ﮓ': 'گ', 'ﮔ': 'گ', 'ﮕ': 'گ', 'ﯼ': 'ی', 'ﯽ': 'ی', 'ﯾ': 'ی',
  'ﯿ': 'ی'
};

const PRESENTATION_FORMS_REGEX = new RegExp(
  Object.keys(ARABIC_PRESENTATION_FORMS_MAP).join('|'),
  'g'
);

export const PersianNormalizer = {
  /**
   * Cleans presentation glyphs, fixes Unicode decomposition, and normalizes characters
   */
  cleanUnicode(text: string): string {
    if (!text) return '';
    let str = text;

    // 1. Unicode NFC Canonical Composition
    str = str.normalize('NFC');

    // 2. Map presentation forms to standard Unicode characters
    str = str.replace(PRESENTATION_FORMS_REGEX, (matched) => ARABIC_PRESENTATION_FORMS_MAP[matched] || matched);

    // 3. Convert Arabic Yeh (ي) and Kaf (ك) to standard Persian (ی / ک)
    str = str.replace(/\u064A/g, 'ی'); // Arabic Yeh -> Persian Yeh
    str = str.replace(/\u0643/g, 'ک'); // Arabic Kaf -> Persian Keheh
    str = str.replace(/\u0649/g, 'ی'); // Alef Maksura -> Persian Yeh
    str = str.replace(/\u06C0/g, 'هٔ'); // Heh with Yeh above -> Heh + Hamza

    // 4. Remove Tatweel (Kashida: U+0640)
    str = str.replace(/\u0640/g, '');

    // 5. Clean up BOM, directional isolation marks, and invalid invisible characters
    str = str.replace(/[\uFEFF\u202A-\u202E\u2066-\u2069]/g, '');

    return str;
  },

  /**
   * Applies Persian typography, ZWNJ rules, and formatting enhancements
   */
  normalize(text: string): string {
    if (!text) return '';
    let str = this.cleanUnicode(text);

    // Normalize multiple spaces/tabs into a single space (keep newlines)
    str = str.replace(/[ \t]+/g, ' ');

    // Normalize ZWNJ duplicates or misplaced spaces around ZWNJ
    str = str.replace(/\u200c+/g, '\u200c');
    str = str.replace(/ \u200c|\u200c /g, '\u200c');

    // Persian Prefixes: "می " and "نمی " and "بی " -> "می‌", "نمی‌", "بی‌"
    // Handles verbs: می‌روم, نمی‌دانم, بی‌نهایت
    str = str.replace(/(^|\s)(می|نمی)\s+([\u0600-\u06FF]+)/g, '$1$2\u200c$3');
    str = str.replace(/(^|\s)(بی)\s+([\u0600-\u06FF]+)/g, '$1$2\u200c$3');

    // Persian Suffixes with ZWNJ:
    // ها / های / هایی / ترین / تر / مند / پذیر / گیر / شناسی / نامه / بندی / سازی / هایش / هایم / هایمان / هایتان / هایشان
    const suffixes = [
      'ها', 'های', 'هایی', 'هایش', 'هایم', 'هایمان', 'هایتان', 'هایشان',
      'ترین', 'تر', 'مند', 'مندان', 'پذیر', 'پذیری', 'شناسی', 'شناس',
      'نامه', 'بندی', 'سازی', 'داری', 'گرایی', 'گونه'
    ];
    const suffixPattern = new RegExp(`([\\u0600-\\u06FF]{2,})\\s+(${suffixes.join('|')})(\\s|[.,،؛:!؟?«»"']|$)`, 'g');
    str = str.replace(suffixPattern, '$1\u200c$2$3');

    // Punctuation Spacing: No space before punctuation, one space after
    str = str.replace(/\s+([،؛:!؟?.])/g, '$1');
    str = str.replace(/([،؛:!؟?])([^\s\d»"'\u200c])/g, '$1 $2');

    // Persian Quotation Marks: Convert "..." to «...»
    str = str.replace(/"([^"\n\r]{1,120})"/g, '«$1»');

    // Clean up any remaining double ZWNJs
    str = str.replace(/\u200c+/g, '\u200c');

    return str.normalize('NFC').trim();
  }
};
