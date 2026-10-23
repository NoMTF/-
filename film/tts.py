import sys, json, re, os, soundfile as sf, numpy as np
from kokoro_onnx import Kokoro
sys.path.insert(0, os.path.dirname(__file__))
from script import SCRIPT, SAY_FIX
voice = sys.argv[1]; speed = float(sys.argv[2]); out = sys.argv[3]
only = sys.argv[4].split(',') if len(sys.argv) > 4 else None
os.makedirs(out, exist_ok=True)
k = Kokoro("assets/models/kokoro-v1.0.onnx", "assets/models/voices-v1.0.bin")
lang = "en-gb" if voice.startswith("b") else "en-us"
def spoken(t):
    for a, b in SAY_FIX.items():
        t = t.replace(a, b)
    return t
durs = {}
for sid, kind, text in SCRIPT:
    if kind != "say" or (only and sid not in only): continue
    s, sr = k.create(spoken(text), voice=voice, speed=speed, lang=lang)
    # trim leading/trailing silence
    a = np.abs(s); thr = 0.01 * a.max()
    nz = np.where(a > thr)[0]; s = s[max(0, nz[0]-int(0.03*sr)): nz[-1]+int(0.08*sr)]
    sf.write(f"{out}/{sid}.wav", s, sr); durs[sid] = len(s)/sr
    print(sid, round(durs[sid],2), flush=True)
json.dump(durs, open(f"{out}/durations.json","w"), indent=1)
print("total", sum(durs.values()))
