"""
SpillTrace - AIS Service
Loads, parses, and processes Automatic Identification System (AIS) vessel trajectories.
Computes Closest Point of Approach (CPA) and spatial-temporal metrics.
"""

import os
import math
from datetime import datetime
from typing import Dict, List, Any, Tuple
import pandas as pd
from backend.models.schemas import AISRecord

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")
AIS_CSV_PATH = os.path.join(DATA_DIR, "ais", "vessels.csv")

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two geographic points in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def cross_track_distance_km(p_lat: float, p_lon: float,
                            start_lat: float, start_lon: float,
                            end_lat: float, end_lon: float) -> float:
    """
    Computes perpendicular cross-track distance from point P to line segment Start-End in km.
    Approximated on local projected plane for short distances.
    """
    # Convert lat/lon degrees to local km coordinates relative to start point
    cos_lat = math.cos(math.radians(start_lat))
    kx = 111.0 * cos_lat
    ky = 111.0
    
    px = (p_lon - start_lon) * kx
    py = (p_lat - start_lat) * ky
    
    ex = (end_lon - start_lon) * kx
    ey = (end_lat - start_lat) * ky
    
    seg_len_sq = ex**2 + ey**2
    if seg_len_sq < 1e-6:
        return math.sqrt(px**2 + py**2)
        
    # Project point onto segment
    t = max(0.0, min(1.0, (px * ex + py * ey) / seg_len_sq))
    proj_x = t * ex
    proj_y = t * ey
    
    dist_km = math.sqrt((px - proj_x)**2 + (py - proj_y)**2)
    return dist_km

class AISService:
    def __init__(self):
        pass

    def load_ais_data(self, csv_path: str = AIS_CSV_PATH) -> List[AISRecord]:
        """Loads and validates AIS records from CSV."""
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"AIS CSV not found at: {csv_path}")

        try:
            df = pd.read_csv(csv_path)
        except Exception as e:
            raise ValueError(f"Failed to parse AIS CSV: {str(e)}")

        # Validate required columns
        required_cols = ["mmsi", "timestamp", "latitude", "longitude", "speed", "heading", "vessel_type"]
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            raise ValueError(f"Malformed AIS CSV. Missing columns: {missing}")

        records = []
        for _, row in df.iterrows():
            try:
                # Basic range validation
                lat = float(row["latitude"])
                lon = float(row["longitude"])
                if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                    continue
                    
                records.append(AISRecord(
                    mmsi=str(row["mmsi"]),
                    vessel_name=str(row.get("vessel_name", f"Vessel-{row['mmsi']}")),
                    timestamp=str(row["timestamp"]),
                    latitude=lat,
                    longitude=lon,
                    speed=float(row["speed"]),
                    heading=float(row["heading"]),
                    vessel_type=str(row["vessel_type"]),
                    flag=str(row.get("flag", "Unknown")),
                    draught=float(row.get("draught", 0.0)),
                    destination=str(row.get("destination", "N/A"))
                ))
            except Exception:
                continue

        return records

    def group_by_vessel(self, records: List[AISRecord]) -> Dict[str, List[AISRecord]]:
        """Groups AIS records by MMSI and sorts chronologically."""
        grouped: Dict[str, List[AISRecord]] = {}
        for rec in records:
            if rec.mmsi not in grouped:
                grouped[rec.mmsi] = []
            grouped[rec.mmsi].append(rec)

        for mmsi in grouped:
            grouped[mmsi].sort(key=lambda r: r.timestamp)

        return grouped

    def compute_vessel_cpa(
        self,
        trajectory: List[AISRecord],
        target_lat: float,
        target_lon: float
    ) -> Tuple[float, AISRecord]:
        """
        Computes the Closest Point of Approach (CPA) distance in km and returns
        the corresponding AIS record at CPA.
        """
        if not trajectory:
            raise ValueError("Trajectory cannot be empty")

        min_dist = float("inf")
        cpa_record = trajectory[0]

        for record in trajectory:
            dist = haversine_distance_km(record.latitude, record.longitude, target_lat, target_lon)
            if dist < min_dist:
                min_dist = dist
                cpa_record = record

        return round(min_dist, 3), cpa_record

ais_service = AISService()
