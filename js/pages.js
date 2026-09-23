'use strict';
/* =============================================================
   EWB CORNELL - INNER PAGE interactions (loaded after script.js)
   reveal · counters · filters · accordion · calculator ·
   lightbox · form feedback
============================================================= */
(function () {
  document.documentElement.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- reveal ---- */
  const rvEls = document.querySelectorAll('.rv');
  if (reduce) { rvEls.forEach(e => e.classList.add('in')); }
  else if (rvEls.length) {
    const o = new IntersectionObserver((es) => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rvEls.forEach(e => o.observe(e));
  }

  /* ---- recruiting timeline ----
     Draws each rail and staggers its rows in on scroll, pins a "next up"
     marker on the soonest event still ahead, and lays a progress line over
     each rail up to "now". All of it re-runs on a timer, so the page keeps
     itself current while it is open. */
  const rails = document.querySelectorAll('.rtl');
  if (rails.length) {
    const phoneMQ = window.matchMedia('(max-width: 900px)');
    const tracks = Array.from(document.querySelectorAll('.rtl-track'));
    const fork = document.querySelector('.rtl-fork');
    const sharedRail = document.querySelector('.rtl-shared .rtl');

    // .rtl-anim is what arms the hidden start state, so it is set here rather
    // than in the markup: no pages.js, no hiding. On phones the stacked rail
    // is drawn by the track and fork, so they are armed too.
    const armed = [...rails, ...tracks, ...(fork ? [fork] : [])];
    armed.forEach(el => el.classList.add('rtl-anim'));

    // One continuous top-to-bottom sweep: the rail draws at a steady speed and
    // each row is timed to the moment the line reaches its own dot, so rows
    // always arrive in the order they appear on screen however many there are.
    // One continuous top-to-bottom sweep. The line travels at a fixed speed
    // rather than a fixed duration, so a short column and a long one draw at
    // the same visual pace, and each row is timed to the moment the line
    // reaches its own dot. Works for any number of rows.
    const SPEED = 460, LEAD = 0.1, MIN = 0.3, MAX = 1.9, FADE = 0.34;
    const pxv = (v) => parseFloat(v) || 0;
    const timeSweep = (rail) => {
      const track = rail.closest('.rtl-track');
      const host = (phoneMQ.matches && track) ? track : rail;
      const line = getComputedStyle(host, '::before');
      const box = host.getBoundingClientRect();
      const top = pxv(line.top);
      const span = Math.max(1, host.clientHeight - pxv(line.bottom) - top);
      const dur = Math.min(MAX, Math.max(MIN, span / SPEED));
      const pace = dur / span;                    // seconds per pixel travelled
      host.style.setProperty('--sweep', dur.toFixed(3) + 's');
      host.style.setProperty('--sweep-start', LEAD + 's');
      let last = LEAD;
      rail.querySelectorAll('.rtl-row').forEach(row => {
        const y = row.getBoundingClientRect().top - box.top + pxv(getComputedStyle(row, '::before').top) + 5;
        const at = LEAD + Math.max(0, Math.min(span, y - top)) * pace;
        row.style.setProperty('--in', at.toFixed(3) + 's');
        last = Math.max(last, at);
      });
      host.style.setProperty('--fill-start', (LEAD + dur + 0.15).toFixed(3) + 's');
      return last + FADE;   // when this column has finished settling
    };

    const reveal = (rail) => {
      const span = timeSweep(rail);
      rail.classList.add('rtl-in');
      const track = rail.closest('.rtl-track');
      if (track) track.classList.add('rtl-in');
      if (rail === sharedRail && fork) fork.classList.add('rtl-in');
      return span;
    };

    if (reduce) { rails.forEach(reveal); }
    else {
      const observe = (targets, onEnter) => {
        const to = new IntersectionObserver((es) => es.forEach(e => {
          if (!e.isIntersecting) return;
          to.unobserve(e.target);
          onEnter(e.target);
        }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
        targets.forEach(t => to.observe(t));
      };
      const trackRail = (t) => t.querySelector('.rtl');

      // The shared trunk reveals on its own.
      if (sharedRail) observe([sharedRail], reveal);

      const pair = document.querySelector('.rtl-tracks');
      if (phoneMQ.matches || !pair) {
        // Stacked on a phone: each class year appears as it is reached.
        observe(tracks, t => reveal(trackRail(t)));
      } else {
        // Side by side: the two columns start at different heights (the left
        // one carries the recruiting notice), so observing them separately
        // let the right column fire first. Watch the pair as one unit and
        // bring in the whole left column, then the whole right one.
        // One column at a time: Upperclassmen sweeps top to bottom, a short
        // beat, then First-Year + Transfer does the same.
        const BEAT = 280;
        observe([pair], () => {
          let at = 0;
          tracks.forEach((t, i) => {
            const rail = trackRail(t);
            if (i === 0) { at = reveal(rail) * 1000 + BEAT; }
            else { setTimeout(() => reveal(rail), at); }
          });
        });
      }
    }

    const dayStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
    const rowTime = (row) => {
      const p = row.getAttribute('data-date').split('-').map(Number);
      return new Date(p[0], p[1] - 1, p[2]).getTime();
    };
    const dated = Array.from(document.querySelectorAll('.rtl-row[data-date]'));
    const DAY = 86400000;

    // Compare dates only, so an event stays "next up" for the whole of its day.
    let markedDay = null;
    function markNext() {
      const todayTime = dayStart(Date.now());
      if (todayTime === markedDay) return;   // same day, nothing to redraw
      markedDay = todayTime;

      // Two passes: find the soonest date still ahead, then mark every row on
      // it. Separate tracks can share a date, and picking one by DOM order
      // would be arbitrary.
      let nextTime = Infinity;
      const times = dated.map(row => {
        const when = rowTime(row);
        row.classList.toggle('is-past', when < todayTime);
        if (when >= todayTime && when < nextTime) nextTime = when;
        return when;
      });

      document.querySelectorAll('.rtl-row.is-next').forEach(r => r.classList.remove('is-next'));
      document.querySelectorAll('.rtl-next-tag').forEach(t => t.remove());
      if (nextTime === Infinity) return;

      const days = Math.round((nextTime - todayTime) / DAY);
      const label = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'In ' + days + ' days';
      dated.forEach((row, i) => {
        if (times[i] !== nextTime) return;
        row.classList.add('is-next');
        const when = row.querySelector('.when');
        if (!when) return;
        const tag = document.createElement('span');
        tag.className = 'rtl-next-tag';
        tag.textContent = label;
        when.appendChild(tag);
      });
    }

    // Path ahead. Blue marks the road still to travel: in each rail it runs
    // from the most recent event that has passed (or the rail's start, if
    // none has) through every event still to come. Finished stretches stay
    // grey. The trunk and each branch arm light only when they lead on to
    // something upcoming. An event counts as upcoming for the whole of its day.
    const px = (v) => parseFloat(v) || 0;
    function paintProgress() {
      const today = dayStart(Date.now());
      const phone = phoneMQ.matches;
      const isAhead = (row) => rowTime(row) >= today;

      const trackAhead = tracks.map(t => Array.from(t.querySelectorAll('.rtl-row[data-date]')).some(isAhead));
      const trunkAhead = sharedRail && Array.from(sharedRail.querySelectorAll('.rtl-row[data-date]')).some(isAhead);

      const segments = [];
      if (sharedRail) segments.push({ host: sharedRail, rowsIn: sharedRail, node: false, trunk: true });
      tracks.forEach((t, i) => {
        const rail = t.querySelector('.rtl');
        if (rail) segments.push({ host: phone ? t : rail, rowsIn: rail, node: phone, ahead: trackAhead[i] });
      });

      segments.forEach(seg => {
        const host = seg.host;
        const line = getComputedStyle(host, '::before');
        let fill = host.querySelector(':scope > .rtl-fill');
        if (!fill) {
          fill = document.createElement('div');
          fill.className = 'rtl-fill';
          fill.setAttribute('aria-hidden', 'true');
          // appended last so it never shifts the rows' :nth-child numbering,
          // which the reveal stagger counts on; .rtl-row's z-index keeps the
          // event dots painted above it
          host.appendChild(fill);
        }
        const hostBox = host.getBoundingClientRect();
        if (line.display === 'none' || line.content === 'none' || !hostBox.height) {
          fill.style.height = '0px';
          return;
        }

        const railTop = px(line.top);
        const railBottom = host.clientHeight - px(line.bottom);
        const origin = seg.node ? px(getComputedStyle(host, '::after').top) + 5 : railTop;
        const marks = Array.from(seg.rowsIn.querySelectorAll('.rtl-row[data-date]')).map(row => ({
          ahead: isAhead(row),
          y: row.getBoundingClientRect().top - hostBox.top + px(getComputedStyle(row, '::before').top) + 5
        }));
        const past = marks.filter(m => !m.ahead);
        const from = past.length ? past[past.length - 1].y : origin;

        let to = from;
        if (seg.trunk) {
          // the trunk runs on into both branches, so it stays lit to its foot
          // while anything anywhere is still to come
          if (trunkAhead || trackAhead.some(Boolean)) to = railBottom;
        } else if (seg.ahead && marks.length) {
          to = marks[marks.length - 1].y;
        }

        fill.style.left = px(line.left) + 'px';
        fill.style.top = from + 'px';
        fill.style.height = Math.max(0, to - from) + 'px';
      });

      if (fork) {
        fork.classList.toggle('lit-left', !!trackAhead[0]);
        fork.classList.toggle('lit-right', !!trackAhead[1]);
        fork.classList.toggle('lit-any', trackAhead.some(Boolean));
      }
    }

    function tick() { markNext(); paintProgress(); }
    tick();
    setInterval(tick, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
    window.addEventListener('focus', tick);
    // layout moves the markers: re-measure on resize, rotation and font load
    const wrap = sharedRail && sharedRail.closest('.container');
    if (wrap && 'ResizeObserver' in window) {
      let raf = 0;
      new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paintProgress); }).observe(wrap);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paintProgress);
    // markNext changes row heights (the next-up card), so measure after it
    phoneMQ.addEventListener && phoneMQ.addEventListener('change', () => { markedDay = null; tick(); });
  }

  /* ---- counters ---- */
  function countUp(el) {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target.toLocaleString() + suffix; return; }
    const dur = 1300, start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = target.toLocaleString() + suffix;
    })(start);
  }
  const cEls = document.querySelectorAll('[data-count]');
  if (cEls.length) {
    const co = new IntersectionObserver((es) => es.forEach(e => {
      if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); }
    }), { threshold: 0.5 });
    cEls.forEach(e => co.observe(e));
  }

  /* ---- filters (projects, gallery) ---- */
  document.querySelectorAll('[data-filterbar]').forEach(bar => {
    const itemsSel = bar.getAttribute('data-filterbar');
    const items = Array.from(document.querySelectorAll(itemsSel));
    bar.querySelectorAll('[data-filter]').forEach(chip => {
      chip.addEventListener('click', () => {
        const f = chip.getAttribute('data-filter');
        bar.querySelectorAll('[data-filter]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        items.forEach(it => {
          const cats = (it.getAttribute('data-cat') || '').split(/\s+/);
          const show = f === 'all' || cats.includes(f);
          it.classList.toggle('filter-hidden', !show);
        });
      });
    });
  });

  /* ---- accordion ---- */
  document.querySelectorAll('.acc-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.acc-item');
      const ans = item.querySelector('.acc-a');
      const open = item.classList.toggle('open');
      ans.style.maxHeight = open ? ans.scrollHeight + 'px' : 0;
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---- sponsorship calculator ---- */
  const calcInput = document.getElementById('calcInput');
  if (calcInput) {
    const fmt = n => n.toLocaleString('en-US');
    const $ = id => document.getElementById(id);
    const elPipe = $('impPipe'), elSolar = $('impSolar'), elTool = $('impTool');
    const elFill = $('calcFill'), elPct = $('calcPct'), elSummary = $('calcSummary');
    const presets = Array.from(document.querySelectorAll('.calc-preset'));
    function render() {
      const amt = Math.max(0, parseInt(calcInput.value, 10) || 0);
      if (elPipe) elPipe.textContent = fmt(Math.floor(amt / 100));
      if (elSolar) elSolar.textContent = fmt(Math.floor(amt / 150));
      if (elTool) elTool.textContent = fmt(Math.floor(amt / 500));
      const pct = Math.min((amt / 50000) * 100, 100);
      if (elFill) elFill.style.width = pct + '%';
      if (elPct) elPct.textContent = (pct < 1 && amt > 0 ? pct.toFixed(1) : Math.round(pct)) + '%';
      if (elSummary) elSummary.textContent = '$' + fmt(amt) + ' puts to work:';
      presets.forEach(p => p.classList.toggle('active', parseInt(p.dataset.amt, 10) === amt));
    }
    calcInput.addEventListener('input', render);
    presets.forEach(p => p.addEventListener('click', () => { calcInput.value = p.dataset.amt; render(); }));
    render();
  }

  /* ---- gallery lightbox ---- */
  const gitems = document.querySelectorAll('.gitem');
  if (gitems.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<button class="lightbox-close" aria-label="Close">&times;</button><img alt="">';
    document.body.appendChild(lb);
    const lbImg = lb.querySelector('img');
    const close = () => { lb.classList.remove('open'); };
    lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lightbox-close')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    gitems.forEach(g => {
      const img = g.querySelector('img');
      if (!img) return;
      g.addEventListener('click', () => { lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt || ''; lb.classList.add('open'); });
    });
  }

  /* ---- generic form feedback ---- */
  document.querySelectorAll('form[data-feedback]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"], .btn[type="submit"], button:not([type])');
      if (!btn) return;
      const orig = btn.textContent;
      btn.textContent = form.getAttribute('data-feedback') || 'Done';
      btn.disabled = true;
      btn.style.background = 'var(--ok)';
      btn.style.borderColor = 'var(--ok)';
      btn.style.color = '#fff';
      const inputs = form.querySelectorAll('input, textarea, select');
      setTimeout(() => {
        btn.textContent = orig; btn.disabled = false;
        btn.style.background = ''; btn.style.borderColor = ''; btn.style.color = '';
        inputs.forEach(i => { if (i.type !== 'submit') i.value = ''; });
      }, 3200);
    });
  });
})();
