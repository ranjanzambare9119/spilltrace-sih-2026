/**
 * SpillTrace API Client
 * Interfaces with the FastAPI backend endpoints.
 * Dynamically resolves backend base URL from VITE_API_BASE_URL.
 */

const rawBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://spilltrace-sih-2026.onrender.com' : 'http://127.0.0.1:8000');
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

export async function getScenarios() {
  const res = await fetch(`${API_BASE}/satellite/scenarios`);
  if (!res.ok) throw new Error('Failed to fetch scenarios');
  return res.json();
}

export async function analyzeSatellite(filename = 'sample_spill.png', scenario = null) {
  let url = `${API_BASE}/satellite/analyze?filename=${encodeURIComponent(filename)}`;
  if (scenario) {
    url += `&scenario=${encodeURIComponent(scenario)}`;
  }
  const res = await fetch(url, {
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

export async function predictForwardDrift(forecastHours = 6.0, filename = 'demo_sar_oil.png') {
  const url = `${API_BASE}/drift/forward?forecast_hours=${forecastHours}&filename=${encodeURIComponent(filename)}`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error('Forward drift prediction failed');
  return res.json();
}

export async function getAtRiskVessels(forecastHours = 6.0) {
  const res = await fetch(`${API_BASE}/vessels/at-risk?forecast_hours=${forecastHours}`);
  if (!res.ok) throw new Error('Failed to fetch at-risk vessels');
  return res.json();
}

export async function verifyCandidate(mmsi, outcome, notes = null) {
  const res = await fetch(`${API_BASE}/investigation/verify-candidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mmsi: String(mmsi),
      verification_outcome: outcome,
      inspector_notes: notes
    })
  });
  if (!res.ok) throw new Error('Candidate verification failed');
  return res.json();
}

export async function getTimeline() {
  const res = await fetch(`${API_BASE}/investigation/timeline`);
  if (!res.ok) throw new Error('Failed to fetch investigation timeline');
  return res.json();
}

export async function recordTimelineEvent(eventType, title, description, actor = 'Investigator (Human-in-the-Loop)', badgeColor = 'blue') {
  const res = await fetch(`${API_BASE}/investigation/timeline/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: eventType,
      title,
      description,
      actor,
      badge_color: badgeColor
    })
  });
  if (!res.ok) throw new Error('Failed to record timeline event');
  return res.json();
}

export async function getRecommendedActions() {
  const res = await fetch(`${API_BASE}/response/recommended-actions`);
  if (!res.ok) throw new Error('Failed to fetch recommended actions');
  return res.json();
}
