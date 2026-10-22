/**
 * AgilePay API client — thin fetch wrapper for Next.js → FastAPI calls.
 *
 * Usage:
 *   import { apiPost, apiGet, apiPatch, apiDelete } from '@/lib/api'
 *
 *   // With Supabase JWT (dashboard pages)
 *   const data = await apiGet('/v1/merchants/me', session.access_token)
 *
 *   // With API key (SDK / developer pages)
 *   const charge = await apiPost('/v1/charges', payload, 'sk_test_xxx')
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL // e.g. https://agilepay-api.railway.app

/**
 * Build request headers.
 * @param {string | null} token  Supabase JWT or API key (sk_test_xxx / sk_live_xxx)
 * @param {object}        extra  Any extra headers to merge
 */
function buildHeaders(token, extra = {}) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

/**
 * Parse the response.
 * Throws a descriptive Error on non-2xx status.
 */
async function handleResponse(res) {
  if (res.ok) {
    // 204 No Content
    if (res.status === 204) return null
    return res.json()
  }

  let message = `Request failed: ${res.status} ${res.statusText}`
  try {
    const body = await res.json()
    message = body.detail || body.message || message
  } catch {
    // ignore JSON parse errors — keep the status-based message
  }
  const err = new Error(message)
  err.status = res.status
  throw err
}

// ── HTTP verbs ────────────────────────────────────────────────────────────────

/**
 * GET  /v1/...
 * @param {string}      path   API path, e.g. '/v1/merchants/me'
 * @param {string|null} token  Bearer token
 */
export async function apiGet(path, token = null) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: buildHeaders(token),
  })
  return handleResponse(res)
}

/**
 * POST /v1/...
 * @param {string}      path   API path
 * @param {object}      body   Request payload
 * @param {string|null} token  Bearer token
 */
export async function apiPost(path, body = {}, token = null) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(body),
  })
  return handleResponse(res)
}

/**
 * PATCH /v1/...
 */
export async function apiPatch(path, body = {}, token = null) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: buildHeaders(token),
    body: JSON.stringify(body),
  })
  return handleResponse(res)
}

/**
 * DELETE /v1/...
 */
export async function apiDelete(path, token = null) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  })
  return handleResponse(res)
}

// ── Convenience wrappers ──────────────────────────────────────────────────────

/** Fetch the authenticated merchant's profile. */
export const getMerchantProfile = (token) => apiGet('/v1/merchants/me', token)

/** Fetch KYC status + verification link. */
export const getKycStatus = (token) => apiGet('/v1/merchants/me/kyc', token)

/** List all transactions (dashboard). */
export const getTransactions = (token, limit = 20, offset = 0) =>
  apiGet(`/v1/transactions?limit=${limit}&offset=${offset}`, token)

/** List all payment links. */
export const getLinks = (token) => apiGet('/v1/links', token)

/** Create a payment link. */
export const createLink = (payload, token) => apiPost('/v1/links', payload, token)

/** List API keys (DEVELOPER only). */
export const getApiKeys = (token) => apiGet('/v1/api-keys', token)

/** Create an API key (DEVELOPER only). */
export const createApiKey = (payload, token) => apiPost('/v1/api-keys', payload, token)

/** Revoke an API key. */
export const revokeApiKey = (keyId, token) => apiDelete(`/v1/api-keys/${keyId}`, token)

/** List registered destinations (uses API key). */
export const getDestinations = (apiKey) => apiGet('/v1/destinations', apiKey)

/** Register a new destination (uses API key). */
export const createDestination = (payload, apiKey) =>
  apiPost('/v1/destinations', payload, apiKey)

/** Create a charge (DEVELOPER SDK, uses API key). */
export const createCharge = (payload, apiKey) =>
  apiPost('/v1/charges', payload, apiKey)

/** Get a single charge by ID. */
export const getCharge = (chargeId, apiKey) =>
  apiGet(`/v1/charges/${chargeId}`, apiKey)

// ── Remittance (INDIVIDUAL accounts) ─────────────────────────────────────────

export const submitRemittanceKyc = (payload, token) =>
  apiPost('/v1/remittance/kyc', payload, token)

export const createDeposit = (payload, token) =>
  apiPost('/v1/remittance/deposit', payload, token)

export const getRecipients = (token) =>
  apiGet('/v1/remittance/recipients', token)

export const addRecipient = (payload, token) =>
  apiPost('/v1/remittance/recipients', payload, token)

export const lockExchangeRate = (payload, token) =>
  apiPost('/v1/remittance/rate', payload, token)

export const sendRemittance = (payload, token) =>
  apiPost('/v1/remittance/send', payload, token)

export const getRemittanceHistory = (token, limit = 20) =>
  apiGet(`/v1/remittance/history?limit=${limit}`, token)
