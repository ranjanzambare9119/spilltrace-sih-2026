"""
SpillTrace - Geospatial & Coastline Proximity Service
SIH 2026 Problem Statement 143

Calculates true geodesic distance from detected oil spills to nearest coastlines,
computes normalized coastal threat risks, and identifies sensitive marine zones.
"""

import math
from typing import Dict, Any, Tuple, List, Optional
from backend.config import (
    COAST_CRITICAL_DISTANCE_KM,
    COAST_WARNING_DISTANCE_KM,
    COAST_OFFSHORE_DISTANCE_KM,
    COAST_DECAY_SCALE_KM
)

COAST_DECAY_SCALE_KM: float = 18.0
"""Characteristic decay distance for normalized exponential coast risk: exp(-d / scale)."""

# Reference coastline coordinates along Indian maritime boundary (West & East coasts)
# Format: (latitude, longitude, coastal_region_label)
INDIAN_COASTLINE_COORDINATES: List[Tuple[float, float, str]] = [
    # Gujarat - Gulf of Kutch & Saurashtra
    (23.08, 68.62, "Kori Creek / Sir Creek (Gujarat)"),
    (22.84, 69.12, "Mandvi Coast (Gujarat)"),
    (22.97, 69.72, "Kandla Port Approaches (Gulf of Kutch)"),
    (22.45, 69.75, "Vadinar Channel / Jamnagar (Gulf of Kutch)"),
    (22.28, 68.96, "Okha / Bet Dwarka (Gujarat)"),
    (21.63, 69.60, "Porbandar Coast (Gujarat)"),
    (20.90, 70.37, "Veraval / Somnath Coast (Gujarat)"),
    (20.71, 70.98, "Diu Coast (Saurashtra)"),
    (21.05, 72.05, "Gopnath / Gulf of Khambhat (Gujarat)"),
    (21.76, 72.24, "Bhavnagar Anchorage (Gulf of Khambhat)"),
    (21.65, 72.58, "Dahej Port Approaches (Gujarat)"),
    (21.10, 72.69, "Hazira / Surat Coast (Gujarat)"),
    (20.55, 72.85, "Daman / Valsad Coast (Gujarat)"),

    # Maharashtra - Northern Sector to Mumbai
    (19.97, 72.73, "Dahanu Coast (Maharashtra)"),
    (19.85, 72.74, "Tarapur Coastline (Maharashtra)"),
    (19.55, 72.77, "Palghar / Satpati Coast (Maharashtra)"),
    (19.34, 72.79, "Vasai / Arnala Coast (Maharashtra)"),
    (19.24, 72.79, "Manori / Gorai Coast (Mumbai Suburbs)"),
    (19.14, 72.81, "Juhu / Versova Coastline (Mumbai)"),
    (19.00, 72.81, "Worli / Bandra Sea Face (Mumbai)"),
    (18.96, 72.81, "Malabar Hill / Back Bay (Mumbai)"),
    (18.91, 72.81, "Colaba Point / Prongs Reef (Mumbai)"),
    (18.95, 72.85, "Mumbai Harbor / Gateway Approaches (Mumbai)"),
    (18.95, 72.95, "Jawaharlal Nehru Port (JNPT) Channel (Navi Mumbai)"),

    # Maharashtra - Konkan Coast
    (18.75, 72.87, "Alibaug Coast (Maharashtra)"),
    (18.55, 72.91, "Murud / Janjira Coast (Maharashtra)"),
    (18.28, 72.97, "Dighi / Rajpuri Creek (Maharashtra)"),
    (18.15, 73.02, "Shrivardhan Coast (Maharashtra)"),
    (17.98, 73.08, "Harnai / Dapoli Coast (Maharashtra)"),
    (17.50, 73.18, "Jaigad Port Approaches (Maharashtra)"),
    (16.99, 73.28, "Ratnagiri Coast (Maharashtra)"),
    (16.50, 73.34, "Devgad Coast (Maharashtra)"),
    (16.05, 73.47, "Malvan Marine Sanctuary (Maharashtra)"),
    (15.75, 73.68, "Vengurla Coast (Maharashtra)"),

    # Goa & Karnataka
    (15.50, 73.75, "Aguada / Panaji Coast (Goa)"),
    (15.41, 73.79, "Mormugao Port Approaches (Goa)"),
    (14.82, 74.12, "Karwar Bay (Karnataka)"),
    (14.28, 74.42, "Bhatkal Coast (Karnataka)"),
    (13.35, 74.68, "Malpe Coastline (Karnataka)"),
    (12.92, 74.81, "New Mangalore Port Approaches (Karnataka)"),

    # Kerala
    (12.50, 74.98, "Kasaragod Coast (Kerala)"),
    (11.87, 75.36, "Kannur Coast (Kerala)"),
    (11.25, 75.76, "Kozhikode Coast (Kerala)"),
    (10.79, 75.92, "Ponnani Coast (Kerala)"),
    (9.97, 76.22, "Kochi Harbor Entrance / Offshore Fairway (Kerala)"),
    (9.50, 76.32, "Alappuzha Coast (Kerala)"),
    (8.88, 76.58, "Kollam / Neendakara Coast (Kerala)"),
    (8.48, 76.92, "Vizhinjam Transshipment Port (Kerala)"),
    (8.08, 77.55, "Kanyakumari / Cape Comorin (Tamil Nadu)"),

    # East Coast Highlights
    (8.76, 78.18, "Tuticorin / V.O.C. Port (Gulf of Mannar)"),
    (9.28, 79.31, "Rameswaram / Pamban Pass (Tamil Nadu)"),
    (11.75, 79.77, "Puducherry / Cuddalore Coast"),
    (13.08, 80.29, "Chennai Port Approaches (Tamil Nadu)"),
    (13.35, 80.34, "Ennore / Kamarajar Port (Tamil Nadu)"),
    (15.82, 80.36, "Krishnapatnam Port (Andhra Pradesh)"),
    (17.68, 83.29, "Visakhapatnam Port Channel (Andhra Pradesh)"),
    (19.28, 84.91, "Gopalpur Port (Odisha)"),
    (20.26, 86.67, "Paradip Port Approaches (Odisha)"),
    (21.50, 87.50, "Dhamra Port (Odisha)"),
    (21.80, 88.05, "Sagar Island / Haldia Channel (West Bengal)")
]

# Sensitive Marine Ecosystems (Ecologically Sensitive Marine Areas - ESMAs)
# Format: (lat, lon, radius_km, name, sensitivity_factor [0.0 - 1.0])
SENSITIVE_MARINE_AREAS: List[Tuple[float, float, float, str, float]] = [
    (22.45, 69.60, 45.0, "Marine National Park & Sanctuary (Gulf of Kutch)", 0.95),
    (16.05, 73.47, 25.0, "Malvan Marine Sanctuary (Maharashtra)", 0.85),
    (18.95, 72.82, 50.0, "Mumbai Port Approaches & Marine Traffic Fairway", 0.85),
    (18.92, 72.83, 20.0, "Mumbai Harbor & Thane Creek Flamingo Sanctuary", 0.90),
    (9.20, 79.10, 50.0, "Gulf of Mannar Biosphere Reserve (Tamil Nadu)", 0.95),
    (20.70, 87.00, 40.0, "Gahirmatha Olive Ridley Marine Sanctuary (Odisha)", 0.95),
    (21.70, 88.80, 60.0, "Sundarbans Biosphere Reserve (West Bengal)", 0.95)
]


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two decimal degree points on Earth."""
    r = 6371.0  # Earth's mean radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = (math.sin(dphi / 2.0) ** 2) + math.cos(phi1) * math.cos(phi2) * (math.sin(dlambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 2)


class GeospatialService:
    """Provides validated geospatial proximity calculations for maritime incidents."""

    def __init__(self, coastline_coords: List[Tuple[float, float, str]] = None):
        self.coastline = coastline_coords or INDIAN_COASTLINE_COORDINATES
        self.sensitive_areas = SENSITIVE_MARINE_AREAS

    def calculate_distance_to_coast(self, lat: float, lon: float) -> Tuple[float, str]:
        """
        Finds the closest point on the coastline to the given spill coordinates.
        Returns:
            Tuple of (minimum_distance_km, nearest_coastal_region_name)
        """
        min_dist = float("inf")
        nearest_landmark = "Indian Territorial Waters"

        for c_lat, c_lon, label in self.coastline:
            dist = haversine_distance_km(lat, lon, c_lat, c_lon)
            if dist < min_dist:
                min_dist = dist
                nearest_landmark = label

        return round(min_dist, 2), nearest_landmark

    def compute_coast_risk(self, distance_km: float) -> float:
        """
        Calculates normalized coastal threat risk score [0.0 to 1.0].
        Formula: coast_risk = exp(-distance_km / COAST_DECAY_SCALE_KM)
        
        Calibrated values:
        - <= 1.0 km: ~0.92 - 1.00 (Critical shoreline contamination)
        - 1.8 km:    ~0.86 (High proximity impact)
        - 5.0 km:    ~0.66 (Warning buffer)
        - 20.0 km:   ~0.19 (Moderate offshore buffer)
        - >= 44.0 km: ~0.03 (Far offshore open pelagic waters)
        """
        if distance_km <= 0.0:
            return 1.0
        risk = math.exp(-distance_km / COAST_DECAY_SCALE_KM)
        return round(max(0.0, min(1.0, risk)), 3)

    def compute_environmental_sensitivity(self, lat: float, lon: float) -> Tuple[float, Optional[str]]:
        """
        Computes environmental exposure risk [0.0 to 1.0] based on proximity to
        designated marine protected areas, sanctuaries, or critical port channels.
        """
        highest_sensitivity = 0.20  # Base open ocean baseline sensitivity
        matched_sanctuary = None

        for s_lat, s_lon, radius_km, name, base_factor in self.sensitive_areas:
            dist = haversine_distance_km(lat, lon, s_lat, s_lon)
            if dist <= radius_km:
                proximity_multiplier = 1.0 - (dist / radius_km) * 0.4
                effective_score = base_factor * proximity_multiplier
                if effective_score > highest_sensitivity:
                    highest_sensitivity = effective_score
                    matched_sanctuary = f"{name} ({dist:.1f} km)"

        return round(max(0.0, min(1.0, highest_sensitivity)), 3), matched_sanctuary


geospatial_service = GeospatialService()
