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

    // Starfield for deep cosmic sky (Twinkling & Shooting Stars)
    this.stars = [];
    for (let i = 0; i < 90; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.72),
        radius: Math.random() * 1.8 + 0.5,
        twinkleSpeed: Math.random() * 2.8 + 1.2,
        twinklePhase: Math.random() * Math.PI * 2,
        color: ['#ffffff', '#bae6fd', '#fbcfe8', '#fef08a', '#e9d5ff', '#fed7aa'][Math.floor(Math.random() * 6)],
        isCrossStar: Math.random() < 0.15
      });
    }

    // Dynamic shooting stars across the cosmic night sky
    this.shootingStars = [];
    this.shootingStarTimer = 1.5;

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

    // Foliage & Living Map Elements (Swaying dense grass, hanging vines, living flora)
    this.foliageGrass = [];
    for (let gx = 174; gx < 850; gx += 6 + Math.random() * 4) {
      const flowerColor = Math.random() < 0.22 ? ['#38bdf8', '#f43f5e', '#facc15', '#ec4899', '#a78bfa', '#fb923c'][Math.floor(Math.random() * 6)] : null;
      this.foliageGrass.push({
        x: gx,
        y: 430,
        height: 8 + Math.random() * 11,
        width: 2.0 + Math.random() * 1.5,
        color: ['#10b981', '#34d399', '#059669', '#6ee7b7', '#047857'][Math.floor(Math.random() * 5)],
        swaySpeed: 1.1 + Math.random() * 0.9,
        swayPhase: gx * 0.05,
        flower: flowerColor
      });
    }

    // Foliage on semi-solid floating platforms
    this.semiSolidGrass = [];
    const addSemiGrass = (px, py, pw) => {
      for (let gx = px + 8; gx < px + pw - 8; gx += 12 + Math.random() * 6) {
        this.semiSolidGrass.push({
          x: gx,
          y: py,
          height: 5 + Math.random() * 6,
          width: 2.0,
          color: ['#38bdf8', '#818cf8', '#67e8f9'][Math.floor(Math.random() * 3)],
          swaySpeed: 1.3 + Math.random() * 0.6,
          swayPhase: gx * 0.06
        });
      }
    };
    addSemiGrass(232, 305, 140);
    addSemiGrass(652, 305, 140);
    addSemiGrass(442, 185, 140);

    // Hanging botanical vines
    this.hangingVines = [
      { startX: 184, startY: 432, length: 7, segH: 7.5, phase: 0 },
      { startX: 218, startY: 432, length: 5, segH: 8.5, phase: 1.2 },
      { startX: 806, startY: 432, length: 5, segH: 8.5, phase: 2.1 },
      { startX: 840, startY: 432, length: 7, segH: 7.5, phase: 3.4 }
    ];

    // Ambient floating petals / spores / cosmic dust (Smooth, zero tremors)
    this.ambientPetals = [];
    for (let i = 0; i < 32; i++) {
      this.ambientPetals.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: 14 + Math.random() * 18,
        vy: 8 + Math.random() * 14,
        size: 3 + Math.random() * 3.5,
        color: ['#fbcfe8', '#f43f5e', '#34d399', '#fef08a', '#67e8f9', '#c084fc'][Math.floor(Math.random() * 6)],
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 1.4,
        swayFreq: 0.8 + Math.random() * 1.0,
        swayAmp: 16 + Math.random() * 14
      });
    }

    // Ghostly eyes lurking in the dark for Lavender Town Pokémon Tower
    this.ghostEyes = [];
    for (let i = 0; i < 18; i++) {
      this.ghostEyes.push({
        x: 40 + Math.random() * (this.width - 80),
        y: 40 + Math.random() * (this.height - 200),
        size: 3.5 + Math.random() * 4.5,
        pupilColor: Math.random() < 0.6 ? '#e879f9' : '#38bdf8',
        blinkTimer: 1.0 + Math.random() * 5.0,
        isBlinking: false,
        blinkDuration: 0.18,
        blinkProgress: 0,
        pulseSpeed: 1.5 + Math.random() * 2.5
      });
    }

    // Atmospheric rolling fog layers for Lavender Tower
    this.spectralFog = [];
    for (let i = 0; i < 20; i++) {
      this.spectralFog.push({
        x: Math.random() * this.width,
        y: 360 + Math.random() * 150,
        vx: (Math.random() - 0.5) * 8 + 4,
        radius: 45 + Math.random() * 55,
        alpha: 0.08 + Math.random() * 0.14,
        phase: Math.random() * Math.PI * 2
      });
    }

    this.setStage(stageId);
  }

  setGraphicsQuality(quality) {
    this.graphicsQuality = ['ultra', 'high', 'medium', 'low'].includes(quality) ? quality : 'ultra';
  }

  setStage(stageId) {
    if (stageId === 'LAVENDER_TOWER') {
      this.stageId = 'LAVENDER_TOWER';
    } else if (stageId === 'FINAL_DESTINATION') {
      this.stageId = 'FINAL_DESTINATION';
    } else {
      this.stageId = 'BATTLEFIELD';
    }

    if (this.stageId === 'LAVENDER_TOWER') {
      // TORRE POKÉMON DE PUEBLO LAVANDA:
      // Dark gothic spectral arena with 3 floating ancestral tombstone platforms
      const stageWidth = 680;
      const stageX = (this.width - stageWidth) / 2; // 172
      const stageY = 430;

      this.solidPlatforms = [
        {
          id: 'main_ground',
          x: stageX,
          y: stageY,
          width: stageWidth,
          height: 195,
          color: '#150a21',
          grassColor: '#9333ea',
          type: 'solid'
        }
      ];

      const platW = 155;
      const platH = 16;
      this.semiSolidPlatforms = [
        {
          id: 'plat_left',
          x: stageX + 40, // 212
          y: stageY - 110, // 320
          width: platW,
          height: platH,
          color: '#1c1028',
          accentColor: '#c084fc',
          glowColor: 'rgba(192, 132, 252, 0.45)',
          isTombstone: true,
          type: 'semi'
        },
        {
          id: 'plat_right',
          x: stageX + stageWidth - platW - 40, // 657
          y: stageY - 110, // 320
          width: platW,
          height: platH,
          color: '#1c1028',
          accentColor: '#c084fc',
          glowColor: 'rgba(192, 132, 252, 0.45)',
          isTombstone: true,
          type: 'semi'
        },
        {
          id: 'plat_top',
          x: (this.width - 170) / 2, // 427
          y: stageY - 200, // 230
          width: 170,
          height: platH,
          color: '#1c1028',
          accentColor: '#e879f9',
          glowColor: 'rgba(232, 121, 249, 0.55)',
          isTombstone: true,
          type: 'semi'
        }
      ];

      this.blastZones = {
        left: -175,
        right: this.width + 175,
        top: -190,
        bottom: this.height + 145
      };

      this.respawnX = this.width / 2;
      this.respawnY = 190;
    } else if (this.stageId === 'FINAL_DESTINATION') {
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

    // Shooting stars update & spawn
    if (this.shootingStars) {
      this.shootingStarTimer -= dt;
      if (this.shootingStarTimer <= 0) {
        this.shootingStarTimer = 3.0 + Math.random() * 4.5;
        this.shootingStars.push({
          x: Math.random() * (this.width * 0.75),
          y: Math.random() * (this.height * 0.35),
          vx: 300 + Math.random() * 200,
          vy: 130 + Math.random() * 90,
          length: 50 + Math.random() * 40,
          life: 0.65 + Math.random() * 0.35,
          maxLife: 0.65 + Math.random() * 0.35,
          color: Math.random() < 0.5 ? '#fef08a' : '#38bdf8'
        });
      }
      for (let i = this.shootingStars.length - 1; i >= 0; i--) {
        const s = this.shootingStars[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt;
        if (s.life <= 0) {
          this.shootingStars.splice(i, 1);
        }
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

    // Ambient petals / spores update (smooth harmonic drift, strictly zero tremors)
    if (this.graphicsQuality === 'ultra' || this.graphicsQuality === 'high') {
      for (const p of this.ambientPetals) {
        p.x += (p.vx + Math.sin(this.time * p.swayFreq) * p.swayAmp * 0.4) * dt;
        p.y += p.vy * dt;
        p.rot += p.rotSpeed * dt;
        if (p.x > this.width + 40) p.x = -40;
        if (p.y > this.height + 40) {
          p.y = -30;
          p.x = Math.random() * this.width;
        }
      }
    }
  }

  drawBackground(ctx) {
    const quality = this.graphicsQuality || (window.game ? window.game.graphicsQuality : 'ultra');
    const isUltra = quality === 'ultra';
    const isHigh = quality === 'high' || isUltra;
    const isLow = quality === 'low';

    if (this.stageId === 'LAVENDER_TOWER') {
      this._drawLavenderBackground(ctx, quality);
      return;
    }

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

      // Twinkling stars & cross flares
      ctx.save();
      for (const star of this.stars) {
        const alpha = 0.4 + 0.6 * Math.sin(this.time * star.twinkleSpeed + star.twinklePhase);
        ctx.globalAlpha = Math.max(0.1, alpha);
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 1.1, 0, Math.PI * 2);
        ctx.fill();

        if (star.isCrossStar && isUltra) {
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 1;
          const flareLen = star.radius * 3.5;
          ctx.beginPath();
          ctx.moveTo(star.x - flareLen, star.y); ctx.lineTo(star.x + flareLen, star.y);
          ctx.moveTo(star.x, star.y - flareLen); ctx.lineTo(star.x, star.y + flareLen);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Shooting stars
      this._drawShootingStars(ctx);

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

      // Twinkling stars & cross flares
      ctx.save();
      for (const star of this.stars) {
        const alpha = 0.35 + 0.65 * Math.sin(this.time * star.twinkleSpeed + star.twinklePhase);
        ctx.globalAlpha = Math.max(0.1, alpha);
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        if (star.isCrossStar && isUltra) {
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 1;
          const flareLen = star.radius * 3.2;
          ctx.beginPath();
          ctx.moveTo(star.x - flareLen, star.y); ctx.lineTo(star.x + flareLen, star.y);
          ctx.moveTo(star.x, star.y - flareLen); ctx.lineTo(star.x, star.y + flareLen);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Shooting stars
      this._drawShootingStars(ctx);

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

    const quality = this.graphicsQuality || (window.game ? window.game.graphicsQuality : 'ultra');
    if (this.stageId === 'LAVENDER_TOWER') {
      this._drawLavenderPlatforms(ctx, quality);
      return;
    }

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

    // Draw living foliage over platform surfaces if enabled (Ultra & High)
    this.drawPlatformFoliage(ctx);
  }

  _drawShootingStars(ctx) {
    if (!this.shootingStars || this.shootingStars.length === 0) return;
    ctx.save();
    for (const s of this.shootingStars) {
      const alpha = Math.max(0, s.life / s.maxLife);
      ctx.strokeStyle = s.color || '#fef08a';
      ctx.globalAlpha = Math.min(1.0, alpha);
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - (s.vx / 320) * s.length, s.y - (s.vy / 320) * s.length);
      ctx.stroke();

      // Glowing star tip
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = s.color || '#fef08a';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Dynamic Environmental Lighting
   * Returns lighting color and intensity at position (x, y) based on
   * stage spotlights, platforms, and moving godrays.
   */
  getLightingAt(x, y) {
    if (this.graphicsQuality === 'low') return null;

    let totalAlpha = 0;
    let r = 0, g = 0, b = 0;

    // 1. Moving God Rays in Battlefield & Final Destination
    if (this.stageId === 'BATTLEFIELD') {
      // Left spotlight beam (cyan, centered ~180 at top, angling downwards)
      const leftRayX = 180 + Math.sin(this.time * 0.35) * 60 + (y / this.height) * 140;
      const distL = Math.abs(x - leftRayX);
      if (distL < 110) {
        const a = (1 - distL / 110) * 0.22;
        totalAlpha += a;
        r += 56 * a; g += 189 * a; b += 248 * a; // #38bdf8
      }

      // Right spotlight beam (rose/coral, centered ~840 at top)
      const rightRayX = 840 - Math.sin(this.time * 0.38) * 60 - (y / this.height) * 140;
      const distR = Math.abs(x - rightRayX);
      if (distR < 110) {
        const a = (1 - distR / 110) * 0.22;
        totalAlpha += a;
        r += 244 * a; g += 63 * a; b += 94 * a; // #f43f5e
      }

      // Center golden spotlight
      const centerRayX = 512 + Math.sin(this.time * 0.28) * 45;
      const distC = Math.abs(x - centerRayX);
      if (distC < 95) {
        const a = (1 - distC / 95) * 0.18;
        totalAlpha += a;
        r += 250 * a; g += 204 * a; b += 21 * a; // #facc15
      }
    } else if (this.stageId === 'LAVENDER_TOWER') {
      const rayX1 = 300 + Math.sin(this.time * 0.3) * 50;
      const d1 = Math.abs(x - rayX1);
      if (d1 < 120) {
        const a = (1 - d1 / 120) * 0.24;
        totalAlpha += a;
        r += 192 * a; g += 132 * a; b += 252 * a; // #c084fc
      }

      const rayX2 = 724 - Math.sin(this.time * 0.35) * 50;
      const d2 = Math.abs(x - rayX2);
      if (d2 < 120) {
        const a = (1 - d2 / 120) * 0.24;
        totalAlpha += a;
        r += 232 * a; g += 121 * a; b += 249 * a; // #e879f9
      }

      const dC = Math.hypot(x - 512, y - 230);
      if (dC < 140) {
        const a = (1 - dC / 140) * 0.26;
        totalAlpha += a;
        r += 168 * a; g += 85 * a; b += 247 * a; // #a855f7
      }
    } else {
      // Final Destination dimensional cosmic rifts (magenta & violet)
      const riftLX = 240 + Math.sin(this.time * 0.32) * 70;
      const distL = Math.abs(x - riftLX);
      if (distL < 120) {
        const a = (1 - distL / 120) * 0.24;
        totalAlpha += a;
        r += 236 * a; g += 72 * a; b += 153 * a; // #ec4899
      }

      const riftRX = 780 - Math.sin(this.time * 0.34) * 70;
      const distR = Math.abs(x - riftRX);
      if (distR < 120) {
        const a = (1 - distR / 120) * 0.24;
        totalAlpha += a;
        r += 168 * a; g += 85 * a; b += 247 * a; // #a855f7
      }
    }

    if (totalAlpha <= 0.01) return null;

    const normR = Math.min(255, Math.round(r / totalAlpha));
    const normG = Math.min(255, Math.round(g / totalAlpha));
    const normB = Math.min(255, Math.round(b / totalAlpha));

    return {
      color: `rgb(${normR}, ${normG}, ${normB})`,
      alpha: Math.min(0.28, totalAlpha)
    };
  }

  getGroundUnder(x, y) {
    let closestY = null;
    let closestPlat = null;

    const testPlatform = (p) => {
      const margin = 20;
      if (x >= p.x - margin && x <= p.x + p.width + margin) {
        if (p.y >= y - 8) {
          if (closestY === null || p.y < closestY) {
            closestY = p.y;
            closestPlat = p;
          }
        }
      }
    };

    if (this.solidPlatforms) {
      for (const p of this.solidPlatforms) testPlatform(p);
    }
    if (this.semiSolidPlatforms) {
      for (const p of this.semiSolidPlatforms) testPlatform(p);
    }

    return { y: closestY, platform: closestPlat };
  }

  /**
   * Stage Real-Time Shadows:
   * Floating platforms cast realistic soft drop shadows on the main platform below,
   * plus ambient occlusion under ledges and floating island masses.
   */
  drawStageShadows(ctx) {
    const quality = this.graphicsQuality;
    if (quality === 'low') return;

    if (this.stageId === 'BATTLEFIELD') {
      const mainGroundY = 430;
      ctx.save();

      // Drop shadow of left semi-solid platform on main ground
      const shadowGradL = ctx.createRadialGradient(302, mainGroundY + 3, 10, 302, mainGroundY + 3, 90);
      shadowGradL.addColorStop(0, 'rgba(0, 0, 0, 0.46)');
      shadowGradL.addColorStop(0.65, 'rgba(0, 0, 0, 0.18)');
      shadowGradL.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGradL;
      ctx.beginPath();
      ctx.ellipse(302, mainGroundY + 2, 85, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Drop shadow of right semi-solid platform on main ground
      const shadowGradR = ctx.createRadialGradient(722, mainGroundY + 3, 10, 722, mainGroundY + 3, 90);
      shadowGradR.addColorStop(0, 'rgba(0, 0, 0, 0.46)');
      shadowGradR.addColorStop(0.65, 'rgba(0, 0, 0, 0.18)');
      shadowGradR.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGradR;
      ctx.beginPath();
      ctx.ellipse(722, mainGroundY + 2, 85, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Drop shadow of top semi-solid platform on main ground (more diffuse)
      const shadowGradT = ctx.createRadialGradient(512, mainGroundY + 4, 20, 512, mainGroundY + 4, 110);
      shadowGradT.addColorStop(0, 'rgba(0, 0, 0, 0.28)');
      shadowGradT.addColorStop(0.75, 'rgba(0, 0, 0, 0.08)');
      shadowGradT.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGradT;
      ctx.beginPath();
      ctx.ellipse(512, mainGroundY + 4, 110, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ambient occlusion contact line under the main turf ledge
      const mainP = this.solidPlatforms[0];
      if (mainP) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
        ctx.fillRect(mainP.x + 2, mainP.y + 10, mainP.width - 4, 8);
      }
      ctx.restore();
    } else if (this.stageId === 'LAVENDER_TOWER') {
      const mainGroundY = 430;
      ctx.save();
      const shadowGradL = ctx.createRadialGradient(302, mainGroundY + 3, 10, 302, mainGroundY + 3, 85);
      shadowGradL.addColorStop(0, 'rgba(46, 16, 101, 0.55)');
      shadowGradL.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
      shadowGradL.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGradL;
      ctx.beginPath();
      ctx.ellipse(302, mainGroundY + 2, 80, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      const shadowGradR = ctx.createRadialGradient(722, mainGroundY + 3, 10, 722, mainGroundY + 3, 85);
      shadowGradR.addColorStop(0, 'rgba(46, 16, 101, 0.55)');
      shadowGradR.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
      shadowGradR.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGradR;
      ctx.beginPath();
      ctx.ellipse(722, mainGroundY + 2, 80, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      const shadowGradT = ctx.createRadialGradient(512, mainGroundY + 4, 15, 512, mainGroundY + 4, 100);
      shadowGradT.addColorStop(0, 'rgba(46, 16, 101, 0.35)');
      shadowGradT.addColorStop(0.75, 'rgba(0, 0, 0, 0.08)');
      shadowGradT.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGradT;
      ctx.beginPath();
      ctx.ellipse(512, mainGroundY + 4, 100, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      const mainP = this.solidPlatforms[0];
      if (mainP) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(mainP.x + 2, mainP.y + 8, mainP.width - 4, 10);
      }
      ctx.restore();
    } else if (this.stageId === 'FINAL_DESTINATION') {
      const mainP = this.solidPlatforms[0];
      if (mainP) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
        ctx.fillRect(mainP.x + 4, mainP.y + 8, mainP.width - 8, 12);
        ctx.restore();
      }
    }
  }

  /**
   * Dynamic Real-Time Character Shadows:
   * Casts depth-scaled drop shadows on whichever platform is directly beneath
   * each fighter, Plusle, and active heavy projectiles.
   */
  drawFighterShadows(ctx, fighters) {
    const quality = this.graphicsQuality;
    if (quality === 'low') return;

    for (const f of fighters) {
      if (!f) continue;
      this.drawSingleFighterShadow(ctx, f, quality);

      // Support for partner Plusle
      if (f.partner && f.partner.respawnTimer <= 0) {
        this.drawSingleFighterShadow(ctx, f.partner, quality);
      }

      // In Ultra quality, draw shadows for active projectiles hovering over platforms
      if (quality === 'ultra' && f.projectiles) {
        for (const proj of f.projectiles) {
          if ((proj.radius && proj.radius >= 9) || (proj.damage && proj.damage >= 5)) {
            this.drawProjectileShadow(ctx, proj);
          }
        }
      }
    }
  }

  drawSingleFighterShadow(ctx, f, quality) {
    if (f.state === 'RESPAWN' || f.x < -200 || f.x > this.width + 200) return;

    const ground = this.getGroundUnder(f.x, f.y);
    if (!ground.platform || ground.y === null) return;

    const groundY = ground.y;
    const heightAbove = groundY - f.y;
    if (heightAbove < -12 || heightAbove > 340) return;

    const isGrounded = f.isGrounded || heightAbove <= 3;
    const fWidth = f.width || 44;

    ctx.save();

    if (isGrounded) {
      // Crisp contact shadow directly under feet
      ctx.fillStyle = quality === 'ultra' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.50)';
      ctx.beginPath();
      ctx.ellipse(f.x, groundY, fWidth * 0.56, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Secondary soft penumbra in Ultra
      if (quality === 'ultra') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.ellipse(f.x, groundY + 1, fWidth * 0.78, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Soft airborne drop shadow projected onto the platform surface
      const heightFrac = Math.min(1.0, heightAbove / 340);
      const alpha = (1.0 - heightFrac * 0.75) * (quality === 'ultra' ? 0.46 : 0.35);
      const shadowW = fWidth * (0.55 + heightFrac * 0.48);
      const shadowH = 6 * (1.0 + heightFrac * 0.55);

      // Skew directional cast from stadium light sources
      let shadowX = f.x;
      if (quality === 'ultra') {
        const lightDir = (f.x - this.width / 2) * 0.12 * heightFrac;
        shadowX += lightDir;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = Math.min(18, 4 + heightFrac * 14);
      }

      ctx.fillStyle = `rgba(0, 0, 0, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.ellipse(shadowX, groundY, shadowW, shadowH, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawProjectileShadow(ctx, proj) {
    if (!proj || proj.x === undefined || proj.y === undefined) return;
    const ground = this.getGroundUnder(proj.x, proj.y);
    if (!ground.platform || ground.y === null) return;

    const heightAbove = ground.y - proj.y;
    if (heightAbove < 0 || heightAbove > 260) return;

    const heightFrac = heightAbove / 260;
    const alpha = (1.0 - heightFrac) * 0.28;
    const radius = (proj.radius || 12) * (0.8 + heightFrac * 0.4);

    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha.toFixed(3)})`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(proj.x, ground.y, radius * 1.25, 5 + heightFrac * 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Living Map Foliage:
   * Grass blades, floral buds, and hanging botanical vines that sway
   * gracefully with a smooth harmonic sine wave (strictly ZERO tremors).
   */
  drawPlatformFoliage(ctx) {
    const quality = this.graphicsQuality;
    if (quality === 'low') return;

    if (this.stageId === 'BATTLEFIELD') {
      ctx.save();

      // 1. Hanging vines on island corners
      for (const vine of this.hangingVines) {
        let currX = vine.startX;
        let currY = vine.startY;
        for (let s = 1; s <= vine.length; s++) {
          const sway = Math.sin(this.time * 1.15 + vine.phase + s * 0.45) * (s * 1.6);
          const nextX = vine.startX + sway;
          const nextY = vine.startY + s * vine.segH;

          ctx.strokeStyle = s % 2 === 0 ? '#059669' : '#10b981';
          ctx.lineWidth = Math.max(1.5, 3.5 - s * 0.3);
          ctx.beginPath();
          ctx.moveTo(currX, currY);
          ctx.lineTo(nextX, nextY);
          ctx.stroke();

          // Small ivy leaf branching off
          if (s >= 2) {
            const leafDir = s % 2 === 0 ? 1 : -1;
            ctx.fillStyle = '#34d399';
            ctx.beginPath();
            ctx.ellipse(nextX + leafDir * 5, nextY, 4.5, 2.5, leafDir * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }

          currX = nextX;
          currY = nextY;
        }
      }

      // 2. Main platform grass blades and flower buds
      for (const tuft of this.foliageGrass) {
        const sway = Math.sin(this.time * tuft.swaySpeed + tuft.swayPhase) * 3.4;
        ctx.strokeStyle = tuft.color;
        ctx.lineWidth = tuft.width;
        ctx.beginPath();
        ctx.moveTo(tuft.x, tuft.y);
        ctx.quadraticCurveTo(tuft.x + sway * 0.45, tuft.y - tuft.height * 0.55, tuft.x + sway, tuft.y - tuft.height);
        ctx.stroke();

        if (tuft.flower) {
          ctx.fillStyle = tuft.flower;
          ctx.beginPath();
          ctx.arc(tuft.x + sway, tuft.y - tuft.height, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Cyber-foliage along semi-solid platforms
      for (const tuft of this.semiSolidGrass) {
        const sway = Math.sin(this.time * tuft.swaySpeed + tuft.swayPhase) * 2.5;
        ctx.strokeStyle = tuft.color;
        ctx.lineWidth = tuft.width;
        ctx.beginPath();
        ctx.moveTo(tuft.x, tuft.y);
        ctx.quadraticCurveTo(tuft.x + sway * 0.4, tuft.y - tuft.height * 0.6, tuft.x + sway, tuft.y - tuft.height);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  /**
   * Foreground Atmospheric Lighting & Ambient Spores (Ultra & High):
   * Volumetric heavenly God Rays and gently floating botanical petals / cosmic motes.
   * Absolutely NO screen tremors or vibrations.
   */
  drawForegroundEffects(ctx) {
    const quality = this.graphicsQuality;
    if (quality === 'low') return;

    ctx.save();

    // 1. Volumetric God Rays (Ultra quality only - dreamlike, smooth sweeping beams)
    if (quality === 'ultra') {
      const drawGodRay = (startX, startY, baseAngle, speed, amp, colorRgba) => {
        const angle = baseAngle + Math.sin(this.time * speed) * amp;
        ctx.save();
        ctx.translate(startX, startY);
        ctx.rotate(angle);

        const beamH = this.height * 1.5;
        const beamGrad = ctx.createLinearGradient(0, 0, 0, beamH);
        beamGrad.addColorStop(0, `${colorRgba}35`);
        beamGrad.addColorStop(0.35, `${colorRgba}14`);
        beamGrad.addColorStop(0.75, `${colorRgba}04`);
        beamGrad.addColorStop(1, `${colorRgba}00`);

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(25, 0);
        ctx.lineTo(190, beamH);
        ctx.lineTo(-190, beamH);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };

      if (this.stageId === 'LAVENDER_TOWER') {
        this._drawLavenderForeground(ctx, quality);
        ctx.restore();
        return;
      } else if (this.stageId === 'BATTLEFIELD') {
        drawGodRay(180, -20, 0.22, 0.35, 0.08, '#38bdf8');
        drawGodRay(840, -20, -0.22, 0.38, 0.08, '#f43f5e');
        drawGodRay(512, -30, 0, 0.28, 0.05, '#facc15');
      } else {
        drawGodRay(220, -20, 0.25, 0.32, 0.10, '#ec4899');
        drawGodRay(800, -20, -0.25, 0.34, 0.10, '#a855f7');
        drawGodRay(512, -30, 0, 0.25, 0.06, '#38bdf8');
      }
    }

    // 2. Floating Ambient Petals, Spores & Cosmic Dust (Ultra & High)
    if (quality === 'ultra' || quality === 'high') {
      for (const p of this.ambientPetals) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = quality === 'ultra' ? 0.65 : 0.45;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  _drawLavenderBackground(ctx, quality) {
    // 1. Spooky Deep Gothic Sky (Negro / Púrpura profundo)
    const sky = ctx.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, '#06020c');
    sky.addColorStop(0.35, '#120420');
    sky.addColorStop(0.7, '#240638');
    sky.addColorStop(1, '#3b0764');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Faint Pale Eerie Moon behind Tower
    ctx.save();
    const moonX = this.width / 2 + 140;
    const moonY = 110;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 120);
    moonGlow.addColorStop(0, 'rgba(232, 121, 249, 0.45)');
    moonGlow.addColorStop(0.4, 'rgba(192, 132, 252, 0.18)');
    moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f5d0fe';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Silhouette of the Ancient Pokémon Tower (Pueblo Lavanda)
    ctx.save();
    ctx.fillStyle = '#0a0314';
    const tX = this.width / 2 - 95;
    ctx.beginPath();
    ctx.moveTo(tX - 40, 430);
    ctx.lineTo(tX - 32, 310);
    ctx.lineTo(tX - 48, 310);
    ctx.lineTo(tX - 24, 210);
    ctx.lineTo(tX - 38, 210);
    ctx.lineTo(tX - 14, 120);
    ctx.lineTo(tX - 24, 120);
    ctx.lineTo(tX, 35);
    ctx.lineTo(tX + 24, 120);
    ctx.lineTo(tX + 14, 120);
    ctx.lineTo(tX + 38, 210);
    ctx.lineTo(tX + 24, 210);
    ctx.lineTo(tX + 48, 310);
    ctx.lineTo(tX + 32, 310);
    ctx.lineTo(tX + 40, 430);
    ctx.closePath();
    ctx.fill();

    // Tower Candlelit Windows (Flickering violet glow)
    const winFlicker = Math.sin(this.time * 6.0) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(232, 121, 249, ${0.75 * winFlicker})`;
    ctx.fillRect(tX - 6, 160, 12, 18);
    ctx.fillRect(tX - 8, 250, 16, 24);
    ctx.fillRect(tX - 10, 350, 20, 28);
    ctx.restore();

    // 4. Ghostly Eyes lurking and blinking in the darkness
    ctx.save();
    for (const eye of this.ghostEyes) {
      eye.blinkTimer -= 0.016;
      if (eye.blinkTimer <= 0) {
        eye.isBlinking = true;
        eye.blinkProgress += 0.016;
        if (eye.blinkProgress >= eye.blinkDuration) {
          eye.isBlinking = false;
          eye.blinkProgress = 0;
          eye.blinkTimer = 1.5 + Math.random() * 4.5;
        }
      }

      if (!eye.isBlinking) {
        const pulse = 0.7 + 0.3 * Math.sin(this.time * eye.pulseSpeed);
        const eyeSep = eye.size * 2.5;
        const lookDirX = Math.sign(512 - eye.x) * 1.5;
        const lookDirY = Math.sign(360 - eye.y) * 1.0;

        ctx.save();
        ctx.shadowColor = eye.pupilColor;
        ctx.shadowBlur = 12 * pulse;
        ctx.fillStyle = eye.pupilColor;

        ctx.beginPath();
        ctx.ellipse(eye.x - eyeSep * 0.5, eye.y, eye.size, eye.size * 0.65, -0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(eye.x + eyeSep * 0.5, eye.y, eye.size, eye.size * 0.65, 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eye.x - eyeSep * 0.5 + lookDirX, eye.y + lookDirY, eye.size * 0.35, 0, Math.PI * 2);
        ctx.arc(eye.x + eyeSep * 0.5 + lookDirX, eye.y + lookDirY, eye.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();

    // 5. Rolling animated purple fog across background
    ctx.save();
    ctx.fillStyle = 'rgba(46, 16, 101, 0.38)';
    ctx.beginPath();
    ctx.moveTo(0, 430);
    for (let x = 0; x <= this.width; x += 30) {
      const y = 390 + Math.sin(this.time * 0.8 + x * 0.008) * 22 + Math.cos(this.time * 0.5 + x * 0.012) * 14;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _drawLavenderPlatforms(ctx, quality) {
    const mainP = this.solidPlatforms[0];
    if (!mainP) return;

    ctx.save();

    // 1. Main Platform Ground (Dark gothic slate with ancestral cracks)
    const slabGrad = ctx.createLinearGradient(mainP.x, mainP.y, mainP.x, mainP.y + mainP.height);
    slabGrad.addColorStop(0, '#1c1028');
    slabGrad.addColorStop(0.2, '#150a21');
    slabGrad.addColorStop(0.7, '#0d0516');
    slabGrad.addColorStop(1, '#05020a');
    ctx.fillStyle = slabGrad;

    ctx.beginPath();
    ctx.moveTo(mainP.x, mainP.y);
    ctx.lineTo(mainP.x + mainP.width, mainP.y);
    ctx.lineTo(mainP.x + mainP.width - 45, mainP.y + mainP.height);
    ctx.lineTo(mainP.x + 45, mainP.y + mainP.height);
    ctx.closePath();
    ctx.fill();

    // Stone cracks and engraved runes
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mainP.x + 120, mainP.y + 15); ctx.lineTo(mainP.x + 145, mainP.y + 65); ctx.lineTo(mainP.x + 130, mainP.y + 110);
    ctx.moveTo(mainP.x + 360, mainP.y + 20); ctx.lineTo(mainP.x + 380, mainP.y + 80); ctx.lineTo(mainP.x + 410, mainP.y + 130);
    ctx.moveTo(mainP.x + 540, mainP.y + 15); ctx.lineTo(mainP.x + 520, mainP.y + 70); ctx.lineTo(mainP.x + 550, mainP.y + 115);
    ctx.stroke();

    // Top spectral violet moss turf
    ctx.fillStyle = '#9333ea';
    ctx.fillRect(mainP.x, mainP.y, mainP.width, 6);
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(mainP.x, mainP.y, mainP.width, 2);

    // Glowing ancestral soul stone in center of main slab
    const soulCx = mainP.x + mainP.width / 2;
    const soulCy = mainP.y + 70;
    const soulPulse = 0.8 + 0.2 * Math.sin(this.time * 3.5);
    const soulGlow = ctx.createRadialGradient(soulCx, soulCy, 4, soulCx, soulCy, 60 * soulPulse);
    soulGlow.addColorStop(0, 'rgba(232, 121, 249, 0.85)');
    soulGlow.addColorStop(0.4, 'rgba(168, 85, 247, 0.45)');
    soulGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = soulGlow;
    ctx.beginPath();
    ctx.arc(soulCx, soulCy, 60 * soulPulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 2. Semi-Solid Platforms: Lápidas Ancestrales (Floating Gravestones)
    for (const plat of this.semiSolidPlatforms) {
      ctx.save();
      const pPulse = Math.sin(this.time * 2.5 + plat.x * 0.01) * 3;
      const curY = plat.y + pPulse;

      ctx.shadowColor = plat.accentColor;
      ctx.shadowBlur = 14;

      ctx.fillStyle = '#1c1028';
      ctx.strokeStyle = plat.accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(plat.x, curY, plat.width, plat.height, [6, 6, 2, 2]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = plat.accentColor;
      ctx.fillRect(plat.x + 4, curY, plat.width - 8, 3);

      // Engraved ancient cross / Poké Ball runic symbol on tombstone center
      const runeCx = plat.x + plat.width / 2;
      const runeCy = curY + plat.height / 2;
      ctx.strokeStyle = 'rgba(232, 121, 249, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(runeCx, runeCy, 5, 0, Math.PI * 2);
      ctx.moveTo(runeCx - 14, runeCy); ctx.lineTo(runeCx + 14, runeCy);
      ctx.stroke();

      // Hovering will-o'-the-wisp flame above each tombstone
      const wispY = curY - 14 + Math.sin(this.time * 4.0 + plat.x) * 4;
      const wispGlow = ctx.createRadialGradient(runeCx, wispY, 1, runeCx, wispY, 12);
      wispGlow.addColorStop(0, '#ffffff');
      wispGlow.addColorStop(0.35, '#e879f9');
      wispGlow.addColorStop(0.8, '#7e22ce');
      wispGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = wispGlow;
      ctx.beginPath();
      ctx.arc(runeCx, wispY, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  _drawLavenderForeground(ctx, quality) {
    ctx.save();
    // Rolling animated spectral fog across the foreground
    const fogSpeed = 0.5;
    for (let f = 0; f < 3; f++) {
      const fogPhase = this.time * (fogSpeed + f * 0.15) + f * 2.0;
      ctx.fillStyle = f === 0 ? 'rgba(88, 28, 135, 0.14)' : 'rgba(59, 7, 100, 0.18)';
      ctx.beginPath();
      ctx.moveTo(0, 470 + f * 25);
      for (let x = 0; x <= this.width; x += 40) {
        const y = 440 + f * 25 + Math.sin(fogPhase + x * 0.007) * 22 + Math.cos(fogPhase * 0.8 + x * 0.01) * 14;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(this.width, this.height);
      ctx.lineTo(0, this.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Post-Processing Atmospheric Pass (Ultra Quality):
   * Soft cinematic vignette to focus dramatic attention on the central arena.
   */
  drawPostProcessing(ctx) {
    if (this.graphicsQuality !== 'ultra') return;

    ctx.save();
    const vig = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      this.width * 0.32,
      this.width / 2,
      this.height / 2,
      this.width * 0.74
    );
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(0.7, 'rgba(3, 7, 18, 0.16)');
    vig.addColorStop(1, 'rgba(2, 6, 23, 0.45)');

    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
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
