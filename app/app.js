// Leonida Trophy Guide: loads the 55 trophies, renders the checklist, roadmap
// progress and filters, and saves earned trophies + settings in localStorage.
// The app fetches only its own data/trophies.json and loads nothing else.
const EARNED_KEY = 'leonida-trophy-earned-v1';
const SETTINGS_KEY = 'leonida-trophy-settings-v1';
const KINDS = ['all', 'story', 'missable', 'collectibles', 'activities', 'online'];
const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

// --- Saved state -----------------------------------------------------------
function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    return new Set(raw.filter((id) => byId.has(id)));
  } catch {
    return new Set();
  }
}
function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') ?? {};
  } catch {
    return {};
  }
}
let earned = loadEarned();
const savedSettings = loadSettings();
const settings = {
  spoiler: params.get('spoiler') === 'off' ? false : params.get('spoiler') === 'on' ? true : (savedSettings.spoiler ?? true),
  hideEarned: savedSettings.hideEarned ?? false,
  kind: KINDS.includes(params.get('kind') ?? '') ? params.get('kind') : (savedSettings.kind ?? 'all'),
  grade: savedSettings.grade ?? 'all',
  search: '',
};
// A ?earn=1,14,15 deep link seeds the checklist (fresh browser, used for screenshots).
if (params.get('earn')) {
  const seeded = params.get('earn').split(',').map(Number).filter((id) => byId.has(id));
  if (seeded.length && earned.size === 0) earned = new Set(seeded);
}
let openId = params.get('open') ? Number(params.get('open')) : null;
if (openId && !byId.has(openId)) openId = null;

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}
function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ spoiler: settings.spoiler, hideEarned: settings.hideEarned, kind: settings.kind, grade: settings.grade }));
}

// --- DOM handles -----------------------------------------------------------
const listEl = document.getElementById('trophyList');
const listMeta = document.getElementById('listMeta');
const listEmpty = document.getElementById('listEmpty');
const onlineNote = document.getElementById('onlineNote');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const hideEarnedEl = document.getElementById('hideEarned');

spoilerEl.checked = settings.spoiler;
hideEarnedEl.checked = settings.hideEarned;
gradeEl.value = settings.grade;
searchEl.value = settings.search;

// Kind counts on the filter buttons (online has no trophies: all 55 are single-player).
for (const kind of KINDS) {
  const el = document.getElementById('count' + kind[0].toUpperCase() + kind.slice(1));
  if (el) el.textContent = kind === 'all' ? `(${trophies.length})` : kind === 'online' ? '(0)' : `(${trophies.filter((t) => t.kind === kind).length})`;
}
document.getElementById('sourceList').replaceChildren(
  ...doc.sources.map((s) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.name;
    a.rel = 'noopener';
    li.append(a);
    return li;
  }),
);

// --- Progress ---------------------------------------------------------------
function renderProgress() {
  const pct = Math.round((earned.size / trophies.length) * 100);
  document.getElementById('platinumPct').textContent = `${pct}%`;
  document.getElementById('progressText').textContent = `${earned.size} of ${trophies.length} earned`;
  const fill = document.getElementById('progressFill');
  fill.style.width = `${pct}%`;
  document.getElementById('progressBar').setAttribute('aria-valuenow', String(earned.size));
  const byGrade = {};
  for (const t of trophies) if (earned.has(t.id)) byGrade[t.grade] = (byGrade[t.grade] ?? 0) + 1;
  const totals = {};
  for (const t of trophies) totals[t.grade] = (totals[t.grade] ?? 0) + 1;
  document.getElementById('gradeCounts').textContent =
    ['platinum', 'gold', 'silver', 'bronze'].map((g) => `${byGrade[g] ?? 0}/${totals[g]} ${g}`).join(' · ');
}

// --- Trophy rows -------------------------------------------------------------
function trophyIsHidden(t) {
  return settings.spoiler && t.spoiler && !earned.has(t.id);
}
function trophyMatches(t) {
  if (settings.kind === 'online') return false;
  if (settings.kind !== 'all' && t.kind !== settings.kind) return false;
  if (settings.grade !== 'all' && t.grade !== settings.grade) return false;
  if (settings.hideEarned && earned.has(t.id)) return false;
  if (settings.search) {
    const q = settings.search.toLowerCase();
    const hay = `${t.name} ${t.description} ${t.guide} ${KIND_LABELS[t.kind] ?? ''}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function buildRow(t) {
  const li = document.createElement('li');
  li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
  li.dataset.id = String(t.id);
  const hidden = trophyIsHidden(t);

  const row = document.createElement('div');
  row.className = 'trophy-row';

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', hidden ? `Mark hidden story trophy ${t.id} as earned` : `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    saveEarned();
    render();
  });

  const body = document.createElement('div');
  body.className = 'trophy-body';
  if (hidden) body.classList.add('spoiler-hidden');

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const name = document.createElement('span');
  name.className = 'trophy-name';
  name.textContent = hidden ? `Hidden story trophy #${t.id}` : t.name;
  head.append(name);
  if (!hidden) {
    const grade = document.createElement('span');
    grade.className = `grade grade-${t.grade}`;
    grade.textContent = t.grade;
    head.append(grade);
    if (t.hidden) {
      const tag = document.createElement('span');
      tag.className = 'tag tag-hidden';
      tag.textContent = 'Hidden on PSN';
      head.append(tag);
    }
    if (t.missable) {
      const tag = document.createElement('span');
      tag.className = 'tag tag-missable';
      tag.textContent = '⚠ Possibly missable';
      head.append(tag);
    }
    const kind = document.createElement('span');
    kind.className = 'tag';
    kind.textContent = KIND_LABELS[t.kind] ?? t.kind;
    head.append(kind);
    if (t.chapter !== undefined) {
      const ch = document.createElement('span');
      ch.className = 'tag tag-chapter';
      ch.textContent = t.chapter === 'Final' ? 'Final mission' : `Chapter ${t.chapter}`;
      head.append(ch);
    }
    if (t.target) {
      const tg = document.createElement('span');
      tg.className = 'tag tag-target';
      tg.textContent = t.target;
      head.append(tg);
    }
  }
  body.append(head);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = hidden ? 'Hidden until earned — tick the box once you have earned it to reveal the name, description and guide.' : t.description;
  body.append(desc);

  if (!hidden) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'guide-toggle';
    toggle.setAttribute('aria-expanded', String(openId === t.id));
    toggle.textContent = openId === t.id ? 'Hide guide' : 'Show guide';
    toggle.addEventListener('click', () => {
      openId = openId === t.id ? null : t.id;
      render();
    });
    body.append(toggle);
  } else {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'Spoiler protection is on: story trophies stay hidden until earned.';
    body.append(note);
  }

  if (!hidden && openId === t.id) {
    const guide = document.createElement('div');
    guide.className = 'guide';
    const text = document.createElement('p');
    text.textContent = t.guide;
    guide.append(text);
    const source = document.createElement('p');
    source.className = 'source-line';
    source.textContent = 'Source: ';
    const link = document.createElement('a');
    link.href = t.source.url;
    link.textContent = t.source.name;
    link.rel = 'noopener';
    source.append(link);
    guide.append(source);
    body.append(guide);
  }

  row.append(box, body);
  li.append(row);
  return li;
}

function render() {
  renderProgress();
  document.querySelectorAll('#kindFilters button').forEach((b) => b.classList.toggle('active', b.dataset.kind === settings.kind));
  onlineNote.hidden = settings.kind !== 'online';
  const shown = trophies.filter(trophyMatches);
  listEl.replaceChildren(...shown.map(buildRow));
  listEmpty.hidden = shown.length > 0;
  listMeta.textContent = settings.kind === 'online'
    ? 'Showing 0 of 55 trophies.'
    : `Showing ${shown.length} of ${trophies.length} trophies · ${earned.size} earned (${Math.round((earned.size / trophies.length) * 100)}%) · ${trophies.filter((t) => t.missable && !earned.has(t.id)).length} missable trophy still to earn.`;
}

// --- Controls ----------------------------------------------------------------
document.getElementById('kindFilters').addEventListener('click', (e) => {
  const button = e.target.closest('button[data-kind]');
  if (!button) return;
  settings.kind = button.dataset.kind;
  saveSettings();
  render();
});
gradeEl.addEventListener('change', () => { settings.grade = gradeEl.value; saveSettings(); render(); });
spoilerEl.addEventListener('change', () => { settings.spoiler = spoilerEl.checked; saveSettings(); render(); });
hideEarnedEl.addEventListener('change', () => { settings.hideEarned = hideEarnedEl.checked; saveSettings(); render(); });
searchEl.addEventListener('input', () => { settings.search = searchEl.value.trim(); render(); });

// --- Export / import ---------------------------------------------------------
document.getElementById('export').addEventListener('click', () => {
  const payload = {
    app: 'gta6-trophy-guide-01',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b).map((id) => byId.get(id).name),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const byName = new Map(trophies.map((t) => [t.name, t.id]));
    const next = new Set();
    for (const name of names) if (byName.has(name)) next.add(byName.get(name));
    earned = next;
    saveEarned();
    render();
  } catch {
    listMeta.textContent = 'That file could not be imported: it is not a progress export from this guide.';
  }
  e.target.value = '';
});

render();
if (params.get('view') === 'roadmap') document.getElementById('roadmap').scrollIntoView();
if (openId) document.querySelector(`[data-id="${openId}"]`)?.scrollIntoView({ block: 'center' });
window.__guideReady = true;
