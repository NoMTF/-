# Final audio: narration + score (ducked under speech) + sound effects -> mix.wav
import json, subprocess, math, random
import numpy as np, soundfile as sf, mido

SR = 44100
TL = json.load(open("timeline.json")); IT = {i["id"]: i for i in TL["items"]}
TOTAL = TL["total"]; N = int(math.ceil(TOTAL * SR))
SEC = json.load(open("music/sections.json"))
rng = np.random.default_rng(7)

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def db(x): return 10 ** (x / 20)
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
def place(bus, clip, t, gain=1.0):
    i = int(round(t * SR)); j = min(len(bus), i + len(clip))
    if j > i >= 0: bus[i:j] += clip[: j - i] * gain
# ---------------- narration ----------------
voice = np.zeros((N, 2), np.float32); speech = []
for it in TL["items"]:
    if it["kind"] != "say": continue
    v = load(f"vo/{it['id']}.wav")
    v *= db(-19) / rms(v[np.abs(v[:, 0]) > 0.01] if np.any(np.abs(v[:, 0]) > 0.01) else v)  # level-match lines
    place(voice, v, it["start"]); speech.append((it["start"], it["start"] + len(v) / SR))
# gentle high-pass to clear rumble
def fft_hp(x, fc=75):
    X = np.fft.rfft(x, axis=0); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / np.sqrt(1 + (fc / np.maximum(f, 1e-3)) ** 4))[:, None]
    return np.fft.irfft(X, n=len(x), axis=0).astype(np.float32)
voice = fft_hp(voice)

# ---------------- score ----------------
music = np.zeros((N, 2), np.float32)
order = ["A", "B", "C", "D", "E", "F"]
target = {"A": -23, "B": -23.5, "C": -23, "D": -22.5, "E": -23.5, "F": -22.5}
for k, name in enumerate(order):
    m = load(f"music/{name}.wav")
    body = m[: int(20 * SR)]
    m *= db(target[name]) / rms(body[np.abs(body[:, 0]) > 1e-4])
    t0 = SEC[name]; t1 = SEC[order[k + 1]] if k + 1 < len(order) else TOTAL
    n_len = int((t1 - t0 + 1.2) * SR); m = m[:n_len]
    env = np.ones(len(m), np.float32)
    if k > 0:  # short fade-in (the new section starts on a downbeat under the title-card whoosh)
        fi = int(0.08 * SR); env[:fi] = np.linspace(0, 1, fi)
    if k + 1 < len(order):  # fade out across the boundary
        fo0 = int((t1 - t0 - 0.15) * SR); fo1 = min(len(m), int((t1 - t0 + 1.0) * SR))
        env[fo0:fo1] *= np.linspace(1, 0, fo1 - fo0) ** 1.5; env[fo1:] = 0
    place(music, m * env[:, None], t0)

# duck music under speech
duck = np.ones(N, np.float32)
for a, b in speech:
    duck[max(0, int((a - 0.25) * SR)): int((b + 0.35) * SR)] = db(-11)
w = np.hanning(int(0.5 * SR)); w /= w.sum()
duck = np.convolve(duck, w, mode="same").astype(np.float32)
music *= duck[:, None]

# ---------------- sound effects ----------------
def env_ad(n, att, dec):
    t = np.arange(n) / SR; return (1 - np.exp(-t / att)) * np.exp(-t / dec)
def svf_noise(dur, f_from, f_to, q=1.2, shape=None):
    n = int(dur * SR); x = rng.standard_normal(n).astype(np.float64)
    fc = np.geomspace(f_from, f_to, n); low = band = 0.0; out = np.zeros(n)
    for k in range(n):
        f = 2 * math.sin(math.pi * fc[k] / SR)
        low += f * band; high = x[k] - low - band / q; band += f * high; out[k] = band
    e = shape if shape is not None else np.sin(np.linspace(0, math.pi, n)) ** 2
    out = out * e; return (out / (np.abs(out).max() + 1e-9)).astype(np.float32)
def stereo(x, pan=0.0):
    l, r = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
    return np.stack([x * l * 1.41, x * r * 1.41], 1).astype(np.float32)
def pop(f0):
    n = int(0.11 * SR); t = np.arange(n) / SR; f = f0 * np.exp(-t * 9); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * env_ad(n, 0.002, 0.03)).astype(np.float32)
def thud():
    n = int(0.35 * SR); t = np.arange(n) / SR; f = 55 + 80 * np.exp(-t * 25); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * env_ad(n, 0.002, 0.09) + 0.5 * rng.standard_normal(n) * env_ad(n, 0.0005, 0.012)).astype(np.float32)
def boing():
    n = int(0.32 * SR); t = np.arange(n) / SR; f = 260 + 300 * np.exp(-t * 14) + 18 * np.sin(2 * np.pi * 22 * t); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * env_ad(n, 0.003, 0.09)).astype(np.float32)

SW = [svf_noise(0.32, 500, 4500, 1.4), svf_noise(0.36, 600, 3500, 1.2), svf_noise(0.3, 450, 5000, 1.6)]
WHOOSH = svf_noise(0.75, 300, 2600, 0.9, np.concatenate([np.linspace(0, 1, int(0.55 * SR)) ** 2, np.linspace(1, 0, int(0.2 * SR)) ** 1.5]))
CURTAIN = svf_noise(1.7, 1800, 700, 0.7) * (0.8 + 0.2 * np.sin(np.linspace(0, 40, int(1.7 * SR)))).astype(np.float32)
PLANE = svf_noise(3.0, 250, 900, 0.8, np.sin(np.linspace(0, math.pi, int(3.0 * SR))) ** 1.5)

sfx = np.zeros((N, 2), np.float32)
events = json.load(open("events.json"))
last = {}; last_any = -9
for e in events:
    t, ty = e["t"], e["type"]
    if t - last.get(ty, -9) < (0.14 if ty == "pop" else 0.1): continue
    if ty == "pop" and t - last_any < 0.07: continue
    last[ty] = t; last_any = t
    pan = float(rng.uniform(-.35, .35))
    if ty == "pop": place(sfx, stereo(pop(rng.uniform(650, 1000)), pan), t, db(-25))
    elif ty == "swish": place(sfx, stereo(SW[int(rng.integers(0, 3))], pan), t - 0.08, db(-29))
    elif ty == "whoosh": place(sfx, stereo(WHOOSH, 0), t - 0.45, db(-22))
    elif ty == "curtain": place(sfx, stereo(CURTAIN, 0), t, db(-27))
    elif ty == "plane": place(sfx, stereo(PLANE, .2), t, db(-30))
    elif ty == "stamp": place(sfx, stereo(thud(), 0), t + 0.18, db(-17))
    elif ty == "drop": place(sfx, stereo(boing(), pan), t + 0.15, db(-27))

# musical sound effects from the soundfont
mid = mido.MidiFile(ticks_per_beat=480); tr = mido.MidiTrack(); mid.tracks.append(tr)
tr.append(mido.MetaMessage("set_tempo", tempo=500000, time=0))
progs = {0: 9, 1: 8, 2: 55, 3: 47}
msgs = [(0, 0, mido.Message("program_change", channel=c, program=p)) for c, p in progs.items()]
def nt(t, ch, pitch, vel, dur=0.8):
    msgs.append((int(t * 960), 2, mido.Message("note_on", channel=ch, note=pitch, velocity=vel)))
    msgs.append((int((t + dur) * 960), 1, mido.Message("note_off", channel=ch, note=pitch, velocity=0)))
lastm = {}
for e in events:
    t, ty = e["t"], e["type"]
    if t - lastm.get(ty, -9) < 0.25: continue
    lastm[ty] = t
    if ty == "chime": [nt(t + k * 0.07, 0, p, 64) for k, p in enumerate([79, 84, 88])]
    elif ty == "ding": nt(t, 1, 88, 72); nt(t, 0, 95, 50)
    elif ty == "sparkle": [nt(t + k * 0.05, 1, p, 56) for k, p in enumerate([84, 88, 91, 96, 100])]
    elif ty == "pow": [nt(t, 2, p, 96) for p in (48, 55, 60)]; nt(t, 3, 36, 110, 1.5)
    elif ty == "click": nt(t, 9, 76, 96, 0.2)
    elif ty == "thunder":
        for k in range(18): nt(t + k * 0.065, 3, 31, int(50 + 50 * math.sin(k / 17 * math.pi)), 0.2)
msgs.append((int((TOTAL + 2) * 960), 3, mido.MetaMessage("end_of_track")))
msgs.sort(key=lambda m: (m[0], m[1])); lt = 0
for tt, _, m in msgs: m.time = tt - lt; lt = tt; tr.append(m)
mid.save("music/sfx.mid")
subprocess.run(["fluidsynth", "-ni", "-q", "-g", "0.6", "-r", str(SR), "-F", "music/sfx.wav", "/usr/share/sounds/sf2/FluidR3_GM.sf2", "music/sfx.mid"], check=True)
ms = load("music/sfx.wav")[:N]; sfx[: len(ms)] += ms * db(-9)

# thunder rumble (noise) to go with the timpani roll
for e in events:
    if e["type"] == "thunder": place(sfx, stereo(svf_noise(1.6, 120, 60, 0.6, np.exp(-np.linspace(0, 4, int(1.6 * SR)))), 0), e["t"], db(-20))

mix = voice + music + sfx
fo = int(1.6 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
peak = np.abs(mix).max(); print("peak", peak, "voice rms", rms(voice), "music rms", rms(music), "sfx rms", rms(sfx))
if peak > 0.98: mix *= 0.98 / peak
sf.write("mix_raw.wav", mix, SR, subtype="FLOAT")
print("dur", len(mix) / SR)
