/**
 * SpillTrace API Client
 * Interfaces with the FastAPI backend endpoints.
 * Dynamically resolves backend base URL from VITE_API_BASE_URL.
 */

const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const cleanBase = rawBase.replace(/\/+$/, '');

export const BACKEND_URL = cleanBase.endsWith('/api') ? cleanBase.slice(0, -4) : cleanBase;
export const API_BASE = cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;

/**
 * Returns full URL for static assets served by the backend (e.g. SAR imagery, segmentation masks)
 */
export function getStaticUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend offline');
  return res.json();
}

export async function getSatelliteImages() {
  const res = await fetch(`${API_BASE}/satellite/list`);
  if (!res.ok) throw new Error('Failed to fetch satellite scenes');
  return res.json();
}

export async function analyzeSatellite(filename = 'sample_spill.png') {
  const res = await fetch(`${API_BASE}/satellite/analyze?filename=${encodeURIComponent(filename)}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to analyze satellite imagery');
  return res.json();
}

export async function getEnvironment() {
  const res = await fetch(`${API_BASE}/environment`);
  if (!res.ok) throw new Error('Failed to fetch environmental data');
  return res.json();
}

export async function estimateDrift(spill = null, env = null, estimatedAgeHours = 5.5, uncertaintyKm = 3.5) {
  const url = `${API_BASE}/drift/estimate?estimated_age_hours=${estimatedAgeHours}&uncertainty_km=${uncertaintyKm}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(spill || {})
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Drift estimation failed (${res.status})`);
  }
  return res.json();
}

export async function getAISVessels() {
  const res = await fetch(`${API_BASE}/ais/vessels`);
  if (!res.ok) throw new Error('Failed to load AIS vessels');
  return res.json();
}

export async function correlateAttribution(maxDistKm = 35.0, estimatedAgeHours = 5.5) {
  const url = `${API_BASE}/attribution/correlate?max_distance_km=${maxDistKm}&estimated_age_hours=${estimatedAgeHours}`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error('Correlation analysis failed');
  return res.json();
}

export async function getInvestigationSummary() {
  const res = await fetch(`${API_BASE}/investigation/summary`);
  if (!res.ok) throw new Error('Failed to fetch investigation summary report');
  return res.json();
}
