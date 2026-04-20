/**
 * Converts a given string to Title Case, correctly handling Turkish characters.
 * Preserves inner spacing and spaces.
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .split(/(\s+)/)
    .map((word) => {
      if (word.trim().length === 0) return word;
      return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR');
    })
    .join('');
}

/**
 * Converts a search string to a Turkish-character-aware regex string.
 * This allows safe partial matching and case-insensitivity against MongoDB.
 */
export function generateTurkishRegex(search: string): string {
  if (!search) return '';
  return search
    .replace(/i|ı|I|İ/g, '[iıIİ]')
    .replace(/c|ç|C|Ç/g, '[cçCÇ]')
    .replace(/s|ş|S|Ş/g, '[sşSŞ]')
    .replace(/o|ö|O|Ö/g, '[oöOÖ]')
    .replace(/u|ü|U|Ü/g, '[uüUÜ]')
    .replace(/g|ğ|G|Ğ/g, '[gğGĞ]');
}
