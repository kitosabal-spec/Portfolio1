/* KEITH BERNARD OSABAL — PORTFOLIO SCRIPT */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCanvas();
  initTyping();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initSkillBars();
  initScrollTop();
  initContactForm();
  setFooterYear();
});

/* THEME TOGGLE — Animated Day / Night Transition */
let themeTransitioning = false;

function initTheme() {
  const html = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('kbo-theme') || 'dark';

  html.setAttribute('data-theme', stored);
  updateThemeBtn(stored);

  btn.addEventListener('click', () => {
    if (themeTransitioning) return;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    animateThemeTransition(current, next);
  });
}

function updateThemeBtn(theme) {
  /* icon visibility is handled purely by CSS data-theme attribute */
}

function animateThemeTransition(from, to) {
  const html = document.documentElement;

  /* Cancel any ongoing transition immediately */
  const existing = document.getElementById('theme-snap');
  if (existing) existing.remove();

  /* Switch the theme right away */
  html.setAttribute('data-theme', to);
  localStorage.setItem('kbo-theme', to);
  updateThemeBtn(to);
  initCanvas();

  /* Take a snapshot of just the background canvas to slide out */
  const spaceCanvas = document.getElementById('space-canvas');
  const snap = document.createElement('canvas');
  snap.id = 'theme-snap';
  snap.width = window.innerWidth;
  snap.height = window.innerHeight;
  snap.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
    transform: translateX(0);
    will-change: transform;
  `;

  const ctx = snap.getContext('2d');
  ctx.drawImage(spaceCanvas, 0, 0);
  document.body.appendChild(snap);

  /* Slide it off to the right */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      snap.style.transition = 'transform 0.75s cubic-bezier(0.76, 0, 0.24, 1)';
      snap.style.transform = 'translateX(100%)';
    });
  });

  setTimeout(() => {
    const el = document.getElementById('theme-snap');
    if (el) el.remove();
  }, 800);
}

/* SPACE CANVAS — Slow blinking stars + many shooting stars + clouds */
let animFrame;
const clouds = [];
const shootingStars = [];
let lastSpawnTs = 0;
let spawnInterval = 900;

function initCanvas() {
  cancelAnimationFrame(animFrame);

  const canvas = document.getElementById('space-canvas');
  const ctx = canvas.getContext('2d');

  let W, H;
  const stars = [];
  const STAR_COUNT = 280;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildStars();
    buildClouds();
  }

  function buildStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.3,
        alpha: Math.random() * 0.5 + 0.3,
        speed: Math.random() * 0.0012 + 0.0006,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function buildClouds() {
    clouds.length = 0;
    const count = 7;
    for (let i = 0; i < count; i++) {
      clouds.push({
        x: Math.random() * W * 1.4 - W * 0.2,
        y: Math.random() * H * 0.55 + H * 0.05,
        w: Math.random() * 260 + 140,
        h: Math.random() * 70 + 40,
        speed: Math.random() * 0.12 + 0.04,
        alpha: Math.random() * 0.35 + 0.25,
      });
    }
  }

  function drawClouds(ctx) {
    clouds.forEach(c => {
      c.x += c.speed;
      if (c.x > W + c.w) c.x = -c.w;

      ctx.save();
      ctx.globalAlpha = c.alpha;

      const puffs = [
        { ox: 0, oy: 0, r: c.h * 0.55 },
        { ox: c.w * 0.22, oy: -c.h * 0.18, r: c.h * 0.48 },
        { ox: c.w * 0.44, oy: -c.h * 0.1, r: c.h * 0.52 },
        { ox: c.w * 0.65, oy: -c.h * 0.05, r: c.h * 0.42 },
        { ox: c.w * 0.85, oy: 0, r: c.h * 0.36 },
        { ox: c.w * 0.15, oy: c.h * 0.15, r: c.h * 0.38 },
        { ox: c.w * 0.55, oy: c.h * 0.18, r: c.h * 0.35 },
      ];

      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      puffs.forEach(p => {
        ctx.beginPath();
        ctx.arc(c.x + p.ox, c.y + p.oy, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    });
  }

  function maybeSpawn(ts) {
    if (ts - lastSpawnTs < spawnInterval) return;
    lastSpawnTs = ts;
    spawnInterval = Math.random() * 1200 + 600;

    const batch = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < batch; i++) {
      shootingStars.push({
        x: Math.random() * W * 0.75 + W * 0.05,
        y: Math.random() * H * 0.5,
        len: Math.random() * 220 + 100,
        speed: Math.random() * 5 + 5,
        alpha: 1,
        angle: (Math.PI / 4)
      });
    }
  }

  function drawCelestial() {
    const theme = document.documentElement.getAttribute('data-theme');

    if (theme === 'dark') {
      const mx = W * 0.82, my = H * 0.15, mr = 60;
      const grd = ctx.createRadialGradient(mx - 10, my - 10, 4, mx, my, mr);
      grd.addColorStop(0, 'rgba(230,230,255,0.95)');
      grd.addColorStop(0.6, 'rgba(200,205,240,0.9)');
      grd.addColorStop(1, 'rgba(160,170,220,0.3)');

      const glow = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 2.8);
      glow.addColorStop(0, 'rgba(200,210,255,0.08)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(mx, my, mr * 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(10,14,30,0.55)';
      ctx.beginPath();
      ctx.arc(mx + 14, my - 8, mr - 4, 0, Math.PI * 2);
      ctx.fill();

      const craters = [
        { ox: -14, oy: 10, r: 6 },
        { ox: 10, oy: 20, r: 4 },
        { ox: -5, oy: -18, r: 5 },
        { ox: 18, oy: -5, r: 3 },
        { ox: -22, oy: -8, r: 2.5 },
        { ox: 4, oy: 2, r: 7.5 },
        { ox: -10, oy: 25, r: 3.5 },
        { ox: 25, oy: 15, r: 2 },
        { ox: 0, oy: -28, r: 4 }
      ];
      craters.forEach(c => {
        ctx.fillStyle = 'rgba(150,160,210,0.25)';
        ctx.beginPath();
        ctx.arc(mx + c.ox, my + c.oy, c.r, 0, Math.PI * 2);
        ctx.fill();
      });

    } else {
      const sx = W * 0.82, sy = H * 0.15, sr = 50;

      ctx.save();
      ctx.translate(sx, sy);
      for (let i = 0; i < 16; i++) {
        ctx.rotate((Math.PI * 2) / 16);
        ctx.strokeStyle = 'rgba(255,220,80,0.3)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(sr + 6, 0);
        ctx.lineTo(sr + 28, 0);
        ctx.stroke();
      }
      ctx.restore();

      const sgrd = ctx.createRadialGradient(sx, sy, sr, sx, sy, sr * 4);
      sgrd.addColorStop(0, 'rgba(255,220,80,0.2)');
      sgrd.addColorStop(1, 'transparent');
      ctx.fillStyle = sgrd;
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 4, 0, Math.PI * 2);
      ctx.fill();

      const sbody = ctx.createRadialGradient(sx - 8, sy - 8, 4, sx, sy, sr);
      sbody.addColorStop(0, '#fff7cd');
      sbody.addColorStop(0.5, '#ffd740');
      sbody.addColorStop(1, '#ff9800');
      ctx.fillStyle = sbody;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);

    const theme = document.documentElement.getAttribute('data-theme');
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    if (theme === 'dark') {
      bg.addColorStop(0, '#020510');
      bg.addColorStop(0.5, '#060b1a');
      bg.addColorStop(1, '#080d20');
    } else {
      bg.addColorStop(0, '#b8ceff');
      bg.addColorStop(0.6, '#758bb2');
      bg.addColorStop(1, '#284cb0');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawCelestial();

    if (theme === 'light') drawClouds(ctx);

    stars.forEach(s => {
      const alpha = s.alpha * (0.55 + 0.45 * Math.sin(ts * s.speed + s.phase));
      ctx.fillStyle = theme === 'dark'
        ? `rgba(220,228,255,${alpha})`
        : `rgba(100,130,220,${alpha * 0.35})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    maybeSpawn(ts);

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.alpha -= 0.013;

      if (ss.alpha <= 0) { shootingStars.splice(i, 1); continue; }

      const tx = ss.x - Math.cos(ss.angle) * ss.len;
      const ty = ss.y - Math.sin(ss.angle) * ss.len;

      const grad = ctx.createLinearGradient(tx, ty, ss.x, ss.y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.3, `rgba(180,200,255,${ss.alpha * 0.4})`);
      grad.addColorStop(1, `rgba(255,255,255,${ss.alpha})`);

      ctx.save();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = grad;
      ctx.lineWidth = ss.width;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(ss.x, ss.y);
      ctx.stroke();

      ctx.fillStyle = `rgba(255,255,255,${ss.alpha})`;
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, ss.width * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    animFrame = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  animFrame = requestAnimationFrame(draw);
}

/*
   TYPING ANIMATION */
function initTyping() {
  const el = document.getElementById('typed-role');
  const roles = [
    'Frontend Developer',
    'IT Student',
    'Web Developer',
    'UI/UX Designer',
    'Problem Solver',
  ];
  let ri = 0, ci = 0, deleting = false;

  function tick() {
    const word = roles[ri];
    el.textContent = word.slice(0, ci);

    if (!deleting) {
      ci++;
      if (ci > word.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
      setTimeout(tick, 80);
    } else {
      ci--;
      if (ci === 0) {
        deleting = false;
        ri = (ri + 1) % roles.length;
        setTimeout(tick, 350);
        return;
      }
      setTimeout(tick, 45);
    }
  }
  tick();
}

/*
   NAVBAR */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });

    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === current) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/*
   MOBILE MENU */
function initMobileMenu() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });

  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

function closeMobileMenu() {
  document.getElementById('mobile-menu').classList.remove('open');
  const btn = document.getElementById('hamburger');
  btn.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
}

/*
   SCROLL REVEAL */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 60);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(item => obs.observe(item));
}

/*
   SKILL BARS */
function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');
  let fired = false;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !fired) {
        fired = true;
        fills.forEach(fill => {
          const w = fill.getAttribute('data-width');
          setTimeout(() => { fill.style.width = w + '%'; }, 200);
        });
        obs.disconnect();
      }
    });
  }, { threshold: 0.2 });

  const skillsSection = document.getElementById('skills');
  if (skillsSection) obs.observe(skillsSection);
}

/*
   SCROLL-TO-TOP */
function initScrollTop() {
  const btn = document.getElementById('scroll-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/*
   CONTACT FORM — FormSubmit (native POST, no fetch/AJAX)
   The form POSTs directly to formsubmit.co which handles delivery.
   JS only does validation + loading state; does NOT call e.preventDefault()
   on a valid submit, so the browser sends it natively. */
/*
   CONTACT FORM — FormSubmit (AJAX/Fetch)
   Sends data asynchronously, prevents redirect, shows status, resets form, and hides status after 3s.
*/
function initContactForm() {
  const form = document.getElementById('contact-form');
  const sendBtn = document.getElementById('send-btn');
  const btnText = document.getElementById('btn-text');
  const btnLoad = document.getElementById('btn-loader');
  const btnIcon = document.getElementById('btn-icon');

  // Status messages
  const successMsg = document.getElementById('form-success');
  const errorMsg = document.getElementById('form-error');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    // ALWAYS block the native redirect submission
    e.preventDefault();

    // Hide any previous status messages
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    /* Clear previous inline errors */
    ['err-name', 'err-email', 'err-msg'].forEach(id => {
      document.getElementById(id).textContent = '';
    });

    const name = form.from_name.value.trim();
    const email = form.from_email.value.trim();
    const message = form.message.value.trim();
    let valid = true;

    if (!name) {
      document.getElementById('err-name').textContent = 'Name is required.';
      valid = false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('err-email').textContent = 'A valid email is required.';
      valid = false;
    }
    if (!message) {
      document.getElementById('err-msg').textContent = 'Message cannot be empty.';
      valid = false;
    }

    if (!valid) return;

    /* Valid — show loading state */
    sendBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoad.style.display = 'inline';
    btnIcon.style.display = 'none';

    /* Prepare form data for fetch */
    const formData = new FormData(form);

    /* Send asynchronously to FormSubmit */
    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json' // Forces FormSubmit to return JSON instead of a redirect
      }
    })
      .then(response => {
        if (response.ok) {
          // Show success message
          successMsg.style.display = 'block';
          // Erase all current input
          form.reset();

          // Hide success message after 3 seconds
          setTimeout(() => {
            successMsg.style.display = 'none';
          }, 3000);

        } else {
          // Show error message if server rejects it
          errorMsg.style.display = 'block';

          // Hide error message after 3 seconds
          setTimeout(() => {
            errorMsg.style.display = 'none';
          }, 3000);
        }
      })
      .catch(error => {
        // Show error message on network failure
        errorMsg.style.display = 'block';

        // Hide error message after 3 seconds
        setTimeout(() => {
          errorMsg.style.display = 'none';
        }, 3000);
      })
      .finally(() => {
        // Revert button back to default state regardless of success/fail
        sendBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoad.style.display = 'none';
        btnIcon.style.display = ''; // Let CSS take over display property
      });
  });
}

/*
   TOAST */
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/*
   FOOTER YEAR */
function setFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/*
   SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
