/* ================================================
   MAGO DO EXCEL — Intro Mágica
   ================================================ */

(function() {
  // Bloqueia scroll durante intro
  document.body.style.overflow = 'hidden';

  const canvas  = document.getElementById('introCanvas');
  const overlay = document.getElementById('introOverlay');
  const ctx     = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Paleta ── */
  const C = {
    dark:    '#0a1a0f',
    green:   '#16a34a',
    bright:  '#22c55e',
    gold:    '#d4a845',
    white:   '#ffffff',
  };

  /* ── Estado global ── */
  let phase      = 'idle';   // idle → wand → runes → burst → exit
  let t          = 0;        // tempo global em frames
  let phaseStart = 0;

  /* ── Partículas ── */
  const sparks  = [];
  const bursts  = [];
  const runes   = [];

  /* ── Varinha ── */
  const wand = {
    x: W * .5,
    y: H * .5 + 60,
    angle: -Math.PI * .3,
    len: 90,
    tipX: 0, tipY: 0,
    trail: [],
  };

  /* ── Runas / símbolos mágicos ── */
  const RUNE_CHARS = ['✦','◈','⬡','⟁','✺','⧖','⌬','⬟','∞','⟐'];
  const CIRCLE_R   = Math.min(W, H) * .28;

  function spawnSpark(x, y, vx, vy, color, life) {
    sparks.push({ x, y, vx, vy, color, life, maxLife: life, size: Math.random() * 3 + 1 });
  }

  function spawnBurstParticle(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 18 + 4;
    bursts.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: [C.green, C.bright, C.gold, C.white][Math.floor(Math.random() * 4)],
      life: Math.random() * 60 + 40,
      maxLife: 100,
      size: Math.random() * 5 + 2,
    });
  }

  /* ── Text glow helper ── */
  function glowText(text, x, y, size, color, blur) {
    ctx.save();
    ctx.font = `900 ${size}px 'Bebas Neue', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur  = blur || 20;
    ctx.fillStyle   = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  /* ── Desenha varinha ── */
  function drawWand(progress) {
    const cx = W / 2, cy = H / 2 + 60;
    const endAngle = -Math.PI * .3 + progress * Math.PI * .9;
    wand.angle = endAngle;

    const tx = cx + Math.cos(endAngle) * wand.len;
    const ty = cy + Math.sin(endAngle) * wand.len;
    wand.tipX = tx; wand.tipY = ty;

    // Cabo (marrom/dourado)
    ctx.save();
    ctx.strokeStyle = C.gold;
    ctx.lineWidth   = 6;
    ctx.lineCap     = 'round';
    ctx.shadowColor = C.gold;
    ctx.shadowBlur  = 12;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(endAngle) * 40, cy - Math.sin(endAngle) * 40);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Cristal na ponta
    ctx.beginPath();
    ctx.arc(tx, ty, 7, 0, Math.PI * 2);
    ctx.fillStyle = C.bright;
    ctx.shadowColor = C.bright;
    ctx.shadowBlur  = 24;
    ctx.fill();
    ctx.restore();

    // Trail da ponta
    wand.trail.push({ x: tx, y: ty });
    if (wand.trail.length > 28) wand.trail.shift();
    for (let i = 0; i < wand.trail.length; i++) {
      const a = i / wand.trail.length;
      ctx.save();
      ctx.beginPath();
      ctx.arc(wand.trail[i].x, wand.trail[i].y, a * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,197,94,${a * .7})`;
      ctx.shadowColor = C.bright;
      ctx.shadowBlur  = 10;
      ctx.fill();
      ctx.restore();
    }

    // Faíscas aleatórias na ponta
    if (Math.random() < .5) {
      spawnSpark(tx, ty,
        (Math.random() - .5) * 5,
        (Math.random() - .5) * 5 - 2,
        Math.random() < .5 ? C.bright : C.gold,
        Math.floor(Math.random() * 20 + 10)
      );
    }
  }

  /* ── Círculo de runas ── */
  function drawRuneCircle(progress, alpha) {
    const cx = W / 2, cy = H / 2;
    const r  = CIRCLE_R;

    // Arco do círculo
    ctx.save();
    ctx.strokeStyle = `rgba(22,163,74,${alpha * .6})`;
    ctx.lineWidth   = 2;
    ctx.shadowColor = C.green;
    ctx.shadowBlur  = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.stroke();

    // Segundo círculo menor girando
    ctx.strokeStyle = `rgba(212,168,69,${alpha * .3})`;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r * .72, -Math.PI / 2 - t * .012, -Math.PI / 2 - t * .012 + Math.PI * 2 * progress);
    ctx.stroke();
    ctx.restore();

    // Runas ao longo do arco
    const count = 10;
    for (let i = 0; i < count; i++) {
      const frac = i / count;
      if (frac > progress) break;
      const angle = -Math.PI / 2 + Math.PI * 2 * frac;
      const rx = cx + Math.cos(angle) * r;
      const ry = cy + Math.sin(angle) * r;
      ctx.save();
      ctx.globalAlpha = alpha * (.5 + .5 * Math.sin(t * .08 + i));
      ctx.font = `bold 18px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle   = C.gold;
      ctx.shadowColor = C.gold;
      ctx.shadowBlur  = 14;
      ctx.fillText(RUNE_CHARS[i], rx, ry);
      ctx.restore();
    }

    // Estrelas nos 4 pontos cardinais quando completo
    if (progress >= .99) {
      [0, Math.PI/2, Math.PI, Math.PI*3/2].forEach(a => {
        const sx = cx + Math.cos(a) * r;
        const sy = cy + Math.sin(a) * r;
        ctx.save();
        ctx.globalAlpha = alpha * (.6 + .4 * Math.sin(t * .12));
        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle   = C.bright;
        ctx.shadowColor = C.bright;
        ctx.shadowBlur  = 20;
        ctx.fillText('✦', sx, sy);
        ctx.restore();
      });
    }
  }

  /* ── Título central ── */
  function drawTitle(alpha) {
    const cx = W / 2, cy = H / 2;
    ctx.save();
    ctx.globalAlpha = alpha;
    glowText('MAGO DO', cx, cy - 28, Math.min(W * .08, 72), C.white, 30);
    glowText('EXCEL', cx, cy + 44, Math.min(W * .14, 118), C.bright, 40);
    ctx.restore();
  }

  /* ── CTA "clique para entrar" ── */
  function drawCTA(alpha) {
    const cx = W / 2, cy = H * .78;
    ctx.save();
    ctx.globalAlpha = alpha * (.6 + .4 * Math.sin(t * .07));
    ctx.font = `700 16px 'DM Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = C.white;
    ctx.shadowColor = C.green;
    ctx.shadowBlur  = 12;
    ctx.fillText('✦  Clique ou pressione qualquer tecla para entrar  ✦', cx, cy);
    ctx.restore();
  }

  /* ── Partículas ── */
  function updateSparks() {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy;
      s.vy += .12;
      s.life--;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      const a = s.life / s.maxLife;
      ctx.save();
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * a, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = a;
      ctx.shadowColor = s.color;
      ctx.shadowBlur  = 8;
      ctx.fill();
      ctx.restore();
    }
  }

  function updateBursts() {
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.x += b.vx; b.y += b.vy;
      b.vx *= .94; b.vy *= .94;
      b.life--;
      if (b.life <= 0) { bursts.splice(i, 1); continue; }
      const a = b.life / b.maxLife;
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size * a, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.globalAlpha = a;
      ctx.shadowColor = b.color;
      ctx.shadowBlur  = 12;
      ctx.fill();
      ctx.restore();
    }
  }

  /* ── Fundo estrelas ── */
  const stars = Array.from({ length: 80 }, () => ({
    x: Math.random() * 2000,
    y: Math.random() * 1200,
    r: Math.random() * 1.5 + .3,
    a: Math.random(),
    speed: Math.random() * .02 + .005,
  }));

  function drawStars(alpha) {
    stars.forEach(s => {
      s.a += s.speed;
      ctx.save();
      ctx.beginPath();
      ctx.arc((s.x % W), (s.y % H), s.r, 0, Math.PI * 2);
      ctx.fillStyle = C.white;
      ctx.globalAlpha = alpha * (.2 + .5 * Math.abs(Math.sin(s.a)));
      ctx.fill();
      ctx.restore();
    });
  }

  /* ── Transição de saída ── */
  let exitProgress = 0;
  let exitBurstDone = false;

  function triggerExit() {
    if (phase === 'exit' || phase === 'idle') return;
    phase = 'exit';
    phaseStart = t;
    // Explosão de partículas
    for (let i = 0; i < 120; i++) spawnBurstParticle(W / 2, H / 2);
  }

  /* ── Clique / tecla ── */
  function onInteract() {
    if (phase === 'runes' || phase === 'ready') triggerExit();
    else if (phase === 'wand') {
      // Pula direto para runas
      phase = 'runes';
      phaseStart = t;
    }
  }
  overlay.addEventListener('click', onInteract);
  document.addEventListener('keydown', onInteract);

  /* ── Loop principal ── */
  let raf;
  function loop() {
    t++;
    ctx.clearRect(0, 0, W, H);

    /* Fundo escuro */
    ctx.fillStyle = C.dark;
    ctx.fillRect(0, 0, W, H);

    /* Gradiente radial de fundo */
    const grd = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.min(W,H)*.6);
    grd.addColorStop(0,   'rgba(22,100,34,.35)');
    grd.addColorStop(.5,  'rgba(20,83,45,.1)');
    grd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    /* Stars */
    drawStars(1);

    const elapsed = t - phaseStart;

    /* ── PHASE: idle (pequena pausa antes de começar) ── */
    if (phase === 'idle') {
      if (t > 30) { phase = 'wand'; phaseStart = t; }
    }

    /* ── PHASE: wand ── */
    else if (phase === 'wand') {
      const progress = Math.min(elapsed / 90, 1);
      drawWand(progress);
      if (progress >= 1) { phase = 'runes'; phaseStart = t; }
    }

    /* ── PHASE: runes ── */
    else if (phase === 'runes') {
      // Varinha parada na posição final
      drawWand(1);

      const progress = Math.min(elapsed / 100, 1);
      const eased    = 1 - Math.pow(1 - progress, 2);
      drawRuneCircle(eased, 1);
      updateSparks();

      // Faíscas extras enquanto circulo cresce
      if (elapsed < 100 && Math.random() < .7) {
        spawnSpark(W/2, H/2,
          (Math.random()-.5)*8, (Math.random()-.5)*8 - 1,
          Math.random()<.5 ? C.bright : C.gold,
          Math.floor(Math.random()*25+12)
        );
      }

      if (progress >= 1) {
        phase = 'ready'; phaseStart = t;
        // Flash de conclusão
        for (let i=0;i<30;i++) spawnBurstParticle(W/2, H/2);
      }
    }

    /* ── PHASE: ready ── */
    else if (phase === 'ready') {
      drawWand(1);
      drawRuneCircle(1, 1);
      updateSparks();
      updateBursts();
      drawTitle(Math.min(elapsed / 30, 1));
      drawCTA(Math.min(elapsed / 40, 1));

      // Faíscas contínuas de idle
      if (Math.random() < .15) {
        const a = Math.random() * Math.PI * 2;
        const r = CIRCLE_R;
        spawnSpark(W/2 + Math.cos(a)*r, H/2 + Math.sin(a)*r,
          (Math.random()-.5)*3, -Math.random()*3,
          C.bright, Math.floor(Math.random()*20+8)
        );
      }
    }

    /* ── PHASE: exit ── */
    else if (phase === 'exit') {
      exitProgress = Math.min((t - phaseStart) / 60, 1);
      const alpha = 1 - exitProgress;

      // Fade tudo
      drawRuneCircle(1, alpha);
      drawTitle(alpha);
      updateBursts();
      updateSparks();

      // Flash branco
      if (exitProgress < .3) {
        ctx.save();
        ctx.fillStyle = `rgba(255,255,255,${exitProgress * 1.2})`;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // Overlay escurece para cobrir transição
      ctx.save();
      ctx.fillStyle = `rgba(10,26,15,${Math.max(0, exitProgress * 1.5 - .4)})`;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      if (exitProgress >= 1) {
        cancelAnimationFrame(raf);
        // Remove overlay com fade
        overlay.style.transition = 'opacity .5s ease';
        overlay.style.opacity    = '0';
        setTimeout(() => {
          overlay.remove();
          document.body.style.overflow = '';
        }, 500);
        return;
      }
    }

    raf = requestAnimationFrame(loop);
  }

  raf = requestAnimationFrame(loop);
})();
