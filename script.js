const slides = document.querySelector('.slides');
const images = document.querySelectorAll('.slides img');

let currentIndex = 0;
const total = images.length;

function updateSlide() {
  if (!slides) return;
  slides.style.transform = `translateX(-${currentIndex * 100}%)`;
}

// Slideshow automático
setInterval(() => {
  currentIndex = (currentIndex + 1) % total;
  updateSlide();
}, 5000);

/* Background music playlist (no visible UI) */
/* YouTube audio-only background playback (no visible video) */
// Put YouTube links here (any YouTube URL) — edit to choose your songs
const ytLinks = [
  'https://youtu.be/QRNWCYAZB6g?si=rIyI_Hpr-7iw9sFL',
  'https://www.youtube.com/watch?v=VIDEO_ID_2'
];

function extractYouTubeID(url) {
  if (!url) return null;
  const patterns = [
    /v=([0-9A-Za-z_-]{11})/, // watch?v=
    /youtu\.be\/([0-9A-Za-z_-]{11})/, // youtu.be/
    /embed\/([0-9A-Za-z_-]{11})/ // embed/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
}

const ytIds = ytLinks.map(extractYouTubeID).filter(Boolean);
let ytIndex = 0;
let ytPlayer = null;

// This function will be called by the YouTube IFrame API when ready
function onYouTubeIframeAPIReady() {
  if (!ytIds.length) return;
  console.log('YouTube API ready, creating player with ID', ytIds[ytIndex]);
  ytPlayer = new YT.Player('ytplayer', {
    height: '0',
    width: '0',
    videoId: ytIds[ytIndex],
    playerVars: { controls: 0, modestbranding: 1, rel: 0, playsinline: 1 },
    events: { onReady: () => {}, onStateChange: onPlayerStateChange }
  });
}

function onPlayerStateChange(e) {
  // When a video ends, advance to next
  if (e.data === YT.PlayerState.ENDED) {
    ytIndex = (ytIndex + 1) % ytIds.length;
    if (ytPlayer) ytPlayer.loadVideoById(ytIds[ytIndex]);
  }
}

function playYouTube() {
  if (ytPlayer) {
    console.log('playYouTube() called');
    try { ytPlayer.playVideo(); } catch (e) { console.warn('play error', e); }
  }
}

function pauseYouTube() {
  if (ytPlayer) {
    try { ytPlayer.pauseVideo(); } catch (e) { console.warn('pause error', e); }
  }
}

// No-UI autoplay: attempt to start playback automatically and retry periodically.
// NOTE: Browsers often block autoplay with sound; this is best-effort. If the
// browser blocks, playback may still need a user gesture.

// Keyboard shortcuts remain available: Space = play/pause, ←/→ = prev/next
document.addEventListener('keydown', (e) => {
  if (!ytIds.length) return;
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (ytPlayer) {
      const state = ytPlayer.getPlayerState && ytPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) pauseYouTube(); else playYouTube();
    }
  }

  if (e.code === 'ArrowRight') {
    e.preventDefault();
    ytIndex = (ytIndex + 1) % ytIds.length;
    if (ytPlayer) ytPlayer.loadVideoById(ytIds[ytIndex]);
  }

  if (e.code === 'ArrowLeft') {
    e.preventDefault();
    ytIndex = (ytIndex - 1 + ytIds.length) % ytIds.length;
    if (ytPlayer) ytPlayer.loadVideoById(ytIds[ytIndex]);
  }
});

// Repeated autoplay attempts: start 3s after load, try every 2s for a while.
function startAutoplayRetries() {
  if (window._ytAutoplayInterval) return;
  let attempts = 0;
  window._ytAutoplayInterval = setInterval(() => {
    attempts++;
    if (ytPlayer) {
      try { ytPlayer.playVideo(); } catch (e) { console.warn('autoplay attempt error', e); }
    }
    if (attempts > 30) {
      clearInterval(window._ytAutoplayInterval);
      window._ytAutoplayInterval = null;
    }
  }, 2000);
}

window.addEventListener('load', () => setTimeout(startAutoplayRetries, 3000));

// log helpful debug info
console.log('ytIds:', ytIds);