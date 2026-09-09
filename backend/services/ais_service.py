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
from backend.models.schemas import AISRecord, AtRiskVessel, ForwardDriftPrediction

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

    def point_in_polygon(self, lat: float, lon: float, polygon: List[List[float]]) -> bool:
        """Standard ray casting algorithm for point in 2D polygon."""
        if not polygon or len(polygon) < 3:
            return False
        inside = False
        n = len(polygon)
        j = n - 1
        for i in range(n):
            lat_i, lon_i = polygon[i][0], polygon[i][1]
            lat_j, lon_j = polygon[j][0], polygon[j][1]
            
            if ((lat_i > lat) != (lat_j > lat)) and \
               (lon < (lon_j - lon_i) * (lat - lat_i) / (lat_j - lat_i + 1e-12) + lon_i):
                inside = not inside
            j = i
        return inside

    def identify_at_risk_vessels(
        self,
        records: List[AISRecord],
        forward_drift: ForwardDriftPrediction,
        is_confirmed: bool = False
    ) -> List[AtRiskVessel]:
        """
        Screens latest vessel positions against the forward drift corridor and exclusion zone.
        Categorizes vessels into:
        - INSIDE ZONE: vessel inside the exclusion polygon
        - APPROACHING: within 15 km and course directed towards the hazard
        - ON ROUTE: on affected commercial shipping fairway / approach corridor (>5 route vessels flagged when leak confirmed)
        - OUTSIDE RISK: beyond hazard zone
        """
        grouped = self.group_by_vessel(records)
        at_risk: List[AtRiskVessel] = []
        poly = forward_drift.exclusion_zone_polygon
        pred_lat = forward_drift.predicted_latitude
        pred_lon = forward_drift.predicted_longitude

        for mmsi, traj in grouped.items():
            if not traj:
                continue
            latest = traj[-1]  # Most recent telemetry point
            lat, lon = latest.latitude, latest.longitude
            
            # 1. Point in polygon test
            is_inside = self.point_in_polygon(lat, lon, poly)
            
            # 2. Distance to exclusion zone
            min_dist_to_zone = float("inf")
            for vertex in poly:
                d = haversine_distance_km(lat, lon, vertex[0], vertex[1])
                if d < min_dist_to_zone:
                    min_dist_to_zone = d

            # 3. Heading vector alignment
            d_lat = pred_lat - lat
            d_lon = (pred_lon - lon) * math.cos(math.radians(lat))
            bearing_to_hazard = (math.degrees(math.atan2(d_lon, d_lat))) % 360
            
            hdg_diff = abs(latest.heading - bearing_to_hazard) % 360
            if hdg_diff > 180:
                hdg_diff = 360 - hdg_diff
                
            is_heading_towards = hdg_diff <= 55.0

            # 4. State classification
            if is_inside or min_dist_to_zone < 0.8:
                risk_state = "INSIDE ZONE"
                eta_minutes = 0.0
            elif min_dist_to_zone <= 15.0 and is_heading_towards and latest.speed >= 2.0:
                risk_state = "APPROACHING"
                speed_kmh = latest.speed * 1.852
                eta_minutes = round((min_dist_to_zone / max(speed_kmh, 1.0)) * 60.0, 1)
            elif is_confirmed and (min_dist_to_zone <= 40.0 or (min_dist_to_zone <= 50.0 and is_heading_towards)):
                risk_state = "ON ROUTE"
                speed_kmh = max(latest.speed * 1.852, 6.0)
                eta_minutes = round((min_dist_to_zone / speed_kmh) * 60.0, 1)
            else:
                risk_state = "OUTSIDE RISK"
                eta_minutes = None

            at_risk.append(AtRiskVessel(
                mmsi=latest.mmsi,
                vessel_name=latest.vessel_name,
                vessel_type=latest.vessel_type,
                latitude=round(lat, 5),
                longitude=round(lon, 5),
                speed=latest.speed,
                heading=latest.heading,
                distance_to_zone_km=round(min_dist_to_zone, 2),
                risk_state=risk_state,
                eta_minutes=eta_minutes,
                notification_sent=False,
                last_updated=latest.timestamp
            ))

        state_priority = {"INSIDE ZONE": 0, "APPROACHING": 1, "ON ROUTE": 2, "OUTSIDE RISK": 3}
        at_risk.sort(key=lambda v: (state_priority[v.risk_state], v.distance_to_zone_km))
        return at_risk

ais_service = AISService()
