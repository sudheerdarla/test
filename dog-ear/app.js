(function () {
  var KEY = 'dogear.v1';
  var app = document.getElementById('app');
  var toastEl = document.getElementById('toast');
  var SECS_PER_PAGE = 45;

  var TONES = [
    { id: 'gentle', name: 'Gentle', sample: '"Your book misses you, softly."' },
    { id: 'passive', name: 'Passive-aggressive', sample: '"Oh, no worries. It is only chapter 3. Again."' },
    { id: 'mom', name: 'Book club mom', sample: '"We are discussing this Thursday. No pressure. Pressure."' }
  ];
  var GOALS = [
    { min: 5, title: '5 minutes', sub: 'One chapter of honesty' },
    { min: 20, title: '20 minutes', sub: 'Commute, upgraded' },
    { min: 60, title: 'An unreasonable amount', sub: 'Sleep is a rumour' }
  ];

  // ---------- state ----------
  var mem = null;
  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) { /* storage blocked */ }
    return mem;
  }
  function fresh() {
    return { onboarded: false, moods: ['cozy', 'selfhelp'], goal: 20, tone: 'passive', progress: {}, secs: {}, size: 19 };
  }
  var S = load() || fresh();
  function save() {
    mem = S;
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
  }

  var view = S.onboarded ? { name: 'home' } : { name: 'ob', step: 0 };
  var toastTimer = null;
  var nudged = false;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function dayKey(d) { return d.toISOString().slice(0, 10); }
  function today() { return dayKey(new Date()); }
  function minsToday() { return Math.floor((S.secs[today()] || 0) / 60); }
  function streak() {
    var n = 0, d = new Date();
    if (!S.secs[dayKey(d)]) d.setDate(d.getDate() - 1);
    while (S.secs[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function book(id) { return window.BOOKS.filter(function (b) { return b.id === id; })[0]; }
  function prog(id) { return S.progress[id] || { page: 0, ears: [], done: false }; }

  // ---------- views ----------
  var STACK = '<svg class="stack" viewBox="0 0 334 230" role="img" aria-label="A leaning stack of colourful books">' +
    '<rect x="30" y="170" width="270" height="44" rx="6" fill="#F6FF5C"/>' +
    '<rect x="46" y="124" width="240" height="40" rx="6" fill="#FF8FB8" transform="rotate(-3 166 144)"/>' +
    '<rect x="60" y="82" width="220" height="38" rx="6" fill="#fff" transform="rotate(2 170 101)"/>' +
    '<rect x="42" y="42" width="236" height="34" rx="6" fill="#0B1120" stroke="#F6FF5C" stroke-width="3" transform="rotate(-4 160 59)"/>' +
    '<path d="M232 8 L270 8 L270 48 L251 36 L232 48 Z" fill="#FF8FB8"/></svg>';

  function ob() {
    var s = view.step;
    if (s === 0) {
      return '<main class="screen blue"><div class="brand">Dog-Ear</div>' +
        '<h1>Your to-read pile called. It wants to be read.</h1>' + STACK +
        '<p>Short sessions, no guilt, and a dog-ear that actually remembers your page.</p>' +
        '<div class="bottom"><button class="btn lemon" data-act="step">Open the cover</button>' +
        '<button class="link" data-act="skipob">I already have an account (show-off)</button></div></main>';
    }
    if (s === 1) {
      var chips = window.MOODS.map(function (m) {
        return '<button class="chip" aria-pressed="' + (S.moods.indexOf(m.id) > -1) + '" data-act="mood" data-arg="' + m.id + '">' + esc(m.label) + '</button>';
      }).join('');
      return '<main class="screen lemon"><div class="meta"><span>1 of 3</span><span>' + S.moods.length + ' picked</span></div>' +
        '<h1>What would you ignore your emails for?</h1><p>Pick as many as you like. We will not judge. We will quietly judge.</p>' +
        '<div class="chips">' + chips + '</div>' +
        '<div class="bottom"><button class="btn ink" data-act="step">Feed me recommendations</button>' +
        '<button class="link" data-act="surprise">Surprise me (brave)</button></div></main>';
    }
    if (s === 2) {
      var opts = GOALS.map(function (g) {
        return '<button class="opt" aria-pressed="' + (S.goal === g.min) + '" data-act="goal" data-arg="' + g.min + '"><span><strong>' + g.title + '</strong>' + g.sub + '</span><b>' + g.min + '</b></button>';
      }).join('');
      return '<main class="screen pink"><div class="meta"><span>2 of 3</span></div>' +
        '<h1>How much reading are we pretending to do?</h1><p>Pick a daily goal. You can lower it later and we will pretend not to notice.</p>' +
        '<div class="list">' + opts + '</div>' +
        '<div class="bottom"><button class="link" data-act="goal" data-arg="0">No goal. I live dangerously.</button></div></main>';
    }
    var tones = TONES.map(function (t) {
      return '<button class="tone" aria-pressed="' + (S.tone === t.id) + '" data-act="tone" data-arg="' + t.id + '"><strong>' + t.name + '</strong>' + esc(t.sample) + '</button>';
    }).join('');
    return '<main class="screen dark"><div class="meta" style="color:#F6FF5C"><span>3 of 3</span></div>' +
      '<h1>We will nag. Choose your flavour.</h1><div class="list">' + tones + '</div>' +
      '<div class="bottom"><button class="btn lemon" data-act="finish" data-arg="1">Turn on nudges</button>' +
      '<button class="link" data-act="finish" data-arg="0">Not now, I am busy (reading, allegedly)</button></div></main>';
  }

  function ring() {
    var g = S.goal, m = minsToday(), pct = g ? Math.min(1, m / g) : 0, c = 2 * Math.PI * 34;
    return '<svg width="84" height="84" viewBox="0 0 84 84" role="img" aria-label="' + m + (g ? ' of ' + g : '') + ' minutes read today">' +
      '<circle cx="42" cy="42" r="34" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="9"/>' +
      '<circle cx="42" cy="42" r="34" fill="none" stroke="#F6FF5C" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + (pct * c).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 42 42)"/></svg>';
  }

  function rowFor(b, cls) {
    var p = prog(b.id), pct = Math.round(((p.done ? b.pages.length : p.page) / b.pages.length) * 100);
    return '<button class="' + (cls || 'row') + '" data-act="open" data-arg="' + b.id + '">' +
      '<span class="cover' + (p.done ? ' done' : '') + '" style="background:' + b.color + '"></span>' +
      '<span style="flex:1"><strong>' + esc(b.title) + '</strong>' + esc(b.author) + ' · ' + esc(b.tag) +
      '<span class="bar"><i style="width:' + pct + '%"></i></span></span></button>';
  }

  function home() {
    var started = window.BOOKS.filter(function (b) { var p = prog(b.id); return p.page > 0 && !p.done; })[0];
    var picks = window.BOOKS.filter(function (b) { return S.moods.indexOf(b.mood) > -1 && b !== started; });
    var rest = window.BOOKS.filter(function (b) { return S.moods.indexOf(b.mood) === -1 && b !== started; });
    var goalLine = S.goal ? (minsToday() >= S.goal ? 'Goal smashed. Go outside.' : (S.goal - minsToday()) + ' min to go') : 'No goal. Bold.';
    return '<main class="screen paper"><div class="top"><div class="brand" style="color:#2B3BFF">Dog-Ear</div>' +
      '<button class="link" data-act="settings" style="min-height:44px">Settings</button></div>' +
      '<h1 style="color:#2B3BFF">Good to see you. The books are fine, by the way.</h1>' +
      '<section class="goal">' + ring() + '<div><b>' + minsToday() + ' min</b><p>' + goalLine + ' · ' + streak() + ' day streak</p></div></section>' +
      (started ? '<section class="list"><h2>Pick up where you left off</h2>' + rowFor(started, 'cont') + '</section>' : '') +
      (picks.length ? '<section class="list"><h2>Matched to your moods</h2>' + picks.map(function (b) { return rowFor(b); }).join('') + '</section>' : '') +
      '<section class="list"><h2>Everything else on the shelf</h2>' + rest.map(function (b) { return rowFor(b); }).join('') + '</section></main>';
  }

  function settings() {
    return '<main class="screen paper"><button class="link" data-act="home" style="align-self:flex-start">&larr; Back to the shelf</button>' +
      '<h1 style="color:#2B3BFF">Settings, such as they are</h1>' +
      '<section class="list"><h2>Text size</h2><div class="chips">' +
      [17, 19, 22].map(function (n, i) { return '<button class="chip" aria-pressed="' + (S.size === n) + '" data-act="size" data-arg="' + n + '">' + ['Small', 'Medium', 'Big'][i] + '</button>'; }).join('') + '</div></section>' +
      '<section class="list"><h2>Nudge tone</h2>' + TONES.map(function (t) {
        return '<button class="opt" aria-pressed="' + (S.tone === t.id) + '" data-act="tone2" data-arg="' + t.id + '"><span><strong>' + t.name + '</strong>' + esc(t.sample) + '</span></button>';
      }).join('') + '</section>' +
      '<div class="bottom"><button class="btn line" data-act="replay">Replay onboarding</button>' +
      '<button class="link" data-act="reset">Erase my progress</button></div></main>';
  }

  function reader() {
    var b = book(view.id), p = prog(b.id), last = b.pages.length - 1;
    if (view.end) {
      return '<main class="screen blue"><div class="brand">The end</div><h1>You finished ' + esc(b.title) + '. Go tell someone.</h1>' +
        '<p>Nobody asked, but it is a lovely thing to do. Your streak is now ' + streak() + ' day' + (streak() === 1 ? '' : 's') + '.</p>' +
        '<div class="bottom"><button class="btn lemon" data-act="home">Back to the shelf</button>' +
        '<button class="link" data-act="restart" data-arg="' + b.id + '">Read it again</button></div></main>';
    }
    var ear = p.ears.indexOf(p.page) > -1;
    return '<main class="reader"><div class="rtop"><button class="icon" data-act="home" aria-label="Back to the shelf">&larr;</button>' +
      '<div style="font-weight:700;font-size:14px;text-align:center">' + esc(b.title) + '<br>Page ' + (p.page + 1) + ' of ' + b.pages.length + '</div>' +
      '<button class="icon" aria-pressed="' + ear + '" aria-label="Dog-ear this page" data-act="ear">' +
      '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M4 3h9l5 5v11H4z"/><path d="M13 3v5h5"/></svg></button></div>' +
      '<div class="prog"><i style="width:' + Math.round(((p.page + 1) / b.pages.length) * 100) + '%"></i></div>' +
      '<article class="page' + (ear ? ' ear' : '') + '" style="font-size:' + S.size + 'px">' + esc(b.pages[p.page]) + '</article>' +
      '<div class="rbottom"><button class="btn line" data-act="prev"' + (p.page === 0 ? ' disabled style="opacity:.35"' : '') + '>Back</button>' +
      '<button class="btn ink" data-act="next">' + (p.page === last ? 'Finish' : 'Next page') + '</button></div></main>';
  }

  function render() {
    var html = view.name === 'ob' ? ob() : view.name === 'home' ? home() : view.name === 'settings' ? settings() : reader();
    app.innerHTML = html;
    window.scrollTo(0, 0);
    var h = app.querySelector('h1,article');
    if (h) { h.setAttribute('tabindex', '-1'); }
    if (view.name === 'home' && !nudged && S.onboarded) {
      nudged = true;
      var t = TONES.filter(function (x) { return x.id === S.tone; })[0];
      if (S.goal && t) setTimeout(function () { toast(t.sample.replace(/"/g, '')); }, 600);
    }
  }

  // ---------- actions ----------
  function turn(delta) {
    var b = book(view.id), p = prog(b.id), last = b.pages.length - 1;
    if (delta > 0) {
      S.secs[today()] = (S.secs[today()] || 0) + SECS_PER_PAGE;
      if (p.page === last) { p.done = true; S.progress[b.id] = p; save(); view.end = true; render(); return; }
      p.page++;
    } else if (p.page > 0) { p.page--; }
    S.progress[b.id] = p; save(); render();
  }

  var actions = {
    step: function () { view.step++; render(); },
    skipob: function () { S.onboarded = true; save(); view = { name: 'home' }; render(); },
    mood: function (id) {
      var i = S.moods.indexOf(id);
      if (i > -1) S.moods.splice(i, 1); else S.moods.push(id);
      save(); render();
    },
    surprise: function () {
      S.moods = window.MOODS.map(function (m) { return m.id; }).sort(function () { return Math.random() - 0.5; }).slice(0, 3);
      save(); view.step++; render();
    },
    goal: function (n) { S.goal = Number(n); save(); view.step++; render(); },
    tone: function (id) { S.tone = id; save(); render(); },
    tone2: function (id) { S.tone = id; save(); render(); },
    finish: function (on) {
      S.onboarded = true; if (on !== '1') S.tone = 'gentle'; save();
      view = { name: 'home' }; nudged = on !== '1'; render();
    },
    open: function (id) { view = { name: 'reader', id: id }; render(); },
    home: function () { view = { name: 'home' }; nudged = true; render(); },
    settings: function () { view = { name: 'settings' }; render(); },
    size: function (n) { S.size = Number(n); save(); render(); },
    replay: function () { view = { name: 'ob', step: 0 }; render(); },
    reset: function () { S = fresh(); save(); view = { name: 'ob', step: 0 }; render(); },
    next: function () { turn(1); },
    prev: function () { turn(-1); },
    ear: function () {
      var p = prog(view.id), i = p.ears.indexOf(p.page);
      if (i > -1) p.ears.splice(i, 1); else { p.ears.push(p.page); toast('Dog-eared. Your page will remember.'); }
      S.progress[view.id] = p; save(); render();
    },
    restart: function (id) { S.progress[id] = { page: 0, ears: prog(id).ears, done: false }; save(); view = { name: 'reader', id: id }; render(); }
  };

  app.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    var fn = actions[el.getAttribute('data-act')];
    if (fn) fn(el.getAttribute('data-arg'));
  });
  document.addEventListener('keydown', function (e) {
    if (view.name !== 'reader' || view.end) return;
    if (e.key === 'ArrowRight') turn(1);
    if (e.key === 'ArrowLeft') turn(-1);
  });

  render();
})();
