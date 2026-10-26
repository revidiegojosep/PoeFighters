/**
 * Stage & Arena System (Pokémon League Grand Battlefield)
 * Manages solid ground, semi-solid platforms, blast zones, respawn points,
 * and high-aesthetic dynamic rendering (volumetric lights, stadium crowd,
 * glowing crystals, runic obsidian island, cyber-turf, and particle ambience).
 */
class Stage {
  constructor(width = 1024, height = 576) {
    this.width = width;
    this.height = height;

    // Center main solid island - ENLARGED to 680px (+31% wider battlefield)
    const stageWidth = 680;
    const stageX = (this.width - stageWidth) / 2; // 172
    const stageY = 430;

    this.solidPlatforms = [
      {
        id: 'main_ground',
        x: stageX,
        y: stageY,
        width: stageWidth,
        height: 190,
        color: '#1e293b',
        grassColor: '#10b981',
        type: 'solid'
      }
    ];

    // Enlarged Tri-plat Battlefield layout (160px & 170px wide platforms)
    const platW = 160;
    const platH = 14;
    this.semiSolidPlatforms = [
      {
        id: 'plat_left',
        x: stageX + 38, // 210
        y: stageY - 105, // 325
        width: platW,
        height: platH,
        color: '#1e293b',
        accentColor: '#38bdf8', // Neon Cyan
        glowColor: 'rgba(56, 189, 248, 0.45)',
        type: 'semi'
      },
      {
        id: 'plat_right',
        x: stageX + stageWidth - platW - 38, // 654
        y: stageY - 105, // 325
        width: platW,
        height: platH,
        color: '#1e293b',
        accentColor: '#f43f5e', // Neon Ruby / Coral
        glowColor: 'rgba(244, 63, 94, 0.45)',
        type: 'semi'
      },
      {
        id: 'plat_top',
        x: (this.width - 170) / 2, // 427
        y: stageY - 198, // 232
        width: 170,
        height: platH,
        color: '#1e293b',
        accentColor: '#a855f7', // Electric Violet
        glowColor: 'rgba(168, 85, 247, 0.45)',
        type: 'semi'
      }
    ];

    // Blast zones (bounds outside screen where player is KO'd)
    this.blastZones = {
      left: -170,
      right: this.width + 170,
      top: -180,
      bottom: this.height + 140
    };

    // Respawn position (center floating respawn halo)
    this.respawnX = this.width / 2;
    this.respawnY = 200;

    // Drifting clouds & nebulas
    this.clouds = [
      { x: 40, y: 50, speed: 7, scale: 1.3, alpha: 0.08 },
      { x: 320, y: 95, speed: 11, scale: 0.95, alpha: 0.06 },
      { x: 680, y: 65, speed: 6, scale: 1.4, alpha: 0.09 },
      { x: 920, y: 115, speed: 9, scale: 0.85, alpha: 0.07 }
    ];

    // Starfield for deep cosmic stadium sky
    this.stars = [];
    for (let i = 0; i < 48; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.65),
        radius: Math.random() * 1.5 + 0.5,
        twinkleSpeed: Math.random() * 2.5 + 1.2,
        twinklePhase: Math.random() * Math.PI * 2,
        color: ['#ffffff', '#bae6fd', '#fbcfe8', '#fef08a'][Math.floor(Math.random() * 4)]
      });
    }

    // Crowd lightsticks in distant stadium audience
    this.crowdLights = [];
    const crowdCount = 55;
    for (let i = 0; i < crowdCount; i++) {
      this.crowdLights.push({
        x: (i / crowdCount) * (this.width + 40) - 20,
        y: this.height - 40 + (Math.sin(i * 1.3) * 12) + (Math.random() * 8),
        color: ['#38bdf8', '#f43f5e', '#facc15', '#a855f7', '#34d399'][i % 5],
        bobSpeed: 1.5 + Math.random() * 2.0,
        bobPhase: Math.random() * Math.PI * 2,
        size: Math.random() * 2.5 + 2
      });
    }

    // Underside energy motes floating up from antigravity core
    this.energyMotes = [];
    for (let i = 0; i < 20; i++) {
      this.energyMotes.push({
        x: stageX + 120 + Math.random() * (stageWidth - 240),
        y: stageY + 130 + Math.random() * 50,
        vx: (Math.random() - 0.5) * 12,
        vy: -15 - Math.random() * 20,
        life: Math.random() * 2.0,
        maxLife: 2.0 + Math.random() * 1.5,
        color: Math.random() < 0.5 ? '#38bdf8' : '#a855f7',
        size: Math.random() * 2.2 + 1.2
      });
    }

    this.time = 0;
  }

  isOutsideBlastZone(x, y) {
    return (
      x < this.blastZones.left ||
      x > this.blastZones.right ||
      y < this.blastZones.top ||
      y > this.blastZones.bottom
    );
  }

  update(dt) {
    this.time += dt;

    // Cloud drift
    for (const c of this.clouds) {
      c.x += c.speed * dt;
      if (c.x > this.width + 200) {
        c.x = -200;
      }
    }

    // Energy motes update
    const mainPlat = this.solidPlatforms[0];
    for (const m of this.energyMotes) {
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.life -= dt;
      if (m.life <= 0) {
        m.life = m.maxLife;
        m.x = mainPlat.x + 120 + Math.random() * (mainPlat.width - 240);
        m.y = mainPlat.y + 140 + Math.random() * 40;
      }
    }
  }

  drawBackground(ctx) {
    // 1. Cosmic Stadium Sky Gradient
    const sky = ctx.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, '#040712');
    sky.addColorStop(0.35, '#0b1129');
    sky.addColorStop(0.7, '#1b1845');
    sky.addColorStop(1, '#2c1a59');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Twinkling Starfield
    ctx.save();
    for (const star of this.stars) {
      const alpha = 0.35 + 0.65 * Math.sin(this.time * star.twinkleSpeed + star.twinklePhase);
      ctx.globalAlpha = Math.max(0.1, alpha);
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Stadium Arch & Holographic Structure in far distance
    ctx.save();
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.08)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.width / 2, this.height * 1.15, this.width * 0.62, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.width / 2, this.height * 1.15, this.width * 0.72, Math.PI, 0);
    ctx.stroke();

    // Stadium vertical light trusses
    for (let tx = 80; tx < this.width; tx += 120) {
      ctx.beginPath();
      ctx.moveTo(tx, 0);
      ctx.lineTo(tx, this.height - 100);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Sweeping Volumetric Stadium Floodlights (4 dynamic beams)
    ctx.save();
    const drawLightBeam = (lx, ly, baseAngle, swingSpeed, swingAmp, colorHex) => {
      const angle = baseAngle + Math.sin(this.time * swingSpeed) * swingAmp;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);

      const beamH = this.height * 1.6;
      const beam = ctx.createLinearGradient(0, 0, 0, -beamH);
      beam.addColorStop(0, `${colorHex}44`);
      beam.addColorStop(0.35, `${colorHex}18`);
      beam.addColorStop(0.8, `${colorHex}05`);
      beam.addColorStop(1, `${colorHex}00`);
      ctx.fillStyle = beam;

      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(16, 0);
      ctx.lineTo(160, -beamH);
      ctx.lineTo(-160, -beamH);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    drawLightBeam(90, this.height - 30, -0.28, 0.65, 0.16, '#38bdf8');
    drawLightBeam(this.width - 90, this.height - 30, 0.28, 0.7, 0.16, '#f43f5e');
    drawLightBeam(this.width * 0.35, this.height - 20, -0.08, 0.5, 0.12, '#a855f7');
    drawLightBeam(this.width * 0.65, this.height - 20, 0.08, 0.55, 0.12, '#38bdf8');
    ctx.restore();

    // 5. Drifting Clouds / Nebulae
    for (const c of this.clouds) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${c.alpha})`;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 40 * c.scale, 0, Math.PI * 2);
      ctx.arc(c.x + 35 * c.scale, c.y - 12 * c.scale, 52 * c.scale, 0, Math.PI * 2);
      ctx.arc(c.x + 80 * c.scale, c.y, 42 * c.scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. Distant Stadium Bleachers & Mountain Skyline
    ctx.save();
    ctx.fillStyle = '#060a14';
    ctx.beginPath();
    ctx.moveTo(0, this.height - 75);
    ctx.lineTo(140, this.height - 155);
    ctx.lineTo(280, this.height - 105);
    ctx.lineTo(512, this.height - 195);
    ctx.lineTo(740, this.height - 105);
    ctx.lineTo(880, this.height - 155);
    ctx.lineTo(this.width, this.height - 75);
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();

    // 7. Stadium Audience Crowd with Waving Lightsticks
    for (const cl of this.crowdLights) {
      const bobY = cl.y + Math.sin(this.time * cl.bobSpeed + cl.bobPhase) * 5;
      ctx.save();
      ctx.shadowColor = cl.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = cl.color;
      ctx.beginPath();
      ctx.arc(cl.x, bobY, cl.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  drawPlatforms(ctx) {
    const mainP = this.solidPlatforms[0];

    // 1. Draw Underside Levitation Antigravity Core & Crystals
    ctx.save();
    const coreCx = mainP.x + mainP.width / 2;
    const coreCy = mainP.y + mainP.height - 18;

    // Glowing Antigravity Levitation Core
    const corePulse = 1.0 + 0.18 * Math.sin(this.time * 3.5);
    const coreGlow = ctx.createRadialGradient(coreCx, coreCy, 4, coreCx, coreCy, 60 * corePulse);
    coreGlow.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
    coreGlow.addColorStop(0.35, 'rgba(168, 85, 247, 0.45)');
    coreGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(coreCx, coreCy, 60 * corePulse, 0, Math.PI * 2);
    ctx.fill();

    // Floating Rising Energy Motes
    for (const m of this.energyMotes) {
      ctx.save();
      const alpha = m.life / m.maxLife;
      ctx.fillStyle = m.color;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = m.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Subterranean Crystal Formations hanging from the rock
    const drawCrystal = (cx, cy, cw, ch, colorHex) => {
      ctx.save();
      ctx.shadowColor = colorHex;
      ctx.shadowBlur = 12;
      ctx.fillStyle = colorHex;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + cw * 0.5, cy + ch * 0.6);
      ctx.lineTo(cx, cy + ch);
      ctx.lineTo(cx - cw * 0.5, cy + ch * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    drawCrystal(mainP.x + 110, mainP.y + mainP.height - 35, 14, 38, '#38bdf8');
    drawCrystal(mainP.x + 130, mainP.y + mainP.height - 25, 10, 26, '#a855f7');
    drawCrystal(mainP.x + mainP.width - 110, mainP.y + mainP.height - 35, 14, 38, '#f43f5e');
    drawCrystal(mainP.x + mainP.width - 130, mainP.y + mainP.height - 25, 10, 26, '#38bdf8');
    ctx.restore();

    // 2. Draw Main Solid Floating Island (Chiseled Obsidian Geometry)
    for (const p of this.solidPlatforms) {
      ctx.save();

      // Deep obsidian gradient body
      const stoneGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
      stoneGrad.addColorStop(0, '#1e293b');
      stoneGrad.addColorStop(0.35, '#0f172a');
      stoneGrad.addColorStop(0.75, '#090d16');
      stoneGrad.addColorStop(1, '#020617');
      ctx.fillStyle = stoneGrad;

      // Chiseled floating island polygon (tapered floating mountain base)
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.width, p.y);
      ctx.lineTo(p.x + p.width - 45, p.y + 75);
      ctx.lineTo(p.x + p.width - 110, p.y + p.height);
      ctx.lineTo(p.x + 110, p.y + p.height);
      ctx.lineTo(p.x + 45, p.y + 75);
      ctx.closePath();
      ctx.fill();

      // Stone border & bevels
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Runic Cyber Circuits etched in the stone
      ctx.save();
      const pulseRune = 0.4 + 0.35 * Math.sin(this.time * 2.2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${pulseRune})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;

      // Circuit lines
      ctx.beginPath();
      // Left branch
      ctx.moveTo(p.x + 85, p.y + 35);
      ctx.lineTo(p.x + 160, p.y + 65);
      ctx.lineTo(p.x + 210, p.y + 110);
      // Right branch
      ctx.moveTo(p.x + p.width - 85, p.y + 35);
      ctx.lineTo(p.x + p.width - 160, p.y + 65);
      ctx.lineTo(p.x + p.width - 210, p.y + 110);
      ctx.stroke();
      ctx.restore();

      // 3. Center Stadium Pokéball Emblem
      const cx = p.x + p.width / 2;
      const cy = p.y + 72;
      const pr = 48;

      // Outer metallic ring
      ctx.save();
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.beginPath();
      ctx.arc(cx, cy, pr, 0, Math.PI * 2);
      ctx.stroke();

      // Top scarlet half glow
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
      ctx.beginPath();
      ctx.arc(cx, cy, pr - 3, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      // Bottom cobalt half glow
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.beginPath();
      ctx.arc(cx, cy, pr - 3, 0, Math.PI);
      ctx.closePath();
      ctx.fill();

      // Center divider band
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.moveTo(cx - pr, cy);
      ctx.lineTo(cx + pr, cy);
      ctx.stroke();

      // Center button outer & inner ring
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Pulsing button energy core
      const btnGlow = 0.5 + 0.5 * Math.sin(this.time * 4.0);
      ctx.fillStyle = `rgba(250, 204, 21, ${btnGlow})`;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Top Arena Turf Layer (Rich Cyber-Grass Stadium Surface)
      // Sub-turf earth layer
      ctx.fillStyle = '#065f46';
      ctx.fillRect(p.x, p.y + 8, p.width, 6);

      // Lush turf layer
      const grassGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + 10);
      grassGrad.addColorStop(0, '#10b981');
      grassGrad.addColorStop(1, '#059669');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(p.x, p.y - 1, p.width, 10);

      // Glowing LED Stadium Boundary Strip (Top edge)
      ctx.save();
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#a7f3d0';
      ctx.fillRect(p.x, p.y - 3, p.width, 3);
      ctx.restore();

      // Ledge Edge Grip Indicators (Left & Right Ledgemarks)
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(p.x - 3, p.y - 5, 8, 14);
      ctx.fillRect(p.x + p.width - 5, p.y - 5, 8, 14);
      ctx.restore();

      ctx.restore();
    }

    // 5. Draw Semi-Solid Floating Platforms (Enlarged Hard-Light Tech Platforms)
    for (const p of this.semiSolidPlatforms) {
      ctx.save();

      // Ambient drop glow underneath
      ctx.shadowColor = p.accentColor;
      ctx.shadowBlur = 16;

      // Platform body (sleek carbon frame)
      const platGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
      platGrad.addColorStop(0, '#1e293b');
      platGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = platGrad;
      ctx.fillRect(p.x, p.y, p.width, p.height);

      // Translucent hard-light energy field in the middle
      ctx.fillStyle = p.glowColor || 'rgba(56, 189, 248, 0.35)';
      ctx.fillRect(p.x + 8, p.y + 3, p.width - 16, p.height - 6);

      // Top glowing energy surface
      ctx.fillStyle = p.accentColor;
      ctx.fillRect(p.x, p.y, p.width, 3);

      // Glowing corner edge brackets
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x, p.y, 6, p.height);
      ctx.fillRect(p.x + p.width - 6, p.y, 6, p.height);

      // Micro LED chevron indicator on platform center
      const platCx = p.x + p.width / 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.moveTo(platCx - 8, p.y + p.height / 2);
      ctx.lineTo(platCx, p.y + p.height / 2 + 3);
      ctx.lineTo(platCx + 8, p.y + p.height / 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }
  }

  drawBlastZoneGuide(ctx) {
    // Subtle animated danger boundary glow
    ctx.save();
    const borderPulse = 0.12 + 0.08 * Math.sin(this.time * 2.5);
    ctx.strokeStyle = `rgba(239, 68, 68, ${borderPulse})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(10, 10, this.width - 20, this.height - 20);
    ctx.setLineDash([]);
    ctx.restore();
  }
}

window.Stage = Stage;
