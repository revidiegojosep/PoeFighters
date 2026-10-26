/**
 * Stage & Arena System (Pokémon League Grand Battlefield & Destino Final)
 * Supports multiple tournament-legal competitive arenas:
 *  - 'BATTLEFIELD': Tri-plat classic stage with 680px main ground + 3 floating hard-light platforms.
 *  - 'FINAL_DESTINATION': Flat tournament stage with 1 single 720px main platform and NO floating platforms,
 *    set in a cosmic hyperspace rift with dimensional crystals and aurora ribbons.
 */
class Stage {
  constructor(stageId = 'BATTLEFIELD', width = 1024, height = 576) {
    if (typeof stageId === 'number') {
      height = width || 576;
      width = stageId;
      stageId = 'BATTLEFIELD';
    }
    this.width = width;
    this.height = height;
    this.graphicsQuality = 'ultra';
    this.time = 0;

    // Drifting clouds & nebulas
    this.clouds = [
      { x: 40, y: 50, speed: 7, scale: 1.3, alpha: 0.08 },
      { x: 320, y: 95, speed: 11, scale: 0.95, alpha: 0.06 },
      { x: 680, y: 65, speed: 6, scale: 1.4, alpha: 0.09 },
      { x: 920, y: 115, speed: 9, scale: 0.85, alpha: 0.07 }
    ];

    // Starfield for deep cosmic sky
    this.stars = [];
    for (let i = 0; i < 54; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.7),
        radius: Math.random() * 1.6 + 0.5,
        twinkleSpeed: Math.random() * 2.5 + 1.2,
        twinklePhase: Math.random() * Math.PI * 2,
        color: ['#ffffff', '#bae6fd', '#fbcfe8', '#fef08a', '#e9d5ff'][Math.floor(Math.random() * 5)]
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

    // Floating dimensional crystal asteroids for Destino Final
    this.spaceAsteroids = [];
    for (let i = 0; i < 12; i++) {
      this.spaceAsteroids.push({
        x: Math.random() * this.width,
        y: 40 + Math.random() * (this.height - 180),
        size: 14 + Math.random() * 24,
        speedX: (Math.random() - 0.5) * 8,
        speedY: (Math.random() - 0.5) * 5,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.4,
        color: Math.random() < 0.5 ? '#a855f7' : '#ec4899'
      });
    }

    // Energy motes under island
    this.energyMotes = [];
    for (let i = 0; i < 24; i++) {
      this.energyMotes.push({
        x: 200 + Math.random() * 600,
        y: 430 + 130 + Math.random() * 50,
        vx: (Math.random() - 0.5) * 14,
        vy: -15 - Math.random() * 22,
        life: Math.random() * 2.0,
        maxLife: 2.0 + Math.random() * 1.5,
        color: Math.random() < 0.5 ? '#38bdf8' : '#a855f7',
        size: Math.random() * 2.2 + 1.2
      });
    }

    this.setStage(stageId);
  }

  setGraphicsQuality(quality) {
    this.graphicsQuality = ['ultra', 'high', 'low'].includes(quality) ? quality : 'ultra';
  }

  setStage(stageId) {
    this.stageId = stageId === 'FINAL_DESTINATION' ? 'FINAL_DESTINATION' : 'BATTLEFIELD';

    if (this.stageId === 'FINAL_DESTINATION') {
      // DESTINO FINAL: 1 single main platform, NO floating semi-solids!
      const stageWidth = 720;
      const stageX = (this.width - stageWidth) / 2; // 152
      const stageY = 430;

      this.solidPlatforms = [
        {
          id: 'main_ground',
          x: stageX,
          y: stageY,
          width: stageWidth,
          height: 195,
          color: '#180d2b',
          grassColor: '#a855f7',
          type: 'solid'
        }
      ];

      // NO floating platforms on Final Destination!
      this.semiSolidPlatforms = [];

      this.blastZones = {
        left: -180,
        right: this.width + 180,
        top: -190,
        bottom: this.height + 145
      };

      this.respawnX = this.width / 2;
      this.respawnY = 190;
    } else {
      // CAMPO DE BATALLA (Battlefield): 1 main platform + 3 floating platforms
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
          accentColor: '#38bdf8',
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
          accentColor: '#f43f5e',
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
          accentColor: '#a855f7',
          glowColor: 'rgba(168, 85, 247, 0.45)',
          type: 'semi'
        }
      ];

      this.blastZones = {
        left: -170,
        right: this.width + 170,
        top: -180,
        bottom: this.height + 140
      };

      this.respawnX = this.width / 2;
      this.respawnY = 200;
    }
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

    // Space asteroids for Final Destination
    if (this.stageId === 'FINAL_DESTINATION') {
      for (const a of this.spaceAsteroids) {
        a.x += a.speedX * dt;
        a.y += a.speedY * dt;
        a.rot += a.rotSpeed * dt;
        if (a.x < -60) a.x = this.width + 60;
        if (a.x > this.width + 60) a.x = -60;
        if (a.y < 20) a.y = this.height - 180;
        if (a.y > this.height - 180) a.y = 20;
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
    const quality = this.graphicsQuality || (window.game ? window.game.graphicsQuality : 'ultra');
    const isUltra = quality === 'ultra';
    const isLow = quality === 'low';

    if (this.stageId === 'FINAL_DESTINATION') {
      // =====================================================================
      // DESTINO FINAL: Cosmic Dimensional Rift & Aurora Hyperspace
      // =====================================================================
      const rift = ctx.createLinearGradient(0, 0, 0, this.height);
      rift.addColorStop(0, '#030712');
      rift.addColorStop(0.35, '#19062e');
      rift.addColorStop(0.7, '#350a50');
      rift.addColorStop(1, '#4c0519');
      ctx.fillStyle = rift;
      ctx.fillRect(0, 0, this.width, this.height);

      // Twinkling stars
      ctx.save();
      for (const star of this.stars) {
        const alpha = 0.4 + 0.6 * Math.sin(this.time * star.twinkleSpeed + star.twinklePhase);
        ctx.globalAlpha = Math.max(0.1, alpha);
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Cosmic Aurora Ribbons / Dimensional Rift Energy Waves
      ctx.save();
      const waveCount = isLow ? 1 : 3;
      for (let w = 0; w < waveCount; w++) {
        const waveSpeed = 0.4 + w * 0.25;
        const wavePhase = this.time * waveSpeed + w * 1.5;
        const waveGrad = ctx.createLinearGradient(0, 100, this.width, 320);
        waveGrad.addColorStop(0, 'rgba(168, 85, 247, 0.0)');
        waveGrad.addColorStop(0.4, w === 1 ? 'rgba(236, 72, 153, 0.16)' : 'rgba(56, 189, 248, 0.18)');
        waveGrad.addColorStop(0.8, 'rgba(168, 85, 247, 0.12)');
        waveGrad.addColorStop(1, 'rgba(236, 72, 153, 0.0)');

        ctx.fillStyle = waveGrad;
        ctx.beginPath();
        ctx.moveTo(0, 160 + Math.sin(wavePhase) * 35);
        for (let x = 0; x <= this.width; x += 40) {
          const y = 160 + Math.sin(wavePhase + x * 0.005) * 45 + Math.cos(wavePhase * 0.7 + x * 0.008) * 25;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Drifting space crystal monoliths / asteroid pillars
      if (!isLow) {
        ctx.save();
        for (const ast of this.spaceAsteroids) {
          ctx.save();
          ctx.translate(ast.x, ast.y);
          ctx.rotate(ast.rot);
          ctx.fillStyle = 'rgba(20, 10, 35, 0.7)';
          ctx.strokeStyle = ast.color;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = ast.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(-ast.size * 0.5, -ast.size * 0.8);
          ctx.lineTo(ast.size * 0.6, -ast.size * 0.4);
          ctx.lineTo(ast.size * 0.8, ast.size * 0.6);
          ctx.lineTo(-ast.size * 0.4, ast.size * 0.7);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      }

      // Sweeping dimensional rift lights
      if (!isLow) {
        ctx.save();
        const drawRiftLight = (lx, ly, baseAngle, speed, colorHex) => {
          const angle = baseAngle + Math.sin(this.time * speed) * 0.18;
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(angle);
          const beam = ctx.createLinearGradient(0, 0, 0, -this.height * 1.5);
          beam.addColorStop(0, `${colorHex}40`);
          beam.addColorStop(0.5, `${colorHex}12`);
          beam.addColorStop(1, `${colorHex}00`);
          ctx.fillStyle = beam;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(20, 0);
          ctx.lineTo(180, -this.height * 1.5);
          ctx.lineTo(-180, -this.height * 1.5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        };

        drawRiftLight(this.width * 0.2, this.height - 20, -0.22, 0.5, '#ec4899');
        drawRiftLight(this.width * 0.8, this.height - 20, 0.22, 0.55, '#a855f7');
        if (isUltra) {
          drawRiftLight(this.width * 0.5, this.height - 10, 0, 0.4, '#38bdf8');
        }
        ctx.restore();
      }

    } else {
      // =====================================================================
      // CAMPO DE BATALLA: Twilight Stadium & Crowd
      // =====================================================================
      const sky = ctx.createLinearGradient(0, 0, 0, this.height);
      sky.addColorStop(0, '#040712');
      sky.addColorStop(0.35, '#0b1129');
      sky.addColorStop(0.7, '#1b1845');
      sky.addColorStop(1, '#2c1a59');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, this.width, this.height);

      // Twinkling stars
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

      // Stadium Arch
      ctx.save();
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.08)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.width / 2, this.height * 1.15, this.width * 0.62, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(this.width / 2, this.height * 1.15, this.width * 0.72, Math.PI, 0);
      ctx.stroke();

      for (let tx = 80; tx < this.width; tx += 120) {
        ctx.beginPath();
        ctx.moveTo(tx, 0);
        ctx.lineTo(tx, this.height - 100);
        ctx.stroke();
      }
      ctx.restore();

      // Volumetric stadium beams
      if (!isLow) {
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
        if (isUltra) {
          drawLightBeam(this.width * 0.35, this.height - 20, -0.08, 0.5, 0.12, '#a855f7');
          drawLightBeam(this.width * 0.65, this.height - 20, 0.08, 0.55, 0.12, '#38bdf8');
        }
        ctx.restore();
      }

      // Distant bleachers & crowd
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

      // Audience lightsticks
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
  }

  drawPlatforms(ctx) {
    const mainP = this.solidPlatforms[0];

    if (this.stageId === 'FINAL_DESTINATION') {
      // =====================================================================
      // DESTINO FINAL PLATFORM (Monolithic Crystal Obsidian Slab, 720px)
      // =====================================================================
      ctx.save();

      // Underside Levitation Void Crystal Core
      const coreCx = mainP.x + mainP.width / 2;
      const coreCy = mainP.y + mainP.height - 15;
      const corePulse = 1.0 + 0.22 * Math.sin(this.time * 4.0);
      const voidGlow = ctx.createRadialGradient(coreCx, coreCy, 4, coreCx, coreCy, 75 * corePulse);
      voidGlow.addColorStop(0, 'rgba(236, 72, 153, 0.95)');
      voidGlow.addColorStop(0.35, 'rgba(168, 85, 247, 0.55)');
      voidGlow.addColorStop(0.7, 'rgba(56, 189, 248, 0.25)');
      voidGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = voidGlow;
      ctx.beginPath();
      ctx.arc(coreCx, coreCy, 75 * corePulse, 0, Math.PI * 2);
      ctx.fill();

      // Hanging crystal spires under the slab
      const drawSpire = (sx, sy, sw, sh, colorHex) => {
        ctx.save();
        ctx.shadowColor = colorHex;
        ctx.shadowBlur = 14;
        ctx.fillStyle = colorHex;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + sw * 0.5, sy + sh * 0.7);
        ctx.lineTo(sx, sy + sh);
        ctx.lineTo(sx - sw * 0.5, sy + sh * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      };

      drawSpire(mainP.x + 130, mainP.y + mainP.height - 35, 18, 45, '#ec4899');
      drawSpire(mainP.x + 160, mainP.y + mainP.height - 25, 12, 30, '#a855f7');
      drawSpire(mainP.x + mainP.width - 130, mainP.y + mainP.height - 35, 18, 45, '#38bdf8');
      drawSpire(mainP.x + mainP.width - 160, mainP.y + mainP.height - 25, 12, 30, '#ec4899');

      // Monolithic floating crystal slab
      const stoneGrad = ctx.createLinearGradient(mainP.x, mainP.y, mainP.x, mainP.y + mainP.height);
      stoneGrad.addColorStop(0, '#2e1065');
      stoneGrad.addColorStop(0.3, '#1e0836');
      stoneGrad.addColorStop(0.7, '#0f041d');
      stoneGrad.addColorStop(1, '#020108');
      ctx.fillStyle = stoneGrad;

      // Clean angular tournament geometry (720px wide)
      ctx.beginPath();
      ctx.moveTo(mainP.x, mainP.y);
      ctx.lineTo(mainP.x + mainP.width, mainP.y);
      ctx.lineTo(mainP.x + mainP.width - 55, mainP.y + 80);
      ctx.lineTo(mainP.x + mainP.width - 130, mainP.y + mainP.height);
      ctx.lineTo(mainP.x + 130, mainP.y + mainP.height);
      ctx.lineTo(mainP.x + 55, mainP.y + 80);
      ctx.closePath();
      ctx.fill();

      // Outer golden-purple metallic frame
      ctx.strokeStyle = '#d946ef';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Radiant energy circuit lines along the slab
      const pulseVal = 0.5 + 0.45 * Math.sin(this.time * 3.0);
      ctx.strokeStyle = `rgba(236, 72, 153, ${pulseVal})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(mainP.x + 70, mainP.y + 35);
      ctx.lineTo(mainP.x + 180, mainP.y + 70);
      ctx.lineTo(mainP.x + 240, mainP.y + 115);
      ctx.moveTo(mainP.x + mainP.width - 70, mainP.y + 35);
      ctx.lineTo(mainP.x + mainP.width - 180, mainP.y + 70);
      ctx.lineTo(mainP.x + mainP.width - 240, mainP.y + 115);
      ctx.stroke();

      // Center Final Destination Emblem (Golden Pokéball Core)
      const cx = mainP.x + mainP.width / 2;
      const cy = mainP.y + 74;
      const pr = 52;

      ctx.save();
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
      ctx.beginPath();
      ctx.arc(cx, cy, pr, 0, Math.PI * 2);
      ctx.stroke();

      // Top glowing crimson half
      ctx.fillStyle = 'rgba(244, 63, 94, 0.22)';
      ctx.beginPath();
      ctx.arc(cx, cy, pr - 3, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      // Bottom glowing amethyst half
      ctx.fillStyle = 'rgba(168, 85, 247, 0.22)';
      ctx.beginPath();
      ctx.arc(cx, cy, pr - 3, 0, Math.PI);
      ctx.closePath();
      ctx.fill();

      // Center divider band
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(24, 13, 43, 0.95)';
      ctx.beginPath();
      ctx.moveTo(cx - pr, cy);
      ctx.lineTo(cx + pr, cy);
      ctx.stroke();

      // Core crystal button
      ctx.fillStyle = '#1e0836';
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Pulsing golden core
      const coreFlash = 0.5 + 0.5 * Math.sin(this.time * 4.5);
      ctx.fillStyle = `rgba(250, 204, 21, ${coreFlash})`;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Top Fighting Surface (Pure Obsidian with Neon Gold & Magenta Ledge Strips)
      ctx.fillStyle = '#0a0314';
      ctx.fillRect(mainP.x, mainP.y + 6, mainP.width, 8);

      // Top energy surface
      const surfaceGrad = ctx.createLinearGradient(mainP.x, mainP.y, mainP.x + mainP.width, mainP.y);
      surfaceGrad.addColorStop(0, '#ec4899');
      surfaceGrad.addColorStop(0.5, '#facc15');
      surfaceGrad.addColorStop(1, '#a855f7');
      ctx.fillStyle = surfaceGrad;
      ctx.fillRect(mainP.x, mainP.y - 2, mainP.width, 6);

      // LED Ledge Markers
      ctx.save();
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(mainP.x - 3, mainP.y - 5, 8, 14);
      ctx.fillRect(mainP.x + mainP.width - 5, mainP.y - 5, 8, 14);
      ctx.restore();

      ctx.restore();
      return;
    }

    // =======================================================================
    // CAMPO DE BATALLA PLATFORMS (680px main ground + 3 floating semi-solids)
    // =======================================================================
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

    // Rising Energy Motes
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

    // Subterranean Crystal Formations
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

    // Draw Main Solid Floating Island
    for (const p of this.solidPlatforms) {
      ctx.save();

      const stoneGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
      stoneGrad.addColorStop(0, '#1e293b');
      stoneGrad.addColorStop(0.35, '#0f172a');
      stoneGrad.addColorStop(0.75, '#090d16');
      stoneGrad.addColorStop(1, '#020617');
      ctx.fillStyle = stoneGrad;

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.width, p.y);
      ctx.lineTo(p.x + p.width - 45, p.y + 75);
      ctx.lineTo(p.x + p.width - 110, p.y + p.height);
      ctx.lineTo(p.x + 110, p.y + p.height);
      ctx.lineTo(p.x + 45, p.y + 75);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Runic circuits
      ctx.save();
      const pulseRune = 0.4 + 0.35 * Math.sin(this.time * 2.2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${pulseRune})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(p.x + 85, p.y + 35);
      ctx.lineTo(p.x + 160, p.y + 65);
      ctx.lineTo(p.x + 210, p.y + 110);
      ctx.moveTo(p.x + p.width - 85, p.y + 35);
      ctx.lineTo(p.x + p.width - 160, p.y + 65);
      ctx.lineTo(p.x + p.width - 210, p.y + 110);
      ctx.stroke();
      ctx.restore();

      // Center Pokeball Emblem
      const cx = p.x + p.width / 2;
      const cy = p.y + 72;
      const pr = 48;

      ctx.save();
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.beginPath();
      ctx.arc(cx, cy, pr, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
      ctx.beginPath();
      ctx.arc(cx, cy, pr - 3, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.beginPath();
      ctx.arc(cx, cy, pr - 3, 0, Math.PI);
      ctx.closePath();
      ctx.fill();

      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.moveTo(cx - pr, cy);
      ctx.lineTo(cx + pr, cy);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.stroke();

      const btnGlow = 0.5 + 0.5 * Math.sin(this.time * 4.0);
      ctx.fillStyle = `rgba(250, 204, 21, ${btnGlow})`;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Top turf
      ctx.fillStyle = '#065f46';
      ctx.fillRect(p.x, p.y + 8, p.width, 6);

      const grassGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + 10);
      grassGrad.addColorStop(0, '#10b981');
      grassGrad.addColorStop(1, '#059669');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(p.x, p.y - 1, p.width, 10);

      ctx.save();
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#a7f3d0';
      ctx.fillRect(p.x, p.y - 3, p.width, 3);
      ctx.restore();

      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(p.x - 3, p.y - 5, 8, 14);
      ctx.fillRect(p.x + p.width - 5, p.y - 5, 8, 14);
      ctx.restore();

      ctx.restore();
    }

    // Draw Semi-Solid Floating Platforms on Battlefield
    for (const p of this.semiSolidPlatforms) {
      ctx.save();
      ctx.shadowColor = p.accentColor;
      ctx.shadowBlur = 16;

      const platGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
      platGrad.addColorStop(0, '#1e293b');
      platGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = platGrad;
      ctx.fillRect(p.x, p.y, p.width, p.height);

      ctx.fillStyle = p.glowColor || 'rgba(56, 189, 248, 0.35)';
      ctx.fillRect(p.x + 8, p.y + 3, p.width - 16, p.height - 6);

      ctx.fillStyle = p.accentColor;
      ctx.fillRect(p.x, p.y, p.width, 3);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x, p.y, 6, p.height);
      ctx.fillRect(p.x + p.width - 6, p.y, 6, p.height);

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
