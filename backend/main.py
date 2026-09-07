"""
SpillTrace - FastAPI Backend Server
SIH 2026 Problem Statement 143:
Leveraging satellite imagery to determine Oil spills at sea along with AIS data correlations.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.api.endpoints import router as api_router

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
SATELLITE_DIR = os.path.join(DATA_DIR, "satellite")
MASKS_DIR = os.path.join(DATA_DIR, "masks")

# Ensure static directories exist
os.makedirs(SATELLITE_DIR, exist_ok=True)
os.makedirs(MASKS_DIR, exist_ok=True)

app = FastAPI(
    title="SpillTrace - AI-Assisted Maritime Oil Spill Source Attribution",
    description="SIH 2026 Problem Statement 143 Decision Support API",
    version="1.0.0"
)

# Enable CORS for local frontend development and production Vercel URL
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

frontend_url_env = os.environ.get("FRONTEND_URL", "").strip()
allowed_origins = list(default_origins)

if frontend_url_env:
    if frontend_url_env == "*":
        allowed_origins = ["*"]
    else:
        for origin in frontend_url_env.split(","):
            cleaned = origin.strip().rstrip("/")
            if cleaned and cleaned not in allowed_origins:
                allowed_origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static image assets
app.mount("/static/satellite", StaticFiles(directory=SATELLITE_DIR), name="satellite")
app.mount("/static/masks", StaticFiles(directory=MASKS_DIR), name="masks")

# Register API routes
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "project": "SpillTrace",
        "description": "AI-Assisted Maritime Oil Spill Source Attribution",
        "competition": "Smart India Hackathon (SIH 2026)",
        "problem_statement": "PS-143",
        "docs_url": "/docs",
        "status": "ready"
    }

if __name__ == "__main__":
    import uvicorn
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    reload = os.environ.get("RELOAD", "false").lower() in ("true", "1")
    uvicorn.run("backend.main:app", host=host, port=port, reload=reload)
