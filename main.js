// Central data for themes and demo content
const monthlyThemes = [
  { month: 'January', theme: 'Futuristic Cityscapes' },
  { month: 'February', theme: 'Mythical Companions' },
  { month: 'March', theme: 'Dreamlike Forests' },
  { month: 'April', theme: 'Mechanical Wonders' },
  { month: 'May', theme: 'Underwater Worlds' },
  { month: 'June', theme: 'Celestial Journeys' },
  { month: 'July', theme: 'Everyday Heroes' },
  { month: 'August', theme: 'Color Riot' },
  { month: 'September', theme: 'Architectural Echoes' },
  { month: 'October', theme: 'Night Parade' },
  { month: 'November', theme: 'Nature' },
  { month: 'December', theme: 'Cozy Constellations' }
];

const sampleSubmissions = [
  {
    title: 'Skyline Bloom',
    artist: 'Ivy Tran',
    medium: 'Procreate',
    description: 'A neon-heavy future city where vines climb the skyscrapers.',
    label: 'Featured',
    image: '',
    month: 0,
    year: 2026,
    votes: 1260
  },
  {
    title: 'River Guardian',
    artist: 'Leo Martins',
    medium: 'Watercolor',
    description: 'Mythical spirit guiding travelers across a foggy bend.',
    label: 'New',
    image: '',
    month: 0,
    year: 2026,
    votes: 986
  },
  {
    title: 'Signal',
    artist: 'Amir Rahman',
    medium: 'Vector',
    description: 'Satellite blossoms that transmit music to the stars.',
    label: 'Community pick',
    image: '',
    month: 0,
    year: 2026,
    votes: 1184
  },
  {
    title: 'Glow Steps',
    artist: 'Mila Ortega',
    medium: 'Ink & wash',
    description: 'A fox spirit pacing along floating lanterns.',
    label: 'Vote magnet',
    image: '',
    month: 0,
    year: 2026,
    votes: 1122
  }
];

const STORAGE_KEY = 'ocl-submissions';

// Leaderboard is now dynamically generated from submissions

const milestones = [
  { label: 'Submissions open', detail: '1st of every month' },
  { label: 'Voting starts', detail: 'Last 7 days of the month' },
  { label: 'Voting closes', detail: 'Final minute of the month' },
  { label: 'Winners announced', detail: '1st of next month' }
];

const state = {
  submissions: []
};

function loadSubmissions() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [...sampleSubmissions];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...sampleSubmissions];
  } catch (err) {
    return [...sampleSubmissions];
  }
}

function persistSubmissions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.submissions));
  } catch (err) {
    console.error('Failed to persist submissions', err);
  }
}

function getCurrentTheme(date = new Date()) {
  const monthIndex = date.getMonth();
  return monthlyThemes[monthIndex];
}

function getNextTheme(date = new Date()) {
  const monthIndex = date.getMonth();
  const nextIndex = (monthIndex + 1) % 12;
  return monthlyThemes[nextIndex];
}

function endOfMonth(date = new Date()) {
  const end = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59));
  return end;
}

function formatCountdown(ms) {
  if (ms <= 0) return '00d 00h 00m 00s';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

function updateCountdowns() {
  const now = new Date();
  const submissionDeadline = endOfMonth(now);
  const votingStart = new Date(submissionDeadline);
  votingStart.setUTCDate(submissionDeadline.getUTCDate() - 6);
  votingStart.setUTCHours(0, 0, 0, 0);

  const submissionMs = submissionDeadline - now;
  const votingMs = votingStart - now;

  document.querySelectorAll('[data-countdown-timer]').forEach((el) => {
    el.textContent = formatCountdown(submissionMs);
  });

  document.querySelectorAll('[data-voting-countdown]').forEach((el) => {
    el.textContent = votingMs <= 0 ? 'Voting is live' : formatCountdown(votingMs);
  });

  const statTime = document.getElementById('stat-time');
  if (statTime) statTime.textContent = formatCountdown(submissionMs);
}

function renderThemes() {
  const grid = document.getElementById('theme-grid');
  if (!grid) return;
  grid.innerHTML = '';
  monthlyThemes.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    const badge = idx === new Date().getMonth() ? '<span class="tag">Now</span>' : '';
    card.innerHTML = `${badge}<h3>${item.month}</h3><p>${item.theme}</p>`;
    grid.appendChild(card);
  });
}

function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const filtered = state.submissions.filter(entry => 
    entry.month === currentMonth && entry.year === currentYear
  );
  
  filtered.forEach((entry) => {
    const card = document.createElement('div');
    card.className = 'art-card';

    const thumb = document.createElement('div');
    thumb.className = 'art-thumb';
    if (entry.image) {
      thumb.style.backgroundImage = `url("${entry.image}")`;
    } else {
      thumb.classList.add('placeholder');
      thumb.textContent = 'Add image';
    }

    const body = document.createElement('div');
    body.className = 'art-body';
    body.innerHTML = `
      <strong>${entry.title}</strong>
      <div class="meta">${entry.artist} · ${entry.medium}</div>
      <p>${entry.description}</p>
    `;

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = entry.label || 'New';

    card.appendChild(thumb);
    card.appendChild(body);
    card.appendChild(label);
    grid.appendChild(card);
  });
}

function handleSubmissionForm() {
  const form = document.getElementById('submission-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Check if image was uploaded (from upload.js)
    if (!window.uploadedImageUrl) {
      alert('Please upload an image first');
      return;
    }
    
    const formData = new FormData(form);
    const now = new Date();
    const entry = {
      title: formData.get('title'),
      artist: formData.get('artist'),
      medium: formData.get('medium'),
      description: formData.get('description'),
      image: window.uploadedImageUrl,
      label: 'New',
      month: now.getMonth(),
      year: now.getFullYear(),
      votes: 0
    };
    state.submissions.unshift(entry);
    renderGallery();
    updateSubmissionCount();
    persistSubmissions();
    form.reset();
    alert('Artwork submitted successfully!');
    window.location.href = 'gallery.html';
  });
}

function renderLeaderboard() {
  const grid = document.getElementById('leaderboard');
  if (!grid) return;
  grid.innerHTML = '';
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const filtered = state.submissions.filter(entry => 
    entry.month === currentMonth && entry.year === currentYear
  );
  
  const sorted = filtered.sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 5);
  
  if (sorted.length === 0) {
    grid.innerHTML = '<div class="card"><p>No submissions yet for this month.</p></div>';
    return;
  }
  
  sorted.forEach((entry, idx) => {
    const card = document.createElement('div');
    card.className = 'leaderboard-card';
    
    const thumb = document.createElement('div');
    thumb.className = 'leaderboard-thumb';
    if (entry.image) {
      thumb.style.backgroundImage = `url("${entry.image}")`;
    } else {
      thumb.classList.add('placeholder');
      thumb.textContent = 'No image';
    }
    
    const info = document.createElement('div');
    info.className = 'leaderboard-info';
    info.innerHTML = `
      <div class="leaderboard-rank">#${idx + 1}</div>
      <h3>${entry.title}</h3>
      <p class="meta">${entry.artist}</p>
      <p>${entry.description}</p>
      <div class="tag">${(entry.votes || 0).toLocaleString()} votes</div>
    `;
    
    card.appendChild(thumb);
    card.appendChild(info);
    grid.appendChild(card);
  });
}

function renderTimeline() {
  const container = document.getElementById('timeline');
  if (!container) return;
  container.innerHTML = '';
  milestones.forEach((item) => {
    const step = document.createElement('div');
    step.className = 'step';
    step.innerHTML = `<strong>${item.label}</strong><p>${item.detail}</p>`;
    container.appendChild(step);
  });
}

function renderThemeLabels() {
  const current = getCurrentTheme();
  const next = getNextTheme();
  document.querySelectorAll('[data-current-theme]').forEach((el) => {
    el.textContent = `${current.month}: ${current.theme}`;
  });
  document.querySelectorAll('[data-next-theme]').forEach((el) => {
    el.textContent = `${next.month}: ${next.theme}`;
  });
}

function updateSubmissionCount() {
  const stat = document.getElementById('stat-submissions');
  if (!stat) return;
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const count = state.submissions.filter(entry => 
    entry.month === currentMonth && entry.year === currentYear
  ).length;
  
  stat.textContent = count;
}

function init() {
  state.submissions = loadSubmissions();
  renderThemes();
  renderGallery();
  renderLeaderboard();
  renderTimeline();
  renderThemeLabels();
  updateSubmissionCount();
  handleSubmissionForm();
  updateCountdowns();
  setInterval(updateCountdowns, 1000);
}

init();
