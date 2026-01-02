import requests

TOKEN = "fa914102bcf40a6ef3ff8b42af2284571ab64263"

# Target locations (lat, lon)
LOCATIONS = {
    "RVCE Mysore Road": (12.9338, 77.5263),
    "Peenya, Bengaluru": (13.0205, 77.5360),
    "Silk Board, Bengaluru": (12.9279, 77.6240),
}

def fetch_aqi(lat, lon):
    url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={TOKEN}"
    res = requests.get(url)
    if res.status_code != 200:
        return None
    
    data = res.json()
    if data.get("status") != "ok":
        return None

    info = data["data"]
    result = {
        "AQI": info.get("aqi"),
        "PM2.5": info.get("iaqi", {}).get("pm25", {}).get("v"),
        "PM10": info.get("iaqi", {}).get("pm10", {}).get("v"),
        "Time": info.get("time", {}).get("s")
    }
    return result

if __name__ == "__main__":
    print("🔄 Fetching Live AQI...\n")

    for area, coords in LOCATIONS.items():
        lat, lon = coords
        aqi_info = fetch_aqi(lat, lon)

        if not aqi_info:
            print(f"{area}: Failed to fetch data")
            continue

        print(f"📍 {area}")
        print(f"  AQI      : {aqi_info['AQI']}")
        print(f"  PM2.5    : {aqi_info['PM2.5']}")
        print(f"  PM10     : {aqi_info['PM10']}")
        print(f"  Updated  : {aqi_info['Time']}")
        print("-" * 30)
