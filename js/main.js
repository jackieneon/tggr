const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   Disco ball — real 3D sphere built from facet elements
   distributed evenly with a Fibonacci-sphere layout, then
   rotated as a whole group (transform-style: preserve-3d).
   A few facets per color pick up the violet/coral/cyan
   thread from the hero blobs as "light reflections".
========================================================= */
const discoBall = document.getElementById('discoBall');
const discoWrap = document.querySelector('.disco-wrap');
const FACET_COUNT = 260;
const COLOR_CLASSES = ['disco-facet--violet', 'disco-facet--coral', 'disco-facet--cyan'];
const COLOR_FACET_RATIO = 0.14; // ~14% of facets carry a color reflection

function buildDiscoBall() {
  if (!discoBall || !discoWrap) return;

  discoBall.innerHTML = '';
  const radius = discoWrap.clientWidth / 2;
  if (!radius) return;

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const frag = document.createDocumentFragment();

  for (let i = 0; i < FACET_COUNT; i++) {
    const y = 1 - (i / (FACET_COUNT - 1)) * 2; // 1 -> -1
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    const lat = Math.asin(y) * (180 / Math.PI);
    const lon = Math.atan2(x, z) * (180 / Math.PI);

    const facet = document.createElement('span');
    facet.className = 'disco-facet';

    if (Math.random() < COLOR_FACET_RATIO) {
      facet.classList.add(COLOR_CLASSES[i % COLOR_CLASSES.length]);
    }

    facet.style.opacity = (0.55 + Math.random() * 0.45).toFixed(2);
    facet.style.transform =
      `rotateY(${lon}deg) rotateX(${-lat}deg) translateZ(${radius}px)`;

    frag.appendChild(facet);
  }

  discoBall.appendChild(frag);
}

buildDiscoBall();

// Rebuild on resize (debounced) so facet spacing matches the new radius
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(buildDiscoBall, 200);
});

/* ---- Rotation: driven by scroll, plus a gentle idle spin ---- */
let rotationY = 0;
let lastScrollY = window.scrollY;
let ticking = false;

function updateBallRotation() {
  const currentScrollY = window.scrollY;
  const delta = currentScrollY - lastScrollY;
  lastScrollY = currentScrollY;

  rotationY += delta * 0.55;

  if (discoBall) {
    discoBall.style.transform = `rotateY(${rotationY}deg) rotateX(6deg)`;
  }
  ticking = false;
}

function onScroll() {
  if (!ticking && !prefersReducedMotion) {
    window.requestAnimationFrame(updateBallRotation);
    ticking = true;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });

if (!prefersReducedMotion && discoBall) {
  // Idle spin: ~9deg/sec, a full rotation every ~40s — fast enough to
  // read as clearly spinning rather than static at a glance.
  setInterval(() => {
    rotationY += 0.45;
    discoBall.style.transform = `rotateY(${rotationY}deg) rotateX(6deg)`;
  }, 50);
} else if (discoBall) {
  // Reduced motion: render the sphere in a fixed, still pose.
  discoBall.style.transform = 'rotateY(0deg) rotateX(6deg)';
}

/* =========================================================
   Talent cards — "Bio" and "Listen to mix" each expand their
   own panel, but only one stays open per card at a time:
   opening either one closes the other. Bio panel = bio copy +
   mix player. Mix panel = mix player + optional note. The
   player itself is duplicated (one instance per panel) so
   it's available either way.
========================================================= */

// Drop each talent's real SoundCloud/Mixcloud URL in here — the
// matching card's player will render automatically. Leave url empty
// to show a "coming soon" placeholder instead. The optional line about
// the mix (venue, event, tracklist, etc.) isn't set here — it's the
// <p class="talent-card__player-caption"> written directly in
// index.html under each card's player, same as the bio text. Edit or
// delete that line per card, whatever fits.
const MIX_EMBEDS = {
  'name-one': { type: 'soundcloud', url: '' },
  'name-two': { type: 'soundcloud', url: '' },
  'name-three': { type: 'soundcloud', url: '' },
};

function buildEmbedMarkup(type, url) {
  if (type === 'soundcloud') {
    const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5c7a&auto_play=false&show_teaser=false&visual=false`;
    return `<iframe src="${src}" height="120" scrolling="no" frameborder="no" loading="lazy" allow="autoplay"></iframe>`;
  }
  if (type === 'mixcloud') {
    const src = `https://player-widget.mixcloud.com/widget/iframe/?hide_cover=1&light=1&feed=${encodeURIComponent(url)}`;
    return `<iframe src="${src}" height="120" frameborder="no" loading="lazy" allow="autoplay"></iframe>`;
  }
  return null;
}

function renderPlayer(playerEl, talentId) {
  if (playerEl.dataset.rendered === 'true') return;
  playerEl.dataset.rendered = 'true';

  const config = MIX_EMBEDS[talentId];
  const markup = config && config.url ? buildEmbedMarkup(config.type, config.url) : null;

  playerEl.innerHTML = markup
    ? markup
    : '<p class="talent-card__player-placeholder">Mix embed coming soon.</p>';
}

function closePanel(button, panel) {
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  button.setAttribute('aria-expanded', 'false');
}

function openPanel(button, panel, talentId) {
  panel.classList.add('is-open');
  panel.setAttribute('aria-hidden', 'false');
  button.setAttribute('aria-expanded', 'true');

  const playerEl = panel.querySelector('[data-talent-player]');
  if (playerEl) renderPlayer(playerEl, talentId);
}

document.querySelectorAll('.talent-card').forEach((card) => {
  const talentId = card.dataset.talentId;

  // Only one of "Bio" / "Listen to mix" stays open per card — opening
  // one closes the other.
  const pairs = Array.from(card.querySelectorAll('.talent-toggle'))
    .map((button) => ({ button, panel: document.getElementById(button.getAttribute('aria-controls')) }))
    .filter((pair) => pair.panel);

  pairs.forEach(({ button, panel }) => {
    button.addEventListener('click', () => {
      const wasOpen = panel.classList.contains('is-open');

      pairs.forEach((pair) => closePanel(pair.button, pair.panel));

      if (!wasOpen) {
        openPanel(button, panel, talentId);
      }
    });
  });
});
