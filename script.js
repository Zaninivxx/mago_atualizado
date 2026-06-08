/* ================================================
   MAGO DO EXCEL — Animações Premium
   ================================================ */



document.querySelectorAll('a, button, .benefit, .course-card, .faq-q').forEach(el => {
  el.addEventListener('mouseenter', () => { cursorRing.classList.add('expand'); });
  el.addEventListener('mouseleave', () => { cursorRing.classList.remove('expand'); });
});

/* ── Navbar scroll ── */
const nav = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

/* ── Intersection Observer reveal ── */
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.10 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
  const idx = siblings.indexOf(el);
  el.dataset.delay = idx * 80;
  io.observe(el);
});

/* ── Stagger children observer ── */
const ioStagger = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    Array.from(entry.target.children).forEach((child, i) => {
      setTimeout(() => child.classList.add('visible'), i * 110);
    });
    ioStagger.unobserve(entry.target);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.benefits-grid, .courses-grid').forEach(el => ioStagger.observe(el));

/* ── Animated counters ── */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();
  const isInt = Number.isInteger(target);
  (function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = target * ease;
    el.textContent = (isInt ? Math.round(val) : val.toFixed(1)) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  })(start);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

/* ── Parallax hero grid lines ── */
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.setProperty('--scroll-y', scrolled + 'px');
  }
  // Parallax visual cards
  const cards = document.querySelectorAll('.visual-card');
  cards.forEach((card, i) => {
    const speed = i === 0 ? 0.04 : -0.03;
    card.style.setProperty('--parallax', (scrolled * speed) + 'px');
  });
});

/* ── Magnetic buttons ── */
document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width  / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    btn.style.transform = `translate(${x * .18}px, ${y * .18}px) translateY(-3px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ── Tilt cards (benefit cards) ── */
document.querySelectorAll('.benefit').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect  = card.getBoundingClientRect();
    const cx    = rect.left + rect.width  / 2;
    const cy    = rect.top  + rect.height / 2;
    const dx    = (e.clientX - cx) / (rect.width  / 2);
    const dy    = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `perspective(600px) rotateX(${-dy * 7}deg) rotateY(${dx * 7}deg) scale(1.03)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform .5s ease';
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform .1s ease';
  });
});

/* ── Course card shimmer on hover ── */
document.querySelectorAll('.course-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});

/* ── Typewriter effect on hero eyebrow ── */
function typewriter(el, text, speed = 60) {
  el.textContent = '';
  let i = 0;
  const prefix = '🧙‍♂️ ';
  el.textContent = prefix;
  const interval = setInterval(() => {
    if (i < text.length) {
      el.textContent += text[i++];
    } else {
      clearInterval(interval);
    }
  }, speed);
}

const eyebrow = document.querySelector('.hero .eyebrow');
if (eyebrow) {
  const original = 'Do básico ao avançado';
  setTimeout(() => typewriter(eyebrow, original, 55), 600);
}

/* ── Text scramble on section headings ── */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#ABCDE$';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const len = Math.max(oldText.length, newText.length);
    const promise = new Promise(res => this.resolve = res);
    this.queue = [];
    for (let i = 0; i < len; i++) {
      const from = oldText[i] || '';
      const to   = newText[i] || '';
      const start = Math.floor(Math.random() * 16);
      const end   = start + Math.floor(Math.random() * 16);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '', complete = 0;
    const len = this.queue.length;
    for (let i = 0; i < len; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) { complete++; output += to; }
      else if (this.frame >= start) {
        if (!char || Math.random() < .28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else { output += from; }
    }
    this.el.innerHTML = output;
    if (complete !== len) {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    } else {
      this.resolve();
    }
  }
}

// Apply scramble to section h2 headings on scroll into view
const scrambleObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const text = el.textContent;
      const fx = new TextScramble(el);
      fx.setText(text);
      scrambleObs.unobserve(el);
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('.section-head h2').forEach(h2 => scrambleObs.observe(h2));

/* ── Floating particles ── */
function createParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 8 + 4;
    const x    = Math.random() * 100;
    const delay = Math.random() * 8;
    const dur   = Math.random() * 6 + 8;
    const opacity = Math.random() * 0.4 + 0.1;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${x}%; bottom:-20px;
      animation-delay:${delay}s;
      animation-duration:${dur}s;
      opacity:${opacity};
    `;
    hero.appendChild(p);
  }
}
createParticles();

/* ── FAQ accordion ── */
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ── Table row highlights on hover ── */
document.querySelectorAll('tbody tr').forEach(tr => {
  tr.addEventListener('mouseenter', () => tr.classList.add('row-hover'));
  tr.addEventListener('mouseleave', () => tr.classList.remove('row-hover'));
});

/* ── WhatsApp form submit ── */
document.getElementById('leadForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const nome  = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const whats = document.getElementById('whats').value.trim();
  const curso = document.getElementById('curso').value;
  const numero = '5511999999999';
  const msg = `Olá! Tenho interesse no curso ${curso}.%0A%0ANome: ${encodeURIComponent(nome)}%0AE-mail: ${encodeURIComponent(email)}%0AWhatsApp: ${encodeURIComponent(whats)}`;
  window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');

  const btn = this.querySelector('button[type=submit]');
  btn.textContent = '✓ Enviado!';
  btn.style.background = 'linear-gradient(135deg,#14532d,#16a34a)';
  setTimeout(() => { btn.textContent = 'Enviar pelo WhatsApp →'; btn.style.background = ''; }, 3000);
});

/* ── Scroll progress bar ── */
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct   = (window.scrollY / total * 100).toFixed(2);
  document.getElementById('progressBar').style.width = pct + '%';
});

/* ── Active nav link highlight ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const navObs   = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => navObs.observe(s));

/* ── Ripple on buttons ── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top  = (e.clientY - rect.top)  + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});
