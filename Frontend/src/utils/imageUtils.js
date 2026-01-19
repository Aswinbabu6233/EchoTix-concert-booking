/**
 * Image URL utilities for the EchoTix application.
 * These functions generate URLs for images served from the backend API.
 * Using these URLs instead of base64 significantly improves loading performance.
 */

const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Get the URL for a user's profile image
 * @param {string} userId - The user's MongoDB _id
 * @returns {string} The image URL
 */
export const getUserImageUrl = (userId) => {
  if (!userId) return null;
  return `${BASE_API}/images/user/${userId}`;
};

/**
 * Get the URL for a concert image
 * @param {string} concertId - The concert's MongoDB _id
 * @returns {string} The image URL
 */
export const getConcertImageUrl = (concertId) => {
  if (!concertId) return null;
  return `${BASE_API}/images/concert/${concertId}`;
};

/**
 * Get the URL for an artist's photo
 * @param {string} artistId - The artist's MongoDB _id
 * @returns {string} The image URL
 */
export const getArtistImageUrl = (artistId) => {
  if (!artistId) return null;
  return `${BASE_API}/images/artist/${artistId}`;
};

/**
 * Get the URL for a band image
 * @param {string} bandId - The band's MongoDB _id
 * @returns {string} The image URL
 */
export const getBandImageUrl = (bandId) => {
  if (!bandId) return null;
  return `${BASE_API}/images/band/${bandId}`;
};

/**
 * Legacy helper: Convert buffer to base64 string
 * @deprecated Use the image URL functions above instead for better performance
 */
export const arrayBufferToBase64 = (buffer) => {
  if (!buffer) return "";
  // If it's already a string, assume it's base64
  if (typeof buffer === "string") return buffer;

  // If it's a buffer object from MongoDB/Mongoose (often has a 'data' array)
  if (buffer.type === "Buffer" && Array.isArray(buffer.data)) {
    buffer = buffer.data;
  }

  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

/**
 * Legacy helper: Convert base64 to data URL (for backward compatibility)
 * @deprecated Use the image URL functions above instead
 */
export const getBase64ImageSrc = (imageData) => {
  if (!imageData?.data || !imageData?.contentType) return null;
  return `data:${imageData.contentType};base64,${imageData.data}`;
};
