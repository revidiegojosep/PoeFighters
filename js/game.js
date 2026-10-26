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

    // Graphics Preset ('ultra', 'high', 'low')
    this.graphicsQuality = localStorage.getItem('pokefighters_graphics') || 'ultra';

    // Customizable Keybinds
    this.defaultKeybinds = {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      up: 'ArrowUp',
      down: 'ArrowDown',
      jump: 'Space',
      attack: 'KeyZ',
      special: 'KeyX',
      shield: 'KeyC'
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

    this._bindControls();
    this._bindTrainingButtons();
    this._bindMatchSetupModal();
    this._bindSettingsModal();
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

        // Default open the menu BEFORE playing
        const setupModal = document.getElementById('match-setup-modal');
        if (setupModal) setupModal.classList.add('open');

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
    this.p1Item = options.p1Item !== undefined ? options.p1Item : (this.p1Item || 'none');
    this.dummyItem = options.dummyItem !== undefined ? options.dummyItem : (this.dummyItem || 'none');
    this.isMatchOver = false;
    this.matchStarted = true;

    // Set stage in engine
    this.stage.setStage(this.stageId);

    const initialStocks = this.gameMode === 'BATTLE' ? 3 : 99;

    this.player = this.createFighter(this.playerDex, true, false, 3, this.p1Item);
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

    // Close modals
    const setupModal = document.getElementById('match-setup-modal');
    if (setupModal) setupModal.classList.remove('open');
    const victoryModal = document.getElementById('victory-modal');
    if (victoryModal) victoryModal.classList.remove('open');

    // Announcement text
    if (window.particleManager) {
      let bannerText = this.gameMode === 'BATTLE' ? '¡A LUCHAR!' : '¡ENTRENAMIENTO!';
      if (this.p1Type === 'CPU') bannerText = '¡CPU vs CPU!';
      window.particleManager.spawnFloatingText(512, 220, bannerText, '#facc15', 38);
    }
    window.soundEngine.playSfx('select');
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
      card.classList.toggle('active', card.getAttribute('data-p1-item') === this.p1Item);
    });

    document.querySelectorAll('[data-cpu-item]').forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-cpu-item') === this.dummyItem);
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
      }
      if (code === kb.right || (kb.right === 'ArrowRight' && (key === 'd' || code === 'KeyD'))) {
        this.player.input.right = true;
      }
      if (code === kb.up || (kb.up === 'ArrowUp' && (key === 'w' || code === 'KeyW'))) {
        this.player.input.up = true;
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
        setupModal.classList.add('open');
        window.soundEngine.playSfx('select');
      });
    }

    if (closeMenuBtn && setupModal) {
      closeMenuBtn.addEventListener('click', () => {
        setupModal.classList.remove('open');
      });
    }

    // Modal Mode Selector Tabs
    let selectedMode = this.gameMode;
    let selectedP1 = this.playerDex;
    let selectedCPU = this.dummyDex;
    let selectedLevel = this.cpuLevel;
    let selectedP1Type = this.p1Type;
    let selectedP1CpuLevel = this.p1CpuLevel;
    let selectedStage = this.stageId;
    let selectedP1Item = this.p1Item;
    let selectedCPUItem = this.dummyItem;

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

    // Held Item Selector Cards for P1
    const p1ItemCards = document.querySelectorAll('[data-p1-item]');
    p1ItemCards.forEach(card => {
      card.addEventListener('click', () => {
        p1ItemCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedP1Item = card.getAttribute('data-p1-item');
        window.soundEngine.playSfx('select');
      });
    });

    // Held Item Selector Cards for CPU
    const cpuItemCards = document.querySelectorAll('[data-cpu-item]');
    cpuItemCards.forEach(card => {
      card.addEventListener('click', () => {
        cpuItemCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedCPUItem = card.getAttribute('data-cpu-item');
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

    // Modal CPU Level Pills
    const diffCards = document.querySelectorAll('[data-cpu-level]');
    diffCards.forEach(card => {
      card.addEventListener('click', () => {
        diffCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedLevel = parseInt(card.getAttribute('data-cpu-level'), 10);
        window.soundEngine.playSfx('select');
      });
    });

    // Start Configured Match Button
    const startMatchBtn = document.getElementById('btn-start-configured-match');
    if (startMatchBtn) {
      startMatchBtn.addEventListener('click', () => {
        this.startMatch({
          mode: selectedMode,
          playerDex: selectedP1,
          dummyDex: selectedCPU,
          cpuLevel: selectedLevel,
          p1Type: selectedP1Type,
          p1CpuLevel: selectedP1CpuLevel,
          stageId: selectedStage,
          p1Item: selectedP1Item,
          dummyItem: selectedCPUItem
        });
      });
    }

    // Victory Rematch and Menu Buttons
    const rematchBtn = document.getElementById('btn-victory-rematch');
    if (rematchBtn) {
      rematchBtn.addEventListener('click', () => {
        this.startMatch({
          mode: this.gameMode,
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
        setupModal.classList.add('open');
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

    // Graphics Preset buttons
    document.querySelectorAll('[data-graphics-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-graphics-preset');
        this.graphicsQuality = preset;
        try { localStorage.setItem('pokefighters_graphics', preset); } catch(e) {}
        this.stage.setGraphicsQuality(preset);
        document.querySelectorAll('[data-graphics-preset]').forEach(b => b.classList.toggle('active', b === btn));
        window.soundEngine.playSfx('select');
      });
    });

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
        KeyL: 'L'
      };
      if (names[code]) return names[code];
      if (code && code.startsWith('Key')) return code.replace('Key', '');
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
    const frameTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap frame time to prevent giant leaps if tab loses focus
    this.accumulator += Math.min(frameTime, 0.1);

    // Fixed 60Hz physics and logic ticks
    while (this.accumulator >= this.fixedStep) {
      this.fixedUpdate(this.fixedStep);
      this.accumulator -= this.fixedStep;
    }

    // UI and canvas rendering run smoothly at monitor refresh rate
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

    // 1. Inputs & AI
    if (this.p1Type === 'CPU' && this.p1Controller) {
      this.p1Controller.update(dt, this.dummy, this.stage);
    } else {
      this.player.handleInputs(this.stage);
    }
    this.dummyController.update(dt, this.player, this.stage);

    // 2. Physics & Entities update
    this.stage.update(dt);
    this.player.update(dt, this.dummy, this.stage);
    this.dummy.update(dt, this.player, this.stage);
    window.particleManager.update(dt);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Stage
    this.stage.drawBackground(this.ctx);
    this.stage.drawPlatforms(this.ctx);
    this.stage.drawBlastZoneGuide(this.ctx);

    // Fighters (draw player & dummy)
    this.player.draw(this.ctx);
    this.dummy.draw(this.ctx);

    // Particles (sparks, lightning, leaves, text)
    window.particleManager.draw(this.ctx);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new PokeSmashGame();
  window.game.init();
});
