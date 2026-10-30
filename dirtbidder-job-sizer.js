// "Job sizer": simple fill-in-the-blanks forms with a picture for the most common jobs (pond, field tile,
// driveway / road, building pad, ditch cleaning, storm shelter install, quarry overburden stripping). The client types a few measurements and picks answers; the page
// works out the dirt (or gravel) and writes a clean summary that goes at the top of the job description.
// Used by dirtbidder-post-job.html: JobSizer.render(jobTypeName), JobSizer.summary(), JobSizer.title().
(function () {
  const AMBER = '#E8892A', DUST = '#C4A882', STONE = '#8C7B6B', WATER = 'rgba(52,152,219,0.35)';
  const n = v => { const x = parseFloat(String(v || '').replace(/[^0-9.]/g, '')); return isFinite(x) && x > 0 ? x : 0; };
  const fmt = x => Math.round(x).toLocaleString('en-US');
  const ft = x => fmt(x) + ' ft';

  // Pictures (plain SVG, labelled so they read without color)
  const arrowDefs = `<defs><marker id="jsA" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${AMBER}"/></marker></defs>`;
  const dim = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${AMBER}" stroke-width="2" marker-start="url(#jsA)" marker-end="url(#jsA)"/>`;
  const txt = (x, y, t, anchor = 'middle') => `<text x="${x}" y="${y}" fill="${AMBER}" font-size="13" font-weight="700" text-anchor="${anchor}" font-family="Barlow, sans-serif">${t}</text>`;
  const small = (x, y, t, anchor = 'middle') => `<text x="${x}" y="${y}" fill="${STONE}" font-size="11" text-anchor="${anchor}" font-family="Barlow, sans-serif">${t}</text>`;
  const svg = (inner, h = 150) => `<svg viewBox="0 0 320 ${h}" width="100%" role="img" aria-hidden="true" style="max-width:420px;display:block;margin:0 auto 0.75rem">${arrowDefs}${inner}</svg>`;

  const PICS = {
    pond: svg(
      small(85, 14, 'FROM ABOVE') +
      `<ellipse cx="85" cy="78" rx="62" ry="40" fill="${WATER}" stroke="${DUST}" stroke-width="2"/>` +
      dim(23, 132, 147, 132) + txt(85, 148, 'LENGTH') +
      dim(160, 38, 160, 118) + txt(166, 82, 'WIDTH', 'start') +
      small(255, 14, 'FROM THE SIDE') +
      `<path d="M205,50 L225,50 L245,110 L265,110 L285,50 L305,50" fill="none" stroke="${DUST}" stroke-width="2"/>` +
      `<path d="M225,50 L245,110 L265,110 L285,50 Z" fill="${WATER}"/>` +
      dim(255, 54, 255, 106) + txt(255, 130, 'DEPTH'), 155),
    tile: svg(
      `<rect x="10" y="20" width="300" height="38" fill="rgba(196,168,130,0.10)" stroke="${STONE}" stroke-dasharray="4 3"/>` + small(160, 14, 'FIELD (FROM ABOVE)') +
      `<line x1="20" y1="39" x2="300" y2="39" stroke="${DUST}" stroke-width="4"/>` +
      dim(20, 72, 300, 72) + txt(160, 90, 'FEET OF TILE') +
      small(70, 112, 'FROM THE SIDE') +
      `<line x1="10" y1="122" x2="150" y2="122" stroke="${DUST}" stroke-width="2"/><circle cx="80" cy="148" r="6" fill="none" stroke="${DUST}" stroke-width="3"/>` +
      dim(110, 124, 110, 146) + txt(118, 140, 'DEPTH', 'start') + txt(240, 140, 'TILE SIZE (INCHES)', 'middle'), 160),
    driveway: svg(
      small(160, 14, 'FROM ABOVE') +
      `<path d="M20,95 C90,95 120,40 200,40 L300,40 L300,72 L200,72 C140,72 110,127 20,127 Z" fill="rgba(196,168,130,0.18)" stroke="${DUST}" stroke-width="2"/>` +
      dim(20, 140, 300, 140) + txt(160, 156, 'LENGTH') +
      dim(312, 40, 312, 72) + txt(306, 30, 'WIDTH', 'end'), 160),
    pad: svg(
      small(85, 14, 'FROM ABOVE') +
      `<rect x="25" y="28" width="120" height="80" fill="rgba(196,168,130,0.18)" stroke="${DUST}" stroke-width="2"/>` +
      dim(25, 122, 145, 122) + txt(85, 140, 'LENGTH') + dim(158, 28, 158, 108) + txt(164, 72, 'WIDTH', 'start') +
      small(255, 14, 'FROM THE SIDE') +
      `<line x1="200" y1="110" x2="310" y2="110" stroke="${STONE}" stroke-width="2"/><path d="M210,110 L225,80 L285,80 L300,110 Z" fill="rgba(196,168,130,0.25)" stroke="${DUST}" stroke-width="2"/>` +
      dim(255, 82, 255, 108) + txt(255, 132, 'HOW HIGH'), 150),
    ditch: svg(
      small(160, 14, 'FROM THE SIDE (LOOKING DOWN THE DITCH)') +
      `<path d="M30,40 L110,40 L140,100 L180,100 L210,40 L290,40" fill="none" stroke="${DUST}" stroke-width="2"/>` +
      `<path d="M125,70 L195,70 L180,100 L140,100 Z" fill="rgba(139,94,60,0.55)"/>` + small(160, 92, 'silt') +
      dim(110, 30, 210, 30) + txt(160, 24, 'WIDTH AT TOP') +
      dim(222, 72, 222, 100) + txt(228, 90, 'SILT TO DIG OUT', 'start') +
      small(160, 128, 'Also tell us how many feet of ditch'), 135),
    shelter: svg(
      small(160, 14, 'FROM THE SIDE') +
      `<line x1="10" y1="40" x2="310" y2="40" stroke="${STONE}" stroke-width="2"/>` + small(40, 34, 'ground') +
      `<path d="M95,40 L95,128 L225,128 L225,40" fill="rgba(139,94,60,0.25)" stroke="${DUST}" stroke-width="2" stroke-dasharray="5 3"/>` +
      `<rect x="96" y="118" width="128" height="10" fill="rgba(168,152,135,0.6)"/>` + small(260, 126, '← gravel base', 'start') +
      `<rect x="120" y="28" width="80" height="90" rx="10" fill="rgba(232,137,42,0.18)" stroke="${AMBER}" stroke-width="2"/>` + small(160, 78, 'SHELTER') +
      dim(120, 142, 200, 142) + txt(160, 158, 'LENGTH') +
      dim(212, 28, 212, 118) + txt(240, 76, 'HEIGHT', 'start') +
      small(70, 90, '2 ft room', 'middle') + small(70, 102, 'each side', 'middle'), 165),
    strip: svg(
      small(160, 14, 'FROM THE SIDE: DIRT ON TOP OF THE ROCK') +
      // rock below, dirt layer on top, cut edge stepped back in benches with a slope
      `<path d="M10,110 L310,110 L310,150 L10,150 Z" fill="rgba(168,152,135,0.35)" stroke="${STONE}" stroke-width="1.5"/>` + small(200, 136, 'LIMESTONE / GYPSUM / ROCK') +
      `<path d="M150,40 L310,40 L310,110 L208,110 L196,85 L182,85 L170,60 L160,60 Z" fill="rgba(139,94,60,0.55)" stroke="${DUST}" stroke-width="2"/>` +
      `<line x1="10" y1="110" x2="150" y2="110" stroke="${DUST}" stroke-width="2" stroke-dasharray="5 3"/>` + small(80, 104, 'stripped, rock showing') +
      dim(300, 44, 300, 106) + txt(294, 80, 'DEPTH', 'end') +
      small(162, 56, 'slope', 'end') + small(186, 82, 'bench', 'end') +
      dim(12, 32, 148, 32) + txt(80, 52, 'AREA TO STRIP'), 155)
  };

  const choice = (id, label, opts) => ({ id, label, type: 'select', opts });
  const num = (id, label, hint, unit = 'ft') => ({ id, label, type: 'num', hint, unit });

  const GUIDES = {
    pond: {
      types: ['Pond Digging'], name: 'pond', pic: 'pond',
      tip: 'Not sure of the size? Pace it off. One big step is about 3 feet.',
      fields: [
        num('len', 'Length', 'e.g. 150'), num('wid', 'Width', 'e.g. 100'), num('dep', 'Deepest point', 'e.g. 10'),
        choice('shape', 'Shape', ['Round or oval', 'Square or rectangle', 'Odd shape']),
        choice('kind', 'New pond or clean out an old one?', ['New pond', 'Clean out / make an old pond deeper', 'Fix a dam or bank']),
        choice('water', 'Water in it now?', ['Dry', 'Some water', 'Full of water', 'No pond yet']),
        choice('dirt', 'Where should the dirt go?', ['Spread it nearby', 'Use it to build a dam or bank', 'Haul it off', 'Not sure']),
        choice('access', 'Can a truck get to it?', ['Yes, easy', 'Soft or wet ground', 'Not sure']),
        choice('trees', 'Trees or brush to clear?', ['None', 'A few', 'A lot'])
      ],
      calc: v => {
        const area = v.shape === 'Square or rectangle' ? v.len * v.wid : Math.PI / 4 * v.len * v.wid;
        if (!area || !v.dep) return null;
        const cy = area * v.dep * 0.5 / 27; // sloped sides: about half of a straight-walled box
        return { line: `About ${fmt(cy)} cubic yards of dirt to move`, sub: `About ${(area / 43560).toFixed(2)} acres of water surface`, cy };
      },
      title: v => v.len && v.wid ? `Pond, ${fmt(v.len)} x ${fmt(v.wid)} ft${v.dep ? ', ' + fmt(v.dep) + ' ft deep' : ''}` : 'Pond'
    },
    tile: {
      types: ['Field Tile'], name: 'field tile', pic: 'tile',
      tip: 'Not sure how many feet? A quarter mile is about 1,320 feet. Most field tile is 3 to 4 feet deep.',
      fields: [
        num('len', 'Feet of tile', 'e.g. 1,320'), num('dep', 'How deep', 'e.g. 4'),
        choice('size', 'Tile size', ['4 inch', '5 inch', '6 inch', '8 inch', '10 inch or bigger', 'Not sure']),
        choice('kind', 'What needs done?', ['New tile lines', 'Fix a broken tile or blowout', 'Replace an old line', 'Not sure, needs a look']),
        choice('outlet', 'Where does it drain to?', ['A ditch or creek', 'A bigger main tile', 'Not sure']),
        choice('crop', 'Crop in the field right now?', ['No', 'Yes', 'Pasture or hay'])
      ],
      calc: v => v.len ? { line: `${fmt(v.len)} feet of tile (about ${(v.len / 5280).toFixed(2)} miles)` } : null,
      title: v => v.len ? `Field tile, ${fmt(v.len)} ft` : 'Field tile'
    },
    driveway: {
      types: ['Road Building'], name: 'driveway or road', pic: 'driveway',
      tip: 'Most farm driveways are 12 to 16 feet wide. Pace off the length: one big step is about 3 feet.',
      fields: [
        num('len', 'Length', 'e.g. 300'), num('wid', 'Width', 'e.g. 14'),
        choice('kind', 'New or fix an old one?', ['New driveway or road', 'Fix or regrade an old one', 'Widen it']),
        choice('gravel', 'Gravel?', ['Yes, the operator brings it', 'Yes, I’ll get it myself', 'No gravel, dirt only', 'Not sure']),
        choice('culvert', 'Need a culvert (pipe under it)?', ['No', 'Yes', 'Not sure']),
        choice('access', 'Can a truck get to it?', ['Yes, easy', 'Soft or wet ground', 'Not sure'])
      ],
      calc: v => {
        if (!v.len || !v.wid) return null;
        const cy = v.len * v.wid * (4 / 12) / 27;
        return { line: `${fmt(v.len * v.wid)} square feet`, sub: v.gravel && v.gravel.startsWith('No') ? '' : `About ${fmt(cy * 1.4)} tons of gravel at 4 inches deep` };
      },
      title: v => v.len ? `Driveway, ${fmt(v.len)} ft long` : 'Driveway'
    },
    pad: {
      types: ['Foundation Prep'], name: 'building pad', pic: 'pad',
      tip: 'Make the pad a few feet bigger than the building on every side. “How high” is how much higher than the ground it is now.',
      fields: [
        num('len', 'Length', 'e.g. 60'), num('wid', 'Width', 'e.g. 40'), num('hi', 'How high to build it up', 'e.g. 2'),
        choice('use', 'What’s it for?', ['House', 'Garage or shop', 'Machine shed or barn', 'Grain bins', 'Other']),
        choice('ground', 'Ground there now', ['Flat', 'Slopes', 'Low or wet spots', 'Trees or brush']),
        choice('fill', 'Dirt for the pad', ['Use dirt from my place', 'Bring in fill dirt', 'Not sure'])
      ],
      calc: v => {
        if (!v.len || !v.wid) return null;
        if (!v.hi) return { line: `${fmt(v.len * v.wid)} square foot pad` };
        const cy = v.len * v.wid * v.hi / 27;
        return { line: `About ${fmt(cy)} cubic yards of fill`, sub: `Plus about 20 to 30% more for packing it down (${fmt(cy * 1.25)} cubic yards)`, cy };
      },
      title: v => v.len && v.wid ? `Building pad, ${fmt(v.len)} x ${fmt(v.wid)} ft` : 'Building pad'
    },
    ditch: {
      types: ['Drainage Work'], name: 'ditch or drainage job', pic: 'ditch',
      tip: 'Not sure? Pace off the length (one big step is about 3 feet) and guess the silt in inches.',
      fields: [
        num('len', 'Feet of ditch', 'e.g. 800'), num('wid', 'Width at top', 'e.g. 12'), num('silt', 'Silt to dig out', 'e.g. 18', 'in'),
        choice('kind', 'What kind?', ['Road ditch', 'Field ditch', 'Grass waterway', 'Other']),
        choice('water', 'Water in it now?', ['Dry', 'A little', 'Running water']),
        choice('dirt', 'Where should the dirt go?', ['Spread it on the field', 'Haul it off', 'Not sure'])
      ],
      calc: v => {
        if (!v.len) return null;
        if (!v.wid || !v.silt) return { line: `${fmt(v.len)} feet of ditch` };
        const cy = v.len * v.wid * 0.5 * (v.silt / 12) / 27;
        return { line: `About ${fmt(cy)} cubic yards of silt to dig out`, sub: `${fmt(v.len)} feet of ditch`, cy };
      },
      title: v => v.len ? `Ditch cleaning, ${fmt(v.len)} ft` : 'Ditch cleaning'
    },
    shelter: {
      types: ['Storm Shelter Install'], name: 'storm shelter install', pic: 'shelter',
      tip: 'Pick your shelter size and the measurements fill in. The hole is figured with 2 feet of working room on every side and a 6-inch gravel base.',
      // Fill these in with the real outside measurements (feet) of each model; picking a size then fills the boxes
      presets: { 'Small': null, 'Medium': null, 'Large': null },
      fields: [
        choice('size', 'Shelter size', ['Small', 'Medium', 'Large', 'Other']),
        num('len', 'Shelter length', 'e.g. 10'), num('wid', 'Shelter width', 'e.g. 6'), num('hi', 'Shelter height', 'e.g. 7'),
        num('above', 'Above ground (0 if buried)', 'e.g. 0'),
        choice('set', 'Who sets the shelter in the hole?', ['We deliver and set it', 'Installer sets it with his machine', 'Needs a crane or boom truck', 'Not sure']),
        choice('anchor', 'Anchoring', ['None needed', 'Ground anchors', 'Concrete (deadmen or poured)', 'Comes with the shelter, installer puts it in']),
        choice('backfill', 'Backfill with', ['The dirt that was dug out', 'Gravel or sand', 'Not sure']),
        choice('dirt', 'Extra dirt', ['Spread it on site', 'Haul it off', 'Not sure']),
        choice('soil', 'Soil there', ['Clay', 'Sand', 'Rocky', 'Wet or high water table', 'Not sure']),
        choice('access', 'Can a machine get to the spot?', ['Yes, open yard', 'Through a gate (put the width in the description)', 'Tight, small machine only', 'Not sure'])
      ],
      calc: v => {
        if (!v.len || !v.wid || !v.hi) return null;
        const above = Math.min(v.above || 0, v.hi);
        const buried = v.hi - above, base = 0.5;
        const hl = v.len + 4, hw = v.wid + 4, hd = buried + base;
        const dig = hl * hw * hd / 27;
        const shelterCy = v.len * v.wid * buried / 27, gravel = hl * hw * base / 27;
        const fillAll = v.backfill === 'Gravel or sand';
        const extra = fillAll ? dig : shelterCy + gravel;
        const backfillCy = dig - shelterCy - gravel;
        return {
          line: `Hole about ${fmt(hl)} x ${fmt(hw)} ft, ${(Math.round(hd * 2) / 2).toString()} ft deep: about ${fmt(dig)} cubic yards to dig`,
          sub: `About ${fmt(extra)} cubic yards of extra dirt (${fmt(extra * 1.25)} once dug loose)` +
            ` · about ${fmt(Math.max(1, gravel * 1.4))} tons of gravel for the base` +
            (fillAll ? ` · about ${fmt(backfillCy * 1.4)} tons of gravel or sand to backfill` : ''),
          cy: dig
        };
      },
      title: v => `Storm shelter install${v.size && v.size !== 'Other' ? ' (' + v.size.toLowerCase() + ')' : ''}${v.len && v.wid && v.hi ? ', ' + fmt(v.len) + ' x ' + fmt(v.wid) + ' x ' + fmt(v.hi) + ' ft' : ''}`
    },
    strip: {
      types: ['Overburden Stripping'], name: 'stripping job', pic: 'strip',
      tip: 'Depth is how much dirt sits on top of the rock, on average. If the depth changes a lot, put the average here and the shallow and deep spots in the description.',
      fields: [
        num('len', 'Length to strip', 'e.g. 600'), num('wid', 'Width to strip', 'e.g. 300'), num('dep', 'Average dirt depth over the rock', 'e.g. 15'),
        choice('rock', 'What’s under the dirt?', ['Limestone', 'Gypsum', 'Sand and gravel', 'Coal', 'Other rock', 'Not sure']),
        choice('dirt', 'What kind of dirt?', ['Clay', 'Topsoil and clay', 'Sand or gravel', 'Clay with rocks or boulders', 'Mixed or not sure']),
        choice('slope', 'Slope on the edges of the cut', ['1 to 1', '1.5 to 1', '2 to 1', '3 to 1', 'Straight down, no slope', 'Not sure']),
        num('bench', 'How many benches (0 if none)', 'e.g. 4', 'count'),
        num('bwid', 'Bench width', 'e.g. 20'),
        choice('topsoil', 'Save the topsoil in its own pile?', ['Yes, keep it separate', 'No, it all goes together', 'Not sure']),
        choice('where', 'Where does the dirt go?', ['Stockpile on site', 'Build a berm', 'Backfill a mined-out area', 'Haul it off site', 'Not sure']),
        num('haul', 'About how far to haul it', 'e.g. 1,500'),
        choice('trees', 'Trees or brush to clear first?', ['None', 'A few', 'A lot']),
        choice('water', 'Water or wet ground?', ['Dry', 'Some wet spots', 'Needs pumping', 'Not sure'])
      ],
      calc: v => {
        if (!v.len || !v.wid || !v.dep) return v.len && v.wid ? { line: `${(v.len * v.wid / 43560).toFixed(2)} acres to strip` } : null;
        const ratio = { '1 to 1': 1, '1.5 to 1': 1.5, '2 to 1': 2, '3 to 1': 3 }[v.slope] || 0;
        const benches = Math.min(Math.round(v.bench || 0), 50);
        const edge = 2 * (v.len + v.wid);
        // Main block, plus the wedge the sloped edges add, plus the shelf each bench cuts back
        const cy = (v.len * v.wid * v.dep + edge * v.dep * v.dep * ratio / 2 + edge * benches * (v.bwid || 0) * v.dep / 2) / 27;
        const note = v.bwid && !benches ? ' · bench width not counted: add how many benches' : '';
        return {
          line: `About ${fmt(cy)} cubic yards of dirt to strip`,
          sub: `${(v.len * v.wid / 43560).toFixed(2)} acres of rock uncovered · about ${fmt(cy * 1.25)} cubic yards once it’s dug loose · about ${fmt(cy * 1.25 / 20)} truckloads (20-yard loads)${note}`,
          cy
        };
      },
      title: v => v.len && v.wid ? `Overburden stripping, ${(v.len * v.wid / 43560).toFixed(1)} acres${v.dep ? ', ' + fmt(v.dep) + ' ft deep' : ''}${v.rock && !/Not sure|Other/.test(v.rock) ? ' (' + v.rock.toLowerCase() + ')' : ''}` : 'Overburden stripping'
    }
  };

  let current = null;
  const guideFor = type => Object.values(GUIDES).find(g => g.types.includes(type)) || null;

  function values() {
    const v = {};
    if (!current) return v;
    current.fields.forEach(f => {
      const el = document.getElementById('js_' + f.id);
      v[f.id] = el ? (f.type === 'num' ? n(el.value) : el.value) : '';
    });
    return v;
  }

  function update() {
    const out = document.getElementById('jsResult');
    if (!out || !current) return;
    const r = current.calc(values());
    out.innerHTML = r
      ? `<div style="font-size:1.05rem;color:var(--chalk);font-weight:700">📏 ${r.line}</div>${r.sub ? `<div style="font-size:0.85rem;color:var(--dust);margin-top:0.2rem">${r.sub}</div>` : ''}<div style="font-size:0.75rem;color:var(--stone);margin-top:0.3rem">A rough guide for operators, not a quote. They’ll check it.</div>`
      : `<div style="font-size:0.85rem;color:var(--stone)">Fill in the measurements and we’ll figure out the dirt for you.</div>`;
  }

  function render(type) {
    const box = document.getElementById('jobSizer');
    if (!box) return;
    current = guideFor(type);
    if (!current) { box.style.display = 'none'; box.innerHTML = ''; return; }
    const fieldHtml = current.fields.map(f => f.type === 'num'
      ? `<div class="field"><label for="js_${f.id}">${f.label}${f.unit === 'count' ? '' : f.unit === 'in' ? ' (inches)' : ' (feet)'}</label><input type="text" inputmode="decimal" id="js_${f.id}" placeholder="${f.hint}" autocomplete="off"></div>`
      : `<div class="field"><label for="js_${f.id}">${f.label}</label><select id="js_${f.id}"><option value="">Pick one…</option>${f.opts.map(o => `<option>${o}</option>`).join('')}</select></div>`).join('');
    box.innerHTML = `<div class="form-card-title" role="heading" aria-level="2">Size Up Your ${current.name.replace(/\b\w/g, c => c.toUpperCase())} <span style="font-weight:600;color:var(--stone);text-transform:none;letter-spacing:0">(optional, gets better bids)</span></div>
      ${PICS[current.pic]}
      <div style="font-size:0.85rem;color:var(--dust);margin-bottom:1rem">💡 ${current.tip}</div>
      <div class="js-grid">${fieldHtml}</div>
      <div id="jsResult" aria-live="polite" style="margin-top:1rem;padding:0.85rem 1rem;border-left:3px solid var(--amber);background:rgba(232,137,42,0.07);border-radius:3px"></div>`;
    box.style.display = '';
    box.querySelectorAll('input,select').forEach(el => el.addEventListener('input', update));
    box.querySelectorAll('select').forEach(el => el.addEventListener('change', update));
    const sizeEl = document.getElementById('js_size');
    if (sizeEl && current.presets) sizeEl.addEventListener('change', () => {
      const p = current.presets[sizeEl.value];
      if (!p) return;
      ['len', 'wid', 'hi'].forEach(k => { const el = document.getElementById('js_' + k); if (el && p[k]) el.value = p[k]; });
      update();
    });
    update();
  }

  // The lines that go at the top of the description (empty if nothing was filled in)
  function summary() {
    if (!current) return '';
    const v = values();
    const lines = [];
    current.fields.forEach(f => {
      const val = v[f.id];
      if (!val) return;
      lines.push(f.type === 'num' ? `${f.label.replace(/ \(0 if none\)$/, '')}: ${fmt(val)}${f.unit === 'count' ? '' : f.unit === 'in' ? ' inches' : ' feet'}` : `${f.label.replace(/\?$/, '')}: ${val}`);
    });
    if (!lines.length) return '';
    const r = current.calc(v);
    if (r) { lines.push('Estimate: ' + r.line + (r.sub ? ' (' + r.sub + ')' : '') + '. Rough guide only.'); }
    return `${current.name.toUpperCase()} DETAILS\n` + lines.map(l => '• ' + l).join('\n');
  }

  function title() { return current ? current.title(values()) : ''; }

  window.JobSizer = { render, summary, title, guideFor };
})();
