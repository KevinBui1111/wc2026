const DATA_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.json';

/* ══════════════════════════════════════════════════════════
   OFFICIAL BRACKET TREE  (from FIFA / openfootball)
   ══════════════════════════════════════════════════════════ */
const LEFT = {
  sf: 101,
  qf: [
    { num: 97, r16: [
      { num: 89, r32: [74, 77] },
      { num: 90, r32: [73, 75] },
    ]},
    { num: 98, r16: [
      { num: 93, r32: [83, 84] },
      { num: 94, r32: [81, 82] },
    ]},
  ],
};

const RIGHT = {
  sf: 102,
  qf: [
    { num: 99, r16: [
      { num: 91, r32: [76, 78] },
      { num: 92, r32: [79, 80] },
    ]},
    { num: 100, r16: [
      { num: 95, r32: [86, 88] },
      { num: 96, r32: [85, 87] },
    ]},
  ],
};

const FINAL_NUM = 104;
const THIRD_NUM = 103;

/* ══════════════════════════════════════════════════════════
   WINNER / LOSER PROPAGATION MAP
   ══════════════════════════════════════════════════════════ */
const WINNER_MAP = {
  // R32 → R16
  73: { m: 90, s: 'team1' }, 74: { m: 89, s: 'team1' },
  75: { m: 90, s: 'team2' }, 76: { m: 91, s: 'team1' },
  77: { m: 89, s: 'team2' }, 78: { m: 91, s: 'team2' },
  79: { m: 92, s: 'team1' }, 80: { m: 92, s: 'team2' },
  81: { m: 94, s: 'team1' }, 82: { m: 94, s: 'team2' },
  83: { m: 93, s: 'team1' }, 84: { m: 93, s: 'team2' },
  85: { m: 96, s: 'team1' }, 86: { m: 95, s: 'team1' },
  87: { m: 96, s: 'team2' }, 88: { m: 95, s: 'team2' },
  // R16 → QF
  89: { m: 97, s: 'team1' }, 90: { m: 97, s: 'team2' },
  91: { m: 99, s: 'team1' }, 92: { m: 99, s: 'team2' },
  93: { m: 98, s: 'team1' }, 94: { m: 98, s: 'team2' },
  95: { m: 100, s: 'team1' }, 96: { m: 100, s: 'team2' },
  // QF → SF
  97: { m: 101, s: 'team1' }, 98: { m: 101, s: 'team2' },
  99: { m: 102, s: 'team1' }, 100: { m: 102, s: 'team2' },
  // SF → Final
  101: { m: 104, s: 'team1' }, 102: { m: 104, s: 'team2' },
};

const LOSER_MAP = {
  101: { m: 103, s: 'team1' },
  102: { m: 103, s: 'team2' },
};

/* ══════ FLAGS ══════ */
const CC = {
  'Mexico': 'mx', 'South Africa': 'za', 'South Korea': 'kr',
  'Czech Republic': 'cz', 'Canada': 'ca', 'Bosnia & Herzegovina': 'ba',
  'Qatar': 'qa', 'Switzerland': 'ch', 'Brazil': 'br', 'Morocco': 'ma',
  'Haiti': 'ht', 'Scotland': 'gb-sct', 'USA': 'us', 'Paraguay': 'py',
  'Australia': 'au', 'Japan': 'jp', 'England': 'gb-eng',
  'Wales': 'gb-wls', 'France': 'fr', 'Germany': 'de', 'Spain': 'es',
  'Portugal': 'pt', 'Argentina': 'ar', 'Uruguay': 'uy', 'Colombia': 'co',
  'Chile': 'cl', 'Peru': 'pe', 'Ecuador': 'ec', 'Netherlands': 'nl',
  'Belgium': 'be', 'Denmark': 'dk', 'Sweden': 'se', 'Norway': 'no',
  'Poland': 'pl', 'Croatia': 'hr', 'Serbia': 'rs', 'Italy': 'it',
  'Austria': 'at', 'Hungary': 'hu', 'Turkey': 'tr', 'Greece': 'gr',
  'Romania': 'ro', 'Ukraine': 'ua', 'Nigeria': 'ng', 'Senegal': 'sn',
  'Ghana': 'gh', 'Cameroon': 'cm', 'Egypt': 'eg', 'Tunisia': 'tn',
  'Algeria': 'dz', 'Ivory Coast': 'ci', 'Iran': 'ir',
  'Saudi Arabia': 'sa', 'Indonesia': 'id', 'Costa Rica': 'cr',
  'Panama': 'pa', 'Jamaica': 'jm', 'Bolivia': 'bo', 'Venezuela': 've',
  'Iceland': 'is', 'Ireland': 'ie', 'Finland': 'fi', 'Slovakia': 'sk',
  'Slovenia': 'si', 'Albania': 'al', 'North Macedonia': 'mk',
  'Montenegro': 'me', 'Georgia': 'ge', 'New Zealand': 'nz',
  'Uzbekistan': 'uz', 'DR Congo': 'cd', 'Cape Verde': 'cv',
  'Jordan': 'jo', 'Bulgaria': 'bg', 'Kosovo': 'xk', 'Estonia': 'ee',
  'Latvia': 'lv', 'Lithuania': 'lt', 'Belarus': 'by', 'Moldova': 'md',
  'Armenia': 'am', 'Azerbaijan': 'az', 'Kazakhstan': 'kz',
  'Bahrain': 'bh', 'Oman': 'om', 'Kuwait': 'kw', 'UAE': 'ae',
  'Mali': 'ml', 'Burkina Faso': 'bf', 'Tanzania': 'tz', 'Kenya': 'ke',
  'Uganda': 'ug', 'Zambia': 'zm', 'Zimbabwe': 'zw', 'Angola': 'ao',
  'Guatemala': 'gt', 'El Salvador': 'sv', 'Cuba': 'cu',
  'Dominican Republic': 'do', 'Suriname': 'sr', 'Nicaragua': 'ni',
  'Palestine': 'ps', 'Syria': 'sy', 'Lebanon': 'lb', 'Tajikistan': 'tj',
  'Vietnam': 'vn', 'Thailand': 'th', 'Philippines': 'ph',
  'Trinidad & Tobago': 'tt', 'Rwanda': 'rw', 'Comoros': 'km',
  'Madagascar': 'mg', 'Namibia': 'na', 'Botswana': 'bw',
  'Malawi': 'mw', 'Liberia': 'lr', 'Sierra Leone': 'sl',
  'Guinea': 'gn', 'Gambia': 'gm', 'Mauritania': 'mr', 'Libya': 'ly',
  'Sudan': 'sd', 'South Sudan': 'ss', 'Togo': 'tg', 'Benin': 'bj',
  'Niger': 'ne', 'Republic of Congo': 'cg', 'Equatorial Guinea': 'gq',
  'Gabon': 'ga',
};

function flg(t) {
  if (!t || t === 'TBD') return '';
  const c = CC[t];
  return c ? `https://flagcdn.com/w40/${c}.png` : '';
}

function fdt(d, t) {
  if (!d) return 'TBD';
  const x = new Date(d + 'T12:00:00Z');
  let str = x.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  if (t) str += ' · ' + t;
  return str;
}

/* ══════ GLOBAL STATE ══════ */
let byNum = {};            // all knockout matches keyed by num
let manualScores = {};     // user-entered scores: { matchNum: {s1, s2} }

/* ══════ MATCH HELPERS ══════ */
function winner(m) {
  if (!m || !m.score) return null;
  const ft = m.score.ft;
  if (!ft) return null;
  const p = m.score.p || m.score.pen;
  if (p) return p[0] > p[1] ? m.team1 : m.team2;
  if (m.score.et) {
    const e = m.score.et;
    if (e[0] !== e[1]) return e[0] > e[1] ? m.team1 : m.team2;
  }
  if (ft[0] !== ft[1]) return ft[0] > ft[1] ? m.team1 : m.team2;
  return null;
}

function loser(m) {
  const w = winner(m);
  if (!w || !m) return null;
  return w === m.team1 ? m.team2 : m.team1;
}

function canEdit(m) {
  // editable if both teams are known
  return m && m.team1 && m.team2 && m.team1 !== 'TBD' && m.team2 !== 'TBD';
}

/* ══════ PROPAGATION ══════ */
function propagateWinner(matchNum) {
  const m = byNum[matchNum];
  if (!m) return;
  const w = winner(m);
  const l = loser(m);

  // Propagate winner
  const wt = WINNER_MAP[matchNum];
  if (wt) {
    ensureMatch(wt.m);
    const old = byNum[wt.m][wt.s];
    byNum[wt.m][wt.s] = w || null;
    // If team changed, clear that downstream match's score and cascade
    if (old !== byNum[wt.m][wt.s]) {
      clearDownstream(wt.m);
    }
  }

  const lt = LOSER_MAP[matchNum];
  if (lt) {
    ensureMatch(lt.m);
    const old = byNum[lt.m][lt.s];
    byNum[lt.m][lt.s] = l || null;
    if (old !== byNum[lt.m][lt.s]) {
      clearDownstream(lt.m);
    }
  }
}

function ensureMatch(num) {
  if (!byNum[num]) {
    byNum[num] = {
      num, team1: null, team2: null, score: null,
      date: null, time: null, ground: null,
      round: getRoundName(num),
    };
  }
}

function getRoundName(num) {
  if (num >= 73 && num <= 88) return 'Round of 32';
  if (num >= 89 && num <= 96) return 'Round of 16';
  if (num >= 97 && num <= 100) return 'Quarter-final';
  if (num === 101 || num === 102) return 'Semi-final';
  if (num === 103) return 'Match for third place';
  if (num === 104) return 'Final';
  return '';
}

function clearDownstream(matchNum) {
  // Remove manual score for this match
  delete manualScores[matchNum];
  const m = byNum[matchNum];
  if (m && m._manual) {
    m.score = null;
    m._manual = false;
  }
  const wt = WINNER_MAP[matchNum];
  if (wt) {
    ensureMatch(wt.m);
    byNum[wt.m][wt.s] = null;
    clearDownstream(wt.m);
  }
  const lt = LOSER_MAP[matchNum];
  if (lt) {
    ensureMatch(lt.m);
    byNum[lt.m][lt.s] = null;
    clearDownstream(lt.m);
  }
}

/* ══════ CARD HTML ══════ */
function card(m, opts = {}) {
  if (!m) {
    return '<div class="mc" style="width:240px;text-align:center;'
      + 'padding:20px 8px;color:rgba(255,255,255,.12);font-size:11px;'
      + 'font-weight:600;">Match TBD</div>';
  }

  const w = winner(m);
  const ft = m.score && m.score.ft;
  const et = m.score && m.score.et;
  const pen = m.score && (m.score.p || m.score.pen);
  let s1 = ft ? ft[0] : '–';
  let s2 = ft ? ft[1] : '–';
  let extra = '';
  if (et) { s1 = et[0]; s2 = et[1]; extra = 'aet'; }
  if (pen) extra = 'pen';

  const t1c = w ? (w === m.team1 ? 'w' : 'l') : '';
  const t2c = w ? (w === m.team2 ? 'w' : 'l') : '';
  const cls = opts.isFinal ? 'final' : (opts.isThird ? 'third' : '');
  const badge = (opts.isFinal && w)
    ? '<div class="champ">🏆 Champion</div>' : '';
  const f1 = flg(m.team1);
  const f2 = flg(m.team2);
  const p1 = pen ? `<span class="ps">(${pen[0]})</span>` : '';
  const p2 = pen ? `<span class="ps">(${pen[1]})</span>` : '';
  const exH = extra === 'aet'
    ? '<div class="exinfo aet">After Extra Time</div>'
    : extra === 'pen'
      ? '<div class="exinfo pen">Penalties</div>' : '';
  const mn = m.num ? `<span class="mnum">#${m.num}</span>` : '';
  const vn = m.ground || '';
  const timeStr = m.time || '';
  const dateTimeStr = fdt(m.date, timeStr);

  const isEditable = canEdit(m);
  const editCls = isEditable ? 'editable' : '';
  const editClick = isEditable && m.num
    ? ` onclick="openModal(${m.num})"` : '';
  const editHint = (isEditable && !ft)
    ? '<div class="edit-hint">✏️ Click to enter score</div>' : '';
  const manualBadge = m._manual
    ? '<span style="font-size:6px;color:rgba(250,204,21,.4);'
      + 'margin-left:3px;">✏️</span>' : '';

  const flagImg = (url, alt) => url
    ? `<img class="fl" src="${url}" alt="${alt || ''}" `
      + `loading="lazy" onerror="this.style.visibility='hidden'">`
    : '<div class="fl"></div>';

  return `<div class="mc ${cls} ${editCls}"${editClick}>
  ${badge}
  <div class="meta"><span>${dateTimeStr}</span>${mn}${manualBadge}</div>
  ${vn ? `<div class="venue" title="${vn}">📍 ${vn}</div>` : ''}
  <div class="tr ${t1c}">
    ${flagImg(f1, m.team1)}
    <span class="nm">${m.team1 || 'TBD'}</span>
    <div class="sb">${p1}<span class="fs">${s1}</span></div>
  </div>
  <div class="dvd"></div>
  <div class="tr ${t2c}">
    ${flagImg(f2, m.team2)}
    <span class="nm">${m.team2 || 'TBD'}</span>
    <div class="sb">${p2}<span class="fs">${s2}</span></div>
  </div>
  ${exH}
  ${editHint}
</div>`;
}

/* ══════════════════════════════════════════════════════════
   BRACKET BUILDER (recursive nested flex)
   ══════════════════════════════════════════════════════════ */
function buildHalf(tree, direction) {
  const dir = direction === 'right' ? 'dir-r' : 'dir-l';

  function matchCell(num, opts = {}) {
    const lbl = opts.roundLabel
      ? '<div style="font-size:8px;font-weight:700;text-transform:uppercase;'
        + 'letter-spacing:1.5px;color:rgba(255,255,255,.2);text-align:center;'
        + `margin-bottom:4px;">${opts.roundLabel}</div>`
      : '';
    return `<div class="mslot"><div>${lbl}${card(byNum[num] || null, opts)}</div></div>`;
  }

  function buildR16Group(r16node, isFirst) {
    const [a, b] = r16node.r32;
    const r32L = isFirst ? 'Round of 32' : '';
    const r16L = isFirst ? 'Round of 16' : '';
    if (direction === 'right') {
      return `<div style="display:flex;align-items:stretch;flex:1;">
  <div style="display:flex;flex-direction:column;flex:0 0 auto;">
    ${matchCell(a, { roundLabel: r32L })}
    ${matchCell(b)}
  </div>
  <div style="flex:0 0 32px;display:flex;flex-direction:column;">
    <div class="conn-pair ${dir}" style="flex:1;"></div>
  </div>
  <div style="display:flex;flex-direction:column;flex:0 0 auto;justify-content:center;">
    ${matchCell(r16node.num, { roundLabel: r16L })}
  </div>
</div>`;
    }
    return `<div style="display:flex;align-items:stretch;flex:1;">
  <div style="display:flex;flex-direction:column;flex:0 0 auto;justify-content:center;">
    ${matchCell(r16node.num, { roundLabel: r16L })}
  </div>
  <div style="flex:0 0 32px;display:flex;flex-direction:column;">
    <div class="conn-pair ${dir}" style="flex:1;"></div>
  </div>
  <div style="display:flex;flex-direction:column;flex:0 0 auto;">
    ${matchCell(a, { roundLabel: r32L })}
    ${matchCell(b)}
  </div>
</div>`;
  }

  function buildQFGroup(qfnode, isFirst) {
    const [r16a, r16b] = qfnode.r16;
    const qfL = isFirst ? 'Quarter-Finals' : '';
    if (direction === 'right') {
      return `<div style="display:flex;align-items:stretch;flex:1;">
  <div style="display:flex;flex-direction:column;flex:1 1 0;">
    ${buildR16Group(r16a, isFirst)}
    ${buildR16Group(r16b)}
  </div>
  <div style="flex:0 0 32px;display:flex;flex-direction:column;">
    <div class="conn-pair ${dir}" style="flex:1;"></div>
  </div>
  <div style="display:flex;flex-direction:column;flex:0 0 auto;justify-content:center;">
    ${matchCell(qfnode.num, { roundLabel: qfL })}
  </div>
</div>`;
    }
    return `<div style="display:flex;align-items:stretch;flex:1;">
  <div style="display:flex;flex-direction:column;flex:0 0 auto;justify-content:center;">
    ${matchCell(qfnode.num, { roundLabel: qfL })}
  </div>
  <div style="flex:0 0 32px;display:flex;flex-direction:column;">
    <div class="conn-pair ${dir}" style="flex:1;"></div>
  </div>
  <div style="display:flex;flex-direction:column;flex:1 1 0;">
    ${buildR16Group(r16a, isFirst)}
    ${buildR16Group(r16b)}
  </div>
</div>`;
  }

  const [qf1, qf2] = tree.qf;
  if (direction === 'right') {
    return `<div style="display:flex;align-items:stretch;flex:1;">
  <div style="display:flex;flex-direction:column;flex:1 1 0;">
    ${buildQFGroup(qf1, true)}
    ${buildQFGroup(qf2)}
  </div>
  <div style="flex:0 0 32px;display:flex;flex-direction:column;">
    <div class="conn-pair ${dir}" style="flex:1;"></div>
  </div>
  <div style="display:flex;flex-direction:column;flex:0 0 auto;justify-content:center;">
    ${matchCell(tree.sf, { roundLabel: 'Semi-Finals' })}
  </div>
</div>`;
  }
  return `<div style="display:flex;align-items:stretch;flex:1;">
  <div style="display:flex;flex-direction:column;flex:0 0 auto;justify-content:center;">
    ${matchCell(tree.sf, { roundLabel: 'Semi-Finals' })}
  </div>
  <div style="flex:0 0 32px;display:flex;flex-direction:column;">
    <div class="conn-pair ${dir}" style="flex:1;"></div>
  </div>
  <div style="display:flex;flex-direction:column;flex:1 1 0;">
    ${buildQFGroup(qf1, true)}
    ${buildQFGroup(qf2)}
  </div>
</div>`;
}

function buildFinalCol() {
  return `<div style="display:flex;flex-direction:column;align-items:center;
    justify-content:center;flex:0 0 auto;gap:24px;padding:0 4px;">
  <div>
    <div class="rhdr gold">Final</div>
    ${card(byNum[FINAL_NUM] || null, { isFinal: true })}
  </div>
  <div>
    <div class="rhdr">3rd Place</div>
    ${card(byNum[THIRD_NUM] || null, { isThird: true })}
  </div>
</div>`;
}

/* ══════ RENDER ══════ */
function renderAll() {
  const order = [];
  for (let i = 73; i <= 88; i++) order.push(i);
  for (let i = 89; i <= 96; i++) order.push(i);
  for (let i = 97; i <= 100; i++) order.push(i);
  order.push(101, 102, 103, 104);

  order.forEach(num => {
    if (byNum[num]) propagateWinner(num);
  });

  buildView(document.getElementById('vFull'), 'full');
  buildView(document.getElementById('vLeft'), 'left');
  buildView(document.getElementById('vRight'), 'right');
}

function buildView(container, mode) {
  let html = '<div class="bracket-scroll">';
  html += '<div style="display:flex;align-items:stretch;min-height:820px;">';

  const connR = `<div style="flex:0 0 32px;display:flex;flex-direction:column;">
    <div class="conn-pair dir-r single" style="flex:1;"></div>
  </div>`;
  const connL = `<div style="flex:0 0 32px;display:flex;flex-direction:column;">
    <div class="conn-pair dir-l single" style="flex:1;"></div>
  </div>`;

  if (mode === 'full') {
    html += buildHalf(LEFT, 'right');
    html += connR;
    html += buildFinalCol();
    html += connL;
    html += buildHalf(RIGHT, 'left');
  } else if (mode === 'left') {
    html += buildHalf(LEFT, 'right');
    html += connR;
    html += `<div style="display:flex;flex-direction:column;align-items:center;
      justify-content:center;flex:0 0 auto;padding:0 4px;">
      <div><div class="rhdr gold">Final</div>
      ${card(byNum[FINAL_NUM] || null, { isFinal: true })}</div>
    </div>`;
  } else {
    html += `<div style="display:flex;flex-direction:column;align-items:center;
      justify-content:center;flex:0 0 auto;padding:0 4px;">
      <div><div class="rhdr gold">Final</div>
      ${card(byNum[FINAL_NUM] || null, { isFinal: true })}</div>
    </div>`;
    html += connL;
    html += buildHalf(RIGHT, 'left');
  }

  html += '</div></div>';
  container.innerHTML = html;
}

/* ══════ MODAL ══════ */
let modalMatchNum = null;

function openModal(num) {
  const m = byNum[num];
  if (!m || !canEdit(m)) return;
  modalMatchNum = num;

  document.getElementById('modalLabel').textContent =
    `Match #${num} · ${getRoundName(num)}`;
  document.getElementById('mn1').textContent = m.team1;
  document.getElementById('mn2').textContent = m.team2;

  const f1 = flg(m.team1);
  const f2 = flg(m.team2);
  const img1 = document.getElementById('mf1');
  const img2 = document.getElementById('mf2');
  img1.src = f1; img1.style.display = f1 ? '' : 'none';
  img2.src = f2; img2.style.display = f2 ? '' : 'none';

  const ft = m.score && m.score.ft;
  const et = m.score && m.score.et;
  if (et) {
    document.getElementById('ms1').value = et[0];
    document.getElementById('ms2').value = et[1];
  } else if (ft) {
    document.getElementById('ms1').value = ft[0];
    document.getElementById('ms2').value = ft[1];
  } else {
    document.getElementById('ms1').value = 0;
    document.getElementById('ms2').value = 0;
  }

  document.getElementById('btnClear').style.display =
    m._manual ? '' : 'none';
  document.getElementById('modal').classList.add('open');
  setTimeout(() => document.getElementById('ms1').focus(), 100);
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  modalMatchNum = null;
}

function saveScore() {
  if (modalMatchNum === null) return;
  const s1 = parseInt(document.getElementById('ms1').value) || 0;
  const s2 = parseInt(document.getElementById('ms2').value) || 0;
  const m = byNum[modalMatchNum];
  if (!m) return;

  if (!m.score || !m.score.ft
    || m.score.ft[0] !== s1 || m.score.ft[1] !== s2) {
    m.score = { ft: [s1, s2] };
    m._manual = true;
    manualScores[modalMatchNum] = { s1, s2 };
  }

  propagateWinner(modalMatchNum);
  renderAll();
  closeModal();
}

function clearScore() {
  if (modalMatchNum === null) return;
  const m = byNum[modalMatchNum];
  if (!m) return;

  m.score = null;
  m._manual = false;
  delete manualScores[modalMatchNum];
  clearDownstream(modalMatchNum);
  renderAll();
  closeModal();
}

/* ══════ TABS ══════ */
document.querySelectorAll('.tab').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    document.querySelectorAll('.bv').forEach(x => x.classList.add('hidden'));
    const id = b.dataset.v === 'full'
      ? 'vFull' : (b.dataset.v === 'left' ? 'vLeft' : 'vRight');
    document.getElementById(id).classList.remove('hidden');
  });
});

/* ══════ KEYBOARD ══════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter' && modalMatchNum !== null) saveScore();
});

/* ══════ LOAD ══════ */
async function load() {
  const ld = document.getElementById('ld');
  const er = document.getElementById('err');
  const ar = document.getElementById('area');
  ld.classList.remove('hidden');
  er.classList.add('hidden');
  ar.classList.add('hidden');

  try {
    const r = await fetch(DATA_URL);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();

    const koRounds = new Set([
      'Round of 32', 'Round of 16',
      'Quarter-final', 'Quarterfinals',
      'Semi-final', 'Semifinals',
      'Third Place', 'Match for third place',
      'Final',
    ]);

    byNum = {};
    for (let i = 73; i <= 104; i++) ensureMatch(i);

    data.matches.forEach(m => {
      if (koRounds.has(m.round) && m.num) {
        byNum[m.num] = { ...byNum[m.num], ...m, _manual: false };
      }
    });

    Object.entries(manualScores).forEach(([num, sc]) => {
      const n = parseInt(num);
      if (byNum[n]) {
        byNum[n].score = { ft: [sc.s1, sc.s2] };
        byNum[n]._manual = true;
      }
    });

    renderAll();
    ld.classList.add('hidden');
    ar.classList.remove('hidden');
  } catch (e) {
    ld.classList.add('hidden');
    er.classList.remove('hidden');
    document.getElementById('errmsg').textContent = e.message;
  }
}

load();
