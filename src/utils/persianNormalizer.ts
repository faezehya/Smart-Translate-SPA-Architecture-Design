/**
 * Persian typography and grammar normalizer
 * Formats zero-width non-joiners (نیم‌فاصله), standard Persian characters, and clean quotations.
 */

export const PersianNormalizer = {
  normalize(text: string): string {
    if (!text) return '';
    let str = text;

    // Convert Arabic Yeh (ي) and Kaf (ك) to Persian (ی / ک)
    str = str.replace(/\u064A/g, 'ی').replace(/\u0643/g, 'ک');

    // Convert Arabic digits to Persian if needed
    // str = str.replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);

    // Prefixes: می and نمی followed by space -> with ZWNJs (\u200c)
    str = str.replace(/\b(می|نمی)\s+/g, '$1\u200c');

    // Suffixes: ها, های, هایی, تر, ترین, ام, ات, اش, مان, تان, شان, ایم, اید, اند
    str = str.replace(/\s+(ها|های|هایی|تر|ترین|ام|ات|اش|مان|تان|شان|ایم|اید|اند)\b/g, '\u200c$1');

    // Standard Persian quotes
    str = str.replace(/"([^"]+)"/g, '«$1»');

    // Clean multiple spaces
    str = str.replace(/[ \t]+/g, ' ');

    return str;
  }
};
