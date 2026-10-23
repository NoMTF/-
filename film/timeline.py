import json
from script import SCRIPT
durs = json.load(open("vo/durations.json"))
GAP, PRE_TITLE, TITLE, POST_TITLE = 0.3, 0.45, 2.1, 0.1
HOLD = {"l_stats": 1.6, "l_quote1": 0.8, "l_died": 1.2}
t = 0.0; items = []; prev = None
for sid, kind, val in SCRIPT:
    if kind == "gap":
        if sid == "intro": items.append(dict(id=sid, kind=kind, start=0.0, end=val)); t = val
        else: t += 0.6; items.append(dict(id=sid, kind=kind, start=t, end=t + val)); t += val
    elif kind == "title":
        t += PRE_TITLE - GAP if prev == "say" else 0
        items.append(dict(id=sid, kind=kind, text=val, start=t, end=t + TITLE)); t += TITLE + POST_TITLE
    else:
        if prev == "say": t += GAP
        d = durs[sid]; items.append(dict(id=sid, kind=kind, text=val, start=round(t,3), end=round(t + d,3), dur=d)); t += d + HOLD.get(sid, 0)
    prev = kind
# visual window: until the next item starts
for a, b in zip(items, items[1:]): a["vend"] = b["start"]
items[-1]["vend"] = items[-1]["end"]
total = items[-1]["end"]
json.dump(dict(total=total, items=items), open("timeline.json", "w"), indent=1)
open("timeline.js", "w").write("window.TIMELINE = " + json.dumps(dict(total=total, items=items)) + ";\n")
print("total", round(total, 2), "s =", int(total//60), "min", round(total%60,1), "s")
for i in items: print(f'{i["start"]:7.2f} {i["vend"]-i["start"]:5.2f} {i["kind"]:5s} {i["id"]}')
