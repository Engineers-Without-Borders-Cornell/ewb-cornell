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
