// Illustration library. Each function returns an SVG string.
const SW = `stroke="${OL}" stroke-width="5" stroke-linejoin="round"`;
const SW3 = `stroke="${OL}" stroke-width="3.5" stroke-linejoin="round"`;
const svgw = (vb, inner, par = 'xMidYMid slice') => `<svg viewBox="${vb}" preserveAspectRatio="${par}" style="overflow:visible">${inner}</svg>`;
function grad(id, stops, vertical = true) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
}
function cloudG(x, y, s = 1, c = '#fff') { return `<g transform="translate(${x},${y}) scale(${s})" fill="${c}"><ellipse cx="0" cy="0" rx="60" ry="30"/><ellipse cx="-40" cy="8" rx="40" ry="22"/><ellipse cx="44" cy="8" rx="42" ry="22"/><ellipse cx="10" cy="-20" rx="38" ry="28"/></g>`; }
function sunG(x, y, r, face = true, glasses = false) {
  let rays = ''; for (let i = 0; i < 12; i++) { const a = i * 30; rays += `<path d="M0,${-r - 18} L10,${-r - 2} L-10,${-r - 2} Z" transform="rotate(${a})" fill="#ffb21e"/>`; }
  return `<g transform="translate(${x},${y})"><g class="rays">${rays}</g><circle r="${r}" fill="#ffd33f" ${SW}/>` +
    (face ? `<circle cx="${-r * .35}" cy="${-r * .1}" r="${r * .09}" fill="${OL}"/><circle cx="${r * .35}" cy="${-r * .1}" r="${r * .09}" fill="${OL}"/><path d="M${-r * .38},${r * .25} Q0,${r * .6} ${r * .38},${r * .25}" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>` : '') +
    (glasses ? `<g fill="${OL}"><rect x="${-r * .7}" y="${-r * .32}" width="${r * .6}" height="${r * .4}" rx="${r * .14}"/><rect x="${r * .1}" y="${-r * .32}" width="${r * .6}" height="${r * .4}" rx="${r * .14}"/><rect x="${-r * .12}" y="${-r * .24}" width="${r * .24}" height="${r * .08}"/></g>` : '') + `</g>`;
}

// ---------- theatre ----------
function curtain() {
  const id = uid('cf'), sh = uid('cs');
  return svgw('0 0 560 1080', `<defs><linearGradient id="${id}" x1="0" x2="0.125" spreadMethod="repeat"><stop offset="0" stop-color="#7d0a06"/><stop offset=".3" stop-color="#d42c18"/><stop offset=".5" stop-color="#ff5133"/><stop offset=".7" stop-color="#cf2b17"/><stop offset="1" stop-color="#7d0a06"/></linearGradient>${grad(sh, [[0, 'rgba(40,0,0,.55)'], [.25, 'rgba(40,0,0,0)'], [.85, 'rgba(40,0,0,0)'], [1, 'rgba(40,0,0,.45)']])}</defs><rect width="560" height="1080" fill="url(#${id})"/><rect width="560" height="1080" fill="url(#${sh})"/>`, 'none');
}
function valance() {
  const id = uid('vf'); let sc = '';
  for (let i = 0; i < 12; i++) sc += `<path d="M${i * 160},100 Q${i * 160 + 80},170 ${i * 160 + 160},100 Z" fill="url(#${id})"/>`;
  return svgw('0 0 1920 180', `<defs><linearGradient id="${id}" x1="0" x2="0.0417" spreadMethod="repeat"><stop offset="0" stop-color="#8a0c08"/><stop offset=".5" stop-color="#e3381f"/><stop offset="1" stop-color="#8a0c08"/></linearGradient></defs><rect width="1920" height="104" fill="url(#${id})"/>${sc}<path d="M0,104 L1920,104" stroke="#f2b632" stroke-width="10"/>`, 'none');
}
function portraitArt() {
  const g = uid('pg');
  let bokeh = ''; seed(7); for (let i = 0; i < 14; i++) bokeh += `<circle cx="${rnd(0, 800)}" cy="${rnd(0, 600)}" r="${rnd(20, 70)}" fill="#fff" opacity="${rnd(.05, .16)}"/>`;
  return svgw('0 0 800 860', `<defs><radialGradient id="${g}" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#9ad2e8"/><stop offset="1" stop-color="#3a7a9e"/></radialGradient></defs><rect width="800" height="860" fill="url(#${g})"/>${bokeh}<g transform="translate(130,40) scale(1.8)">${personG({ ...LOOK.suit, mouth: 'grin', eyes: 'open', brows: 'up', noLegs: true })}</g>`);
}

// ---------- maps ----------
function ausMapArt(o = {}) {
  const A = GEO.aus; let pins = '';
  for (const [name, lab, dx, dy] of (o.pins || [])) {
    const [x, y] = A.pins[name];
    pins += `<g class="pin" id="pin-${name}" transform="translate(${x},${y})"><g class="pinb"><path d="M0,0 C-8,-20 -26,-30 -26,-52 A26,26 0 1 1 26,-52 C26,-30 8,-20 0,0 Z" fill="#e63950" ${SW}/><circle cx="0" cy="-52" r="10" fill="#fff"/></g>
      <g class="pinl"><rect x="${dx - 4}" y="${dy - 40}" width="${lab.length * 24 + 40}" height="56" rx="28" fill="#fff" ${SW3}/><text x="${dx + 16}" y="${dy - 2}" font-family="Nunito" font-weight="900" font-size="34" fill="${OL}">${lab}</text></g></g>`;
  }
  const sea = o.sea ? `<rect x="-200" y="-200" width="1500" height="1400" fill="#7cc8e8"/><g opacity=".35" stroke="#fff" stroke-width="5" fill="none">${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${60 + i * 170},${980 - (i % 2) * 40} q20,-14 40,0 t40,0"/>`).join('')}</g>` : '';
  return svgw(o.vb || '-70 -60 1140 1040', `${sea}<path d="${A.main}" fill="#ffd36b" ${SW} transform="translate(8,10)" opacity=".0"/><path d="${A.main}" fill="${o.land || '#ffd36b'}" ${SW}/><path class="tas" d="${A.tas}" fill="${o.tas || o.land || '#ffd36b'}" ${SW}/>${pins}`, 'xMidYMid meet');
}
function worldArt() {
  const Wd = GEO.world; const [sx, sy] = Wd.pins.Sydney, [ux, uy] = Wd.pins.USA;
  const route = `M${sx},${sy} Q${(sx + ux + 2000) / 2 - 1000},${Math.min(sy, uy) - 380} ${ux + 2000},${uy}`;
  return svgw('1450 60 1500 800', `<rect x="0" y="0" width="4000" height="1000" fill="#7cc8e8"/>
   <g fill="#fff4e0" stroke="#d6a77a" stroke-width="2.5"><path d="${Wd.land}"/><path d="${Wd.aus}" fill="#ffd36b" stroke="${OL}" stroke-width="3"/><g transform="translate(2000,0)"><path d="${Wd.land}"/></g></g>
   <path class="route" d="${route}" fill="none" stroke="#e63950" stroke-width="7" stroke-dasharray="18 14" stroke-linecap="round"/>
   <g class="pinU" transform="translate(${ux + 2000},${uy})"><path d="M0,0 C-6,-15 -20,-22 -20,-40 A20,20 0 1 1 20,-40 C20,-22 6,-15 0,0 Z" fill="#2a62b8" ${SW3}/><circle cy="-40" r="7" fill="#fff"/></g>
   <g class="pinS" transform="translate(${sx},${sy})"><path d="M0,0 C-6,-15 -20,-22 -20,-40 A20,20 0 1 1 20,-40 C20,-22 6,-15 0,0 Z" fill="#e63950" ${SW3}/><circle cy="-40" r="7" fill="#fff"/></g>
   <g class="plane">${planeG()}</g>`);
}
function planeG() { return `<g transform="scale(1.1)"><path d="M-46,0 Q-40,-10 30,-8 Q52,-6 56,0 Q52,6 30,8 Q-40,10 -46,0 Z" fill="#fff" ${SW3}/><path d="M-4,-6 L-24,-44 L-10,-44 L22,-6 Z M-4,6 L-24,44 L-10,44 L22,6 Z" fill="#2a62b8" ${SW3}/><path d="M-40,-4 L-50,-22 L-40,-22 L-30,-6 Z" fill="#e63950" ${SW3}/><circle cx="36" cy="-1" r="4" fill="#7cc8e8"/></g>`; }

// ---------- globe (orthographic, updated per frame) ----------
function globeArt() {
  const g = uid('gl'), sh = uid('gs');
  return svgw('-260 -260 520 520', `<defs><radialGradient id="${g}" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#8fd6f2"/><stop offset="1" stop-color="#2a7fb8"/></radialGradient><radialGradient id="${sh}" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="rgba(255,255,255,.35)"/><stop offset=".5" stop-color="rgba(255,255,255,0)"/><stop offset="1" stop-color="rgba(0,20,60,.35)"/></radialGradient></defs>
   <circle r="240" fill="url(#${g})" ${SW}/><path class="land" fill="#8fd16f" stroke="#4f8f3a" stroke-width="2"/><path class="ausl" fill="#ffd36b" stroke="${OL}" stroke-width="3"/><circle r="240" fill="url(#${sh})"/><circle r="240" fill="none" ${SW}/><g class="gpin"></g>`, 'xMidYMid meet');
}
function updateGlobe(el, lon0, lat0) {
  const R = 240, l0 = lon0 * Math.PI / 180, p0 = lat0 * Math.PI / 180;
  const proj = (lon, lat) => {
    const l = lon * Math.PI / 180, p = lat * Math.PI / 180;
    let x = Math.cos(p) * Math.sin(l - l0), y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0);
    const c = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0);
    if (c < 0) { const n = Math.hypot(x, y) || 1; x /= n; y /= n; }
    return [x * R, -y * R, c];
  };
  let land = '', aus = '';
  for (const r of GEO.globe) {
    const pts = r.pts.map(([a, b]) => proj(a, b));
    if (pts.every(p => p[2] < 0)) continue;
    const d = 'M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L') + 'Z';
    if (r.aus) aus += d; else land += d;
  }
  el.querySelector('.land').setAttribute('d', land);
  el.querySelector('.ausl').setAttribute('d', aus);
  return proj;
}

// ---------- childhood ----------
function footyArt() {
  const sky = uid('sk');
  return svgw('0 0 800 560', `<defs>${grad(sky, [[0, '#7fcdf0'], [1, '#d4f0fb']])}</defs><rect width="800" height="560" fill="url(#${sky})"/>${cloudG(150, 90, .9)}${cloudG(620, 70, .7)}
   <path d="M0,380 Q400,340 800,380 L800,560 L0,560 Z" fill="#6cbf55"/><path d="M0,420 Q400,390 800,420" stroke="#8fd474" stroke-width="18" fill="none"/>
   <g fill="#fff" ${SW3}><rect x="520" y="150" width="14" height="250"/><rect x="580" y="110" width="16" height="290"/><rect x="650" y="110" width="16" height="290"/><rect x="710" y="150" width="14" height="250"/></g>
   <g class="ball" transform="translate(470,170) rotate(-30)"><ellipse rx="40" ry="26" fill="#b5532c" ${SW}/><path d="M-14,-4 L14,-4 M-10,-10 L-10,2 M-2,-11 L-2,3 M6,-11 L6,3" stroke="#fff" stroke-width="3.5"/></g>
   <g transform="translate(150,180) scale(.72)">${personG({ ...LOOK.kid, aL: 150, aR: -150, mouth: 'grin', eyes: 'happy', shirt: '#1f4fa0' })}</g>`);
}
function swimArt() {
  const w = uid('wv');
  return svgw('0 0 800 560', `<defs>${grad(w, [[0, '#4fc3e8'], [1, '#1a7fb8']])}</defs><rect width="800" height="560" fill="url(#${w})"/>
   ${[100, 230, 360, 490].map(y => `<g>${[...Array(18)].map((_, i) => `<circle cx="${i * 48 + 10}" cy="${y}" r="9" fill="${i % 2 ? '#e63950' : '#fff'}"/>`).join('')}</g>`).join('')}
   <g transform="translate(250,150) scale(.62)"><g clip-path="none">${personG({ ...LOOK.kid, goggles: true, mouth: 'grin', aL: 160, aR: -40, noLegs: true, shirt: '#f2c4a2' })}</g></g>
   <path d="M0,330 Q50,300 100,330 T200,330 T300,330 T400,330 T500,330 T600,330 T700,330 T800,330 L800,560 L0,560 Z" fill="#2a95cc"/>
   <g fill="#fff" opacity=".9"><circle cx="220" cy="318" r="12"/><circle cx="250" cy="300" r="8"/><circle cx="470" cy="312" r="14"/><circle cx="500" cy="296" r="9"/><circle cx="440" cy="300" r="7"/></g>
   <g stroke="#bfefff" stroke-width="6" fill="none" opacity=".6"><path d="M80,420 q30,-16 60,0 t60,0"/><path d="M520,470 q30,-16 60,0 t60,0"/><path d="M320,500 q30,-16 60,0"/></g>`);
}
function caravanArt() {
  const sky = uid('sk');
  return svgw('0 0 800 560', `<defs>${grad(sky, [[0, '#ffd59a'], [1, '#ffeacb']])}</defs><rect width="800" height="560" fill="url(#${sky})"/>${sunG(650, 120, 50, false)}
   <path d="M0,330 Q160,230 330,320 Q480,230 640,300 Q720,260 800,290 L800,560 L0,560 Z" fill="#9ccf6e"/><path d="M0,380 Q220,320 420,380 Q620,330 800,370 L800,560 L0,560 Z" fill="#76b956"/>
   <rect x="0" y="430" width="800" height="90" fill="#5b5f6b"/><path d="M0,476 L800,476" stroke="#ffd33f" stroke-width="8" stroke-dasharray="44 34"/>
   <g class="veh"><g transform="translate(70,300)">
     <rect x="0" y="40" width="250" height="110" rx="26" fill="#fffaf0" ${SW}/><rect x="0" y="92" width="250" height="20" fill="#e2483d"/><rect x="0" y="40" width="250" height="110" rx="26" fill="none" ${SW}/>
     <rect x="30" y="58" width="70" height="40" rx="10" fill="#bfe8f8" ${SW3}/><rect x="150" y="58" width="44" height="80" rx="8" fill="#f5d9b0" ${SW3}/>
     <circle cx="120" cy="156" r="24" fill="#333" ${SW3}/><circle cx="120" cy="156" r="9" fill="#bbb"/><path d="M250,128 L290,128" ${SW}/>
     <g transform="translate(290,10)"><path d="M0,140 L0,80 Q4,52 40,48 L120,46 Q150,48 168,88 L200,96 Q216,100 216,120 L216,140 Z" fill="#2a7fd0" ${SW}/><path d="M50,58 L110,58 Q128,60 140,88 L50,88 Z" fill="#bfe8f8" ${SW3}/><circle cx="50" cy="146" r="25" fill="#333" ${SW3}/><circle cx="50" cy="146" r="9" fill="#bbb"/><circle cx="172" cy="146" r="25" fill="#333" ${SW3}/><circle cx="172" cy="146" r="9" fill="#bbb"/>
       <g transform="translate(40,-2) scale(.42)"><g fill="none" stroke="${OL}" stroke-width="10"><circle cx="40" cy="60" r="38"/><circle cx="200" cy="60" r="38"/><path d="M40,60 L100,0 L170,0 L200,60 M100,0 L120,60 L170,0" stroke="#e63950"/></g></g></g>
   </g></g>`);
}
function uniArt() {
  return svgw('0 0 800 560', `<rect width="800" height="560" fill="#2f5d50"/><rect x="18" y="18" width="764" height="524" fill="none" stroke="#8a5a2b" stroke-width="22"/>
   <g fill="none" stroke="rgba(255,255,255,.55)" stroke-width="4" stroke-linecap="round"><path d="M70,90 q20,-20 40,0 t40,0"/><path d="M90,150 l40,0 M110,130 l0,40"/><path d="M600,100 c20,-30 60,-30 70,0"/><path d="M640,460 l60,0 M640,480 l40,0"/><circle cx="110" cy="460" r="26"/><path d="M95,445 l30,30 M125,445 l-30,30"/></g>
   <text x="400" y="110" font-family="Caveat" font-weight="700" font-size="64" fill="#fff" text-anchor="middle" opacity=".92">Medicine 101</text>
   <g transform="translate(400,300)"><path d="M-170,-10 L0,-80 L170,-10 L0,60 Z" fill="#1d1d1d" ${SW}/><path d="M-100,20 L-100,100 Q0,150 100,100 L100,20 L0,60 Z" fill="#2a2a2a" ${SW}/><path d="M150,-2 L150,96" stroke="#ffcf3f" stroke-width="7"/><circle cx="150" cy="100" r="12" fill="#ffcf3f"/><circle cx="0" cy="-10" r="10" fill="#ffcf3f"/></g>
   <g transform="translate(520,380) rotate(-12)"><rect x="0" y="0" width="200" height="56" rx="28" fill="#fff8e6" ${SW}/><ellipse cx="200" cy="28" rx="16" ry="28" fill="#f2e5c8" ${SW3}/><path d="M90,0 L90,56 M110,0 L110,56" stroke="#d62b3a" stroke-width="10"/><path d="M100,56 L86,92 M100,56 L114,92" stroke="#d62b3a" stroke-width="8"/></g>`);
}
function labTripArt() {
  return svgw('0 0 900 520', `<rect width="900" height="520" fill="#e9f6ef"/><rect y="400" width="900" height="120" fill="#cfe9dc"/>
   <g transform="translate(70,150)"><rect x="0" y="40" width="200" height="220" fill="#fff" ${SW}/><path d="M-12,44 L100,-10 L212,44 Z" fill="#7cc8e8" ${SW}/><rect x="70" y="170" width="60" height="90" fill="#7cc8e8" ${SW3}/>${[0, 1].map(r => [0, 1, 2].map(c => `<rect x="${22 + c * 56}" y="${70 + r * 50}" width="40" height="32" rx="4" fill="#bfe8f8" ${SW3}/>`).join('')).join('')}<circle cx="100" cy="20" r="0"/><text x="100" y="34" font-family="Nunito" font-weight="900" font-size="34" text-anchor="middle" fill="#fff">H</text></g>
   <g transform="translate(630,140)"><rect x="0" y="50" width="210" height="210" fill="#fff" ${SW}/><rect x="-10" y="30" width="230" height="30" fill="#2a9d8f" ${SW3}/><text x="105" y="54" font-family="Nunito" font-weight="900" font-size="24" text-anchor="middle" fill="#fff">LAB</text>
     <g transform="translate(70,90)"><path d="M18,0 L18,50 L-16,120 Q-20,134 -4,134 L76,134 Q92,134 88,120 L54,50 L54,0 Z" fill="#fff" ${SW3}/><path d="M-8,104 L80,104 L88,120 Q92,134 76,134 L-4,134 Q-20,134 -16,120 Z" fill="#b86ad6"/><circle cx="30" cy="92" r="6" fill="#b86ad6"/><circle cx="44" cy="78" r="4" fill="#b86ad6"/></g></g>
   <path d="M280,250 Q450,90 620,250" fill="none" stroke="#2a9d8f" stroke-width="6" stroke-dasharray="14 12"/>
   <g class="jar"><rect x="-26" y="-34" width="52" height="16" rx="5" fill="#e2483d" ${SW3}/><rect x="-30" y="-20" width="60" height="58" rx="10" fill="rgba(200,236,255,.95)" ${SW3}/><ellipse cx="0" cy="14" rx="14" ry="10" fill="#d97aa6"/></g>`);
}
function microscopeArt() {
  return svgw('0 0 400 520', `<g ${SW}>
   <rect x="60" y="460" width="280" height="44" rx="14" fill="#2f3e5c"/><path d="M230,460 Q300,360 260,250 L230,180 L200,200 L232,262 Q258,350 190,460 Z" fill="#3d5a8a"/>
   <rect x="90" y="300" width="220" height="24" rx="6" fill="#5a6d8f"/><rect x="150" y="330" width="40" height="40" rx="6" fill="#ffd33f"/>
   <g transform="rotate(-24 180 180)"><rect x="140" y="60" width="64" height="200" rx="14" fill="#e8edf5"/><rect x="132" y="30" width="80" height="44" rx="10" fill="#3d5a8a"/><rect x="152" y="250" width="40" height="44" rx="6" fill="#9aa8c0"/></g>
   <circle cx="262" cy="220" r="26" fill="#9aa8c0"/></g><rect x="110" y="292" width="120" height="12" rx="3" fill="rgba(220,240,255,.95)" stroke="${OL}" stroke-width="3"/><ellipse cx="170" cy="298" rx="22" ry="4" fill="#d97aa6"/>`, 'xMidYMid meet');
}
function cellsArt(kind = 'normal', sd = 3) {
  seed(sd * 101 + (kind === 'cancer' ? 7 : 0));
  const cl = uid('cc'); let s = '';
  if (kind === 'normal') {
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      const x = c * 60 + (r % 2) * 30 + rnd(-6, 6) + 10, y = r * 58 + rnd(-6, 6) + 10;
      s += `<ellipse cx="${x}" cy="${y}" rx="${rnd(28, 33)}" ry="${rnd(25, 30)}" fill="#f6bfd3" stroke="#df8fb1" stroke-width="3"/><ellipse cx="${x + rnd(-4, 4)}" cy="${y + rnd(-4, 4)}" rx="${rnd(9, 11)}" ry="${rnd(8, 10)}" fill="#7a5ab0"/>`;
    }
  } else {
    for (let i = 0; i < 70; i++) {
      const x = rnd(0, 520), y = rnd(0, 520), r = rnd(16, 34);
      let d = ''; for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, rr = r * rnd(.7, 1.25); d += (k ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ',' + (y + Math.sin(a) * rr).toFixed(1); }
      s += `<path d="${d}Z" fill="${rnd() < .5 ? '#4a2a7a' : '#5e3592'}" stroke="#2e1650" stroke-width="2.5"/>`;
      if (rnd() < .6) s += `<circle cx="${x + rnd(-20, 20)}" cy="${y + rnd(-20, 20)}" r="${rnd(3, 7)}" fill="#6b3e1e"/>`;
    }
  }
  return svgw('0 0 520 520', `<defs><clipPath id="${cl}"><circle cx="260" cy="260" r="250"/></clipPath></defs><circle cx="260" cy="260" r="250" fill="${kind === 'normal' ? '#fbe1ea' : '#e9b7cd'}"/><g clip-path="url(#${cl})">${s}</g><circle cx="260" cy="260" r="250" fill="none" stroke="#2f3e5c" stroke-width="22"/><path d="M110,120 Q170,60 250,52" stroke="#fff" stroke-width="12" fill="none" opacity=".45" stroke-linecap="round"/>`, 'xMidYMid meet');
}
function sydneyArt() {
  const sky = uid('sk'), sea = uid('se');
  return svgw('0 0 800 560', `<defs>${grad(sky, [[0, '#ff9d6c'], [.6, '#ffd59a'], [1, '#fff0d0']])}${grad(sea, [[0, '#3e8fc2'], [1, '#1e5f8f']])}</defs><rect width="800" height="560" fill="url(#${sky})"/>${sunG(400, 330, 70, false)}
   <rect y="360" width="800" height="200" fill="url(#${sea})"/><g stroke="rgba(255,255,255,.5)" stroke-width="5">${[0, 1, 2, 3, 4].map(i => `<path d="M${80 + i * 150},${400 + (i % 3) * 40} l50,0"/>`).join('')}</g>
   <g fill="#4a4f63" ${SW3}><path d="M380,360 Q560,150 760,360 L740,360 Q560,180 400,360 Z"/><rect x="360" y="280" width="40" height="80"/><rect x="740" y="280" width="40" height="80"/><rect x="360" y="300" width="420" height="14"/></g>
   <g stroke="#4a4f63" stroke-width="3">${[...Array(12)].map((_, i) => { const x = 420 + i * 28; const y = 360 - Math.sin((x - 380) / 380 * Math.PI) * 170; return `<path d="M${x},${y} L${x},307"/>`; }).join('')}</g>
   <g transform="translate(60,250)" ${SW3}><rect x="0" y="100" width="280" height="22" fill="#e9dcc6"/><path d="M20,100 Q40,10 110,0 Q80,40 90,100 Z" fill="#fff"/><path d="M80,100 Q110,20 180,14 Q140,50 150,100 Z" fill="#fff"/><path d="M140,100 Q170,40 230,36 Q200,70 210,100 Z" fill="#fff"/><path d="M196,100 Q214,64 256,62 Q236,84 244,100 Z" fill="#fff"/></g>`);
}
function beachArt() {
  const sky = uid('sk');
  return svgw('0 0 800 560', `<defs>${grad(sky, [[0, '#5cc0f0'], [1, '#c8ecfb']])}</defs><rect width="800" height="560" fill="url(#${sky})"/>${cloudG(120, 110, .7)}
   <g class="sun">${sunG(560, 170, 92, true, true)}</g>
   <path d="M0,330 L800,330 L800,400 L0,400 Z" fill="#2a95cc"/><path d="M0,330 L800,330" stroke="#bfefff" stroke-width="6"/>
   <path d="M0,390 Q200,370 400,392 Q600,410 800,386 L800,560 L0,560 Z" fill="#f6dca0"/>
   <g transform="translate(170,250)"><path d="M0,0 L10,230" stroke="#7a4a1e" stroke-width="10"/><path d="M-120,40 Q0,-70 130,40 Z" fill="#e63950" ${SW}/><path d="M-40,40 Q0,-60 50,40" fill="#fff" ${SW3}/></g>
   <rect x="300" y="450" width="160" height="60" rx="8" fill="#ffcf3f" ${SW3} transform="rotate(-6 380 480)"/><path d="M300,464 L460,446 M302,484 L462,466" stroke="#e2483d" stroke-width="10" transform="rotate(-6 380 480)"/>`);
}
function moleArt() {
  return svgw('0 0 520 520', `<circle cx="260" cy="260" r="250" fill="#f2c4a2"/><g stroke="#e0a986" stroke-width="3" fill="none" opacity=".7"><path d="M60,180 q60,-20 120,0"/><path d="M320,120 q60,-20 120,0"/><path d="M80,380 q60,-20 120,0"/><path d="M330,400 q50,-16 100,0"/></g>
   <path d="M230,210 Q300,190 320,250 Q340,320 270,330 Q200,340 196,280 Q190,226 230,210 Z" fill="#5a3418"/><path d="M250,240 Q290,236 296,270 Q290,300 262,300" fill="#3a1e0c"/><circle cx="230" cy="290" r="10" fill="#7a4a24"/>
   <circle cx="260" cy="260" r="250" fill="none" stroke="#2f3e5c" stroke-width="22"/>`, 'xMidYMid meet');
}

// ---------- pathology work ----------
function slideIcon() { return svgw('0 0 220 90', `<rect x="4" y="4" width="212" height="82" rx="8" fill="rgba(225,242,255,.96)" ${SW3}/><rect x="10" y="10" width="54" height="70" rx="4" fill="#fff" stroke="#9fb5c8" stroke-width="2"/><path d="M18,28 L56,28 M18,40 L50,40 M18,52 L54,52" stroke="#9fb5c8" stroke-width="4"/><path d="M110,30 Q150,14 180,36 Q196,56 168,66 Q130,78 108,62 Q92,46 110,30 Z" fill="#d97aa6" stroke="#b9558a" stroke-width="3"/>`, 'xMidYMid meet'); }
function paperArt() {
  return svgw('0 0 300 380', `<rect x="20" y="20" width="260" height="340" rx="10" fill="#fff" ${SW}/><rect x="50" y="56" width="200" height="22" rx="4" fill="#3b1f0e"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="50" y="${100 + i * 26}" width="${i % 3 === 2 ? 140 : 200}" height="10" rx="5" fill="#c9c9c9"/>`).join('')}<rect x="50" y="290" width="90" height="46" rx="4" fill="#f6bfd3"/><path d="M160,330 L180,300 L200,318 L230,286" stroke="#2a9d8f" stroke-width="6" fill="none"/>`, 'xMidYMid meet');
}
function bookArt() {
  return svgw('0 0 380 480', `<rect x="40" y="20" width="310" height="440" rx="12" fill="#1e5f8f" ${SW}/><rect x="40" y="20" width="44" height="440" rx="10" fill="#174b72" ${SW}/>
   <circle cx="218" cy="140" r="58" fill="none" stroke="#bfe8f8" stroke-width="7"/><path d="M160,140 L276,140 M218,82 L218,198 M175,105 Q218,125 261,105 M175,175 Q218,155 261,175" stroke="#bfe8f8" stroke-width="5" fill="none"/>
   <text x="218" y="262" font-family="Nunito" font-weight="900" font-size="30" fill="#fff" text-anchor="middle">WHO</text><text x="218" y="300" font-family="Nunito" font-weight="800" font-size="24" fill="#bfe8f8" text-anchor="middle">Classification of</text><text x="218" y="346" font-family="Nunito" font-weight="900" font-size="40" fill="#ffd33f" text-anchor="middle">Skin Tumours</text>`, 'xMidYMid meet');
}
function instituteArt() {
  const sky = uid('sk');
  return svgw('0 0 900 560', `<defs>${grad(sky, [[0, '#86d0f2'], [1, '#e2f5fc']])}</defs><rect width="900" height="560" fill="url(#${sky})"/>${cloudG(160, 90, .8)}${cloudG(760, 120, .6)}
   <rect y="470" width="900" height="90" fill="#7cc46a"/>
   <g ${SW}><rect x="170" y="120" width="560" height="360" fill="#f4f1ea"/><rect x="170" y="120" width="560" height="40" fill="#2a9d8f"/></g>
   ${[0, 1, 2, 3].map(r => [0, 1, 2, 3, 4, 5, 6].map(c => `<rect x="${200 + c * 74}" y="${180 + r * 62}" width="52" height="40" rx="4" fill="#9fd8ef" ${SW3}/>`).join('')).join('')}
   <rect x="400" y="400" width="100" height="80" fill="#5a6d8f" ${SW3}/>
   <g transform="translate(450,380)"><rect x="-300" y="-46" width="600" height="68" rx="12" fill="#fff" ${SW}/><text x="0" y="1" font-family="Nunito" font-weight="900" font-size="34" text-anchor="middle" fill="#1f2a44">Melanoma Institute Australia</text></g>`);
}
function ivArt() {
  return svgw('0 0 360 560', `<path d="M180,20 L180,60" stroke="#8a8a8a" stroke-width="8"/><path d="M150,20 L210,20" stroke="#8a8a8a" stroke-width="8" stroke-linecap="round"/>
   <path d="M90,60 L270,60 Q300,60 300,96 L300,330 Q300,380 250,384 L110,384 Q60,380 60,330 L60,96 Q60,60 90,60 Z" fill="rgba(235,248,255,.95)" ${SW}/><path d="M64,200 L296,200 L296,330 Q296,376 250,380 L110,380 Q64,376 64,330 Z" fill="#7fd3c6"/>
   <rect x="88" y="110" width="184" height="64" rx="10" fill="#fff" ${SW3}/><text x="180" y="152" font-family="Nunito" font-weight="900" font-size="26" text-anchor="middle" fill="#1f2a44">IMMUNO</text>
   <path d="M180,384 L180,420" ${SW}/><rect x="166" y="420" width="28" height="44" rx="6" fill="#fff" ${SW3}/><path d="M180,464 Q180,520 120,540" fill="none" stroke="#7fd3c6" stroke-width="10"/><path d="M180,464 Q180,520 120,540" fill="none" stroke="${OL}" stroke-width="3" opacity=".5"/>
   <g fill="#fff" opacity=".9"><path d="M230,240 l6,14 14,6 -14,6 -6,14 -6,-14 -14,-6 14,-6Z"/><path d="M110,300 l4,9 9,4 -9,4 -4,9 -4,-9 -9,-4 9,-4Z"/></g>`, 'xMidYMid meet');
}
function tcellArt(mode = 'sleep') {
  const eyes = mode === 'sleep' ? `<path d="M70,96 Q82,104 94,96 M126,96 Q138,104 150,96" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>`
    : `<ellipse cx="84" cy="96" rx="9" ry="12" fill="${OL}"/><ellipse cx="136" cy="96" rx="9" ry="12" fill="${OL}"/><circle cx="87" cy="91" r="3" fill="#fff"/><circle cx="139" cy="91" r="3" fill="#fff"/><path d="M68,74 L98,84 M152,74 L122,84" stroke="${OL}" stroke-width="6" stroke-linecap="round"/>`;
  const mouth = mode === 'sleep' ? `<ellipse cx="110" cy="128" rx="8" ry="6" fill="#7a1f1f"/>` : `<path d="M92,124 Q110,140 128,124" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>`;
  let bumps = ''; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; bumps += `<circle cx="${110 + Math.cos(a) * 80}" cy="${110 + Math.sin(a) * 80}" r="14" fill="#7ec8f0" ${SW3}/>`; }
  return svgw('0 0 220 220', `${bumps}<circle cx="110" cy="110" r="80" fill="#7ec8f0" ${SW}/><circle cx="110" cy="110" r="64" fill="#a6dcf6"/>${eyes}${mouth}<circle cx="64" cy="120" r="9" fill="#f0857a" opacity=".5"/><circle cx="156" cy="120" r="9" fill="#f0857a" opacity=".5"/>
   ${mode === 'awake' ? `<path d="M20,40 L80,8 L92,30 Z" fill="#ffd33f" ${SW3}/>` : ''}`, 'xMidYMid meet');
}
function cancerCellArt(mode = 'mean', keyhole = false) {
  let spikes = ''; for (let i = 0; i < 12; i++) { const a = i / 12 * 360; spikes += `<path d="M110,6 L122,40 L98,40 Z" transform="rotate(${a} 110 110)" fill="#7b4fb8" ${SW3}/>`; }
  const face = mode === 'mean' ? `<path d="M70,82 L98,94 M150,82 L122,94" stroke="${OL}" stroke-width="6" stroke-linecap="round"/><ellipse cx="86" cy="104" rx="8" ry="10" fill="${OL}"/><ellipse cx="134" cy="104" rx="8" ry="10" fill="${OL}"/><path d="M88,140 L100,130 L110,140 L120,130 L132,140" fill="none" stroke="${OL}" stroke-width="5"/>`
    : `<path d="M74,98 L96,108 M74,108 L96,98 M124,98 L146,108 M124,108 L146,98" stroke="${OL}" stroke-width="5" stroke-linecap="round"/><path d="M90,140 Q110,126 130,140" fill="none" stroke="${OL}" stroke-width="5"/>`;
  if (keyhole) return svgw('0 0 220 220', `${spikes}<circle cx="110" cy="110" r="76" fill="#9b6bd6" ${SW}/><circle cx="96" cy="96" r="50" fill="#b48ae6" opacity=".6"/><ellipse cx="86" cy="88" rx="8" ry="10" fill="${OL}"/><ellipse cx="134" cy="88" rx="8" ry="10" fill="${OL}"/><path d="M70,70 L98,80 M150,70 L122,80" stroke="${OL}" stroke-width="6" stroke-linecap="round"/><circle cx="110" cy="138" r="14" fill="${OL}"/><path d="M103,140 L98,176 L122,176 L117,140 Z" fill="${OL}"/>`, 'xMidYMid meet');
  const kh = keyhole ? `<circle cx="110" cy="150" r="13" fill="${OL}"/><path d="M104,152 L100,182 L120,182 L116,152 Z" fill="${OL}"/>` : '';
  return svgw('0 0 220 220', `${spikes}<circle cx="110" cy="110" r="76" fill="#9b6bd6" ${SW}/><circle cx="96" cy="96" r="50" fill="#b48ae6" opacity=".6"/>${face}${kh}`, 'xMidYMid meet');
}
function personIcon(c) { return `<circle cx="20" cy="12" r="10" fill="${c}"/><path d="M4,46 Q4,26 20,26 Q36,26 36,46 Z" fill="${c}"/>`; }

// ---------- illness ----------
function calendarArt(year) {
  return svgw('0 0 400 440', `<rect x="20" y="40" width="360" height="380" rx="24" fill="#fff" ${SW}/><path d="M20,64 Q20,40 44,40 L356,40 Q380,40 380,64 L380,140 L20,140 Z" fill="#e63950" ${SW}/><rect x="90" y="14" width="22" height="60" rx="11" fill="#5a6d8f" ${SW3}/><rect x="288" y="14" width="22" height="60" rx="11" fill="#5a6d8f" ${SW3}/>
   <text x="200" y="118" font-family="Nunito" font-weight="900" font-size="54" fill="#fff" text-anchor="middle">YEAR</text><text x="200" y="330" font-family="Capra" font-size="132" fill="${OL}" text-anchor="middle">${year}</text>`, 'xMidYMid meet');
}
function stormArt() {
  return svgw('0 0 600 360', `<g fill="#5d6577" ${SW}><path d="M110,250 Q40,250 44,196 Q50,146 112,150 Q120,80 200,80 Q250,30 320,60 Q380,30 430,90 Q520,84 540,160 Q580,190 556,240 Q540,262 500,256 Z"/></g><path d="M150,170 Q250,130 330,150" stroke="#7a8296" stroke-width="10" fill="none" stroke-linecap="round"/>
   <path class="bolt" d="M300,220 L250,310 L292,304 L262,380 L360,270 L312,276 L350,220 Z" fill="#ffd33f" ${SW}/>`, 'xMidYMid meet');
}
function brainSliceG(tumour = true, sd = 5) {
  seed(sd); let gy = '';
  for (let i = 0; i < 34; i++) {
    const a = i / 34 * Math.PI * 2 + rnd(-.05, .05), r1 = rnd(.55, .82);
    const ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
    const P = f => [260 + ca * 168 * f, 270 + sa * 198 * f];
    const [x0, y0] = P(.99), [x1, y1] = P(r1), [xa, ya] = P(.99 - (.99 - r1) * .35), [xb, yb] = P(.99 - (.99 - r1) * .7);
    const o1 = rnd(-26, 26), o2 = rnd(-26, 26);
    gy += `<path d="M${x0.toFixed(0)},${y0.toFixed(0)} C${(xa + px * o1).toFixed(0)},${(ya + py * o1).toFixed(0)} ${(xb + px * o2).toFixed(0)},${(yb + py * o2).toFixed(0)} ${x1.toFixed(0)},${y1.toFixed(0)}" stroke="#5e5e5e" stroke-width="${rnd(4, 7).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
    if (rnd() < .6) { const [x2, y2] = P(r1 + .1); gy += `<path d="M${x2.toFixed(0)},${y2.toFixed(0)} q${(px * rnd(14, 30)).toFixed(0)},${(py * rnd(14, 30)).toFixed(0)} ${(px * rnd(20, 40) - ca * 10).toFixed(0)},${(py * rnd(20, 40) - sa * 10).toFixed(0)}" stroke="#5e5e5e" stroke-width="4" fill="none" stroke-linecap="round"/>`; }
  }
  return `<ellipse cx="260" cy="270" rx="200" ry="235" fill="#e6e6e6"/><ellipse cx="260" cy="270" rx="182" ry="216" fill="#8a8a8a"/><ellipse cx="260" cy="270" rx="172" ry="206" fill="#b4b4b4"/>${gy}<ellipse cx="260" cy="270" rx="96" ry="120" fill="#c4c4c4" opacity=".7"/>
   <path d="M260,64 L260,476" stroke="#555" stroke-width="6"/><path d="M228,210 Q205,260 236,320 Q252,280 252,230 Z M292,210 Q315,260 284,320 Q268,280 268,230 Z" fill="#333"/>` +
    (tumour ? `<g class="tumour"><circle cx="170" cy="230" r="42" fill="#f4f4f4"/><circle cx="170" cy="230" r="27" fill="#555"/><circle cx="162" cy="222" r="8" fill="#777"/></g>` : '');
}
function mriArt(tumour = true, sd = 5) { return svgw('0 0 520 540', `<rect width="520" height="540" fill="#0c0c0e"/>${brainSliceG(tumour, sd)}<text x="22" y="40" font-family="OpenSans" font-weight="600" font-size="20" fill="#9a9a9a">MRI · AXIAL</text><text x="498" y="520" font-family="OpenSans" font-weight="600" font-size="20" fill="#9a9a9a" text-anchor="end">L</text>`); }
function hourglassArt() {
  return svgw('0 0 300 440', `<rect x="30" y="20" width="240" height="30" rx="10" fill="#8a5a2b" ${SW}/><rect x="30" y="390" width="240" height="30" rx="10" fill="#8a5a2b" ${SW}/>
   <path d="M60,50 L240,50 Q240,150 160,220 Q240,290 240,390 L60,390 Q60,290 140,220 Q60,150 60,50 Z" fill="rgba(220,240,255,.9)" ${SW}/>
   <path class="sandTop" d="M80,90 L220,90 Q214,150 150,206 Q86,150 80,90 Z" fill="#f2b632"/><path class="sandBot" d="M150,300 L230,380 L70,380 Z" fill="#f2b632"/><path class="stream" d="M150,206 L150,380" stroke="#f2b632" stroke-width="6"/>`, 'xMidYMid meet');
}
function familyArt(sunset = false) {
  const sky = uid('sk'); const fig = (x, h, c, hair) => `<g transform="translate(${x},${560 - h})"><circle cx="0" cy="${h * .12}" r="${h * .11}" fill="${c}"/>${hair || ''}<path d="M${-h * .14},${h * .27} Q0,${h * .2} ${h * .14},${h * .27} L${h * .12},${h * .62} L${h * .08},${h} L${h * .02},${h} L0,${h * .66} L${-h * .02},${h} L${-h * .08},${h} L${-h * .12},${h * .62} Z" fill="${c}"/></g>`;
  const c = sunset ? '#4a2416' : '#2f3e5c';
  return svgw('0 0 800 560', `<defs>${grad(sky, sunset ? [[0, '#ff7a59'], [.55, '#ffc46b'], [1, '#ffe1a8']] : [[0, '#9fdcf5'], [1, '#e8f7fd']])}</defs><rect width="800" height="560" fill="url(#${sky})"/>
   ${sunset ? sunG(560, 330, 90, false) + `<rect y="380" width="800" height="200" fill="#e8925a"/><path d="M0,380 L800,380" stroke="#ffd59a" stroke-width="5"/><path d="M0,450 Q400,420 800,450 L800,560 L0,560 Z" fill="#c9733f"/>` : `<rect y="440" width="800" height="120" fill="#7cc46a"/>${cloudG(160, 100, .8)}`}
   <g transform="translate(0,-14)">${fig(230, 300, c)}${fig(320, 280, c, `<path d="M${-34},${30} Q0,-14 34,30 L36,80 L-36,80 Z" fill="${c}"/>`)}${fig(420, 240, c)}${fig(500, 220, c, `<path d="M-26,22 Q0,-10 26,22 L28,64 L-28,64 Z" fill="${c}"/>`)}${fig(580, 210, c)}</g>
   <path d="M120,150 q14,-12 28,0 q14,-12 28,0" stroke="${c}" stroke-width="5" fill="none"/><path d="M640,120 q10,-9 20,0 q10,-9 20,0" stroke="${c}" stroke-width="4" fill="none"/>`);
}
function lifeArt() {
  const sky = uid('sk');
  return svgw('0 0 800 560', `<defs>${grad(sky, [[0, '#86d0f2'], [1, '#e2f5fc']])}</defs><rect width="800" height="560" fill="url(#${sky})"/>${sunG(640, 120, 60, false)}${cloudG(160, 120, .7)}
   <path d="M0,360 Q200,280 420,350 Q620,290 800,330 L800,560 L0,560 Z" fill="#8fcf6a"/><path d="M0,430 Q400,380 800,430 L800,560 L0,560 Z" fill="#6cb84f"/>
   <g transform="translate(300,120) scale(.72)">${personG({ ...LOOK.runner, aL: 40, aR: -40, mouth: 'grin', eyes: 'happy' })}</g>`);
}
function workArt() { return svgw('0 0 800 560', `<rect width="800" height="560" fill="#e9f6ef"/><rect y="420" width="800" height="140" fill="#cfe9dc"/><g transform="translate(250,40) scale(.92)">${microscopeArt().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g><g transform="translate(560,300) scale(.6)">${cellsArt('normal', 9).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>`); }
function bulbArt() {
  return svgw('0 0 260 360', `<g class="glow"><circle cx="130" cy="130" r="120" fill="#fff6a8" opacity=".5"/></g><path d="M130,20 Q220,20 224,112 Q226,170 180,210 Q168,222 168,250 L92,250 Q92,222 80,210 Q34,170 36,112 Q40,20 130,20 Z" fill="#ffe14d" ${SW}/>
   <path d="M108,250 L108,170 Q130,140 152,170 L152,250" fill="none" stroke="#e0a52a" stroke-width="6"/><rect x="88" y="250" width="84" height="22" rx="6" fill="#9aa8c0" ${SW3}/><rect x="92" y="272" width="76" height="22" rx="6" fill="#7d8aa3" ${SW3}/><path d="M104,294 L156,294 L144,318 L116,318 Z" fill="#5a6d8f" ${SW3}/><path d="M70,90 Q80,50 120,44" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity=".8"/>`, 'xMidYMid meet');
}
function brainIcon() {
  return svgw('0 0 300 260', `<path d="M150,30 Q110,0 76,24 Q30,20 28,70 Q-4,96 20,140 Q8,190 60,206 Q86,246 132,226 L150,220 L168,226 Q214,246 240,206 Q292,190 280,140 Q304,96 272,70 Q270,20 224,24 Q190,0 150,30 Z" fill="#f6a5c0" ${SW}/>
   <path d="M150,30 L150,220 M70,80 Q100,70 110,100 M60,150 Q90,130 120,150 M230,80 Q200,70 190,100 M240,150 Q210,130 180,150 M100,190 Q120,176 130,196 M200,190 Q180,176 170,196" fill="none" stroke="#c9668a" stroke-width="6" stroke-linecap="round"/>
   <ellipse cx="110" cy="120" rx="10" ry="13" fill="${OL}"/><ellipse cx="190" cy="120" rx="10" ry="13" fill="${OL}"/><circle cx="113" cy="115" r="3.5" fill="#fff"/><circle cx="193" cy="115" r="3.5" fill="#fff"/><path d="M128,150 Q150,168 172,150" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>`, 'xMidYMid meet');
}
function vialArt() {
  return svgw('0 0 200 360', `<rect x="62" y="20" width="76" height="40" rx="8" fill="#2a9d8f" ${SW}/><rect x="74" y="58" width="52" height="20" fill="#cfd8e3" ${SW3}/><path d="M60,78 L140,78 Q160,80 160,104 L160,310 Q160,338 132,338 L68,338 Q40,338 40,310 L40,104 Q40,80 60,78 Z" fill="rgba(235,248,255,.95)" ${SW}/>
   <path d="M44,180 L156,180 L156,310 Q156,334 132,334 L68,334 Q44,334 44,310 Z" fill="#f2a0c4"/><rect x="52" y="200" width="96" height="86" rx="10" fill="#fff" ${SW3}/><text x="100" y="236" font-family="Nunito" font-weight="900" font-size="20" text-anchor="middle" fill="${OL}">MADE</text><text x="100" y="262" font-family="Nunito" font-weight="900" font-size="20" text-anchor="middle" fill="${OL}">FOR ME</text><path d="M86,272 l14,8 14,-8" fill="none" stroke="#e63950" stroke-width="4"/>`, 'xMidYMid meet');
}
function keyArt() {
  return svgw('0 0 320 120', `<circle cx="60" cy="60" r="46" fill="#ffc83d" ${SW}/><circle cx="60" cy="60" r="18" fill="#e9632b" ${SW3}/><path d="M104,48 L300,48 L300,72 L280,72 L280,96 L258,96 L258,72 L236,72 L236,88 L216,88 L216,72 L104,72 Z" fill="#ffc83d" ${SW}/>`, 'xMidYMid meet');
}
function scaleArt() {
  return svgw('0 0 700 480', `<path d="M350,90 L350,420" stroke="#7a4a1e" stroke-width="18" stroke-linecap="round"/><path d="M250,440 Q350,400 450,440 Z" fill="#7a4a1e" ${SW}/><circle cx="350" cy="80" r="20" fill="#ffc83d" ${SW3}/>
   <g class="beam"><rect x="90" y="72" width="520" height="18" rx="9" fill="#ffc83d" ${SW3}/>
     <g class="panL" transform="translate(110,90)"><path d="M0,0 L-70,150 M0,0 L70,150" stroke="#8a8a8a" stroke-width="4"/><path d="M-100,150 L100,150 Q90,200 0,200 Q-90,200 -100,150 Z" fill="#ffc83d" ${SW3}/><g transform="translate(-52,62)"><path d="M52,0 L104,90 L0,90 Z" fill="#ffd33f" ${SW}/><text x="52" y="76" font-family="Nunito" font-weight="900" font-size="54" text-anchor="middle" fill="${OL}">!</text></g></g>
     <g class="panR" transform="translate(590,90)"><path d="M0,0 L-70,150 M0,0 L70,150" stroke="#8a8a8a" stroke-width="4"/><path d="M-100,150 L100,150 Q90,200 0,200 Q-90,200 -100,150 Z" fill="#ffc83d" ${SW3}/><g transform="translate(-48,58) scale(.96)">${heartG()}</g></g></g>`, 'xMidYMid meet');
}

// ---------- celebration ----------
function stageArt() {
  const bg = uid('sb');
  let beams = ''; for (const [x, a] of [[300, 18], [960, 0], [1620, -18]]) beams += `<path d="M${x},-40 L${x - 220 + a * 6},1080 L${x + 220 + a * 6},1080 Z" fill="#fff6c8" opacity=".14"/>`;
  return svgw('0 0 1920 1080', `<defs>${grad(bg, [[0, '#2b1446'], [1, '#5a2a6e']])}</defs><rect width="1920" height="1080" fill="url(#${bg})"/>${beams}<path d="M0,820 L1920,820 L1920,1080 L0,1080 Z" fill="#8a3a1e"/><path d="M0,820 L1920,820" stroke="#f2b632" stroke-width="10"/><ellipse cx="960" cy="900" rx="520" ry="70" fill="#fff6c8" opacity=".2"/>`);
}
function bikeArt() {
  const sky = uid('sk');
  return svgw('0 0 800 560', `<defs>${grad(sky, [[0, '#86d0f2'], [1, '#e2f5fc']])}</defs><rect width="800" height="560" fill="url(#${sky})"/><path d="M0,330 Q220,250 440,320 Q640,260 800,300 L800,560 L0,560 Z" fill="#8fcf6a"/><rect y="420" width="800" height="140" fill="#5b5f6b"/><path d="M0,470 L800,470" stroke="#fff" stroke-width="6" stroke-dasharray="40 30"/>
   <g class="bike" transform="translate(240,180)"><g fill="none" stroke="${OL}" stroke-width="12" stroke-linecap="round"><circle cx="70" cy="230" r="70"/><circle cx="330" cy="230" r="70"/></g><g fill="none" stroke="#9aa8c0" stroke-width="4"><circle cx="70" cy="230" r="56"/><circle cx="330" cy="230" r="56"/></g>
     <path d="M70,230 L160,120 L290,120 L330,230 M160,120 L190,230 L290,120 M190,230 L70,230" fill="none" stroke="#e63950" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/><path d="M150,104 L190,104" stroke="${OL}" stroke-width="12" stroke-linecap="round"/><path d="M290,120 L280,80 L310,74" fill="none" stroke="${OL}" stroke-width="10" stroke-linecap="round"/></g>`);
}
function shoeArt() {
  return svgw('0 0 800 560', `<rect width="800" height="560" fill="#ffe9a8"/><g transform="translate(140,140)"><path d="M20,240 Q0,170 60,150 L180,60 Q220,40 250,80 Q300,140 420,160 Q520,180 520,240 L520,262 Q260,290 20,262 Z" fill="#2a9d8f" ${SW}/><path d="M10,262 L530,262 L530,300 Q260,330 10,300 Z" fill="#fff" ${SW}/>
   <path d="M170,90 L210,140 M196,74 L236,124 M222,64 L262,114" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M320,170 Q380,200 460,196" stroke="#ffd33f" stroke-width="14" fill="none" stroke-linecap="round"/></g>
   <text x="600" y="150" font-family="Capra" font-size="104" fill="#e9632b" text-anchor="middle" stroke="${OL}" stroke-width="5" paint-order="stroke">250</text>`);
}
function crownHatArt() {
  return svgw('0 0 800 560', `<rect width="800" height="560" fill="#dff1fb"/><g transform="translate(150,170)"><path d="M0,140 L20,20 L90,90 L150,0 L210,90 L280,20 L300,140 Z" fill="#ffc83d" ${SW}/><rect x="0" y="140" width="300" height="50" rx="8" fill="#e0a52a" ${SW}/><circle cx="150" cy="165" r="14" fill="#e63950" ${SW3}/><circle cx="70" cy="165" r="10" fill="#2a62b8" ${SW3}/><circle cx="230" cy="165" r="10" fill="#2a9d8f" ${SW3}/></g>
   <g transform="translate(440,310) scale(.82)">${`<path d="M-10,92 Q150,40 310,92 Q314,110 290,108 Q150,82 10,108 Q-14,110 -10,92 Z" fill="#7a5230" ${SW}/><path d="M60,92 Q66,4 150,0 Q234,4 240,92 Q150,74 60,92 Z" fill="#8c6038" ${SW}/><path d="M62,80 Q150,62 238,80" stroke="#4a2f18" stroke-width="14" fill="none"/>`}</g>
   <path d="M400,170 l10,22 24,4 -18,16 4,24 -20,-12 -20,12 4,-24 -18,-16 24,-4 Z" fill="#fff" ${SW3}/>`);
}
function journalArt() {
  return svgw('0 0 420 560', `<rect x="10" y="10" width="400" height="540" rx="10" fill="#fff" ${SW}/><rect x="10" y="10" width="400" height="120" fill="#1f2a44"/><text x="210" y="70" font-family="OpenSans" font-weight="800" font-size="46" fill="#fff" text-anchor="middle">nature</text><text x="210" y="112" font-family="OpenSans" font-weight="600" font-size="30" fill="#ffd33f" text-anchor="middle" letter-spacing="4">MEDICINE</text>
   <g transform="translate(110,160) scale(.66)">${brainIcon().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
   <text x="210" y="400" font-family="Nunito" font-weight="900" font-size="30" fill="${OL}" text-anchor="middle">World-first brain</text><text x="210" y="438" font-family="Nunito" font-weight="900" font-size="30" fill="${OL}" text-anchor="middle">cancer treatment</text>
   ${[0, 1, 2].map(i => `<rect x="60" y="${470 + i * 22}" width="${i === 2 ? 200 : 300}" height="10" rx="5" fill="#ccc"/>`).join('')}`, 'xMidYMid meet');
}
function nightArt() {
  const sky = uid('sk'); seed(42); let st = '';
  for (let i = 0; i < 60; i++) st += `<circle class="star" cx="${rnd(0, 1920).toFixed(0)}" cy="${rnd(0, 700).toFixed(0)}" r="${rnd(1.5, 4.5).toFixed(1)}" fill="#fff"/>`;
  return svgw('0 0 1920 1080', `<defs>${grad(sky, [[0, '#0d1838'], [.7, '#2a2f6b'], [1, '#6a3c6e']])}</defs><rect width="1920" height="1080" fill="url(#${sky})"/>${st}<path transform="translate(230,-50)" d="M1560,170 A90,90 0 1 0 1640,300 A72,72 0 1 1 1560,170 Z" fill="#fff3c4"/>
   <path d="M0,900 Q480,840 960,890 Q1440,940 1920,880 L1920,1080 L0,1080 Z" fill="#1a1530"/>`);
}
function candleArt() {
  return svgw('0 0 200 420', `<g class="flame"><ellipse cx="100" cy="90" rx="70" ry="80" fill="#ffd36b" opacity=".25"/><path d="M100,30 Q132,84 116,116 Q100,136 84,116 Q68,84 100,30 Z" fill="#ffb21e"/><path d="M100,70 Q114,100 106,116 Q100,124 94,116 Q86,100 100,70 Z" fill="#fff3c4"/></g>
   <path d="M100,120 L100,140" stroke="${OL}" stroke-width="5"/><rect x="56" y="140" width="88" height="250" rx="12" fill="#fff8ec" ${SW}/><path d="M60,170 Q80,190 76,220" stroke="#f0e2c8" stroke-width="10" fill="none" stroke-linecap="round"/><ellipse cx="100" cy="398" rx="80" ry="16" fill="#c9a26a" ${SW3}/>`, 'xMidYMid meet');
}
function labArt() {
  return svgw('0 0 900 560', `<rect width="900" height="560" fill="#e9f6ef"/><rect y="380" width="900" height="180" fill="#cfe9dc"/><rect x="0" y="360" width="900" height="30" fill="#9aa8c0" ${SW3}/>
   <g transform="translate(470,60) scale(.6)">${microscopeArt().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
   <g transform="translate(110,250)"><path d="M18,0 L18,50 L-16,104 Q-20,114 -4,114 L76,114 Q92,114 88,104 L54,50 L54,0 Z" fill="#fff" ${SW3}/><path d="M-10,84 L82,84 L88,104 Q92,114 76,114 L-4,114 Q-20,114 -16,104 Z" fill="#7fd3c6"/></g>
   <g transform="translate(250,270)"><rect x="0" y="0" width="30" height="94" rx="12" fill="#fff" ${SW3}/><rect x="2" y="44" width="26" height="48" rx="10" fill="#f2a0c4"/><rect x="44" y="0" width="30" height="94" rx="12" fill="#fff" ${SW3}/><rect x="46" y="30" width="26" height="62" rx="10" fill="#ffd33f"/></g>
   <g transform="translate(700,190) scale(.5)">${brainIcon().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>`);
}
function cliffArt() {
  const sky = uid('sk');
  return svgw('0 0 1920 1080', `<defs>${grad(sky, [[0, '#7fcdf0'], [1, '#e2f5fc']])}</defs><rect width="1920" height="1080" fill="url(#${sky})"/>${cloudG(300, 200, 1.2)}${cloudG(1500, 160, 1)}${sunG(1680, 140, 70, false)}
   <path d="M-20,700 L700,700 Q740,700 730,760 L700,1100 L-20,1100 Z" fill="#c9884f" ${SW}/><path d="M-20,700 L700,700 Q740,700 732,730 L-20,730 Z" fill="#7cc46a" ${SW}/>
   <path d="M1940,700 L1220,700 Q1180,700 1190,760 L1220,1100 L1940,1100 Z" fill="#c9884f" ${SW}/><path d="M1940,700 L1220,700 Q1180,700 1188,730 L1940,730 Z" fill="#7cc46a" ${SW}/>
   <path d="M1600,700 L1600,560" stroke="#7a4a1e" stroke-width="10"/><path d="M1600,560 L1700,590 L1600,620 Z" fill="#e63950" ${SW3}/>`);
}
function letterArt() {
  return svgw('0 0 900 620', `<rect x="20" y="20" width="860" height="580" rx="10" fill="#fffaf0" ${SW}/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M70,${140 + i * 56} L830,${140 + i * 56}" stroke="#bfe0f5" stroke-width="3"/>`).join('')}<path d="M110,30 L110,590" stroke="#f2a0a0" stroke-width="3"/>`, 'none');
}
function badgeArt(kind) {
  const icon = {
    brave: `<path d="M150,60 L230,90 L226,170 Q216,226 150,252 Q84,226 74,170 L70,90 Z" fill="#e63950" ${SW}/><path d="M160,100 L120,170 L150,170 L136,220 L184,146 L154,146 L170,100 Z" fill="#ffd33f" ${SW3}/>`,
    curious: `<circle cx="134" cy="134" r="62" fill="#bfe8f8" ${SW}/><path d="M178,178 L236,236" stroke="#7a4a1e" stroke-width="26" stroke-linecap="round"/><path d="M178,178 L236,236" stroke="${OL}" stroke-width="5" stroke-linecap="round" opacity=".0"/><text x="134" y="158" font-family="Capra" font-size="80" text-anchor="middle" fill="${OL}">?</text>`,
    helping: `<g transform="translate(100,74) scale(1)">${heartG('#ff6f91')}</g><path d="M60,210 Q100,170 150,196 Q200,170 240,210 L240,236 L60,236 Z" fill="#f2c4a2" ${SW}/>`,
  }[kind];
  return svgw('0 0 300 300', `<circle cx="150" cy="150" r="140" fill="#fff" ${SW}/><circle cx="150" cy="150" r="122" fill="#ffe9a8"/>${icon}`, 'xMidYMid meet');
}
