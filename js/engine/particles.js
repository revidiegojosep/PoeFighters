/**
 * Particle Effects & Visual Juice for Super Smash Bros Pokemon
 * Handles sparks, lightning arcs, razor leaves, spores, dust puffs,
 * hit bursts and floating damage text.
 */
class ParticleManager {
  constructor() {
    this.particles = [];
    this.lightningBolts = [];
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
      }

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
    // Massive blast ring
    this.particles.push({
      type: 'ring',
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      size: 45,
      lineWidth: 8,
      color: '#ffffff',
      life: 0.6,
      maxLife: 0.6
    });

    this.particles.push({
      type: 'ring',
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      size: 25,
      lineWidth: 6,
      color: color,
      life: 0.5,
      maxLife: 0.5
    });

    // 40 radiant sparks
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 16;
      this.particles.push({
        type: 'spark',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: angle,
        rotSpeed: (Math.random() - 0.5) * 0.5,
        size: 5 + Math.random() * 6,
        color: Math.random() < 0.5 ? '#ffffff' : color,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.9,
        friction: 0.95
      });
    }

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

  spawnRadialBurst(x, y, color = '#ffd700', type = 'electric', radius = 48) {
    this.particles.push({
      type: 'radial_dome',
      x: x,
      y: y,
      radius: radius,
      color: color,
      fillColor: type === 'electric' ? 'rgba(0, 229, 255, 0.18)' : 'rgba(52, 211, 153, 0.2)',
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
    }
  }
}

window.particleManager = new ParticleManager();
