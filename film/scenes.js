// Scene choreography for "The Life of Richard Scolyer". All times come from timeline.js.
const ORANGE = '#EA6218', BROWN = '#3b1f0e';
const T0 = id => ITEMS[id].start, TV = id => ITEMS[id].vend;
const pill = (t, size = 44, bg = '#fff', fg = BROWN) => `<span class="label" style="font-size:${size}px;line-height:${size * 1.7}px;background:${bg};color:${fg}">${t}</span>`;
const chars = (t, cls = '') => [...t].map(c => c === ' ' ? '<span class="ch" style="width:.3em"> </span>' : `<span class="ch ${cls}">${c}</span>`).join('');
const sparkle = (c = '#fff') => svgw('0 0 100 100', `<path d="M50,0 L60,40 L100,50 L60,60 L50,100 L40,60 L0,50 L40,40 Z" fill="${c}"/>`, 'xMidYMid meet');
// letters bounce in one by one
function bounceChars(el, lt, at, step = 0.035, dur = 0.5) {
  el.querySelectorAll('.ch').forEach((c, i) => {
    const p = prog(lt, at + i * step, dur);
    const y = lerp(-140, 0, ease.bounce(p)), s = lerp(.3, 1, ease.back(p));
    c.style.transform = `translateY(${y.toFixed(1)}px) scale(${s.toFixed(3)})`; c.style.opacity = p > 0 ? 1 : 0;
  });
}
// reveal words of a quote in sync with narration
function wordsHTML(t) { return t.split(' ').map(w => `<span class="wd">${w}</span>`).join(' '); }
function revealWords(el, lt, t0, dur, text) {
  let pos = 0; const n = text.length;
  el.querySelectorAll('.wd').forEach(w => { const tt = t0 + dur * pos / n - 0.1; pos += w.textContent.length + 1; const p = prog(lt, tt, 0.25); w.style.opacity = (0.18 + 0.82 * p).toFixed(2); });
}
function wave(el, side, lt, base, amp = 25, speed = 7) { setArm(el, side, base + Math.sin(lt * speed) * amp); }

// ============ TITLE CARDS (like the chapter cards of the reference) ============
function titleCard(id, lines, look, extra) {
  const sc = new Scene(id, { tail: 0.3 });
  EVENTS.push({ t: sc.t0, type: 'whoosh' }); EVENTS.push({ t: sc.t0 + 0.15, type: 'chime' });
  const html = lines.map(([t, size, color]) => `<div style="font-family:Capra;font-size:${size}px;line-height:${size * 1.02}px;color:${color};text-shadow:0 7px 0 rgba(90,30,0,.22)">${chars(t)}</div>`).join('');
  const el = sc.text(`<div>${html}</div>`, { x: 800, y: 540, w: 1300, h: 600, in: 'none', out: 'zoom', outDur: 0.35, sfx: null });
  el.style.flexDirection = 'column'; el.style.whiteSpace = 'normal';
  const ch = sc.svg(person(look), { x: 1610, y: 600, w: 340, h: 590, in: 'up', at: 0.05, inDur: 0.55, out: 'down', outDur: 0.35, sfx: null, anim: lt => ({ y: -Math.abs(Math.sin(lt * 4.2)) * 18 }) });
  sc.on(lt => bounceChars(el, lt, 0.12));
  if (extra) extra(sc, ch);
  return sc;
}

// ============ INTRO: curtains + title ============
{
  const sc = new Scene('intro', { t0: 0, t1: TV('l_gday'), z: 20 });
  const gday = ITEMS.l_gday, tName = gday.start + gday.dur * (gday.text.indexOf('Richard.') / gday.text.length) - 0.1;
  const portrait = sc.card(portraitArt(), { x: 960, y: 560, w: 700, h: 790, in: 'none', kb: [1.0, 1.08, 0, -10], outAt: tName - 0.25, out: 'pop', outDur: 0.45 });
  const cl = sc.svg(curtain(), { x: 490, y: 540, w: 1000, h: 1080, in: 'none', outAt: tName - 0.3, out: 'left', origin: '0% 50%', sfx: null, cls: '' });
  const cr = sc.svg(curtain(), { x: 1430, y: 540, w: 1000, h: 1080, in: 'none', outAt: tName - 0.3, out: 'right', origin: '100% 50%', sfx: null });
  const val = sc.svg(valance(), { x: 960, y: 80, w: 1920, h: 170, in: 'none', outAt: tName - 0.3, out: 'up', sfx: null });
  cl.classList.add('noshadow'); cr.classList.add('noshadow');
  const t1 = sc.text(`<span class="os" style="font-size:96px;color:#fff;background:rgba(80,80,80,.82);padding:4px 34px;letter-spacing:2px">THE LIFE OF</span>`, { x: 480, y: 800, w: 900, h: 130, in: 'left', at: 1.5, inDur: .7, outAt: tName - 0.5, out: 'left' });
  const t2 = sc.text(`<span class="os" style="font-size:104px;color:#fff;background:${ORANGE};padding:4px 34px;letter-spacing:2px;box-shadow:0 10px 24px rgba(0,0,0,.3)">RICHARD SCOLYER</span>`, { x: 590, y: 930, w: 1120, h: 140, in: 'left', at: 1.75, inDur: .7, outAt: tName - 0.4, out: 'left' });
  t1.style.justifyContent = t2.style.justifyContent = 'flex-start';
  const nm = sc.text(`<span class="capra" style="font-size:260px">${chars('Richard')}</span>`, { x: 960, y: 520, w: 1400, h: 340, in: 'none', at: tName - 0.05, sfx: 'chime', out: 'up', outDur: .45 });
  EVENTS.push({ t: 0.5, type: 'curtain' });
  sc.on(lt => {
    const p = ease.inout(prog(lt, 0.5, 1.6));
    const sx = lerp(1, 0.3, p);
    cl.style.transform += ` scaleX(${sx})`; cr.style.transform += ` scaleX(${sx})`;
    bounceChars(nm, lt, tName - 0.05, 0.06, 0.55);
  });
}

// ============ CHILDHOOD ============
{
  const sc = new Scene('l_born');
  const map = sc.card(ausMapArt({ sea: true, pins: [['Launceston', 'Launceston', 36, -70]] }), { x: 960, y: 560, w: 1240, h: 860, kb: [1.0, 1.06, -40, -50], in: 'pop', out: 'left' });
  const yr = sc.text(`<div style="width:250px;height:250px;border-radius:50%;background:#ffcf3f;border:7px solid ${BROWN};display:flex;align-items:center;justify-content:center;font-family:Capra;font-size:96px;color:${BROWN};box-shadow:0 12px 24px rgba(70,20,0,.35)">1966</div>`, { x: 470, y: 300, w: 260, h: 260, at: sc.w('1966'), in: 'spin', out: 'pop' });
  const tasL = sc.text(pill('Tasmania', 50, '#2a9d8f', '#fff'), { x: 1290, y: 930, w: 400, h: 100, at: sc.w('Tasmania'), out: 'pop' });
  const pin = map.querySelector('#pin-Launceston'), pb = pin.querySelector('.pinb'), pl = pin.querySelector('.pinl'), tas = map.querySelector('.tas');
  const tL = sc.w('Launceston');
  pin.setAttribute('transform', pin.getAttribute('transform') + ' scale(1.25)');
  EVENTS.push({ t: sc.t0 + tL, type: 'drop' });
  sc.on(lt => {
    const p = prog(lt, tL, 0.6);
    pb.setAttribute('transform', `translate(0,${lerp(-500, 0, ease.bounce(p)).toFixed(1)})`); pb.style.opacity = p > 0 ? 1 : 0;
    pl.style.opacity = prog(lt, tL + 0.4, 0.3);
    const f = prog(lt, sc.w('Tasmania') - 0.2, 0.4);
    tas.setAttribute('fill', f > 0 ? `rgb(${lerp(255, 120, f) | 0},${lerp(211, 200, f) | 0},${lerp(107, 90, f) | 0})` : '#ffd36b');
  });
}
{
  const sc = new Scene('l_kid');
  const a = sc.card(footyArt(), { x: 400, y: 400, w: 680, h: 476, rot: -4, at: sc.w('footy'), in: 'left', out: 'left' });
  const b = sc.card(swimArt(), { x: 980, y: 660, w: 680, h: 476, rot: 3, at: sc.w('swimming'), in: 'up', out: 'down' });
  const c = sc.card(caravanArt(), { x: 1530, y: 380, w: 680, h: 476, rot: -2, at: sc.w('bike'), in: 'right', out: 'right' });
  sc.text(pill('Footy!', 46), { x: 400, y: 690, w: 300, h: 90, at: sc.w('footy') + .35, rot: -4, out: 'left' });
  sc.text(pill('Swimming', 46), { x: 980, y: 940, w: 360, h: 90, at: sc.w('swimming') + .35, rot: 3, out: 'down' });
  sc.text(pill('Caravan holidays', 46), { x: 1530, y: 670, w: 520, h: 90, at: sc.w('caravan') + .1, rot: -2, out: 'right' });
  const ball = a.querySelector('.ball'), veh = c.querySelector('.veh');
  sc.on(lt => {
    const p = (lt * 0.7) % 1;
    ball.setAttribute('transform', `translate(${lerp(300, 640, p)},${180 - Math.sin(p * Math.PI) * 120}) rotate(${p * 540})`);
    veh.setAttribute('transform', `translate(${(lt - sc.w('bike')) * 40 - 60},${Math.sin(lt * 18) * 2})`);
  });
}
{
  const sc = new Scene('l_ordin');
  const tg = sc.w('grew');
  const kid = sc.svg(person({ ...LOOK.kid, mouth: 'grin', aR: -150 }), { x: 760, y: 600, w: 330, h: 572, in: 'pop', outAt: tg, out: 'pop', outDur: 0.3, anim: lt => ({ y: -Math.abs(Math.sin(lt * 4)) * 16 }) });
  sc.text(pill('An ordinary kid', 50), { x: 760, y: 950, w: 520, h: 100, at: .4, outAt: tg, out: 'pop', outDur: .3 });
  const glb = sc.svg(globeArt(), { x: 1310, y: 520, w: 620, h: 620, at: sc.w('change'), in: 'pop', out: 'pop' });
  const pro = sc.svg(person({ mouth: 'grin', hat: 'detective', propR: PROP.magnifier('R'), aR: -60 }), { x: 760, y: 590, w: 380, h: 660, at: tg + .15, in: 'bigpop', inDur: .7, out: 'left', sfx: 'sparkle' });
  sc.text(pill('Cancer detective!', 54, BROWN, '#fff'), { x: 760, y: 965, w: 620, h: 110, at: sc.w('cancer'), out: 'left' });
  for (let i = 0; i < 6; i++) sc.svg(sparkle(i % 2 ? '#fff' : '#ffd33f'), { x: 760 + Math.cos(i) * 260, y: 520 + Math.sin(i * 1.7) * 260, w: 60, h: 60, at: tg + .1 + i * .05, in: 'pop', inDur: .4, outAt: tg + .9 + i * .05, out: 'pop', sfx: null });
  sc.on(lt => { wave(kid, 'R', lt, -150, 20); updateGlobe(glb, 100 + lt * 25, -15); });
}

// ============ WHAT IS A PATHOLOGIST? ============
titleCard('t_path', [['What is a', 110, BROWN], ['pathologist?', 200, '#fff']], { hat: 'detective', propR: PROP.magnifier('R'), aR: -55, mouth: 'smile', brows: 'up' });
{
  const sc = new Scene('l_study');
  const tp = sc.w('pathologist'), tb = sc.w('behind');
  sc.card(uniArt(), { x: 560, y: 470, w: 820, h: 574, rot: -3, in: 'left', outAt: tb, out: 'left' });
  sc.text(pill('University of Tasmania', 50, '#2a9d8f', '#fff'), { x: 560, y: 830, w: 700, h: 100, rot: -3, at: sc.w('University'), outAt: tb, out: 'left' });
  const def = `<div style="width:780px;background:#fff;border-radius:30px;padding:40px 46px;box-shadow:0 20px 40px rgba(70,20,0,.35);text-align:left;white-space:normal">
     <div style="font-family:Capra;font-size:96px;color:${ORANGE};line-height:1">pathologist</div>
     <div style="font-family:Nunito;font-weight:700;font-size:40px;color:#8a6a5a;margin:8px 0 18px">path · OL · o · jist</div>
     <div style="font-family:Nunito;font-weight:800;font-size:46px;color:${BROWN};line-height:1.25">A doctor who studies tiny pieces of the body to find out what disease someone has.</div></div>`;
  sc.text(def, { x: 1350, y: 470, w: 840, h: 520, rot: 2, at: tp, in: 'right', out: 'right' });
  const det = sc.svg(person({ hat: 'detective', propR: PROP.magnifier('R'), aR: -70, mouth: 'grin', eyes: 'open', brows: 'up' }), { x: 560, y: 620, w: 340, h: 590, at: tb + .2, in: 'up', out: 'down', anim: lt => ({ x: Math.sin(lt * 1.6) * 30 }) });
  sc.text(pill('Behind the scenes… like a detective', 46, BROWN, '#fff'), { x: 960, y: 980, w: 900, h: 100, at: sc.w('detective'), out: 'down' });
  sc.on(lt => wave(det, 'R', lt, -70, 12, 3));
}
{
  const sc = new Scene('l_sample');
  const c = sc.card(labTripArt(), { x: 960, y: 540, w: 1400, h: 809, in: 'pop', out: 'up', kb: [1, 1.04, 0, 0] });
  sc.text(pill('Sample', 46, '#e63950', '#fff'), { x: 960, y: 210, w: 300, h: 90, at: sc.w('sample'), out: 'up' });
  const jar = c.querySelector('.jar');
  sc.on(lt => {
    const p = ease.inout(prog(lt, sc.w('sample') - .2, 2.2));
    const x = lerp(280, 620, p), y = 250 - Math.sin(p * Math.PI) * 170 + 40 * (1 - Math.sin(p * Math.PI)) * 0;
    jar.setAttribute('transform', `translate(${x},${y - 30}) rotate(${Math.sin(p * Math.PI * 2) * 12}) scale(1.6)`);
  });
}
{
  const sc = new Scene('l_micro');
  sc.svg(microscopeArt(), { x: 560, y: 560, w: 560, h: 728, in: 'left', out: 'left' });
  const v = sc.card(cellsArt('normal', 2), { x: 1330, y: 520, w: 680, h: 680, radius: 340, at: sc.w('microscope'), in: 'zoom', out: 'right', kb: [1.0, 1.25, 0, 0] });
  v.style.background = 'transparent';
  sc.text(pill('Under the microscope', 48), { x: 1330, y: 930, w: 620, h: 100, at: sc.w('microscope') + .4, out: 'right' });
}
{
  const sc = new Scene('l_harm');
  const tc = sc.w('cancer'), tr = sc.w('right');
  const a = sc.card(cellsArt('normal', 5), { x: 540, y: 470, w: 560, h: 560, radius: 280, in: 'pop', out: 'left', kb: [1, 1.12, 0, 0] });
  const b = sc.card(cellsArt('cancer', 5), { x: 1380, y: 470, w: 560, h: 560, radius: 280, at: tc, in: 'pop', out: 'right', kb: [1, 1.12, 0, 0] });
  a.style.background = b.style.background = 'transparent';
  sc.text(pill('Harmless?', 56, '#2a9d8f', '#fff'), { x: 540, y: 820, w: 380, h: 110, at: .3, out: 'left' });
  sc.text(pill('Cancer?', 56, '#7b4fb8', '#fff'), { x: 1380, y: 820, w: 340, h: 110, at: tc + .3, out: 'right' });
  sc.text(`<span class="capra" style="font-size:150px">VS</span>`, { x: 960, y: 470, w: 300, h: 200, at: tc - .1, in: 'bigpop', out: 'pop' });
  sc.text(pill('✔ The right answer = the right treatment', 50, BROWN, '#fff'), { x: 960, y: 985, w: 1100, h: 110, at: tr, in: 'up', out: 'down' });
}

// ============ AUSTRALIA'S CANCER ============
titleCard('t_mel', [["Australia's", 190, '#fff'], ['cancer', 130, BROWN]], { hat: 'akubra', propR: PROP.sunscreen('R'), aR: -40, mouth: 'grin' });
{
  const sc = new Scene('l_rpa');
  const tc = sc.w('Canberra'), ts = sc.w('Sydney'), tm = sc.w('melanoma');
  const m = sc.card(ausMapArt({ sea: true, vb: '360 300 700 640', pins: [['Canberra', 'Canberra', -250, -60], ['Sydney', 'Sydney', -150, 70]] }), { x: 600, y: 520, w: 900, h: 820, rot: -2, in: 'left', outAt: tm - .2, out: 'left', kb: [1, 1.05, 0, 0] });
  sc.card(sydneyArt(), { x: 1400, y: 470, w: 820, h: 574, rot: 3, at: ts, in: 'right', outAt: tm - .2, out: 'right' });
  sc.text(pill('Sydney', 50), { x: 1400, y: 800, w: 280, h: 100, rot: 3, at: ts + .3, outAt: tm - .2, out: 'right' });
  const pins = [[m.querySelector('#pin-Canberra'), tc], [m.querySelector('#pin-Sydney'), ts]];
  pins.forEach(([p, t]) => EVENTS.push({ t: sc.t0 + t, type: 'drop' }));
  sc.on(lt => pins.forEach(([p, t]) => {
    const pp = prog(lt, t, .6); p.querySelector('.pinb').setAttribute('transform', `translate(0,${lerp(-400, 0, ease.bounce(pp)).toFixed(1)})`);
    p.querySelector('.pinb').style.opacity = pp > 0 ? 1 : 0; p.querySelector('.pinl').style.opacity = prog(lt, t + .35, .3);
  }));
}
{ // the word MELANOMA carries from the end of l_rpa through l_skin
  const r = ITEMS.l_rpa, t0 = r.start + r.dur * (r.text.indexOf('melanoma') / r.text.length) - 0.15;
  const sc = new Scene('melword', { t0, t1: TV('l_skin') });
  const el = sc.text(`<span class="capra" style="font-size:210px">${chars('MELANOMA')}</span>`, { x: 960, y: 540, w: 1600, h: 300, in: 'none', out: 'up', sfx: 'chime', anim: lt => { const p = ease.inout(prog(lt, T0('l_skin') - t0 + .3, .7)); return { y: lerp(0, -400, p), s: lerp(1, .62, p) }; } });
  sc.on(lt => bounceChars(el, lt, 0, .04, .45));
}
{
  const sc = new Scene('l_skin');
  const tsk = sc.w('skin'), ta = sc.w("Australia's"), tsu = sc.w('sunny'), th = sc.w('highest');
  const mole = sc.card(moleArt(), { x: 470, y: 600, w: 520, h: 520, radius: 260, at: tsk, in: 'pop', out: 'left', kb: [1, 1.1, 0, 0] });
  mole.style.background = 'transparent';
  sc.text(pill('Skin cancer', 52, '#7b4fb8', '#fff'), { x: 470, y: 920, w: 400, h: 100, at: tsk + .3, out: 'left' });
  sc.svg(ausMapArt({ land: '#ffd36b' }), { x: 1340, y: 600, w: 640, h: 590, at: ta, in: 'pop', outAt: tsu - .1, out: 'pop', outDur: .3 });
  sc.text(pill("Australia's national cancer", 48, BROWN, '#fff'), { x: 1340, y: 930, w: 720, h: 100, at: ta + .4, outAt: tsu - .1, out: 'pop', outDur: .3 });
  const beach = sc.card(beachArt(), { x: 1340, y: 600, w: 820, h: 574, rot: 2, at: tsu + .1, in: 'right', out: 'right' });
  sc.text(pill('One of the highest rates in the world!', 46, '#ffcf3f', BROWN), { x: 1240, y: 960, w: 1000, h: 100, at: th, in: 'up', out: 'down' });
  const sun = beach.querySelector('.sun .rays');
  sc.on(lt => sun.setAttribute('transform', `rotate(${lt * 30})`));
}
{
  const sc = new Scene('l_best');
  const g = sc.svg(globeArt(), { x: 960, y: 590, w: 760, h: 760, in: 'pop', out: 'pop' });
  sc.text(pill('One of the best on the planet', 56, BROWN, '#fff'), { x: 960, y: 140, w: 960, h: 110, at: sc.w('best'), in: 'down', out: 'up' });
  const star = sc.svg(sparkle('#ffd33f'), { x: 960, y: 590, w: 130, h: 130, at: 1.6, in: 'spin', out: 'pop', sfx: 'sparkle' });
  sc.on(lt => {
    const lon = lerp(20, 140, ease.out(prog(lt, 0, 2.2))), lat = lerp(10, -22, ease.out(prog(lt, 0, 2.2)));
    const proj = updateGlobe(g, lon, lat); const [x, y] = proj(151.2, -33.9);
    star.style.left = (960 + x * 760 / 520 - 65) + 'px'; star.style.top = (590 + y * 760 / 520 - 65) + 'px';
  });
}
{
  const sc = new Scene('l_cases');
  const cnt = sc.text(`<div><div class="capra" style="font-size:190px;line-height:1"><span class="num">0</span>+</div><div class="nun" style="font-size:52px;color:#fff">tricky cases every year</div></div>`, { x: 960, y: 240, w: 1200, h: 330, in: 'pop', out: 'up' });
  const rich = sc.svg(person({ propR: PROP.magnifier('R'), aR: -60, mouth: 'smile', brows: 'up' }), { x: 960, y: 760, w: 300, h: 520, at: .2, in: 'up', out: 'down' });
  seed(77);
  for (let i = 0; i < 14; i++) {
    const side = i % 2 ? 1 : -1, sx = side * 1100, sy = rnd(-300, 300), at = .3 + i * .22, tx = 960 + side * rnd(180, 420), ty = 700 + rnd(-120, 220), r0 = rnd(-30, 30);
    sc.svg(slideIcon(), { x: tx, y: ty, w: 230, h: 94, rot: r0, at, in: 'none', out: 'pop', sfx: i % 3 ? null : 'swish', anim: lt => { const p = ease.out(prog(lt, at, .6)); return { x: (1 - p) * sx, y: (1 - p) * sy, r: (1 - p) * 200 }; } });
  }
  const tq = sc.w('Richard');
  [[420, 330, -4], [1500, 330, 4], [1500, 560, -3]].forEach(([x, y, r], i) => sc.text(`<div style="background:#fff;border-radius:40px;padding:20px 36px;font-family:Nunito;font-weight:900;font-size:44px;color:${BROWN};box-shadow:0 10px 22px rgba(70,20,0,.3)">Richard, what do you think?</div>`, { x: x === 420 ? 440 : x, y: y + (i === 0 ? 220 : 0), w: 680, h: 120, rot: r, at: tq + i * .25, out: 'pop' }));
  const num = cnt.querySelector('.num');
  sc.on(lt => { num.textContent = Math.round(lerp(0, 2000, ease.out(prog(lt, .2, 3.2)))).toLocaleString('en-AU'); wave(rich, 'R', lt, -60, 15, 4); });
}
{
  const sc = new Scene('l_papers');
  for (let i = 0; i < 9; i++) sc.svg(paperArt(), { x: 470 + (i % 3) * 22 - 20, y: 640 - i * 26, w: 300, h: 380, rot: (i % 2 ? 4 : -5) + i, at: .15 + i * .2, in: 'drop', inDur: .5, out: 'left', sfx: i % 3 ? null : 'drop' });
  sc.text(pill('Hundreds of papers!', 52, BROWN, '#fff'), { x: 500, y: 960, w: 620, h: 100, at: sc.w('hundreds'), out: 'left' });
  sc.svg(bookArt(), { x: 1360, y: 520, w: 520, h: 660, rot: 4, at: sc.w('World'), in: 'swing', inDur: 1, out: 'right', origin: '50% 0%' });
  sc.text(pill('Guide books on skin cancer', 46), { x: 1360, y: 930, w: 700, h: 100, at: sc.w('guide'), out: 'right' });
}

// ============ A DREAM TEAM ============
titleCard('t_team', [['A dream', 120, BROWN], ['team', 230, '#fff']], { mouth: 'grin', aR: -150, aL: 30, eyes: 'happy' }, (sc, ch) => {
  sc.svg(person({ ...LOOK.georgina, mouth: 'grin', aL: 150, eyes: 'happy' }), { x: 1340, y: 620, w: 320, h: 555, in: 'up', at: .15, out: 'down', outDur: .35, sfx: null, anim: lt => ({ y: -Math.abs(Math.sin(lt * 4.2 + 1)) * 18 }) });
  ch.style.left = (1680 - 170) + 'px';
});
{
  const sc = new Scene('l_met');
  sc.card(instituteArt(), { x: 960, y: 430, w: 1200, h: 747, in: 'pop', out: 'up' });
  sc.text(`<div style="width:220px;height:220px;border-radius:50%;background:#ffcf3f;border:7px solid ${BROWN};display:flex;align-items:center;justify-content:center;font-family:Capra;font-size:84px;color:${BROWN}">2009</div>`, { x: 330, y: 220, w: 230, h: 230, at: sc.w('2009'), in: 'spin', out: 'pop' });
  const r = sc.svg(person({ mouth: 'grin', aR: -120 }), { x: 520, y: 760, w: 280, h: 485, at: .3, in: 'left', out: 'left' });
  const g = sc.svg(person({ ...LOOK.georgina, mouth: 'grin', aL: 120 }), { x: 1400, y: 760, w: 280, h: 485, at: sc.w('Georgina'), in: 'right', out: 'right' });
  sc.text(pill('Richard', 44), { x: 520, y: 1020, w: 260, h: 90, at: .6, out: 'left' });
  sc.text(pill('Georgina Long', 44), { x: 1400, y: 1020, w: 400, h: 90, at: sc.w('Georgina') + .3, out: 'right' });
  sc.on(lt => { wave(r, 'R', lt, -120, 25); wave(g, 'L', lt, 120, 25); });
}
{
  const sc = new Scene('l_detect');
  const tg = sc.w('Georgina'), tt = sc.w('Together');
  const det = svgw('0 0 800 600', `<rect width="800" height="600" fill="#e9f6ef"/><rect y="440" width="800" height="160" fill="#cfe9dc"/><g transform="translate(430,70) scale(.95)">${microscopeArt().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g><g transform="translate(90,90) scale(.95)">${personG({ hat: 'detective', propR: PROP.slide('R'), aR: -50, mouth: 'smile', brows: 'up' })}</g>`);
  const doc = svgw('0 0 800 600', `<rect width="800" height="600" fill="#dff1fb"/><rect y="440" width="800" height="160" fill="#bfe0f5"/><rect x="450" y="300" width="300" height="80" rx="16" fill="#fff" ${SW3}/><rect x="450" y="380" width="20" height="90" fill="#9aa8c0"/><rect x="730" y="380" width="20" height="90" fill="#9aa8c0"/><rect x="470" y="270" width="90" height="40" rx="14" fill="#fff" ${SW3}/><g transform="translate(470,40) scale(.6)">${heartG('#ff6f91')}</g><g transform="translate(110,90) scale(.95)">${personG({ ...LOOK.georgina, mouth: 'grin', aR: -40 })}</g>`);
  sc.card(det, { x: 520, y: 460, w: 800, h: 600, rot: -3, in: 'left', out: 'left' });
  sc.text(pill('THE DETECTIVE', 52, BROWN, '#fff'), { x: 520, y: 800, w: 480, h: 104, rot: -3, at: .5, out: 'left' });
  sc.card(doc, { x: 1400, y: 460, w: 800, h: 600, rot: 3, at: tg, in: 'right', out: 'right' });
  sc.text(pill('THE DOCTOR', 52, BROWN, '#fff'), { x: 1400, y: 800, w: 400, h: 104, rot: 3, at: tg + .4, out: 'right' });
  sc.text(`<div style="font-family:Capra;font-size:120px;color:#fff;background:#e63950;border:8px solid #fff;border-radius:30px;padding:0 50px;box-shadow:0 16px 30px rgba(70,20,0,.4)">★ DREAM TEAM ★</div>`, { x: 960, y: 940, w: 1200, h: 200, at: tt, in: 'bigpop', inDur: .7, out: 'down', sfx: 'chime' });
}
{
  const sc = new Scene('l_codir');
  const td = sc.w('co-medical'), tb = sc.w('biggest');
  sc.card(instituteArt(), { x: 960, y: 470, w: 1240, h: 772, in: 'pop', out: 'left' });
  sc.text(`<div style="width:220px;height:220px;border-radius:50%;background:#ffcf3f;border:7px solid ${BROWN};display:flex;align-items:center;justify-content:center;font-family:Capra;font-size:84px;color:${BROWN}">2017</div>`, { x: 330, y: 200, w: 230, h: 230, at: sc.w('2017'), in: 'spin', out: 'pop' });
  sc.svg(person({ mouth: 'grin', aR: -30 }), { x: 560, y: 790, w: 260, h: 450, at: td, in: 'up', out: 'down' });
  sc.svg(person({ ...LOOK.georgina, mouth: 'grin', aL: 30 }), { x: 1360, y: 790, w: 260, h: 450, at: td + .15, in: 'up', out: 'down' });
  sc.text(pill('Co-Medical Directors', 54, BROWN, '#fff'), { x: 960, y: 960, w: 640, h: 110, at: td + .4, out: 'down' });
  sc.text(`<div style="background:#ffcf3f;border:6px solid ${BROWN};border-radius:24px;padding:14px 30px;font-family:Nunito;font-weight:900;font-size:46px;color:${BROWN};line-height:1.15;white-space:normal;width:420px;box-shadow:0 12px 24px rgba(70,20,0,.35)">🌏 World's biggest melanoma centre</div>`, { x: 1560, y: 200, w: 500, h: 220, rot: 6, at: tb, in: 'stamp', out: 'pop' });
}
{
  const sc = new Scene('l_immuno');
  sc.svg(ivArt(), { x: 600, y: 560, w: 470, h: 730, in: 'swing', inDur: 1, origin: '50% 0%', out: 'left' });
  const w = sc.text(`<div class="capra" style="font-size:150px;line-height:1.05;text-align:left">${chars('IMMUNO-')}<br>${chars('THERAPY')}</div>`, { x: 1300, y: 520, w: 900, h: 400, at: sc.w('called'), in: 'none', out: 'right', sfx: 'sparkle' });
  for (let i = 0; i < 5; i++) sc.svg(sparkle(i % 2 ? '#fff' : '#ffd33f'), { x: 940 + i * 180, y: 300 + (i % 2) * 460, w: 70, h: 70, at: sc.w('called') + .3 + i * .1, in: 'spin', out: 'pop', sfx: null, float: 10 });
  sc.on(lt => bounceChars(w, lt, sc.w('called'), .03, .45));
}
{
  const sc = new Scene('l_army');
  const tw = sc.w('wakes'), ti = sc.w('immune'), tf = sc.w('find'), tfi = sc.w('fight');
  const bg = svgw('0 0 1500 860', `<rect width="1500" height="860" fill="#f6c6cf"/><g fill="#eaa3b2" opacity=".7">${[...Array(14)].map((_, i) => `<ellipse cx="${(i * 197) % 1500}" cy="${(i * 311) % 860}" rx="${60 + (i % 3) * 20}" ry="${30 + (i % 2) * 14}"/>`).join('')}</g><path d="M0,120 Q750,40 1500,140 M0,760 Q750,840 1500,730" stroke="#e48aa0" stroke-width="30" fill="none" opacity=".6"/>`);
  sc.card(bg, { x: 960, y: 540, w: 1600, h: 900, in: 'pop', out: 'up', kb: [1, 1.04, 0, 0] });
  const cancer = sc.svg(cancerCellArt('mean'), { x: 1450, y: 520, w: 300, h: 300, at: .2, in: 'pop', out: 'pop', anim: lt => { const sh = lt > tfi ? Math.sin(lt * 60) * 8 : 0; const d = prog(lt, tfi + .6, .5); return { x: sh, s: 1 - d * .999, r: d * 90 }; } });
  const cells = [];
  [[380, 330], [300, 600], [560, 470]].forEach(([x, y], i) => {
    const sleep = sc.svg(tcellArt('sleep'), { x, y, w: 210, h: 210, at: .3 + i * .12, in: 'pop', outAt: tw + .1, out: 'cut', sfx: i ? null : 'pop', float: 6 });
    const awake = sc.svg(tcellArt('awake'), { x, y, w: 210, h: 210, at: tw + .1, in: 'none', out: 'pop', sfx: null, anim: lt => { const p = ease.inout(prog(lt, tf + i * .1, 1.2)); return { x: p * (1450 - x - 170 + i * 30), y: p * (520 - y + (i - 1) * 120) + Math.sin(lt * 12 + i) * 6 }; } });
    cells.push(sleep);
  });
  const z = sc.text(`<span class="nun" style="font-size:64px;color:#fff;text-shadow:0 4px 0 rgba(0,0,0,.2)">Zzz…</span>`, { x: 480, y: 220, w: 260, h: 100, at: .6, outAt: tw, out: 'pop', float: 12 });
  sc.text(pill('Your immune system', 52, '#2a62b8', '#fff'), { x: 520, y: 900, w: 620, h: 104, at: ti, out: 'down' });
  sc.text(pill('Cancer', 48, '#7b4fb8', '#fff'), { x: 1450, y: 730, w: 260, h: 96, at: .6, outAt: tfi + .6, out: 'pop' });
  sc.text(`<span class="capra" style="font-size:160px">POW!</span>`, { x: 1420, y: 360, w: 600, h: 220, rot: -8, at: tfi + .7, in: 'bigpop', out: 'pop', sfx: 'pow' });
}
{
  const sc = new Scene('l_stats');
  const t5 = sc.w('less'), t55 = sc.w('fifty');
  let icons = ''; for (let i = 0; i < 100; i++) icons += `<g class="ic" transform="translate(${(i % 10) * 60},${Math.floor(i / 10) * 64})">${personIcon('#e8d3bf')}</g>`;
  const card = sc.card(svgw('0 0 1500 860', `<rect width="1500" height="860" fill="#fff8ec"/><g transform="translate(820,120)">${icons}</g>`), { x: 960, y: 560, w: 1500, h: 860, in: 'pop', out: 'down', kb: null });
  const hdr = sc.text(`<span class="nun" style="font-size:52px;color:${BROWN}">Advanced melanoma: surviving 5 years</span>`, { x: 960, y: 205, w: 1400, h: 90, at: .3, out: 'down', sfx: null });
  const big = sc.text(`<div style="text-align:center"><div style="font-family:Capra;font-size:230px;line-height:1;color:${ORANGE}"><span class="n">&lt;5</span></div><div class="nun" style="font-size:60px;color:${BROWN}">in 100 people</div><div class="lab nun" style="font-size:44px;color:#fff;background:#8a6a5a;border-radius:999px;padding:6px 26px;margin-top:20px;display:inline-block">BEFORE</div></div>`, { x: 560, y: 600, w: 600, h: 520, at: t5 - .1, in: 'pop', out: 'down' });
  sc.svg(person({ mouth: 'grin', eyes: 'happy', aR: -150, aL: 150 }), { x: 430, y: 640, w: 260, h: 450, at: .4, outAt: t5 - .3, out: 'pop', outDur: .3, anim: lt => ({ y: -Math.abs(Math.sin(lt * 5)) * 22 }) });
  sc.svg(person({ ...LOOK.georgina, mouth: 'grin', eyes: 'happy', aR: -150, aL: 150 }), { x: 700, y: 640, w: 260, h: 450, at: .55, outAt: t5 - .3, out: 'pop', outDur: .3, anim: lt => ({ y: -Math.abs(Math.sin(lt * 5 + 1)) * 22 }) });
  sc.text(pill('Incredible results!', 50, BROWN, '#fff'), { x: 565, y: 950, w: 560, h: 100, at: .5, outAt: t5 - .3, out: 'pop', outDur: .3 });
  const ic = card.querySelectorAll('.ic'), n = big.querySelector('.n'), lab = big.querySelector('.lab');
  EVENTS.push({ t: sc.t0 + t55, type: 'chime' });
  sc.on(lt => {
    const k = lt < t55 - .25 ? (lt >= t5 ? 4 : 0) : Math.round(lerp(4, 55, ease.out(prog(lt, t55 - .25, 1.3))));
    ic.forEach((g, i) => { const on = i < k; g.querySelectorAll('circle,path').forEach(e => e.setAttribute('fill', on ? (lt < t55 - .25 ? '#8a6a5a' : ORANGE) : '#e8d3bf')); });
    if (lt >= t55 - .25) { n.textContent = Math.max(5, k); lab.textContent = 'NOW'; lab.style.background = '#2a9d8f'; } else { n.innerHTML = '&lt;5'; }
  });
}

// ============ A SHOCKING TWIST ============
bgKey(0, 0); bgKey(T0('t_twist') - 0.2, 0); bgKey(T0('t_twist') + 1.0, 0.42); bgKey(TV('l_quote1') - 0.2, 0.42); bgKey(T0('t_zero') + 1.4, 0);
titleCard('t_twist', [['A shocking', 120, '#ffd9c2'], ['twist', 240, '#fff']], { mouth: 'o', eyes: 'wide', brows: 'worried', aL: 160, aR: -160 });
{
  const sc = new Scene('l_2023');
  sc.svg(calendarArt(2023), { x: 700, y: 560, w: 520, h: 572, rot: -5, in: 'drop', out: 'left' });
  const st = sc.svg(stormArt(), { x: 1300, y: 420, w: 760, h: 456, at: sc.w('shocking') - .3, in: 'right', inDur: .8, out: 'right', sfx: 'thunder' });
  const bolt = st.querySelector('.bolt');
  sc.on(lt => { const f = lt > sc.w('shocking') + .3 ? ((lt * 7) % 1 < .5 ? 1 : .25) : 0; bolt.style.opacity = f; });
}
{
  const sc = new Scene('l_seiz');
  const tt = sc.w('tumour');
  const m = sc.card(mriArt(true), { x: 960, y: 530, w: 720, h: 748, in: 'pop', out: 'pop', kb: [1, 1.06, 0, 0] });
  sc.text(pill('Brain scan', 48), { x: 960, y: 960, w: 340, h: 96, at: .4, out: 'pop' });
  const ring = sc.svg(svgw('0 0 200 200', `<circle cx="100" cy="100" r="80" fill="none" stroke="#ff3b3b" stroke-width="12" stroke-dasharray="503" stroke-dashoffset="503" class="ring" stroke-linecap="round"/>`, 'xMidYMid meet'), { x: 960 - 720 / 2 + 170 * 720 / 520, y: 530 - 748 / 2 + 230 * 748 / 540, w: 200, h: 200, at: tt, in: 'none', out: 'pop', sfx: 'ding' });
  sc.text(pill('Tumour', 50, '#ff3b3b', '#fff'), { x: 520, y: 300, w: 300, h: 100, at: tt + .3, out: 'pop' });
  const rr = ring.querySelector('.ring');
  sc.on(lt => rr.setAttribute('stroke-dashoffset', (503 * (1 - ease.out(prog(lt, tt, .7)))).toFixed(1)));
}
{
  const sc = new Scene('l_gbm');
  const w = sc.text(`<span class="capra" style="font-size:150px">${chars('GLIOBLASTOMA')}</span>`, { x: 960, y: 230, w: 1700, h: 220, in: 'none', out: 'up', sfx: 'chime' });
  sc.text(pill('One of the most aggressive brain cancers', 46, BROWN, '#fff'), { x: 960, y: 400, w: 1100, h: 100, at: sc.w('aggressive') - .3, out: 'up' });
  const hg = sc.svg(hourglassArt(), { x: 740, y: 720, w: 330, h: 484, at: sc.w('Most'), in: 'pop', out: 'down' });
  sc.text(pill('about 1 year', 60, '#fff', BROWN), { x: 1200, y: 720, w: 460, h: 120, at: sc.w('about'), in: 'pop', out: 'down' });
  const top = hg.querySelector('.sandTop'), bot = hg.querySelector('.sandBot');
  sc.on(lt => {
    bounceChars(w, lt, 0, .035, .45);
    const p = prog(lt, sc.w('Most'), 4);
    top.setAttribute('transform', `translate(150,206) scale(${(1 - p * .8).toFixed(3)}) translate(-150,-206)`);
    bot.setAttribute('transform', `translate(150,380) scale(${(.3 + p * .7).toFixed(3)}) translate(-150,-380)`);
  });
}
{
  const sc = new Scene('l_love');
  const tw = sc.w('words');
  [['life', lifeArt(), 380, -4], ['family', familyArt(false), 960, 2], ['work', workArt(), 1540, -2]].forEach(([wd, art, x, r], i) => {
    sc.card(art, { x, y: 470, w: 540, h: 400, rot: r, at: sc.w(wd) - .15, in: 'up', outAt: tw - .1, out: 'down' });
    sc.text(pill(wd === 'life' ? 'His life' : wd === 'family' ? 'His family' : 'His work', 48), { x, y: 730, w: 340, h: 96, rot: r, at: sc.w(wd) + .15, outAt: tw - .1, out: 'down' });
  });
  for (let i = 0; i < 6; i++) sc.svg(svgw('0 0 100 90', heartG('#ff4d6d'), 'xMidYMid meet'), { x: 300 + i * 270, y: 900, w: 70, h: 63, at: .5 + i * .2, in: 'pop', outAt: tw - .1, out: 'pop', sfx: null, drift: [0, -60], float: 8 });
}
{
  const sc = new Scene('l_quote1');
  const q = ITEMS.l_quote1.text;
  const el = sc.text(`<div style="width:1380px;background:${BROWN};border-radius:34px;padding:60px 80px 50px;box-shadow:0 24px 50px rgba(0,0,0,.45);white-space:normal;text-align:left;position:relative">
    <div style="position:absolute;left:30px;top:-70px;font-family:Capra;font-size:260px;color:${ORANGE};line-height:1">“</div>
    <div class="q" style="font-family:Nunito;font-weight:900;font-size:66px;line-height:1.3;color:#fff">${wordsHTML(q)}</div>
    <div style="font-family:Nunito;font-weight:700;font-size:36px;color:#ffb27a;margin-top:30px;text-align:right">— Richard Scolyer, ABC <i>Australian Story</i>, 2023</div></div>`, { x: 960, y: 540, w: 1400, h: 700, in: 'pop', out: 'pop' });
  sc.on(lt => revealWords(el, lt, 0, ITEMS.l_quote1.dur, q));
}

// ============ PATIENT ZERO ============
titleCard('t_zero', [['Patient', 150, '#fff'], ['zero', 250, BROWN]], { ...LOOK.gown, mouth: 'grin', brows: 'determined', propR: PROP.thumb('R'), aR: -20 });
{
  const sc = new Scene('l_idea');
  const tc = sc.w('Could'), tb = sc.w('brain');
  const r = sc.svg(person({ mouth: 'o', brows: 'up', aR: -150 }), { x: 640, y: 700, w: 300, h: 520, in: 'left', outAt: tc - .1, out: 'left' });
  const g = sc.svg(person({ ...LOOK.georgina, mouth: 'grin', brows: 'up', aL: 40 }), { x: 1280, y: 700, w: 300, h: 520, in: 'right', outAt: tc - .1, out: 'right' });
  const bulb = sc.svg(bulbArt(), { x: 960, y: 300, w: 300, h: 415, at: sc.w('bold'), in: 'drop', outAt: tc - .1, out: 'up', sfx: 'ding' });
  sc.svg(ivArt(), { x: 470, y: 560, w: 340, h: 530, at: tc, in: 'pop', out: 'left' });
  sc.text(pill('Melanoma medicine', 46), { x: 470, y: 900, w: 520, h: 96, at: tc + .3, out: 'left' });
  const arrow = sc.svg(svgw('0 0 600 120', `<path class="ar" d="M20,60 L540,60" stroke="#fff" stroke-width="22" stroke-linecap="round" stroke-dasharray="520" stroke-dashoffset="520"/><path class="ah" d="M520,20 L585,60 L520,100 Z" fill="#fff" opacity="0"/>`, 'xMidYMid meet'), { x: 960, y: 560, w: 520, h: 104, at: tc + .5, in: 'none', out: 'pop', sfx: 'swish' });
  sc.svg(brainIcon(), { x: 1460, y: 560, w: 380, h: 330, at: tb, in: 'pop', out: 'right' });
  sc.text(pill('Brain cancer', 46), { x: 1460, y: 840, w: 380, h: 96, at: tb + .3, out: 'right' });
  sc.text(`<span class="capra" style="font-size:200px">?</span>`, { x: 960, y: 330, w: 200, h: 260, at: tb + .5, in: 'bigpop', out: 'pop' });
  const ar = arrow.querySelector('.ar'), ah = arrow.querySelector('.ah');
  sc.on(lt => { const p = ease.out(prog(lt, tc + .5, .8)); ar.setAttribute('stroke-dashoffset', (520 * (1 - p)).toFixed(1)); ah.setAttribute('opacity', p > .9 ? 1 : 0); bulb.querySelector('.glow').style.opacity = 0.4 + 0.6 * Math.abs(Math.sin(lt * 5)); wave(r, 'R', lt, -150, 10, 5); });
}
{
  const sc = new Scene('l_volun');
  const tz = sc.w('zero'), tf = sc.w('first'), tbs = sc.w('before');
  const r = sc.svg(person({ ...LOOK.gown, mouth: 'grin', brows: 'determined', aR: -165 }), { x: 560, y: 640, w: 380, h: 660, in: 'up', out: 'left' });
  sc.text(pill('I volunteer!', 50, '#fff', BROWN), { x: 300, y: 300, w: 400, h: 100, rot: -5, at: .4, out: 'pop' });
  sc.text(`<div style="font-family:Capra;font-size:120px;color:#e63950;border:12px solid #e63950;border-radius:24px;padding:0 40px;background:rgba(255,255,255,.92);line-height:1.15">PATIENT ZERO</div>`, { x: 1290, y: 300, w: 980, h: 200, rot: -7, at: tz - .1, in: 'stamp', inDur: .35, out: 'pop' });
  sc.text(`<div style="font-family:Nunito;font-weight:900;font-size:66px;color:${BROWN};background:#ffcf3f;border:6px solid ${BROWN};border-radius:999px;padding:6px 50px">🌏 WORLD FIRST!</div>`, { x: 1290, y: 520, w: 760, h: 140, at: tf, in: 'bigpop', out: 'pop', sfx: 'chime' });
  const step = (n, t, c) => `<div style="display:flex;align-items:center;gap:18px;background:#fff;border-radius:26px;padding:16px 30px;box-shadow:0 10px 20px rgba(70,20,0,.3)"><div style="width:70px;height:70px;border-radius:50%;background:${c};color:#fff;font-family:Capra;font-size:50px;display:flex;align-items:center;justify-content:center">${n}</div><div class="nun" style="font-size:46px;color:${BROWN}">${t}</div></div>`;
  sc.text(step(1, 'Immunotherapy', '#2a9d8f'), { x: 1060, y: 800, w: 520, h: 120, at: tbs - .2, in: 'left', out: 'down' });
  sc.text(`<span class="capra" style="font-size:90px">→</span>`, { x: 1370, y: 800, w: 100, h: 120, at: tbs + .1, in: 'pop', out: 'down', sfx: null });
  sc.text(step(2, 'Surgery', '#e63950'), { x: 1620, y: 800, w: 400, h: 120, at: sc.w('surgery'), in: 'right', out: 'down' });
  sc.on(lt => wave(r, 'R', lt, -165, 12, 6));
}
{
  const sc = new Scene('l_vacc');
  const tm = sc.w('match');
  sc.svg(vialArt(), { x: 480, y: 540, w: 330, h: 594, rot: -6, in: 'swing', inDur: .9, out: 'left', origin: '50% 0%' });
  sc.svg(cancerCellArt('mean', true), { x: 1420, y: 520, w: 440, h: 440, at: .5, in: 'pop', out: 'right' });
  const key = sc.svg(keyArt(), { x: 980, y: 560, w: 360, h: 135, at: tm - .6, in: 'pop', out: 'pop', anim: lt => { const p = ease.inout(prog(lt, tm - .2, .8)); return { x: p * 230, y: p * 25, r: lerp(0, 0, p) }; } });
  sc.text(pill('Made to match his very own tumour', 50, BROWN, '#fff'), { x: 960, y: 930, w: 1000, h: 104, at: tm, out: 'down', sfx: 'click' });
  for (let i = 0; i < 5; i++) sc.svg(sparkle('#fff'), { x: 1320 + Math.cos(i * 1.3) * 230, y: 520 + Math.sin(i * 1.3) * 230, w: 60, h: 60, at: tm + .7 + i * .06, in: 'spin', out: 'pop', sfx: null });
}
{
  const sc = new Scene('l_risk');
  const tr = sc.w('right');
  const s = sc.svg(scaleArt(), { x: 960, y: 560, w: 1100, h: 754, in: 'pop', out: 'pop' });
  sc.text(pill('A big risk', 54, '#ffcf3f', BROWN), { x: 470, y: 900, w: 380, h: 110, at: .3, out: 'pop' });
  sc.text(pill('The right thing to do', 54, '#e63950', '#fff'), { x: 1420, y: 900, w: 640, h: 110, at: tr, out: 'pop' });
  const beam = s.querySelector('.beam'), pl = s.querySelector('.panL'), pr = s.querySelector('.panR');
  sc.on(lt => {
    const a = lerp(-10, 12, ease.elastic(prog(lt, tr, 1.4))) + (lt < tr ? Math.sin(lt * 3) * 2 : 0);
    beam.setAttribute('transform', `rotate(${a.toFixed(2)} 350 81)`);
    pl.setAttribute('transform', `translate(110,90) rotate(${(-a).toFixed(2)})`); pr.setAttribute('transform', `translate(590,90) rotate(${(-a).toFixed(2)})`);
  });
}
{
  const sc = new Scene('l_clear');
  const tm = sc.w('Month'), te = sc.w('Eighteen');
  for (let i = 0; i < 6; i++) {
    const x = 400 + (i % 3) * 330, y = 330 + Math.floor(i / 3) * 360, at = tm + i * .45;
    sc.card(mriArt(false, 10 + i), { x, y, w: 290, h: 300, radius: 18, at, in: 'pop', out: 'pop', kb: null, sfx: null });
    sc.text(`<div style="font-family:Nunito;font-weight:900;font-size:40px;color:#fff;background:#22a35a;border:5px solid #fff;border-radius:14px;padding:2px 18px">CLEAR ✔</div>`, { x: x + 40, y: y + 110, w: 240, h: 80, rot: -8, at: at + .25, in: 'stamp', inDur: .3, out: 'pop', sfx: 'ding' });
  }
  const cnt = sc.text(`<div style="text-align:center"><div class="nun" style="font-size:60px;color:#fff">Month</div><div class="capra n" style="font-size:240px;line-height:1">1</div></div>`, { x: 1530, y: 450, w: 500, h: 420, at: tm, in: 'pop', out: 'pop', sfx: null });
  sc.text(pill('No sign of the cancer!', 54, '#22a35a', '#fff'), { x: 1450, y: 840, w: 680, h: 110, at: sc.w('no sign'), in: 'bigpop', out: 'pop', sfx: 'chime' });
  const n = cnt.querySelector('.n');
  sc.on(lt => { n.textContent = Math.max(1, Math.round(lerp(1, 18, ease.inout(prog(lt, tm, te - tm + .6))))); });
}

// ============ AUSTRALIANS OF THE YEAR ============
titleCard('t_aoty', [['Australians', 200, '#fff'], ['of the Year', 130, BROWN]], { ...LOOK.suit, mouth: 'grin', eyes: 'happy', propR: PROP.trophy('R'), aR: -165 });
{
  const sc = new Scene('l_aoty');
  sc.svg(stageArt(), { x: 960, y: 540, w: 1920, h: 1080, cls: 'noshadow', in: 'fade', inDur: .5, out: 'fade', sfx: null });
  const r = sc.svg(person({ ...LOOK.suit, mouth: 'grin', eyes: 'happy', aR: -160, propR: PROP.trophy('R') }), { x: 800, y: 640, w: 340, h: 590, at: .3, in: 'up', out: 'down', anim: lt => ({ y: -Math.abs(Math.sin(lt * 3.6)) * 14 }) });
  const g = sc.svg(person({ ...LOOK.georgina, coat: '#7b4fb8', mouth: 'grin', eyes: 'happy', aL: 160 }), { x: 1120, y: 640, w: 340, h: 590, at: .45, in: 'up', out: 'down', anim: lt => ({ y: -Math.abs(Math.sin(lt * 3.6 + 1.2)) * 14 }) });
  sc.text(`<div style="font-family:Capra;font-size:100px;color:#fff;background:#e63950;border:8px solid #ffd33f;border-radius:26px;padding:4px 50px;box-shadow:0 14px 30px rgba(0,0,0,.45)">Australians of the Year</div>`, { x: 960, y: 150, w: 1500, h: 190, at: sc.w('Australians'), in: 'bigpop', out: 'up', sfx: 'chime' });
  sc.text(`<div style="width:200px;height:200px;border-radius:50%;background:#ffcf3f;border:7px solid ${BROWN};display:flex;align-items:center;justify-content:center;font-family:Capra;font-size:76px;color:${BROWN}">2024</div>`, { x: 300, y: 330, w: 210, h: 210, at: sc.w('2024'), in: 'spin', out: 'pop' });
  // confetti
  seed(99); let conf = ''; const P = [];
  for (let i = 0; i < 90; i++) { P.push([rnd(0, 1920), rnd(-1100, 0), rnd(140, 260), rnd(0, 6.28), rnd(2, 5)]); conf += `<rect class="cf" width="16" height="26" rx="3" fill="${['#ffd33f', '#e63950', '#2a9d8f', '#fff', '#7ec8f0', '#ff8a3d'][i % 6]}"/>`; }
  const cf = sc.svg(`<svg viewBox="0 0 1920 1080" style="overflow:visible">${conf}</svg>`, { x: 960, y: 540, w: 1920, h: 1080, at: sc.w('Australians'), in: 'none', out: 'fade', sfx: null, cls: '' });
  cf.classList.add('noshadow');
  const rects = cf.querySelectorAll('.cf'), t0 = sc.w('Australians');
  sc.on(lt => {
    const tt = lt - t0;
    rects.forEach((e, i) => { const [x, y0, v, ph, sp] = P[i]; const y = y0 + v * tt * 2.2; e.setAttribute('transform', `translate(${(x + Math.sin(tt * sp + ph) * 40).toFixed(1)},${(y % 1250 + (y > 1150 ? -1250 : 0)).toFixed(1)}) rotate(${(tt * 200 * sp + ph * 50) % 360})`); });
    wave(g, 'L', lt, 160, 14, 6);
  });
}
{
  const sc = new Scene('l_going');
  const tb = sc.w('Tour'), tp = sc.w('two hundred'), tk = sc.w('King');
  sc.card(bikeArt(), { x: 400, y: 400, w: 660, h: 462, rot: -4, at: tb - .2, in: 'left', out: 'left' });
  sc.text(pill('Tour de Cure', 48), { x: 400, y: 680, w: 400, h: 96, rot: -4, at: tb + .2, out: 'left' });
  sc.card(shoeArt(), { x: 980, y: 650, w: 660, h: 462, rot: 3, at: tp - .2, in: 'up', out: 'down' });
  sc.text(pill('250th parkrun', 48), { x: 980, y: 930, w: 420, h: 96, rot: 3, at: tp + .3, out: 'down' });
  sc.card(crownHatArt(), { x: 1530, y: 380, w: 660, h: 462, rot: -2, at: tk - .2, in: 'right', out: 'right' });
  sc.text(pill('An Akubra for the King', 48), { x: 1530, y: 660, w: 620, h: 96, rot: -2, at: sc.w('Akubra'), out: 'right' });
}
{
  const sc = new Scene('l_nature');
  const tn = sc.w('Nature'), td = sc.w('doctors');
  sc.svg(journalArt(), { x: 640, y: 540, w: 560, h: 747, rot: -4, in: 'pop', out: 'left' });
  sc.text(`<div style="font-family:Capra;font-size:80px;color:#22a35a;border:9px solid #22a35a;border-radius:20px;padding:0 30px;background:rgba(255,255,255,.9)">PUBLISHED 2025</div>`, { x: 700, y: 820, w: 700, h: 150, rot: -10, at: tn, in: 'stamp', inDur: .35, out: 'left' });
  const g = sc.svg(globeArt(), { x: 1380, y: 520, w: 560, h: 560, at: td - .3, in: 'pop', out: 'right' });
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 - 1.2; sc.svg(person({ ...(i % 2 ? LOOK.georgina : LOOK.richard), hair: ['#3a2a1a', '#e2bd6e', '#111', '#9a8877', '#7a4a24', '#c0392b'][i], skin: ['#f2c4a2', '#8d5524', '#f3c9a8', '#c68642', '#f1c27d', '#e0ac69'][i], noLegs: true, mouth: 'smile' }), { x: 1380 + Math.cos(a) * 360, y: 520 + Math.sin(a) * 340, w: 130, h: 225, at: td + .1 + i * .12, in: 'pop', out: 'right', sfx: null, float: 6 }); }
  sc.text(pill('Doctors everywhere can learn', 46, BROWN, '#fff'), { x: 1380, y: 960, w: 760, h: 100, at: td + .5, out: 'right' });
  sc.on(lt => updateGlobe(g, 60 + lt * 30, 10));
}

// ============ CHANGING LIVES ============
bgKey(T0('t_lives') - 0.1, 0); bgKey(T0('t_lives') + 1.2, 0.22); bgKey(TV('l_died') - 0.3, 0.22); bgKey(T0('l_trial') + 1.2, 0);
titleCard('t_lives', [['Changing', 140, BROWN], ['lives', 260, '#fff']], { mouth: 'smile', propR: PROP.heart('R'), aR: -60 });
{
  const sc = new Scene('l_back');
  const tc = sc.w('came back'), tb = sc.w('But');
  sc.card(mriArt(true, 21), { x: 960, y: 500, w: 560, h: 582, in: 'pop', outAt: tb - .1, out: 'pop', kb: [1, 1.05, 0, 0] });
  sc.text(pill('2025: the cancer came back', 50, BROWN, '#fff'), { x: 960, y: 900, w: 760, h: 104, at: tc - .2, outAt: tb - .1, out: 'pop' });
  sc.card(familyArt(true), { x: 960, y: 480, w: 1300, h: 770, at: tb, in: 'up', out: 'up', kb: [1, 1.08, -30, 0] });
  [['living', 'Living', 520], ['loving', 'Loving', 960], ['fun', 'Having fun', 1400]].forEach(([w, t, x]) => sc.text(pill(t, 56, '#fff', BROWN), { x, y: 960, w: 420, h: 110, at: sc.w(w) - .1, in: 'bigpop', out: 'down' }));
  for (let i = 0; i < 5; i++) sc.svg(svgw('0 0 100 90', heartG('#ff4d6d'), 'xMidYMid meet'), { x: 600 + i * 180, y: 760, w: 60, h: 54, at: tb + .6 + i * .3, in: 'pop', out: 'fade', sfx: null, drift: [0, -90], float: 8 });
}
{
  const sc = new Scene('l_died');
  const ta = sc.w('almost');
  sc.svg(nightArt(), { x: 960, y: 540, w: 1920, h: 1080, cls: 'noshadow', in: 'fade', inDur: 1, out: 'fade', outDur: .6, sfx: null });
  const cnd = sc.svg(candleArt(), { x: 460, y: 640, w: 300, h: 630, at: .5, in: 'fade', inDur: 1, out: 'fade', sfx: null });
  sc.text(`<div style="text-align:center"><div style="font-family:Capra;font-size:84px;color:#fff3c4">Professor Richard Scolyer AO</div><div class="nun" style="font-size:64px;color:#fff;margin-top:8px">1966 – 2026</div></div>`, { x: 1060, y: 330, w: 1400, h: 260, at: .9, in: 'fade', inDur: 1.2, out: 'fade', sfx: null });
  const bars = sc.text(`<div style="width:1000px;text-align:left">
     <div class="nun" style="font-size:40px;color:#cfd6ff;margin-bottom:8px">Most people with glioblastoma</div><div style="height:66px;width:290px;background:#8f97c9;border-radius:14px;display:flex;align-items:center;padding-left:24px;font-family:Nunito;font-weight:900;font-size:38px;color:#fff;box-sizing:border-box">about 1 year</div>
     <div class="nun" style="font-size:40px;color:#fff3c4;margin:30px 0 8px">Richard</div><div class="rb" style="height:66px;width:870px;background:#ffb21e;border-radius:14px;display:flex;align-items:center;padding-left:24px;font-family:Nunito;font-weight:900;font-size:38px;color:${BROWN};box-sizing:border-box;transform-origin:0 50%">almost 3 years</div></div>`, { x: 1150, y: 760, w: 1000, h: 330, at: ta - .3, in: 'fade', inDur: .6, out: 'fade', sfx: null });
  const rb = bars.querySelector('.rb'), fl = cnd.querySelector('.flame'), stars = sc.els[0].el.querySelectorAll('.star');
  sc.on(lt => {
    rb.style.transform = `scaleX(${(0.33 + 0.67 * ease.out(prog(lt, ta + .2, 1.6))).toFixed(3)})`;
    fl.setAttribute('transform', `translate(100,120) scale(${(1 + Math.sin(lt * 13) * .04 + Math.sin(lt * 7.3) * .03).toFixed(3)},${(1 + Math.sin(lt * 9) * .06).toFixed(3)}) translate(-100,-120)`);
    stars.forEach((s, i) => { if (i % 3 === 0) s.setAttribute('opacity', (0.5 + 0.5 * Math.sin(lt * 2 + i)).toFixed(2)); });
  });
}
{
  const sc = new Scene('l_trial');
  const tu = sc.w('United'), tm = sc.w('more');
  const m = sc.card(worldArt(), { x: 960, y: 540, w: 1500, h: 800, in: 'up', out: 'up', kb: [1, 1.04, 0, 0] });
  sc.text(pill('His work lives on', 54, BROWN, '#fff'), { x: 960, y: 105, w: 560, h: 110, at: .2, out: 'up' });
  sc.text(pill('Clinical trial: USA', 50, '#2a62b8', '#fff'), { x: 1430, y: 330, w: 520, h: 104, at: tu + .3, out: 'up' });
  sc.text(pill('+ more on the way', 50, '#22a35a', '#fff'), { x: 960, y: 960, w: 520, h: 104, at: tm, in: 'bigpop', out: 'down' });
  const route = m.querySelector('.route'), plane = m.querySelector('.plane'), L = route.getTotalLength(), pU = m.querySelector('.pinU');
  EVENTS.push({ t: sc.t0 + .6, type: 'plane' });
  sc.on(lt => {
    const p = ease.inout(prog(lt, .6, tu + .2));
    const a = route.getPointAtLength(L * p), b = route.getPointAtLength(Math.min(L, L * p + 2));
    plane.setAttribute('transform', `translate(${a.x.toFixed(1)},${a.y.toFixed(1)}) rotate(${(Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI).toFixed(1)}) scale(1.4)`);
    route.setAttribute('stroke-dasharray', `${(L * p).toFixed(1)} ${L}`);
    const q = prog(lt, tu, .5); pU.setAttribute('transform', pU.getAttribute('transform').split(' scale')[0] + ` scale(${(ease.back(q) * 1.8).toFixed(3)})`);
  });
}
{
  const sc = new Scene('l_chair');
  const tr = sc.w('Richard'), ts = sc.w('searching');
  const lab = sc.card(labArt(), { x: 960, y: 560, w: 1300, h: 809, in: 'pop', out: 'pop' });
  sc.text(`<div style="background:linear-gradient(#e7c26a,#c99a36);border:7px solid ${BROWN};border-radius:18px;padding:18px 40px;font-family:Nunito;font-weight:900;font-size:50px;color:${BROWN};line-height:1.15;white-space:normal;width:900px;box-shadow:0 14px 28px rgba(70,20,0,.4)">The Richard Scolyer Chair in<br>Brain Cancer Research</div>`, { x: 960, y: 200, w: 980, h: 200, at: tr, in: 'drop', out: 'up', sfx: 'drop' });
  const mg = sc.svg(svgw('0 0 200 200', `<path d="M110,110 L180,180" stroke="#7a4a1e" stroke-width="22" stroke-linecap="round"/><circle cx="80" cy="80" r="62" fill="rgba(190,232,255,.6)" stroke="${OL}" stroke-width="10"/>`, 'xMidYMid meet'), { x: 1330, y: 520, w: 220, h: 220, at: ts - .2, in: 'pop', out: 'pop', anim: lt => ({ x: Math.sin(lt * 3) * 70, y: Math.cos(lt * 2.4) * 40 }) });
  sc.text(pill('Searching for a cure', 50, '#2a9d8f', '#fff'), { x: 960, y: 980, w: 620, h: 104, at: ts, out: 'down' });
}

// ============ WHAT WE CAN LEARN ============
titleCard('t_learn', [['What we can', 120, BROWN], ['learn', 260, '#fff']], { mouth: 'grin', aR: -150, eyes: 'happy' }, (sc, ch) => sc.on(lt => wave(ch, 'R', lt, -150, 22)));
{
  const sc = new Scene('l_brave');
  [['brave', 'Brave', 430], ['curious', 'Curious', 960], ['helping', 'Helping others', 1490]].forEach(([k, t, x]) => {
    sc.svg(badgeArt(k), { x, y: 470, w: 400, h: 400, at: sc.w(k === 'helping' ? 'helping' : k) - .15, in: 'bigpop', out: 'pop', float: 8 });
    sc.text(`<span class="capra" style="font-size:80px">${t}</span>`, { x, y: 770, w: 520, h: 120, at: sc.w(k === 'helping' ? 'helping' : k) + .1, out: 'pop', sfx: null });
  });
}
{
  const sc = new Scene('l_leap');
  const q = ITEMS.l_leap.text.replace('He once said: ', ''), tl = sc.w('leap in');
  sc.svg(cliffArt(), { x: 960, y: 540, w: 1920, h: 1080, cls: 'noshadow', in: 'fade', inDur: .5, out: 'fade', sfx: null });
  const qe = sc.text(`<div style="width:1500px;background:rgba(255,255,255,.95);border-radius:30px;padding:28px 50px;box-shadow:0 16px 34px rgba(0,40,80,.3);white-space:normal;text-align:center">
     <div class="q" style="font-family:Nunito;font-weight:900;font-size:50px;line-height:1.28;color:${BROWN}">“${wordsHTML(q)}”</div><div class="nun" style="font-size:32px;color:#8a6a5a;margin-top:10px">— Richard Scolyer</div></div>`, { x: 960, y: 230, w: 1520, h: 380, at: .3, in: 'down', out: 'up' });
  qe.querySelectorAll('.wd').forEach(w => { if (/leap|in,|lean/.test(w.textContent) && w.textContent !== 'in') w.style.color = ORANGE; });
  const runner = sc.svg(person({ ...LOOK.runner, mouth: 'grin', aL: 150, aR: -150 }), { x: 430, y: 560, w: 220, h: 380, at: .4, in: 'pop', out: 'fade', anim: lt => {
    const p = ease.inout(prog(lt, tl - .3, 1.4)); const hop = lt < tl - .3 ? -Math.abs(Math.sin(lt * 6)) * 10 : 0;
    return { x: p * 1060, y: -Math.sin(p * Math.PI) * 330 + hop, r: Math.sin(p * Math.PI) * 18 };
  } });
  EVENTS.push({ t: sc.t0 + tl - .3, type: 'whoosh' });
  sc.text(`<span class="capra" style="font-size:150px;color:#fff;text-shadow:0 8px 0 rgba(0,60,120,.35)">Leap in!</span>`, { x: 960, y: 900, w: 900, h: 200, at: tl + .9, in: 'bigpop', out: 'pop', sfx: 'chime' });
  sc.on(lt => revealWords(qe, lt, (ITEMS.l_leap.start - sc.t0) + ITEMS.l_leap.dur * (14 / ITEMS.l_leap.text.length), ITEMS.l_leap.dur * (q.length / ITEMS.l_leap.text.length), q));
}
{
  const sc = new Scene('l_crack');
  const q = 'I would be delighted and humbled to be remembered as a proud everyday Aussie who ‘gave it a crack’…';
  sc.svg(letterArt(), { x: 960, y: 560, w: 1240, h: 854, rot: -2, in: 'up', out: 'up' });
  const t = sc.text(`<div style="width:1000px;white-space:normal;text-align:left;font-family:Caveat;font-weight:700;font-size:78px;line-height:84px;color:#24406e">${wordsHTML(q)}<div style="text-align:right;margin-top:16px">— Richard</div></div>`, { x: 990, y: 560, w: 1040, h: 700, rot: -2, at: .5, in: 'fade', inDur: .3, out: 'up', sfx: null });
  t.querySelectorAll('.wd').forEach(w => { if (/crack|gave|it|Aussie|everyday|proud/.test(w.textContent)) w.style.color = '#c0392b'; });
  sc.svg(svgw('0 0 300 140', `<path d="M-10,92 Q150,40 310,92 Q314,110 290,108 Q150,82 10,108 Q-14,110 -10,92 Z" fill="#7a5230" ${SW}/><path d="M60,92 Q66,4 150,0 Q234,4 240,92 Q150,74 60,92 Z" fill="#8c6038" ${SW}/><path d="M62,80 Q150,62 238,80" stroke="#4a2f18" stroke-width="14" fill="none"/>`, 'xMidYMid meet'), { x: 1560, y: 200, w: 300, h: 140, rot: 12, at: sc.w('Aussie'), in: 'drop', out: 'up' });
  sc.on(lt => { let pos = 0; const els = t.querySelectorAll('.wd'), t0 = .6, dur = ITEMS.l_crack.dur - .6; els.forEach(w => { const p = prog(lt, t0 + dur * pos / q.length, .2); pos += w.textContent.length + 1; w.style.opacity = p; }); });
}
{
  const sc = new Scene('l_proof', { t1: TV('l_proof') + 0.4 });
  const arts = [footyArt(), uniArt(), cellsArt('normal', 4), beachArt(), instituteArt(), workArt(), bikeArt(), familyArt(true), sydneyArt(), labArt(), lifeArt(), caravanArt()];
  const grid = [];
  arts.forEach((a, i) => {
    const c = i % 4, r = Math.floor(i / 4), x = 270 + c * 460, y = 200 + r * 340;
    grid.push(sc.card(a, { x, y, w: 420, h: 300, rot: [-3, 2, -1, 3][(i + r) % 4], at: i * .14, in: 'pop', out: 'fade', outDur: .5, sfx: i % 3 ? null : 'pop', radius: 22 }));
  });
  sc.text(`<div style="background:${ORANGE};border:10px solid #fff;border-radius:40px;padding:30px 60px;box-shadow:0 20px 50px rgba(0,0,0,.45);text-align:center"><div style="font-family:Capra;font-size:96px;color:#fff;line-height:1.05">One person can make<br>a <span style="color:#ffe14d">huge difference</span></div></div>`, { x: 960, y: 540, w: 1500, h: 400, at: sc.w('one person') + .2, in: 'bigpop', inDur: .8, out: 'fade', outDur: .5, sfx: 'chime' });
  sc.on(lt => { const s = 1 - 0.06 * prog(lt, 0, sc.D); sc.root.style.transform = `scale(${s})`; });
}

// ============ OUTRO: curtains close ============
{
  const t0 = T0('outro'), t1 = ITEMS.outro.end;
  const sc = new Scene('outro', { t0, t1, z: 20, tail: 0.2 });
  const cl = sc.svg(curtain(), { x: 490, y: 540, w: 1000, h: 1080, in: 'none', out: 'none', sfx: null }), cr = sc.svg(curtain(), { x: 1430, y: 540, w: 1000, h: 1080, in: 'none', out: 'none', sfx: null });
  cl.classList.add('noshadow'); cr.classList.add('noshadow'); cl.style.transformOrigin = '0% 50%'; cr.style.transformOrigin = '100% 50%';
  sc.svg(valance(), { x: 960, y: 80, w: 1920, h: 170, in: 'down', inDur: .6, out: 'none', sfx: null });
  sc.text(`<span class="capra" style="font-size:150px">Thank you, Richard.</span>`, { x: 960, y: 470, w: 1600, h: 220, at: 1.5, in: 'pop', out: 'none', sfx: 'chime' });
  sc.text(`<span class="nun" style="font-size:54px;color:#fff3c4">Professor Richard Scolyer AO · 1966 – 2026</span>`, { x: 960, y: 640, w: 1500, h: 100, at: 2.3, in: 'fade', out: 'none', sfx: null });
  sc.text(`<div class="nun" style="font-size:26px;font-weight:700;color:rgba(255,235,220,.85);line-height:1.5;white-space:normal;width:1500px">Illustrations, music and narration (synthetic voice) created for this film. Facts from ABC News, Melanoma Institute Australia,<br>The University of Sydney and Wikipedia. Quotes are Richard Scolyer’s own words as reported by the ABC.</div>`, { x: 960, y: 960, w: 1560, h: 110, at: 3.6, in: 'fade', inDur: .8, out: 'none', sfx: null });
  const black = div('', ''); black.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;z-index:50'; sc.root.appendChild(black);
  EVENTS.push({ t: t0 + 0.1, type: 'curtain' });
  sc.on(lt => {
    const p = ease.inout(prog(lt, .1, 1.3)); const sx = lerp(0.3, 1, p);
    cl.style.transform = `translateX(${lerp(-400, 0, p)}px) scaleX(${sx})`; cr.style.transform = `translateX(${lerp(400, 0, p)}px) scaleX(${sx})`;
    black.style.opacity = prog(lt, sc.D - 1.4, 1.2);
  });
}
