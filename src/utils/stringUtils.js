/**
 * Generates a slug from a given string
 * @param {string} str String to convert to a slug
 * @returns {string} Slugified string
 */
export const generateSlug = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Truncates a text to a specified length and adds ellipsis
 * @param {string} text Text to truncate
 * @param {number} maxLength Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
