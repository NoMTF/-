# Build the end-credits HTML (photo sources and licences) -> credits.js
import json, os, re, html
used = set(re.findall(r"(PR|CC)\('([a-z0-9_]+)'\)", open("scenes.js").read()))
lines = []
press = json.load(open("photos/press/credits.json")) if os.path.exists("photos/press/credits.json") else {}
press_used = [n for k, n in used if k == "PR"]
if press_used:
    lines.append("<b>Photos of Richard Scolyer and family:</b> ABC News; ABC <i>Australian Story</i> (Tom Hancock, Keana Naughton); "
                 "AAP Image / Mick Tsikas; AFP / David Gray; Melanoma Institute Australia; The University of Sydney; Tim Bauer; "
                 "the Scolyer family (via Instagram). Used with thanks for this tribute.")
cc = json.load(open("photos/cc/credits.json"))
names = {"gorge_bridge": "Cataract Gorge", "utas": "University of Tasmania", "canberra_hosp": "Canberra Hospital", "rpa": "Royal Prince Alfred Hospital",
         "slide_scope": "Slide under a microscope", "mel_histo": "Melanoma under the microscope", "gbm_mri": "Glioblastoma MRI", "bondi": "Bondi Beach",
         "ivdrip": "IV drip", "tcells": "Killer T cells surrounding a cancer cell (NIH)"}
for k, n in sorted(used, key=lambda x: x[1]):
    if k != "CC": continue
    c = cc[n]; lic = "public domain" if c["license"] in ("PDM", "CC0") else c["license"]
    lines.append(f"<b>{html.escape(names.get(n, c['title']))}:</b> {html.escape(c['creator'] or 'unknown')} ({lic})")
lines += ["<b>Facts &amp; quotes:</b> ABC News, ABC <i>Australian Story</i>, Melanoma Institute Australia, The University of Sydney, Wikipedia",
          "<b>Maps:</b> Natural Earth (public domain) · <b>Fonts:</b> Caprasimo, Open Sans, Nunito, Caveat (SIL OFL)",
          "<b>Narration:</b> synthetic voice (Kokoro TTS) · <b>Music, illustrations &amp; animation:</b> original for this film"]
out = "".join(f"<div style='break-inside:avoid;margin-bottom:8px'>{l}</div>" for l in lines)
open("credits.js", "w").write("window.CREDITS_HTML = " + json.dumps(out) + ";\n")
print(len(lines), "credit lines")
