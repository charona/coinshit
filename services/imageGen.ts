import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Generate a cartoon-like placeholder image URL for a product
 * Caches SVG in Firebase Storage
 */
export async function generatePlaceholderImage(productName: string): Promise<string> {
  // Use a placeholder service with a generated seed from product name
  const seed = hashString(productName);
  const filename = `placeholders/${seed}.svg`;

  try {
    // Check if already cached in Firebase Storage
    const storageRef = ref(storage, filename);
    try {
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      // Not cached, fetch and cache it
    }

    // Fetch SVG from DiceBear
    const svgUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=F7931A`;
    const response = await fetch(svgUrl);
    const svgText = await response.text();

    // Upload to Firebase Storage (silently fail if no permission)
    try {
      await uploadString(storageRef, svgText, 'raw', {
        contentType: 'image/svg+xml'
      });
      // Get the download URL
      return await getDownloadURL(storageRef);
    } catch (uploadError) {
      // Can't cache - fallback to direct URL
      return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=F7931A`;
    }
  } catch (error) {
    // Fallback to direct URL
    const seed = hashString(productName);
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=F7931A`;
  }
}

/**
 * Simple hash function to generate consistent seed from string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * TODO: Implement AI image generation
 * This would require an API key for services like:
 * - DALL-E (OpenAI)
 * - Stable Diffusion
 * - Midjourney
 *
 * Example implementation:
 * export async function generateAIImage(productName: string): Promise<string> {
 *   const response = await fetch('https://api.openai.com/v1/images/generations', {
 *     method: 'POST',
 *     headers: {
 *       'Authorization': `Bearer ${OPENAI_API_KEY}`,
 *       'Content-Type': 'application/json'
 *     },
 *     body: JSON.stringify({
 *       prompt: `A cartoon-style illustration of ${productName}`,
 *       n: 1,
 *       size: '512x512'
 *     })
 *   });
 *   const data = await response.json();
 *   return data.data[0].url;
 * }
 */
