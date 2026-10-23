# Convert Natural Earth (public domain) outlines into SVG path data for the film.
import json, math
G = "assets/geo/"
def rings(geom):
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    return [p[0] for p in polys]
# --- Australia: local equirectangular with cos(lat0) scaling, box 0..1000
d50 = json.load(open(G + "ne_50m_admin_0_countries.geojson"))
aus = next(f for f in d50["features"] if f["properties"]["ADM0_A3"] == "AUS")
lat0 = -27; kx = math.cos(math.radians(lat0))
LON0, LON1, LAT0, LAT1 = 112.5, 154.5, -44.0, -10.0
W = 1000; S = W / ((LON1 - LON0) * kx); H = (LAT1 - LAT0) * S
def pa(lon, lat): return ((lon - LON0) * kx * S, (LAT1 - lat) * S)
main, tas = [], []
for r in rings(aus["geometry"]):
    if len(r) < 15: continue
    lons = [p[0] for p in r]; lats = [p[1] for p in r]
    if max(lons) > 155 or min(lons) < 112: continue
    pts = [pa(*p) for p in r]
    path = "M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z"
    (tas if min(lats) < -40 and max(lats) < -39 else main).append(path)
pins = {k: pa(*v) for k, v in {"Launceston": (147.14, -41.43), "Canberra": (149.13, -35.28), "Sydney": (151.21, -33.87)}.items()}
# --- World: equirectangular 2000 x 1000 (110m), Antarctica dropped
d110 = json.load(open(G + "ne_110m_admin_0_countries.geojson"))
def pw(lon, lat): return ((lon + 180) / 360 * 2000, (90 - lat) / 180 * 1000)
world, wa = [], []
for f in d110["features"]:
    if f["properties"]["ADM0_A3"] == "ATA": continue
    for r in rings(f["geometry"]):
        path = "M" + "L".join("%.1f,%.1f" % pw(*p) for p in r) + "Z"
        (wa if f["properties"]["ADM0_A3"] == "AUS" else world).append(path)
# lon/lat rings for orthographic globe (110m, coarse)
globe = []
for f in d110["features"]:
    if f["properties"]["ADM0_A3"] == "ATA": continue
    for r in rings(f["geometry"]):
        step = max(1, len(r) // 60)
        globe.append(dict(aus=f["properties"]["ADM0_A3"] == "AUS", pts=[[round(p[0], 1), round(p[1], 1)] for p in r[::step]]))
out = dict(aus=dict(w=W, h=round(H, 1), main="".join(main), tas="".join(tas), pins=pins),
           world=dict(w=2000, h=1000, land="".join(world), aus="".join(wa),
                      pins={k: pw(*v) for k, v in {"Sydney": (151.21, -33.87), "USA": (-78.9, 35.99)}.items()}),
           globe=globe)
open("geo.js", "w").write("window.GEO = " + json.dumps(out) + ";\n")
print(W, H, len(main), len(tas), pins, len(open("geo.js").read()))
