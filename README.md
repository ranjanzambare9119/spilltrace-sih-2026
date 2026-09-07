# SpillTrace – AI-Assisted Maritime Oil Spill Source Attribution
**SIH 2026 Problem Statement 143**  
*“Leveraging satellite imagery to determine Oil spills at sea along with AIS data correlations to identify vessel responsible for the spill.”*

---

## 1. Project Overview & Objective

Maritime oil spills cause catastrophic ecological, economic, and coastal devastation. While Synthetic Aperture Radar (SAR) satellites (such as Sentinel-1) can detect surface slicks regardless of cloud cover or darkness, linking a detected slick back to the specific offending vessel is challenging due to:
- Time delays between illegal discharge and satellite overpass (often 4–12 hours)
- Oceanographic drift caused by surface currents and wind drag (leeway)
- High vessel density in international shipping lanes

**SpillTrace** provides an end-to-end **AI-Assisted Decision Support System** that bridges satellite Earth observation with Automatic Identification System (AIS) vessel telemetry. By combining deep-learning SAR segmentation with backward hydrodynamic leeway drift modeling and a transparent 5-factor scoring engine, SpillTrace computes an explainable **Source-Likelihood Score** to prioritize candidate vessels for maritime law enforcement (Coast Guard, DG Shipping).

> ### ⚖️ Decision Support & Legal Terminology Notice
> In accordance with international maritime jurisprudence, SpillTrace **never** claims legal guilt or conclusive culpability. The system provides decision support through rigorous, non-incriminating terminology:
> - **Possible Oil Spill** (not "confirmed culprit slick")
> - **Probable Origin Region** (with dispersion uncertainty bounds)
> - **Candidate Vessel** (not "guilty vessel" or "perpetrator")
> - **Source-Likelihood Score (0–100)** (not "probability of guilt")

---

## 2. System Architecture

```
                                      ┌────────────────────────┐
                                      │  Synthetic / Real SAR  │
                                      │  Satellite Image (IW)  │
                                      └───────────┬────────────┘
                                                  │
                                                  ▼
┌─────────────────────────┐           ┌────────────────────────┐
│  Surface Current & Wind │           │   AI U-Net Detector    │
│  Oceanographic Vectors  │           │   (SAR Segmentation)   │
└────────────┬────────────┘           └───────────┬────────────┘
             │                                    │
             │   ┌────────────────────────────────┘
             ▼   ▼
┌─────────────────────────────┐       ┌────────────────────────┐
│  Backward Hydrodynamic      │       │  AIS Vessel Trajectory │
│  Leeway Drift Engine        │       │  Time-Series Telemetry │
└────────────┬────────────────┘       └───────────┬────────────┘
             │                                    │
             ▼                                    ▼
┌──────────────────────────────────────────────────────────────┐
│        Explainable 5-Factor Attribution Engine               │
│                                                              │
│  1. Distance to Probable Origin (30%)                        │
│  2. Release Window Time Match (25%)                          │
│  3. Drift Plume Corridor Consistency (20%)                   │
│  4. Heading & Route Alignment (15%)                          │
│  5. Vessel Risk Profile & Carriage Class (10%)               │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│               Interactive Decision Support UI                │
│                                                              │
│  • Tactical Leaflet Map with Multi-Layer Overlays            │
│  • Ranked Candidate Leaderboard & "Why This Vessel?" Cards   │
│  • Exportable Formal Maritime Incident Attribution Dossier   │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

- **Backend**: Python 3.14 / 3.11+, FastAPI, Uvicorn, Pydantic v2, NumPy, Pandas, Pillow
- **Frontend**: React 18, Vite 6, Leaflet 1.9, Lucide React, Modern CSS (Maritime Tactical Theme)
- **Mapping & Geospatial**: Leaflet with CartoDB Dark Matter tiles, great-circle distance (Haversine), cross-track orthogonal projection
- **ML / AI Architecture**: Modular `BaseOilSpillDetector` with `MockUNetDetector` (designed for plug-and-play PyTorch/ONNX U-Net weights)

---

## 4. Attribution Scoring Formulation

The system scores candidate vessels across 5 transparent, physical dimensions totaling 100 points:

| Factor | Weight | Formulation & Metric | Description |
|---|---|---|---|
| **Distance to Probable Origin** | **30%** | $S_{\text{dist}} = 30 \cdot \exp\left(-\frac{d_{\text{cpa}}^2}{2 \sigma_d^2}\right)$ | Gaussian decay relative to Closest Point of Approach (CPA) to probable origin center ($\sigma_d = 4.0\text{ km}$). |
| **Time Match with Release** | **25%** | $S_{\text{time}} = 25 \cdot \exp\left(-\frac{\Delta t^2}{2 \sigma_t^2}\right)$ | Temporal difference between vessel transit and estimated release window ($\sigma_t = 1.75\text{ hrs}$). Gated by spatial proximity. |
| **Drift Corridor Consistency** | **20%** | $S_{\text{drift}} = 20 \cdot \exp\left(-\frac{d_{\text{corridor}}^2}{2 \sigma_{\text{drift}}^2}\right)$ | Minimum cross-track offset from vessel path to the backward leeway drift axis. |
| **Heading & Course Alignment** | **15%** | $S_{\text{hdg}} = 15 \cdot \cos^2\left(\frac{\Delta\theta}{2}\right)$ | Alignment between vessel course over ground and surface drift/shipping corridor. |
| **Vessel Risk & Carriage Class** | **10%** | Crude Tanker: 9.5, Chemical: 8.5, Bulk: 6.0, Container: 5.0, Fishing: 2.0 | Operational carriage risk of persistent hydrocarbon cargo or bunker capacity. |

**Total Score**:
$$S_{\text{total}} = \min\left(100, \, \max\left(0, \, S_{\text{dist}} + S_{\text{time}} + S_{\text{drift}} + S_{\text{hdg}} + S_{\text{type}}\right)\right)$$

---

## 5. Directory Structure

```
PS143_SpillTrace/
├── backend/
│   ├── main.py                     # FastAPI application & static mounts
│   ├── api/
│   │   └── endpoints.py            # REST endpoints for satellite, drift, AIS & attribution
│   ├── services/
│   │   ├── satellite_service.py    # Satellite scene ingestion & ML segmentation
│   │   ├── drift_service.py        # Vector leeway drift modeling & origin estimation
│   │   ├── ais_service.py          # AIS trajectory parsing, CPA & spatial filtering
│   │   └── attribution_service.py  # 5-factor scoring formula & explainability generator
│   └── models/
│       └── schemas.py              # Pydantic data contracts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx          # Tactical header, badges, 2-min demo runner
│   │   │   ├── GuidedDemoMode.jsx  # Full-screen automated 2-minute interactive demo experience
│   │   │   ├── MaritimeMap.jsx     # Leaflet map with multi-layer overlays
│   │   │   ├── DashboardView.jsx   # Executive KPI cards & situational map
│   │   │   ├── SatelliteAnalysisView.jsx # SAR image viewer & mask overlay slider
│   │   │   ├── OriginAnalysisView.jsx    # Leeway vector controls & origin envelope
│   │   │   ├── VesselCorrelationView.jsx # AIS filters, records table & tracks
│   │   │   ├── InvestigationView.jsx     # Candidate leaderboard & factor bars
│   │   │   ├── VesselDetailModal.jsx     # "Why is this vessel ranked highly?" modal
│   │   │   └── InvestigationReportModal.jsx # Formal printable incident briefing
│   │   ├── api/
│   │   │   └── client.js           # Fetch API client
│   │   ├── App.jsx                 # View routing & pipeline state manager
│   │   ├── index.css               # Maritime command center dark theme
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js              # Proxy configured to backend on :8000
│   └── index.html
│
├── ml/
│   └── detector_interface.py       # Modular BaseOilSpillDetector interface
│
├── data/
│   ├── satellite/
│   │   └── sample_spill.png        # Synthetic Sentinel-1 SAR C-Band backscatter
│   ├── masks/
│   │   └── sample_spill_mask.png   # Binary segmentation mask
│   ├── ais/
│   │   └── vessels.csv             # 105 AIS records across 5 candidate vessels
│   ├── environment/
│   │   └── environment.json        # Wind and current vectors
│   └── spill_metadata.json         # Ground truth scenario properties
│
├── scripts/
│   └── generate_demo_data.py       # Reproducible demo dataset generator
│
├── README.md
└── .gitignore
```

---

## LOCAL DEVELOPMENT

### Prerequisites
- Python 3.10+ (Tested with Python 3.14)
- Node.js v18+ (Tested with Node v25.9 & npm 11.12)

### 1. Backend Setup
```bash
# In the project root (PS143_SpillTrace):
pip install -r backend/requirements.txt

# Run the FastAPI server:
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Server: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
# In a new terminal:
cd frontend
npm install

# Start Vite development server:
npm run dev
```
- Frontend UI: `http://127.0.0.1:5173`

---

## DEPLOYMENT

### 1. Backend Deployment (Render)
SpillTrace backend is deployed as a **Render Web Service**:

1. Log in to [Render](https://render.com) and click **New + → Web Service**.
2. Connect your GitHub repository: `PS143_SpillTrace`.
3. Configure the service settings:
   - **Name**: `spilltrace-backend`
   - **Environment**: `Python 3`
   - **Region**: Closest to your users (e.g. `Singapore` or `Frankfurt`)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (repository root)
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables** in the Render Dashboard:
   - `FRONTEND_URL`: `https://<your-vercel-app-name>.vercel.app` (or comma-separated list of origins)
   - `PYTHON_VERSION`: `3.11.9`
5. Click **Create Web Service**. Once deployed, copy your Render service URL (e.g. `https://spilltrace-backend.onrender.com`).

### 2. Frontend Deployment (Vercel)
SpillTrace frontend is deployed on [Vercel](https://vercel.com):

1. Log in to Vercel and click **Add New... → Project**.
2. Import your GitHub repository: `PS143_SpillTrace`.
3. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` *(click "Edit" and select the `frontend` directory)*
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
   - **Install Command**: `npm install` (default)
4. Add **Environment Variable** in the Vercel Dashboard:
   - `VITE_API_BASE_URL`: `https://spilltrace-backend.onrender.com` *(Paste your live Render URL without trailing slash)*
5. Click **Deploy**. Vercel will build and assign a production URL (e.g. `https://spilltrace.vercel.app`).

---

## ENVIRONMENT VARIABLES

| Variable Name | Service | Required? | Default (Local) | Production Example | Description |
|---|---|---|---|---|---|
| `VITE_API_BASE_URL` | Frontend (Vercel) | Yes | `http://127.0.0.1:8000` | `https://spilltrace-backend.onrender.com` | Base URL of the FastAPI backend for REST requests and static assets. |
| `FRONTEND_URL` | Backend (Render) | Yes | `http://localhost:5173` | `https://spilltrace.vercel.app` | Allowed CORS origin(s) for frontend clients (comma-separated or `*`). Vercel preview domains (`*.vercel.app`) are allowed automatically. |
| `PORT` | Backend (Render) | Set by Cloud | `8000` | `$PORT` (assigned by Render) | Network port for Uvicorn server binding. |
| `HOST` | Backend (Render) | Optional | `0.0.0.0` | `0.0.0.0` | Network host interface binding. |
| `RELOAD` | Backend (Render) | Optional | `false` | `false` | Enable live-reload in development (`true`/`false`). |

---

## 7. Fast 2-Minute Demonstration Workflow

1. **Open Dashboard**:
   Navigate to `http://127.0.0.1:5173`. Notice the `[PROTOTYPE / DEMO DATA]` indicator and executive zero-scroll KPI metric cards.
2. **Automated 2-Minute Guided Demo**:
   Click the **"Run 2-Min Demo Flow"** button in the header (or dashboard). The system launches a full-screen guided interactive presentation that automatically steps through:
   - **Step 1 — Detect (Satellite SAR)**: Displays the Sentinel-1 SAR imagery with interactive oil slick segmentation overlay, highlighting the detected spill ($14.85\text{ km}^2$, 94.2% detection confidence).
   - **Step 2 — Trace Origin (Backward Drift)**: Smoothly transitions to the tactical maritime chart, computing backward leeway drift (wind 14 kts @ 65°, current 1.2 kts @ 50°) to establish the Probable Origin Region ($18.8602^\circ\text{ N}, 72.2677^\circ\text{ E}$) with $\pm 3.5\text{ km}$ dispersion envelope.
   - **Step 3 — Trace Vessels (AIS Ingestion)**: Sequentially animates candidate vessel tracks along the shipping corridor, demonstrating temporal-spatial filtering.
   - **Step 4 — Rank Top Candidate**: Focuses the camera on the origin-corridor intersection, draws the origin correlation vector, and reveals the top candidate: **#1 MT Ocean Pioneer - DEMO** ($87.0/100$, Strong Candidate).
   - **Step 5 — Summary & Dossier**: Summarizes the 5-factor physical attribution evidence with one-click access to the full legal-grade investigation dossier.
   *(Full presenter controls available: Play, Pause, Next Step, Prev Step, Restart, and Exit).*
3. **Inspect Explainability**:
   Click **"View Why"** on the Top Candidate card to see human-readable justifications (e.g. *Passed within 0.24 km of probable origin during the release window with heading aligned within 0.2° of the drift corridor*).
4. **Export Dossier**:
   Click **"Generate Incident Dossier"** to view and print the formal maritime incident attribution briefing.

---

## 8. Demo Scenario Data Specifications

The prepared dataset models an operational scenario in the **Arabian Sea off the approaches to Mumbai**:
- **Spill Location**: $18.9500^\circ\text{ N}, 72.4000^\circ\text{ E}$
- **Detection Time**: 2026-09-06 06:00:00 UTC
- **Wind**: 14 knots blowing towards 65° (ENE)
- **Current**: 1.2 knots flowing towards 50° (NE)
- **Probable Origin**: $18.8602^\circ\text{ N}, 72.2677^\circ\text{ E}$ (Discharge at ~00:30 UTC, 5.5 hours prior)

### Calibrated Candidate Vessel Leaderboard:
1. **MT Ocean Pioneer - DEMO (Crude Oil Tanker)** – **Score: 87.0/100** (`Strong Candidate`):
   - **Distance Score**: 26.5 / 30 (CPA: **0.24 km**, well within $\pm 3.5\text{ km}$ uncertainty radius)
   - **Time Score**: 22.0 / 25 (CPA Time: **00:30 UTC**, exact coincidence with estimated release window)
   - **Drift Score**: 17.5 / 20 (Cross-track offset: **0.01 km** from backward drift axis)
   - **Heading Score**: 13.0 / 15 (Course alignment: **0.2°** deviation from drift corridor)
   - **Risk Class**: 8.0 / 10 (Crude Oil Tanker — high-risk carriage)
2. **MV Arabian Star - DEMO (Bulk Carrier)** – **Score: 57.0/100** (`Moderate Candidate`):
   - CPA distance: 5.2 km south-east at 01:30 UTC
3. **MT Indus Glory - DEMO (Chemical Tanker)** – **Score: 28.0/100** (`Low Candidate`):
   - Crossed 6.5 km north-west at 22:30 UTC (2.5 hours prior to release window)
4. **Sagar Kanya - DEMO (Container Ship)** – **Score: 7.0/100** (`Unlikely`):
   - Crossed north-south channel 16.5 km away
5. **Fisheries 08 - DEMO (Fishing Trawler)** – **Score: 4.0/100** (`Unlikely`):
   - Loitering in coastal waters 22 km distant

---

## 9. Modular Future Extensions

The prototype is built with clean interfaces so production feeds can be slotted in without structural rewrites:
1. **Copernicus Open Access / Sentinel Hub API**: Ingest live GRD SAR scenes.
2. **PyTorch U-Net Checkpoint**: Swap `MockUNetDetector` with a model trained on the SAR Oil Spill Dataset (e.g., Keras/PyTorch `.pt` or `.onnx`).
3. **Live AIS Feeds**: Ingest NMEA / AIVDM streams via WebSocket or MarineTraffic / Spire APIs.
4. **NOAA GNOME / HYCOM**: Replace the 2D vector leeway formulation with full 3D hydrodynamic trajectory physics (windage, Langmuir circulation, evaporation weathering).
