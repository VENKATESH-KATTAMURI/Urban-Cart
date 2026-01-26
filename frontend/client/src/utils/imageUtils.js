/**
 * Image utility helpers for handling broken/missing images
 */

// Multiple fallback image services (in case one is down)
// Use static SVG for instant loading instead of external services
const FALLBACK_IMAGES = [
  // Default: Inline SVG - always works, instant load
  (text, bg = '0FB9B1', fg = 'FFFFFF') => {
    const encodedText = encodeURIComponent(text).replace(/%20/g, '+');
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Crect fill='%23${bg}' width='500' height='500'/%3E%3Ctext x='50%25' y='45%25' font-size='24' font-weight='bold' fill='%23${fg}' text-anchor='middle' font-family='Arial'%3E${encodedText}%3C/text%3E%3Ctext x='50%25' y='60%25' font-size='14' fill='%23${fg}' text-anchor='middle' font-family='Arial' opacity='0.7'%3EProduct%3C/text%3E%3C/svg%3E`;
  },

  // Backup 1: via.placeholder.com
  (text, bg = '0FB9B1', fg = 'FFFFFF') =>
    `https://via.placeholder.com/500?text=${encodeURIComponent(text)}&bg=${bg}&fg=${fg}`,

  // Backup 2: dummyimage.com
  (text, bg = '0FB9B1', fg = 'FFFFFF') =>
    `https://dummyimage.com/500x500/${bg}/${fg}?text=${encodeURIComponent(text)}`,

  // Backup 3: placeholder.pics
  (text, bg = '0FB9B1', fg = 'FFFFFF') =>
    `https://placeholder.pics/svg/500/${bg}/${fg}?text=${encodeURIComponent(text)}`,
];

/**
 * Get a placeholder image URL - uses inline SVG by default for instant rendering
 * @param {string} text - Text to display on placeholder
 * @param {string} bg - Background color (hex without #)
 * @param {string} fg - Foreground color (hex without #)
 * @returns {string} Placeholder image URL (SVG data URI - always works)
 */
export const getPlaceholderImage = (text = 'Product', bg = '0FB9B1', fg = 'FFFFFF') => {
  return FALLBACK_IMAGES[0](text, bg, fg);
};

/**
 * Get a backup placeholder if primary fails
 * @param {number} index - Index of backup to use (0 = primary SVG, 1+ = external services)
 * @param {string} text - Text to display
 * @param {string} bg - Background color
 * @param {string} fg - Foreground color
 * @returns {string} Placeholder image URL
 */
export const getBackupPlaceholder = (index = 0, text = 'Product', bg = '0FB9B1', fg = 'FFFFFF') => {
  if (index >= FALLBACK_IMAGES.length) {
    return FALLBACK_IMAGES[0](text, bg, fg); // Always fall back to SVG
  }
  return FALLBACK_IMAGES[index](text, bg, fg);
};

/**
 * Get appropriate fallback for small thumbnails (uses SVG)
 * @returns {string} Small thumbnail placeholder (SVG - instant load)
 */
export const getSmallPlaceholder = () => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Crect fill='%230FB9B1' width='240' height='240'/%3E%3Ctext x='50%25' y='50%25' font-size='16' font-weight='bold' fill='%23FFFFFF' text-anchor='middle' font-family='Arial'%3EProduct%3C/text%3E%3C/svg%3E`;
};

/**
 * Get a semantic image URL that matches the product name.
 * Uses Unsplash Source (no API key) with a keyword query.
 * @param {string} name - Product name
 * @param {number} size - Square size (px)
 * @returns {string} Semantic image URL
 */
export const getSemanticImage = (name = 'product', size = 600) => {
  // Use Pollinations AI for exact semantic matching (e.g., "Red Shirt" generates a red shirt)
  // 1. Clean up the name for the prompt
  const prompt = encodeURIComponent(`${name} product view realistic high quality`);

  // 2. Generate a consistent seed from the product name
  let seed = 0;
  for (let i = 0; i < name.length; i++) {
    seed = ((seed << 5) - seed) + name.charCodeAt(i);
    seed |= 0;
  }

  // 3. Return the AI generated image URL with seed for consistency
  return `https://image.pollinations.ai/prompt/${prompt}?width=${size}&height=${size}&seed=${Math.abs(seed)}&nologo=true`;
};

/**
 * Get the local image URL for a product
 * @param {string} categorySlug - Category slug
 * @param {string} productSlug - Product slug
 * @param {string} view - View type ('front', 'side', 'back', 'detail')
 * @returns {string} Local image URL
 */
// Use relative path to allow proxying by frontend dev server (or same-origin in prod)
export const getLocalImage = (categorySlug, productSlug, view = 'front') => {
  return `/images/${categorySlug}/${productSlug}/${view}.jpg`;
};
