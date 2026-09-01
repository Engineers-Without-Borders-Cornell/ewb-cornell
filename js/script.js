'use strict';

// =============================================
// THEME (light only - the dark/light toggle was removed)
// =============================================
const html = document.documentElement;
html.setAttribute('data-theme', 'light');

// =============================================
// NAVIGATION - SCROLL BEHAVIOR + PARALLAX
// =============================================
const nav = document.getElementById('mainNav');

window.addEventListener('scroll', () => {
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  }
}, { passive: true });

// =============================================
// MARK ACTIVE NAV LINK
// =============================================
(function markActive() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (path === href || (href !== '/' && path.endsWith(href))) {
      a.classList.add('active');
    }
  });
})();

// =============================================
// MOBILE MENU
// =============================================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileBackdrop = document.getElementById('mobileBackdrop');

// =============================================
// SCROLL LOCK
// The custom ::-webkit-scrollbar in style.css forces a space-taking
// scrollbar, so `body { overflow: hidden }` alone widens the viewport by the
// scrollbar width and visibly shifts the page. Reserve that width instead.
// (scrollbar-gutter does not help here: it is ignored under overflow:hidden.)
// =============================================
let scrollLocks = 0;

function lockScroll() {
  if (scrollLocks++ > 0) return;
  const sbw = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty('--sbw', sbw + 'px');
  document.documentElement.classList.add('scroll-locked');
  document.body.style.overflow = 'hidden';
}

function unlockScroll() {
  if (scrollLocks === 0) return;
  if (--scrollLocks > 0) return;
  document.documentElement.classList.remove('scroll-locked');
  document.documentElement.style.removeProperty('--sbw');
  document.body.style.overflow = '';
}



function openMenu() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.add('open');
  mobileMenu.classList.add('open');
  if (mobileBackdrop) mobileBackdrop.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  hamburger.setAttribute('aria-label', 'Close menu');
  document.documentElement.classList.add('menu-open');
  lockScroll();
}

function closeMenu() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  if (mobileBackdrop) mobileBackdrop.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open menu');
  document.documentElement.classList.remove('menu-open');
  unlockScroll();
}

if (hamburger) hamburger.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});
if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMenu);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
if (mobileMenu) mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));


// =============================================
// SCROLL REVEAL (Intersection Observer)
// =============================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = el.dataset.delay || 0;
      setTimeout(() => el.classList.add('visible'), Number(delay));
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => revealObserver.observe(el));

// =============================================
// COUNTER ANIMATION
// =============================================
function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.floor(eased * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = prefix + target + suffix;
  }
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => countObserver.observe(el));

// =============================================
// CAROUSEL
// =============================================
(function initCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.c-dot');
  const total = slides.length;
  let current = 0;
  let timer = null;
  let paused = false;

  function go(idx) {
    current = ((idx % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });
  }

  function next() { go(current + 1); }
  function prev() { go(current - 1); }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => { if (!paused) next(); }, 5000);
  }

  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startTimer(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); startTimer(); }));

  const wrapper = document.querySelector('.carousel-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => { paused = true; });
    wrapper.addEventListener('mouseleave', () => { paused = false; });

    // Touch swipe
    let tx = 0;
    wrapper.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    wrapper.addEventListener('touchend', e => {
      const diff = tx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 44) { diff > 0 ? next() : prev(); startTimer(); }
    }, { passive: true });

    // Keyboard
    wrapper.setAttribute('tabindex', '0');
    wrapper.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { prev(); startTimer(); }
      if (e.key === 'ArrowRight') { next(); startTimer(); }
    });
  }

  go(0);
  startTimer();
})();

// =============================================
// NEWSLETTER SUBMIT
// =============================================
window.handleNewsletter = function(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const input = e.target.querySelector('input[type="email"]');
  if (!btn) return;
  const orig = btn.textContent;
  btn.textContent = '✓ Subscribed!';
  btn.style.background = 'var(--teal)';
  btn.disabled = true;
  if (input) input.value = '';
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
    btn.disabled = false;
  }, 3000);
};

// =============================================
// APPLY FORM SUBMIT
// =============================================
window.handleApply = function(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  if (!btn) return;
  const orig = btn.innerHTML;
  btn.innerHTML = '✓ Application Submitted!';
  btn.style.background = 'var(--teal)';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = orig;
    btn.style.background = '';
    btn.disabled = false;
  }, 4000);
};

// =============================================
// TYPEWRITER EFFECT
// =============================================
(function initTypewriter() {
  document.querySelectorAll('[data-typewriter]').forEach(el => {
    let phrases;
    try { phrases = JSON.parse(el.getAttribute('data-typewriter')); }
    catch(e) { return; }
    if (!phrases.length) return;

    const textNode = document.createElement('span');
    textNode.className = 'typewriter-text';
    const cursor  = document.createElement('span');
    cursor.className  = 'typewriter-cursor';
    el.innerHTML = '';
    el.appendChild(textNode);
    el.appendChild(cursor);

    let pi = 0, ci = 0, deleting = false;

    function tick() {
      const phrase = phrases[pi];
      if (deleting) {
        textNode.textContent = phrase.slice(0, ci - 1);
        ci--;
      } else {
        textNode.textContent = phrase.slice(0, ci + 1);
        ci++;
      }
      let delay = deleting ? 55 : 85;
      if (!deleting && ci === phrase.length)  { delay = 1900; deleting = true; }
      else if (deleting && ci === 0)          { deleting = false; pi = (pi + 1) % phrases.length; delay = 350; }
      setTimeout(tick, delay);
    }
    tick();
  });
})();

// =============================================
// MEMBER MODAL
// =============================================
// Roster profiles come from the member intake form, so most people fill in only
// some of it. Every field below is optional: a blank one is left out of the
// pop-up entirely rather than rendered as an empty row.
const LINKEDIN_ICON = '<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';

// [key, label, fullWidth] in the order the intake form asks for them.
const MODAL_FIELDS = [
  ['major',        'Major',                     false],
  ['year',         'Graduation Year',           false],
  ['subteam',      'Subteam',                   false],
  ['hometown',     'Hometown',                  false],
  ['involvements', 'Other Campus Involvements', true],
  ['experience',   'Professional Experience',   true],
  ['interests',    'Interests',                 true]
];

function memberEscape(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// A form answer of "N/A" means the same as leaving it blank.
function memberValue(v) {
  const s = (v == null ? '' : String(v)).trim();
  return /^(n\/?a|none|nil)\.?$/i.test(s) ? '' : s;
}

function memberEmail(data) {
  return memberValue(data.email) || (memberValue(data.netid) ? data.netid + '@cornell.edu' : '');
}

function memberLinkedin(data) {
  let url = memberValue(data.linkedin);
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : 'https://' + url.replace(/^\/+/, '');
}

(function initMemberModal() {
  // Create overlay once per page
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'memberModal';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalName">
      <button class="modal-close" onclick="closeMemberModal()" aria-label="Close">&times;</button>
      <div class="modal-header">
        <div class="modal-photo" id="modalPhoto"></div>
        <div class="modal-info">
          <h2 id="modalName"></h2>
          <div class="modal-role" id="modalRole"></div>
          <a class="modal-linkedin" id="modalLinkedin" href="#" target="_blank" rel="noopener" style="display:none;">
            ${LINKEDIN_ICON} LinkedIn
          </a>
        </div>
      </div>
      <div class="modal-body" id="modalBody"></div>
      <div class="modal-footer" id="modalReach">
        <span>&#128236;</span> Reach out at
        <a id="modalEmail" href="#"></a>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeMemberModal();
  });
})();

window.openMemberModal = function(data) {
  const overlay = document.getElementById('memberModal');
  if (!overlay) return;

  document.getElementById('modalName').textContent = memberValue(data.name);
  const roleEl = document.getElementById('modalRole');
  roleEl.textContent = memberValue(data.role);
  roleEl.style.display = roleEl.textContent ? '' : 'none';

  // Only the fields this person actually filled in get a row.
  document.getElementById('modalBody').innerHTML = MODAL_FIELDS.reduce((out, [key, label, wide]) => {
    const val = memberValue(data[key]);
    if (!val) return out;
    return out + `<div class="modal-field${wide ? ' modal-about' : ''}">
          <label>${memberEscape(label)}</label>
          <p>${memberEscape(val)}</p>
        </div>`;
  }, '');

  // Photo
  const photoEl = document.getElementById('modalPhoto');
  if (data.photo) {
    photoEl.style.background = '';
    photoEl.innerHTML = `<img src="${memberEscape(data.photo)}" alt="${memberEscape(data.name || '')}">`;
  } else {
    const colors = [
      ['#1d4ed8','#0ea5e9'],['#0369a1','#38bdf8'],
      ['#059669','#34d399'],['#7c3aed','#a78bfa'],
      ['#0f766e','#2dd4bf']
    ];
    const idx = (data.name || '').charCodeAt(0) % colors.length;
    photoEl.innerHTML = '';
    photoEl.style.background = `linear-gradient(135deg, ${colors[idx][0]}, ${colors[idx][1]})`;
    photoEl.textContent = data.initials || (data.name || '?')[0];
  }

  // LinkedIn
  const li = document.getElementById('modalLinkedin');
  const liUrl = memberLinkedin(data);
  if (liUrl) { li.href = liUrl; li.style.display = ''; }
  else { li.style.display = 'none'; }

  // Email
  const reach = document.getElementById('modalReach');
  const emailEl = document.getElementById('modalEmail');
  const email = memberEmail(data);
  if (email) {
    emailEl.href = 'mailto:' + email;
    emailEl.textContent = email;
    reach.style.display = '';
  } else {
    reach.style.display = 'none';
  }

  overlay.classList.add('open');
  lockScroll();
};

// Roster cards carry their profile in a data-member attribute: clicking one
// opens the pop-up, and a LinkedIn badge sits at the bottom of the card as a
// separate link out.
document.addEventListener('DOMContentLoaded', function initMemberCards() {
  document.querySelectorAll('.member-card[data-member], .exec-card[data-member]').forEach(card => {
    let data;
    try { data = JSON.parse(card.dataset.member); } catch (e) { return; }

    card.classList.add('is-clickable');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    const open = () => window.openMemberModal(data);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });

    const url = memberLinkedin(data);
    if (!url) return;
    const badge = document.createElement('a');
    badge.className = 'member-linkedin-badge';
    badge.href = url;
    badge.target = '_blank';
    badge.rel = 'noopener';
    badge.innerHTML = LINKEDIN_ICON + '<span>LinkedIn</span>';
    badge.setAttribute('aria-label', 'LinkedIn profile for ' + (data.name || 'this member'));
    // The card itself is a button, so the badge must not bubble up to it.
    badge.addEventListener('click', e => e.stopPropagation());
    badge.addEventListener('keydown', e => e.stopPropagation());
    card.appendChild(badge);
  });
});

window.closeMemberModal = function() {
  const overlay = document.getElementById('memberModal');
  if (!overlay || !overlay.classList.contains('open')) return;
  overlay.classList.remove('open');
  unlockScroll();
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') window.closeMemberModal();
});
