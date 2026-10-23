// Cartoon characters (big-head "cut-out" style, like the reference film) and small props.
const OL = '#2b1a10';
let _uid = 0; const uid = p => `${p}${++_uid}`;

const LOOK = {
  richard: { skin: '#f2c4a2', hair: '#9a8877', hairStyle: 'side', shirt: '#a8d1f0', tie: '#22477a', coat: '#ffffff', pants: '#3a3f4b', shoes: '#2b2b2b' },
  suit: { skin: '#f2c4a2', hair: '#9a8877', hairStyle: 'side', shirt: '#ffffff', tie: '#c23b3b', coat: '#2d3a55', pants: '#2d3a55', shoes: '#1d1d1d' },
  kid: { skin: '#f4c9a6', hair: '#7a5232', hairStyle: 'kid', shirt: 'stripes', tie: null, coat: null, pants: '#2f6fb5', shorts: true, shoes: '#d8402f' },
  georgina: { skin: '#f3c9a8', hair: '#e2bd6e', hairStyle: 'long', shirt: '#d9465a', tie: null, coat: '#ffffff', pants: '#2d3550', shoes: '#2b2b2b', steth: true },
  gown: { skin: '#f2c4a2', hair: '#9a8877', hairStyle: 'side', shirt: 'gown', tie: null, coat: null, pants: '#9cc7e6', shoes: '#e8e8e8' },
  runner: { skin: '#f2c4a2', hair: '#9a8877', hairStyle: 'side', shirt: '#ffcf3f', tie: null, coat: null, pants: '#1f2a44', shorts: true, shoes: '#2a9d8f' },
};

const HAND = { L: [84, 352], R: [216, 352] };
const SHOULDER = { L: [96, 238], R: [204, 238] };

function personG(o = {}) {
  o = Object.assign({}, LOOK.richard, o);
  const sk = o.skin, sw = 'stroke="' + OL + '" stroke-width="4" stroke-linejoin="round"';
  const aL = o.aL ?? 10, aR = o.aR ?? -10;
  let defs = '', shirtFill = o.shirt;
  if (o.shirt === 'stripes') { const id = uid('st'); defs += `<pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#fff"/><rect width="24" height="12" fill="#e2483d"/></pattern>`; shirtFill = `url(#${id})`; }
  if (o.shirt === 'gown') { const id = uid('gw'); defs += `<pattern id="${id}" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#bfe0f5"/><circle cx="6" cy="6" r="2.6" fill="#5b9bd1"/><circle cx="17" cy="17" r="2.6" fill="#5b9bd1"/></pattern>`; shirtFill = `url(#${id})`; }
  const sleeve = o.coat || shirtFill;
  const hairBack = o.hairStyle === 'long' ? `<path d="M56,150 Q46,34 150,32 Q254,34 244,150 L252,272 Q205,288 150,274 Q95,288 48,272 Z" fill="${o.hair}" ${sw}/>` : '';
  const legs = o.shorts
    ? `<rect x="104" y="372" width="38" height="96" rx="14" fill="${sk}" ${sw}/><rect x="158" y="372" width="38" height="96" rx="14" fill="${sk}" ${sw}/><path d="M90,368 L210,368 L212,420 L154,420 L150,396 L146,420 L88,420 Z" fill="${o.pants}" ${sw}/>`
    : `<rect x="104" y="372" width="40" height="100" rx="12" fill="${o.pants}" ${sw}/><rect x="156" y="372" width="40" height="100" rx="12" fill="${o.pants}" ${sw}/>`;
  const shoes = `<ellipse cx="118" cy="476" rx="32" ry="15" fill="${o.shoes}" ${sw}/><ellipse cx="182" cy="476" rx="32" ry="15" fill="${o.shoes}" ${sw}/>`;
  const torso = `<path d="M92,252 Q92,214 130,210 L170,210 Q208,214 208,252 L212,${o.shorts ? 380 : 388} L88,${o.shorts ? 380 : 388} Z" fill="${shirtFill}" ${sw}/>`;
  const tie = o.tie ? `<path d="M138,212 L150,228 L162,212 Z" fill="#fff" ${sw}/><path d="M150,226 L142,238 L146,246 L140,304 L150,318 L160,304 L154,246 L158,238 Z" fill="${o.tie}" ${sw}/>` : '';
  const coat = o.coat ? `<path d="M90,252 Q90,214 128,210 L144,212 L136,300 L148,428 L84,428 Z" fill="${o.coat}" ${sw}/><path d="M210,252 Q210,214 172,210 L156,212 L164,300 L152,428 L216,428 Z" fill="${o.coat}" ${sw}/>` + (o.coat === '#ffffff' ? `<rect x="168" y="300" width="28" height="22" rx="4" fill="none" stroke="#c9c9c9" stroke-width="3"/><path d="M174,300 L174,290" stroke="#2a62b8" stroke-width="5" stroke-linecap="round"/>` : '') : '';
  const steth = o.steth ? `<path d="M126,214 Q114,282 150,300 Q186,282 174,214" fill="none" stroke="#3d3d3d" stroke-width="6"/><circle cx="150" cy="304" r="11" fill="#b8b8b8" stroke="#3d3d3d" stroke-width="4"/>` : '';
  const arm = (side, ang, prop) => {
    const [sx, sy] = SHOULDER[side], [hx, hy] = HAND[side];
    return `<g class="arm${side}" transform="rotate(${ang} ${sx} ${sy})"><path d="M${sx},${sy} L${hx},${hy - 8}" stroke="${OL}" stroke-width="36" stroke-linecap="round"/><path d="M${sx},${sy} L${hx},${hy - 8}" stroke="${sleeve}" stroke-width="27" stroke-linecap="round"/><g class="prop${side}" transform="rotate(${-ang} ${hx} ${hy})">${prop || ''}<circle cx="${hx}" cy="${hy}" r="16" fill="${sk}" ${sw}/></g></g>`;
  };
  const ex = o.eyes || 'open', mouth = o.mouth || 'smile', brows = o.brows || 'neutral';
  let eyes = '';
  if (ex === 'open') eyes = `<ellipse cx="120" cy="134" rx="9.5" ry="12.5" fill="${OL}"/><ellipse cx="180" cy="134" rx="9.5" ry="12.5" fill="${OL}"/><circle cx="123.5" cy="129.5" r="3.6" fill="#fff"/><circle cx="183.5" cy="129.5" r="3.6" fill="#fff"/>`;
  else if (ex === 'happy') eyes = `<path d="M109,138 Q120,124 131,138 M169,138 Q180,124 191,138" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>`;
  else if (ex === 'closed') eyes = `<path d="M109,134 Q120,142 131,134 M169,134 Q180,142 191,134" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>`;
  else if (ex === 'wide') eyes = `<circle cx="120" cy="134" r="14" fill="#fff" ${sw}/><circle cx="180" cy="134" r="14" fill="#fff" ${sw}/><circle cx="120" cy="135" r="6" fill="${OL}"/><circle cx="180" cy="135" r="6" fill="${OL}"/>`;
  const B = { neutral: 'M106,110 Q120,102 134,108 M166,108 Q180,102 194,110', up: 'M106,102 Q120,92 134,99 M166,99 Q180,92 194,102', worried: 'M106,113 Q122,108 134,101 M166,101 Q178,108 194,113', determined: 'M106,103 Q122,106 134,113 M166,113 Q178,106 194,103' };
  const M = {
    smile: `<path d="M124,170 Q150,194 176,170" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>`,
    grin: `<path d="M120,166 Q150,208 180,166 Z" fill="#7a1f1f" ${sw}/><path d="M124,168 L176,168 Q174,176 170,178 L130,178 Q126,176 124,168 Z" fill="#fff"/><path d="M136,190 Q150,182 164,190 Q150,198 136,190 Z" fill="#e8737a"/>`,
    o: `<ellipse cx="150" cy="180" rx="10" ry="13" fill="#7a1f1f" ${sw}/>`,
    sad: `<path d="M128,186 Q150,170 172,186" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>`,
    flat: `<path d="M132,180 L168,180" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>`,
  };
  const hairs = {
    side: `<path d="M70,132 Q60,56 122,44 Q162,34 202,48 Q240,64 232,132 Q228,108 216,96 Q204,86 184,82 Q160,78 140,84 Q118,80 98,92 Q80,106 70,132 Z" fill="${o.hair}" ${sw}/><path d="M118,60 Q150,52 186,62" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="5" stroke-linecap="round"/>`,
    kid: `<path d="M70,126 Q64,58 110,44 L116,24 L134,42 L150,20 L164,42 L184,26 L188,50 Q238,66 230,126 Q222,98 198,90 Q172,96 150,86 Q126,96 104,90 Q80,100 70,126 Z" fill="${o.hair}" ${sw}/>`,
    long: `<path d="M70,132 Q68,48 150,44 Q232,48 230,132 Q216,88 170,86 Q150,108 110,98 Q84,106 70,132 Z" fill="${o.hair}" ${sw}/>`,
    none: '',
  };
  const hat = o.hat === 'akubra' ? `<path d="M40,92 Q150,58 260,92 Q262,104 246,102 Q150,82 54,102 Q38,104 40,92 Z" fill="#7a5230" ${sw}/><path d="M86,92 Q90,34 150,30 Q210,34 214,92 Q150,80 86,92 Z" fill="#8c6038" ${sw}/><path d="M88,84 Q150,70 212,84" stroke="#4a2f18" stroke-width="10" fill="none"/>`
    : o.hat === 'detective' ? `<g transform="translate(0,-14)"><path d="M64,104 Q66,30 150,26 Q234,30 236,104 Q150,86 64,104 Z" fill="#b08a5a" ${sw}/><path d="M64,104 Q40,112 52,124 Q100,106 150,104 Q200,106 248,124 Q260,112 236,104 Q150,88 64,104 Z" fill="#9a7748" ${sw}/><path d="M100,40 L100,100 M150,28 L150,92 M200,40 L200,100" stroke="#8a6a40" stroke-width="3"/><path d="M146,26 Q150,14 158,22" fill="none" stroke="${OL}" stroke-width="4"/></g>`
    : o.hat === 'cap' ? `<path d="M78,100 Q80,40 150,38 Q220,40 222,100 Z" fill="#1f2a44" ${sw}/><path d="M60,64 L150,34 L240,64 L150,94 Z" fill="#1f2a44" ${sw}/><path d="M236,64 L240,120" stroke="#ffcf3f" stroke-width="6"/><circle cx="240" cy="124" r="8" fill="#ffcf3f"/>` : '';
  const glasses = o.glasses ? `<g fill="rgba(255,255,255,.18)" stroke="${OL}" stroke-width="4"><circle cx="120" cy="134" r="21"/><circle cx="180" cy="134" r="21"/><path d="M141,132 Q150,126 159,132" fill="none"/></g>` : '';
  const goggles = o.goggles ? `<g stroke="${OL}" stroke-width="4"><rect x="98" y="118" width="46" height="32" rx="14" fill="#5fd0e6"/><rect x="156" y="118" width="46" height="32" rx="14" fill="#5fd0e6"/><path d="M70,130 L98,132 M202,132 L230,130 M144,134 L156,134" fill="none"/></g>` : '';
  return `<defs>${defs}</defs>${hairBack}${o.noLegs ? '' : legs + shoes}${torso}${tie}${coat}${steth}${arm('L', aL, o.propL)}${arm('R', aR, o.propR)}
  <rect x="134" y="190" width="32" height="30" fill="${sk}" ${sw}/>
  <circle cx="70" cy="136" r="16" fill="${sk}" ${sw}/><circle cx="230" cy="136" r="16" fill="${sk}" ${sw}/>
  <circle cx="150" cy="128" r="80" fill="${sk}" ${sw}/>
  <circle cx="100" cy="162" r="12" fill="#f0857a" opacity=".45"/><circle cx="200" cy="162" r="12" fill="#f0857a" opacity=".45"/>
  ${eyes}${goggles}<path d="${B[brows]}" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>
  <path d="M146,146 Q154,156 144,159" fill="none" stroke="${OL}" stroke-width="3.5" stroke-linecap="round"/>
  ${M[mouth]}${hairs[o.hairStyle]}${glasses}${hat}`;
}
function person(o = {}) { return `<svg viewBox="0 0 300 520" width="100%" height="100%" style="overflow:visible">${personG(o)}</svg>`; }
// rotate an arm of a person already in the DOM
function setArm(el, side, ang) {
  const g = el.querySelector('.arm' + side); if (!g) return;
  const [sx, sy] = SHOULDER[side], [hx, hy] = HAND[side];
  g.setAttribute('transform', `rotate(${ang.toFixed(2)} ${sx} ${sy})`);
  g.querySelector('.prop' + side).setAttribute('transform', `rotate(${(-ang).toFixed(2)} ${hx} ${hy})`);
}

// ---- props held in hands (drawn relative to hand point) ----
const PROP = {
  magnifier: side => { const [x, y] = HAND[side]; return `<g transform="translate(${x},${y})"><path d="M0,0 L22,-46" stroke="#5a3a1a" stroke-width="12" stroke-linecap="round"/><circle cx="34" cy="-74" r="30" fill="rgba(190,232,255,.75)" stroke="#3d3d3d" stroke-width="8"/><path d="M22,-86 Q30,-96 42,-94" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g>`; },
  trophy: side => { const [x, y] = HAND[side]; return `<g transform="translate(${x - 40},${y - 110})">${trophyG(0.8)}</g>`; },
  heart: side => { const [x, y] = HAND[side]; return `<g transform="translate(${x - 34},${y - 70}) scale(.68)">${heartG('#e63950')}</g>`; },
  sunscreen: side => { const [x, y] = HAND[side]; return `<g transform="translate(${x - 18},${y - 78})"><rect x="0" y="16" width="36" height="66" rx="10" fill="#ffcf3f" stroke="${OL}" stroke-width="4"/><rect x="8" y="0" width="20" height="20" rx="4" fill="#2a9d8f" stroke="${OL}" stroke-width="4"/><text x="18" y="56" font-family="OpenSans" font-weight="800" font-size="13" text-anchor="middle" fill="${OL}">SPF</text></g>`; },
  slide: side => { const [x, y] = HAND[side]; return `<g transform="translate(${x - 50},${y - 40}) rotate(-12)"><rect width="100" height="34" rx="4" fill="rgba(220,240,255,.9)" stroke="${OL}" stroke-width="3"/><rect x="2" y="2" width="26" height="30" fill="#fff"/><ellipse cx="62" cy="17" rx="22" ry="11" fill="#d97aa6"/></g>`; },
  thumb: side => { const [x, y] = HAND[side]; return `<g transform="translate(${x},${y})"><rect x="-6" y="-46" width="13" height="34" rx="6" fill="#f2c4a2" stroke="${OL}" stroke-width="4"/></g>`; },
};

function heartG(c = '#e63950') { return `<path d="M50,90 C20,68 0,50 0,28 C0,10 14,0 28,0 C38,0 46,6 50,14 C54,6 62,0 72,0 C86,0 100,10 100,28 C100,50 80,68 50,90 Z" fill="${c}" stroke="${OL}" stroke-width="5"/><path d="M18,22 Q22,12 32,12" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`; }
function trophyG(s = 1) { return `<g transform="scale(${s})"><path d="M20,10 L80,10 L76,60 Q50,84 24,60 Z" fill="#ffc83d" stroke="${OL}" stroke-width="4"/><path d="M20,18 Q0,18 4,38 Q8,54 26,56 M80,18 Q100,18 96,38 Q92,54 74,56" fill="none" stroke="${OL}" stroke-width="5"/><rect x="42" y="72" width="16" height="22" fill="#e0a52a" stroke="${OL}" stroke-width="4"/><rect x="26" y="92" width="48" height="16" rx="3" fill="#7a4a1e" stroke="${OL}" stroke-width="4"/><path d="M38,22 L38,48" stroke="#fff6c8" stroke-width="6" stroke-linecap="round"/><path d="M50,26 l5,10 11,1 -8,7 3,11 -11,-6 -10,6 3,-11 -8,-7 11,-1 Z" fill="#fff3b0"/></g>`; }
