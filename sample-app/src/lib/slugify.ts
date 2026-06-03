/**
 * Converts a string to a URL-safe slug.
 *
 * @param text - The input string to convert
 * @returns A URL-safe slug with lowercase letters, numbers, and hyphens
 *
 * @example
 * slugify('Hello World!') // => 'hello-world'
 * slugify('Café™ & Bar') // => 'cafe-bar'
 * slugify('  Multiple---Hyphens  ') // => 'multiple-hyphens'
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD') // Decompose unicode characters
    .replace(/[̀-ͯ]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, '') // Remove special characters except spaces, underscores, and hyphens
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
