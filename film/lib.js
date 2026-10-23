// Frame-accurate animation engine: every visual is a pure function of time T (seconds).
const W = 1920, H = 1080;
const TL = window.TIMELINE;
const ITEMS = Object.fromEntries(TL.items.map(i => [i.id, i]));
const stage = document.getElementById('stage');
const SCENES = [];
const EVENTS = []; // sound-effect cues collected for the audio mix

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, d) => clamp((t - a) / d);
const ease = {
  lin: t => t,
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  inout: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  bigback: t => { const c1 = 2.6, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: t => (t === 0 || t === 1) ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI) / 3) + 1,
  bounce: t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; },
};

function div(cls, html) { const d = document.createElement('div'); if (cls) d.className = cls; if (html != null) d.innerHTML = html; return d; }

// Entrance / exit offsets: returns {x, y, s, r, o}
function inFx(kind, p) {
  const e = ease.out(p), b = ease.back(p);
  switch (kind) {
    case 'pop': return { s: lerp(0.15, 1, b), o: clamp(p * 4) };
    case 'bigpop': return { s: lerp(0, 1, ease.bigback(p)), o: clamp(p * 5) };
    case 'left': return { x: lerp(-1500, 0, e) };
    case 'right': return { x: lerp(1500, 0, e) };
    case 'up': return { y: lerp(1000, 0, e) };
    case 'down': return { y: lerp(-1000, 0, e) };
    case 'drop': return { y: lerp(-900, 0, ease.bounce(p)) };
    case 'zoom': return { s: lerp(1.8, 1, e), o: p };
    case 'fade': return { o: p };
    case 'spin': return { s: lerp(0, 1, b), r: lerp(-200, 0, e), o: clamp(p * 4) };
    case 'swing': return { r: lerp(-70, 0, ease.elastic(p)), o: clamp(p * 6) };
    case 'stamp': return { s: lerp(3, 1, ease.out(p)), o: clamp(p * 3), r: 0 };
    default: return {};
  }
}
function outFx(kind, p) {
  const e = ease.in(p);
  switch (kind) {
    case 'pop': return { s: lerp(1, 0, ease.in(p)), o: 1 - clamp((p - .6) * 2.5) };
    case 'left': return { x: lerp(0, -1700, e) };
    case 'right': return { x: lerp(0, 1700, e) };
    case 'up': return { y: lerp(0, -1200, e) };
    case 'down': return { y: lerp(0, 1200, e) };
    case 'fade': return { o: 1 - p };
    case 'zoom': return { s: lerp(1, 1.5, e), o: 1 - p };
    default: return {};
  }
}

class Scene {
  constructor(id, opt = {}) {
    this.item = ITEMS[id] || { start: opt.t0, vend: opt.t1, dur: 0, text: '' };
    this.id = id;
    this.t0 = opt.t0 ?? this.item.start;
    this.t1 = opt.t1 ?? this.item.vend;
    this.D = this.t1 - this.t0;
    this.tail = opt.tail ?? 0.42;
    this.root = div('layer');
    this.root.style.zIndex = opt.z ?? 10;
    stage.appendChild(this.root);
    this.els = []; this.fns = [];
    SCENES.push(this);
  }
  // time (scene-local) at which `word` is spoken (character-proportional estimate)
  w(word, occ = 1) {
    const txt = this.item.text; let i = -1;
    for (let k = 0; k < occ; k++) i = txt.indexOf(word, i + 1);
    if (i < 0) throw new Error(`word ${word} not in ${this.id}`);
    return (this.item.start - this.t0) + this.item.dur * (i / txt.length) - 0.12;
  }
  get end() { return this.D; }
  add(el, spec) {
    const s = Object.assign({ x: W / 2, y: H / 2, w: 400, h: 300, at: 0, in: 'pop', inDur: 0.6, out: 'pop', outAt: null, outDur: 0.4, rot: 0, float: 0, kb: null, sfx: undefined }, spec);
    el.style.position = 'absolute';
    el.style.left = (s.x - s.w / 2) + 'px'; el.style.top = (s.y - s.h / 2) + 'px';
    el.style.width = s.w + 'px'; el.style.height = s.h + 'px';
    if (s.z != null) el.style.zIndex = s.z;
    if (s.origin) el.style.transformOrigin = s.origin;
    this.root.appendChild(el);
    s.el = el; s.kbEl = el.querySelector('.kb');
    this.els.push(s);
    const sfx = s.sfx !== undefined ? s.sfx : ({ pop: 'pop', bigpop: 'pop', spin: 'pop', left: 'swish', right: 'swish', up: 'swish', down: 'swish', drop: 'drop', stamp: 'stamp', zoom: 'swish', swing: 'pop' })[s.in];
    if (sfx) EVENTS.push({ t: this.t0 + s.at, type: sfx });
    return el;
  }
  // rounded "photo" card holding an illustration
  card(svg, spec = {}) {
    const el = div('card' + (spec.cls ? ' ' + spec.cls : ''), `<div class="kb">${svg}</div>`);
    if (spec.bg) el.style.background = spec.bg;
    if (spec.radius != null) el.style.borderRadius = spec.radius + 'px';
    if (spec.kb === undefined) spec.kb = [1.0, 1.09, rnd(-20, 20), rnd(-14, 14)];
    return this.add(el, spec);
  }
  // free-floating SVG (no card)
  svg(svg, spec = {}) { return this.add(div('free' + (spec.cls ? ' ' + spec.cls : ''), svg), spec); }
  text(html, spec = {}) {
    const el = div('txt ' + (spec.cls || ''), html);
    if (spec.style) Object.assign(el.style, spec.style);
    return this.add(el, Object.assign({ in: 'pop' }, spec));
  }
  on(fn) { this.fns.push(fn); return this; }
  render(T) {
    const lt = T - this.t0;
    if (lt < -0.001 || lt > this.D + this.tail) { if (this.vis !== false) { this.root.style.display = 'none'; this.vis = false; } return; }
    if (this.vis !== true) { this.root.style.display = 'block'; this.vis = true; }
    for (const s of this.els) {
      const outAt = s.outAt ?? (this.D - 0.12);
      let x = 0, y = 0, sc = 1, r = s.rot, o = 1;
      const pin = prog(lt, s.at, s.inDur);
      if (lt < s.at) { s.el.style.visibility = 'hidden'; continue; }
      s.el.style.visibility = 'visible';
      const a = inFx(s.in, pin);
      const pout = prog(lt, outAt, s.outDur);
      const b = s.out === 'cut' ? (lt >= outAt ? { o: 0 } : {}) : outFx(s.out, pout);
      x += (a.x || 0) + (b.x || 0); y += (a.y || 0) + (b.y || 0);
      sc *= (a.s ?? 1) * (b.s ?? 1); r += (a.r || 0) + (b.r || 0); o *= (a.o ?? 1) * (b.o ?? 1);
      if (s.float) { y += Math.sin((lt + s.at * 1.7) * 1.9) * s.float; r += Math.sin((lt + s.at) * 1.3) * s.float * 0.08; }
      if (s.drift) { x += s.drift[0] * lt; y += s.drift[1] * lt; }
      if (s.anim) { const m = s.anim(lt, s) || {}; x += m.x || 0; y += m.y || 0; sc *= m.s ?? 1; r += m.r || 0; o *= m.o ?? 1; }
      s.el.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${r.toFixed(3)}deg) scale(${sc.toFixed(4)})`;
      s.el.style.opacity = o.toFixed(3);
      if (s.kbEl && s.kb) {
        const k = clamp(lt / (this.D + this.tail));
        const [s0, s1, px, py] = s.kb;
        s.kbEl.style.transform = `translate(${(px * k).toFixed(2)}px,${(py * k).toFixed(2)}px) scale(${lerp(s0, s1, k).toFixed(4)})`;
      }
    }
    for (const f of this.fns) f(lt, this.D);
  }
}

// deterministic random
let _seed = 12345;
function rnd(a = 0, b = 1) { _seed = (_seed * 16807) % 2147483647; return a + (b - a) * ((_seed - 1) / 2147483646); }
function seed(s) { _seed = s; }

// background darkening keyframes: piecewise-smooth alpha of a deep-brown overlay
const BG_KEYS = [];
function bgKey(t, a) { BG_KEYS.push({ t, a }); BG_KEYS.sort((p, q) => p.t - q.t); }
function bgAlpha(T) {
  const ks = BG_KEYS; if (!ks.length) return 0;
  if (T <= ks[0].t) return ks[0].a;
  for (let i = 0; i < ks.length - 1; i++)
    if (T < ks[i + 1].t) return lerp(ks[i].a, ks[i + 1].a, ease.inout((T - ks[i].t) / (ks[i + 1].t - ks[i].t)));
  return ks[ks.length - 1].a;
}

function render(T) {
  window.__T = T;
  for (const s of SCENES) s.render(T);
  document.getElementById('bgov').style.background = `rgba(38,14,4,${bgAlpha(T).toFixed(3)})`;
}
window.render = render;
window.getEvents = () => EVENTS.filter(e => e.type).sort((a, b) => a.t - b.t);
