/* ============================================================
   section1.js — full app logic + Three.js Silent Room
============================================================ */

/* ============================================================
   STATIC DATA
============================================================ */
const ENV_LABELS = {
  financial:    { to:'To the man', main:'carrying everyone\nfinancially' },
  family:       { to:'To the man', main:'holding his\nfamily together' },
  loneliness:   { to:'To the man', main:'alone in a\ncrowded room' },
  relationship: { to:'To the man', main:'learning how\nto love right' },
  career:       { to:'To the man', main:'still building\nhis future' },
  grief:        { to:'To the man', main:'grieving\nin silence' },
  selfdoubt:    { to:'To the man', main:'who doubts\nhimself' },
  lost:         { to:'To the man', main:"who hasn't found\nhis direction yet" },
  fatherhood:   { to:'To the man', main:'trying to be\na good father' },
  other:        { to:'To the man', main:'carrying\neverything' }
};

const BURDEN_NAMES = {
  financial:'financial pressure', family:'family expectations',
  loneliness:'loneliness',        relationship:'relationship pain',
  career:'career pressure',       grief:'grief',
  selfdoubt:'self doubt',         lost:'feeling lost',
  fatherhood:'fatherhood',        other:'what you carry'
};

const S5_PROMPTS = [
  { line1:"What do you wish someone",   line2:"understood about",  accent:"you?"      },
  { line1:"What burden do you",         line2:"hide from",         accent:"everyone?" },
  { line1:"What are you",               line2:"tired of",          accent:"carrying?" },
  { line1:"What do you wish you could", line2:"say out",           accent:"loud?"     },
  { line1:"What does being strong",     line2:"actually",          accent:"cost you?" },
];

/* Silent Room messages — tiered by vulnerability */
const T1 = [
  "I'm tired.",
  "Nobody knows\nI'm struggling.",
  "I miss\nmy dad.",
  "I just want\npeace.",
  "I feel so\nalone.",
  "I'm trying\neveryday.",
  "I pray things\nget better.",
  "I wish someone was\nproud of me.",
  "I smile so people\nwon't worry.",
  "I don't know what\nI'm doing with\nmy life.",
  "I'm scared I'll\nnever make it.",
  "I wish I could\ntalk to someone.",
];

const T2 = [
  "I haven't told\nanyone this.",
  "I've been pretending\nto be okay for years.",
  "I'm the strong one.\nWho holds me?",
  "I work so hard.\nNobody sees it.",
  "I miss who\nI used to be.",
  "I don't know who\nI am anymore.",
  "I thought by now\nit'd be different.",
  "I cry alone so\nno one worries.",
];

const T3 = [
  "I almost didn't\nmake it here.",
  "I built everything\nthey wanted.\nI don't know what I want.",
  "I'm proud of you for\nstill being here.",
  "You matter. Even\nin the silence.",
  "Someone is going to\nlove you in ways you\nhaven't imagined yet.",
];

/* ============================================================
   STATE
============================================================ */
let currentBurden  = 'financial';
let currentLetter  = null;
let lastLetterId   = null;
let heartedLetters = new Set();
let currentPrompt  = 0;
let promptTimer    = null;

/* ============================================================
   UTILITY
============================================================ */
function announce(msg) {
  const el = document.getElementById('sr-live');
  if (!el) return;
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = msg; });
}

function setBurden(burden) {
  currentBurden = burden;
  sessionStorage.setItem('mmh_burden', burden);
  lastLetterId  = null;
  loadStories(burden);
  updateCount(burden);
  updateEnvelopeLabel(burden);
  window.dispatchEvent(new Event('mmh:burdenChanged'));
}

/* ============================================================
   SECTION 1
============================================================ */
function initS1() {
  const heroImg   = document.getElementById('hero-img');
  const scrollBtn = document.querySelector('.s1-scroll');
  if (!scrollBtn) return;

  let rafActive = false;

  scrollBtn.addEventListener('click', () =>
    document.getElementById('s2')?.scrollIntoView({ behavior: 'smooth' })
  );
  scrollBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollBtn.click(); }
  });

  document.addEventListener('mousemove', e => {
    if (!heroImg || rafActive) return;
    rafActive = true;
    requestAnimationFrame(() => {
      const mx = (e.clientX / window.innerWidth  - 0.5) * 10;
      const my = (e.clientY / window.innerHeight - 0.5) *  6;
      heroImg.style.transform  = `translate(${mx}px,${my}px) scale(1.06)`;
      heroImg.style.transition = 'transform 0.9s ease-out';
      rafActive = false;
    });
  });

  document.addEventListener('mouseleave', () => {
    if (!heroImg) return;
    heroImg.style.transform  = 'translate(0,0) scale(1)';
    heroImg.style.transition = 'transform 1.5s ease-out';
  });

  setTimeout(() =>
    announce('What burden are you carrying today? You are not alone. Scroll to begin.')
  , 2400);
}

/* ============================================================
   SECTION 2
============================================================ */
function initS2() {
  let selectedCard = null;

  document.querySelectorAll('.b-card').forEach(card => {
    card.addEventListener('click', () => {
      if (selectedCard === card) return;
      if (selectedCard) {
        selectedCard.classList.remove('selected');
        selectedCard.setAttribute('aria-selected', 'false');
      }
      card.classList.add('selected');
      card.setAttribute('aria-selected', 'true');
      selectedCard = card;
      setBurden(card.dataset.burden);
      announce(`Selected: ${card.getAttribute('aria-label')}. Scroll down to read stories.`);
      setTimeout(() => document.getElementById('s3')?.scrollIntoView({ behavior: 'smooth' }), 600);
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });
}

/* ============================================================
   SECTION 3
============================================================ */
async function loadStories(burden) {
  const panel = document.getElementById('stories-panel');
  if (!panel) return;

  panel.innerHTML = Array(4).fill(0).map(() => `
    <div class="story-skeleton" aria-hidden="true">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
    </div>
  `).join('');

  const data    = await API.getStories(burden);
  const perPage = 6;
  let   currentPage = 0;

  panel.innerHTML = '';
  const totalPages = Math.ceil(data.length / perPage);

  const pg = document.createElement('div');
  pg.className = 's3-pagination';
  pg.setAttribute('aria-hidden', 'true');
  panel.appendChild(pg);

  const dots = [];
  if (data.length > perPage) {
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.className = 's3-pg-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Page ${i + 1}`);
      dot.addEventListener('click', () => { currentPage = i; renderPage(i); });
      dots.push(dot);
      pg.appendChild(dot);
    }
  }

  function renderPage(page) {
    panel.querySelectorAll('.story-card').forEach(c => c.remove());
    const slice = data.slice(page * perPage, (page + 1) * perPage);
    slice.forEach((s, i) => {
      const card = document.createElement('article');
      card.className = 'story-card';
      card.setAttribute('aria-label', `Anonymous story from ${s.country}`);
      const sourceMark = s.source === 'community' ? `<span class="story-source">· shared anonymously</span>` : '';
      const text = s.content || s.text || '';
      card.innerHTML = `
        <div>
          <p class="story-text">${text}</p>
          <div class="story-meta">
            <div class="story-dot" aria-hidden="true"></div>
            <span class="story-country">${s.country}</span>
            ${sourceMark}
          </div>
        </div>
        <span class="story-quote-mark" aria-hidden="true">"</span>
      `;
      panel.insertBefore(card, pg);
      setTimeout(() => card.classList.add('visible'), 80 + i * 120);
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === page));
  }

  renderPage(0);
  announce(`Loaded ${data.length} stories.`);
}

async function updateCount(burden) {
  const el = document.getElementById('burden-count');
  if (!el) return;
  const total = await API.getStoryCount(burden);
  el.textContent = total.toLocaleString();
}

/* ============================================================
   SECTION 4
============================================================ */
function updateEnvelopeLabel(burden) {
  const lbl    = ENV_LABELS[burden] || ENV_LABELS.other;
  const toEl   = document.getElementById('env-to-label');
  const mainEl = document.getElementById('env-main-label');
  if (toEl)   toEl.textContent = lbl.to;
  if (mainEl) mainEl.innerHTML = lbl.main.replace('\n', '<br/>');
}

function renderLetter(letter) {
  currentLetter = letter;
  lastLetterId  = letter.id;
  document.getElementById('badge-text').textContent =
    letter.source === 'community' ? 'Written by a real man, anonymously' : 'From the letter bank';
  document.getElementById('letter-modal-title').textContent = letter.title;
  document.getElementById('letter-modal-body').innerHTML    = letter.body.map(p => `<p>${p}</p>`).join('');
  document.getElementById('letter-modal-from').textContent  = `— ${letter.from_line || letter.from}`;
  document.getElementById('heart-count').textContent        = letter.hearts || 0;
  const heartBtn = document.getElementById('letter-heart-btn');
  const hearted  = heartedLetters.has(letter.id);
  heartBtn.classList.toggle('hearted', hearted);
  heartBtn.querySelector('.heart-icon').textContent = hearted ? '♥' : '♡';
}

async function openLetterModal() {
  const letter = await API.getLetter(currentBurden, lastLetterId);
  renderLetter(letter);
  const overlay = document.getElementById('letter-overlay');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.getElementById('open-letter-btn')?.setAttribute('aria-expanded', 'true');
  setTimeout(() => document.getElementById('letter-close-btn')?.focus(), 50);
  document.body.style.overflow = 'hidden';
  announce('Letter opened: ' + letter.title);
}

function closeLetterModal() {
  const overlay = document.getElementById('letter-overlay');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.getElementById('open-letter-btn')?.setAttribute('aria-expanded', 'false');
  document.getElementById('open-letter-btn')?.focus();
  document.body.style.overflow = '';
}

function initS4() {
  document.getElementById('open-letter-btn')?.addEventListener('click', openLetterModal);
  document.getElementById('env-wrap')?.addEventListener('click', openLetterModal);
  document.getElementById('env-wrap')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLetterModal(); }
  });

  document.getElementById('letter-close-btn')?.addEventListener('click', closeLetterModal);
  document.getElementById('letter-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('letter-overlay')) closeLetterModal();
  });

  document.getElementById('letter-next-btn')?.addEventListener('click', async () => {
    const paper = document.getElementById('letter-paper-el');
    paper.style.transition = 'opacity 0.3s ease';
    paper.style.opacity    = '0';
    const letter = await API.getLetter(currentBurden, lastLetterId);
    setTimeout(() => { renderLetter(letter); paper.style.opacity = '1'; }, 300);
  });

  document.getElementById('letter-heart-btn')?.addEventListener('click', async () => {
    if (!currentLetter || heartedLetters.has(currentLetter.id)) return;
    heartedLetters.add(currentLetter.id);
    currentLetter.hearts = (currentLetter.hearts || 0) + 1;
    document.getElementById('heart-count').textContent = currentLetter.hearts;
    document.getElementById('letter-heart-btn').classList.add('hearted');
    document.getElementById('letter-heart-btn').querySelector('.heart-icon').textContent = '♥';
    await API.heartLetter(currentLetter.id);
    announce('You resonated with this letter.');
  });

  const envImg  = document.getElementById('env-img');
  const envWrap = document.getElementById('env-wrap');
  let   envRaf  = false;
  envWrap?.addEventListener('mousemove', e => {
    if (!envImg || envRaf) return;
    envRaf = true;
    requestAnimationFrame(() => {
      const r = envWrap.getBoundingClientRect();
      envImg.style.transform  = `translate(${((e.clientX-r.left)/r.width-.5)*8}px,${((e.clientY-r.top)/r.height-.5)*6}px) scale(1.06)`;
      envImg.style.transition = 'transform 0.6s ease-out';
      envRaf = false;
    });
  });
  envWrap?.addEventListener('mouseleave', () => {
    if (!envImg) return;
    envImg.style.transform  = 'translate(0,0) scale(1)';
    envImg.style.transition = 'transform 1.2s ease-out';
  });
}

/* ============================================================
   WRITE A LETTER MODAL
============================================================ */
function openWriteModal() {
  closeLetterModal();
  setTimeout(() => {
    const overlay = document.getElementById('write-overlay');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.getElementById('write-title-input')?.focus();
    document.body.style.overflow = 'hidden';
  }, 300);
}

function closeWriteModal() {
  const overlay = document.getElementById('write-overlay');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.getElementById('write-success-msg').style.display  = 'none';
  document.getElementById('write-form-content').style.display = '';
  document.getElementById('write-title-input').value          = '';
  document.getElementById('write-body-input').value           = '';
  document.getElementById('write-from-input').value           = '';
  document.getElementById('write-submit-btn').disabled        = false;
  document.getElementById('write-submit-btn').textContent     = 'Send this letter';
}

function initWriteModal() {
  document.getElementById('write-letter-trigger')?.addEventListener('click', openWriteModal);
  document.getElementById('write-close-btn')?.addEventListener('click', closeWriteModal);
  document.getElementById('write-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('write-overlay')) closeWriteModal();
  });

  document.getElementById('write-submit-btn')?.addEventListener('click', async () => {
    const title    = document.getElementById('write-title-input').value.trim();
    const bodyText = document.getElementById('write-body-input').value.trim();
    const from     = document.getElementById('write-from-input').value.trim() || 'Anonymous';
    if (!title || title.length < 5)        { document.getElementById('write-title-input').focus(); return; }
    if (!bodyText || bodyText.length < 50) { document.getElementById('write-body-input').focus(); return; }
    const btn = document.getElementById('write-submit-btn');
    btn.disabled    = true;
    btn.textContent = 'Sending...';
    const result = await API.submitLetter({ title, body: bodyText, from_line: from, burden: currentBurden });
    if (result.ok) {
      document.getElementById('write-form-content').style.display = 'none';
      document.getElementById('write-success-msg').style.display  = 'block';
      announce('Your letter has been submitted.');
    } else {
      btn.disabled    = false;
      btn.textContent = 'Send this letter';
    }
  });
}

/* ============================================================
   SECTION 5
============================================================ */
function initS5() {
  const textarea  = document.getElementById('s5-textarea');
  const charCount = document.getElementById('s5-char-count');
  const submitBtn = document.getElementById('s5-submit-btn');
  const successEl = document.getElementById('s5-success');
  const promptEl  = document.getElementById('s5-heading');
  const navDots   = document.querySelectorAll('.s5-prompt-dot');
  if (!textarea) return;

  if (promptEl) promptEl.style.transition = 'opacity 0.25s ease';

  function setPrompt(index) {
    currentPrompt = index;
    const p = S5_PROMPTS[index];
    if (promptEl) {
      promptEl.style.opacity = '0';
      setTimeout(() => {
        promptEl.innerHTML = `${p.line1}<br/>${p.line2} <span class="accent">${p.accent}</span>`;
        promptEl.style.opacity = '1';
      }, 260);
    }
    navDots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  navDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(promptTimer);
      setPrompt(i);
      promptTimer = setInterval(() => setPrompt((currentPrompt + 1) % S5_PROMPTS.length), 6000);
    });
  });

  setPrompt(0);
  promptTimer = setInterval(() => setPrompt((currentPrompt + 1) % S5_PROMPTS.length), 6000);

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    if (charCount) {
      charCount.textContent = `${len}/500`;
      charCount.classList.toggle('near-limit', len > 420);
    }
    if (submitBtn) submitBtn.disabled = len < 5;
  });

  submitBtn?.addEventListener('click', async () => {
    const text = textarea.value.trim();
    if (!text || text.length < 5) { textarea.focus(); return; }
    submitBtn.disabled  = true;
    submitBtn.innerHTML = '<span>Sharing...</span>';
    const result = await API.saveSubmission({ content: text, burden: currentBurden });
    if (result.ok) {
      if (successEl) successEl.classList.add('show');
      textarea.value = '';
      if (charCount) charCount.textContent = '0/500';
      await loadStories(currentBurden);
      announce('Your truth has been shared anonymously.');
      setTimeout(() => {
        if (successEl) successEl.classList.remove('show');
        submitBtn.disabled  = false;
        submitBtn.innerHTML = '<span>Share anonymously</span><span aria-hidden="true">→</span>';
      }, 4000);
    } else {
      submitBtn.disabled  = false;
      submitBtn.innerHTML = '<span>Share anonymously</span><span aria-hidden="true">→</span>';
    }
  });
}

/* ============================================================
   SECTION 6
============================================================ */
function initS6() {
  const wrap       = document.getElementById('s6-card-wrap');
  const refreshBtn = document.getElementById('s6-refresh-btn');
  if (!wrap) return;

  let currentMsgId = null;
  let heartedMsgs  = new Set();

  function renderCard(msg) {
    currentMsgId = msg.id;
    const burdenName = BURDEN_NAMES[currentBurden] || 'this burden';
    wrap.innerHTML = `
      <div class="s6-card" role="article" aria-label="Message from another man">
        <div class="s6-burden-tag" aria-hidden="true">
          <div class="s6-burden-dot"></div>
          <span>${burdenName}</span>
        </div>
        <p class="s6-message-text">${msg.content}</p>
        <div class="s6-attribution">
          <span>— From a man like you</span>
          <button class="s6-hearts ${heartedMsgs.has(msg.id) ? 'hearted' : ''}"
                  id="s6-heart-btn" aria-label="This message resonated with me">
            <span class="heart-sym">${heartedMsgs.has(msg.id) ? '♥' : '♡'}</span>
            <span id="s6-heart-count">${(msg.hearts || 0).toLocaleString()}</span>
          </button>
        </div>
      </div>
    `;
    document.getElementById('s6-heart-btn')?.addEventListener('click', async () => {
      if (heartedMsgs.has(msg.id)) return;
      heartedMsgs.add(msg.id);
      msg.hearts = (msg.hearts || 0) + 1;
      document.getElementById('s6-heart-count').textContent = msg.hearts.toLocaleString();
      const btn = document.getElementById('s6-heart-btn');
      btn.classList.add('hearted');
      btn.querySelector('.heart-sym').textContent = '♥';
      await API.heartMessage(msg.id);
    });
  }

  function showSkeleton() {
    wrap.innerHTML = `
      <div class="s6-skeleton" aria-hidden="true">
        <div class="s6-skel-line"></div>
        <div class="s6-skel-line"></div>
        <div class="s6-skel-line"></div>
      </div>`;
  }

  async function loadMessage(exclude = null) {
    showSkeleton();
    const msg = await API.getMessage(currentBurden, exclude);
    setTimeout(() => renderCard(msg), 400);
  }

  refreshBtn?.addEventListener('click', () => loadMessage(currentMsgId));
  loadMessage();
  window.addEventListener('mmh:burdenChanged', () => { currentMsgId = null; loadMessage(); });
  window.refreshS6 = () => { currentMsgId = null; loadMessage(); };
}

/* ============================================================
   SECTION 7
============================================================ */
function initS7() {
  const textarea  = document.getElementById('s7-textarea');
  const charCount = document.getElementById('s7-char-count');
  const submitBtn = document.getElementById('s7-submit-btn');
  const successEl = document.getElementById('s7-success');
  const burdenLbl = document.getElementById('s7-burden-label');
  if (!textarea) return;

  function updateBurdenContext() {
    if (burdenLbl) burdenLbl.textContent = BURDEN_NAMES[currentBurden] || 'your burden';
  }
  updateBurdenContext();
  window.addEventListener('mmh:burdenChanged', updateBurdenContext);

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    if (charCount) {
      charCount.textContent = `${len}/300`;
      charCount.classList.toggle('near-limit', len > 250);
    }
    if (submitBtn) submitBtn.disabled = len < 3;
  });

  submitBtn?.addEventListener('click', async () => {
    const text = textarea.value.trim();
    if (!text || text.length < 3) { textarea.focus(); return; }
    submitBtn.disabled  = true;
    submitBtn.innerHTML = '<span>Leaving it...</span>';
    const result = await API.saveMessage({ content: text, burden: currentBurden });
    if (result.ok) {
      if (successEl) successEl.classList.add('show');
      textarea.value = '';
      if (charCount) charCount.textContent = '0/300';
      announce('Your message has been left behind. Another man will find it.');
      if (typeof window.refreshS6 === 'function') setTimeout(window.refreshS6, 1500);
      setTimeout(() => {
        if (successEl) successEl.classList.remove('show');
        submitBtn.disabled  = false;
        submitBtn.innerHTML = `<span>Leave it behind</span>
          <span class="s7-arrow-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12,5 19,12 12,19"/>
            </svg>
          </span>`;
      }, 4000);
    } else {
      submitBtn.disabled  = false;
      submitBtn.innerHTML = '<span>Leave it behind</span>';
    }
  });
}

/* ============================================================
   SECTION 8 — THE SILENT ROOM (Three.js)
   Only initialises when user scrolls into section
============================================================ */
function initS8() {
  const s8Section = document.getElementById('s8');
  if (!s8Section || typeof THREE === 'undefined') return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startSilentRoom();
        observer.disconnect();
      }
    });
  }, { threshold: 0.1 });

  observer.observe(s8Section);
}

function startSilentRoom() {
  /* Pull community messages from backend for the cards */
  API.getAllMessages(30).then(msgs => {
    const communityTexts = msgs.map(m => m.content);
    const allT1 = [...T1, ...communityTexts];
    buildAndLaunch(allT1);
  }).catch(() => {
    buildAndLaunch(T1);
  });
}

function buildAndLaunch(msgList) {
  const canvas = document.getElementById('silent-canvas');
  if (!canvas) return;

  const W = window.innerWidth;
  const H = window.innerHeight;

  /* Renderer */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.toneMapping         = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;

  /* Scene */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog        = new THREE.FogExp2(0x000000, 0.018);

  /* Camera */
  const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 300);
  camera.position.set(0, 2, 12);
  camera.lookAt(0, 1.5, 0);

  /* Lights */
  scene.add(new THREE.AmbientLight(0x0a0806, 0.5));
  const warmLight = new THREE.PointLight(0xc8a050, 2.2, 60);
  warmLight.position.set(0, 18, -5);
  scene.add(warmLight);
  const fill = new THREE.PointLight(0x1a1208, 0.6, 40);
  fill.position.set(-10, 5, 8);
  scene.add(fill);

  /* Floor */
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x050504, roughness: 0.7, metalness: 0.4 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const refl = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshBasicMaterial({ color: 0x0a0806, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  refl.rotation.x = -Math.PI / 2;
  refl.position.y = 0.001;
  scene.add(refl);

  /* Floor dots */
  const dotGeo = new THREE.SphereGeometry(0.04, 4, 4);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xc8a050, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending });
  for (let x = -20; x <= 20; x += 2.5) {
    for (let z = -30; z <= 5; z += 2.5) {
      const dot = new THREE.Mesh(dotGeo, dotMat.clone());
      dot.position.set(x + (Math.random() - 0.5) * 1.2, 0.01, z + (Math.random() - 0.5) * 1.2);
      dot.material.opacity = 0.1 + Math.random() * 0.3;
      scene.add(dot);
    }
  }

  /* Particles */
  const PCOUNT = 6000;
  const pGeo   = new THREE.BufferGeometry();
  const pPos   = new Float32Array(PCOUNT * 3);
  const pVel   = [];
  for (let i = 0; i < PCOUNT; i++) {
    pPos[i*3]   = (Math.random() - 0.5) * 120;
    pPos[i*3+1] =  Math.random() * 40;
    pPos[i*3+2] = (Math.random() - 0.5) * 120;
    pVel.push({ x: (Math.random()-0.5)*0.003, y: (Math.random()-0.5)*0.0015, z: (Math.random()-0.5)*0.003 });
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xc8a050, size: 0.06, transparent: true, opacity: 0.5,
    sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
  })));

  /* Message cards */
 const positions = [
  /* Far left — deep background */
  [-18, 7.0, -18],
  [-22, 3.5, -25],
  [-12, 5.0, -8],
  [-16, 2.0, -30],
  [-8,  8.0, -12],

  /* Left-centre */
  [-6,  5.5, -6],
  [-10, 2.5, -20],

  /* Centre — varying depths */
  [-2,  8.5, -8],
  [2,   3.0, -22],
  [0,   6.0, -35],

  /* Right-centre */
  [6,   7.0, -6],
  [9,   2.5, -18],

  /* Far right — deep background */
  [14,  6.5, -10],
  [18,  4.0, -28],
  [11,  3.0, -8],
  [20,  2.0, -20],
];
  const shuffled = [...msgList].sort(() => Math.random() - 0.5);
  const cardDefs = positions.map((pos, i) => ({
    pos: new THREE.Vector3(pos[0], pos[1], pos[2]),
    text: shuffled[i % shuffled.length] || '',
    floatOffset: Math.random() * Math.PI * 2,
    floatSpeed:  0.3 + Math.random() * 0.4,
  }));

  const cardEls  = [];
  const s8El     = document.getElementById('s8');
  const projVec  = new THREE.Vector3();
  const srList   = document.getElementById('s8-sr-msgs');

  cardDefs.forEach((def, i) => {
    const el = document.createElement('div');
    el.style.cssText = `
      position:absolute; background:rgba(10,10,14,0.72);
      border:1px solid rgba(255,255,255,0.12); border-radius:8px;
      padding:14px 18px; pointer-events:none; opacity:0;
      transition:opacity 1.8s ease; max-width:clamp(120px,14vw,190px);
      backdrop-filter:blur(2px); z-index:8; transform:translate(-50%,-50%);
    `;
    const p = document.createElement('p');
    p.style.cssText = `font-family:'Barlow',sans-serif; font-size:clamp(11px,1.1vw,14px);
      font-weight:300; color:rgba(255,255,255,0.82); line-height:1.5;
      letter-spacing:0.02em; white-space:pre-line;`;
    p.textContent = def.text;
    el.appendChild(p);
    s8El.appendChild(el);
    cardEls.push(el);
    setTimeout(() => { el.style.opacity = '1'; }, 4200 + i * 350);
    if (srList) {
      const li = document.createElement('li');
      li.textContent = def.text.replace(/\n/g, ' ');
      srList.appendChild(li);
    }
  });

  /* Mouse parallax */
  let camTargetX = 0, camTargetY = 0, camX = 0, camY = 0;
  document.addEventListener('mousemove', e => {
    const mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;
    camTargetX = mx * 1.8;
    camTargetY = my * 0.8;
    const cur = document.getElementById('s8-cursor');
    if (cur) { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; }
  });

  /* Time mechanic */
  let timeInRoom = 0, lastTS = performance.now(), paused = false;
  let tier2Done = false, tier3Done = false, thanksDone = false;

  function swapCard(index, newText) {
    if (!cardEls[index]) return;
    const el = cardEls[index];
    el.style.transition = 'opacity 2s ease';
    el.style.opacity    = '0';
    setTimeout(() => { const p = el.querySelector('p'); if (p) p.textContent = newText; el.style.opacity = '1'; }, 2100);
  }

  function checkMilestones() {
    if (!tier2Done && timeInRoom >= 60) {
      tier2Done = true;
      [...T2].sort(() => Math.random() - 0.5).slice(0, 4).forEach((msg, i) => {
        setTimeout(() => swapCard(Math.floor(Math.random() * cardEls.length), msg), i * 8000);
      });
    }
    if (!tier3Done && timeInRoom >= 300) {
      tier3Done = true;
      [...T3].sort(() => Math.random() - 0.5).slice(0, 3).forEach((msg, i) => {
        setTimeout(() => swapCard(Math.floor(Math.random() * cardEls.length), msg), i * 12000);
      });
    }
   if(!thanksDone && timeInRoom>=60){
    thanksDone=true;
    /* Hide the old thank you text — outro screen takes over */
    const outro = document.getElementById('s8-outro');
    if(outro) outro.classList.add('show');
    document.getElementById('sr-live').textContent='Thank you for staying.';
      }
  }

  /* Pause button */
  document.getElementById('s8-pause')?.addEventListener('click', function () {
    paused = !paused;
    this.setAttribute('aria-pressed', paused);
    this.textContent = paused ? 'Resume  ▶' : 'Stay a while  ❙❙';
    lastTS = performance.now();
  });

  /* Resize */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* Fade in UI */
  setTimeout(() => { const m = document.getElementById('s8-man'); if (m) m.classList.add('visible'); }, 3800);
  setTimeout(() => { const t = document.getElementById('s8-tag'); if (t) t.style.opacity = '1'; }, 4500);
  setTimeout(() => { const u = document.getElementById('s8-ui'); if (u) u.style.opacity = '1'; }, 5000);
  setTimeout(() => { const tm = document.getElementById('s8-timer'); if (tm) tm.style.opacity = '1'; }, 7000);

  /* Animation loop */
  function animate() {
    requestAnimationFrame(animate);
    const now   = performance.now();
    const delta = (now - lastTS) / 1000;
    lastTS = now;

    if (!paused) {
      timeInRoom += delta;
      const timerEl = document.getElementById('s8-timer');
      if (timerEl) timerEl.textContent =
        `${String(Math.floor(timeInRoom/60)).padStart(2,'0')}:${String(Math.floor(timeInRoom%60)).padStart(2,'0')}`;
      checkMilestones();
    }

    camX += (camTargetX - camX) * 0.028;
    camY += (camTargetY - camY) * 0.028;
    camera.position.x = camX;
    camera.position.y = 2 - camY * 0.4;
    camera.lookAt(camX * 0.2, 1.5, 0);

    const t = now * 0.001;
    cardDefs.forEach((def, i) => {
      if (!cardEls[i]) return;
      const worldPos = def.pos.clone();
      worldPos.y += Math.sin(t * def.floatSpeed + def.floatOffset) * 0.35;
      projVec.copy(worldPos).project(camera);
      if (projVec.z > 1) { cardEls[i].style.opacity = '0'; return; }
      const sx    = (projVec.x  * 0.5 + 0.5) * window.innerWidth;
      const sy    = (-projVec.y * 0.5 + 0.5) * window.innerHeight;
      const scale = Math.max(0.4, Math.min(1.2, 14 / camera.position.distanceTo(def.pos)));
      cardEls[i].style.left      = sx + 'px';
      cardEls[i].style.top       = sy + 'px';
      cardEls[i].style.transform = `translate(-50%,-50%) scale(${scale})`;
    });

    const pa = pGeo.attributes.position.array;
    for (let i = 0; i < PCOUNT; i++) {
      pa[i*3]   += pVel[i].x; if (pa[i*3]   >  60) pa[i*3]   = -60; if (pa[i*3]   < -60) pa[i*3]   = 60;
      pa[i*3+1] += pVel[i].y; if (pa[i*3+1] >  40) pa[i*3+1] =   0; if (pa[i*3+1] <   0) pa[i*3+1] = 40;
      pa[i*3+2] += pVel[i].z; if (pa[i*3+2] >  60) pa[i*3+2] = -60; if (pa[i*3+2] < -60) pa[i*3+2] = 60;
    }
    pGeo.attributes.position.needsUpdate = true;
    warmLight.intensity = 2.2 + Math.sin(t * 0.7) * 0.08 + Math.sin(t * 1.9) * 0.04;
    renderer.render(scene, camera);
  }

  animate();
}

/* ============================================================
   GLOBAL ESCAPE KEY
============================================================ */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (document.getElementById('write-overlay')?.classList.contains('open'))        closeWriteModal();
  else if (document.getElementById('letter-overlay')?.classList.contains('open')) closeLetterModal();
});

/* ============================================================
   BOOT
============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('mmh_burden');
  if (saved) currentBurden = saved;

  initS1();
  initS2();
  loadStories(currentBurden);
  updateCount(currentBurden);
  updateEnvelopeLabel(currentBurden);
  initS4();
  initWriteModal();
  initS5();
  initS6();
  initS7();
  initS8();
});