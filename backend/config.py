"""
SpillTrace - Centralized Configuration & Calibrated Thresholds
SIH 2026 Problem Statement 143

Defines operational thresholds for distinguishing large quantitative oil spills
from small/faint detections requiring appearance-based classification and monitoring.
"""

# ==============================================================================
# 1. QUANTITATIVE ESTIMATION THRESHOLDS
# ==============================================================================
# A spill must satisfy ALL three criteria (area, pixel count, confidence)
# to justify numerical volume calculation. Otherwise, false-precision is avoided
# and the system transitions to the appearance-based minor-spill pathway.

MIN_QUANTITATIVE_SPILL_AREA_KM2: float = 2.0
"""Minimum estimated slick area (in square kilometers) required for volumetric integration."""

MIN_QUANTITATIVE_PIXEL_COUNT: int = 500
"""Minimum number of segmented dark-slick SAR pixels required for morphological stability."""

MIN_QUANTITATIVE_DETECTION_CONFIDENCE: float = 0.75
"""Minimum detection confidence (0.0 - 1.0) required to justify quantitative volume modeling."""


# ==============================================================================
# 2. DETECTION CONFIDENCE CLASSIFICATION THRESHOLDS
# ==============================================================================
# Maps continuous detection confidence [0.0 - 1.0] into standardized operational classes.

HIGH_DETECTION_CONFIDENCE: float = 0.85
"""Confidence >= 0.85 indicates high radar backscatter contrast and clean morphological boundaries."""

MEDIUM_DETECTION_CONFIDENCE: float = 0.65
"""Confidence between 0.65 and 0.85 indicates moderate contrast; may be affected by sea clutter or wind damping."""

# Confidence < 0.65 is classified as LOW confidence.


# ==============================================================================
# 3. COASTLINE PROXIMITY & THREAT THRESHOLDS (km)
# ==============================================================================
# Proximity to nearest shoreline determines coastal vulnerability impact.

COAST_CRITICAL_DISTANCE_KM: float = 5.0
"""Discharges within 5 km pose immediate ecological and shoreline stranding danger."""

COAST_WARNING_DISTANCE_KM: float = 20.0
"""Discharges within 20 km require heightened coastal zone surveillance."""

COAST_OFFSHORE_DISTANCE_KM: float = 50.0
"""Discharges beyond 50 km are in open pelagic waters where immediate coastal risk is minimized."""

COAST_DECAY_SCALE_KM: float = 12.0
"""Characteristic decay distance for normalized exponential coast risk: exp(-d / scale)."""


# ==============================================================================
# 4. MULTI-FACTOR SEVERITY SCORING WEIGHTS (Total: 100 Points)
# ==============================================================================
# Severity is NEVER determined solely by spill size. It balances impact,
# proximity to coast, detection confidence, environmental sensitivity, and drift.

WEIGHT_SPILL_IMPACT: float = 35.0
"""Impact weight (35 pts max): scaled by area for major spills, or by appearance class for sheens."""

WEIGHT_COAST_PROXIMITY: float = 30.0
"""Coast proximity weight (30 pts max): proportional to normalized coastal risk."""

WEIGHT_DETECTION_CONFIDENCE: float = 15.0
"""Confidence weight (15 pts max): higher confidence yields higher operational priority."""

WEIGHT_ENVIRONMENTAL_SENSITIVITY: float = 10.0
"""Environmental sensitivity weight (10 pts max): marine sanctuaries, ports, and fisheries."""

WEIGHT_DRIFT_PERSISTENCE: float = 10.0
"""Drift persistence weight (10 pts max): accounts for drift speed and shoreward trajectory."""


# ==============================================================================
# 5. SEVERITY SCORE CLASSIFICATION THRESHOLDS (0 - 100 Points)
# ==============================================================================
SEVERITY_CRITICAL_THRESHOLD: float = 75.0
"""Score >= 75.0: Major incident or high-threat coastal convergence requiring immediate response."""

SEVERITY_HIGH_THRESHOLD: float = 50.0
"""Score between 50.0 and 74.9: Meaningful probable spill requiring active vessel correlation & inspection."""

SEVERITY_MEDIUM_THRESHOLD: float = 30.0
"""Score between 30.0 and 49.9: Moderate-impact incident requiring regular surveillance updates."""

# Score < 30.0: Classified as WATCHLIST for small/faint detections needing satellite rechecks.


# ==============================================================================
# 6. APPEARANCE-BASED SCORING PROFILE FOR SMALL SPILLS
# ==============================================================================
# Base points assigned in the impact component for non-quantified sheens:
APPEARANCE_RISK_POINTS = {
    "Thick/dark appearance": 18.0,
    "Rainbow sheen": 10.0,
    "Thin sheen": 6.0,
    "Uncertain appearance": 4.0
}
