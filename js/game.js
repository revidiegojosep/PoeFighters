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
    this.matchStarted = false; // Menu displays by default BEFORE playing!
    this.isMatchOver = false;

    // Stage Selection & Held Items
    this.stageId = 'BATTLEFIELD'; // 'BATTLEFIELD' or 'FINAL_DESTINATION'
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

    // Customizable Keybinds
    this.defaultKeybinds = {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      up: 'ArrowUp',
      down: 'ArrowDown',
      jump: 'Space',
      attack: 'KeyZ',
      special: 'KeyX',
      shield: 'KeyC',
      item: 'Digit1'
    };
    this.keybinds = Object.assign({}, this.defaultKeybinds);
    try {
      const savedKeybinds = JSON.parse(localStorage.getItem('pokefighters_keybinds'));
      if (savedKeybinds && typeof savedKeybinds === 'object') {
        Object.assign(this.keybinds, savedKeybinds);
      }
    } catch (e) {}

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

    this._bindControls();
    this._bindTrainingButtons();
    this._bindMatchSetupModal();
    this._bindSettingsModal();
    this._bindStartScreen();
    this._bindChangelogModal();
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

  createFighter(dex, isPlayer, isDummy, stocks = 3, heldItem = 'none') {
    const config = {
      x: isPlayer ? 360 : 664,
      y: 430,
      facing: isPlayer ? 1 : -1,
      isPlayer: isPlayer,
      isDummy: isDummy,
      stocks: stocks,
      heldItem: heldItem
    };

    switch (parseInt(dex, 10)) {
      case 1:
        return new window.Bulbasaur(config);
      case 39:
        return new window.Jigglypuff(config);
      case 94:
        return new window.Gengar(config);
      case 312:
        return new window.MinunPlusle(config);
      case 25:
      default:
        return new window.Pikachu(config);
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
    this.stageId = options.stageId || this.stageId || 'BATTLEFIELD';
    this.matchStocks = options.stocks !== undefined ? options.stocks : (this.matchStocks || 3);
    this.matchTimeLimit = options.timeLimit !== undefined ? options.timeLimit : (this.matchTimeLimit || 0);
    this.matchTimeRemaining = this.matchTimeLimit;
    this.itemsEnabled = options.itemsEnabled !== undefined ? options.itemsEnabled : (this.itemsEnabled !== false);

    if (!this.itemsEnabled) {
      this.p1Item = 'none';
      this.dummyItem = 'none';
    } else {
      this.p1Item = options.p1Item !== undefined ? options.p1Item : (this.p1Item || 'none');
      this.dummyItem = options.dummyItem !== undefined ? options.dummyItem : (this.dummyItem || 'none');
    }

    this.isMatchOver = false;
    this.matchStarted = true;

    // Set stage in engine
    this.stage.setStage(this.stageId);

    const initialStocks = this.gameMode === 'BATTLE' ? this.matchStocks : 99;

    this.player = this.createFighter(this.playerDex, true, false, initialStocks, this.p1Item);
    this.dummy = this.createFighter(this.dummyDex, false, true, initialStocks, this.dummyItem);

    if (this.p1Type === 'CPU') {
      this.p1Controller = new window.TrainingDummyController(this.player);
      this.p1Controller.setMode('CPU_BATTLE');
      this.p1Controller.setCpuLevel(this.p1CpuLevel);
    } else {
      this.p1Controller = null;
    }

    this.dummyController.setDummyFighter(this.dummy);
    if (this.gameMode === 'BATTLE') {
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

      // If P1 is controlled by CPU, ignore fighting inputs from keyboard
      if (this.p1Type === 'CPU') return;

      if (this.keysDown[code]) return;
      this.keysDown[code] = true;

      const kb = this.keybinds;
      if (code === kb.left || (kb.left === 'ArrowLeft' && (key === 'a' || code === 'KeyA'))) {
        this.player.input.left = true;
        this.player.input.leftPressed = true;
      }
      if (code === kb.right || (kb.right === 'ArrowRight' && (key === 'd' || code === 'KeyD'))) {
        this.player.input.right = true;
        this.player.input.rightPressed = true;
      }
      if (code === kb.up || (kb.up === 'ArrowUp' && (key === 'w' || code === 'KeyW'))) {
        this.player.input.up = true;
        this.player.input.upPressed = true;
      }
      if (code === kb.down || (kb.down === 'ArrowDown' && (key === 's' || code === 'KeyS'))) {
        this.player.input.down = true;
        this.player.input.downPressed = true;
      }

      if (code === kb.jump) {
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

      if (code === kb.item || code === 'Digit1' || code === 'Numpad1' || key === '1') {
        if (this.player && typeof this.player.useActiveItem === 'function') {
          this.player.useActiveItem();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      const code = e.code;
      this.keysDown[code] = false;

      const kb = this.keybinds;
      if (code === kb.left || (kb.left === 'ArrowLeft' && (key === 'a' || code === 'KeyA'))) {
        this.player.input.left = false;
      }
      if (code === kb.right || (kb.right === 'ArrowRight' && (key === 'd' || code === 'KeyD'))) {
        this.player.input.right = false;
      }
      if (code === kb.up || (kb.up === 'ArrowUp' && (key === 'w' || code === 'KeyW'))) {
        this.player.input.up = false;
      }
      if (code === kb.down || (kb.down === 'ArrowDown' && (key === 's' || code === 'KeyS'))) {
        this.player.input.down = false;
      }
      if (code === kb.jump) {
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
  }

  _bindMatchSetupModal() {
    const setupModal = document.getElementById('match-setup-modal');
    const openMenuBtn = document.getElementById('btn-open-match-menu');
    const closeMenuBtn = document.getElementById('btn-close-setup-modal');

    if (openMenuBtn && setupModal) {
      openMenuBtn.addEventListener('click', () => {
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
          stageId: this.stageId,
          p1Item: this.p1Item,
          dummyItem: this.dummyItem
        });
      });
    }

    const victoryMenuBtn = document.getElementById('btn-victory-menu');
    if (victoryMenuBtn && setupModal) {
      victoryMenuBtn.addEventListener('click', () => {
        const victoryModal = document.getElementById('victory-modal');
        if (victoryModal) victoryModal.classList.remove('open');
        this.hud.renderModalAvatars();
        this._updateRosterButtonsUI();
        this.goToSetupStep(1);
        setupModal.classList.add('open');
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
        this.hud.renderModalAvatars();
        this._updateRosterButtonsUI();
        this.goToSetupStep(1);
        if (setupModal) setupModal.classList.add('open');
        window.soundEngine.playSfx('select');
      });
    }

    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        this._updateSettingsUI();
        if (settingsModal) settingsModal.classList.add('open');
        window.soundEngine.playSfx('select');
      });
    }

    if (btnChangelog) {
      btnChangelog.addEventListener('click', () => {
        if (changelogModal) changelogModal.classList.add('open');
        window.soundEngine.playSfx('select');
      });
    }

    if (btnGuide) {
      btnGuide.addEventListener('click', () => {
        if (movesModal) movesModal.classList.add('open');
        window.soundEngine.playSfx('select');
      });
    }

    if (btnReturnMenu) {
      btnReturnMenu.addEventListener('click', () => {
        if (setupModal) setupModal.classList.remove('open');
        if (settingsModal) settingsModal.classList.remove('open');
        if (changelogModal) changelogModal.classList.remove('open');
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

    const updateFsState = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      const container = document.getElementById('canvas-container');
      if (container) container.classList.toggle('is-fullscreen', isFs);
      fsBtns.forEach(b => {
        if (b) {
          b.innerText = isFs ? '🗗 Salir Pantalla Completa' : '⛶ Pantalla Completa';
        }
      });
    };

    document.addEventListener('fullscreenchange', updateFsState);
    document.addEventListener('webkitfullscreenchange', updateFsState);
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

    // In Battle Mode (3 Stocks), check if anyone reached 0 stocks
    if (this.gameMode === 'BATTLE') {
      if (this.dummy.stocks <= 0) {
        this.endMatch('PLAYER_WIN');
      } else if (this.player.stocks <= 0) {
        this.endMatch('CPU_WIN');
      }
    }
  }

  endMatch(result) {
    if (this.isMatchOver) return;
    this.isMatchOver = true;

    const isPlayerWin = result === 'PLAYER_WIN';
    if (isPlayerWin) {
      window.soundEngine.playSfx('victory');
      if (window.particleManager) {
        window.particleManager.spawnRadialBurst(512, 280, '#facc15', 'electric', 48);
        window.particleManager.spawnRadialBurst(512, 280, '#38bdf8', 'electric', 36);
        window.particleManager.spawnFloatingText(512, 200, '¡VICTORIA!', '#38bdf8', 44);
      }
    } else {
      window.soundEngine.playSfx('defeat');
      if (window.particleManager) {
        window.particleManager.spawnFloatingText(512, 200, '¡DERROTA!', '#f87171', 44);
      }
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

    // Show victory modal after brief 1.2s delay
    setTimeout(() => {
      this.hud.showVictoryModal({
        isPlayerWin,
        isCpuVsCpu: this.p1Type === 'CPU',
        winnerFighter: isPlayerWin ? this.player : this.dummy,
        playerStocks: this.player.stocks,
        dummyStocks: this.dummy.stocks,
        maxCombo: this.dummyController.maxCombo,
        totalDamage: Math.round(this.dummyController.totalDamageDealt),
        cpuLevel: this.cpuLevel
      });
    }, 1200);
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

    const frameTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

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
        this.endMatch(winner);
        return;
      }
    }

    // 1. Inputs & AI
    if (this.p1Type === 'CPU' && this.p1Controller) {
      this.p1Controller.update(dt, this.dummy, this.stage);
    } else {
      this.player.handleInputs(this.stage, dt);
    }
    this.dummyController.update(dt, this.player, this.stage);

    // 2. Physics & Entities update
    if (this.screenShakeTimer > 0) {
      this.screenShakeTimer -= dt;
      if (this.screenShakeTimer <= 0) {
        this.screenShakeIntensity = 0;
        this.screenShakeDuration = 0;
      }
    }

    this.stage.update(dt);
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

    // 6. Fighters (Sprites, Projectiles, Shields, Smash Auras, Ditto outline & Stage lighting)
    const isDittoMatch = (this.playerDex === this.dummyDex);
    this.player.draw(this.ctx, { stage: this.stage, isDittoMatch: isDittoMatch });
    this.dummy.draw(this.ctx, { stage: this.stage, isDittoMatch: false });

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

    this.ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new PokeSmashGame();
  window.game.init();
});
