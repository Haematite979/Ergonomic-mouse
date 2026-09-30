const imageNames = Array.from({ length: 240 }, (_, index) => {
  const frame = String(index + 1).padStart(3, '0   ');
  return `assets/ezgif-frame-${frame}.png`;
});

const scrollVideo = document.getElementById('scrollVideo');
const totalFrames = imageNames.length;
const maxScroll = 5000;
let scrollProgress = 0;
let scrollTarget = 0;
const scrollState = { value: 0 };

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateFrameFromProgress(progress) {
  if (!scrollVideo) return;

  const clampedProgress = clamp(progress, 0, 1);
  const frameIndex = Math.min(
    totalFrames - 1,
    Math.max(0, Math.round(clampedProgress * (totalFrames - 1)))
  );

  const imagePath = imageNames[frameIndex];
  if (scrollVideo.getAttribute('data-current-frame') !== String(frameIndex)) {
    scrollVideo.src = imagePath;
    scrollVideo.setAttribute('data-current-frame', String(frameIndex));
  }
}

function updateHeroVisibility() {
  const heroOverlay = document.querySelector('.hero-overlay');
  if (!heroOverlay) return;

  const hideAtPercent = 0.35;
  const shouldHide = scrollProgress >= maxScroll * hideAtPercent;
  heroOverlay.classList.toggle('is-hidden', shouldHide);
}

function updateFeaturesVisibility() {
  const featureOverlay = document.querySelector('.features-overlay');
  if (!featureOverlay) return;

  const revealAtPercent = 0.35;
  const hideAtPercent = 0.75;
  const shouldShow = scrollProgress >= maxScroll * revealAtPercent && scrollProgress < maxScroll * hideAtPercent;
  featureOverlay.classList.toggle('is-hidden', !shouldShow);
}

function syncScrollVisuals() {
  scrollProgress = scrollState.value;
  updateFrameFromProgress(clamp(scrollProgress / maxScroll, 0, 1));
  updateHeroVisibility();
  updateFeaturesVisibility();
}

function updateTargetFromDelta(deltaY) {
  scrollTarget = clamp(scrollTarget + deltaY * 0.8, 0, maxScroll);

  gsap.to(scrollState, {
    value: scrollTarget,
    duration: 0.9,
    ease: 'power3.out',
    overwrite: true,
    onUpdate: syncScrollVisuals,
  });
}

function initScrollVideo() {
  document.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      updateTargetFromDelta(event.deltaY);
    },
    { passive: false }
  );

  window.addEventListener(
    'touchmove',
    (event) => {
      if (!event.touches || !event.touches[0]) return;
      const touchY = event.touches[0].clientY;
      if (typeof window.lastTouchY === 'undefined') {
        window.lastTouchY = touchY;
        return;
      }

      const deltaY = touchY - window.lastTouchY;
      window.lastTouchY = touchY;
      updateTargetFromDelta(deltaY * 1.5);
    },
    { passive: false }
  );

  window.addEventListener(
    'touchend',
    () => {
      window.lastTouchY = undefined;
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    syncScrollVisuals();
  });

  syncScrollVisuals();
}

initScrollVideo();
