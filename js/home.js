'use strict';
/* =============================================================
   EWB CORNELL - HOMEPAGE v2 interactions
   Scroll progress · section rail · reveals · counters ·
   sponsorship calculator · history timeline · operations map
============================================================= */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- scroll progress ---------- */
  const bar = document.getElementById('scrollProgress');
  if (bar) {
    let ticking = false;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- dossier rail active section ---------- */
  const rail = document.getElementById('rail');
  if (rail) {
    const links = Array.from(rail.querySelectorAll('a'));
    const map = new Map(links.map(a => [a.getAttribute('data-rail'), a]));
    const sections = links
      .map(a => document.getElementById(a.getAttribute('data-rail')))
      .filter(Boolean);
    const railObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const a = map.get(e.target.id);
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => railObs.observe(s));
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.rv');
  if (reduce) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const revObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => revObs.observe(el));
  }

  /* ---------- count-up ---------- */
  function countUp(el) {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target.toLocaleString() + suffix; return; }
    const dur = 1400, start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString() + suffix;
    }
    requestAnimationFrame(tick);
  }
  const countEls = document.querySelectorAll('[data-count]');
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { countUp(e.target); countObs.unobserve(e.target); } });
  }, { threshold: 0.6 });
  countEls.forEach(el => countObs.observe(el));

  /* ---------- sponsorship calculator ---------- */
  const calcInput = document.getElementById('calcInput');
  if (calcInput) {
    const fmt = n => n.toLocaleString('en-US');
    const elPipe = document.getElementById('impPipe');
    const elSolar = document.getElementById('impSolar');
    const elTool = document.getElementById('impTool');
    const elFill = document.getElementById('calcFill');
    const elPct = document.getElementById('calcPct');
    const elSummary = document.getElementById('calcSummary');
    const presets = Array.from(document.querySelectorAll('.calc-preset'));

    function render() {
      const amt = Math.max(0, parseInt(calcInput.value, 10) || 0);
      elPipe.textContent = fmt(Math.floor(amt / 100));
      elSolar.textContent = fmt(Math.floor(amt / 150));
      elTool.textContent = fmt(Math.floor(amt / 500));
      const pct = Math.min((amt / 50000) * 100, 100);
      elFill.style.width = pct + '%';
      elPct.textContent = (pct < 1 && amt > 0 ? pct.toFixed(1) : Math.round(pct)) + '%';
      elSummary.textContent = '$' + fmt(amt) + ' puts to work:';
      presets.forEach(p => p.classList.toggle('active', parseInt(p.dataset.amt, 10) === amt));
    }
    calcInput.addEventListener('input', render);
    presets.forEach(p => p.addEventListener('click', () => { calcInput.value = p.dataset.amt; render(); }));
    render();
  }

  /* ---------- history timeline ---------- */
  const tlTrack = document.getElementById('tlTrack');
  if (tlTrack) {
    const events = [
      { y: 2009, loc: 'Ithaca, New York', t: 'The Cornell chapter is founded', d: 'A group of students start the Cornell University chapter of Engineers Without Borders, beginning a tradition of community-driven engineering.' },
      { y: 2011, loc: 'Calcha, Bolivia', t: 'International origins', d: 'Built a walking bridge to improve the safety and productivity of local agricultural fields, and optimized water management systems for cleaner, more reliable fresh water.' },
      { y: 2014, loc: 'Binghamton, New York', t: 'Going domestic: EPOD', d: 'Partnered with Every1sHome to design an inexpensive, portable shelter for the homeless population of Binghamton.' },
      { y: 2016, loc: 'Erie, Pennsylvania', t: 'Aquaponics challenge', d: 'Designed an aquaponics greenhouse facility and affordable, sustainable refrigeration equipment for Erie.' },
      { y: 2017, loc: 'Sunuka, Tanzania', t: 'Solar irrigation', d: 'Implemented an irrigation system to address food and economic insecurity for a farming community.' },
      { y: 2019, loc: 'Sub-Saharan Africa', t: 'Digital agriculture begins', d: 'Launched a machine-learning drone and rover system to detect Northern Leaf Blight in maize before it can spread.' },
      { y: 2020, loc: 'Pine Ridge, South Dakota', t: 'Sustainable housing', d: 'Partnered with First Families Now to design a cost-effective, permanent Sustainable Housing Unit for the reservation.' },
      { y: 2021, loc: 'Tompkins County, NY', t: 'Sustainable software', d: 'Developed a carbon-offset management tool in partnership with Sustainable Tompkins.' },
      { y: 2022, loc: 'Cornell University', t: 'Cornell Wardrobe app', d: 'Built an app to optimize the Cornell Wardrobe Project, which provides free, gently used professional attire.' },
      { y: 2023, loc: 'Austin, Texas', t: 'Stormwater reuse', d: 'Began designing stormwater diversion, rainwater harvesting, and solar pumping for the Festival Beach Community Garden.' },
      { y: 2024, loc: 'Finger Lakes, NY', t: 'ReUse partnership', d: 'Started a donation application for Finger Lakes ReUse and a carbon app for the Tompkins Climate Fund.' },
      { y: 2025, loc: 'Barrio San Cristóbal, Bolivia', t: 'Sanitation initiative', d: 'Visited San Cristóbal and adopted a multi-year sanitation project, now entering its implementation phase.' }
    ];
    const elYear = document.getElementById('tlYear');
    const elLoc = document.getElementById('tlLoc');
    const elTitle = document.getElementById('tlTitle');
    const elText = document.getElementById('tlText');

    function show(i) {
      const e = events[i];
      elYear.textContent = e.y;
      elLoc.textContent = e.loc;
      elTitle.textContent = e.t;
      elText.textContent = e.d;
      Array.from(tlTrack.children).forEach((c, idx) => {
        const on = idx === i;
        c.classList.toggle('active', on);
        c.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
    events.forEach((e, i) => {
      const b = document.createElement('button');
      b.className = 'tl-year';
      b.setAttribute('role', 'tab');
      b.innerHTML = '<span class="dot" aria-hidden="true"></span>' + e.y;
      b.addEventListener('click', () => { show(i); b.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'center', block: 'nearest' }); });
      tlTrack.appendChild(b);
    });
    show(events.length - 1);
  }

  /* ---------- operations map ---------- */
  const opsSvg = document.getElementById('opsSvg');
  const readout = document.getElementById('opsReadout');
  if (opsSvg && readout) {
    const nodes = Array.from(opsSvg.querySelectorAll('.ops-node'));
    const cards = Array.from(readout.querySelectorAll('.ops-card'));
    const byNode = key => [
      ...nodes.filter(n => n.dataset.node === key),
      ...cards.filter(c => c.dataset.node === key)
    ];
    function setActive(key) {
      nodes.forEach(n => n.classList.remove('is-active'));
      cards.forEach(c => c.classList.remove('is-active'));
      byNode(key).forEach(el => el.classList.add('is-active'));
    }
    const PROJECT_URL = {
      bolivia: '/projects/bolivia/',
      austin: '/projects/austin/',
      pineridge: '/projects/pine-ridge/',
      tanzania: '/projects/tanzania/',
      digitalag: 'https://ewb-dig-ag.org',
      ithaca: '/about/'
    };
    nodes.forEach(n => {
      const hit = n.querySelector('.ops-node-hit') || n;
      hit.style.cursor = 'pointer';
      hit.addEventListener('mouseenter', () => setActive(n.dataset.node));
      hit.addEventListener('click', () => {
        const url = PROJECT_URL[n.dataset.node];
        if (url) window.location.href = url;
      });
    });
    // cards are real <a> links; just sync the active highlight on hover
    cards.forEach(c => c.addEventListener('mouseenter', () => setActive(c.dataset.node)));
    setActive('bolivia');
  }
})();
