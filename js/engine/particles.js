/**
 * Particle Effects & Visual Juice for Super Smash Bros Pokemon
 * Handles sparks, lightning arcs, razor leaves, spores, dust puffs,
 * hit bursts and floating damage text.
 */
class ParticleManager {
  constructor() {
    this.particles = [];
    this.lightningBolts = [];
    this.screenFlashTimer = 0;
    this.screenFlashDuration = 0;
    this.screenFlashColor = '#ffffff';
  }

  triggerScreenFlash(color = '#ffffff', duration = 0.28) {
    this.screenFlashColor = color;
    this.screenFlashDuration = duration;
    this.screenFlashTimer = duration;
  }

  update(dt) {
    // Update standard particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.gravity) p.vy += p.gravity;
      if (p.friction) p.vx *= p.friction;
      if (p.rotSpeed) p.rot += p.rotSpeed;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update lightning bolts
    for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
      const bolt = this.lightningBolts[i];
      bolt.life -= dt;
      if (bolt.life <= 0) {
        this.lightningBolts.splice(i, 1);
      }
    }

    // Update screen flash
    if (this.screenFlashTimer > 0) {
      this.screenFlashTimer -= dt;
      if (this.screenFlashTimer <= 0) {
        this.screenFlashTimer = 0;
      }
    }
  }

  draw(ctx) {
    // Draw lightning bolts first
    for (const bolt of this.lightningBolts) {
      const alpha = Math.max(0, bolt.life / bolt.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = bolt.color || '#ffff55';
      ctx.lineWidth = bolt.width || 4;
      ctx.shadowColor = bolt.glow || '#ffe600';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      for (let i = 0; i < bolt.points.length; i++) {
        const pt = bolt.points[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // White hot core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, (bolt.width || 4) * 0.45);
      ctx.stroke();
      ctx.restore();
    }

    // Draw individual particles
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      if (p.rot) ctx.rotate(p.rot);

      if (p.type === 'circle') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * (p.scale || 1), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(-p.size * 0.5, -p.size * 1.5, p.size, p.size * 3);
      } else if (p.type === 'leaf') {
        ctx.fillStyle = p.color || '#38d976';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.lineWidth || 3;
        ctx.beginPath();
        const r = p.size * (1 + (1 - alpha) * 2.5);
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'text') {
        ctx.font = `bold ${p.fontSize || 16}px 'Pixelify Sans', 'Outfit', sans-serif`;
        ctx.fillStyle = p.color || '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(p.text, 0, 0);
      } else if (p.type === 'slash') {
        ctx.strokeStyle = p.color || '#ffffff';
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, p.startAngle, p.endAngle);
        ctx.stroke();
      } else if (p.type === 'melee_slash') {
        const t = 1 - (p.life / p.maxLife); // 0 to 1
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.lineWidth || 5;
        ctx.shadowColor = p.glowColor || p.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        const currentRadius = p.radius * (0.8 + t * 0.35);
        ctx.arc(0, 0, currentRadius, p.startAngle, p.endAngle, p.anticlockwise);
        ctx.stroke();

        // Inner white-hot edge
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1.8, (p.lineWidth || 5) * 0.4);
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius * 0.98, p.startAngle + 0.08, p.endAngle - 0.08, p.anticlockwise);
        ctx.stroke();
      } else if (p.type === 'radial_dome') {
        const t = 1 - (p.life / p.maxLife);
        const r = p.radius * (0.6 + t * 0.6);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = (1 - t) * 6;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = p.fillColor || 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'smash_blast_cross') {
        const t = 1 - (p.life / p.maxLife);
        const beamLen = p.size * (0.35 + t * 0.85);
        const coreThick = (1 - t) * (p.thickness || 24);

        ctx.shadowColor = p.glowColor || p.color;
        ctx.shadowBlur = 28;

        // 4 Cardinal energy beams
        const cardinalAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
        for (const a of cardinalAngles) {
          ctx.save();
          ctx.rotate(a);

          // Colored outer energy flare
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -coreThick * 0.5);
          ctx.lineTo(beamLen, 0);
          ctx.lineTo(0, coreThick * 0.5);
          ctx.closePath();
          ctx.fill();

          // White-hot inner core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(0, -coreThick * 0.22);
          ctx.lineTo(beamLen * 0.88, 0);
          ctx.lineTo(0, coreThick * 0.22);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }

        // 4 Diagonal secondary beams (45 deg)
        const diagAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
        for (const a of diagAngles) {
          ctx.save();
          ctx.rotate(a);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -coreThick * 0.26);
          ctx.lineTo(beamLen * 0.58, 0);
          ctx.lineTo(0, coreThick * 0.26);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Blinding core sphere
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, coreThick * 1.35, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'vine_whip') {
        const t = 1 - (p.life / p.maxLife);
        const wave = Math.sin(t * Math.PI) * 16 * p.facing;
        const currentLen = p.length * Math.min(1.0, t * 1.6);
        let angle = 0;
        if (p.dir === 'up') angle = -Math.PI * 0.45;
        else if (p.dir === 'down') angle = Math.PI * 0.42;
        else angle = (p.facing === 1 ? -0.1 : Math.PI + 0.1);

        ctx.strokeStyle = '#15803d'; // Verde oscuro de tallo
        ctx.lineWidth = Math.max(2.5, 6.5 * (1 - t * 0.4));
        ctx.lineCap = 'round';
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        const midX = Math.cos(angle) * (currentLen * 0.5) - Math.sin(angle) * wave;
        const midY = Math.sin(angle) * (currentLen * 0.5) + Math.cos(angle) * wave;
        const tipX = Math.cos(angle) * currentLen;
        const tipY = Math.sin(angle) * currentLen;
        ctx.quadraticCurveTo(midX, midY, tipX, tipY);
        ctx.stroke();

        // Núcleo brillante esmeralda
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = Math.max(1.2, 3.0 * (1 - t * 0.5));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(midX, midY, tipX, tipY);
        ctx.stroke();

        // Hojas y espinas orgánicas a lo largo del látigo
        const leafPositions = [0.3, 0.65, 0.98];
        for (const lp of leafPositions) {
          const lx = Math.cos(angle) * (currentLen * lp);
          const ly = Math.sin(angle) * (currentLen * lp);
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(lx, ly, 3.8 * (1 - t * 0.3), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (p.type === 'shadow_fist') {
        // ★ ESPECTACULAR PUÑO SOMBRA DE GENGAR (Anatomía de puño espectral real) ★
        const t = 1 - (p.life / p.maxLife); // 0.0 a 1.0
        const scale = (p.scale || 1.0) * (0.82 + Math.sin(t * Math.PI) * 0.42);
        ctx.scale(p.facing, 1);

        let rot = 0;
        if (p.dir === 'up') rot = -Math.PI * 0.30;
        else if (p.dir === 'down') rot = Math.PI * 0.30;
        ctx.rotate(rot);

        // 1. Estela de fuego espectral y humo etéreo detrás de la muñeca
        const wispCount = 5;
        for (let w = 0; w < wispCount; w++) {
          const wPhase = t * 12 + w * 1.4;
          const wispX = -28 * scale - w * 11 * scale - Math.sin(wPhase) * 6;
          const wispY = (w - 2) * 8 * scale + Math.cos(wPhase) * 6;
          const wispR = Math.max(1, (11 - w * 1.9) * (1 - t * 0.6) * scale);
          const wGrad = ctx.createRadialGradient(wispX, wispY, 0, wispX, wispY, wispR * 1.6);
          wGrad.addColorStop(0, 'rgba(232, 121, 249, 0.75)');
          wGrad.addColorStop(0.45, 'rgba(147, 51, 234, 0.45)');
          wGrad.addColorStop(1, 'rgba(21, 6, 40, 0)');
          ctx.fillStyle = wGrad;
          ctx.beginPath();
          ctx.arc(wispX, wispY, wispR * 1.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Base de Muñeca y Cuerpo del Puño Cerrado
        ctx.save();
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 24 * scale;

        const wristGrad = ctx.createLinearGradient(-34 * scale, 0, 24 * scale, 0);
        wristGrad.addColorStop(0, '#130424');
        wristGrad.addColorStop(0.4, '#3b0764');
        wristGrad.addColorStop(0.75, '#6b21a8');
        wristGrad.addColorStop(1, '#9333ea');
        ctx.fillStyle = wristGrad;
        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 2.4 * scale;

        ctx.beginPath();
        // Muñeca superior
        ctx.moveTo(-30 * scale, -13 * scale);
        ctx.quadraticCurveTo(-14 * scale, -17 * scale, 0, -19 * scale);
        // Nudillo 1 (Índice)
        ctx.arc(14 * scale, -15 * scale, 7.5 * scale, -Math.PI * 0.7, Math.PI * 0.1);
        // Nudillo 2 (Corazón - nudillo líder de impacto)
        ctx.arc(24 * scale, -5 * scale, 8.8 * scale, -Math.PI * 0.5, Math.PI * 0.2);
        // Nudillo 3 (Anular)
        ctx.arc(19 * scale, 6 * scale, 7.8 * scale, -Math.PI * 0.4, Math.PI * 0.3);
        // Nudillo 4 (Meñique)
        ctx.arc(11 * scale, 15 * scale, 6.8 * scale, -Math.PI * 0.3, Math.PI * 0.5);
        // Curva inferior de la palma hasta la muñeca
        ctx.quadraticCurveTo(-10 * scale, 17 * scale, -30 * scale, 13 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 3. Pulgar cerrado y flexionado sobre los dedos
        ctx.fillStyle = '#581c87';
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2.0 * scale;
        ctx.beginPath();
        ctx.ellipse(5 * scale, 4 * scale, 9.5 * scale, 6.5 * scale, Math.PI * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 4. Relieve y crestas de los nudillos cerrados
        ctx.strokeStyle = '#f5d0fe';
        ctx.lineWidth = 1.9 * scale;
        ctx.beginPath();
        ctx.moveTo(8 * scale, -13 * scale); ctx.lineTo(16 * scale, -13 * scale);
        ctx.moveTo(13 * scale, -4 * scale); ctx.lineTo(26 * scale, -4 * scale);
        ctx.moveTo(10 * scale, 6 * scale);  ctx.lineTo(21 * scale, 6 * scale);
        ctx.stroke();

        // 5. Núcleo Rúnico / Ojo Espectral vigilante en el centro de la mano
        const coreAlpha = Math.sin(t * Math.PI);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.92 * coreAlpha})`;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16 * scale;
        ctx.beginPath();
        ctx.arc(1 * scale, -2 * scale, 4.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // 6. Onda de choque sónica / impacto al frente de los nudillos
        if (t > 0.12 && t < 0.75) {
          const flashT = (t - 0.12) / 0.63;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3.2 * (1 - flashT) * scale;
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 26;
          ctx.beginPath();
          ctx.arc(24 * scale, -2 * scale, (12 + flashT * 26) * scale, -Math.PI * 0.5, Math.PI * 0.5);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.restore();
    }

    // Full screen comic flash overlay
    if (this.screenFlashTimer > 0 && this.screenFlashDuration > 0) {
      const alpha = (this.screenFlashTimer / this.screenFlashDuration) * 0.55;
      ctx.save();
      ctx.fillStyle = this.screenFlashColor || '#ffffff';
      ctx.globalAlpha = alpha;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
  }

  spawnHitSparks(x, y, damage, type = 'normal') {
    const count = Math.min(8 + Math.floor(damage * 1.2), 24);
    const colors = type === 'electric' 
      ? ['#ffff00', '#00e5ff', '#ffffff', '#ffd700']
      : type === 'grass'
      ? ['#48d0b0', '#76ff03', '#ffffff', '#2e7d32']
      : type === 'poison'
      ? ['#a855f7', '#c084fc', '#e879f9', '#7e22ce']
      : type === 'shadow'
      ? ['#9333ea', '#6b21a8', '#38bdf8', '#0f172a']
      : type === 'fire'
      ? ['#ff4500', '#f97316', '#facc15', '#ffffff', '#ef4444']
      : ['#ff4444', '#ffbb00', '#ffffff', '#ff9900'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * (4 + damage * 0.4);
      this.particles.push({
        type: 'spark',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: angle,
        rotSpeed: (Math.random() - 0.5) * 0.4,
        size: 3 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.22 + Math.random() * 0.18,
        maxLife: 0.4,
        friction: 0.92
      });
    }

    // Impact ring
    this.particles.push({
      type: 'ring',
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      size: 14 + damage * 1.2,
      lineWidth: 4,
      color: colors[0],
      life: 0.18,
      maxLife: 0.18
    });

  }

  spawnLightningBolt(x1, y1, x2, y2, color = '#ffff33', glow = '#ffea00', width = 5) {
    const points = [{ x: x1, y: y1 }];
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const segments = Math.max(6, Math.floor(dist / 22));

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const baseX = x1 + (x2 - x1) * t;
      const baseY = y1 + (y2 - y1) * t;
      const perpAngle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
      const offset = (Math.random() * 2 - 1) * (18 + Math.sin(t * Math.PI) * 20);

      points.push({
        x: baseX + Math.cos(perpAngle) * offset,
        y: baseY + Math.sin(perpAngle) * offset
      });
    }
    points.push({ x: x2, y: y2 });

    this.lightningBolts.push({
      points,
      color,
      glow,
      width,
      life: 0.22,
      maxLife: 0.22
    });
  }

  spawnRazorLeaves(x, y, vx, vy, count = 4) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'leaf',
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: vx + (Math.random() - 0.5) * 2,
        vy: vy + (Math.random() - 0.5) * 2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: 0.35 + Math.random() * 0.4,
        size: 7 + Math.random() * 4,
        color: Math.random() < 0.3 ? '#a8f060' : '#48c774',
        life: 0.45 + Math.random() * 0.25,
        maxLife: 0.7,
        gravity: 0.08,
        friction: 0.98
      });
    }
  }

  spawnSmoke(x, y, color = '#f0f3f8', size = 8) {
    this.particles.push({
      type: 'circle',
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -0.6 - Math.random() * 1.2,
      size: size,
      scale: 1,
      color: color,
      life: 0.3 + Math.random() * 0.2,
      maxLife: 0.5,
      friction: 0.92
    });
  }

  spawnBlastKO(x, y, color = '#ff3366') {
    const canvasW = (window.game && window.game.width) ? window.game.width : 1024;
    const canvasH = (window.game && window.game.height) ? window.game.height : 576;

    // Clamping coordinates to screen border: The Smash explosion is ALWAYS in full view!
    const bx = Math.max(34, Math.min(canvasW - 34, x));
    const by = Math.max(34, Math.min(canvasH - 34, y));

    // Screen Shake & Screen Flash (Smash Bros impact)
    if (window.game && typeof window.game.triggerScreenShake === 'function') {
      window.game.triggerScreenShake(24, 0.48);
    }
    this.triggerScreenFlash(color, 0.28);

    // Giant Smash Cross Energy Beam Star
    this.particles.push({
      type: 'smash_blast_cross',
      x: bx,
      y: by,
      vx: 0,
      vy: 0,
      size: 420,
      thickness: 26,
      color: color,
      glowColor: '#ffffff',
      life: 0.65,
      maxLife: 0.65
    });

    // Massive Expanding Shock Rings
    this.particles.push({
      type: 'ring',
      x: bx,
      y: by,
      vx: 0,
      vy: 0,
      size: 70,
      lineWidth: 12,
      color: '#ffffff',
      life: 0.70,
      maxLife: 0.70
    });

    this.particles.push({
      type: 'ring',
      x: bx,
      y: by,
      vx: 0,
      vy: 0,
      size: 45,
      lineWidth: 8,
      color: color,
      life: 0.60,
      maxLife: 0.60
    });

    this.particles.push({
      type: 'ring',
      x: bx,
      y: by,
      vx: 0,
      vy: 0,
      size: 30,
      lineWidth: 6,
      color: '#facc15',
      life: 0.50,
      maxLife: 0.50
    });

    // 55 radiant high-velocity sparks directed into/across the arena
    const inAngle = Math.atan2((canvasH * 0.5) - by, (canvasW * 0.5) - bx);
    for (let i = 0; i < 55; i++) {
      const angle = inAngle + (Math.random() - 0.5) * Math.PI * 1.5;
      const speed = 7 + Math.random() * 22;
      this.particles.push({
        type: 'spark',
        x: bx,
        y: by,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: angle,
        rotSpeed: (Math.random() - 0.5) * 0.6,
        size: 5 + Math.random() * 7,
        color: Math.random() < 0.4 ? '#ffffff' : (Math.random() < 0.5 ? '#facc15' : color),
        life: 0.55 + Math.random() * 0.4,
        maxLife: 0.95,
        friction: 0.94
      });
    }

    // Comic "¡FUERA!" floating impact badge at the blast edge
    this.spawnFloatingText(bx, by > canvasH * 0.5 ? by - 36 : by + 24, '💥 ¡FUERA!', '#ffffff', 30);
  }

  spawnFloatingText(x, y, text, color = '#ffffff', fontSize = 18) {
    this.particles.push({
      type: 'text',
      x: x,
      y: y,
      text: text,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -2.2,
      color: color,
      fontSize: fontSize,
      life: 0.85,
      maxLife: 0.85,
      friction: 0.96
    });
  }

  spawnMeleeSlash(x, y, dir, facing, color = '#ffd700', type = 'electric', radius = 34, isAir = false) {
    let startAngle, endAngle, anticlockwise = false;
    let spawnX = x + (dir === 'up' ? 8 * facing : dir === 'down' ? (isAir ? 4 * facing : 24 * facing) : 22 * facing);
    let spawnY = y - (dir === 'up' ? (isAir ? 42 : 36) : dir === 'down' ? (isAir ? -6 : 12) : 22);

    if (dir === 'up') {
      // Upward rising crescent blade (hits above head)
      if (facing === 1) {
        startAngle = -Math.PI * 0.95;
        endAngle = -Math.PI * 0.05;
      } else {
        startAngle = -Math.PI * 0.05;
        endAngle = -Math.PI * 0.95;
        anticlockwise = true;
      }
    } else if (dir === 'down') {
      if (isAir) {
        // Aerial downward meteor spike slash directly beneath the feet
        if (facing === 1) {
          startAngle = Math.PI * 0.05;
          endAngle = Math.PI * 0.95;
        } else {
          startAngle = Math.PI * 0.95;
          endAngle = Math.PI * 0.05;
          anticlockwise = true;
        }
      } else {
        // Ground low sweep along the floor
        if (facing === 1) {
          startAngle = 0;
          endAngle = Math.PI * 0.45;
        } else {
          startAngle = Math.PI;
          endAngle = Math.PI * 0.55;
          anticlockwise = true;
        }
      }
    } else if (dir === 'side') {
      // Powerful forward horizontal slash
      if (facing === 1) {
        startAngle = -Math.PI * 0.38;
        endAngle = Math.PI * 0.38;
      } else {
        startAngle = Math.PI * 0.62;
        endAngle = Math.PI * 1.38;
      }
    } else {
      // Neutral quick slash arc
      if (facing === 1) {
        startAngle = -Math.PI * 0.35;
        endAngle = Math.PI * 0.35;
      } else {
        startAngle = Math.PI * 0.65;
        endAngle = Math.PI * 1.35;
      }
    }

    this.particles.push({
      type: 'melee_slash',
      x: spawnX,
      y: spawnY,
      radius: radius,
      startAngle: startAngle,
      endAngle: endAngle,
      anticlockwise: anticlockwise,
      color: color,
      glowColor: color,
      lineWidth: dir === 'side' ? 6 : dir === 'up' ? 5 : 4,
      life: 0.16,
      maxLife: 0.16
    });

    // Associated micro particles along the slash
    if (type === 'electric') {
      for (let i = 0; i < 4; i++) {
        const a = startAngle + (endAngle - startAngle) * (i / 3);
        const px = spawnX + Math.cos(a) * radius;
        const py = spawnY + Math.sin(a) * radius;
        this.particles.push({
          type: 'spark',
          x: px,
          y: py,
          vx: Math.cos(a) * 3,
          vy: Math.sin(a) * 3,
          rot: a,
          rotSpeed: 0.2,
          size: 3 + Math.random() * 2,
          color: Math.random() < 0.5 ? '#ffffff' : color,
          life: 0.18,
          maxLife: 0.18,
          friction: 0.9
        });
      }
    } else if (type === 'grass') {
      for (let i = 0; i < 3; i++) {
        const a = startAngle + (endAngle - startAngle) * (i / 2);
        const px = spawnX + Math.cos(a) * radius;
        const py = spawnY + Math.sin(a) * radius;
        this.spawnRazorLeaves(px, py, Math.cos(a) * 2, Math.sin(a) * 2, 1);
      }
    } else {
      for (let i = 0; i < 3; i++) {
        const a = startAngle + (endAngle - startAngle) * (i / 2);
        const px = spawnX + Math.cos(a) * radius;
        const py = spawnY + Math.sin(a) * radius;
        this.spawnSmoke(px, py, '#ffffff', 4);
      }
    }
  }

  spawnSlash(x, y, facing = 1, color = '#ffffff', radius = 32) {
    const startAngle = facing === 1 ? -Math.PI * 0.45 : Math.PI * 0.55;
    const endAngle = facing === 1 ? Math.PI * 0.45 : Math.PI * 1.45;
    this.particles.push({
      type: 'slash',
      x: x,
      y: y,
      radius: radius,
      startAngle: startAngle,
      endAngle: endAngle,
      color: color,
      size: 4,
      life: 0.16,
      maxLife: 0.16
    });
    this.spawnMeleeSlash(x, y, 'side', facing, color, 'normal', radius);
  }

  spawnVineWhip(x, y, dir, facing, length = 68) {
    let spawnX = x + (dir === 'up' ? 6 * facing : dir === 'down' ? 10 * facing : 22 * facing);
    let spawnY = y - (dir === 'up' ? 36 : dir === 'down' ? 6 : 20);

    this.particles.push({
      type: 'vine_whip',
      x: spawnX,
      y: spawnY,
      dir: dir,
      facing: facing,
      length: length,
      life: 0.20,
      maxLife: 0.20
    });

    this.spawnMeleeSlash(x, y, dir, facing, '#22c55e', 'grass', length * 0.65, dir === 'down');
  }

  spawnRadialBurst(x, y, color = '#ffd700', type = 'electric', radius = 48) {
    this.particles.push({
      type: 'radial_dome',
      x: x,
      y: y,
      radius: radius,
      color: color,
      fillColor: type === 'electric' 
        ? 'rgba(0, 229, 255, 0.18)' 
        : type === 'poison'
        ? 'rgba(168, 85, 247, 0.28)'
        : 'rgba(52, 211, 153, 0.2)',
      life: 0.28,
      maxLife: 0.28
    });

    if (type === 'electric') {
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const dist = radius * 0.85;
        this.spawnLightningBolt(x, y, x + Math.cos(ang) * dist, y + Math.sin(ang) * dist, '#ffffff', color, 3);
      }
    } else if (type === 'grass') {
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        this.spawnRazorLeaves(x, y, Math.cos(ang) * 4, Math.sin(ang) * 4, 1);
      }
    } else if (type === 'poison') {
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const dist = radius * (0.35 + Math.random() * 0.5);
        this.spawnSmoke(x + Math.cos(ang) * dist, y + Math.sin(ang) * dist, '#a855f7', 6);
        this.spawnHitSparks(x + Math.cos(ang) * dist, y + Math.sin(ang) * dist, 1, 'poison');
      }
    }
  }

  spawnShadowFist(x, y, dir = 'side', facing = 1, powerScale = 1.0) {
    const fistX = x + facing * 24;
    const fistY = y - (dir === 'up' ? 26 : 18);

    this.particles.push({
      type: 'shadow_fist',
      x: fistX,
      y: fistY,
      dir: dir,
      facing: facing,
      scale: powerScale,
      life: 0.28,
      maxLife: 0.28,
      vx: (dir === 'up' ? 2.5 * facing : 8.5 * facing),
      vy: (dir === 'up' ? -7.0 : -0.5),
      friction: 0.90
    });

    // Humo fantasmal y chispas de impacto espectral
    for (let i = 0; i < 9; i++) {
      const angle = (Math.PI * 2 * i) / 9;
      this.spawnSmoke(fistX + Math.cos(angle) * 12, fistY + Math.sin(angle) * 12, '#9333ea', 7);
      this.spawnHitSparks(fistX + facing * 22, fistY, 3, 'shadow');
    }
  }

  spawnFlameStream(x, y, facing, length = 110, width = 26) {
    const colors = ['#ea580c', '#f97316', '#facc15', '#ffffff', '#ef4444'];
    for (let i = 0; i < 4; i++) {
      const spread = (Math.random() - 0.5) * width;
      const speed = (length * 0.08) + Math.random() * 4;
      const angle = (facing === 1 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.35;
      this.particles.push({
        type: 'circle',
        x: x,
        y: y + spread,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        size: 5 + Math.random() * 9,
        scale: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.18 + Math.random() * 0.16,
        maxLife: 0.34,
        friction: 0.94
      });
    }
  }

  spawnFieryExplosion(x, y, radius = 55) {
    this.spawnRadialBurst(x, y, '#ea580c', 'electric', radius);
    this.spawnRadialBurst(x, y, '#facc15', 'electric', radius * 0.7);
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius * 0.8;
      this.spawnSmoke(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, '#f97316', 10);
      this.spawnHitSparks(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 4, 'fire');
    }
  }

  spawnRockShards(x, y, count = 12) {
    const rockColors = ['#57534e', '#78716c', '#a8a29e', '#44403c'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI) - Math.PI * 0.8;
      const speed = 3 + Math.random() * 7;
      this.particles.push({
        type: 'spark',
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.5,
        size: 4 + Math.random() * 5,
        color: rockColors[Math.floor(Math.random() * rockColors.length)],
        life: 0.35 + Math.random() * 0.25,
        maxLife: 0.6,
        gravity: 0.28,
        friction: 0.96
      });
    }
  }
}

window.particleManager = new ParticleManager();
