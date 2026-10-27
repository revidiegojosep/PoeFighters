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
    if (stageId === 'CINNABAR_ISLAND') {
      this.stageId = 'CINNABAR_ISLAND';
    } else if (stageId === 'POWER_PLANT') {
      this.stageId = 'POWER_PLANT';
    } else if (stageId === 'LAVENDER_TOWER') {
      this.stageId = 'LAVENDER_TOWER';
    } else if (stageId === 'FINAL_DESTINATION') {
      this.stageId = 'FINAL_DESTINATION';
    } else {
      this.stageId = 'BATTLEFIELD';
    }

    if (this.stageId === 'CINNABAR_ISLAND') {
      // 🌋 ISLA CANELA: Volcán Activo & Plataformas de Roca Ígnea con Marea de Lava Dinámica
      const stageWidth = 640;
      const stageX = (this.width - stageWidth) / 2; // 192
      const stageY = 440;

      this.solidPlatforms = [
        {
          id: 'main_ground',
          x: stageX,
          y: stageY,
          width: stageWidth,
          height: 185,
          color: '#26120e',
          grassColor: '#ea580c',
          accentColor: '#f97316',
          type: 'solid'
        }
      ];

      const platW = 145;
      const platH = 14;
      this.semiSolidPlatforms = [
        {
          id: 'plat_left',
          x: stageX + 30, // 222
          y: stageY - 110, // 330
          width: platW,
          height: platH,
          color: '#1c0e0a',
          accentColor: '#f97316',
          glowColor: 'rgba(249, 115, 22, 0.65)',
          type: 'semi'
        },
        {
          id: 'plat_right',
          x: stageX + stageWidth - platW - 30, // 657
          y: stageY - 110, // 330
          width: platW,
          height: platH,
          color: '#1c0e0a',
          accentColor: '#f97316',
          glowColor: 'rgba(249, 115, 22, 0.65)',
          type: 'semi'
        },
        {
          id: 'plat_top',
          x: (this.width - 150) / 2, // 437
          y: stageY - 210, // 230
          width: 150,
          height: platH,
          color: '#1c0e0a',
          accentColor: '#ef4444',
          glowColor: 'rgba(239, 68, 68, 0.75)',
          type: 'semi'
        }
      ];

      this.blastZones = {
        left: -180,
        right: this.width + 180,
        top: -190,
        bottom: this.height + 140
      };
      this.respawnX = this.width / 2;
      this.respawnY = 190;

      // 🌋 ISLA CANELA: Dinámica de Lava y Sistema de Partículas Volcánicas Avanzado
      this.lavaLevel = 580;
      this.lavaBaseLevel = 580;
      this.lavaTargetLevel = 580;
      this.lavaMaxLevel = 436; // Cubre la plataforma principal al subir
      this.lavaCycleTimer = 0;
      this.lavaWarning = false;

      // Enjambre de cenizas incandescentes y chispas térmicas (65 embers)
      this.volcanoSparks = [];
      const emberPalette = ['#ffffff', '#fef08a', '#facc15', '#fb923c', '#f97316', '#ef4444'];
      for (let i = 0; i < 65; i++) {
        this.volcanoSparks.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 35,
          vy: -35 - Math.random() * 65,
          size: 1.2 + Math.random() * 2.8,
          color: emberPalette[Math.floor(Math.random() * emberPalette.length)],
          swayAmp: 16 + Math.random() * 28,
          swayFreq: 1.4 + Math.random() * 2.2,
          phase: Math.random() * Math.PI * 2,
          flickerSpeed: 3 + Math.random() * 5
        });
      }

      // Escamas de ceniza volcánica oscura en suspensión
      this.volcanoAsh = [];
      for (let i = 0; i < 28; i++) {
        this.volcanoAsh.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: -18 - Math.random() * 25,
          vy: 8 + Math.random() * 18,
          size: 2.2 + Math.random() * 4.2,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 2.2,
          alpha: 0.25 + Math.random() * 0.40
        });
      }

      // Rayos volcánicos de ceniza (Dirty Lightning)
      this.volcanoLightningTimer = 3.5;
      this.volcanoLightningFlash = 0;
      this.volcanoLightningBolts = [];

      // Bombas de magma / piroclastos incandescentes arrojados por la caldera
      this.magmaBombs = [];
      this.magmaBombTimer = 2.2;

      // Goteras de lava fundida bajo la plataforma de basalto
      this.lavaDrips = [];
      for (let i = 0; i < 10; i++) {
        this.lavaDrips.push({
          x: stageX + 45 + Math.random() * (stageWidth - 90),
          y: stageY + 24,
          vy: 25 + Math.random() * 45,
          size: 2.0 + Math.random() * 2.4,
          life: Math.random() * 1.5,
          maxLife: 1.2 + Math.random() * 0.8
        });
      }
    } else if (this.stageId === 'POWER_PLANT') {
      // ⚡ CENTRAL DE ENERGÍA DE KANTO: Arena Industrial & Bobinas de Faraday Electrificadas
      const stageWidth = 660;
      const stageX = (this.width - stageWidth) / 2; // 182
      const stageY = 430;

      this.solidPlatforms = [
        {
          id: 'main_ground',
          x: stageX,
          y: stageY,
          width: stageWidth,
          height: 195,
          color: '#0f172a',
          grassColor: '#eab308',
          type: 'solid'
        }
      ];

      const platW = 150;
      const platH = 15;
      this.semiSolidPlatforms = [
        {
          id: 'plat_left',
          x: stageX + 40, // 222
          y: stageY - 115, // 315
          width: platW,
          height: platH,
          color: '#1e293b',
          accentColor: '#38bdf8',
          glowColor: 'rgba(56, 189, 248, 0.55)',
          type: 'semi',
          isElectrified: false
        },
        {
          id: 'plat_right',
          x: stageX + stageWidth - platW - 40, // 652
          y: stageY - 115, // 315
          width: platW,
          height: platH,
          color: '#1e293b',
          accentColor: '#38bdf8',
          glowColor: 'rgba(56, 189, 248, 0.55)',
          type: 'semi',
          isElectrified: false
        }
      ];

      this.blastZones = {
        left: -175,
        right: this.width + 175,
        top: -185,
        bottom: this.height + 140
      };
      this.respawnX = this.width / 2;
      this.respawnY = 195;

      // Bobinas de Faraday
      this.coilCycleTimer = 0;
      this.activeElectrifiedPlat = null;
      this.coilWarning = false;
      this.coilTurn = 'plat_left';
      this.electricSparks = [];
      for (let i = 0; i < 20; i++) {
        this.electricSparks.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 60,
          vy: (Math.random() - 0.5) * 60,
          life: Math.random() * 0.4
        });
      }
    } else if (this.stageId === 'LAVENDER_TOWER') {
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

      const platW = 155;
      const platH = 14;
      this.semiSolidPlatforms = [
        {
          id: 'plat_left',
          x: stageX + 38, // 210
          baseY: stageY - 105, // 325
          y: stageY - 105,
          width: platW,
          height: platH,
          color: '#1e293b',
          accentColor: '#38bdf8',
          glowColor: 'rgba(56, 189, 248, 0.65)',
          type: 'semi',
          moveSpeed: 0.85,
          moveAmp: 38,
          phase: 0
        },
        {
          id: 'plat_right',
          x: stageX + stageWidth - platW - 38, // 654
          baseY: stageY - 105, // 325
          y: stageY - 105,
          width: platW,
          height: platH,
          color: '#1e293b',
          accentColor: '#f43f5e',
          glowColor: 'rgba(244, 63, 94, 0.65)',
          type: 'semi',
          moveSpeed: 0.85,
          moveAmp: 38,
          phase: Math.PI // Movimiento alterno armónico
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

    // Movimiento oscilatorio suave de plataformas en Pueblo Paleta
    if (this.stageId === 'BATTLEFIELD' && this.semiSolidPlatforms) {
      for (const plat of this.semiSolidPlatforms) {
        if (plat.moveAmp) {
          plat.y = plat.baseY + Math.sin(this.time * plat.moveSpeed + plat.phase) * plat.moveAmp;
        }
      }
    }

    // 🌋 Dinámica de Lava en Isla Canela (Mareas periódicas con advertencia)
    if (this.stageId === 'CINNABAR_ISLAND') {
      this.lavaCycleTimer += dt;
      const cycle = this.lavaCycleTimer % 18.0;

      if (cycle < 10.0) {
        // Calma: Nivel normal bajo
        this.lavaTargetLevel = this.lavaBaseLevel;
        this.lavaWarning = false;
      } else if (cycle < 12.5) {
        // Advertencia: Temblores y humo
        this.lavaWarning = true;
        this.lavaTargetLevel = this.lavaBaseLevel - 25;
        if (window.game && Math.random() < 0.25) {
          window.game.triggerScreenShake(3.5, 0.12);
        }
      } else if (cycle < 15.8) {
        // Erupción: La lava sube e inunda la plataforma central
        this.lavaWarning = false;
        this.lavaTargetLevel = this.lavaMaxLevel;
      } else {
        // Descenso
        this.lavaWarning = false;
        this.lavaTargetLevel = this.lavaBaseLevel;
      }

      this.lavaLevel += (this.lavaTargetLevel - this.lavaLevel) * Math.min(1.0, dt * 3.5);

      // Actualizar enjambre de cenizas incandescentes (sway turbulento)
      if (this.volcanoSparks) {
        for (const s of this.volcanoSparks) {
          s.y += s.vy * dt;
          s.x += (s.vx + Math.sin(this.time * s.swayFreq + s.phase) * s.swayAmp) * dt;
          if (s.y < -25) {
            s.y = this.height + 20;
            s.x = Math.random() * this.width;
          }
          if (s.x < -30) s.x = this.width + 20;
          else if (s.x > this.width + 30) s.x = -20;
        }
      }

      // Actualizar escamas de ceniza volcánica suspendidas
      if (this.volcanoAsh) {
        for (const a of this.volcanoAsh) {
          a.x += a.vx * dt;
          a.y += a.vy * dt;
          a.rot += a.rotSpeed * dt;
          if (a.x < -30 || a.y > this.height + 30) {
            a.x = this.width + 20;
            a.y = Math.random() * this.height * 0.7;
          }
        }
      }

      // Rayos volcánicos de ceniza (Dirty Lightning)
      if (this.volcanoLightningTimer !== undefined) {
        this.volcanoLightningTimer -= dt;
        if (this.volcanoLightningTimer <= 0) {
          this.volcanoLightningTimer = 3.8 + Math.random() * 4.2;
          this.volcanoLightningFlash = 1.0;
          // Generar ramas de rayo sobre la nube del cráter
          const cx = this.width / 2;
          this.volcanoLightningBolts = [];
          const boltCount = 1 + (Math.random() < 0.4 ? 1 : 0);
          for (let b = 0; b < boltCount; b++) {
            const startX = cx - 90 + Math.random() * 180;
            const startY = 30 + Math.random() * 40;
            const pts = [{ x: startX, y: startY }];
            let curX = startX;
            let curY = startY;
            const segs = 4 + Math.floor(Math.random() * 4);
            for (let s = 0; s < segs; s++) {
              curX += (Math.random() - 0.5) * 45;
              curY += 20 + Math.random() * 25;
              pts.push({ x: curX, y: curY });
            }
            this.volcanoLightningBolts.push(pts);
          }
          if (window.soundEngine && Math.random() < 0.5) {
            window.soundEngine.playSfx('shock');
          }
        }
        if (this.volcanoLightningFlash > 0) {
          this.volcanoLightningFlash = Math.max(0, this.volcanoLightningFlash - dt * 3.8);
        }
      }

      // Bombas de magma / piroclastos arrojados desde el cráter
      if (this.magmaBombTimer !== undefined) {
        this.magmaBombTimer -= dt;
        if (this.magmaBombTimer <= 0) {
          this.magmaBombTimer = 2.2 + Math.random() * 2.5;
          const peakCx = this.width / 2;
          this.magmaBombs.push({
            x: peakCx + (Math.random() - 0.5) * 60,
            y: 170,
            vx: (Math.random() - 0.5) * 95,
            vy: -175 - Math.random() * 85,
            grav: 210,
            size: 3.2 + Math.random() * 2.6,
            life: 2.6,
            color: Math.random() < 0.5 ? '#fef08a' : '#f97316',
            trail: []
          });
        }
        if (this.magmaBombs) {
          for (let i = this.magmaBombs.length - 1; i >= 0; i--) {
            const mb = this.magmaBombs[i];
            mb.vy += mb.grav * dt;
            mb.x += mb.vx * dt;
            mb.y += mb.vy * dt;
            mb.life -= dt;
            mb.trail.unshift({ x: mb.x, y: mb.y, size: mb.size });
            if (mb.trail.length > 7) mb.trail.pop();
            if (mb.life <= 0 || mb.y > this.height + 60) {
              this.magmaBombs.splice(i, 1);
            }
          }
        }
      }

      // Goteras de lava fundida bajo la plataforma de basalto
      if (this.lavaDrips) {
        const mainP = this.solidPlatforms[0];
        for (const drip of this.lavaDrips) {
          drip.life += dt;
          drip.y += drip.vy * dt;
          drip.vy += 75 * dt;
          if (drip.life > drip.maxLife || (mainP && drip.y >= this.lavaLevel)) {
            drip.life = 0;
            drip.maxLife = 1.2 + Math.random() * 0.8;
            drip.y = (mainP ? mainP.y + 24 : 460);
            drip.x = (mainP ? mainP.x + 45 + Math.random() * (mainP.width - 90) : this.width / 2);
            drip.vy = 20 + Math.random() * 40;
          }
        }
      }
    }

    // ⚡ Dinámica de Bobinas de Faraday en Central de Energía
    if (this.stageId === 'POWER_PLANT') {
      this.coilCycleTimer += dt;
      const cTime = this.coilCycleTimer % 14.0;

      if (cTime < 7.5) {
        this.activeElectrifiedPlat = null;
        this.coilWarning = false;
        for (const p of this.semiSolidPlatforms) p.isElectrified = false;
      } else if (cTime < 9.8) {
        this.coilWarning = true;
        this.activeElectrifiedPlat = null;
        for (const p of this.semiSolidPlatforms) p.isElectrified = false;
      } else {
        this.coilWarning = false;
        this.activeElectrifiedPlat = this.coilTurn;
        for (const p of this.semiSolidPlatforms) {
          p.isElectrified = (p.id === this.activeElectrifiedPlat);
        }
      }

      if (cTime >= 13.9) {
        this.coilTurn = this.coilTurn === 'plat_left' ? 'plat_right' : 'plat_left';
      }
    }

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

  // =========================================================================
  // ⚡ DYNAMIC STAGE HAZARDS (Isla Canela Lava & Central Eléctrica Coils)
  // =========================================================================
  updateHazards(fighters) {
    if (!fighters || !Array.isArray(fighters)) return;

    if (this.stageId === 'CINNABAR_ISLAND') {
      for (const f of fighters) {
        if (!f || f.state === 'RESPAWN' || f.invulnTimer > 0) continue;
        // Check if fighter touches or is below the current lava level
        if (f.y >= this.lavaLevel - 10) {
          if ((f.lavaBurnCooldown || 0) <= 0) {
            f.lavaBurnCooldown = 0.55;
            f.percent += 14;
            f.vy = -16.5; // Massive upward volcano launch!
            f.vx = (f.x < this.width / 2 ? 1 : -1) * (3.5 + Math.random() * 2);
            f.state = 'HURT';
            f.hitstun = 0.45;
            f.hitstop = 4;
            if (window.soundEngine) window.soundEngine.playSfx('lava_burn');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(f.x, this.lavaLevel, '#f97316', 'fire', 40);
              window.particleManager.spawnHitSparks(f.x, f.y - f.height * 0.5, 12, 'fire');
              window.particleManager.spawnFloatingText(f.x, f.y - f.height - 18, '🔥 ¡LAVA! (14%)', '#f97316', 18);
            }
          }
        }
      }
    } else if (this.stageId === 'POWER_PLANT') {
      if (!this.activeElectrifiedPlat) return;
      const targetPlat = this.semiSolidPlatforms.find(p => p.id === this.activeElectrifiedPlat);
      if (!targetPlat) return;

      for (const f of fighters) {
        if (!f || f.state === 'RESPAWN' || f.invulnTimer > 0) continue;
        // Check if fighter is standing on the electrified platform
        const onPlat = f.isGrounded && Math.abs(f.y - targetPlat.y) < 8 &&
                       f.x >= targetPlat.x - 14 && f.x <= targetPlat.x + targetPlat.width + 14;
        if (onPlat) {
          if ((f.shockCooldown || 0) <= 0) {
            f.shockCooldown = 0.35;
            f.percent += 3;
            f.hitstop = 3;
            f.vx += (Math.random() - 0.5) * 4;
            if (f.state === 'SHIELD') {
              f.shield = Math.max(0, f.shield - 22); // Drains shield very quickly!
            }
            if (window.soundEngine) window.soundEngine.playSfx('electric_arc');
            if (window.particleManager) {
              window.particleManager.spawnHitSparks(f.x, f.y - f.height * 0.5, 6, 'electric');
              window.particleManager.spawnFloatingText(f.x, f.y - f.height - 14, '⚡ 3%', '#38bdf8', 13);
            }
          }
        }
        if (f.shockCooldown > 0) f.shockCooldown -= 1/60;
      }
    }
  }

  drawBackground(ctx) {
    const quality = this.graphicsQuality || (window.game ? window.game.graphicsQuality : 'ultra');
    const isUltra = quality === 'ultra';
    const isHigh = quality === 'high' || isUltra;
    const isLow = quality === 'low';

    if (this.stageId === 'CINNABAR_ISLAND') {
      this._drawCinnabarBackground(ctx, quality);
      return;
    }

    if (this.stageId === 'POWER_PLANT') {
      this._drawPowerPlantBackground(ctx, quality);
      return;
    }

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
      // PUEBLO PALETA (Campo de Batalla): Scenic Kanto Dawn & Oak Lab Horizon
      // =====================================================================
      // 1. Cielo vibrante estilo anime (azul cobalto a ámbar dorado y melocotón)
      const sky = ctx.createLinearGradient(0, 0, 0, this.height);
      sky.addColorStop(0, '#0284c7');
      sky.addColorStop(0.32, '#0ea5e9');
      sky.addColorStop(0.60, '#f59e0b');
      sky.addColorStop(0.85, '#fbbf24');
      sky.addColorStop(1, '#fde68a');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, this.width, this.height);

      // 2. Sol matutino radiante con halo coronal y destellos
      ctx.save();
      const sunX = this.width * 0.78;
      const sunY = 75;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 140);
      sunGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      sunGlow.addColorStop(0.2, 'rgba(254, 240, 138, 0.7)');
      sunGlow.addColorStop(0.55, 'rgba(251, 191, 36, 0.3)');
      sunGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
      ctx.fill();

      // Disco solar
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Rayos de sol dorados volumétricos (God Rays)
      if (!isLow) {
        ctx.save();
        const drawGodRay = (startX, angleOffset, speed, widthTop, widthBottom, alpha) => {
          const angle = angleOffset + Math.sin(this.time * speed) * 0.05;
          ctx.save();
          ctx.translate(startX, 0);
          ctx.rotate(angle);

          const rayH = this.height * 1.5;
          const rayGrad = ctx.createLinearGradient(0, 0, 0, rayH);
          rayGrad.addColorStop(0, `rgba(254, 240, 138, ${alpha})`);
          rayGrad.addColorStop(0.4, `rgba(250, 204, 21, ${alpha * 0.45})`);
          rayGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(-widthTop * 0.5, 0);
          ctx.lineTo(widthTop * 0.5, 0);
          ctx.lineTo(widthBottom * 0.5, rayH);
          ctx.lineTo(-widthBottom * 0.5, rayH);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        };

        drawGodRay(sunX - 100, -0.22, 0.4, 28, 190, 0.28);
        drawGodRay(sunX + 60, -0.15, 0.35, 22, 160, 0.22);
        drawGodRay(this.width * 0.35, 0.12, 0.3, 30, 210, 0.20);
        ctx.restore();
      }

      // 4. Colinas onduladas de Kanto y Ruta 1 (Plano lejano)
      ctx.save();
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.moveTo(0, this.height - 120);
      ctx.quadraticCurveTo(this.width * 0.25, this.height - 210, this.width * 0.5, this.height - 150);
      ctx.quadraticCurveTo(this.width * 0.75, this.height - 100, this.width, this.height - 170);
      ctx.lineTo(this.width, this.height);
      ctx.lineTo(0, this.height);
      ctx.closePath();
      ctx.fill();

      // Niebla matutina sobre las colinas lejanas
      const hillMist = ctx.createLinearGradient(0, this.height - 190, 0, this.height - 100);
      hillMist.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
      hillMist.addColorStop(1, 'rgba(22, 101, 52, 0)');
      ctx.fillStyle = hillMist;
      ctx.fill();

      // 5. Colinas intermedias con la silueta del Laboratorio de Oak y el Molino
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.moveTo(0, this.height - 85);
      ctx.quadraticCurveTo(160, this.height - 160, 340, this.height - 95);
      ctx.quadraticCurveTo(580, this.height - 50, 780, this.height - 125);
      ctx.quadraticCurveTo(900, this.height - 150, this.width, this.height - 90);
      ctx.lineTo(this.width, this.height);
      ctx.lineTo(0, this.height);
      ctx.closePath();
      ctx.fill();

      // Laboratorio del Profesor Oak
      const labX = 210;
      const labY = this.height - 150;
      ctx.fillStyle = '#0f3923';
      ctx.fillRect(labX - 22, labY - 26, 44, 28);
      ctx.fillStyle = '#991b1b'; // Tejado rojo teja característico
      ctx.beginPath();
      ctx.moveTo(labX - 26, labY - 26);
      ctx.lineTo(labX, labY - 44);
      ctx.lineTo(labX + 26, labY - 26);
      ctx.closePath();
      ctx.fill();

      // Molino de viento con aspas giratorias
      const millX = labX + 38;
      const millY = labY - 14;
      ctx.fillStyle = '#0f3923';
      ctx.beginPath();
      ctx.moveTo(millX - 8, millY);
      ctx.lineTo(millX - 5, millY - 32);
      ctx.lineTo(millX + 5, millY - 32);
      ctx.lineTo(millX + 8, millY);
      ctx.closePath();
      ctx.fill();

      // Aspas giratorias
      ctx.save();
      ctx.translate(millX, millY - 30);
      ctx.rotate(this.time * 0.65);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.6;
      for (let b = 0; b < 4; b++) {
        ctx.rotate(Math.PI * 0.5);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -18);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(-2.5, -16, 5, 12);
      }
      ctx.restore();

      // Arboledas de Pueblo Paleta
      const drawTree = (tx, ty, r) => {
        ctx.fillStyle = '#052e16';
        ctx.beginPath();
        ctx.arc(tx, ty, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tx - r * 0.4, ty + r * 0.2, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tx + r * 0.4, ty + r * 0.2, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      };
      drawTree(160, labY - 10, 14);
      drawTree(175, labY - 6, 11);
      drawTree(275, labY - 8, 12);
      drawTree(780, this.height - 120, 16);
      drawTree(810, this.height - 115, 13);
      ctx.restore();

      // 6. Esporas flotantes, polen y pétalos al viento
      ctx.save();
      for (let i = 0; i < this.ambientPetals.length; i++) {
        const petal = this.ambientPetals[i];
        const driftX = (petal.x + this.time * petal.vx + Math.sin(this.time * petal.swayFreq + i) * petal.swayAmp) % (this.width + 40) - 20;
        const driftY = (petal.y + this.time * petal.vy) % this.height;

        ctx.save();
        ctx.translate(driftX, driftY);
        ctx.rotate(petal.rot + this.time * petal.rotSpeed);
        ctx.fillStyle = petal.color;
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.size * 1.2, petal.size * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }
  }

  drawPlatforms(ctx) {
    const mainP = this.solidPlatforms[0];

    const quality = this.graphicsQuality || (window.game ? window.game.graphicsQuality : 'ultra');
    if (this.stageId === 'CINNABAR_ISLAND') {
      this._drawCinnabarPlatforms(ctx, quality);
      return;
    }

    if (this.stageId === 'POWER_PLANT') {
      this._drawPowerPlantPlatforms(ctx, quality);
      return;
    }

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

    // 1. Moving God Rays in Pueblo Paleta (Warm Morning Sunlight)
    if (this.stageId === 'CINNABAR_ISLAND') {
      // Lava sea upward warm radiance (#f97316 / #ef4444)
      const dLava = Math.max(0, this.lavaLevel - y);
      if (dLava < 220) {
        const a = (1 - dLava / 220) * 0.32;
        totalAlpha += a;
        r += 249 * a; g += 115 * a; b += 22 * a;
      }
      // Crater peak backlight
      const dCrater = Math.hypot(x - 512, y - 160);
      if (dCrater < 160) {
        const a = (1 - dCrater / 160) * 0.22;
        totalAlpha += a;
        r += 239 * a; g += 68 * a; b += 68 * a;
      }
    } else if (this.stageId === 'POWER_PLANT') {
      // Cold industrial electric cyan ambient (#38bdf8)
      const dGen = Math.hypot(x - 512, y - 260);
      if (dGen < 180) {
        const a = (1 - dGen / 180) * 0.20;
        totalAlpha += a;
        r += 56 * a; g += 189 * a; b += 248 * a;
      }
      // Electrified platform intense spark aura
      if (this.activeElectrifiedPlat) {
        const p = this.semiSolidPlatforms.find(plat => plat.id === this.activeElectrifiedPlat);
        if (p) {
          const dPlat = Math.hypot(x - (p.x + p.width / 2), y - p.y);
          if (dPlat < 110) {
            const a = (1 - dPlat / 110) * 0.35;
            totalAlpha += a;
            r += 250 * a; g += 204 * a; b += 21 * a; // #facc15 yellow electric corona
          }
        }
      }
    } else if (this.stageId === 'BATTLEFIELD') {
      // Rayo matutino principal desde el cuadrante del sol
      const sunRay1X = 720 - (y / this.height) * 160 + Math.sin(this.time * 0.3) * 45;
      const dist1 = Math.abs(x - sunRay1X);
      if (dist1 < 125) {
        const a = (1 - dist1 / 125) * 0.26;
        totalAlpha += a;
        r += 254 * a; g += 240 * a; b += 138 * a; // #fef08a
      }

      // Rayo cálido secundario sobre el centro y plataforma izquierda
      const sunRay2X = 360 - (y / this.height) * 110 + Math.sin(this.time * 0.25) * 35;
      const dist2 = Math.abs(x - sunRay2X);
      if (dist2 < 115) {
        const a = (1 - dist2 / 115) * 0.22;
        totalAlpha += a;
        r += 250 * a; g += 204 * a; b += 21 * a; // #facc15
      }

      // Resplandor ambiental de las plataformas móviles (cyan izquierda, rosa derecha)
      for (const plat of this.semiSolidPlatforms) {
        const dPlat = Math.hypot(x - (plat.x + plat.width / 2), y - plat.y);
        if (dPlat < 85) {
          const a = (1 - dPlat / 85) * 0.16;
          totalAlpha += a;
          if (plat.id === 'plat_left') {
            r += 56 * a; g += 189 * a; b += 248 * a; // #38bdf8
          } else {
            r += 244 * a; g += 63 * a; b += 94 * a; // #f43f5e
          }
        }
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

      if (this.stageId === 'CINNABAR_ISLAND') {
        this._drawCinnabarForeground(ctx, quality);
        ctx.restore();
        return;
      } else if (this.stageId === 'POWER_PLANT') {
        this._drawPowerPlantForeground(ctx, quality);
        ctx.restore();
        return;
      } else if (this.stageId === 'LAVENDER_TOWER') {
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

  // =========================================================================
  // 🌋 ISLA CANELA: RENDERIZADO VISUAL & DINÁMICA DE LAVA
  // =========================================================================
  _drawCinnabarBackground(ctx, quality) {
    const isUltra = quality === 'ultra';
    const isHigh = quality === 'high' || isUltra;
    const peakCx = this.width / 2;
    const peakBaseY = 470;

    // 1. Cielo Volcánico Apocalíptico (Obsidiana a Naranja Incandescente)
    const sky = ctx.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, '#060102');
    sky.addColorStop(0.25, '#1e0407');
    sky.addColorStop(0.50, '#4a080b');
    sky.addColorStop(0.72, '#7f1d1d');
    sky.addColorStop(0.88, '#c2410c');
    sky.addColorStop(1, '#ea580c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.height);

    // Destello de Rayos Volcánicos (Dirty Lightning Flash)
    if (this.volcanoLightningFlash > 0.04) {
      ctx.save();
      ctx.fillStyle = `rgba(254, 240, 245, ${this.volcanoLightningFlash * 0.38})`;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }

    // Bruma de calor en el horizonte (Heat Haze Shimmer)
    ctx.save();
    const hazeY = 320;
    const hazeGrad = ctx.createLinearGradient(0, hazeY - 60, 0, hazeY + 120);
    hazeGrad.addColorStop(0, 'rgba(234, 88, 12, 0)');
    hazeGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.18)');
    hazeGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, hazeY - 60, this.width, 180);
    ctx.restore();

    // 2. Cordillera Volcánica Lejana (Capa de Profundidad 1 - Silueta Oscura)
    ctx.save();
    ctx.fillStyle = '#140305';
    ctx.beginPath();
    ctx.moveTo(0, peakBaseY - 30);
    ctx.lineTo(80, 340);
    ctx.lineTo(160, 375);
    ctx.lineTo(260, 310);
    ctx.lineTo(360, 360);
    ctx.lineTo(peakCx - 220, 280);
    ctx.lineTo(peakCx + 220, 280);
    ctx.lineTo(this.width - 360, 360);
    ctx.lineTo(this.width - 260, 310);
    ctx.lineTo(this.width - 160, 375);
    ctx.lineTo(this.width - 80, 340);
    ctx.lineTo(this.width, peakBaseY - 30);
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();

    // Borde iluminado de las crestas lejanas
    ctx.strokeStyle = 'rgba(234, 88, 12, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 3. Gran Estratovolcán de Isla Canela (Monte Canela - Capa 2)
    ctx.save();
    const volcanoGrad = ctx.createLinearGradient(peakCx, 160, peakCx, peakBaseY);
    volcanoGrad.addColorStop(0, '#1c0507');
    volcanoGrad.addColorStop(0.4, '#120304');
    volcanoGrad.addColorStop(1, '#090102');
    ctx.fillStyle = volcanoGrad;

    // Silueta esculpida del volcán con crestas de basalto
    ctx.beginPath();
    ctx.moveTo(peakCx - 440, peakBaseY);
    ctx.lineTo(peakCx - 360, 420);
    ctx.lineTo(peakCx - 290, 360);
    ctx.lineTo(peakCx - 210, 290);
    ctx.lineTo(peakCx - 140, 220);
    ctx.lineTo(peakCx - 85, 162);
    ctx.lineTo(peakCx - 38, 178); // Labio izquierdo del cráter
    ctx.lineTo(peakCx + 38, 178); // Labio derecho del cráter
    ctx.lineTo(peakCx + 85, 162);
    ctx.lineTo(peakCx + 140, 220);
    ctx.lineTo(peakCx + 210, 290);
    ctx.lineTo(peakCx + 290, 360);
    ctx.lineTo(peakCx + 360, 420);
    ctx.lineTo(peakCx + 440, peakBaseY);
    ctx.closePath();
    ctx.fill();

    // Sombras y facetas de roca volcánica
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.moveTo(peakCx - 38, 178);
    ctx.lineTo(peakCx - 60, 260);
    ctx.lineTo(peakCx - 140, 360);
    ctx.lineTo(peakCx - 80, 430);
    ctx.lineTo(peakCx - 210, 290);
    ctx.lineTo(peakCx - 140, 220);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(peakCx + 38, 178);
    ctx.lineTo(peakCx + 70, 270);
    ctx.lineTo(peakCx + 150, 370);
    ctx.lineTo(peakCx + 90, 440);
    ctx.lineTo(peakCx + 210, 290);
    ctx.lineTo(peakCx + 140, 220);
    ctx.closePath();
    ctx.fill();

    // 4. Cataratas y Ríos de Magma Fluyendo por las Laderas
    const drawLavaRiver = (points, width, glowColor, coreColor) => {
      if (!points || points.length < 2) return;
      ctx.save();
      // Borde incandescente
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = width + 3;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const xc = (points[i - 1].x + points[i].x) / 2;
        const yc = (points[i - 1].y + points[i].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();

      // Núcleo brillante
      ctx.strokeStyle = coreColor;
      ctx.lineWidth = Math.max(1.5, width * 0.45);
      ctx.shadowBlur = 4;
      ctx.stroke();
      ctx.restore();
    };

    // Río central ramificado
    drawLavaRiver([
      { x: peakCx - 12, y: 178 },
      { x: peakCx - 25, y: 235 },
      { x: peakCx - 10, y: 290 },
      { x: peakCx - 35, y: 350 },
      { x: peakCx - 20, y: 430 },
      { x: peakCx - 40, y: peakBaseY }
    ], 5.0, '#ea580c', '#fef08a');

    // Brazo derecho del río central
    drawLavaRiver([
      { x: peakCx + 15, y: 178 },
      { x: peakCx + 30, y: 240 },
      { x: peakCx + 18, y: 310 },
      { x: peakCx + 45, y: 380 },
      { x: peakCx + 60, y: peakBaseY }
    ], 4.2, '#f97316', '#fffbeb');

    // Cascada de lava del flanco izquierdo
    drawLavaRiver([
      { x: peakCx - 85, y: 162 },
      { x: peakCx - 110, y: 210 },
      { x: peakCx - 145, y: 275 },
      { x: peakCx - 180, y: 355 },
      { x: peakCx - 220, y: peakBaseY }
    ], 3.2, '#f97316', '#fef08a');

    // Cascada de lava del flanco derecho
    drawLavaRiver([
      { x: peakCx + 85, y: 162 },
      { x: peakCx + 115, y: 215 },
      { x: peakCx + 150, y: 280 },
      { x: peakCx + 190, y: 360 },
      { x: peakCx + 230, y: peakBaseY }
    ], 3.2, '#f97316', '#fef08a');

    // 5. Núcleo Incandescente del Cráter (Caldera Magmática en Erupción)
    const craterPulse = 1.0 + 0.18 * Math.sin(this.time * 3.5);
    const craterGlow = ctx.createRadialGradient(peakCx, 178, 8, peakCx, 178, 135 * craterPulse);
    craterGlow.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    craterGlow.addColorStop(0.18, 'rgba(254, 240, 138, 0.95)');
    craterGlow.addColorStop(0.42, 'rgba(249, 115, 22, 0.80)');
    craterGlow.addColorStop(0.70, 'rgba(220, 38, 38, 0.40)');
    craterGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = craterGlow;
    ctx.beginPath();
    ctx.arc(peakCx, 178, 135 * craterPulse, 0, Math.PI * 2);
    ctx.fill();

    // 6. Columna Piroclástica de Humo y Ceniza Volcánica (Volumetric Plume)
    const drawAshLobe = (cx, cy, r, rot, alpha, isUnderlit) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      const lobeGrad = ctx.createRadialGradient(0, r * 0.35, r * 0.1, 0, 0, r);
      if (isUnderlit) {
        lobeGrad.addColorStop(0, `rgba(234, 88, 12, ${alpha * 0.85})`);
        lobeGrad.addColorStop(0.35, `rgba(127, 29, 29, ${alpha * 0.70})`);
        lobeGrad.addColorStop(0.75, `rgba(28, 7, 9, ${alpha})`);
        lobeGrad.addColorStop(1, 'rgba(15, 3, 4, 0)');
      } else {
        lobeGrad.addColorStop(0, `rgba(45, 15, 18, ${alpha * 0.9})`);
        lobeGrad.addColorStop(0.6, `rgba(24, 7, 9, ${alpha * 0.85})`);
        lobeGrad.addColorStop(1, 'rgba(10, 2, 3, 0)');
      }

      ctx.fillStyle = lobeGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const sTime = this.time * 0.55;
    // Lóbulos inferiores (con fuerte resplandor del magma)
    drawAshLobe(peakCx + Math.sin(sTime * 1.2) * 18, 138, 48, sTime, 0.80, true);
    drawAshLobe(peakCx - 28 + Math.cos(sTime) * 15, 122, 42, -sTime * 0.8, 0.75, true);
    drawAshLobe(peakCx + 26 + Math.sin(sTime + 1.5) * 16, 118, 44, sTime * 0.9, 0.75, true);

    // Lóbulos medios ascendentes
    drawAshLobe(peakCx + Math.sin(sTime + 1.2) * 32, 88, 62, sTime * 0.7, 0.65, true);
    drawAshLobe(peakCx - 35 + Math.cos(sTime * 1.1) * 25, 75, 58, -sTime, 0.60, false);
    drawAshLobe(peakCx + 38 + Math.sin(sTime * 0.9) * 28, 70, 60, sTime * 1.1, 0.60, false);

    // Gran nube superior de estratosfera
    drawAshLobe(peakCx + Math.sin(sTime + 2.5) * 48, 35, 82, sTime * 0.5, 0.52, false);
    drawAshLobe(peakCx - 50 + Math.cos(sTime + 1.8) * 35, 30, 78, -sTime * 0.6, 0.48, false);
    drawAshLobe(peakCx + 55 + Math.sin(sTime * 0.8) * 38, 25, 80, sTime * 0.6, 0.48, false);

    // 7. Rayos Volcánicos de Ceniza (Dirty Lightning Arcs)
    if (this.volcanoLightningFlash > 0.08 && this.volcanoLightningBolts) {
      ctx.save();
      for (const bolt of this.volcanoLightningBolts) {
        if (!bolt || bolt.length < 2) continue;
        // Resplandor exterior
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 4.0;
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(bolt[0].x, bolt[0].y);
        for (let i = 1; i < bolt.length; i++) ctx.lineTo(bolt[i].x, bolt[i].y);
        ctx.stroke();

        // Núcleo eléctrico blanco
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 8. Bombas de Magma / Piroclastos en Vuelo Parabólico
    if (this.magmaBombs && this.magmaBombs.length > 0) {
      ctx.save();
      for (const mb of this.magmaBombs) {
        // Estela de fuego y humo
        if (mb.trail && mb.trail.length > 1) {
          for (let i = 0; i < mb.trail.length - 1; i++) {
            const p1 = mb.trail[i];
            const p2 = mb.trail[i + 1];
            const tAlpha = (1 - i / mb.trail.length) * 0.65;
            ctx.strokeStyle = `rgba(249, 115, 22, ${tAlpha})`;
            ctx.lineWidth = Math.max(1, (mb.size || 3) * (1 - i / mb.trail.length));
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Núcleo de la bomba de magma
        const bRad = mb.size || 3.5;
        const bGlow = ctx.createRadialGradient(mb.x, mb.y, 0, mb.x, mb.y, bRad * 2.2);
        bGlow.addColorStop(0, '#ffffff');
        bGlow.addColorStop(0.35, mb.color || '#fef08a');
        bGlow.addColorStop(0.8, '#ef4444');
        bGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bGlow;
        ctx.beginPath();
        ctx.arc(mb.x, mb.y, bRad * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 9. Escamas de Ceniza Volcánica Oscura en Suspensión
    if (this.volcanoAsh) {
      ctx.save();
      for (const a of this.volcanoAsh) {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rot);
        ctx.fillStyle = `rgba(25, 8, 10, ${a.alpha || 0.35})`;
        ctx.fillRect(-a.size * 0.5, -a.size * 0.5, a.size, a.size * 0.65);
        ctx.restore();
      }
      ctx.restore();
    }

    // 10. Enjambre de Cenizas Incandescentes y Chispas Térmicas (Embers)
    if (this.volcanoSparks) {
      ctx.save();
      for (const s of this.volcanoSparks) {
        const flicker = 0.75 + 0.25 * Math.sin(this.time * s.flickerSpeed + s.phase);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8 * flicker;
        ctx.globalAlpha = flicker;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * flicker, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  _drawCinnabarPlatforms(ctx, quality) {
    const mainP = this.solidPlatforms[0];
    if (!mainP) return;

    ctx.save();

    // 1. Plataforma Principal: Bastión de Basalto Negro con Fisuras de Magma Vivas
    const rockGrad = ctx.createLinearGradient(mainP.x, mainP.y, mainP.x, mainP.y + mainP.height);
    rockGrad.addColorStop(0, '#2d140e');
    rockGrad.addColorStop(0.25, '#1e0c08');
    rockGrad.addColorStop(0.70, '#100503');
    rockGrad.addColorStop(1, '#080202');
    ctx.fillStyle = rockGrad;

    // Geometría angular de roca volcánica facetada
    ctx.beginPath();
    ctx.moveTo(mainP.x + 22, mainP.y);
    ctx.lineTo(mainP.x + mainP.width - 22, mainP.y);
    ctx.lineTo(mainP.x + mainP.width, mainP.y + 26);
    ctx.lineTo(mainP.x + mainP.width - 32, mainP.y + mainP.height);
    ctx.lineTo(mainP.x + 32, mainP.y + mainP.height);
    ctx.lineTo(mainP.x, mainP.y + 26);
    ctx.closePath();
    ctx.fill();

    // Facetas de columnas de basalto (columnar jointing)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.lineWidth = 2.0;
    const colStep = 75;
    for (let cx = mainP.x + 55; cx < mainP.x + mainP.width - 40; cx += colStep) {
      ctx.beginPath();
      ctx.moveTo(cx, mainP.y + 6);
      ctx.lineTo(cx - 10, mainP.y + mainP.height - 10);
      ctx.stroke();
    }

    // 2. Red Intricada de Fisuras y Venas de Magma Vivas (Pulsing Magma Lattice)
    const veinPulse = 0.72 + 0.28 * Math.sin(this.time * 3.0);
    const drawCrack = (pts, w, blur) => {
      if (!pts || pts.length < 2) return;
      ctx.save();
      // Resplandor exterior de calor
      ctx.strokeStyle = `rgba(249, 115, 22, ${veinPulse})`;
      ctx.lineWidth = w + 2.5;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = blur;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();

      // Núcleo incandescente
      ctx.strokeStyle = `rgba(254, 240, 138, ${veinPulse * 0.95})`;
      ctx.lineWidth = Math.max(1.2, w * 0.45);
      ctx.shadowBlur = 4;
      ctx.stroke();
      ctx.restore();
    };

    // Fisura izquierda
    drawCrack([
      { x: mainP.x + 75, y: mainP.y },
      { x: mainP.x + 115, y: mainP.y + 32 },
      { x: mainP.x + 95, y: mainP.y + 70 },
      { x: mainP.x + 125, y: mainP.y + 115 }
    ], 3.0, 12);
    // Ramificación izquierda
    drawCrack([
      { x: mainP.x + 115, y: mainP.y + 32 },
      { x: mainP.x + 155, y: mainP.y + 48 },
      { x: mainP.x + 140, y: mainP.y + 80 }
    ], 2.0, 8);

    // Fisura central principal (Cráter menor en la plataforma)
    drawCrack([
      { x: mainP.x + mainP.width / 2 - 60, y: mainP.y },
      { x: mainP.x + mainP.width / 2 - 15, y: mainP.y + 35 },
      { x: mainP.x + mainP.width / 2 + 25, y: mainP.y + 30 },
      { x: mainP.x + mainP.width / 2 + 55, y: mainP.y }
    ], 3.5, 14);
    drawCrack([
      { x: mainP.x + mainP.width / 2 - 15, y: mainP.y + 35 },
      { x: mainP.x + mainP.width / 2, y: mainP.y + 90 },
      { x: mainP.x + mainP.width / 2 - 25, y: mainP.y + 135 }
    ], 2.8, 10);

    // Fisura derecha
    drawCrack([
      { x: mainP.x + mainP.width - 85, y: mainP.y },
      { x: mainP.x + mainP.width - 125, y: mainP.y + 38 },
      { x: mainP.x + mainP.width - 105, y: mainP.y + 82 },
      { x: mainP.x + mainP.width - 135, y: mainP.y + 125 }
    ], 3.0, 12);

    // Borde superior incandescente fundido
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3.2;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(mainP.x + 22, mainP.y);
    ctx.lineTo(mainP.x + mainP.width - 22, mainP.y);
    ctx.stroke();

    // 3. Estalactitas de Basalto y Goteras de Magma Fundido Bajo la Plataforma
    // Estalactitas fijas
    const drawStalactite = (sx, sy, sw, sh) => {
      ctx.fillStyle = '#140604';
      ctx.beginPath();
      ctx.moveTo(sx - sw * 0.5, sy);
      ctx.lineTo(sx + sw * 0.5, sy);
      ctx.lineTo(sx, sy + sh);
      ctx.closePath();
      ctx.fill();

      // Gota ardiente en la punta
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(sx, sy + sh, 2.2, 0, Math.PI * 2);
      ctx.fill();
    };

    drawStalactite(mainP.x + 65, mainP.y + mainP.height, 14, 28);
    drawStalactite(mainP.x + 135, mainP.y + mainP.height, 18, 38);
    drawStalactite(mainP.x + 220, mainP.y + mainP.height, 12, 24);
    drawStalactite(mainP.x + mainP.width - 220, mainP.y + mainP.height, 12, 24);
    drawStalactite(mainP.x + mainP.width - 135, mainP.y + mainP.height, 18, 38);
    drawStalactite(mainP.x + mainP.width - 65, mainP.y + mainP.height, 14, 28);

    // Goteras dinámicas de lava fundida cayendo al vacío
    if (this.lavaDrips) {
      for (const drip of this.lavaDrips) {
        ctx.save();
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        // Forma de lágrima cayendo
        ctx.ellipse(drip.x, drip.y, drip.size * 0.7, drip.size * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 4. Plataformas Flotantes de Roca Pómez Ígnea (Porous Magma Pumice)
    for (const plat of this.semiSolidPlatforms) {
      const pGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
      pGrad.addColorStop(0, '#381812');
      pGrad.addColorStop(0.5, '#220e0a');
      pGrad.addColorStop(1, '#110504');
      ctx.fillStyle = pGrad;

      ctx.beginPath();
      ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 5);
      ctx.fill();

      // Borde incandescente superior
      ctx.strokeStyle = plat.accentColor || '#f97316';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = plat.accentColor || '#f97316';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(plat.x + 2, plat.y + 1);
      ctx.lineTo(plat.x + plat.width - 2, plat.y + 1);
      ctx.stroke();

      // Fisura ígnea en la plataforma flotante
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.4;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(plat.x + 35, plat.y + 3);
      ctx.lineTo(plat.x + 55, plat.y + plat.height - 3);
      ctx.lineTo(plat.x + 75, plat.y + 3);
      ctx.stroke();

      // Resplandor térmico inferior pulsante
      const pPulse = Math.sin(this.time * 3.5 + plat.x) * 2.5;
      ctx.fillStyle = '#ea580c';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(plat.x + plat.width * 0.25, plat.y + plat.height + 3 + pPulse, 3.2, 0, Math.PI * 2);
      ctx.arc(plat.x + plat.width * 0.50, plat.y + plat.height + 4 - pPulse, 3.5, 0, Math.PI * 2);
      ctx.arc(plat.x + plat.width * 0.75, plat.y + plat.height + 3 + pPulse * 0.8, 3.0, 0, Math.PI * 2);
      ctx.fill();

      // Micro-respiradero de vapor volcánico
      const ventPhase = (this.time * 2.5 + plat.x * 0.05) % Math.PI;
      const vSize = 2 + Math.sin(ventPhase) * 2;
      ctx.fillStyle = 'rgba(255, 180, 100, 0.45)';
      ctx.beginPath();
      ctx.arc(plat.x + 12, plat.y - vSize * 1.5, vSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  _drawCinnabarForeground(ctx, quality) {
    ctx.save();

    // 1. Iluminación Radiante Volumétrica de la Lava (Lava Glow Upward Bloom)
    const bloomGrad = ctx.createLinearGradient(0, this.lavaLevel - 80, 0, this.lavaLevel + 10);
    bloomGrad.addColorStop(0, 'rgba(234, 88, 12, 0)');
    bloomGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.16)');
    bloomGrad.addColorStop(1, 'rgba(254, 240, 138, 0.32)');
    ctx.fillStyle = bloomGrad;
    ctx.fillRect(0, this.lavaLevel - 80, this.width, 90);

    // 2. Mar de Lava Fundida Multicapa (Olas Turbulentas Dinámicas)
    // Capa de fondo del océano de magma
    const lavaGrad = ctx.createLinearGradient(0, this.lavaLevel, 0, this.height);
    lavaGrad.addColorStop(0, '#fef08a');
    lavaGrad.addColorStop(0.08, '#facc15');
    lavaGrad.addColorStop(0.24, '#f97316');
    lavaGrad.addColorStop(0.55, '#dc2626');
    lavaGrad.addColorStop(0.85, '#991b1b');
    lavaGrad.addColorStop(1, '#450a0a');
    ctx.fillStyle = lavaGrad;

    ctx.beginPath();
    ctx.moveTo(0, this.height);
    ctx.lineTo(0, this.lavaLevel);
    for (let x = 0; x <= this.width; x += 25) {
      const wave = Math.sin(this.time * 3.4 + x * 0.022) * 7.5 +
                   Math.cos(this.time * 2.2 + x * 0.038) * 4.5 +
                   Math.sin(this.time * 5.0 + x * 0.055) * 2.0;
      ctx.lineTo(x, this.lavaLevel + wave);
    }
    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fill();

    // 3. Cresta Incandescente y Línea de Fuego Brillante
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    for (let x = 0; x <= this.width; x += 25) {
      const wave = Math.sin(this.time * 3.4 + x * 0.022) * 7.5 +
                   Math.cos(this.time * 2.2 + x * 0.038) * 4.5 +
                   Math.sin(this.time * 5.0 + x * 0.055) * 2.0;
      if (x === 0) ctx.moveTo(x, this.lavaLevel + wave);
      else ctx.lineTo(x, this.lavaLevel + wave);
    }
    ctx.stroke();

    // 4. Costras de Roca Volcánica Enfriada Flotando en la Superficie (Basalt Rafts)
    for (let i = 0; i < 5; i++) {
      const raftX = ((this.time * 22 + i * 220) % (this.width + 120)) - 60;
      const waveAtRaft = Math.sin(this.time * 3.4 + raftX * 0.022) * 7.5;
      const raftY = this.lavaLevel + waveAtRaft + 2;

      ctx.save();
      ctx.fillStyle = '#1a0604';
      ctx.beginPath();
      ctx.roundRect(raftX - 25, raftY - 4, 50, 9, 3);
      ctx.fill();

      // Borde fundido alrededor de la balsa
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.restore();
    }

    // 5. Burbujas Hirvientes de Magma y Puntos Calientes (Boiling Blisters)
    for (let i = 0; i < 8; i++) {
      const bx = 90 + i * 125 + Math.sin(this.time * 1.8 + i * 1.2) * 25;
      const bPhase = (this.time * 3.2 + i * 1.4) % Math.PI;
      const bRad = Math.sin(bPhase) * 11;
      const waveAtB = Math.sin(this.time * 3.4 + bx * 0.022) * 7.5;

      if (bRad > 1.2) {
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(bx, this.lavaLevel + waveAtB - 2, bRad, 0, Math.PI * 2);
        ctx.fill();

        // Si la burbuja está en su punto álgido, mostrar chispa de ruptura
        if (bRad > 9.5) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(bx + 3, this.lavaLevel + waveAtB - bRad - 4, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 6. Banner de Emergencia: Alerta de Volcán / Erupción Inminente
    if (this.lavaWarning) {
      const flash = Math.sin(this.time * 14) > 0;
      ctx.save();

      // Viñeta roja de advertencia en los bordes de la pantalla
      ctx.fillStyle = flash ? 'rgba(239, 68, 68, 0.18)' : 'rgba(249, 115, 22, 0.08)';
      ctx.fillRect(0, 0, this.width, 24);
      ctx.fillRect(0, this.height - 24, this.width, 24);

      // Banner central con franjas de peligro industrial
      ctx.fillStyle = flash ? 'rgba(185, 28, 28, 0.88)' : 'rgba(154, 18, 18, 0.75)';
      ctx.fillRect(0, 32, this.width, 44);

      // Franjas diagonales de peligro (Hazard Stripes)
      ctx.strokeStyle = flash ? 'rgba(254, 240, 138, 0.35)' : 'rgba(251, 146, 60, 0.25)';
      ctx.lineWidth = 14;
      for (let x = -40; x < this.width + 40; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x + (this.time * 60) % 36, 32);
        ctx.lineTo(x + 24 + (this.time * 60) % 36, 76);
        ctx.stroke();
      }

      // Bordes neón
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 14;
      ctx.strokeRect(0, 32, this.width, 44);

      // Texto de alerta
      ctx.font = '900 17px monospace, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.fillText('⚠️ ¡ALERTA DE VOLCÁN: LA MAREA DE LAVA ESTÁ SUBIENDO! ⚠️', this.width / 2, 60);

      ctx.restore();
    }

    ctx.restore();
  }

  // =========================================================================
  // ⚡ CENTRAL DE ENERGÍA DE KANTO: RENDERIZADO VISUAL & BOBINAS DE FARADAY
  // =========================================================================
  _drawPowerPlantBackground(ctx, quality) {
    const isUltra = quality === 'ultra';

    // 1. Dark Industrial Grid Background
    const wallGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    wallGrad.addColorStop(0, '#020617');
    wallGrad.addColorStop(0.4, '#0f172a');
    wallGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();

    // 2. High-voltage Power Grid Conduits & Steel Trusses
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    // Overhead steel truss girder
    ctx.beginPath();
    ctx.moveTo(0, 80); ctx.lineTo(this.width, 80);
    ctx.moveTo(0, 110); ctx.lineTo(this.width, 110);
    for (let x = 20; x < this.width; x += 60) {
      ctx.moveTo(x, 80); ctx.lineTo(x + 30, 110);
      ctx.moveTo(x + 30, 110); ctx.lineTo(x + 60, 80);
    }
    ctx.stroke();

    // Broken arched windows with stormy thunder sky in background
    for (let w = 0; w < 3; w++) {
      const winX = 160 + w * 280;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(winX, 130, 120, 140);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.strokeRect(winX, 130, 120, 140);

      // Distant lightning flash (occasional)
      const flashTimer = (this.time * 0.7 + w) % 4.0;
      if (flashTimer < 0.15) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
        ctx.fillRect(winX, 130, 120, 140);
      }
    }

    // Generator Turbine Core Silhouette in Center
    ctx.fillStyle = '#090e17';
    ctx.beginPath();
    ctx.arc(this.width / 2, 340, 120, Math.PI, 0);
    ctx.lineTo(this.width / 2 + 120, 440);
    ctx.lineTo(this.width / 2 - 120, 440);
    ctx.closePath();
    ctx.fill();

    // Glowing core reactor slot
    const pulse = Math.sin(this.time * 5) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(56, 189, 248, ${0.45 * pulse})`;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.fillRect(this.width / 2 - 40, 310, 80, 24);

    ctx.restore();
  }

  _drawPowerPlantPlatforms(ctx, quality) {
    const mainP = this.solidPlatforms[0];
    if (!mainP) return;

    ctx.save();

    // 1. Reinforced Steel Ground Platform
    const metalGrad = ctx.createLinearGradient(mainP.x, mainP.y, mainP.x, mainP.y + mainP.height);
    metalGrad.addColorStop(0, '#1e293b');
    metalGrad.addColorStop(0.3, '#0f172a');
    metalGrad.addColorStop(1, '#020617');
    ctx.fillStyle = metalGrad;

    ctx.beginPath();
    ctx.roundRect(mainP.x, mainP.y, mainP.width, mainP.height, [8, 8, 0, 0]);
    ctx.fill();

    // Hazard Stripes (Yellow & Black caution stripes on upper edge)
    ctx.save();
    ctx.beginPath();
    ctx.rect(mainP.x, mainP.y, mainP.width, 10);
    ctx.clip();
    for (let x = mainP.x - 20; x < mainP.x + mainP.width + 20; x += 22) {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(x, mainP.y + 10);
      ctx.lineTo(x + 10, mainP.y + 10);
      ctx.lineTo(x + 20, mainP.y);
      ctx.lineTo(x + 10, mainP.y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 2. Semi-Solid Metal Grate Platforms
    for (const plat of this.semiSolidPlatforms) {
      ctx.fillStyle = plat.isElectrified ? '#1e1b4b' : '#1e293b';
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

      ctx.strokeStyle = plat.isElectrified ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 2;
      ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

      // Electrified Platform Visual: Intense crackling sparks running along surface!
      if (plat.isElectrified) {
        ctx.save();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        let curX = plat.x;
        ctx.moveTo(curX, plat.y);
        while (curX < plat.x + plat.width) {
          curX += 8 + Math.random() * 12;
          const py = plat.y - (Math.random() * 8);
          ctx.lineTo(Math.min(plat.x + plat.width, curX), py);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    // 3. Faraday Tesla Coils (Drawn at the flanks)
    const drawCoil = (cx, cy, isActive, isWarning) => {
      ctx.save();
      // Base stand
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - 16, cy + 30, 32, 25);

      // Stacked Copper Rings (Induction coil)
      for (let r = 0; r < 5; r++) {
        ctx.fillStyle = '#b45309';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.fillRect(cx - 12, cy + 8 + r * 5, 24, 4);
        ctx.strokeRect(cx - 12, cy + 8 + r * 5, 24, 4);
      }

      // Top Spherical Capacitor Terminal
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Active Corona Discharge or Warning Glow
      if (isActive || isWarning) {
        const glowColor = isActive ? '#38bdf8' : '#eab308';
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isActive ? 20 : 12;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 18 + Math.sin(this.time * 15) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    };

    drawCoil(185, 275, this.activeElectrifiedPlat === 'plat_left', this.coilWarning);
    drawCoil(840, 275, this.activeElectrifiedPlat === 'plat_right', this.coilWarning);

    ctx.restore();
  }

  _drawPowerPlantForeground(ctx, quality) {
    ctx.save();

    // 1. Procedural High-Voltage Lightning Bolts from Active Coil to Platform
    if (this.activeElectrifiedPlat) {
      const isLeft = this.activeElectrifiedPlat === 'plat_left';
      const coilX = isLeft ? 185 : 840;
      const coilY = 275;
      const targetPlat = this.semiSolidPlatforms.find(p => p.id === this.activeElectrifiedPlat);

      if (targetPlat) {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;

        // Draw 2 branching electric bolts
        for (let b = 0; b < 2; b++) {
          const targetX = targetPlat.x + targetPlat.width * (0.25 + b * 0.5) + (Math.random() - 0.5) * 20;
          const targetY = targetPlat.y;

          ctx.beginPath();
          ctx.moveTo(coilX, coilY);

          let curX = coilX;
          let curY = coilY;
          const steps = 6;
          for (let s = 1; s <= steps; s++) {
            const nextX = coilX + (targetX - coilX) * (s / steps) + (Math.random() - 0.5) * 18;
            const nextY = coilY + (targetY - coilY) * (s / steps) + (Math.random() - 0.5) * 14;
            ctx.lineTo(nextX, nextY);
            curX = nextX;
            curY = nextY;
          }
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // 2. Overload Warning Banner
    if (this.coilWarning) {
      const flash = Math.sin(this.time * 14) > 0;
      ctx.fillStyle = flash ? 'rgba(234, 179, 8, 0.40)' : 'rgba(56, 189, 248, 0.25)';
      ctx.fillRect(0, 30, this.width, 42);

      ctx.font = '900 16px monospace, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 12;
      ctx.fillText('⚡ ¡ADVERTENCIA: SOBRETENSIÓN EN BOBINAS DE FARADAY! ⚡', this.width / 2, 57);
    }

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
