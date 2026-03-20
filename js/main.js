/* ─── Portfolio Main JS ─── */
/* Edit data/portfolio.json to update content — no JS changes needed */

let DATA = {};

async function init() {
  const paths = ['data/portfolio.json', './data/portfolio.json'];
  for (const path of paths) {
    try {
      const res = await fetch(path);
      if (res.ok) { DATA = await res.json(); break; }
    } catch(e) { /* try next */ }
  }
  if (!Object.keys(DATA).length) {
    console.warn('Could not load portfolio.json, using fallback');
    DATA = getFallback();
  }
  render();
  bindEvents();
  initScrollReveal();
  initScrollSpy();
}

/* ─── Render all sections ─── */
function render() {
  renderProfile();
  renderTicker();
  renderServices();
  renderWork();
  renderGear();
  renderContact();
  renderFooter();
}

function renderProfile() {
  const p = DATA.profile;
  if (!p) return;
  document.title = `${p.name} — Portfolio`;
  document.getElementById('h-name').innerHTML = formatName(p.name);
  document.getElementById('h-tagline').textContent = p.tagline;
  document.getElementById('h-location').textContent = p.location;
}

function formatName(name) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    const last = parts.pop();
    return `${parts.join(' ')}<br><em>${last}</em>`;
  }
  return `<em>${name}</em>`;
}

function renderTicker() {
  const items = [
    ...(DATA.gear || []),
    ...(DATA.software || []),
    'Audio Engineering',
    'Video Editing',
    'Podcast Production',
    'Kathmandu, Nepal',
  ];
  const doubled = [...items, ...items];
  const el = document.getElementById('ticker-track');
  el.innerHTML = doubled.map(i => `<span>${i} &nbsp;·&nbsp;</span>`).join('');
}

function renderServices() {
  const grid = document.getElementById('services-grid');
  const svcs = DATA.services || [];
  grid.innerHTML = svcs.map(s => `
    <div class="service-card reveal">
      <span class="service-icon">${s.icon}</span>
      <h3 class="service-title">${s.title}</h3>
      <p class="service-desc">${s.description}</p>
    </div>
  `).join('');
}

function renderWork() {
  renderVideoPanel();
  renderAudioPanel();
  renderPodcastPanel();
}

function renderVideoPanel() {
  const panel = document.getElementById('panel-video');
  const items = DATA.work?.video || [];
  if (!items.length) {
    panel.innerHTML = emptyState('No video work added yet', 'Edit data/portfolio.json to add projects');
    return;
  }
  panel.innerHTML = `<div class="video-grid">${items.map(v => videoCard(v)).join('')}</div>`;
}

function videoCard(v) {
  let thumbHtml;
  if (v.thumbnail) {
    thumbHtml = `<img src="${v.thumbnail}" alt="${v.title}" loading="lazy">`;
  } else if (v.type === 'youtube') {
    const id = getYouTubeId(v.url);
    const src = id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
    thumbHtml = src
      ? `<img src="${src}" alt="${v.title}" loading="lazy">`
      : `<div class="video-thumb-placeholder"><span class="thumb-icon">▶</span></div>`;
  } else {
    thumbHtml = `<div class="video-thumb-placeholder"><span class="thumb-icon">▶</span></div>`;
  }
  return `
    <div class="video-card reveal" data-url="${v.url || ''}" data-type="${v.type || 'youtube'}" onclick="openVideo(this)">
      <div class="video-thumb">
        ${thumbHtml}
        <div class="play-overlay"><div class="play-btn">▶</div></div>
      </div>
      <div class="video-info">
        <div class="video-client">${v.client || ''}</div>
        <h3 class="video-title">${v.title}</h3>
        <p class="video-desc">${v.description || ''}</p>
        <div class="video-tags">${(v.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
    </div>
  `;
}

function renderAudioPanel() {
  const panel = document.getElementById('panel-audio');
  const items = DATA.work?.audio || [];
  if (!items.length) {
    panel.innerHTML = emptyState('No audio work added yet', 'Edit data/portfolio.json to add audio samples');
    return;
  }
  panel.innerHTML = `<div class="audio-grid">${items.map((a, i) => audioCard(a, i)).join('')}</div>`;
}

function audioCard(a, idx) {
  const bars = Array.from({length: 40}, (_, i) => {
    const h = 20 + Math.random() * 60;
    return `<div class="wf-bar" style="height:${h}%" data-idx="${i}"></div>`;
  }).join('');

  return `
    <div class="audio-card reveal">
      <div class="audio-header">
        <div class="audio-meta">
          <div class="audio-client">${a.client || ''}</div>
          <h3 class="audio-title">${a.title}</h3>
        </div>
        <div class="video-tags">${(a.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
      <p class="audio-desc">${a.description || ''}</p>
      <div class="audio-player">
        <button class="play-circle" onclick="toggleAudio('audio-${idx}', this)" aria-label="Play">▶</button>
        <div class="waveform-bar" onclick="seekAudio(event, 'audio-${idx}', this)">
          <div class="audio-progress" id="prog-${idx}"></div>
          <div class="waveform-visual">${bars}</div>
        </div>
        <span class="audio-duration">${a.duration || '--:--'}</span>
      </div>
      <audio id="audio-${idx}" src="${a.url || ''}" data-progid="prog-${idx}" data-wfid="wf-${idx}"></audio>
    </div>
  `;
}

function renderPodcastPanel() {
  const panel = document.getElementById('panel-podcast');
  const items = DATA.work?.podcast || [];
  if (!items.length) {
    panel.innerHTML = emptyState('No podcast work added yet', 'Edit data/portfolio.json to add podcast episodes');
    return;
  }
  panel.innerHTML = `<div class="podcast-grid">${items.map((p, i) => podcastCard(p, i)).join('')}</div>`;
}

function podcastCard(p, idx) {
  let player = '';
  if (p.type === 'embed' && p.url) {
    player = `<div class="podcast-embed"><iframe src="${p.url}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div>`;
  } else if (p.type === 'audio' && p.url) {
    player = `
      <div class="audio-player" style="margin-top:1rem">
        <button class="play-circle" onclick="toggleAudio('pod-audio-${idx}', this)" aria-label="Play">▶</button>
        <div class="waveform-bar" onclick="seekAudio(event, 'pod-audio-${idx}', this)">
          <div class="audio-progress" id="pod-prog-${idx}"></div>
          <div class="waveform-visual">${Array.from({length:30}, () => `<div class="wf-bar" style="height:${20+Math.random()*60}%"></div>`).join('')}</div>
        </div>
        <span class="audio-duration">${p.duration || '--:--'}</span>
      </div>
      <audio id="pod-audio-${idx}" src="${p.url}" data-progid="pod-prog-${idx}"></audio>`;
  }
  return `
    <div class="podcast-card reveal">
      <span class="podcast-icon">◎</span>
      <div class="podcast-client">${p.client || ''}</div>
      <h3 class="podcast-title">${p.title}</h3>
      <p class="podcast-desc">${p.description || ''}</p>
      <div class="video-tags">${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      ${player}
    </div>
  `;
}

function renderGear() {
  const gear = document.getElementById('gear-list');
  const software = document.getElementById('software-list');
  gear.innerHTML = (DATA.gear || []).map(g => `<li>${g}</li>`).join('');
  software.innerHTML = (DATA.software || []).map(s => `<li>${s}</li>`).join('');
}

function renderContact() {
  const p = DATA.profile;
  if (!p) return;
  document.getElementById('c-bio').textContent = p.bio || '';
  const links = document.getElementById('contact-links');
  const items = [];
  if (p.email) items.push({ icon: '✉', label: p.email, href: `mailto:${p.email}` });
  if (p.instagram) items.push({ icon: '◈', label: 'Instagram', href: p.instagram });
  if (p.youtube) items.push({ icon: '▶', label: 'YouTube', href: p.youtube });
  links.innerHTML = items.map(l => `
    <a href="${l.href}" target="_blank" rel="noopener" class="contact-link">
      <span class="link-icon">${l.icon}</span>
      <span>${l.label}</span>
    </a>
  `).join('');

  const emailLink = document.getElementById('email-link');
  if (p.email) { emailLink.href = `mailto:${p.email}`; emailLink.textContent = p.email; }

  const form = document.getElementById('contact-form');
  if (p.email) form.action = `https://formspree.io/f/YOUR_FORM_ID`;
}

function renderFooter() {
  const p = DATA.profile;
  const year = new Date().getFullYear();
  document.getElementById('footer-copy').textContent =
    `© ${year} ${p?.name || 'Portfolio'} — All rights reserved`;
}

function emptyState(title, sub) {
  return `<div class="empty-state"><p class="empty-title">${title}</p><p class="empty-sub">${sub}</p></div>`;
}

/* ─── Audio Player ─── */
const audios = {};

function toggleAudio(id, btn) {
  const el = document.getElementById(id);
  if (!el) return;

  // Pause all others
  Object.entries(audios).forEach(([k, a]) => {
    if (k !== id && !a.paused) {
      a.pause();
      const otherBtn = document.querySelector(`[onclick*="'${k}'"]`);
      if (otherBtn) otherBtn.textContent = '▶';
    }
  });

  audios[id] = el;

  if (el.paused) {
    el.play();
    btn.textContent = '⏸';
  } else {
    el.pause();
    btn.textContent = '▶';
  }

  el.ontimeupdate = () => {
    const pct = (el.currentTime / el.duration) * 100 || 0;
    const prog = document.getElementById(el.dataset.progid);
    if (prog) prog.style.width = pct + '%';
    updateWaveform(el, pct);
  };

  el.onended = () => {
    btn.textContent = '▶';
    const prog = document.getElementById(el.dataset.progid);
    if (prog) prog.style.width = '0%';
    resetWaveform(el);
  };
}

function seekAudio(event, id, bar) {
  const el = document.getElementById(id);
  if (!el || !el.duration) return;
  const rect = bar.getBoundingClientRect();
  const pct = (event.clientX - rect.left) / rect.width;
  el.currentTime = pct * el.duration;
}

function updateWaveform(el, pct) {
  const container = el.previousElementSibling?.querySelector('.waveform-visual');
  if (!container) return;
  const bars = container.querySelectorAll('.wf-bar');
  const playedCount = Math.floor((pct / 100) * bars.length);
  bars.forEach((b, i) => b.classList.toggle('played', i < playedCount));
}

function resetWaveform(el) {
  const container = el.previousElementSibling?.querySelector('.waveform-visual');
  if (!container) return;
  container.querySelectorAll('.wf-bar').forEach(b => b.classList.remove('played'));
}

/* ─── Video Lightbox ─── */
function getYouTubeId(url) {
  if (!url) return null;
  // youtu.be/ID or youtu.be/ID?si=...
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return short[1];
  // youtube.com/watch?v=ID
  const long = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (long) return long[1];
  // youtube.com/embed/ID
  const embed = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embed) return embed[1];
  return null;
}

function openVideo(card) {
  const url = card.dataset.url;
  const type = card.dataset.type;
  if (!url) return;

  let embedUrl = url;
  if (type === 'youtube') {
    const id = getYouTubeId(url);
    if (id) embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    else return;
  }

  const lb = document.getElementById('lightbox');
  const content = document.getElementById('lb-content');
  content.innerHTML = `<iframe src="${embedUrl}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  document.getElementById('lb-content').innerHTML = '';
  document.body.style.overflow = '';
}

/* ─── Tabs ─── */
function bindEvents() {
  // Tabs
  document.querySelectorAll('.work-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.tab;
      document.querySelectorAll('.work-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.work-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${id}`).classList.add('active');
      initScrollReveal();
    });
  });

  // Lightbox close
  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeLightbox();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  // Nav burger
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobile-menu');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      menu.classList.remove('open');
    });
  });

  // Nav logo scroll to top
  document.getElementById('nav-logo').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Contact form
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', e => {
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Sent ✓';
      btn.style.background = 'var(--green)';
    }, 1500);
  });
}

/* ─── Nav scroll state ─── */
function initScrollSpy() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ─── Scroll reveal ─── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal:not(.visible)');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 60);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ─── Fallback data ─── */
function getFallback() {
  return {
    profile: {
      name: "Your Name",
      tagline: "Video Editor · Audio Engineer · Podcast Producer",
      location: "Kathmandu, Nepal",
      bio: "I craft compelling audio-visual stories from the heart of Kathmandu.",
      email: "your@email.com",
    },
    services: [
      { id: "video", icon: "▶", title: "Video Editing", description: "From raw footage to polished final cut. Corporate, documentary, interviews, and creative content." },
      { id: "audio", icon: "◉", title: "Audio Engineering", description: "Professional mixing, mastering, noise reduction, and sound design for any format." },
      { id: "podcast", icon: "◎", title: "Podcast Production", description: "End-to-end podcast production — recording, editing, engineering, and delivery-ready masters." }
    ],
    work: { video: [], audio: [], podcast: [] },
    gear: ["Sony a6700", "Sigma 16mm f/1.4", "DJI Mic Mini", "Zoom H8", "Shure SM58", "AKG P420"],
    software: ["DaVinci Resolve", "iZotope RX", "Reaper"]
  };
}

/* ─── Boot ─── */
document.addEventListener('DOMContentLoaded', init);
