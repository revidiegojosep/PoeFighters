/**
 * Main Super Smash Bros Pokemon Game Engine
 * Coordinates canvas rendering, input listeners, match configuration,
 * CPU difficulty (Levels 1-3), Versus (3 Stocks) and Training modes.
 */
class PokeSmashGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = 1024;
    this.height = 576;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Pixel art crisp rendering
    this.ctx.imageSmoothingEnabled = false;

    // Match Configuration
    this.gameMode = 'BATTLE'; // 'BATTLE' (Partida a 3 Vidas) or 'TRAINING' (Entrenamiento)
    this.cpuLevel = 2;        // 1: Principiante, 2: Intermedio, 3: Experto
    this.playerDex = 25;      // Default Pikachu
    this.dummyDex = 1;        // Default Bulbasaur
    this.p1Type = 'HUMAN';    // 'HUMAN' or 'CPU'
    this.p1CpuLevel = 2;      // 1, 2, 3
    this.p1Controller = null;
    this.p2Type = 'CPU';      // 'CPU' or 'HUMAN' (Local Multiplayer)
    this.showHitboxes = false; // Training Lab Hitbox Visualizer
    this.matchStarted = false; // Menu displays by default BEFORE playing!
    this.isMatchOver = false;

    // Stage Selection & Held Items
    this.stageId = 'BATTLEFIELD'; // 'BATTLEFIELD', 'FINAL_DESTINATION', 'LAVENDER_TOWER', 'CINNABAR_ISLAND', 'POWER_PLANT'
    this.p1Item = 'none';
    this.dummyItem = 'none';

    // Graphics & Performance Presets ('ultra', 'high', 'medium', 'low') & 140 FPS Target
    this.graphicsQuality = localStorage.getItem('pokefighters_graphics') || 'ultra';
    this.targetFPS = parseInt(localStorage.getItem('pokefighters_fps') || '140', 10);
    this.showFpsCounter = localStorage.getItem('pokefighters_show_fps') !== 'false';
    this.lastRenderTime = performance.now();
    this.frameCount = 0;
    this.lastFpsUpdateTime = performance.now();
    this.currentFps = 140;

    // Gamepad API Support (Xbox, PS, Switch Pro, USB)
    this.gamepads = [];
    this.gamepadConnected = false;
    this.lastGamepadState = [{}, {}];

    // Customizable Keybinds
    this.defaultKeybinds = {
      left: 'KeyA',
      right: 'KeyD',
      up: 'KeyW',
      down: 'KeyS',
      jump: 'Space',
      attack: 'KeyZ',
      special: 'KeyX',
      smash: 'ControlLeft', // Mantener Ctrl + Dirección para cargar Ataque Smash
      shield: 'KeyC',
      grab: 'ShiftLeft',
      item: 'Digit1'
    };
    this.keybinds = Object.assign({}, this.defaultKeybinds);
    try {
      const savedKeybinds = JSON.parse(localStorage.getItem('pokefighters_keybinds'));
      if (savedKeybinds && typeof savedKeybinds === 'object') {
        Object.assign(this.keybinds, savedKeybinds);
      }
    } catch (e) {}

    // Customizable Gamepad Binds (Mapeo de botones en mando)
    this.defaultGamepadBinds = {
      jump: [0, 3],       // A / Y (Xbox) o Cross / Triangle (PS)
      attack: [2],        // X (Xbox) o Square (PS)
      special: [1],       // B (Xbox) o Circle (PS)
      smash: [11],        // R3 (Click stick derecho)
      shield: [4, 6],     // LB / LT
      grab: [5, 7],       // RB / RT
      item: [8]           // Select / View / Share
    };
    this.gamepadBinds = Object.assign({}, this.defaultGamepadBinds);
    try {
      const savedGpBinds = JSON.parse(localStorage.getItem('pokefighters_gamepad_binds'));
      if (savedGpBinds && typeof savedGpBinds === 'object') {
        Object.assign(this.gamepadBinds, savedGpBinds);
      }
    } catch (e) {}
    this.listeningGpAction = null;

    this._initGamepadListeners();

    // Entities
    this.stage = new window.Stage(this.width, this.height);
    this.stage.setGraphicsQuality(this.graphicsQuality);
    this.stage.setStage(this.stageId);

    this.player = this.createFighter(this.playerDex, true, false, 3, this.p1Item);
    this.dummy = this.createFighter(this.dummyDex, false, true, 3, this.dummyItem);

    this.dummyController = new window.TrainingDummyController(this.dummy);
    this.dummyController.setMode('CPU_BATTLE');
    this.dummyController.setCpuLevel(this.cpuLevel);

    this.hud = new window.GameHUD();

    // Fixed 60Hz simulation step
    this.fixedStep = 1 / 60;
    this.accumulator = 0;
    this.lastTime = performance.now();
    this.keysDown = {};

    // Screen Shake Effect (Smash KO impact & heavy attacks)
    this.screenShakeIntensity = 0;
    this.screenShakeDuration = 0;
    this.screenShakeTimer = 0;

    // Slow-motion & Smash Ultimate End Match Cutscene
    this.slomoTimer = 0;
    this.slomoFactor = 1.0;
    this.isDecisiveFinish = false;
    this.pendingMatchResult = null;
    this.fatalImpactFlash = 0;
    this.endCutsceneActive = false;
    this.endCutsceneTimer = 0;
    this.endCutsceneDuration = 2.6;
    this.endCutsceneResult = null;
    this.cutsceneSlamConnected = false;

    // Countdown 3.. 2.. 1.. ¡YA!
    this.countdownTimer = 0;
    this.isCountingDown = false;
    this.lastCountdownStep = 4;

    // Match Rules (Stocks, Time Limit & Items)
    this.currentSetupStep = 1;
    this.matchStocks = 3;
    this.matchTimeLimit = 0; // 0 = Sin límite
    this.matchTimeRemaining = 0;
    this.itemsEnabled = true;

    // Gamepad controller support
    this.gamepadPrevButtons = { p1: {}, p2: {} };
    this.gamepadConnected = false;
    this._initGamepadListeners();

    // Online Multiplayer & Anti-Cheat
    this.isOnlineMatch = false;
    this.onlineRole = null;
    this.onlineRoomCode = null;
    this.onlineManager = new window.OnlineManager(this);

    this._bindControls();
    this._bindTrainingButtons();
    this._bindMatchSetupModal();
    this._bindSettingsModal();
    this._bindStartScreen();
    this._bindChangelogModal();
    this._bindOnlineMultiplayer();
    this._initBackgroundWorker();
  }

  /**
   * Bucle en segundo plano mediante Web Worker (Inmune al throttling de pestañas inactivas)
   * Garantiza que la simulación física y sincronización de red online NUNCA se congelen al cambiar de pestaña.
   */
  _initBackgroundWorker() {
    try {
      const code = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (!timer) {
              timer = setInterval(function() {
                self.postMessage('tick');
              }, 16);
            }
          } else if (e.data === 'stop') {
            if (timer) {
              clearInterval(timer);
              timer = null;
            }
          }
        };
      `;
      const blob = new Blob([code], { type: 'application/javascript' });
      this.bgWorker = new Worker(URL.createObjectURL(blob));
      this.bgWorker.onmessage = (e) => {
        if (e.data === 'tick') {
          // Si estamos en partida multijugador online y la pestaña está oculta o inactiva,
          // ejecutamos física continua y sincronización sin retraso ni saltos
          if (this.isOnlineMatch && document.hidden) {
            this.fixedUpdate(this.fixedStep);
            if (this.onlineManager && typeof this.onlineManager._sendLocalFighterState === 'function') {
              this.onlineManager._sendLocalFighterState();
            }
          }
        }
      };
      this.bgWorker.postMessage('start');
    } catch (err) {
      console.warn('[Game] Error al inicializar Background Worker:', err);
    }

    // Reajustar tiempos al restaurar visibilidad de pestaña para eliminar ráfagas acumuladas
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.lastTime = performance.now();
        this.lastRenderTime = performance.now();
        this.accumulator = 0;
      }
    });

    window.addEventListener('focus', () => {
      this.lastTime = performance.now();
      this.lastRenderTime = performance.now();
      this.accumulator = 0;
    });
  }

  goToSetupStep(step) {
    this.currentSetupStep = Math.max(1, Math.min(3, parseInt(step, 10) || 1));

    // Update step screens
    const screens = document.querySelectorAll('.setup-step-screen');
    screens.forEach((scr, idx) => {
      scr.classList.toggle('active', (idx + 1) === this.currentSetupStep);
    });

    // Update step breadcrumbs
    const crumbs = document.querySelectorAll('.step-crumb');
    crumbs.forEach(crumb => {
      const s = parseInt(crumb.getAttribute('data-step'), 10);
      crumb.classList.toggle('active', s === this.currentSetupStep);
    });

    if (window.soundEngine) {
      window.soundEngine.playSfx('select');
    }
  }

  triggerScreenShake(intensity = 18, duration = 0.42) {
    this.screenShakeIntensity = Math.max(this.screenShakeIntensity, intensity);
    this.screenShakeDuration = Math.max(this.screenShakeDuration, duration);
    this.screenShakeTimer = Math.max(this.screenShakeTimer, duration);
  }

  createFighter(dex, isPlayer, isDummy, stocks = 3, heldItem = 'none', slot = null) {
    const isSlot1 = (slot !== null) ? (slot === 1) : isPlayer;
    const config = {
      x: isSlot1 ? 360 : 664,
      y: 430,
      facing: isSlot1 ? 1 : -1,
      isPlayer: isPlayer,
      isDummy: isDummy,
      stocks: stocks,
      heldItem: heldItem,
      playerSlot: (slot !== null) ? slot : (isPlayer ? 1 : 2)
    };

    switch (parseInt(dex, 10)) {
      case 1:
        return new window.Bulbasaur(config);
      case 6:
        return new window.Charizard(config);
      case 39:
        return new window.Jigglypuff(config);
      case 700:
        return new window.Sylveon(config);
      case 94:
        return new window.Gengar(config);
      case 312:
        return new window.MinunPlusle(config);
      case 25:
      default:
        return new window.Pikachu(config);
    }
  }

  swapRivalFighter(dex) {
    if (!this.dummy || this.dummy.dex === dex) return;
    const dexNum = parseInt(dex, 10);
    console.log(`[🌐 Online] Sincronizando Pokémon del rival a Dex #${dexNum}`);
    const oldX = this.dummy.x;
    const oldY = this.dummy.y;
    const oldFacing = this.dummy.facing;
    const oldPercent = this.dummy.percent;
    const oldStocks = this.dummy.stocks;
    const oldItem = this.dummy.heldItem ? this.dummy.heldItem.id : 'none';
    const slot = (this.onlineRole === 'guest') ? 1 : 2;

    this.dummy = this.createFighter(dexNum, false, true, oldStocks, oldItem, slot);
    this.dummy.x = oldX;
    this.dummy.y = oldY;
    this.dummy.facing = oldFacing;
    this.dummy.percent = oldPercent;
    this.dummyDex = dexNum;

    if (this.dummyController) {
      this.dummyController.setDummyFighter(this.dummy);
      this.dummyController.setMode('STAND');
    }

    if (this.hud) {
      this.hud.updateFighterInfo(this.player, this.dummy);
    }
  }

  init() {
    this.hud.updateFighterInfo(this.player, this.dummy);
    this.hud.setGameModeUI(this.gameMode);
    this._updateRosterButtonsUI();

    // Preload sprites
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');

    window.spriteManager.preloadAll(
      (loaded, total) => {
        if (loadingText) loadingText.innerText = `Cargando sprites (${loaded}/${total})...`;
      },
      () => {
        if (loadingOverlay) {
          loadingOverlay.classList.add('hidden');
          setTimeout(() => loadingOverlay.remove(), 400);
        }
        this.hud.renderModalAvatars();

        // Show Start Screen on load
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
          startScreen.classList.remove('hidden');
        } else {
          const setupModal = document.getElementById('match-setup-modal');
          if (setupModal) setupModal.classList.add('open');
        }

        // Start loop (will render stage background & fighters in idle pose)
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
      }
    );
  }

  startMatch(options = {}) {
    this.gameMode = options.mode || this.gameMode || 'BATTLE';
    this.cpuLevel = options.cpuLevel || this.cpuLevel || 2;
    this.playerDex = options.playerDex || this.playerDex || 25;
    this.dummyDex = options.dummyDex || this.dummyDex || 1;
    this.p1Type = options.p1Type || this.p1Type || 'HUMAN';
    this.p1CpuLevel = options.p1CpuLevel || this.p1CpuLevel || 2;
    this.p2Type = options.p2Type || this.p2Type || 'CPU';
    this.stageId = options.stageId || this.stageId || 'BATTLEFIELD';
    this.matchStocks = options.stocks !== undefined ? options.stocks : (this.matchStocks || 3);
    this.matchTimeLimit = options.timeLimit !== undefined ? options.timeLimit : (this.matchTimeLimit || 0);
    this.matchTimeRemaining = this.matchTimeLimit;
    this.itemsEnabled = options.itemsEnabled !== undefined ? options.itemsEnabled : (this.itemsEnabled !== false);

    // Reglas fijas oficiales de Multijugador en Línea
    if (this.gameMode === 'ONLINE') {
      this.p1Type = 'HUMAN';
      this.p2Type = 'ONLINE_RIVAL';
      this.matchStocks = 3;        // 3 Vidas Obligatorias
      this.matchTimeLimit = 300;   // 5 Minutos (300s)
      this.matchTimeRemaining = 300;
    }

    if (!this.itemsEnabled) {
      this.p1Item = 'none';
      this.dummyItem = 'none';
    } else {
      this.p1Item = options.p1Item !== undefined ? options.p1Item : (this.p1Item || 'none');
      this.dummyItem = options.dummyItem !== undefined ? options.dummyItem : (this.dummyItem || 'none');
    }

    this.isMatchOver = false;
    this.matchStarted = true;
    this.isDecisiveFinish = false;
    this.pendingMatchResult = null;
    this.slomoTimer = 0;
    this.slomoFactor = 1.0;
    this.fatalImpactFlash = 0;
    this.endCutsceneActive = false;
    this.endCutsceneTimer = 0;
    this.cutsceneSlamConnected = false;
    this.screenShakeIntensity = 0;
    this.screenShakeDuration = 0;
    this.screenShakeTimer = 0;

    // Set stage in engine
    this.stage.setStage(this.stageId);
    this.stage.time = 0;

    const initialStocks = (this.gameMode === 'BATTLE' || this.gameMode === 'ONLINE') ? this.matchStocks : 99;

    if (this.gameMode === 'ONLINE') {
      if (this.onlineRole === 'guest') {
        // Guest: jugador local en Slot 2 (lado derecho 664), rival remoto en Slot 1 (lado izquierdo 360)
        this.player = this.createFighter(this.playerDex, true, false, initialStocks, this.p1Item, 2);
        this.dummy = this.createFighter(this.dummyDex, false, true, initialStocks, this.dummyItem, 1);
      } else {
        // Host: jugador local en Slot 1 (lado izquierdo 360), rival remoto en Slot 2 (lado derecho 664)
        this.player = this.createFighter(this.playerDex, true, false, initialStocks, this.p1Item, 1);
        this.dummy = this.createFighter(this.dummyDex, false, true, initialStocks, this.dummyItem, 2);
      }
    } else {
      this.player = this.createFighter(this.playerDex, true, false, initialStocks, this.p1Item, 1);
      this.dummy = this.createFighter(this.dummyDex, false, true, initialStocks, this.dummyItem, 2);
    }

    if (this.p1Type === 'CPU') {
      this.p1Controller = new window.TrainingDummyController(this.player);
      this.p1Controller.setMode('CPU_BATTLE');
      this.p1Controller.setCpuLevel(this.p1CpuLevel);
    } else {
      this.p1Controller = null;
    }

    this.dummyController.setDummyFighter(this.dummy);
    if (this.p2Type === 'HUMAN' || this.p2Type === 'ONLINE_RIVAL') {
      this.dummyController.setMode('STAND');
    } else if (this.gameMode === 'BATTLE') {
      this.dummyController.setMode('CPU_BATTLE');
      this.dummyController.setCpuLevel(this.cpuLevel);
    } else {
      this.dummyController.setMode('STAND');
    }

    this.hud.updateFighterInfo(this.player, this.dummy);
    this.hud.setGameModeUI(this.gameMode);
    this._updateRosterButtonsUI();

    // Close modals & start screen
    const setupModal = document.getElementById('match-setup-modal');
    if (setupModal) setupModal.classList.remove('open');
    const victoryModal = document.getElementById('victory-modal');
    if (victoryModal) victoryModal.classList.remove('open');
    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.classList.add('hidden');

    // Trigger 3.. 2.. 1.. ¡YA! Countdown
    this.countdownTimer = 3.6;
    this.isCountingDown = true;
    this.lastCountdownStep = 4;
    window.soundEngine.playSfx('countdown_beep');
  }

  setPlayerCharacter(dex) {
    this.playerDex = parseInt(dex, 10);
    const oldX = this.player.x;
    const oldY = this.player.y;
    const oldFacing = this.player.facing;
    const oldStocks = this.player.stocks;

    this.player = this.createFighter(this.playerDex, true, false, oldStocks, this.p1Item);
    this.player.x = oldX;
    this.player.y = oldY;
    this.player.facing = oldFacing;

    if (this.p1Type === 'CPU') {
      this.p1Controller = new window.TrainingDummyController(this.player);
      this.p1Controller.setMode('CPU_BATTLE');
      this.p1Controller.setCpuLevel(this.p1CpuLevel);
    }

    this.hud.updateFighterInfo(this.player, this.dummy);
    this._updateRosterButtonsUI();
    window.soundEngine.playSfx('select');
  }

  setDummyCharacter(dex) {
    this.dummyDex = parseInt(dex, 10);
    const oldX = this.dummy.x;
    const oldY = this.dummy.y;
    const oldFacing = this.dummy.facing;
    const oldStocks = this.dummy.stocks;

    this.dummy = this.createFighter(this.dummyDex, false, true, oldStocks, this.dummyItem);
    this.dummy.x = oldX;
    this.dummy.y = oldY;
    this.dummy.facing = oldFacing;

    this.dummyController.setDummyFighter(this.dummy);
    if (this.gameMode === 'BATTLE') {
      this.dummyController.setMode('CPU_BATTLE');
      this.dummyController.setCpuLevel(this.cpuLevel);
    }
    this.hud.updateFighterInfo(this.player, this.dummy);
    this._updateRosterButtonsUI();
    window.soundEngine.playSfx('select');
  }

  _updateRosterButtonsUI() {
    // Update active class on training deck quick-select buttons
    document.querySelectorAll('[data-p1-dex]').forEach(btn => {
      const bDex = parseInt(btn.getAttribute('data-p1-dex'), 10);
      btn.classList.toggle('active', bDex === this.playerDex);
    });

    document.querySelectorAll('[data-dummy-dex]').forEach(btn => {
      const bDex = parseInt(btn.getAttribute('data-dummy-dex'), 10);
      btn.classList.toggle('active', bDex === this.dummyDex);
    });

    // Update active class on modal roster cards
    document.querySelectorAll('[data-roster-p1]').forEach(card => {
      const cDex = parseInt(card.getAttribute('data-roster-p1'), 10);
      card.classList.toggle('active', cDex === this.playerDex);
    });

    document.querySelectorAll('[data-roster-cpu]').forEach(card => {
      const cDex = parseInt(card.getAttribute('data-roster-cpu'), 10);
      card.classList.toggle('active', cDex === this.dummyDex);
    });

    if (window.SSBURoster) {
      window.SSBURoster.selectedP1Dex = this.playerDex;
      window.SSBURoster.selectedCpuDex = this.dummyDex;
      window.SSBURoster.updateUI();
    }

    // Update P1 Control buttons in modal
    document.querySelectorAll('[data-p1-control]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-p1-control') === this.p1Type);
    });

    const p1DiffContainer = document.getElementById('p1-cpu-diff-container');
    if (p1DiffContainer) {
      p1DiffContainer.style.display = this.p1Type === 'CPU' ? 'block' : 'none';
    }

    document.querySelectorAll('[data-p1-cpu-level]').forEach(btn => {
      const lvl = parseInt(btn.getAttribute('data-p1-cpu-level'), 10);
      btn.classList.toggle('active', lvl === this.p1CpuLevel);
    });

    // Update P1 Control button on deck
    const deckP1Btn = document.getElementById('deck-p1-control-toggle');
    if (deckP1Btn) {
      deckP1Btn.innerText = this.p1Type === 'CPU' ? `🤖 P1: CPU (Nv. ${this.p1CpuLevel})` : '🎮 P1: Humano';
      deckP1Btn.classList.toggle('active', this.p1Type === 'CPU');
    }

    // Update stage selection cards
    document.querySelectorAll('[data-stage]').forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-stage') === this.stageId);
    });

    // Update item selection cards
    document.querySelectorAll('[data-p1-item]').forEach(card => {
      const active = card.getAttribute('data-p1-item') === this.p1Item;
      card.classList.toggle('active', active);
      if (active) {
        const hint = document.getElementById('p1-selected-item-name');
        if (hint) hint.innerText = card.getAttribute('data-item-name') || 'Sin Objeto';
      }
    });

    document.querySelectorAll('[data-cpu-item]').forEach(card => {
      const active = card.getAttribute('data-cpu-item') === this.dummyItem;
      card.classList.toggle('active', active);
      if (active) {
        const hint = document.getElementById('cpu-selected-item-name');
        if (hint) hint.innerText = card.getAttribute('data-item-name') || 'Sin Objeto';
      }
    });
  }

  _bindControls() {
    window.addEventListener('keydown', (e) => {
      window.soundEngine.ensureContext();

      const key = e.key.toLowerCase();
      const code = e.code;

      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
        if (!['input', 'textarea'].includes((e.target && e.target.tagName || '').toLowerCase())) {
          e.preventDefault();
        }
      }

      if (code === 'KeyR' || key === 'r') {
        this.resetDummy();
        return;
      }

      if (code === 'KeyM' || key === 'm') {
        const playing = window.soundEngine.toggleMusic();
        const musicBtn = document.getElementById('btn-music');
        if (musicBtn) {
          musicBtn.innerText = playing ? '🎵 Música: ON' : '🔇 Música: OFF';
          musicBtn.classList.toggle('active', playing);
        }
        return;
      }

      if (code === 'KeyF' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.toggleFullscreen();
        return;
      }

      // Hitbox / Hurtbox Visualizer Toggle (Key H)
      if (code === 'KeyH' || key === 'h') {
        this.showHitboxes = !this.showHitboxes;
        const hbBtn = document.getElementById('btn-toggle-hitboxes');
        if (hbBtn) {
          hbBtn.innerText = this.showHitboxes ? '🎯 Hitboxes: ON' : '🎯 Hitboxes: OFF';
          hbBtn.classList.toggle('active', this.showHitboxes);
        }
        if (window.soundEngine) window.soundEngine.playSfx('select');
        return;
      }

      // =====================================================================
      // 👥 CONTROLES JUGADOR 2 (Multijugador Local)
      // =====================================================================
      if (this.p2Type === 'HUMAN' && this.dummy) {
        if (code === 'ArrowLeft') {
          this.dummy.input.left = true;
          this.dummy.input.leftPressed = true;
        }
        if (code === 'ArrowRight') {
          this.dummy.input.right = true;
          this.dummy.input.rightPressed = true;
        }
        if (code === 'ArrowUp') {
          this.dummy.input.up = true;
          this.dummy.input.upPressed = true;
          this.dummy.input.jump = true;
          this.dummy.input.jumpPressed = true;
        }
        if (code === 'ArrowDown') {
          this.dummy.input.down = true;
          this.dummy.input.downPressed = true;
        }
        // Attack: Numpad1 or KeyU or Period
        if (code === 'Numpad1' || code === 'KeyU' || code === 'Period') {
          this.dummy.input.attack = true;
          this.dummy.input.attackPressed = true;
        }
        // Special: Numpad2 or KeyI or Comma
        if (code === 'Numpad2' || code === 'KeyI' || code === 'Comma') {
          this.dummy.input.special = true;
          this.dummy.input.specialPressed = true;
        }
        // Shield: Numpad3 or KeyO or Slash or Minus
        if (code === 'Numpad3' || code === 'KeyO' || code === 'Slash' || code === 'Minus') {
          this.dummy.input.shield = true;
          this.dummy.input.shieldPressed = true;
        }
        // Grab: Numpad0 or KeyP or ShiftRight or Enter
        if (code === 'Numpad0' || code === 'KeyP' || code === 'ShiftRight' || code === 'Enter') {
          this.dummy.input.grab = true;
          this.dummy.input.grabPressed = true;
        }
        // Item: Numpad4 or Digit0
        if (code === 'Numpad4' || code === 'Digit0') {
          if (typeof this.dummy.useActiveItem === 'function') this.dummy.useActiveItem();
        }
      }

      // =====================================================================
      // 🎮 CONTROLES JUGADOR 1 (WASD + Z/X/C + Shift)
      // =====================================================================
      if (this.p1Type === 'CPU') return;

      if (this.keysDown[code]) return;
      this.keysDown[code] = true;

      const kb = this.keybinds;
      const isP2Human = (this.p2Type === 'HUMAN');

      // If P2 is human, arrow keys belong to P2, so P1 uses WASD
      if (code === 'KeyA' || key === 'a' || (!isP2Human && (code === kb.left || code === 'ArrowLeft'))) {
        this.player.input.left = true;
        this.player.input.leftPressed = true;
      }
      if (code === 'KeyD' || key === 'd' || (!isP2Human && (code === kb.right || code === 'ArrowRight'))) {
        this.player.input.right = true;
        this.player.input.rightPressed = true;
      }
      if (code === 'KeyW' || key === 'w' || (!isP2Human && (code === kb.up || code === 'ArrowUp'))) {
        this.player.input.up = true;
        this.player.input.upPressed = true;
      }
      if (code === 'KeyS' || key === 's' || (!isP2Human && (code === kb.down || code === 'ArrowDown'))) {
        this.player.input.down = true;
        this.player.input.downPressed = true;
      }

      if (code === kb.jump || code === 'Space') {
        this.player.input.jump = true;
        this.player.input.jumpPressed = true;
      }

      if (code === kb.attack || (kb.attack === 'KeyZ' && key === 'z')) {
        this.player.input.attack = true;
        this.player.input.attackPressed = true;
      }

      if (code === kb.special || (kb.special === 'KeyX' && key === 'x')) {
        this.player.input.special = true;
        this.player.input.specialPressed = true;
      }

      if (code === kb.shield || (kb.shield === 'KeyC' && key === 'c')) {
        this.player.input.shield = true;
        this.player.input.shieldPressed = true;
      }

      // Agarre P1 (Shift Izquierdo o tecla grab configurada)
      if (code === kb.grab || code === 'ShiftLeft' || (!isP2Human && code === 'ShiftRight')) {
        this.player.input.grab = true;
        this.player.input.grabPressed = true;
      }

      // Cargar Smash Attack P1 (Ctrl o tecla smash configurada)
      if (code === kb.smash || code === 'ControlLeft' || (!isP2Human && code === 'ControlRight')) {
        this.player.input.smash = true;
      }

      if (code === kb.item || code === 'Digit1' || (!isP2Human && (code === 'Numpad1' || key === '1'))) {
        if (this.player && typeof this.player.useActiveItem === 'function') {
          this.player.useActiveItem();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      const code = e.code;
      this.keysDown[code] = false;

      // Player 2 Keyup
      if (this.p2Type === 'HUMAN' && this.dummy) {
        if (code === 'ArrowLeft') this.dummy.input.left = false;
        if (code === 'ArrowRight') this.dummy.input.right = false;
        if (code === 'ArrowUp') {
          this.dummy.input.up = false;
          this.dummy.input.jump = false;
        }
        if (code === 'ArrowDown') this.dummy.input.down = false;
        if (code === 'Numpad1' || code === 'KeyU' || code === 'Period') this.dummy.input.attack = false;
        if (code === 'Numpad2' || code === 'KeyI' || code === 'Comma') this.dummy.input.special = false;
        if (code === 'Numpad3' || code === 'KeyO' || code === 'Slash' || code === 'Minus') this.dummy.input.shield = false;
        if (code === 'Numpad0' || code === 'KeyP' || code === 'ShiftRight' || code === 'Enter') this.dummy.input.grab = false;
        if (code === 'ControlRight') this.dummy.input.smash = false;
      }

      // Player 1 Keyup
      const kb = this.keybinds;
      const isP2Human = (this.p2Type === 'HUMAN');

      if (code === 'KeyA' || key === 'a' || (!isP2Human && (code === kb.left || code === 'ArrowLeft'))) {
        this.player.input.left = false;
      }
      if (code === 'KeyD' || key === 'd' || (!isP2Human && (code === kb.right || code === 'ArrowRight'))) {
        this.player.input.right = false;
      }
      if (code === 'KeyW' || key === 'w' || (!isP2Human && (code === kb.up || code === 'ArrowUp'))) {
        this.player.input.up = false;
      }
      if (code === 'KeyS' || key === 's' || (!isP2Human && (code === kb.down || code === 'ArrowDown'))) {
        this.player.input.down = false;
      }
      if (code === kb.jump || code === 'Space') {
        this.player.input.jump = false;
      }
      if (code === kb.attack || (kb.attack === 'KeyZ' && key === 'z')) {
        this.player.input.attack = false;
      }
      if (code === kb.special || (kb.special === 'KeyX' && key === 'x')) {
        this.player.input.special = false;
      }
      if (code === kb.shield || (kb.shield === 'KeyC' && key === 'c')) {
        this.player.input.shield = false;
      }
      if (code === kb.grab || code === 'ShiftLeft' || (!isP2Human && code === 'ShiftRight')) {
        this.player.input.grab = false;
      }
      if (code === kb.smash || code === 'ControlLeft' || code === 'ControlRight') {
        this.player.input.smash = false;
      }
    });
  }

  _bindTrainingButtons() {
    // Quick Roster Selectors on Deck
    document.querySelectorAll('[data-p1-dex]').forEach(btn => {
      btn.addEventListener('click', () => {
        const dex = parseInt(btn.getAttribute('data-p1-dex'), 10);
        this.setPlayerCharacter(dex);
      });
    });

    document.querySelectorAll('[data-dummy-dex]').forEach(btn => {
      btn.addEventListener('click', () => {
        const dex = parseInt(btn.getAttribute('data-dummy-dex'), 10);
        this.setDummyCharacter(dex);
      });
    });

    // Dummy Modes
    const modeButtons = document.querySelectorAll('[data-dummy-mode]');
    modeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        modeButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-dummy-mode');
        this.dummyController.setMode(mode);
        window.soundEngine.playSfx('select');
      });
    });

    // Dummy Percent Slider & Presets
    const percentSlider = document.getElementById('dummy-percent-slider');
    const percentVal = document.getElementById('dummy-slider-val');
    if (percentSlider) {
      percentSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (percentVal) percentVal.innerText = `${val}%`;
        this.dummyController.targetPercent = val;
        this.dummy.percent = val;
      });
    }

    const presetButtons = document.querySelectorAll('[data-preset-percent]');
    presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-preset-percent'), 10);
        if (percentSlider) percentSlider.value = val;
        if (percentVal) percentVal.innerText = `${val}%`;
        this.dummyController.targetPercent = val;
        this.dummy.percent = val;
        window.soundEngine.playSfx('select');
      });
    });

    // Reset Button
    const resetBtn = document.getElementById('btn-reset-dummy');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetDummy();
        window.soundEngine.playSfx('select');
      });
    }

    // Toggle Music Button
    const musicBtn = document.getElementById('btn-music');
    if (musicBtn) {
      musicBtn.addEventListener('click', () => {
        const playing = window.soundEngine.toggleMusic();
        musicBtn.innerText = playing ? '🎵 Música: ON' : '🔇 Música: OFF';
      });
    }

    // Hitbox Visualizer Button
    const hitboxBtn = document.getElementById('btn-toggle-hitboxes');
    if (hitboxBtn) {
      hitboxBtn.addEventListener('click', () => {
        this.showHitboxes = !this.showHitboxes;
        hitboxBtn.innerText = this.showHitboxes ? '🎯 Hitboxes: ON' : '🎯 Hitboxes: OFF';
        hitboxBtn.classList.toggle('active', this.showHitboxes);
        window.soundEngine.playSfx('select');
      });
    }

    // Lock Dummy Percent Button
    const lockPercentBtn = document.getElementById('btn-lock-dummy-percent');
    if (lockPercentBtn) {
      lockPercentBtn.addEventListener('click', () => {
        if (this.dummyController.lockedPercent === null) {
          const p = Math.round(this.dummy.percent);
          this.dummyController.lockedPercent = p;
          lockPercentBtn.innerText = `🔒 Bloqueado: ${p}%`;
          lockPercentBtn.classList.add('active');
        } else {
          this.dummyController.lockedPercent = null;
          lockPercentBtn.innerText = '🔓 Fijar %: OFF';
          lockPercentBtn.classList.remove('active');
        }
        window.soundEngine.playSfx('select');
      });
    }
  }

  _bindMatchSetupModal() {
    const setupModal = document.getElementById('match-setup-modal');
    const openMenuBtn = document.getElementById('btn-open-match-menu');
    const closeMenuBtn = document.getElementById('btn-close-setup-modal');

    if (openMenuBtn && setupModal) {
      openMenuBtn.addEventListener('click', () => {
        this.ensureFullscreenModal(setupModal);
        this.hud.renderModalAvatars();
        this._updateRosterButtonsUI();
        this.goToSetupStep(1);
        setupModal.classList.add('open');
        window.soundEngine.playSfx('select');
      });
    }

    if (closeMenuBtn && setupModal) {
      closeMenuBtn.addEventListener('click', () => {
        setupModal.classList.remove('open');
      });
    }

    // Breadcrumbs Navigation Click Listeners (Paso 1, 2, 3)
    const breadcrumbs = document.querySelectorAll('.step-crumb');
    breadcrumbs.forEach(crumb => {
      crumb.addEventListener('click', () => {
        const step = parseInt(crumb.getAttribute('data-step'), 10);
        this.goToSetupStep(step);
      });
    });

    // Modal Mode & Match Rules Variables
    let selectedMode = this.gameMode || 'BATTLE';
    let selectedStocks = this.matchStocks || 3;
    let selectedTime = this.matchTimeLimit || 0;
    let selectedItemsEnabled = this.itemsEnabled !== false ? 'on' : 'off';
    let selectedP1 = this.playerDex;
    let selectedCPU = this.dummyDex;
    let selectedLevel = this.cpuLevel;
    let selectedP1Type = this.p1Type;
    let selectedP1CpuLevel = this.p1CpuLevel;
    let selectedStage = this.stageId;
    let selectedP1Item = this.p1Item;
    let selectedCPUItem = this.dummyItem;

    // Rule Chips - Stocks (Vidas)
    const stockChips = document.querySelectorAll('[data-rule-stocks]');
    stockChips.forEach(chip => {
      chip.addEventListener('click', () => {
        stockChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedStocks = parseInt(chip.getAttribute('data-rule-stocks'), 10) || 3;
        window.soundEngine.playSfx('select');
      });
    });

    // Rule Chips - Time Limit (Tiempo)
    const timeChips = document.querySelectorAll('[data-rule-time]');
    timeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        timeChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedTime = parseInt(chip.getAttribute('data-rule-time'), 10) || 0;
        window.soundEngine.playSfx('select');
      });
    });

    // Rule Chips - Items (Mochila)
    const itemsChips = document.querySelectorAll('[data-rule-items]');
    const itemsBackpackSection = document.getElementById('setup-items-section');
    itemsChips.forEach(chip => {
      chip.addEventListener('click', () => {
        itemsChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedItemsEnabled = chip.getAttribute('data-rule-items');
        if (itemsBackpackSection) {
          itemsBackpackSection.style.display = selectedItemsEnabled === 'on' ? 'block' : 'none';
        }
        window.soundEngine.playSfx('select');
      });
    });

    // Stage Selection Cards
    const stageCards = document.querySelectorAll('[data-stage]');
    stageCards.forEach(card => {
      card.addEventListener('click', () => {
        stageCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedStage = card.getAttribute('data-stage');
        window.soundEngine.playSfx('select');
      });
    });

    // Mochila Category Filter Tabs
    const itemTabBtns = document.querySelectorAll('[data-item-tab]');
    itemTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        itemTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-item-tab');

        const filterGroups = (containerId) => {
          const container = document.getElementById(containerId);
          if (!container) return;
          const groups = container.querySelectorAll('.item-category-group');
          groups.forEach(g => {
            const gCat = g.getAttribute('data-group-cat');
            if (cat === 'all' || gCat === cat) {
              g.classList.remove('hidden');
            } else {
              g.classList.add('hidden');
            }
          });
        };

        filterGroups('p1-items-container');
        filterGroups('cpu-items-container');
        window.soundEngine.playSfx('select');
      });
    });

    // Held Item Selector Cards for P1
    const p1ItemCards = document.querySelectorAll('[data-p1-item]');
    const p1Hint = document.getElementById('p1-selected-item-name');
    p1ItemCards.forEach(card => {
      card.addEventListener('click', () => {
        p1ItemCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedP1Item = card.getAttribute('data-p1-item');
        if (p1Hint) {
          p1Hint.innerText = card.getAttribute('data-item-name') || 'Sin Objeto';
        }
        window.soundEngine.playSfx('select');
      });
    });

    // Held Item Selector Cards for CPU
    const cpuItemCards = document.querySelectorAll('[data-cpu-item]');
    const cpuHint = document.getElementById('cpu-selected-item-name');
    cpuItemCards.forEach(card => {
      card.addEventListener('click', () => {
        cpuItemCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedCPUItem = card.getAttribute('data-cpu-item');
        if (cpuHint) {
          cpuHint.innerText = card.getAttribute('data-item-name') || 'Sin Objeto';
        }
        window.soundEngine.playSfx('select');
      });
    });

    // Modal P1 Control Toggle (Humano vs CPU)
    const p1ControlBtns = document.querySelectorAll('[data-p1-control]');
    const p1DiffContainer = document.getElementById('p1-cpu-diff-container');

    p1ControlBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        p1ControlBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedP1Type = btn.getAttribute('data-p1-control');
        if (p1DiffContainer) {
          p1DiffContainer.style.display = selectedP1Type === 'CPU' ? 'block' : 'none';
        }
        window.soundEngine.playSfx('select');
      });
    });

    // Modal P2 Control Toggle (CPU vs Humano Local)
    let selectedP2Type = this.p2Type || 'CPU';
    const p2ControlBtns = document.querySelectorAll('[data-p2-control]');
    const cpuDiffContainer = document.getElementById('cpu-difficulty-section');

    p2ControlBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        p2ControlBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedP2Type = btn.getAttribute('data-p2-control');
        if (cpuDiffContainer) {
          cpuDiffContainer.style.display = selectedP2Type === 'CPU' ? 'block' : 'none';
        }
        window.soundEngine.playSfx('select');
      });
    });

    // Modal P1 CPU Level pills
    const p1LevelBtns = document.querySelectorAll('[data-p1-cpu-level]');
    p1LevelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        p1LevelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedP1CpuLevel = parseInt(btn.getAttribute('data-p1-cpu-level'), 10);
        window.soundEngine.playSfx('select');
      });
    });

    // Deck P1 Control Toggle Button
    const deckP1Toggle = document.getElementById('deck-p1-control-toggle');
    if (deckP1Toggle) {
      deckP1Toggle.addEventListener('click', () => {
        this.p1Type = this.p1Type === 'HUMAN' ? 'CPU' : 'HUMAN';
        if (this.p1Type === 'CPU') {
          this.p1Controller = new window.TrainingDummyController(this.player);
          this.p1Controller.setMode('CPU_BATTLE');
          this.p1Controller.setCpuLevel(this.p1CpuLevel);
        } else {
          this.p1Controller = null;
        }
        selectedP1Type = this.p1Type;
        this.hud.updateFighterInfo(this.player, this.dummy);
        this._updateRosterButtonsUI();
        window.soundEngine.playSfx('select');
      });
    }

    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
      card.addEventListener('click', () => {
        modeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedMode = card.getAttribute('data-mode');
        window.soundEngine.playSfx('select');
      });
    });

    // Modal P1 Roster Cards
    const p1Cards = document.querySelectorAll('[data-roster-p1]');
    p1Cards.forEach(card => {
      card.addEventListener('click', () => {
        p1Cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedP1 = parseInt(card.getAttribute('data-roster-p1'), 10);
        window.soundEngine.playSfx('select');
      });
    });

    // Modal CPU Roster Cards
    const cpuCards = document.querySelectorAll('[data-roster-cpu]');
    cpuCards.forEach(card => {
      card.addEventListener('click', () => {
        cpuCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedCPU = parseInt(card.getAttribute('data-roster-cpu'), 10);
        window.soundEngine.playSfx('select');
      });
    });

    // CPU Level 1-9 Slider (Levels 1 to 9 Smash Difficulty)
    const CPU_LEVEL_NAMES = [
      'Nivel 1: Principiante (Muy Fácil)',
      'Nivel 2: Novato',
      'Nivel 3: Aficionado',
      'Nivel 4: Promedio',
      'Nivel 5: Intermedio (Equilibrado)',
      'Nivel 6: Avanzado',
      'Nivel 7: Difícil (Experto Smash)',
      'Nivel 8: Maestro (Competición)',
      'Nivel 9: Inmejorable (TAS Pro AI)'
    ];

    const cpuDiffSlider = document.getElementById('cpu-difficulty-slider');
    const cpuDiffLabel = document.getElementById('cpu-difficulty-level-label');
    if (cpuDiffSlider) {
      cpuDiffSlider.addEventListener('input', (e) => {
        selectedLevel = Math.max(1, Math.min(9, parseInt(e.target.value, 10) || 5));
        if (cpuDiffLabel) {
          cpuDiffLabel.innerText = CPU_LEVEL_NAMES[selectedLevel - 1] || `Nivel ${selectedLevel}`;
        }
      });
    }

    // P1 CPU Level 1-9 Slider
    const p1DiffSlider = document.getElementById('p1-difficulty-slider');
    const p1DiffLabel = document.getElementById('p1-difficulty-level-label');
    if (p1DiffSlider) {
      p1DiffSlider.addEventListener('input', (e) => {
        selectedP1CpuLevel = Math.max(1, Math.min(9, parseInt(e.target.value, 10) || 5));
        if (p1DiffLabel) {
          p1DiffLabel.innerText = CPU_LEVEL_NAMES[selectedP1CpuLevel - 1] || `Nivel ${selectedP1CpuLevel}`;
        }
      });
    }

    // Modal CPU Level Pills (legacy compatibility)
    const diffCards = document.querySelectorAll('[data-cpu-level]');
    diffCards.forEach(card => {
      card.addEventListener('click', () => {
        diffCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedLevel = parseInt(card.getAttribute('data-cpu-level'), 10);
        if (cpuDiffSlider) {
          cpuDiffSlider.value = selectedLevel;
          if (cpuDiffLabel) cpuDiffLabel.innerText = CPU_LEVEL_NAMES[selectedLevel - 1] || `Nivel ${selectedLevel}`;
        }
        window.soundEngine.playSfx('select');
      });
    });

    // Start Configured Match Button
    const startMatchBtn = document.getElementById('btn-start-configured-match');
    if (startMatchBtn) {
      startMatchBtn.addEventListener('click', () => {
        if (window.SSBURoster) {
          selectedP1 = window.SSBURoster.selectedP1Dex || selectedP1;
          selectedCPU = window.SSBURoster.selectedCpuDex || selectedCPU;
        }
        this.startMatch({
          mode: selectedMode,
          stocks: selectedStocks,
          timeLimit: selectedTime,
          itemsEnabled: selectedItemsEnabled === 'on',
          playerDex: selectedP1,
          dummyDex: selectedCPU,
          cpuLevel: selectedLevel,
          p1Type: selectedP1Type,
          p1CpuLevel: selectedP1CpuLevel,
          p2Type: selectedP2Type,
          stageId: selectedStage,
          p1Item: selectedItemsEnabled === 'on' ? selectedP1Item : 'none',
          dummyItem: selectedItemsEnabled === 'on' ? selectedCPUItem : 'none'
        });
      });
    }

    // Victory Rematch and Menu Buttons
    const rematchBtn = document.getElementById('btn-victory-rematch');
    if (rematchBtn) {
      rematchBtn.addEventListener('click', () => {
        const victoryModal = document.getElementById('victory-modal');
        if (victoryModal) victoryModal.classList.remove('open');

        if (this.isOnlineMatch && this.onlineManager) {
          // En modo online, volver al lobby de la sala actual y resetear listos
          const onlineModal = document.getElementById('online-match-modal');
          if (onlineModal) onlineModal.classList.add('open');
          this.onlineManager.setReady(false);
          this.onlineManager.status = 'lobby';
          return;
        }

        this.startMatch({
          mode: this.gameMode,
          stocks: this.matchStocks,
          timeLimit: this.matchTimeLimit,
          itemsEnabled: this.itemsEnabled,
          playerDex: this.playerDex,
          dummyDex: this.dummyDex,
          cpuLevel: this.cpuLevel,
          p1Type: this.p1Type,
          p1CpuLevel: this.p1CpuLevel,
          p2Type: this.p2Type,
          stageId: this.stageId,
          p1Item: this.p1Item,
          dummyItem: this.dummyItem
        });
      });
    }

    const victoryMenuBtn = document.getElementById('btn-victory-menu');
    if (victoryMenuBtn) {
      victoryMenuBtn.addEventListener('click', () => {
        const victoryModal = document.getElementById('victory-modal');
        if (victoryModal) victoryModal.classList.remove('open');

        if (this.isOnlineMatch && this.onlineManager) {
          this.isOnlineMatch = false;
          this.onlineManager.leaveRoom();
          const startScreen = document.getElementById('start-screen');
          if (startScreen) startScreen.classList.remove('hidden');
          return;
        }

        if (setupModal) {
          this.ensureFullscreenModal(setupModal);
          this.hud.renderModalAvatars();
          this._updateRosterButtonsUI();
          this.goToSetupStep(1);
          setupModal.classList.add('open');
        }
      });
    }
  }

  _bindStartScreen() {
    const startScreen = document.getElementById('start-screen');
    const btnPlay = document.getElementById('btn-start-play');
    const btnSettings = document.getElementById('btn-start-settings');
    const btnChangelog = document.getElementById('btn-start-changelog');
    const btnGuide = document.getElementById('btn-start-guide');
    const btnReturnMenu = document.getElementById('btn-start-menu-return');
    const setupModal = document.getElementById('match-setup-modal');
    const settingsModal = document.getElementById('settings-modal');
    const changelogModal = document.getElementById('changelog-modal');
    const movesModal = document.getElementById('moves-modal');

    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        if (startScreen) startScreen.classList.add('hidden');
        this.ensureFullscreenModal(setupModal);
        this.hud.renderModalAvatars();
        this._updateRosterButtonsUI();
        this.goToSetupStep(1);
        if (setupModal) setupModal.classList.add('open');
        window.soundEngine.playSfx('select');
      });
    }

    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        this.ensureFullscreenModal(settingsModal);
        this._updateSettingsUI();
        if (settingsModal) settingsModal.classList.add('open');
        window.soundEngine.playSfx('select');
      });
    }

    if (btnChangelog) {
      btnChangelog.addEventListener('click', () => {
        this.ensureFullscreenModal(changelogModal);
        if (changelogModal) changelogModal.classList.add('open');
        window.soundEngine.playSfx('select');
      });
    }

    if (btnGuide) {
      btnGuide.addEventListener('click', () => {
        this.ensureFullscreenModal(movesModal);
        if (movesModal) movesModal.classList.add('open');
        window.soundEngine.playSfx('select');
      });
    }

    if (btnReturnMenu) {
      btnReturnMenu.addEventListener('click', () => {
        if (setupModal) setupModal.classList.remove('open');
        if (settingsModal) settingsModal.classList.remove('open');
        if (changelogModal) changelogModal.classList.remove('open');
        this.ensureFullscreenModal(startScreen);
        if (startScreen) startScreen.classList.remove('hidden');
        window.soundEngine.playSfx('select');
      });
    }
  }

  _bindChangelogModal() {
    const changelogModal = document.getElementById('changelog-modal');
    const openBtn = document.getElementById('btn-open-changelog');
    const closeBtn = document.getElementById('btn-close-changelog-modal');

    if (openBtn && changelogModal) {
      openBtn.addEventListener('click', () => {
        this.ensureFullscreenModal(changelogModal);
        changelogModal.classList.add('open');
        window.soundEngine.playSfx('select');
      });
    }

    if (closeBtn && changelogModal) {
      closeBtn.addEventListener('click', () => {
        changelogModal.classList.remove('open');
      });
    }
  }

  _bindSettingsModal() {
    const settingsModal = document.getElementById('settings-modal');
    const openSettingsBtn = document.getElementById('btn-open-settings');
    const closeSettingsBtn = document.getElementById('btn-close-settings-modal');

    if (openSettingsBtn && settingsModal) {
      openSettingsBtn.addEventListener('click', () => {
        this.ensureFullscreenModal(settingsModal);
        this._updateSettingsUI();
        settingsModal.classList.add('open');
        window.soundEngine.playSfx('select');
      });
    }

    if (closeSettingsBtn && settingsModal) {
      closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('open');
      });
    }

    // Volume Sliders
    const masterSlider = document.getElementById('setting-master-vol');
    const musicSlider = document.getElementById('setting-music-vol');
    const sfxSlider = document.getElementById('setting-sfx-vol');
    const muteToggle = document.getElementById('setting-mute-toggle');

    if (masterSlider) {
      masterSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        window.soundEngine.setMasterVolume(val);
        const l = document.getElementById('val-master-vol');
        if (l) l.innerText = `${Math.round(val * 100)}%`;
      });
    }

    if (musicSlider) {
      musicSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        window.soundEngine.setMusicVolume(val);
        const l = document.getElementById('val-music-vol');
        if (l) l.innerText = `${Math.round(val * 100)}%`;
      });
    }

    if (sfxSlider) {
      sfxSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        window.soundEngine.setSfxVolume(val);
        const l = document.getElementById('val-sfx-vol');
        if (l) l.innerText = `${Math.round(val * 100)}%`;
      });
    }

    if (muteToggle) {
      muteToggle.addEventListener('change', (e) => {
        window.soundEngine.setMute(e.target.checked);
      });
    }

    // Graphics Preset buttons (Ultra, High, Medium, Low)
    document.querySelectorAll('[data-graphics-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-graphics-preset');
        this.setGraphicsQuality(preset);
        window.soundEngine.playSfx('select');
      });
    });

    // FPS Presets buttons (140, 120, 60, 0/Ilimitado)
    document.querySelectorAll('[data-fps-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const fps = parseInt(btn.getAttribute('data-fps-preset'), 10);
        this.setTargetFPS(fps);
        window.soundEngine.playSfx('select');
      });
    });

    // Show FPS Counter Toggle
    const fpsToggle = document.getElementById('setting-fps-counter-toggle');
    if (fpsToggle) {
      fpsToggle.addEventListener('change', (e) => {
        this.setShowFpsCounter(e.target.checked);
      });
    }

    // Keybinds Remapper
    this._bindKeybindRemapper();
    this._bindGamepadRemapper();

    // Fullscreen buttons
    const fsBtns = [
      document.getElementById('btn-fullscreen-toggle'),
      document.getElementById('btn-header-fullscreen'),
      document.getElementById('btn-arena-fullscreen')
    ];
    fsBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.toggleFullscreen();
          window.soundEngine.playSfx('select');
        });
      }
    });

    const modalIds = [
      'match-setup-modal',
      'victory-modal',
      'settings-modal',
      'moves-modal',
      'changelog-modal',
      'online-modal',
      'item-draft-modal',
      'abandoned-room-modal',
      'start-screen',
      'ssbu-fighter-drawer',
      'ssbu-drawer-backdrop'
    ];

    window.ensureFullscreenModal = (modal) => {
      this.ensureFullscreenModal(modal);
    };

    const updateFsState = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      const container = document.getElementById('canvas-container');
      if (container) container.classList.toggle('is-fullscreen', isFs);
      fsBtns.forEach(b => {
        if (b) {
          b.innerText = isFs ? '🗗 Salir Pantalla Completa' : '⛶ Pantalla Completa';
        }
      });

      // Mover modales y pantallas overlays dentro de canvas-container en fullscreen para que sean visibles
      modalIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (isFs && container) {
          if (!container.contains(el)) {
            container.appendChild(el);
          }
        } else {
          if (el.parentElement === container) {
            document.body.appendChild(el);
          }
        }
      });
    };

    document.addEventListener('fullscreenchange', updateFsState);
    document.addEventListener('webkitfullscreenchange', updateFsState);

    // Observer para capturar cualquier apertura de modal mientras la pantalla completa esté activa
    try {
      const modalObserver = new MutationObserver((mutations) => {
        const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        const container = document.getElementById('canvas-container');
        if (!isFs || !container) return;
        mutations.forEach(m => {
          const target = m.target;
          if (target && target.nodeType === 1) {
            const isOpen = target.classList.contains('open') || (!target.classList.contains('hidden') && target.classList.contains('start-screen-overlay'));
            if (isOpen && !container.contains(target)) {
              container.appendChild(target);
            }
          }
        });
      });

      modalIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          modalObserver.observe(el, { attributes: true, attributeFilter: ['class'] });
        }
      });
    } catch (e) {}

    // Llamada inicial para sincronizar estado si ya cargó en fullscreen
    updateFsState();
  }

  _bindKeybindRemapper() {
    let listeningAction = null;
    const keyRows = document.querySelectorAll('[data-rebind-action]');

    const getKeyName = (code) => {
      const names = {
        ArrowLeft: '← Flecha Izq',
        ArrowRight: '→ Flecha Der',
        ArrowUp: '↑ Flecha Arriba',
        ArrowDown: '↓ Flecha Abajo',
        Space: 'Espacio',
        KeyZ: 'Z',
        KeyX: 'X',
        KeyC: 'C',
        KeyA: 'A',
        KeyD: 'D',
        KeyW: 'W',
        KeyS: 'S',
        KeyJ: 'J',
        KeyK: 'K',
        KeyL: 'L',
        ControlLeft: 'Ctrl Izq',
        ControlRight: 'Ctrl Der',
        ShiftLeft: 'Shift Izq',
        ShiftRight: 'Shift Der',
        AltLeft: 'Alt Izq',
        AltRight: 'Alt Der',
        Digit1: '1',
        Digit2: '2',
        Digit3: '3',
        Digit4: '4',
        Digit5: '5',
        Numpad1: 'Num 1'
      };
      if (names[code]) return names[code];
      if (code && code.startsWith('Key')) return code.replace('Key', '');
      if (code && code.startsWith('Digit')) return code.replace('Digit', '');
      return code || 'No asignada';
    };

    const updateTable = () => {
      keyRows.forEach(row => {
        const action = row.getAttribute('data-rebind-action');
        const btn = row.querySelector('.keybind-code-btn');
        if (btn) {
          if (listeningAction === action) {
            btn.innerText = '⚡ Pulsa tecla...';
            btn.classList.add('listening');
          } else {
            btn.innerText = getKeyName(this.keybinds[action]);
            btn.classList.remove('listening');
          }
        }
      });
    };

    keyRows.forEach(row => {
      const action = row.getAttribute('data-rebind-action');
      const btn = row.querySelector('.keybind-code-btn');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          listeningAction = action;
          updateTable();
          window.soundEngine.playSfx('select');
        });
      }
    });

    window.addEventListener('keydown', (e) => {
      if (!listeningAction) return;
      e.preventDefault();
      e.stopPropagation();

      if (e.code === 'Escape') {
        listeningAction = null;
        updateTable();
        return;
      }

      this.keybinds[listeningAction] = e.code;
      try {
        localStorage.setItem('pokefighters_keybinds', JSON.stringify(this.keybinds));
      } catch (err) {}

      window.soundEngine.playSfx('select');
      listeningAction = null;
      updateTable();
    }, true);

    const resetKeysBtn = document.getElementById('btn-reset-keybinds');
    if (resetKeysBtn) {
      resetKeysBtn.addEventListener('click', () => {
        this.keybinds = Object.assign({}, this.defaultKeybinds);
        try {
          localStorage.removeItem('pokefighters_keybinds');
        } catch (err) {}
        listeningAction = null;
        updateTable();
        window.soundEngine.playSfx('select');
      });
    }

    updateTable();
  }

  _getGamepadButtonName(idx) {
    const names = {
      0: 'A / ✕ (Cruz)',
      1: 'B / ○ (Círculo)',
      2: 'X / □ (Cuadrado)',
      3: 'Y / △ (Triángulo)',
      4: 'LB / L1 (Hombro Izq)',
      5: 'RB / R1 (Hombro Der)',
      6: 'LT / L2 (Gatillo Izq)',
      7: 'RT / R2 (Gatillo Der)',
      8: 'Select / Share / Back',
      9: 'Start / Options',
      10: 'L3 (Click Stick Izq)',
      11: 'R3 (Click Stick Der)',
      12: 'D-Pad Arriba',
      13: 'D-Pad Abajo',
      14: 'D-Pad Izquierda',
      15: 'D-Pad Derecha',
      16: 'Guía / Home'
    };
    return names[idx] || `Botón ${idx}`;
  }

  _bindGamepadRemapper() {
    const gpRows = document.querySelectorAll('[data-rebind-gp-action]');
    if (!gpRows.length) return;

    const updateGpTable = () => {
      gpRows.forEach(row => {
        const action = row.getAttribute('data-rebind-gp-action');
        const btn = row.querySelector('.gp-bind-code-btn');
        if (btn) {
          if (this.listeningGpAction === action) {
            btn.innerText = '🎮 Pulsa botón en mando...';
            btn.classList.add('listening');
          } else {
            const btns = (this.gamepadBinds && this.gamepadBinds[action]) || this.defaultGamepadBinds[action] || [];
            btn.innerText = btns.map(b => this._getGamepadButtonName(b)).join(' o ') || 'No asignado';
            btn.classList.remove('listening');
          }
        }
      });
    };

    gpRows.forEach(row => {
      const action = row.getAttribute('data-rebind-gp-action');
      const btn = row.querySelector('.gp-bind-code-btn');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.listeningGpAction = action;
          updateGpTable();
          if (window.soundEngine) window.soundEngine.playSfx('select');
        });
      }
    });

    const resetGpBtn = document.getElementById('btn-reset-gamepad-binds');
    if (resetGpBtn) {
      resetGpBtn.addEventListener('click', () => {
        this.gamepadBinds = Object.assign({}, this.defaultGamepadBinds);
        try {
          localStorage.removeItem('pokefighters_gamepad_binds');
        } catch (e) {}
        this.listeningGpAction = null;
        updateGpTable();
        if (window.soundEngine) window.soundEngine.playSfx('select');
      });
    }

    window.addEventListener('keydown', (e) => {
      if (this.listeningGpAction && e.code === 'Escape') {
        this.listeningGpAction = null;
        updateGpTable();
      }
    });

    this._updateGpTable = updateGpTable;
    updateGpTable();
  }

  _updateSettingsUI() {
    const s = window.soundEngine;
    const masterSlider = document.getElementById('setting-master-vol');
    const musicSlider = document.getElementById('setting-music-vol');
    const sfxSlider = document.getElementById('setting-sfx-vol');
    const muteToggle = document.getElementById('setting-mute-toggle');

    if (masterSlider) {
      masterSlider.value = s.masterVolume;
      const l = document.getElementById('val-master-vol');
      if (l) l.innerText = `${Math.round(s.masterVolume * 100)}%`;
    }
    if (musicSlider) {
      musicSlider.value = s.musicVolume;
      const l = document.getElementById('val-music-vol');
      if (l) l.innerText = `${Math.round(s.musicVolume * 100)}%`;
    }
    if (sfxSlider) {
      sfxSlider.value = s.sfxVolume;
      const l = document.getElementById('val-sfx-vol');
      if (l) l.innerText = `${Math.round(s.sfxVolume * 100)}%`;
    }
    if (muteToggle) {
      muteToggle.checked = s.isMuted;
    }

    document.querySelectorAll('[data-graphics-preset]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-graphics-preset') === this.graphicsQuality);
    });

    document.querySelectorAll('[data-fps-preset]').forEach(b => {
      b.classList.toggle('active', parseInt(b.getAttribute('data-fps-preset'), 10) === this.targetFPS);
    });

    const fpsToggle = document.getElementById('setting-fps-counter-toggle');
    if (fpsToggle) fpsToggle.checked = this.showFpsCounter;
  }

  setGraphicsQuality(preset) {
    const valid = ['ultra', 'high', 'medium', 'low'];
    this.graphicsQuality = valid.includes(preset) ? preset : 'ultra';
    try { localStorage.setItem('pokefighters_graphics', this.graphicsQuality); } catch(e) {}
    this.stage.setGraphicsQuality(this.graphicsQuality);
    document.querySelectorAll('[data-graphics-preset]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-graphics-preset') === this.graphicsQuality);
    });
  }

  setTargetFPS(fps) {
    this.targetFPS = parseInt(fps, 10);
    try { localStorage.setItem('pokefighters_fps', this.targetFPS); } catch(e) {}
    document.querySelectorAll('[data-fps-preset]').forEach(b => {
      b.classList.toggle('active', parseInt(b.getAttribute('data-fps-preset'), 10) === this.targetFPS);
    });
    if (this.hud && this.hud.updateFPS) {
      this.hud.updateFPS(this.currentFps, this.targetFPS, this.showFpsCounter);
    }
  }

  setShowFpsCounter(show) {
    this.showFpsCounter = !!show;
    try { localStorage.setItem('pokefighters_show_fps', this.showFpsCounter); } catch(e) {}
    if (this.hud && this.hud.updateFPS) {
      this.hud.updateFPS(this.currentFps, this.targetFPS, this.showFpsCounter);
    }
  }

  toggleFullscreen() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  ensureFullscreenModal(modal) {
    if (typeof modal === 'string') modal = document.getElementById(modal);
    if (!modal) return;
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    const container = document.getElementById('canvas-container');
    if (isFs && container) {
      if (!container.contains(modal)) {
        container.appendChild(modal);
      }
    } else {
      if (modal.parentElement === container) {
        document.body.appendChild(modal);
      }
    }
  }

  resetDummy() {
    this.dummyController.resetDummy(true);
    if (this.p1Controller) {
      this.p1Controller.resetDummy(true);
      this.player.x = 360;
      this.player.y = 430;
      this.player.facing = 1;
      this.player.isGrounded = true;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.hitstun = 0;
      this.player.hitstop = 0;
      if (this.player.clearStatuses) {
        this.player.clearStatuses();
      } else if (this.player.statuses && this.player.statuses.poison) {
        this.player.statuses.poison.active = false;
      }
    }
    if (window.particleManager) {
      window.particleManager.spawnHitSparks(this.dummy.x, this.dummy.y - 20, 4, 'normal');
      window.particleManager.spawnFloatingText(this.dummy.x, this.dummy.y - 45, '¡RESET!', '#60a5fa', 18);
    }
  }

  registerHit(attacker, victim, damage) {
    if (victim === this.dummy) {
      this.dummyController.registerHit(damage);
    }
    if (attacker === this.player && attacker.currentAttack) {
      this.hud.showMoveBanner(attacker.currentAttack.name, attacker.currentAttack.type);
    }
  }

  onFighterKO(fighter) {
    if (window.particleManager) {
      window.particleManager.spawnFloatingText(this.stage.respawnX, this.stage.respawnY - 40, '¡KO!', '#ff4444', 32);
    }

    // Elimination triggers (e.g. Baya Aranja heals 20% on KO)
    const killer = (fighter === this.player) ? this.dummy : this.player;
    if (killer && typeof killer.onElimination === 'function') {
      killer.onElimination();
    }

    // In Battle Mode & Online Mode (3 Stocks), check if anyone reached 0 stocks
    if (this.gameMode === 'BATTLE' || this.gameMode === 'ONLINE') {
      if (this.dummy && this.dummy.stocks <= 0) {
        this.triggerDecisiveFinish('PLAYER_WIN');
        return;
      } else if (this.player && this.player.stocks <= 0) {
        const result = (this.gameMode === 'ONLINE') ? 'RIVAL_WIN' : 'CPU_WIN';
        this.triggerDecisiveFinish(result);
        return;
      }
    }
  }

  triggerDecisiveFinish(result) {
    if (this.isDecisiveFinish || this.isMatchOver) return;
    this.isDecisiveFinish = true;
    this.pendingMatchResult = result;
    this.slomoTimer = 1.35;
    this.slomoFactor = 0.18;
    this.fatalImpactFlash = 1.0;
    this.triggerScreenShake(14, 0.4);
    if (window.soundEngine) {
      window.soundEngine.playSfx('heavy_hit');
    }
  }

  endMatch(result) {
    if (this.isMatchOver) return;
    this.isMatchOver = true;

    // Reset screen shake completely to fix persistent screenshake bug
    this.screenShakeIntensity = 0;
    this.screenShakeDuration = 0;
    this.screenShakeTimer = 0;

    const isPlayerWin = result === 'PLAYER_WIN';
    if (isPlayerWin) {
      window.soundEngine.playSfx('victory');
      if (window.particleManager) {
        window.particleManager.spawnRadialBurst(512, 280, '#facc15', 'electric', 48);
        window.particleManager.spawnRadialBurst(512, 280, '#38bdf8', 'electric', 36);
      }
    } else {
      window.soundEngine.playSfx('defeat');
    }

    // Save record to database / api
    if (isPlayerWin) {
      fetch('api/stats.php?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kos: 1,
          totalDamage: Math.round(this.dummy.percent),
          maxCombo: this.dummyController.maxCombo
        })
      }).catch(() => {});
    }

    // Launch Smash Ultimate "¡FIN!" cutscene
    this.endCutsceneActive = true;
    this.endCutsceneTimer = 0;
    this.endCutsceneDuration = 2.4;
    this.endCutsceneResult = result;
    this.cutsceneSlamConnected = false;
  }

  showFinalVictoryModal() {
    this.screenShakeIntensity = 0;
    this.screenShakeDuration = 0;
    this.screenShakeTimer = 0;

    const isPlayerWin = this.endCutsceneResult === 'PLAYER_WIN';
    this.hud.showVictoryModal({
      isPlayerWin,
      isOnline: this.gameMode === 'ONLINE',
      isCpuVsCpu: this.p1Type === 'CPU',
      winnerFighter: isPlayerWin ? this.player : this.dummy,
      playerStocks: this.player ? this.player.stocks : 0,
      dummyStocks: this.dummy ? this.dummy.stocks : 0,
      maxCombo: this.dummyController.maxCombo,
      totalDamage: Math.round(this.dummyController.totalDamageDealt),
      cpuLevel: this.cpuLevel
    });
  }

  loop(currentTime) {
    // 140 FPS frame throttling if targetFPS > 0
    if (this.targetFPS > 0) {
      const minInterval = 1000 / this.targetFPS;
      const elapsed = currentTime - this.lastRenderTime;
      // Allow ~0.75ms leeway for browser vsync jitter
      if (elapsed < minInterval - 0.75) {
        requestAnimationFrame((t) => this.loop(t));
        return;
      }
      this.lastRenderTime = currentTime - (elapsed % minInterval);
    } else {
      this.lastRenderTime = currentTime;
    }

    let frameTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Slow-motion effect before decisive cutscene
    if (this.slomoTimer > 0) {
      this.slomoTimer -= frameTime;
      frameTime *= this.slomoFactor;
      if (this.slomoTimer <= 0) {
        this.slomoTimer = 0;
        this.slomoFactor = 1.0;
        if (this.pendingMatchResult) {
          const res = this.pendingMatchResult;
          this.pendingMatchResult = null;
          this.endMatch(res);
        }
      }
    }

    // Cap frame time to prevent giant leaps if tab loses focus
    this.accumulator += Math.min(frameTime, 0.1);

    // Fixed 60Hz physics and logic ticks
    while (this.accumulator >= this.fixedStep) {
      this.fixedUpdate(this.fixedStep);
      this.accumulator -= this.fixedStep;
    }

    // Live FPS computation over 400ms window
    this.frameCount++;
    if (currentTime - this.lastFpsUpdateTime >= 400) {
      this.currentFps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdateTime));
      this.frameCount = 0;
      this.lastFpsUpdateTime = currentTime;
      if (this.hud && this.hud.updateFPS) {
        this.hud.updateFPS(this.currentFps, this.targetFPS, this.showFpsCounter);
      }
    }

    // UI and canvas rendering run smoothly at monitor refresh rate (140 FPS)
    this.hud.update(this.player, this.dummy, this.dummyController);
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }

  fixedUpdate(dt) {
    // 1. Decrement screen shake at the very top so it ALWAYS expires cleanly
    if (this.screenShakeTimer > 0) {
      this.screenShakeTimer -= dt;
      if (this.screenShakeTimer <= 0) {
        this.screenShakeIntensity = 0;
        this.screenShakeDuration = 0;
        this.screenShakeTimer = 0;
      }
    }

    // 2. Fatal impact flash decay
    if (this.fatalImpactFlash > 0) {
      this.fatalImpactFlash = Math.max(0, this.fatalImpactFlash - dt * 1.5);
    }

    // 3. End Match Cutscene Progression
    if (this.endCutsceneActive) {
      this.endCutsceneTimer += dt;
      if (this.endCutsceneTimer >= this.endCutsceneDuration) {
        this.endCutsceneActive = false;
        this.showFinalVictoryModal();
      }
      window.particleManager.update(dt);
      return;
    }

    if (!this.matchStarted) {
      window.particleManager.update(dt);
      return;
    }

    if (this.isMatchOver) {
      window.particleManager.update(dt);
      return;
    }

    // Countdown handling: locks fighter inputs until ¡YA! finishes
    if (this.isCountingDown) {
      this.countdownTimer -= dt;
      const currentStep = Math.ceil(this.countdownTimer / 0.9);
      if (currentStep < this.lastCountdownStep) {
        this.lastCountdownStep = currentStep;
        if (currentStep >= 1) {
          window.soundEngine.playSfx('countdown_beep');
        } else if (currentStep === 0) {
          window.soundEngine.playSfx('countdown_go');
        }
      }

      if (this.countdownTimer <= 0) {
        this.isCountingDown = false;
        this.countdownTimer = 0;
      }

      this.stage.update(dt);
      window.particleManager.update(dt);
      return;
    }

    // Match Time Limit Countdown & Timeout Winner Determination
    if (this.matchTimeLimit > 0 && !this.isCountingDown && !this.isMatchOver) {
      this.matchTimeRemaining = Math.max(0, this.matchTimeRemaining - dt);
      if (this.matchTimeRemaining <= 0) {
        this.matchTimeRemaining = 0;
        // Winner determination: Stocks first, then lowest damage %
        let winner = 'PLAYER_WIN';
        if (this.player.stocks > this.dummy.stocks) {
          winner = 'PLAYER_WIN';
        } else if (this.dummy.stocks > this.player.stocks) {
          winner = 'CPU_WIN';
        } else {
          // Stocks tied, check lowest damage %
          if (this.player.percent < this.dummy.percent) {
            winner = 'PLAYER_WIN';
          } else {
            winner = 'CPU_WIN';
          }
        }
        if (window.particleManager) {
          window.particleManager.spawnFloatingText(512, 240, '¡TIEMPO!', '#facc15', 48);
        }
        this.triggerDecisiveFinish(winner);
        return;
      }
    }

    // Verificación continua de fin de combate por vidas (3 Vidas oficiales)
    if ((this.gameMode === 'BATTLE' || this.gameMode === 'ONLINE') && !this.isMatchOver && !this.isDecisiveFinish) {
      if (this.dummy && this.dummy.stocks <= 0) {
        this.triggerDecisiveFinish('PLAYER_WIN');
        return;
      } else if (this.player && this.player.stocks <= 0) {
        const result = (this.gameMode === 'ONLINE') ? 'RIVAL_WIN' : 'CPU_WIN';
        this.triggerDecisiveFinish(result);
        return;
      }
    }

    // 1. Inputs & AI
    this.pollGamepads();

    if (this.p1Type === 'CPU' && this.p1Controller) {
      this.p1Controller.update(dt, this.dummy, this.stage);
    } else {
      this.player.handleInputs(this.stage, dt);
    }

    if (this.p2Type === 'HUMAN') {
      this.dummy.handleInputs(this.stage, dt);
    } else if (this.p2Type === 'ONLINE_RIVAL') {
      // ONLINE_RIVAL is driven entirely by OnlineManager network packets.
      // Suavizado e interpolación física continua a 60 FPS
      if (this.onlineManager && typeof this.onlineManager.updateRivalPhysics === 'function') {
        this.onlineManager.updateRivalPhysics(dt);
      }
    } else {
      this.dummyController.update(dt, this.player, this.stage);
    }

    // 2. Physics & Entities update

    this.stage.update(dt);
    this.stage.updateHazards([this.player, this.dummy]);
    this.player.update(dt, this.dummy, this.stage);
    this.dummy.update(dt, this.player, this.stage);
    window.particleManager.update(dt);
  }

  drawCountdown(ctx) {
    if (!this.isCountingDown) return;

    let text = '3';
    let color = '#ef4444';
    let stepTime = 0;

    if (this.countdownTimer > 2.7) {
      text = '3';
      color = '#f87171';
      stepTime = 3.6 - this.countdownTimer;
    } else if (this.countdownTimer > 1.8) {
      text = '2';
      color = '#fbbf24';
      stepTime = 2.7 - this.countdownTimer;
    } else if (this.countdownTimer > 0.9) {
      text = '1';
      color = '#38bdf8';
      stepTime = 1.8 - this.countdownTimer;
    } else {
      text = '¡YA!';
      color = '#facc15';
      stepTime = 0.9 - this.countdownTimer;
    }

    const progress = Math.min(1.0, Math.max(0, stepTime / 0.9));
    const scale = Math.max(1.0, 1.8 - progress * 0.8);
    const alpha = Math.min(1.0, 1.2 - progress * 0.3);

    ctx.save();
    ctx.translate(this.width / 2, this.height * 0.40);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    ctx.font = '900 64px "Press Start 2P", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Black outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.lineJoin = 'miter';
    ctx.strokeText(text, 0, 0);

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);

    // Inner bright text
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 54px "Press Start 2P", monospace, sans-serif';
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }

  drawMatchTimer(ctx) {
    if (this.matchTimeLimit <= 0 || this.isCountingDown) return;

    const totalSeconds = Math.max(0, Math.ceil(this.matchTimeRemaining));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    const isUrgent = totalSeconds <= 15;
    const pulse = isUrgent ? Math.sin(performance.now() * 0.015) * 2 : 0;

    ctx.save();
    ctx.translate(this.width / 2, 42);

    // Pill background
    ctx.fillStyle = isUrgent ? 'rgba(239, 68, 68, 0.45)' : 'rgba(15, 23, 42, 0.70)';
    ctx.strokeStyle = isUrgent ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 2;
    ctx.shadowColor = isUrgent ? '#ef4444' : '#38bdf8';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.roundRect(-65 - pulse, -18, 130 + pulse * 2, 34, 17);
    ctx.fill();
    ctx.stroke();

    // Timer text
    ctx.shadowBlur = 0;
    ctx.font = '700 15px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isUrgent ? '#fecaca' : '#ffffff';
    ctx.fillText(timeStr, 0, 0);

    ctx.restore();
  }

  drawEndMatchCutscene(ctx) {
    if (!this.endCutsceneActive) return;

    const t = this.endCutsceneTimer;
    const w = this.width;
    const h = this.height;

    // Trigger punchy slam impact at t = 0.32s
    if (!this.cutsceneSlamConnected && t >= 0.32) {
      this.cutsceneSlamConnected = true;
      this.triggerScreenShake(12, 0.2);
      if (window.soundEngine) window.soundEngine.playSfx('heavy_hit');
      if (window.particleManager) {
        window.particleManager.spawnRadialBurst(w / 2, h * 0.44, '#facc15', 'electric', 40);
        window.particleManager.spawnSlash(w / 2, h * 0.44, 0, '#ffffff', 2.2);
      }
    }

    ctx.save();

    // 1. Cinematic letterbox bars top & bottom
    const barProgress = Math.min(1.0, t / 0.3);
    const barH = 58 * barProgress;

    ctx.fillStyle = '#06080e';
    ctx.fillRect(0, 0, w, barH);
    ctx.fillRect(0, h - barH, w, barH);

    // Gold accent divider lines
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, barH);
    ctx.lineTo(w, barH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, h - barH);
    ctx.lineTo(w, h - barH);
    ctx.stroke();

    // 2. Smash Ultimate Diagonal Slash Streaks during entrance
    if (t < 0.6) {
      const slashAlpha = Math.max(0, 1.0 - t / 0.6);
      ctx.save();
      ctx.globalAlpha = slashAlpha * 0.6;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-100, 0);
      ctx.lineTo(w * 0.4, 0);
      ctx.lineTo(w * 0.2, h);
      ctx.lineTo(-300, h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(w * 0.6, 0);
      ctx.lineTo(w * 1.1, 0);
      ctx.lineTo(w * 0.9, h);
      ctx.lineTo(w * 0.4, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 3. Giant Stylized "¡FIN!" Text (Smash Ultimate Slam)
    let textScale = 1.0;
    let textAlpha = 1.0;

    if (t < 0.32) {
      // Zoom in from 3.2 down to 1.0
      const p = t / 0.32;
      textScale = 3.2 - (2.2 * Math.sin(p * Math.PI * 0.5));
      textAlpha = Math.min(1.0, p * 2.5);
    } else {
      // Subtle rhythmic breathing
      const breath = Math.sin((t - 0.32) * 5) * 0.02;
      textScale = 1.0 + breath;
      textAlpha = 1.0;
    }

    const centerX = w / 2;
    const centerY = h * 0.42;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(textScale, textScale);
    ctx.transform(1, 0, -0.15, 1, 0, 0); // Dynamic comic italic skew
    ctx.globalAlpha = textAlpha;

    ctx.font = '900 115px "Impact", "Arial Black", "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const finText = '¡FIN!';

    // Chromatic Aberration Shadows (Cyan & Magenta offset)
    ctx.save();
    ctx.globalAlpha = textAlpha * 0.45;
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(finText, -5, -3);
    ctx.fillStyle = '#ec4899';
    ctx.fillText(finText, 5, 3);
    ctx.restore();

    // Deep black 3D dropshadow
    ctx.fillStyle = '#05070d';
    for (let offset = 14; offset > 0; offset -= 2) {
      ctx.fillText(finText, offset, offset);
    }

    // Thick black outer outline
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 22;
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 4;
    ctx.strokeText(finText, 0, 0);

    // Inner bright gold contour
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 8;
    ctx.strokeText(finText, 0, 0);

    // Smash Ultimate fiery gradient fill
    const textGrad = ctx.createLinearGradient(0, -60, 0, 50);
    textGrad.addColorStop(0.0, '#ffffff');
    textGrad.addColorStop(0.2, '#fef08a');
    textGrad.addColorStop(0.5, '#ef4444');
    textGrad.addColorStop(0.85, '#dc2626');
    textGrad.addColorStop(1.0, '#7f1d1d');
    ctx.fillStyle = textGrad;
    ctx.fillText(finText, 0, 0);

    // Center horizontal light gleam across the text
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    const gleamGrad = ctx.createLinearGradient(0, -10, 0, 10);
    gleamGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gleamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)');
    gleamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gleamGrad;
    ctx.fillRect(-250, -12, 500, 24);
    ctx.restore();

    ctx.restore(); // restore transform

    // 4. Winner Banner Ribbon underneath ¡FIN!
    if (t >= 0.38) {
      const bannerProgress = Math.min(1.0, (t - 0.38) / 0.25);
      const isPlayerWin = this.endCutsceneResult === 'PLAYER_WIN';
      const winnerName = isPlayerWin
        ? (this.p1Type === 'CPU' ? this.player.name : 'JUGADOR 1')
        : (this.p2Type === 'HUMAN' ? 'JUGADOR 2' : this.dummy.name);
      const bannerText = `¡VICTORIA DE ${winnerName.toUpperCase()}!`;

      ctx.save();
      ctx.translate(centerX, h * 0.65);
      ctx.scale(bannerProgress, bannerProgress);
      ctx.globalAlpha = bannerProgress;

      // Angled parallelogram ribbon
      const bW = 540;
      const bH = 46;
      const skew = 22;

      ctx.beginPath();
      ctx.moveTo(-bW / 2 + skew, -bH / 2);
      ctx.lineTo(bW / 2 + skew, -bH / 2);
      ctx.lineTo(bW / 2 - skew, bH / 2);
      ctx.lineTo(-bW / 2 - skew, bH / 2);
      ctx.closePath();

      ctx.fillStyle = 'rgba(7, 10, 19, 0.92)';
      ctx.fill();

      ctx.strokeStyle = isPlayerWin ? '#eab308' : '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '800 21px "Outfit", "Press Start 2P", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isPlayerWin ? '#fef08a' : '#fecaca';
      ctx.fillText(bannerText, 0, 1);

      ctx.restore();
    }

    ctx.restore();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShakeTimer > 0 && this.screenShakeDuration > 0) {
      const decay = this.screenShakeTimer / this.screenShakeDuration;
      const currentIntensity = this.screenShakeIntensity * decay;
      shakeX = (Math.random() - 0.5) * 2 * currentIntensity;
      shakeY = (Math.random() - 0.5) * 2 * currentIntensity;
    }

    this.ctx.save();
    if (shakeX !== 0 || shakeY !== 0) {
      this.ctx.translate(shakeX, shakeY);
    }

    // 1. Stage Background (Rifts, Stadium crowd, celestial sky)
    this.stage.drawBackground(this.ctx);

    // 2. Stage Geometry, Turfs & Platform Foliage
    this.stage.drawPlatforms(this.ctx);

    // 3. Dynamic Stage Shadows (Floating platforms drop shadows onto main ground)
    this.stage.drawStageShadows(this.ctx);

    // 4. Dynamic Character Shadows (Real-time drop shadows for fighters, Plusle & heavy projectiles)
    this.stage.drawFighterShadows(this.ctx, [this.player, this.dummy]);

    // 5. Blast Zone Guide
    this.stage.drawBlastZoneGuide(this.ctx);

    // 6. Fighters (Sprites, Projectiles, Shields, Smash Auras, Ditto outline, Hitboxes & Stage lighting)
    const isDittoMatch = (this.playerDex === this.dummyDex);
    this.player.draw(this.ctx, { stage: this.stage, isDittoMatch: isDittoMatch, showHitboxes: this.showHitboxes });
    this.dummy.draw(this.ctx, { stage: this.stage, isDittoMatch: false, showHitboxes: this.showHitboxes });

    // 7. Stage Foreground Effects (Volumetric God Rays & Ambient Spores/Petals)
    this.stage.drawForegroundEffects(this.ctx);

    // 8. Particle FX (Sparks, lightning, damage text, impacts)
    window.particleManager.draw(this.ctx);

    // 9. Match Start 3.. 2.. 1.. ¡YA! Countdown Banner
    if (this.isCountingDown) {
      this.drawCountdown(this.ctx);
    }

    // 9.5 Match Time Limit HUD Timer
    if (this.matchTimeLimit > 0) {
      this.drawMatchTimer(this.ctx);
    }

    // 10. Post-Processing Ambient Pass (Ultra cinematic vignette)
    this.stage.drawPostProcessing(this.ctx);

    // 11. Fatal blow slow-motion vignette
    if (this.fatalImpactFlash > 0) {
      const grad = this.ctx.createRadialGradient(this.width / 2, this.height / 2, 180, this.width / 2, this.height / 2, 540);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      grad.addColorStop(0.65, `rgba(220, 38, 38, ${this.fatalImpactFlash * 0.35})`);
      grad.addColorStop(1.0, `rgba(15, 23, 42, ${this.fatalImpactFlash * 0.75})`);
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // 12. Super Smash Bros Ultimate End Match Cutscene ("¡FIN!")
    if (this.endCutsceneActive) {
      this.drawEndMatchCutscene(this.ctx);
    }

    this.ctx.restore();
  }

  // 🎮 GAMEPAD API SUPPORT (Xbox, PlayStation, Switch Pro, Generic USB)
  _initGamepadListeners() {
    window.addEventListener('gamepadconnected', (e) => {
      console.log('🎮 Mando detectado:', e.gamepad.id);
      this._updateGamepadIndicator(e.gamepad);
      if (window.particleManager) {
        window.particleManager.spawnFloatingText(512, 100, `🎮 ${e.gamepad.id.slice(0, 18)} CONECTADO`, '#38bdf8', 16);
      }
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      console.log('🎮 Mando desconectado:', e.gamepad.id);
      this._updateGamepadIndicator(null);
      if (window.particleManager) {
        window.particleManager.spawnFloatingText(512, 100, '🎮 MANDO DESCONECTADO', '#ef4444', 16);
      }
    });
  }

  _updateGamepadIndicator(gamepad) {
    const badge = document.getElementById('gamepad-indicator-badge');
    if (!badge) return;
    if (gamepad) {
      badge.classList.remove('hidden');
      badge.classList.add('connected');
      const name = gamepad.id.toLowerCase().includes('xbox') ? 'Xbox' :
                   (gamepad.id.toLowerCase().includes('playstation') || gamepad.id.toLowerCase().includes('dualshock') || gamepad.id.toLowerCase().includes('dualsense') || gamepad.id.toLowerCase().includes('sony')) ? 'PlayStation' :
                   gamepad.id.toLowerCase().includes('pro controller') ? 'Switch Pro' : 'Mando';
      badge.innerHTML = `<span class="gp-dot active"></span> 🎮 ${name} Listo`;
      badge.title = gamepad.id;
    } else {
      badge.classList.remove('connected');
      badge.innerHTML = `<span class="gp-dot"></span> 🎮 Mando: Desconectado`;
      badge.title = 'Conecta un mando USB o Bluetooth para jugar con mando';
    }
  }

  pollGamepads() {
    if (!navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    // Gamepad Remap Button Capture
    if (this.listeningGpAction) {
      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (!gp || !gp.connected) continue;
        for (let b = 0; b < gp.buttons.length; b++) {
          const btn = gp.buttons[b];
          const pressed = btn ? (typeof btn === 'object' ? btn.pressed || btn.value > 0.5 : btn > 0.5) : false;
          if (pressed) {
            this.gamepadBinds[this.listeningGpAction] = [b];
            try {
              localStorage.setItem('pokefighters_gamepad_binds', JSON.stringify(this.gamepadBinds));
            } catch (err) {}
            if (window.soundEngine) window.soundEngine.playSfx('select');
            this.listeningGpAction = null;
            if (typeof this._updateGpTable === 'function') {
              this._updateGpTable();
            }
            break;
          }
        }
        if (!this.listeningGpAction) break;
      }
    }

    let gp1 = null;
    let gp2 = null;

    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && gamepads[i].connected) {
        if (!gp1) {
          gp1 = gamepads[i];
        } else if (!gp2) {
          gp2 = gamepads[i];
          break;
        }
      }
    }

    if (gp1 && this.p1Type !== 'CPU') {
      this._applyGamepadInput(gp1, this.player, 'p1');
    }

    if (gp2 && this.p2Type === 'HUMAN') {
      this._applyGamepadInput(gp2, this.dummy, 'p2');
    }

    const hasAnyGamepad = !!(gp1 || gp2);
    if (this.gamepadConnected !== hasAnyGamepad) {
      this.gamepadConnected = hasAnyGamepad;
      this._updateGamepadIndicator(gp1 || gp2);
    }
  }

  _applyGamepadInput(gamepad, fighter, playerKey) {
    if (!gamepad || !fighter || !fighter.input) return;

    if (!this.gamepadPrevButtons) {
      this.gamepadPrevButtons = { p1: {}, p2: {} };
    }
    const prev = this.gamepadPrevButtons[playerKey] || {};

    const axes = gamepad.axes || [];
    const buttons = gamepad.buttons || [];

    const isBtn = (idx) => {
      const b = buttons[idx];
      return b ? (typeof b === 'object' ? b.pressed || b.value > 0.4 : b > 0.4) : false;
    };

    // Analog Stick & D-Pad directions
    const stickX = axes[0] !== undefined ? axes[0] : 0;
    const stickY = axes[1] !== undefined ? axes[1] : 0;
    const dpadUp = isBtn(12);
    const dpadDown = isBtn(13);
    const dpadLeft = isBtn(14);
    const dpadRight = isBtn(15);

    const gpLeft = (stickX < -0.32) || dpadLeft;
    const gpRight = (stickX > 0.32) || dpadRight;
    const gpUp = (stickY < -0.45) || dpadUp;
    const gpDown = (stickY > 0.45) || dpadDown;

    // Movement axes update
    if (gpLeft) {
      if (!prev.left) fighter.input.leftPressed = true;
      fighter.input.left = true;
    }
    if (gpRight) {
      if (!prev.right) fighter.input.rightPressed = true;
      fighter.input.right = true;
    }
    if (gpUp) {
      if (!prev.up) fighter.input.upPressed = true;
      fighter.input.up = true;
    }
    if (gpDown) {
      if (!prev.down) fighter.input.downPressed = true;
      fighter.input.down = true;
    }

    // Action buttons using mapped binds
    const isAction = (action) => {
      const binds = (this.gamepadBinds && this.gamepadBinds[action]) || (this.defaultGamepadBinds && this.defaultGamepadBinds[action]) || [];
      return binds.some(btnIdx => isBtn(btnIdx));
    };

    const gpJump = isAction('jump');
    const gpAttack = isAction('attack');
    const gpSpecial = isAction('special');
    const gpSmash = isAction('smash');
    const gpShield = isAction('shield');
    const gpGrab = isAction('grab');
    const gpItem = isAction('item');

    if (gpJump) {
      if (!prev.jump) fighter.input.jumpPressed = true;
      fighter.input.jump = true;
    }
    if (gpAttack) {
      if (!prev.attack) fighter.input.attackPressed = true;
      fighter.input.attack = true;
    }
    if (gpSpecial) {
      if (!prev.special) fighter.input.specialPressed = true;
      fighter.input.special = true;
    }
    if (gpSmash) {
      if (!prev.smash) fighter.input.smashPressed = true;
      fighter.input.smash = true;
    }
    if (gpShield) {
      if (!prev.shield) fighter.input.shieldPressed = true;
      fighter.input.shield = true;
    }
    if (gpGrab) {
      if (!prev.grab) fighter.input.grabPressed = true;
      fighter.input.grab = true;
    }
    if (gpItem) {
      if (!prev.item) fighter.input.itemPressed = true;
      fighter.input.item = true;
    }

    // Release handling (if released on gamepad and not held on keyboard)
    if (!gpLeft && prev.left && !this._isKeyHeld(playerKey, 'left')) fighter.input.left = false;
    if (!gpRight && prev.right && !this._isKeyHeld(playerKey, 'right')) fighter.input.right = false;
    if (!gpUp && prev.up && !this._isKeyHeld(playerKey, 'up')) fighter.input.up = false;
    if (!gpDown && prev.down && !this._isKeyHeld(playerKey, 'down')) fighter.input.down = false;
    if (!gpJump && prev.jump && !this._isKeyHeld(playerKey, 'jump')) fighter.input.jump = false;
    if (!gpAttack && prev.attack && !this._isKeyHeld(playerKey, 'attack')) fighter.input.attack = false;
    if (!gpSpecial && prev.special && !this._isKeyHeld(playerKey, 'special')) fighter.input.special = false;
    if (!gpSmash && prev.smash) fighter.input.smash = false;
    if (!gpShield && prev.shield && !this._isKeyHeld(playerKey, 'shield')) fighter.input.shield = false;
    if (!gpGrab && prev.grab && !this._isKeyHeld(playerKey, 'grab')) fighter.input.grab = false;
    if (!gpItem && prev.item && !this._isKeyHeld(playerKey, 'item')) fighter.input.item = false;

    // Save previous state for edge detection
    this.gamepadPrevButtons[playerKey] = {
      left: gpLeft,
      right: gpRight,
      up: gpUp,
      down: gpDown,
      jump: gpJump,
      attack: gpAttack,
      special: gpSpecial,
      smash: gpSmash,
      shield: gpShield,
      grab: gpGrab,
      item: gpItem
    };
  }

  _isKeyHeld(playerKey, action) {
    if (!this.keys) return false;
    if (playerKey === 'p1') {
      const code = this.keybinds ? this.keybinds[action] : null;
      return code ? !!this.keys[code] : false;
    } else {
      const p2Codes = (this.p2Keybinds && this.p2Keybinds[action]) || [];
      return p2Codes.some(c => !!this.keys[c]);
    }
  }

  // =========================================================================
  // 🌐 MULTIJUGADOR EN LÍNEA: SALAS 1v1, DRAFT Y ANTI-CHEAT
  // =========================================================================
  _bindOnlineMultiplayer() {
    const onlineModal = document.getElementById('online-modal');
    const charModal = document.getElementById('char-select-modal');
    const draftModal = document.getElementById('item-draft-modal');
    const startScreen = document.getElementById('start-screen');
    const btnOpenOnline = document.getElementById('btn-open-online');
    const btnStartOnline = document.getElementById('btn-start-online');
    const btnCloseOnline = document.getElementById('btn-close-online-modal');
    const btnBackOnline = document.getElementById('btn-online-back-menu');

    const openOnline = () => {
      if (startScreen) startScreen.classList.add('hidden');
      if (onlineModal) onlineModal.classList.add('open');
      if (window.soundEngine) window.soundEngine.playSfx('select');

      // Inicializar sala de anfitrión por defecto si la pestaña de crear está activa
      const btnTabCreate = document.getElementById('btn-tab-create-room');
      if (btnTabCreate && btnTabCreate.classList.contains('active')) {
        if (!this.onlineManager.roomCode || this.onlineManager.role !== 'host') {
          this._initHostRoom();
        }
      }
    };

    if (btnOpenOnline) btnOpenOnline.addEventListener('click', openOnline);
    if (btnStartOnline) btnStartOnline.addEventListener('click', openOnline);

    const closeOnline = () => {
      if (onlineModal) onlineModal.classList.remove('open');
      if (charModal) charModal.classList.remove('open');
      if (draftModal) draftModal.classList.remove('open');
      if (startScreen) startScreen.classList.remove('hidden');
      this.onlineManager.leaveRoom();
    };

    if (btnCloseOnline) btnCloseOnline.addEventListener('click', closeOnline);
    if (btnBackOnline) btnBackOnline.addEventListener('click', closeOnline);

    // 1. Modos de Sala: Crear Sala vs Unirse a Sala
    const btnTabCreate = document.getElementById('btn-tab-create-room');
    const btnTabJoin = document.getElementById('btn-tab-join-room');
    const viewCreate = document.getElementById('online-view-create');
    const viewJoin = document.getElementById('online-view-join');

    if (btnTabCreate && btnTabJoin) {
      btnTabCreate.addEventListener('click', () => {
        btnTabCreate.classList.add('active');
        btnTabJoin.classList.remove('active');
        if (viewCreate) viewCreate.style.display = 'block';
        if (viewJoin) viewJoin.style.display = 'none';
        if (window.soundEngine) window.soundEngine.playSfx('select');
        if (!this.onlineManager.roomCode || this.onlineManager.role !== 'host') {
          this._initHostRoom();
        }
      });

      btnTabJoin.addEventListener('click', () => {
        btnTabJoin.classList.add('active');
        btnTabCreate.classList.remove('active');
        if (viewCreate) viewCreate.style.display = 'none';
        if (viewJoin) viewJoin.style.display = 'block';
        if (window.soundEngine) window.soundEngine.playSfx('select');
      });
    }

    // Botón Copiar Código de Sala
    const btnCopyCode = document.getElementById('btn-copy-room-code');
    const copyStatus = document.getElementById('copy-status-text');
    if (btnCopyCode) {
      btnCopyCode.addEventListener('click', () => {
        const code = this.onlineManager.roomCode;
        if (code && navigator.clipboard) {
          navigator.clipboard.writeText(code);
          if (copyStatus) {
            copyStatus.style.display = 'inline';
            setTimeout(() => { if (copyStatus) copyStatus.style.display = 'none'; }, 2000);
          }
          if (window.soundEngine) window.soundEngine.playSfx('select');
        }
      });
    }

    // Toggle de Objetos (Solo Anfitrión)
    const itemsToggleBtn = document.getElementById('btn-online-items-toggle');
    let onlineItemsEnabled = true;
    if (itemsToggleBtn) {
      itemsToggleBtn.addEventListener('click', () => {
        if (this.onlineManager.role !== 'host') return;
        onlineItemsEnabled = !onlineItemsEnabled;
        itemsToggleBtn.classList.toggle('active', onlineItemsEnabled);
        itemsToggleBtn.innerText = onlineItemsEnabled ? '✅ Con Objetos (Draft)' : '❌ Sin Objetos';
        const stageSel = document.getElementById('online-stage-select');
        this.onlineManager.updateSettings(onlineItemsEnabled, stageSel ? stageSel.value : 'BATTLEFIELD');
        if (window.soundEngine) window.soundEngine.playSfx('select');
      });
    }

    // Selector de Escenario (Solo Anfitrión)
    const stageSelect = document.getElementById('online-stage-select');
    if (stageSelect) {
      stageSelect.addEventListener('change', () => {
        if (this.onlineManager.role !== 'host') return;
        this.onlineManager.updateSettings(onlineItemsEnabled, stageSelect.value);
        if (window.soundEngine) window.soundEngine.playSfx('select');
      });
    }

    // Unirse a Sala (Guest)
    const joinInput = document.getElementById('join-room-code-input');
    const btnSubmitJoin = document.getElementById('btn-submit-join-room');
    const joinError = document.getElementById('join-error-msg');

    if (btnSubmitJoin && joinInput) {
      btnSubmitJoin.addEventListener('click', async () => {
        const code = joinInput.value.trim();
        if (joinError) joinError.style.display = 'none';
        btnSubmitJoin.disabled = true;
        btnSubmitJoin.innerText = 'CONECTANDO...';

        const res = await this.onlineManager.joinRoom(code);
        btnSubmitJoin.disabled = false;
        btnSubmitJoin.innerText = '🔑 UNIRSE A LA SALA';

        if (res.success) {
          const lobbyPanel = document.getElementById('online-lobby-status-panel');
          if (lobbyPanel) lobbyPanel.scrollIntoView({ behavior: 'smooth' });
          if (window.soundEngine) window.soundEngine.playSfx('select');
        } else {
          if (joinError) {
            joinError.innerText = res.error || 'Código incorrecto o sala no disponible.';
            joinError.style.display = 'block';
          }
          if (window.soundEngine) window.soundEngine.playSfx('shock');
        }
      });
    }

    // 2. Botón interactivo de "DARLE A LISTO"
    const btnReady = document.getElementById('btn-online-ready');
    if (btnReady) {
      btnReady.addEventListener('click', () => {
        const nextState = !this.onlineManager.isReady;
        this.onlineManager.setReady(nextState);
        if (window.soundEngine) window.soundEngine.playSfx('select');
      });
    }

    // 3. Selección de Personajes durante la Cuenta Atrás de 30s
    const charCards = document.querySelectorAll('#char-select-roster-grid .char-card');
    const myPreviewImg = document.getElementById('my-char-preview-img');
    const myPreviewName = document.getElementById('my-char-preview-name');
    const myPreviewDesc = document.getElementById('my-char-preview-desc');
    const btnConfirmChar = document.getElementById('btn-confirm-char');

    const dexMetadata = {
      25: { name: 'Pikachu', desc: 'Eléctrico · Peso: 6.0kg' },
      1: { name: 'Bulbasaur', desc: 'Planta · Peso: 6.9kg' },
      312: { name: 'Minun & Plusle', desc: 'Dúo Eléctrico · Peso: 4.2kg' },
      94: { name: 'Gengar', desc: 'Fantasma · Peso: 40.5kg' },
      39: { name: 'Jigglypuff', desc: 'Normal/Hada · Peso: 5.5kg' },
      6: { name: 'Charizard', desc: 'Fuego/Volador · Peso: 90.5kg' },
      700: { name: 'Sylveon', desc: 'Hada · Peso: 23.5kg' }
    };

    charCards.forEach(card => {
      card.addEventListener('click', () => {
        if (this.onlineManager.charConfirmed) return;
        const dex = parseInt(card.getAttribute('data-char-dex'), 10) || 25;
        charCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        this.onlineManager.selectCharacter(dex, false);

        const meta = dexMetadata[dex] || { name: 'Pokémon', desc: '' };
        if (myPreviewImg) myPreviewImg.src = `assets/pokemon/${dex}/Idle.png`;
        if (myPreviewName) myPreviewName.innerText = meta.name;
        if (myPreviewDesc) myPreviewDesc.innerText = meta.desc;

        if (window.soundEngine) window.soundEngine.playSfx('select');
      });
    });

    if (btnConfirmChar) {
      btnConfirmChar.addEventListener('click', () => {
        const currentDex = this.onlineManager.selectedDex || 25;
        this.onlineManager.selectCharacter(currentDex, true);
        btnConfirmChar.innerText = '✓ LUCHADOR CONFIRMADO';
        btnConfirmChar.classList.add('confirmed');
        btnConfirmChar.disabled = true;

        const myStatusPill = document.getElementById('my-char-status-pill');
        if (myStatusPill) {
          myStatusPill.className = 'preview-status-pill confirmed';
          myStatusPill.innerText = '✓ Confirmado';
        }

        if (window.soundEngine) window.soundEngine.playSfx('select');
      });
    }

    // 4. Callbacks de Conexión y Estado
    window.onOnlineRoomUpdated = (room, ping) => {
      this._handleOnlineLobbyUpdate(room, ping);
    };

    // Inicio de la cuenta atrás de 30s para elegir personaje
    window.onOnlineStartCharSelect = (sec, room) => {
      if (onlineModal) onlineModal.classList.remove('open');
      if (charModal) charModal.classList.add('open');
      if (window.soundEngine) window.soundEngine.playSfx('countdown_beep');

      const cdTimer = document.getElementById('char-countdown-timer');
      const badgeTimer = document.getElementById('char-select-badge-timer');
      const fill = document.getElementById('char-progress-fill');
      if (cdTimer) cdTimer.innerText = sec;
      if (badgeTimer) badgeTimer.innerText = sec;
      if (fill) fill.style.width = '100%';

      // Reset botón de confirmación
      if (btnConfirmChar) {
        btnConfirmChar.innerText = '✓ CONFIRMAR LUCHADOR';
        btnConfirmChar.classList.remove('confirmed');
        btnConfirmChar.disabled = false;
      }
      const myStatusPill = document.getElementById('my-char-status-pill');
      if (myStatusPill) {
        myStatusPill.className = 'preview-status-pill selecting';
        myStatusPill.innerText = 'Eligiendo...';
      }

      this._handleOnlineLobbyUpdate(room, this.onlineManager.ping);
    };

    window.onOnlineCharSelectTick = (sec, room) => {
      const cdTimer = document.getElementById('char-countdown-timer');
      const badgeTimer = document.getElementById('char-select-badge-timer');
      const fill = document.getElementById('char-progress-fill');
      if (cdTimer) cdTimer.innerText = sec;
      if (badgeTimer) badgeTimer.innerText = sec;
      if (fill) fill.style.width = `${(sec / 30) * 100}%`;

      if (sec <= 5 && window.soundEngine) {
        window.soundEngine.playSfx('countdown_beep');
      }

      this._handleOnlineLobbyUpdate(room, this.onlineManager.ping);
    };

    // Fase del Draft de Objetos (20 Segundos)
    window.onOnlineStartDraft = (sec) => {
      if (onlineModal) onlineModal.classList.remove('open');
      if (charModal) charModal.classList.remove('open');
      if (draftModal) draftModal.classList.add('open');
      if (window.soundEngine) window.soundEngine.playSfx('select');
    };

    window.onOnlineDraftTick = (sec) => {
      const countdown = document.getElementById('draft-countdown-timer');
      const fill = document.getElementById('draft-progress-fill');
      if (countdown) countdown.innerText = sec;
      if (fill) fill.style.width = `${(sec / 20) * 100}%`;
    };

    // Selección de Ítem en el Draft
    const draftCards = document.querySelectorAll('#draft-items-container .draft-item-card');
    let currentDraftChoice = 'restos';
    draftCards.forEach(c => {
      c.addEventListener('click', () => {
        draftCards.forEach(dc => dc.classList.remove('selected'));
        c.classList.add('selected');
        currentDraftChoice = c.getAttribute('data-item-id') || 'restos';
        const nameSpan = document.getElementById('draft-confirm-item-name');
        if (nameSpan) {
          const title = c.querySelector('.draft-item-name');
          nameSpan.innerText = title ? title.innerText : currentDraftChoice;
        }
        if (window.soundEngine) window.soundEngine.playSfx('select');
      });
    });

    const btnConfirmDraft = document.getElementById('btn-confirm-draft-item');
    if (btnConfirmDraft) {
      btnConfirmDraft.addEventListener('click', () => {
        this.onlineManager.pickDraftItem(currentDraftChoice);
        btnConfirmDraft.innerText = '✓ OBJETO CONFIRMADO';
        btnConfirmDraft.disabled = true;
        if (window.soundEngine) window.soundEngine.playSfx('select');
      });
    }

    // Comienzo Oficial de la Batalla
    window.onOnlineBattleStart = (cfg) => {
      if (onlineModal) onlineModal.classList.remove('open');
      if (charModal) charModal.classList.remove('open');
      if (draftModal) draftModal.classList.remove('open');
      if (startScreen) startScreen.classList.add('hidden');

      this.isOnlineMatch = true;
      this.onlineRole = cfg.role;
      this.onlineRoomCode = cfg.room?.code;

      this.startMatch({
        mode: 'ONLINE',
        stocks: 3,             // 3 Vidas Obligatorias
        timeLimit: 300,        // 5 Minutos (300s)
        stageId: cfg.stage || 'BATTLEFIELD',
        itemsEnabled: cfg.itemsEnabled !== false,
        playerDex: cfg.myDex,
        dummyDex: cfg.rivalDex,
        p1Type: 'HUMAN',
        p2Type: 'ONLINE_RIVAL',
        p1Item: cfg.role === 'host' ? cfg.p1Item : cfg.p2Item,
        dummyItem: cfg.role === 'host' ? cfg.p2Item : cfg.p1Item
      });

      this._renderOnlineMatchBadge(cfg.room?.code);
    };

    window.onOnlineNetStatus = (type, ping) => {
      const dot = document.getElementById('live-net-dot');
      const pingText = document.getElementById('live-ping-val');
      if (dot) {
        dot.className = `net-dot ${type === 'p2p' ? 'p2p' : 'http'}`;
      }
      if (pingText) {
        pingText.innerText = type === 'p2p' ? `P2P ${ping || 8}ms` : `HTTP ${ping || 45}ms`;
      }
    };

    // Botón para cerrar modal de sala abandonada
    const btnCloseAbandoned = document.getElementById('btn-close-abandoned-modal');
    if (btnCloseAbandoned) {
      btnCloseAbandoned.addEventListener('click', () => {
        this.onlineManager.leaveRoom();
      });
    }
  }

  _initHostRoom() {
    const stageSel = document.getElementById('online-stage-select');
    const itemsToggle = document.getElementById('btn-online-items-toggle');
    const itemsOn = itemsToggle ? itemsToggle.classList.contains('active') : true;
    const stage = stageSel ? stageSel.value : 'BATTLEFIELD';

    this.onlineManager.createRoom(stage, itemsOn).then(res => {
      if (res.success) {
        const codeDisplay = document.getElementById('online-host-code-display');
        if (codeDisplay) codeDisplay.innerText = res.code;
      }
    });
  }

  _handleOnlineLobbyUpdate(room, ping) {
    if (!room) return;

    const dexMetadata = {
      25: { name: 'Pikachu', desc: 'Eléctrico · Peso: 6.0kg' },
      1: { name: 'Bulbasaur', desc: 'Planta · Peso: 6.9kg' },
      312: { name: 'Minun & Plusle', desc: 'Dúo Eléctrico · Peso: 4.2kg' },
      94: { name: 'Gengar', desc: 'Fantasma · Peso: 40.5kg' },
      39: { name: 'Jigglypuff', desc: 'Normal/Hada · Peso: 5.5kg' },
      6: { name: 'Charizard', desc: 'Fuego/Volador · Peso: 90.5kg' },
      700: { name: 'Sylveon', desc: 'Hada · Peso: 23.5kg' }
    };

    // 1. Actualizar código de sala
    const codeDisplay = document.getElementById('online-host-code-display');
    if (codeDisplay && room.code) codeDisplay.innerText = room.code;

    // 2. Actualizar Slot Jugador 1 (Host)
    const p1ReadyBadge = document.getElementById('lobby-p1-ready-badge');
    const p1Name = document.getElementById('host-slot-p1-name');
    if (room.p1) {
      if (p1Name) p1Name.innerText = room.p1.name || 'Jugador 1';
      if (p1ReadyBadge) {
        const isReady = !!room.p1.ready;
        p1ReadyBadge.className = `ready-pill ${isReady ? 'ready' : 'not-ready'}`;
        p1ReadyBadge.innerText = isReady ? '✅ LISTO' : '⏳ NO LISTO';
      }
    }

    // 3. Actualizar Slot Jugador 2 (Guest)
    const p2ReadyBadge = document.getElementById('lobby-p2-ready-badge');
    const p2Name = document.getElementById('host-slot-p2-name');
    const p2Conn = document.getElementById('host-slot-p2-conn-text');
    const p2Avatar = document.getElementById('host-slot-p2-avatar');
    const btnReady = document.getElementById('btn-online-ready');
    const statusBanner = document.getElementById('lobby-status-banner');

    const isConnected = !!room.p2;

    if (isConnected) {
      if (p2Name) p2Name.innerText = room.p2.name || 'Jugador 2 (Rival)';
      if (p2Conn) {
        p2Conn.innerText = '🟢 Conectado';
        p2Conn.style.color = '#10b981';
      }
      if (p2Avatar) p2Avatar.innerText = '⚔️';

      if (p2ReadyBadge) {
        p2ReadyBadge.style.display = 'inline-block';
        const isReady = !!room.p2.ready;
        p2ReadyBadge.className = `ready-pill ${isReady ? 'ready' : 'not-ready'}`;
        p2ReadyBadge.innerText = isReady ? '✅ LISTO' : '⏳ NO LISTO';
      }

      // Habilitar botón de Listo para ambos jugadores
      if (btnReady) {
        btnReady.disabled = false;
        const myRole = this.onlineManager.role;
        const myReady = (myRole === 'host') ? !!room.p1?.ready : !!room.p2?.ready;
        const rivalReady = (myRole === 'host') ? !!room.p2?.ready : !!room.p1?.ready;

        if (myReady) {
          btnReady.innerText = '✓ ¡ESTÁS LISTO! (CANCELAR)';
          btnReady.classList.add('is-ready');
          if (statusBanner) {
            statusBanner.innerHTML = rivalReady 
              ? '<span style="color: #10b981; font-weight: 800;">⚔️ ¡Ambos jugadores listos! Iniciando selección de personaje...</span>'
              : '<span style="color: #facc15; font-weight: 700;">✅ Estás listo. Esperando a que el rival pulse Listo...</span>';
          }
        } else {
          btnReady.innerText = '👍 DARLE A LISTO';
          btnReady.classList.remove('is-ready');
          if (statusBanner) {
            statusBanner.innerHTML = rivalReady
              ? '<span style="color: #38bdf8; font-weight: 800;">🔔 ¡El rival ya está listo! Pulsa LISTO para comenzar la selección.</span>'
              : '<span style="color: #34d399; font-weight: 700;">⚔️ ¡Ambos jugadores conectados! Pulsad LISTO para comenzar.</span>';
          }
        }
      }
    } else {
      if (p2Name) p2Name.innerText = 'Esperando rival...';
      if (p2Conn) {
        p2Conn.innerText = 'Introduce el código de 4 dígitos';
        p2Conn.style.color = '#94a3b8';
      }
      if (p2Avatar) p2Avatar.innerText = '⏳';
      if (p2ReadyBadge) p2ReadyBadge.style.display = 'none';

      if (btnReady) {
        btnReady.disabled = true;
        btnReady.innerText = '👍 DARLE A LISTO';
        btnReady.classList.remove('is-ready');
      }
      if (statusBanner) {
        statusBanner.innerHTML = '⏳ Comparte el código de 4 dígitos con tu amigo para que se conecte a la sala...';
      }
    }

    // 4. Actualizar Previsualización Dual en la Pantalla de Selección de Personaje (30s)
    if (room.status === 'char_select' && room.char_select) {
      const isHost = (this.onlineManager.role === 'host');
      const myDex = isHost ? (room.char_select.p1_dex || this.onlineManager.selectedDex || 25) : (room.char_select.p2_dex || this.onlineManager.selectedDex || 1);
      const rivalDex = isHost ? (room.char_select.p2_dex || 1) : (room.char_select.p1_dex || 25);
      const rivalConfirmed = isHost ? !!room.char_select.p2_confirmed : !!room.char_select.p1_confirmed;

      // Previsualización del rival
      const rivalImg = document.getElementById('rival-char-preview-img');
      const rivalName = document.getElementById('rival-char-preview-name');
      const rivalDesc = document.getElementById('rival-char-preview-desc');
      const rivalPill = document.getElementById('rival-char-status-pill');

      const rMeta = dexMetadata[rivalDex] || { name: 'Pokémon', desc: '' };
      if (rivalImg) rivalImg.src = `assets/pokemon/${rivalDex}/Idle.png`;
      if (rivalName) rivalName.innerText = rMeta.name;
      if (rivalDesc) rivalDesc.innerText = rMeta.desc;
      if (rivalPill) {
        rivalPill.className = `preview-status-pill ${rivalConfirmed ? 'confirmed' : 'selecting'}`;
        rivalPill.innerText = rivalConfirmed ? '✓ Confirmado' : '⏳ Eligiendo...';
      }

      // Previsualización propia
      const myImg = document.getElementById('my-char-preview-img');
      const myName = document.getElementById('my-char-preview-name');
      const myDesc = document.getElementById('my-char-preview-desc');
      const mMeta = dexMetadata[myDex] || { name: 'Pokémon', desc: '' };
      if (myImg) myImg.src = `assets/pokemon/${myDex}/Idle.png`;
      if (myName) myName.innerText = mMeta.name;
      if (myDesc) myDesc.innerText = mMeta.desc;
    }
  }

  _renderOnlineMatchBadge(code) {
    let badge = document.getElementById('online-live-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'online-live-badge';
      badge.className = 'online-match-badge';
      const container = document.getElementById('canvas-container');
      if (container) container.appendChild(badge);
    }

    badge.innerHTML = `
      <span class="net-dot p2p" id="live-net-dot"></span>
      <span>🌐 SALA: <strong style="color: #facc15;">${code || '----'}</strong></span>
      <span style="font-size: 10px; color: #94a3b8;" id="live-ping-val">P2P 14ms</span>
      <span class="anticheat-shield-tag" id="live-anticheat-tag">🛡️ Anti-Cheat: OK</span>
      <button id="btn-online-leave-match" class="btn-online-leave-badge" title="Abandonar partida y cerrar sala">🚪 Salir</button>
    `;
    badge.style.display = 'flex';

    const leaveBtn = document.getElementById('btn-online-leave-match');
    if (leaveBtn) {
      leaveBtn.onclick = () => {
        if (confirm('¿Deseas abandonar el combate en línea? Se cerrará la sala permanentemente.')) {
          this.onlineManager.leaveRoom();
        }
      };
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new PokeSmashGame();
  window.game.init();
});
