# Original score for the film, written as MIDI per section and rendered with FluidSynth (FluidR3 GM).
import json, random, subprocess, os
import mido

OUT = "music"; os.makedirs(OUT, exist_ok=True)
SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
TL = json.load(open("timeline.json")); IT = {i["id"]: i for i in TL["items"]}
TOTAL = TL["total"]

NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}
NOTE.update({"Db": 1, "Eb": 3, "Gb": 6, "Ab": 8, "Bb": 10})
def n(s):  # "C4" -> 60
    name, octv = (s[:-1], int(s[-1]))
    return 12 * (octv + 1) + NOTE[name]
CH = {  # chord -> root pitch class + intervals
    "C": (0, [0, 4, 7]), "G": (7, [0, 4, 7]), "Am": (9, [0, 3, 7]), "F": (5, [0, 4, 7]), "Dm": (2, [0, 3, 7]),
    "Em": (4, [0, 3, 7]), "E": (4, [0, 4, 7]), "Bb": (10, [0, 4, 7]), "G7": (7, [0, 4, 7, 10]), "Fmaj7": (5, [0, 4, 7, 11]),
    "Csus": (0, [0, 5, 7]), "D": (2, [0, 4, 7]),
}
def voicing(ch, low=55, count=4):
    r, iv = CH[ch]; out = []; p = low
    pcs = [(r + i) % 12 for i in iv]
    while len(out) < count:
        if p % 12 in pcs: out.append(p)
        p += 1
    return out

class Song:
    def __init__(self, bpm, seed=1):
        self.bpm = bpm; self.ev = []; self.prog = {}; self.rng = random.Random(seed)
    def program(self, ch, prog): self.prog[ch] = prog
    def note(self, ch, beat, dur, pitch, vel, hum=True):
        if hum: beat += self.rng.uniform(-0.012, 0.012); vel += self.rng.randint(-6, 6)
        self.ev.append((max(0, beat), dur, pitch, max(1, min(127, int(vel))), ch))
    def save(self, path, beats_total):
        mid = mido.MidiFile(ticks_per_beat=480); tr = mido.MidiTrack(); mid.tracks.append(tr)
        tr.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(self.bpm), time=0))
        msgs = []
        for ch, pg in self.prog.items():
            msgs.append((0, 0, mido.Message("program_change", channel=ch, program=pg)))
            msgs.append((0, 0, mido.Message("control_change", channel=ch, control=91, value=70)))  # reverb send
        for b, d, p, v, ch in self.ev:
            t0 = int(b * 480); t1 = int((b + d) * 480)
            msgs.append((t0, 2, mido.Message("note_on", channel=ch, note=p, velocity=v)))
            msgs.append((t1, 1, mido.Message("note_off", channel=ch, note=p, velocity=0)))
        msgs.append((int(beats_total * 480), 3, mido.MetaMessage("end_of_track")))
        msgs.sort(key=lambda m: (m[0], m[1])); last = 0
        for t, _, m in msgs:
            m.time = t - last; last = t; tr.append(m)
        mid.save(path)

def render(name, song, seconds):
    beats = seconds * song.bpm / 60
    song.save(f"{OUT}/{name}.mid", beats + 8)
    subprocess.run(["fluidsynth", "-ni", "-q", "-g", "0.55", "-r", "44100", "-F", f"{OUT}/{name}.wav", SF2, f"{OUT}/{name}.mid"], check=True)

GTR, BASS, MEL, PIZZ, STR, PNO, GLK, BRS, DR, PAD, MAR = 0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11

def strum(s, bar_beat, ch, chord, pattern, vel=70, low=52):
    v = voicing(chord, low, 4)
    for (b, d, up, acc) in pattern:
        notes = v[::-1] if up else v
        for k, p in enumerate(notes):
            s.note(ch, bar_beat + b + k * 0.018, d, p, vel + acc - (8 if up else 0))
STRUM = [(0, .9, 0, 10), (1, .45, 0, 0), (1.5, .45, 1, -6), (2.5, .45, 1, -4), (3, .45, 0, 4), (3.5, .45, 1, -8)]

def bassline(s, b0, chord, vel=78, style="pump"):
    r = 36 + CH[chord][0]
    if r > 45: r -= 12
    if style == "pump":
        s.note(BASS, b0, .9, r, vel); s.note(BASS, b0 + 1.5, .45, r, vel - 12); s.note(BASS, b0 + 2, .9, r + 7, vel - 6); s.note(BASS, b0 + 3.5, .45, r + 12 if r + 12 < 60 else r, vel - 14)
    else:
        s.note(BASS, b0, 3.9, r, vel)

def drums(s, b0, kind="light"):
    if kind in ("light", "full"):
        for e in range(8): s.note(DR, b0 + e * .5, .2, 70, 46 + (12 if e % 2 == 0 else 0))  # maracas
    if kind == "full":
        s.note(DR, b0, .3, 36, 92); s.note(DR, b0 + 2, .3, 36, 84); s.note(DR, b0 + 2.5, .3, 36, 60)
        s.note(DR, b0 + 1, .3, 39, 78); s.note(DR, b0 + 3, .3, 39, 82)
        for e in range(8): s.note(DR, b0 + e * .5, .15, 42, 50 + (14 if e % 2 == 0 else 0))
    if kind == "kick":
        s.note(DR, b0, .3, 36, 80); s.note(DR, b0 + 2, .3, 36, 72)

THEME = {  # 8-bar hook, (beat, dur, note) per bar
    0: [(0, .5, "E5"), (.5, .5, "G5"), (1, 1, "C6"), (2, .5, "B5"), (2.5, .5, "G5"), (3, 1, "E5")],
    1: [(0, .5, "D5"), (.5, .5, "G5"), (1, 1, "B5"), (2, .5, "A5"), (2.5, .5, "G5"), (3, 1, "D5")],
    2: [(0, .5, "C5"), (.5, .5, "E5"), (1, 1, "A5"), (2, .5, "G5"), (2.5, .5, "E5"), (3, .5, "C5"), (3.5, .5, "D5")],
    3: [(0, .5, "E5"), (.5, .5, "F5"), (1, 1.5, "A5"), (2.5, .5, "G5"), (3, 1, "F5")],
    4: [(0, .5, "A5"), (.5, .5, "G5"), (1, .5, "F5"), (1.5, .5, "A5"), (2, 1, "C6"), (3, 1, "A5")],
    5: [(0, .5, "B5"), (.5, .5, "A5"), (1, .5, "G5"), (1.5, .5, "B5"), (2, 1, "D6"), (3, 1, "B5")],
    6: [(0, 1, "C6"), (1, .5, "G5"), (1.5, .5, "E5"), (2, 1, "G5"), (3, 1, "E5")],
    7: [(0, 2, "C5"), (3, .25, "G5"), (3.25, .25, "A5"), (3.5, .25, "B5"), (3.75, .25, "C6")],
}
THEME_CH = ["C", "G", "Am", "F", "F", "G", "C", "C"]
def theme(s, b0, ch, vel=72, octave=0, bars=range(8)):
    for bi in bars:
        for (b, d, p) in THEME[bi]: s.note(ch, b0 + bi * 4 + b, d, n(p) + 12 * octave, vel)

# ---------------- Section A: playful (intro .. end of l_stats) ----------------
def secA(seconds):
    s = Song(116, 11)
    s.program(GTR, 24); s.program(BASS, 32); s.program(MEL, 9); s.program(PIZZ, 45); s.program(MAR, 12); s.program(DR, 0)
    bars = int(seconds * 116 / 60 / 4) + 2
    prog_b = ["Am", "F", "C", "G", "Am", "F", "G", "G"]
    for bar in range(bars):
        b0 = bar * 4; phrase = (bar // 8) % 6; chord = (prog_b if phrase == 3 else THEME_CH)[bar % 8]
        strum(s, b0, GTR, chord, STRUM, 62)
        if bar >= 2: bassline(s, b0, chord, 72)
        if bar >= 2: drums(s, b0, "light")
        if bar >= 1 and bar % 8 == 0 and phrase in (0, 2, 4): theme(s, b0, MEL, 64)
        if phrase in (1, 5) and bar % 2 == 0:  # pizzicato counter line
            v = voicing(chord, 67, 3)
            for e, p in enumerate([v[0], v[1], v[2], v[1]] * 2): s.note(PIZZ, b0 + e, .4, p, 54)
        if phrase == 3 and bar % 8 == 0: theme(s, b0, MAR, 58, octave=-1)
    # intro curtain flourish
    for k, p in enumerate(["C5", "E5", "G5", "C6", "E6", "G6"]): s.note(MEL, .2 + k * .18, 1.2, n(p), 70)
    render("A", s, seconds)

# ---------------- Section B: shocking twist (minor, slow) ----------------
def secB(seconds):
    s = Song(72, 22)
    s.program(STR, 48); s.program(PNO, 0); s.program(BASS, 42); s.program(PAD, 89); s.program(DR, 0); s.program(GTR, 47)
    s.note(GTR, 0, 2, n("A1"), 100, hum=False); s.note(GTR, 0, 2, n("E2"), 90, hum=False)  # timpani hit
    prog = ["Am", "F", "Dm", "E", "Am", "F", "Dm", "E", "Am", "Am"]
    for bar, chord in enumerate(prog):
        b0 = bar * 4
        for p in voicing(chord, 52, 4): s.note(STR, b0, 4, p, 58)
        s.note(BASS, b0, 4, 36 + CH[chord][0] - (12 if CH[chord][0] > 7 else 0), 70)
        v = voicing(chord, 60, 4)
        for e, p in enumerate([v[0], v[2], v[1], v[3], v[2], v[1], v[0], v[2]]): s.note(PNO, b0 + e * .5, .9, p, 48 + (8 if e == 0 else 0))
        s.note(PAD, b0, 4, voicing(chord, 64, 1)[0], 40)
        if bar % 2 == 0: s.note(DR, b0, .5, 35, 60)
    render("B", s, seconds)

# ---------------- Section C: hope rising ----------------
def secC(seconds):
    s = Song(92, 33)
    s.program(PNO, 0); s.program(STR, 48); s.program(BASS, 32); s.program(MEL, 9); s.program(DR, 0); s.program(GTR, 24)
    prog = ["F", "C", "G", "Am", "F", "C", "G", "G", "F", "C", "G", "Am", "F", "G", "C", "C"]
    bars = int(seconds * 92 / 60 / 4) + 2
    for bar in range(bars):
        b0 = bar * 4; chord = prog[bar % 16]
        v = voicing(chord, 60, 3)
        for e in range(8): s.note(PNO, b0 + e * .5, .5, [v[0], v[1], v[2], v[1] + 12 if v[1] + 12 < 84 else v[1]][e % 4], 50 + (10 if e % 4 == 0 else 0))
        s.note(BASS, b0, 2, 36 + CH[chord][0] - (12 if CH[chord][0] > 7 else 0), 66); s.note(BASS, b0 + 2, 2, 36 + CH[chord][0] - (12 if CH[chord][0] > 7 else 0) + 7, 58)
        if bar >= 4:
            for p in voicing(chord, 55, 3): s.note(STR, b0, 4, p, 44 + min(24, bar * 2))
            drums(s, b0, "kick")
        if bar >= 8:
            for e in range(8): s.note(DR, b0 + e * .5, .2, 70, 40 + (10 if e % 2 == 0 else 0))
        if bar >= 8: strum(s, b0, GTR, chord, STRUM, 50)
        if bar in (8, 12):
            for k, p in enumerate(voicing(chord, 76, 3) + voicing(chord, 88, 2)): s.note(MEL, b0 + k * .5, 1, p, 58)
    render("C", s, seconds)

# ---------------- Section D: celebration ----------------
def secD(seconds):
    s = Song(116, 44)
    s.program(GTR, 24); s.program(BASS, 32); s.program(MEL, 9); s.program(BRS, 61); s.program(STR, 48); s.program(DR, 0)
    bars = int(seconds * 116 / 60 / 4) + 2
    s.note(DR, 0, 1, 49, 100); s.note(DR, 0, 1, 57, 70)  # crash
    for bar in range(bars):
        b0 = bar * 4; chord = THEME_CH[bar % 8]
        strum(s, b0, GTR, chord, STRUM, 66); bassline(s, b0, chord, 80); drums(s, b0, "full")
        if bar % 8 == 0: theme(s, b0, MEL, 70)
        for p in voicing(chord, 60, 3): s.note(BRS, b0, .4, p, 70); s.note(BRS, b0 + 2.5, .4, p, 62)
        for p in voicing(chord, 55, 3): s.note(STR, b0, 4, p, 48)
    render("D", s, seconds)

# ---------------- Section E: tender ----------------
def secE(seconds):
    s = Song(66, 55)
    s.program(PNO, 0); s.program(STR, 49); s.program(BASS, 42); s.program(MEL, 73)
    prog = ["F", "Am", "Dm", "Bb", "F", "C", "Dm", "Bb", "F", "F"]
    mel = {0: [(0, 2, "A5"), (2, 1, "G5"), (3, 1, "F5")], 1: [(0, 3, "E5"), (3, 1, "C5")], 2: [(0, 2, "F5"), (2, 1, "A5"), (3, 1, "D6")], 3: [(0, 4, "D6")],
           4: [(0, 2, "C6"), (2, 1, "A5"), (3, 1, "F5")], 5: [(0, 3, "G5"), (3, 1, "E5")], 6: [(0, 2, "F5"), (2, 1, "D5"), (3, 1, "F5")], 7: [(0, 2, "D5"), (2, 2, "E5")], 8: [(0, 4, "F5")]}
    for bar, chord in enumerate(prog):
        b0 = bar * 4; v = voicing(chord, 57, 4)
        for e, p in enumerate([v[0], v[1], v[2], v[3], v[2], v[1], v[2], v[3]]): s.note(PNO, b0 + e * .5, 1.2, p, 46)
        s.note(PNO, b0, 4, 36 + CH[chord][0] - (12 if CH[chord][0] > 4 else 0), 52)
        for p in voicing(chord, 53, 3): s.note(STR, b0, 4, p, 40 + (10 if bar >= 4 else 0))
        for (b, d, p) in mel.get(bar, []): s.note(PNO, b0 + b, d, n(p), 58)
    render("E", s, seconds)

# ---------------- Section F: uplifting finale ----------------
def secF(seconds, outro_at):
    s = Song(100, 66)
    s.program(PNO, 0); s.program(STR, 48); s.program(BASS, 32); s.program(MEL, 9); s.program(GTR, 24); s.program(DR, 0); s.program(BRS, 61)
    beat = 60 / 100; end_bar = int(outro_at / beat / 4)
    for bar in range(end_bar + 4):
        b0 = bar * 4; chord = THEME_CH[bar % 8]
        if bar <= end_bar:
            v = voicing(chord, 60, 3)
            for e in range(8): s.note(PNO, b0 + e * .5, .5, [v[0], v[1], v[2], v[1]][e % 4], 46 + (8 if e % 4 == 0 else 0))
            s.note(BASS, b0, 4, 36 + CH[chord][0] - (12 if CH[chord][0] > 7 else 0), 62 + (10 if bar >= 4 else 0))
        if 4 <= bar <= end_bar:
            for p in voicing(chord, 55, 3): s.note(STR, b0, 4, p, 50)
            strum(s, b0, GTR, chord, STRUM, 52); drums(s, b0, "light" if bar < 8 else "full")
        if bar in (0, 8) and bar <= end_bar: theme(s, b0, MEL, 62 if bar == 0 else 70)
    # final ringing chord at the outro
    fb = (end_bar + 1) * 4
    for p in [48, 55, 60, 64, 67, 72, 76]: s.note(STR, fb, 10, p, 70, hum=False); s.note(PNO, fb, 10, p, 62, hum=False)
    for k, p in enumerate(["C6", "E6", "G6", "C7"]): s.note(MEL, fb + k * .25, 4, n(p), 66, hum=False)
    s.note(DR, fb, 2, 49, 84, hum=False)
    render("F", s, seconds)
    return fb * beat

if __name__ == "__main__":
    tA, tB, tC, tD, tE, tF = 0, IT["t_twist"]["start"], IT["t_zero"]["start"], IT["t_aoty"]["start"], IT["t_lives"]["start"], IT["t_learn"]["start"]
    secA(tB - tA + 3); secB(tC - tB + 3); secC(tD - tC + 3); secD(tE - tD + 3); secE(tF - tE + 3)
    final = secF(TOTAL - tF + 1, IT["outro"]["start"] - tF + 1.2)
    json.dump(dict(A=tA, B=tB, C=tC, D=tD, E=tE, F=tF, final_chord=tF + final), open(f"{OUT}/sections.json", "w"), indent=1)
    print(open(f"{OUT}/sections.json").read())
