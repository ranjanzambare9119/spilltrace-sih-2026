"""
SpillTrace - Demo Data Generator
SIH 2026 Problem Statement 143

Generates realistic local demo data:
1. data/satellite/sample_spill.png (Synthetic SAR C-Band backscatter image)
2. data/masks/sample_spill_mask.png (Matching binary slick mask)
3. data/ais/vessels.csv (Time-series AIS trajectories for candidate vessels)
4. data/environment/environment.json (Wind and current oceanographic parameters)
5. data/spill_metadata.json (Detected spill metadata and ground truth)
"""

import os
import json
import math
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from PIL import Image, ImageDraw, ImageFilter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
SATELLITE_DIR = os.path.join(DATA_DIR, "satellite")
MASKS_DIR = os.path.join(DATA_DIR, "masks")
AIS_DIR = os.path.join(DATA_DIR, "ais")
ENV_DIR = os.path.join(DATA_DIR, "environment")

for folder in [SATELLITE_DIR, MASKS_DIR, AIS_DIR, ENV_DIR]:
    os.makedirs(folder, exist_ok=True)

# -------------------------------------------------------------
# 1. GENERATE SAR SATELLITE IMAGE & SPILL MASK
# -------------------------------------------------------------
def generate_sar_image_and_mask(width=512, height=512):
    print("Generating synthetic Sentinel-1 SAR imagery and slick mask...")
    np.random.seed(143)
    
    # 1. Generate realistic radar backscatter speckle (Gamma/Rayleigh noise for sea clutter)
    x = np.linspace(0, 10 * np.pi, width)
    y = np.linspace(0, 10 * np.pi, height)
    xx, yy = np.meshgrid(x, y)
    
    # Gentle wave swells angled at ~50 degrees
    swell = 12 * np.sin(0.3 * (xx * np.cos(np.radians(50)) + yy * np.sin(np.radians(50))))
    
    # Speckle noise (Rayleigh distributed)
    speckle = np.random.rayleigh(scale=28, size=(height, width))
    base_sar = 120 + swell + speckle
    base_sar = np.clip(base_sar, 10, 250).astype(np.uint8)
    
    # 2. Generate slick mask with organic, elongated plume shape (oil slicks damp waves -> low backscatter)
    mask_img = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask_img)
    
    center_x, center_y = 270, 240
    num_nodes = 36
    angles = np.linspace(0, 2 * np.pi, num_nodes, endpoint=False)
    
    polygon_pts = []
    for a in angles:
        stretch = 1.0 + 1.2 * (np.cos(a - np.radians(55)) ** 2)
        r_base = 55 * stretch
        jitter = np.sin(3 * a) * 14 + np.cos(5 * a) * 8 + np.random.uniform(-4, 4)
        r = max(15, r_base + jitter)
        px = center_x + r * np.cos(a)
        py = center_y + r * np.sin(a)
        polygon_pts.append((px, py))
        
    draw.polygon(polygon_pts, fill=255)
    
    # Add a trailing tail / filament
    tail_pts = [
        (center_x - 30, center_y - 20),
        (center_x - 85, center_y - 65),
        (center_x - 130, center_y - 95),
        (center_x - 110, center_y - 85),
        (center_x - 50, center_y - 40)
    ]
    draw.polygon(tail_pts, fill=255)
    
    # Smooth edges
    mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=2.5))
    mask_np = np.array(mask_img)
    binary_mask = (mask_np > 110).astype(np.uint8) * 255
    
    # 3. Apply slick to SAR image: inside slick, backscatter is heavily dampened
    sar_with_slick = base_sar.copy()
    slick_indices = binary_mask > 0
    dampened_noise = np.random.normal(loc=38, scale=9, size=(height, width))
    sar_with_slick[slick_indices] = np.clip(dampened_noise[slick_indices], 10, 80).astype(np.uint8)
    
    edge_blend = mask_np.astype(float) / 255.0
    final_sar = (base_sar * (1.0 - edge_blend) + sar_with_slick * edge_blend).astype(np.uint8)
    
    sar_output_path = os.path.join(SATELLITE_DIR, "sample_spill.png")
    mask_output_path = os.path.join(MASKS_DIR, "sample_spill_mask.png")
    
    Image.fromarray(final_sar).save(sar_output_path)
    Image.fromarray(binary_mask).save(mask_output_path)
    print(f"Saved: {sar_output_path}")
    print(f"Saved: {mask_output_path}")
    
    return binary_mask

# -------------------------------------------------------------
# 2. GENERATE ENVIRONMENT & SPILL METADATA
# -------------------------------------------------------------
def generate_metadata():
    print("Generating environment and spill metadata...")
    spill_lat = 18.9500
    spill_lon = 72.4000
    detection_time_str = "2026-09-06T06:00:00Z"
    
    env_data = {
        "scenario_name": "Arabian Sea - Mumbai Approaches",
        "timestamp": detection_time_str,
        "wind_speed": 14.0,           # in knots
        "wind_direction": 65.0,        # degrees (towards direction)
        "current_speed": 1.2,          # in knots
        "current_direction": 50.0,     # degrees (towards direction)
        "sea_surface_temp_c": 28.4,
        "salinity_psu": 35.2,
        "leeway_factor": 0.035         # 3.5% of wind speed
    }
    
    env_path = os.path.join(ENV_DIR, "environment.json")
    with open(env_path, "w") as f:
        json.dump(env_data, f, indent=2)
    print(f"Saved: {env_path}")
    
    # Net drift = current_vec + 0.035 * wind_vec
    w_spd = env_data["wind_speed"] * env_data["leeway_factor"] # 0.49 kts
    w_rad = math.radians(env_data["wind_direction"])
    c_spd = env_data["current_speed"]                          # 1.20 kts
    c_rad = math.radians(env_data["current_direction"])
    
    net_dx = (c_spd * math.sin(c_rad)) + (w_spd * math.sin(w_rad))
    net_dy = (c_spd * math.cos(c_rad)) + (w_spd * math.cos(w_rad))
    net_speed_kts = math.sqrt(net_dx**2 + net_dy**2)          # ~1.67 kts
    net_dir_deg = (math.degrees(math.atan2(net_dx, net_dy))) % 360  # ~54.4°
    
    spill_age_hours = 5.5
    drift_dist_nm = net_speed_kts * spill_age_hours           # ~9.2 NM
    drift_dist_km = drift_dist_nm * 1.852                     # ~17.0 km
    
    back_bearing_deg = (net_dir_deg + 180) % 360              # ~234.4°
    back_rad = math.radians(back_bearing_deg)
    
    delta_lat = (drift_dist_km * math.cos(back_rad)) / 111.0
    delta_lon = (drift_dist_km * math.sin(back_rad)) / (111.0 * math.cos(math.radians(spill_lat)))
    
    prob_origin_lat = round(spill_lat + delta_lat, 4)
    prob_origin_lon = round(spill_lon + delta_lon, 4)
    
    spill_metadata = {
        "spill_id": "SP-20260906-001",
        "satellite_mission": "Sentinel-1B C-SAR",
        "acquisition_mode": "Interferometric Wide Swath (IW)",
        "polarization": "VV+VH",
        "detection_time": detection_time_str,
        "latitude": spill_lat,
        "longitude": spill_lon,
        "area_km2": 14.85,
        "perimeter_km": 21.4,
        "confidence": 0.942,
        "slick_thickness_estimate_um": 1.2,
        "estimated_volume_m3": 17800,
        "spill_age_hours_estimate": spill_age_hours,
        "net_drift_speed_kts": round(net_speed_kts, 2),
        "net_drift_direction_deg": round(net_dir_deg, 1),
        "probable_origin_latitude": prob_origin_lat,
        "probable_origin_longitude": prob_origin_lon,
        "origin_uncertainty_km": 3.5,
        "estimated_release_time_window": {
            "start": "2026-09-05T23:45:00Z",
            "estimated": "2026-09-06T00:30:00Z",
            "end": "2026-09-06T01:15:00Z"
        },
        "polygon_coordinates": [
            [round(spill_lat + 0.024, 4), round(spill_lon - 0.015, 4)],
            [round(spill_lat + 0.038, 4), round(spill_lon + 0.010, 4)],
            [round(spill_lat + 0.028, 4), round(spill_lon + 0.035, 4)],
            [round(spill_lat + 0.005, 4), round(spill_lon + 0.042, 4)],
            [round(spill_lat - 0.022, 4), round(spill_lon + 0.020, 4)],
            [round(spill_lat - 0.032, 4), round(spill_lon - 0.018, 4)],
            [round(spill_lat - 0.015, 4), round(spill_lon - 0.040, 4)],
            [round(spill_lat + 0.010, 4), round(spill_lon - 0.032, 4)]
        ]
    }
    
    meta_path = os.path.join(DATA_DIR, "spill_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(spill_metadata, f, indent=2)
    print(f"Saved: {meta_path}")
    
    return spill_metadata, prob_origin_lat, prob_origin_lon

# -------------------------------------------------------------
# 3. GENERATE REALISTIC AIS TRAJECTORIES
# -------------------------------------------------------------
def generate_ais_data(origin_lat, origin_lon):
    print("Generating realistic candidate vessel AIS trajectories...")
    base_time = datetime(2026, 9, 5, 21, 0, 0)
    timestamps = [base_time + timedelta(minutes=30 * i) for i in range(21)]
    
    records = []
    
    # 1. MT Ocean Pioneer (Crude Oil Tanker) -> Primary candidate
    v1_heading = 55.0
    v1_speed = 12.5
    step_km = (v1_speed * 0.5) * 1.852
    d_lat_1 = (step_km * math.cos(math.radians(v1_heading))) / 111.0
    d_lon_1 = (step_km * math.sin(math.radians(v1_heading))) / (111.0 * math.cos(math.radians(origin_lat)))
    
    for i, t in enumerate(timestamps):
        offset_steps = i - 7  # Step 7 is 00:30:00Z
        lat = origin_lat + 0.002 + (offset_steps * d_lat_1) + np.random.normal(0, 0.0005)
        lon = origin_lon + 0.001 + (offset_steps * d_lon_1) + np.random.normal(0, 0.0005)
        spd = round(v1_speed + np.random.uniform(-0.3, 0.3), 1)
        hdg = round(v1_heading + np.random.uniform(-1.5, 1.5), 1)
        records.append({
            "mmsi": "419001234",
            "vessel_name": "MT Ocean Pioneer",
            "timestamp": t.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "speed": spd,
            "heading": hdg,
            "vessel_type": "Crude Oil Tanker",
            "flag": "Marshall Islands",
            "draught": 14.8,
            "destination": "JNPT Mumbai"
        })
        
    # 2. MV Arabian Star (Bulk Carrier) -> Moderate candidate
    v2_heading = 48.0
    v2_speed = 11.2
    step_km_2 = (v2_speed * 0.5) * 1.852
    d_lat_2 = (step_km_2 * math.cos(math.radians(v2_heading))) / 111.0
    d_lon_2 = (step_km_2 * math.sin(math.radians(v2_heading))) / (111.0 * math.cos(math.radians(origin_lat)))
    cpa_lat_2 = origin_lat - 0.032
    cpa_lon_2 = origin_lon + 0.035
    
    for i, t in enumerate(timestamps):
        offset_steps = i - 9
        lat = cpa_lat_2 + (offset_steps * d_lat_2) + np.random.normal(0, 0.0005)
        lon = cpa_lon_2 + (offset_steps * d_lon_2) + np.random.normal(0, 0.0005)
        spd = round(v2_speed + np.random.uniform(-0.4, 0.4), 1)
        hdg = round(v2_heading + np.random.uniform(-2.0, 2.0), 1)
        records.append({
            "mmsi": "419005678",
            "vessel_name": "MV Arabian Star",
            "timestamp": t.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "speed": spd,
            "heading": hdg,
            "vessel_type": "Bulk Carrier",
            "flag": "Panama",
            "draught": 11.2,
            "destination": "Kandla"
        })
        
    # 3. MT Indus Glory (Chemical Tanker) -> Moderate-low candidate
    v3_heading = 235.0
    v3_speed = 13.0
    step_km_3 = (v3_speed * 0.5) * 1.852
    d_lat_3 = (step_km_3 * math.cos(math.radians(v3_heading))) / 111.0
    d_lon_3 = (step_km_3 * math.sin(math.radians(v3_heading))) / (111.0 * math.cos(math.radians(origin_lat)))
    cpa_lat_3 = origin_lat + 0.045
    cpa_lon_3 = origin_lon - 0.040
    
    for i, t in enumerate(timestamps):
        offset_steps = i - 3
        lat = cpa_lat_3 + (offset_steps * d_lat_3) + np.random.normal(0, 0.0005)
        lon = cpa_lon_3 + (offset_steps * d_lon_3) + np.random.normal(0, 0.0005)
        spd = round(v3_speed + np.random.uniform(-0.3, 0.3), 1)
        hdg = round(v3_heading + np.random.uniform(-1.5, 1.5), 1)
        records.append({
            "mmsi": "419009876",
            "vessel_name": "MT Indus Glory",
            "timestamp": t.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "speed": spd,
            "heading": hdg,
            "vessel_type": "Chemical Tanker",
            "flag": "Liberia",
            "draught": 9.5,
            "destination": "Fujairah"
        })
        
    # 4. Sagar Kanya (Container Ship) -> Low candidate
    v4_heading = 175.0
    v4_speed = 16.4
    step_km_4 = (v4_speed * 0.5) * 1.852
    d_lat_4 = (step_km_4 * math.cos(math.radians(v4_heading))) / 111.0
    d_lon_4 = (step_km_4 * math.sin(math.radians(v4_heading))) / (111.0 * math.cos(math.radians(origin_lat)))
    cpa_lat_4 = origin_lat - 0.02
    cpa_lon_4 = origin_lon - 0.155
    
    for i, t in enumerate(timestamps):
        offset_steps = i - 12
        lat = cpa_lat_4 + (offset_steps * d_lat_4) + np.random.normal(0, 0.0005)
        lon = cpa_lon_4 + (offset_steps * d_lon_4) + np.random.normal(0, 0.0005)
        spd = round(v4_speed + np.random.uniform(-0.5, 0.5), 1)
        hdg = round(v4_heading + np.random.uniform(-2.0, 2.0), 1)
        records.append({
            "mmsi": "419003456",
            "vessel_name": "Sagar Kanya",
            "timestamp": t.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "speed": spd,
            "heading": hdg,
            "vessel_type": "Container Ship",
            "flag": "India",
            "draught": 12.0,
            "destination": "Colombo"
        })
        
    # 5. Fisheries 08 (Fishing Vessel) -> Very low candidate
    v5_lat_base = origin_lat + 0.05
    v5_lon_base = origin_lon + 0.21
    for i, t in enumerate(timestamps):
        lat = v5_lat_base + 0.008 * math.sin(0.4 * i)
        lon = v5_lon_base + 0.006 * math.cos(0.5 * i)
        spd = round(3.2 + np.random.uniform(-0.5, 0.5), 1)
        hdg = round((60.0 + 35.0 * math.sin(0.6 * i)) % 360, 1)
        records.append({
            "mmsi": "419007890",
            "vessel_name": "Fisheries 08",
            "timestamp": t.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "speed": spd,
            "heading": hdg,
            "vessel_type": "Fishing Vessel",
            "flag": "India",
            "draught": 3.2,
            "destination": "Sassoon Dock"
        })

    df = pd.DataFrame(records)
    csv_path = os.path.join(AIS_DIR, "vessels.csv")
    df.to_csv(csv_path, index=False)
    print(f"Saved: {csv_path} with {len(df)} records across {df['mmsi'].nunique()} vessels.")

if __name__ == "__main__":
    generate_sar_image_and_mask()
    _, orig_lat, orig_lon = generate_metadata()
    generate_ais_data(orig_lat, orig_lon)
    print("All demo data generated successfully!")
