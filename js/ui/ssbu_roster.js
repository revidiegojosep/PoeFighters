/**
 * SSBU Roster & Moveset Graphical Showcase Controller
 * Super Smash Bros Ultimate Character Selection Screen (CSS)
 * Stats Radar/Bar Meters, Signature Traits & Live Interactive Move Graphic Demonstrations
 */

(function () {
  'use strict';

  // Canonical fighter stats & signature traits database (Literal engine variable stats)
  const FIGHTER_STATS = {
    25: {
      dex: 25,
      name: 'Pikachu',
      title: 'El Ratón Eléctrico',
      type: 'Eléctrico',
      typeColor: '#facc15',
      badgeGradient: 'linear-gradient(135deg, #eab308, #facc15)',
      weight: '6.0 kg',
      weightCategory: 'Ligero',
      difficulty: 'Intermedio',
      difficultyStars: 2,
      tier: 'S Tier · Agilidad',
      stats: {
        walkSpeed: 4.80,
        dashSpeed: 8.20,
        jumpForce: 13.80,
        doubleJumpForce: 12.20,
        weight: 6.0,
        maxJumps: 2
      },
      traits: [
        '⚡ Rayo Descendente ¡Trueno! desde el cielo',
        '⚡ Placaje Eléctrico supersónico en carrera',
        '☄️ Pisotón Meteoro (Meteor Spike) en Down Air',
        '🌀 Agilidad extrema con combos aéreos fluidos'
      ]
    },
    6: {
      dex: 6,
      name: 'Charizard',
      title: 'El Dragón Ígneo',
      type: 'Fuego / Volador',
      typeColor: '#f97316',
      badgeGradient: 'linear-gradient(135deg, #ea580c, #f97316)',
      weight: '90.5 kg',
      weightCategory: 'Pesado',
      difficulty: 'Fácil / Directo',
      difficultyStars: 1,
      tier: 'A Tier · Kill Power',
      stats: {
        walkSpeed: 2.74,
        dashSpeed: 5.90,
        jumpForce: 10.80,
        doubleJumpForce: 8.96,
        weight: 90.5,
        maxJumps: 3
      },
      traits: [
        '🔥 Envite Ígneo devastador con 50% de recoil (+8.4%)',
        '🛡️ Super Armor en Vuelo y Golpe Roca',
        '🪽 2 Saltos Aéreos con alas (3 saltos en total)',
        '☄️ Pisotón Meteoro letal en Down Air (Dair Spike)'
      ]
    },
    1: {
      dex: 1,
      name: 'Bulbasaur',
      title: 'La Semilla Follaje',
      type: 'Planta / Veneno',
      typeColor: '#10b981',
      badgeGradient: 'linear-gradient(135deg, #059669, #10b981)',
      weight: '6.9 kg',
      weightCategory: 'Medio',
      difficulty: 'Fácil',
      difficultyStars: 1,
      tier: 'A Tier · Control de Rango',
      stats: {
        walkSpeed: 4.20,
        dashSpeed: 7.00,
        jumpForce: 13.00,
        doubleJumpForce: 11.50,
        weight: 6.9,
        maxJumps: 2
      },
      traits: [
        '🌿 Látigos cepa de rango ampliado en todos los ataques Z',
        '💚 Absorber cura 3% del daño acumulado al impactar',
        '🍃 Hojas Navaja dinámicas: abanico al andar, ráfaga al correr',
        '💣 Bomba Germen parabólica con impulso cargado'
      ]
    },
    312: {
      dex: 312,
      name: 'Minun y Plusle',
      title: 'El Dúo Polar',
      type: 'Eléctrico (Dúo)',
      typeColor: '#38bdf8',
      badgeGradient: 'linear-gradient(135deg, #0284c7, #38bdf8)',
      weight: '4.2 kg',
      weightCategory: 'Pluma (Dúo)',
      difficulty: 'Técnico',
      difficultyStars: 3,
      tier: 'A Tier · Tándem Cooperativo',
      stats: {
        walkSpeed: 5.00,
        dashSpeed: 8.60,
        jumpForce: 13.80,
        doubleJumpForce: 12.20,
        weight: 4.2,
        maxJumps: 2
      },
      traits: [
        '👥 Estilo Ice Climbers: Minun (-) lidera y Plusle (+) asiste',
        '⚡ Plusle salta exactamente 0.4s después en tierra y aire',
        '💛 Refuerzo (⬇️+X) potencia el daño un 10% durante 5s',
        '🔄 Plusle reaparece a los 10 segundos tras ser noqueado'
      ]
    },
    94: {
      dex: 94,
      name: 'Gengar',
      title: 'La Sombra Espectral',
      type: 'Fantasma / Veneno',
      typeColor: '#a855f7',
      badgeGradient: 'linear-gradient(135deg, #7e22ce, #a855f7)',
      weight: '40.5 kg',
      weightCategory: 'Pesado Floaty',
      difficulty: 'Intermedio',
      difficultyStars: 2,
      tier: 'S Tier · Zoning & Presión',
      stats: {
        walkSpeed: 4.00,
        dashSpeed: 6.60,
        jumpForce: 10.15,
        doubleJumpForce: 9.10,
        weight: 40.5,
        maxJumps: 2
      },
      traits: [
        '👻 Físicas Floaty con gravedad reducida (0.60x) y salto controlado',
        '🟣 Bola Sombra almacenable hasta 8s con disparo inmediato',
        '👊 Puño Sombra con lanzamiento vertical (88°) para combos aéreos',
        '☠️ Tóxico en área aplica veneno durante 5.0 segundos'
      ]
    },
    39: {
      dex: 39,
      name: 'Jigglypuff',
      title: 'El Globo Melódico',
      type: 'Normal / Hada',
      typeColor: '#f472b6',
      badgeGradient: 'linear-gradient(135deg, #db2777, #f472b6)',
      weight: '5.5 kg',
      weightCategory: 'Floaty Ultraligero',
      difficulty: 'Técnico / Timing',
      difficultyStars: 3,
      tier: 'S Tier · Wall of Pain',
      stats: {
        walkSpeed: 3.60,
        dashSpeed: 6.80,
        jumpForce: 6.80,
        doubleJumpForce: 6.40,
        weight: 5.5,
        maxJumps: 5
      },
      traits: [
        '🪽 5 Saltos aéreos consecutivos con físicas floaty',
        '💤 ¡Descanso! directo inflige 25% con noqueo letal',
        '🛡️ Destructor causa 55 de daño directo a escudos',
        '🎵 Canto somnífero que duerme a rivales terrestres'
      ]
    },
    700: {
      dex: 700,
      name: 'Sylveon',
      title: 'El Vínculo Mágico',
      type: 'Hada',
      typeColor: '#f472b6',
      badgeGradient: 'linear-gradient(135deg, #f43f5e, #f472b6)',
      weight: '23.5 kg',
      weightCategory: 'Medio',
      difficulty: 'Intermedio',
      difficultyStars: 2,
      tier: 'S Tier · Zonificación & Sustento',
      stats: {
        walkSpeed: 4.40,
        dashSpeed: 7.50,
        jumpForce: 13.20,
        doubleJumpForce: 11.80,
        weight: 23.5,
        maxJumps: 2
      },
      traits: [
        '✨ Hiper Rayo lineal de carga y daño masivo progresivo',
        '💖 Beso Drenaje cura el 30% del daño infligido al conectar',
        '🌙 Fuerza Lunar (Moonblast) con teletransporte y 3 rayos al suelo',
        '🥺 Ojitos Tiernos en área ralentiza al oponente un 30% por 7s'
      ]
    }
  };

  class SSBURosterController {
    constructor() {
      this.activeTarget = 'P1'; // 'P1' o 'CPU'
      this.selectedP1Dex = 25;
      this.selectedCpuDex = 1;
      this.inspectedDex = 25;
      this.activeMoveCategory = 'moves_x'; // 'moves_x' (Especiales) o 'moves_z' (Smash/Básicos)
      this.selectedMoveKey = 'neutral';
      this.drawerOpen = false;

      // Demo canvas loop
      this.demoCanvas = null;
      this.demoCtx = null;
      this.demoAnim = null;
      this.demoTime = 0;
      this.demoVfxTime = 0;
      this.demoRafId = null;
      this.demoMoveType = 'flamethrower';
      this.particles = [];

      // Showcase canvas loops
      this.p1ShowcaseAnim = null;
      this.cpuShowcaseAnim = null;
      this.showcaseRafId = null;

      this.initialized = false;
    }

    init() {
      if (this.initialized) return;
      this.initialized = true;

      this.demoCanvas = document.getElementById('ssbu-demo-canvas');
      if (this.demoCanvas) {
        this.demoCtx = this.demoCanvas.getContext('2d');
      }

      this._bindTargetToggles();
      this._bindRosterCards();
      this._bindDrawerEvents();
      this._startShowcaseLoop();
      this.updateUI();
    }

    _bindTargetToggles() {
      const toggleP1 = document.getElementById('ssbu-toggle-target-p1');
      const toggleCpu = document.getElementById('ssbu-toggle-target-cpu');

      if (toggleP1) {
        toggleP1.addEventListener('click', () => {
          this.setTarget('P1');
          window.soundEngine && window.soundEngine.playSfx('select');
        });
      }

      if (toggleCpu) {
        toggleCpu.addEventListener('click', () => {
          this.setTarget('CPU');
          window.soundEngine && window.soundEngine.playSfx('select');
        });
      }

      // Quick inspect buttons on showcase pods
      const btnInspectP1 = document.getElementById('btn-inspect-p1-moves');
      if (btnInspectP1) {
        btnInspectP1.addEventListener('click', () => {
          this.openDrawer(this.selectedP1Dex);
          window.soundEngine && window.soundEngine.playSfx('select');
        });
      }

      const btnInspectCpu = document.getElementById('btn-inspect-cpu-moves');
      if (btnInspectCpu) {
        btnInspectCpu.addEventListener('click', () => {
          this.openDrawer(this.selectedCpuDex);
          window.soundEngine && window.soundEngine.playSfx('select');
        });
      }
    }

    _bindRosterCards() {
      const cards = document.querySelectorAll('.ssbu-fighter-tile');
      cards.forEach(card => {
        card.addEventListener('click', (e) => {
          const dex = parseInt(card.getAttribute('data-dex'), 10);
          if (!dex) return;

          // Asignar al objetivo activo (P1 o CPU)
          if (this.activeTarget === 'P1') {
            this.selectedP1Dex = dex;
            if (window.game) window.game.playerDex = dex;
          } else {
            this.selectedCpuDex = dex;
            if (window.game) window.game.dummyDex = dex;
          }

          window.soundEngine && window.soundEngine.playSfx('select');

          // Abrir slider de stats y moveset para este Pokémon
          this.openDrawer(dex);
          this.updateUI();
        });
      });
    }

    _bindDrawerEvents() {
      const closeBtn = document.getElementById('btn-close-ssbu-drawer');
      const backdrop = document.getElementById('ssbu-drawer-backdrop');

      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeDrawer());
      }
      if (backdrop) {
        backdrop.addEventListener('click', () => this.closeDrawer());
      }

      const btnAssignP1 = document.getElementById('btn-drawer-assign-p1');
      if (btnAssignP1) {
        btnAssignP1.addEventListener('click', () => {
          this.selectedP1Dex = this.inspectedDex;
          if (window.game) window.game.playerDex = this.inspectedDex;
          this.updateUI();
          window.soundEngine && window.soundEngine.playSfx('select');
        });
      }

      const btnAssignCpu = document.getElementById('btn-drawer-assign-cpu');
      if (btnAssignCpu) {
        btnAssignCpu.addEventListener('click', () => {
          this.selectedCpuDex = this.inspectedDex;
          if (window.game) window.game.dummyDex = this.inspectedDex;
          this.updateUI();
          window.soundEngine && window.soundEngine.playSfx('select');
        });
      }

      // Moveset category tabs
      const tabSpecials = document.getElementById('ssbu-tab-specials');
      const tabNormals = document.getElementById('ssbu-tab-normals');

      if (tabSpecials) {
        tabSpecials.addEventListener('click', () => {
          this.activeMoveCategory = 'moves_x';
          tabSpecials.classList.add('active');
          if (tabNormals) tabNormals.classList.remove('active');
          this._renderMovesList();
          window.soundEngine && window.soundEngine.playSfx('select');
        });
      }

      if (tabNormals) {
        tabNormals.addEventListener('click', () => {
          this.activeMoveCategory = 'moves_z';
          tabNormals.classList.add('active');
          if (tabSpecials) tabSpecials.classList.remove('active');
          this._renderMovesList();
          window.soundEngine && window.soundEngine.playSfx('select');
        });
      }

      // Replay move button
      const replayBtn = document.getElementById('btn-replay-demo-move');
      if (replayBtn) {
        replayBtn.addEventListener('click', () => {
          this._triggerDemoMove();
          window.soundEngine && window.soundEngine.playSfx('select');
        });
      }
    }

    setTarget(target) {
      this.activeTarget = target === 'CPU' ? 'CPU' : 'P1';
      const toggleP1 = document.getElementById('ssbu-toggle-target-p1');
      const toggleCpu = document.getElementById('ssbu-toggle-target-cpu');
      const targetHint = document.getElementById('ssbu-active-target-hint');

      if (toggleP1) toggleP1.classList.toggle('active', this.activeTarget === 'P1');
      if (toggleCpu) toggleCpu.classList.toggle('active', this.activeTarget === 'CPU');

      if (targetHint) {
        if (this.activeTarget === 'P1') {
          targetHint.innerHTML = '<span style="color:#ef4444; font-weight:800;">[🔴 JUGADOR 1 ACTIVO]</span> Selecciona tu Pokémon en la cuadrícula:';
        } else {
          targetHint.innerHTML = '<span style="color:#38bdf8; font-weight:800;">[🔵 OPONENTE / CPU ACTIVO]</span> Selecciona al rival en la cuadrícula:';
        }
      }
    }

    openDrawer(dex) {
      this.inspectedDex = dex;
      const drawer = document.getElementById('ssbu-fighter-drawer');
      const backdrop = document.getElementById('ssbu-drawer-backdrop');

      if (window.ensureFullscreenModal && drawer) {
        window.ensureFullscreenModal(drawer);
      }

      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      this.drawerOpen = true;

      this._populateDrawerData(dex);
      this._startDemoLoop();
    }

    closeDrawer() {
      const drawer = document.getElementById('ssbu-fighter-drawer');
      const backdrop = document.getElementById('ssbu-drawer-backdrop');
      if (drawer) drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      this.drawerOpen = false;

      if (this.demoRafId) {
        cancelAnimationFrame(this.demoRafId);
        this.demoRafId = null;
      }
    }

    _populateDrawerData(dex) {
      const statData = FIGHTER_STATS[dex] || FIGHTER_STATS[25];
      const pData = window.POKE_FIGHTERS && window.POKE_FIGHTERS[dex] ? window.POKE_FIGHTERS[dex] : null;

      // Header info
      const nameEl = document.getElementById('ssbu-drawer-fighter-name');
      const titleEl = document.getElementById('ssbu-drawer-fighter-title');
      const dexEl = document.getElementById('ssbu-drawer-fighter-dex');
      const typeEl = document.getElementById('ssbu-drawer-fighter-type');
      const tierEl = document.getElementById('ssbu-drawer-fighter-tier');
      const weightEl = document.getElementById('ssbu-drawer-fighter-weight');

      if (nameEl) nameEl.innerText = statData.name.toUpperCase();
      if (titleEl) titleEl.innerText = statData.title;
      if (dexEl) dexEl.innerText = `#${String(dex).padStart(3, '0')}`;
      if (typeEl) {
        typeEl.innerText = statData.type;
        typeEl.style.color = statData.typeColor;
        typeEl.style.borderColor = statData.typeColor;
      }
      if (tierEl) tierEl.innerText = statData.tier;
      if (weightEl) weightEl.innerText = `⚖️ ${statData.weight} · ${statData.weightCategory}`;

      // Stat bars: Engine variable stats (literal parameters, not subjective ratings)
      const stats = statData.stats;
      this._setStatBar('stat-walk', (stats.walkSpeed / 5.0) * 100, `${stats.walkSpeed.toFixed(2)} px/f`);
      this._setStatBar('stat-dash', (stats.dashSpeed / 8.6) * 100, `${stats.dashSpeed.toFixed(2)} px/f`);
      this._setStatBar('stat-jump', (stats.jumpForce / 13.8) * 100, `${stats.jumpForce.toFixed(2)} (Aéreo: ${stats.doubleJumpForce.toFixed(2)})`);
      this._setStatBar('stat-weight', (stats.weight / 90.5) * 100, `${stats.weight} kg (${statData.weightCategory})`);
      const jumpsText = stats.maxJumps === 5
        ? '5 saltos (1 suelo + 4 aéreos)'
        : stats.maxJumps === 3
          ? '3 saltos (1 suelo + 2 aéreos)'
          : '2 saltos (1 suelo + 1 aéreo)';
      this._setStatBar('stat-jumps', (stats.maxJumps / 5) * 100, jumpsText);

      const diffEl = document.getElementById('stat-difficulty-val');
      if (diffEl) {
        diffEl.innerText = `${statData.difficulty} (${'⭐'.repeat(statData.difficultyStars)})`;
      }

      // Traits list
      const traitsList = document.getElementById('ssbu-drawer-traits-list');
      if (traitsList) {
        traitsList.innerHTML = '';
        statData.traits.forEach(t => {
          const item = document.createElement('div');
          item.className = 'ssbu-trait-item';
          item.innerText = t;
          traitsList.appendChild(item);
        });
      }

      // Initialize moves list
      this.selectedMoveKey = 'neutral';
      this._renderMovesList();
    }

    _setStatBar(id, val, text) {
      let fillEl = document.getElementById(`${id}-fill`);
      let valEl = document.getElementById(`${id}-val`);

      // Fallback to legacy IDs if DOM elements haven't refreshed
      if (!fillEl) {
        const legacyMap = {
          'stat-walk': 'stat-speed',
          'stat-dash': 'stat-power',
          'stat-jump': 'stat-air',
          'stat-weight': 'stat-weight',
          'stat-jumps': 'stat-range'
        };
        const legId = legacyMap[id];
        if (legId) {
          fillEl = document.getElementById(`${legId}-fill`);
          valEl = document.getElementById(`${legId}-val`);
        }
      }

      if (fillEl) {
        fillEl.style.width = '0%';
        setTimeout(() => {
          fillEl.style.width = `${Math.min(100, Math.max(5, val))}%`;
        }, 50);
      }
      if (valEl) valEl.innerText = text;
    }

    _renderMovesList() {
      const container = document.getElementById('ssbu-drawer-moves-container');
      if (!container) return;
      container.innerHTML = '';

      const pData = window.POKE_FIGHTERS && window.POKE_FIGHTERS[this.inspectedDex]
        ? window.POKE_FIGHTERS[this.inspectedDex]
        : null;
      if (!pData) return;

      const movesDict = pData[this.activeMoveCategory] || {};
      const keys = Object.keys(movesDict);

      keys.forEach((dirKey, idx) => {
        const m = movesDict[dirKey];
        if (!m) return;

        const isSelected = dirKey === this.selectedMoveKey || (idx === 0 && !this.selectedMoveKey);
        if (isSelected) this.selectedMoveKey = dirKey;

        const card = document.createElement('div');
        card.className = `ssbu-move-card ${isSelected ? 'active' : ''}`;
        card.setAttribute('data-move-dir', dirKey);

        const inputBadge = this._formatInputBadge(dirKey, this.activeMoveCategory);
        card.innerHTML = `
          <div class="ssbu-move-card-header">
            <span class="ssbu-move-input-pill">${inputBadge}</span>
            <span class="ssbu-move-dmg-pill">${m.damage}</span>
          </div>
          <div class="ssbu-move-card-name">${m.name}</div>
          <div class="ssbu-move-card-desc">${m.desc}</div>
        `;

        card.addEventListener('click', () => {
          container.querySelectorAll('.ssbu-move-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          this.selectedMoveKey = dirKey;
          this._triggerDemoMove();
          window.soundEngine && window.soundEngine.playSfx('select');
        });

        container.appendChild(card);
      });

      this._triggerDemoMove();
    }

    _formatInputBadge(dirKey, cat) {
      const keyLetter = cat === 'moves_x' ? 'X' : 'Z';
      if (dirKey.includes('Neutral')) return `[${keyLetter}] Neutral`;
      if (dirKey.includes('Lateral')) return `[⬅️ / ➡️ + ${keyLetter}] Lateral`;
      if (dirKey.includes('Arriba')) return `[⬆️ + ${keyLetter}] Arriba`;
      if (dirKey.includes('Abajo')) return `[⬇️ + ${keyLetter}] Abajo`;
      return dirKey;
    }

    _triggerDemoMove() {
      const pData = window.POKE_FIGHTERS && window.POKE_FIGHTERS[this.inspectedDex]
        ? window.POKE_FIGHTERS[this.inspectedDex]
        : null;
      if (!pData) return;

      const m = pData[this.activeMoveCategory] && pData[this.activeMoveCategory][this.selectedMoveKey]
        ? pData[this.activeMoveCategory][this.selectedMoveKey]
        : null;

      // Update Move Info Card below demo canvas
      const nameEl = document.getElementById('ssbu-demo-move-name');
      const dmgEl = document.getElementById('ssbu-demo-move-dmg');
      const descEl = document.getElementById('ssbu-demo-move-desc');
      const inputEl = document.getElementById('ssbu-demo-move-input');

      if (m) {
        if (nameEl) nameEl.innerText = m.name;
        if (dmgEl) dmgEl.innerText = `Daño: ${m.damage}`;
        if (descEl) descEl.innerText = m.desc;
        if (inputEl) inputEl.innerText = this._formatInputBadge(this.selectedMoveKey, this.activeMoveCategory);
      }

      // Configure demo animation & VFX
      this.demoTime = 0;
      this.demoVfxTime = 0;
      this.particles = [];

      let animName = 'Attack';
      let vfx = 'generic_slash';

      const dex = this.inspectedDex;
      const isSpecial = this.activeMoveCategory === 'moves_x';

      if (dex === 6) { // Charizard
        if (isSpecial) {
          if (this.selectedMoveKey.includes('Neutral')) { animName = 'Shoot'; vfx = 'flamethrower'; }
          else if (this.selectedMoveKey.includes('Lateral')) { animName = 'Charge'; vfx = 'flare_blitz'; }
          else if (this.selectedMoveKey.includes('Arriba')) { animName = 'Attack'; vfx = 'fly'; }
          else if (this.selectedMoveKey.includes('Abajo')) { animName = 'Attack'; vfx = 'rock_smash'; }
        } else {
          animName = this.selectedMoveKey.includes('Lateral') ? 'Attack' : (this.selectedMoveKey.includes('Abajo') ? 'Attack' : 'Attack');
          vfx = 'fire_slash';
        }
      } else if (dex === 25) { // Pikachu
        if (isSpecial) {
          if (this.selectedMoveKey.includes('Neutral')) { animName = 'Shoot'; vfx = 'electro_ball'; }
          else if (this.selectedMoveKey.includes('Lateral')) { animName = 'Charge'; vfx = 'volt_tackle'; }
          else if (this.selectedMoveKey.includes('Arriba')) { animName = 'Attack'; vfx = 'quick_attack'; }
          else if (this.selectedMoveKey.includes('Abajo')) { animName = 'Attack'; vfx = 'thunder_drop'; }
        } else {
          animName = 'Attack';
          vfx = this.selectedMoveKey.includes('Abajo') ? 'spike_down' : 'electric_slash';
        }
      } else if (dex === 1) { // Bulbasaur
        if (isSpecial) {
          if (this.selectedMoveKey.includes('Neutral')) { animName = 'Shoot'; vfx = 'absorb_vortex'; }
          else if (this.selectedMoveKey.includes('Lateral')) { animName = 'Shoot'; vfx = 'razor_leaf'; }
          else if (this.selectedMoveKey.includes('Arriba')) { animName = 'Attack'; vfx = 'vine_whip_up'; }
          else if (this.selectedMoveKey.includes('Abajo')) { animName = 'Charge'; vfx = 'seed_bomb'; }
        } else {
          animName = 'Attack';
          vfx = 'vine_slash';
        }
      } else if (dex === 39) { // Jigglypuff
        if (isSpecial) {
          if (this.selectedMoveKey.includes('Neutral')) { animName = 'Walk'; vfx = 'rollout'; }
          else if (this.selectedMoveKey.includes('Lateral')) { animName = 'Attack'; vfx = 'pound'; }
          else if (this.selectedMoveKey.includes('Arriba')) { animName = 'Shoot'; vfx = 'sing'; }
          else if (this.selectedMoveKey.includes('Abajo')) { animName = 'Faint'; vfx = 'rest'; }
        } else {
          animName = 'Attack';
          vfx = 'fairy_slap';
        }
      } else if (dex === 94) { // Gengar
        if (isSpecial) {
          if (this.selectedMoveKey.includes('Neutral')) { animName = 'Shoot'; vfx = 'shadow_ball'; }
          else if (this.selectedMoveKey.includes('Lateral')) { animName = 'Attack'; vfx = 'shadow_punch'; }
          else if (this.selectedMoveKey.includes('Arriba')) { animName = 'Charge'; vfx = 'teleport'; }
          else if (this.selectedMoveKey.includes('Abajo')) { animName = 'Shoot'; vfx = 'toxic_cloud'; }
        } else {
          animName = 'Attack';
          vfx = 'ghost_claw';
        }
      } else if (dex === 312) { // Minun & Plusle
        if (isSpecial) {
          if (this.selectedMoveKey.includes('Neutral')) { animName = 'Shoot'; vfx = 'duo_spark'; }
          else if (this.selectedMoveKey.includes('Lateral')) { animName = 'Charge'; vfx = 'duo_tackle'; }
          else if (this.selectedMoveKey.includes('Arriba')) { animName = 'Attack'; vfx = 'duo_belay'; }
          else if (this.selectedMoveKey.includes('Abajo')) { animName = 'Charge'; vfx = 'helping_hand'; }
        } else {
          animName = 'Attack';
          vfx = 'spark_slash';
        }
      }

      this.demoMoveType = vfx;
      if (window.SpriteAnimator) {
        this.demoAnim = new window.SpriteAnimator(dex, 2.5);
        this.demoAnim.loop(animName, 1.0);
      }
    }

    _startDemoLoop() {
      if (this.demoRafId) cancelAnimationFrame(this.demoRafId);

      const loop = () => {
        if (!this.drawerOpen) return;
        this._renderDemoCanvas();
        this.demoRafId = requestAnimationFrame(loop);
      };

      this.demoRafId = requestAnimationFrame(loop);
    }

    _renderDemoCanvas() {
      if (!this.demoCanvas || !this.demoCtx) return;
      const ctx = this.demoCtx;
      const w = this.demoCanvas.width;
      const h = this.demoCanvas.height;

      this.demoTime += 0.016;
      this.demoVfxTime += 0.016;

      // Dark retro arena backdrop with atmospheric gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#060a14');
      bgGrad.addColorStop(0.7, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Arena grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Platform floor
      const floorY = h - 36;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(40, floorY, w - 80, 8);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fillRect(40, floorY, w - 80, 2);
      ctx.shadowBlur = 0;

      // Spot light under fighter
      const fX = w * 0.38;
      const fY = floorY;
      const radGrad = ctx.createRadialGradient(fX, fY, 5, fX, fY, 90);
      const sData = FIGHTER_STATS[this.inspectedDex] || FIGHTER_STATS[25];
      radGrad.addColorStop(0, sData.typeColor ? `${sData.typeColor}33` : 'rgba(56,189,248,0.2)');
      radGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.ellipse(fX, fY, 70, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dummy rival target
      const targetX = w * 0.78;
      const targetY = floorY;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.beginPath();
      ctx.arc(targetX, targetY - 26, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CPU', targetX, targetY - 23);

      // Render Fighter Sprite
      if (this.demoAnim) {
        this.demoAnim.setFacing(1);
        this.demoAnim.update(0.016);
        this.demoAnim.draw(ctx, fX, fY);
      }

      // Render Dynamic Move VFX
      this._renderDemoVFX(ctx, fX, fY, targetX, targetY, w, h);
    }

    _renderDemoVFX(ctx, fX, fY, tX, tY, w, h) {
      const t = this.demoVfxTime;
      const cycle = t % 2.0; // 2-second repeat cycle

      ctx.save();

      switch (this.demoMoveType) {
        case 'flamethrower': {
          // Continuous streaming flame cone
          const reach = 130 + Math.sin(t * 12) * 15;
          for (let i = 0; i < 18; i++) {
            const progress = (i / 18 + (t * 2)) % 1;
            const pX = fX + 30 + progress * reach;
            const spread = progress * 32;
            const pY = fY - 30 + (Math.sin(progress * 10 + t * 8) * spread * 0.5);
            const radius = 6 + progress * 16;

            ctx.beginPath();
            ctx.arc(pX, pY, radius, 0, Math.PI * 2);
            ctx.fillStyle = progress < 0.4
              ? 'rgba(254, 240, 138, 0.85)' // Bright yellow core
              : (progress < 0.75 ? 'rgba(249, 115, 22, 0.8)' : 'rgba(239, 68, 68, 0.65)'); // Orange to red
            ctx.shadowColor = '#f97316';
            ctx.shadowBlur = 12;
            ctx.fill();
          }
          break;
        }

        case 'flare_blitz': {
          // Blazing rocket dash & blast
          const dashProgress = Math.min(1, cycle / 0.8);
          const currentX = fX + dashProgress * (tX - fX - 10);
          ctx.beginPath();
          ctx.ellipse(currentX, fY - 24, 38, 22, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(249, 115, 22, 0.75)';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 20;
          ctx.fill();

          // Explosion on impact
          if (dashProgress >= 0.95) {
            const expRadius = ((cycle - 0.76) / 0.5) * 45;
            ctx.beginPath();
            ctx.arc(tX, fY - 26, Math.max(0, expRadius), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
            ctx.fill();
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 3;
            ctx.stroke();
          }
          break;
        }

        case 'fly': {
          // Ascending spiral with flaming wings
          const riseY = fY - 24 - Math.sin(cycle * Math.PI) * 55;
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(fX, riseY, 32 + Math.sin(t * 15) * 8, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }

        case 'rock_smash': {
          // Headbutting a boulder shattering into shards
          if (cycle < 0.6) {
            ctx.fillStyle = '#64748b';
            ctx.beginPath();
            ctx.ellipse(fX + 42, fY - 24, 20, 18, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            const shardT = (cycle - 0.6) * 60;
            ctx.fillStyle = '#94a3b8';
            for (let i = 0; i < 7; i++) {
              const ang = (i / 7) * Math.PI * 2;
              const sX = fX + 42 + Math.cos(ang) * shardT * 1.5;
              const sY = fY - 24 + Math.sin(ang) * shardT * 1.5;
              ctx.fillRect(sX - 3, sY - 3, 6, 6);
            }
          }
          break;
        }

        case 'thunder_drop': {
          // Jagged lightning bolt falling from sky
          if (cycle < 1.0) {
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 5;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 25;

            ctx.beginPath();
            ctx.moveTo(fX + 8, 0);
            ctx.lineTo(fX - 4, 45);
            ctx.lineTo(fX + 14, 85);
            ctx.lineTo(fX - 6, 120);
            ctx.lineTo(fX, fY - 10);
            ctx.stroke();

            // Ground burst
            ctx.fillStyle = 'rgba(250, 204, 21, 0.7)';
            ctx.beginPath();
            ctx.arc(fX, fY, 36, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 'electro_ball': {
          // Plasma orb traversing
          const orbX = fX + 25 + (cycle / 1.5) * (tX - fX);
          ctx.beginPath();
          ctx.arc(orbX, fY - 25, 14, 0, Math.PI * 2);
          ctx.fillStyle = '#facc15';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 20;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
        }

        case 'volt_tackle': {
          // Speed electric tackle
          const vProgress = Math.min(1, cycle / 0.75);
          const vX = fX + vProgress * (tX - fX);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(vX, fY - 22, 28, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }

        case 'razor_leaf': {
          // 3 green razor leaves
          for (let i = 0; i < 3; i++) {
            const lProg = (cycle / 1.2 + i * 0.15) % 1;
            const lX = fX + 25 + lProg * (tX - fX + 20);
            const lY = fY - 25 + (i - 1) * 16 + Math.sin(lProg * 8) * 10;
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.ellipse(lX, lY, 12, 6, 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 'absorb_vortex': {
          // Inward green energy spiral
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2.5;
          for (let i = 0; i < 6; i++) {
            const ang = t * 6 + i * (Math.PI / 3);
            const dist = 55 - (cycle * 35) % 45;
            ctx.beginPath();
            ctx.arc(fX + Math.cos(ang) * dist, fY - 25 + Math.sin(ang) * dist, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#10b981';
            ctx.fill();
          }
          break;
        }

        case 'seed_bomb': {
          // Parabolic seed bomb arc
          const bProg = cycle / 1.1;
          if (bProg <= 1) {
            const bX = fX + 20 + bProg * (tX - fX - 10);
            const bY = (fY - 25) - Math.sin(bProg * Math.PI) * 60;
            ctx.fillStyle = '#84cc16';
            ctx.beginPath();
            ctx.arc(bX, bY, 8, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Blast on floor
            ctx.fillStyle = 'rgba(132, 204, 22, 0.75)';
            ctx.beginPath();
            ctx.arc(tX, fY - 12, 32, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 'rest': {
          // Sudden ping flash & Zzz bubbles
          if (cycle < 0.4) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(fX + 16, fY - 20, 48, 0, Math.PI * 2);
            ctx.shadowColor = '#ec4899';
            ctx.shadowBlur = 30;
            ctx.fill();
          } else {
            ctx.fillStyle = '#f472b6';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText('Zzz...', fX + 10, fY - 45 - (cycle * 15));
          }
          break;
        }

        case 'rollout': {
          // Rolling wheel with spark trail
          const rollX = fX + Math.sin(cycle * Math.PI * 2) * 50 + 40;
          ctx.strokeStyle = '#f472b6';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(rollX, fY - 18, 20, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }

        case 'shadow_ball': {
          // Pulsing shadowy orb
          const sX = fX + 25 + (cycle / 1.4) * (tX - fX);
          ctx.beginPath();
          ctx.arc(sX, fY - 25, 16, 0, Math.PI * 2);
          ctx.fillStyle = '#6b21a8';
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 24;
          ctx.fill();
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 3;
          ctx.stroke();
          break;
        }

        case 'toxic_cloud': {
          // Billowing purple toxic fumes
          for (let i = 0; i < 7; i++) {
            const pX = fX + 45 + (i * 12);
            const pY = fY - 16 - Math.sin(t * 3 + i) * 15;
            ctx.beginPath();
            ctx.arc(pX, pY, 14, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(168, 85, 247, 0.55)';
            ctx.shadowColor = '#9333ea';
            ctx.shadowBlur = 15;
            ctx.fill();
          }
          break;
        }

        case 'duo_spark': {
          // Intertwined double electric helix
          for (let i = 0; i < 15; i++) {
            const prog = (i / 15 + t * 1.5) % 1;
            const pX = fX + 25 + prog * (tX - fX);
            const pY1 = fY - 25 + Math.sin(prog * 12 + t * 8) * 18;
            const pY2 = fY - 25 - Math.sin(prog * 12 + t * 8) * 18;

            ctx.fillStyle = '#38bdf8'; // Minun blue (-)
            ctx.beginPath();
            ctx.arc(pX, pY1, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ef4444'; // Plusle red (+)
            ctx.beginPath();
            ctx.arc(pX, pY2, 5, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        default: {
          // Melee slash visual
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(fX + 35, fY - 25, 26, -0.6, 0.8);
          ctx.stroke();
          break;
        }
      }

      ctx.restore();
    }

    _startShowcaseLoop() {
      const p1Canvas = document.getElementById('ssbu-p1-showcase-canvas');
      const cpuCanvas = document.getElementById('ssbu-cpu-showcase-canvas');

      const p1Ctx = p1Canvas ? p1Canvas.getContext('2d') : null;
      const cpuCtx = cpuCanvas ? cpuCanvas.getContext('2d') : null;

      const loop = () => {
        if (p1Ctx && p1Canvas) {
          p1Ctx.clearRect(0, 0, p1Canvas.width, p1Canvas.height);
          if (!this.p1ShowcaseAnim || this.p1ShowcaseAnim.dex !== this.selectedP1Dex) {
            this.p1ShowcaseAnim = new window.SpriteAnimator(this.selectedP1Dex, 2.6);
            this.p1ShowcaseAnim.loop('Idle', 1.0);
          }
          this.p1ShowcaseAnim.setFacing(1);
          this.p1ShowcaseAnim.update(0.016);
          this.p1ShowcaseAnim.draw(p1Ctx, p1Canvas.width * 0.5, p1Canvas.height - 18);
        }

        if (cpuCtx && cpuCanvas) {
          cpuCtx.clearRect(0, 0, cpuCanvas.width, cpuCanvas.height);
          if (!this.cpuShowcaseAnim || this.cpuShowcaseAnim.dex !== this.selectedCpuDex) {
            this.cpuShowcaseAnim = new window.SpriteAnimator(this.selectedCpuDex, 2.6);
            this.cpuShowcaseAnim.loop('Idle', 1.0);
          }
          this.cpuShowcaseAnim.setFacing(-1);
          this.cpuShowcaseAnim.update(0.016);
          this.cpuShowcaseAnim.draw(cpuCtx, cpuCanvas.width * 0.5, cpuCanvas.height - 18);
        }

        this.showcaseRafId = requestAnimationFrame(loop);
      };

      this.showcaseRafId = requestAnimationFrame(loop);
    }

    updateUI() {
      // 1. Update Roster Cards Tokens & Active styles
      const tiles = document.querySelectorAll('.ssbu-fighter-tile');
      tiles.forEach(tile => {
        const dex = parseInt(tile.getAttribute('data-dex'), 10);
        const isP1 = dex === this.selectedP1Dex;
        const isCpu = dex === this.selectedCpuDex;

        tile.classList.toggle('selected-p1', isP1);
        tile.classList.toggle('selected-cpu', isCpu);

        const tokenP1 = tile.querySelector('.ssbu-token-p1');
        const tokenCpu = tile.querySelector('.ssbu-token-cpu');

        if (tokenP1) tokenP1.style.display = isP1 ? 'flex' : 'none';
        if (tokenCpu) tokenCpu.style.display = isCpu ? 'flex' : 'none';
      });

      // 2. Update Bottom Showcase Pods
      const p1Data = FIGHTER_STATS[this.selectedP1Dex] || FIGHTER_STATS[25];
      const cpuData = FIGHTER_STATS[this.selectedCpuDex] || FIGHTER_STATS[1];

      const p1Name = document.getElementById('ssbu-p1-pod-name');
      const p1Type = document.getElementById('ssbu-p1-pod-type');
      const p1Weight = document.getElementById('ssbu-p1-pod-weight');

      if (p1Name) p1Name.innerText = p1Data.name.toUpperCase();
      if (p1Type) {
        p1Type.innerText = p1Data.type;
        p1Type.style.color = p1Data.typeColor;
      }
      if (p1Weight) p1Weight.innerText = `⚖️ ${p1Data.weight} · ${p1Data.weightCategory}`;

      const cpuName = document.getElementById('ssbu-cpu-pod-name');
      const cpuType = document.getElementById('ssbu-cpu-pod-type');
      const cpuWeight = document.getElementById('ssbu-cpu-pod-weight');

      if (cpuName) cpuName.innerText = cpuData.name.toUpperCase();
      if (cpuType) {
        cpuType.innerText = cpuData.type;
        cpuType.style.color = cpuData.typeColor;
      }
      if (cpuWeight) cpuWeight.innerText = `⚖️ ${cpuData.weight} · ${cpuData.weightCategory}`;

      // 3. Sync with legacy selectors if present
      document.querySelectorAll('[data-roster-p1]').forEach(c => {
        const d = parseInt(c.getAttribute('data-roster-p1'), 10);
        c.classList.toggle('active', d === this.selectedP1Dex);
      });
      document.querySelectorAll('[data-roster-cpu]').forEach(c => {
        const d = parseInt(c.getAttribute('data-roster-cpu'), 10);
        c.classList.toggle('active', d === this.selectedCpuDex);
      });
    }
  }

  window.SSBURoster = new SSBURosterController();

  // Auto-init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    window.SSBURoster.init();
  });
})();
