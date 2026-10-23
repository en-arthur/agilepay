/**
 * Backend base URL, normalised.
 *
 * `NEXT_PUBLIC_API_URL` is often pasted into Vercel with a trailing slash.
 * Concatenating a path that also starts with "/" then produces
 * `https://host//v1/...`, which FastAPI answers with 404 Not Found.
 * Strip trailing slashes once, here, so every caller can safely do
 * `${API_URL}${path}`.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '')
