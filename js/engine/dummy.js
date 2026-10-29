/**
 * Super Smash Bros Style CPU Battle Controller
 * Redesigned combat AI with:
 *  1. Imperfect Perception & Estimation Noise (No omniscient reading of inputs/future)
 *  2. Humanoid Reaction Time (Sense -> Think -> Act latency scaled across Levels 1 to 9)
 *  3. Anti-Spam & Post-Attack Spacing (Single-pulse attack execution, no standing in place)
 *  4. Full Platform & Map Navigation (Climbing to upper platforms & dropping through to chase)
 *  5. Priority & Contextual Decision Making (Neutral, Spacing, Advantage, Disadvantage)
 *  6. Decision Commitment (No jittery frame-by-frame 180° snap tracking)
 *  7. Character Moveset Knowledge (Bulbasaur, Pikachu, Gengar, Jigglypuff, Minun/Plusle)
 *  8. Natural Human Errors (Spacing miscalculations, delayed punishes, scaled by level)
 *  9. 9-Tier Scalable Difficulty (Level 1 Beginner to Level 9 Elite Tournament Human)
 */
class TrainingDummyController {
  constructor(dummyFighter) {
    this.dummy = dummyFighter;
    this.mode = 'STAND'; // 'STAND', 'JUMP', 'CROUCH', 'CPU_EASY', 'CPU_BATTLE'
    this.cpuLevel = 5;   // 1 to 9 (1: Principiante, 5: Medio, 7: Difícil, 9: Inmejorable)

    // Timers & cooldowns
    this.jumpTimer = 0;
    this.aiTimer = 0;
    this.reactionTimer = 0;
    this.shieldHoldTimer = 0;
    this.targetPercent = 0;
    this.projectileCooldown = 0;
    this.smashCooldown = 0;
    this.platformNavCooldown = 0;

    // Combo statistics (HUD tracking)
    this.comboCount = 0;
    this.comboDamage = 0;
    this.comboActive = false;
    this.isTrueCombo = true;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.totalDamageDealt = 0;
    this.lockedPercent = null; // Training Lab Lock % feature

    // 1. Perception System (Sense)
    this.perceptionTimer = 0;
    this.perceived = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      distX: 0,
      distY: 0,
      dist: 0,
      facing: 1,
      isGrounded: true,
      state: 'IDLE',
      percent: 0,
      hitstun: 0,
      isShielding: false,
      isAttacking: false,
      attackObservedDuration: 0,
      hasIncomingProjectile: false,
      nearestProjectileDist: 999,
      isOffStage: false,
      stageLeft: 172,
      stageRight: 852,
      stageY: 430
    };

    // Player tendencies tracking (Soft Adaptation)
    this.playerTendencies = {
      aerialApproaches: 0,
      shieldHabit: 0,
      groundAggro: 0,
      sampleTicks: 0
    };

    // 2. Reaction & Latency Pipeline (Sense -> Think -> Act)
    this.pendingDefense = null; // { action: 'SHIELD'|'ROLL'|'AIR_DODGE', executeIn: number }
    this.surpriseTimer = 0;

    // 3. Intent & Commitment Manager
    this.currentIntent = 'NEUTRAL'; // 'NEUTRAL', 'APPROACH', 'POKE', 'SPACE', 'BAIT', 'BURST', 'DEFEND', 'RETREAT', 'RECOVER'
    this.intentTimer = 0;
    this.intentLockedFacing = 0; // When non-zero, facing direction is committed
    this.intentMove = null;
    this.pokeTriggered = false; // Ensures attack button is pulsed ONCE, not held down in place

    // 4. Move Staling & Anti-Spam
    this.moveHistory = []; // Last 5 moves used
    this.lastActionType = 'NONE';
    this.consecutiveAttacks = 0;
    this.whiffHesitationTimer = 0;
    this.wasAttackingLastFrame = false;

    // 5. Neutral Spacing Dynamics (Foxtrot, Dash-dance, Spacing)
    this.neutralFlourishTimer = 0;
    this.neutralDanceDir = 1;

    // Cached character moveset profile
    this.profile = null;
  }

  setDummyFighter(fighter) {
    this.dummy = fighter;
    if (!fighter.isPlayer) {
      this.dummy.isDummy = true;
    }
    this.profile = null;
  }

  setMode(mode) {
    this.mode = mode;
    this.resetDummy(false);
  }

  setCpuLevel(level) {
    this.cpuLevel = Math.max(1, Math.min(9, parseInt(level, 10) || 5));
  }

  resetDummy(resetPercent = true) {
    if (!this.dummy) return;
    this.projectileCooldown = 0;
    this.smashCooldown = 0;
    this.shieldHoldTimer = 0;
    this.pendingDefense = null;
    this.currentIntent = 'NEUTRAL';
    this.intentTimer = 0;
    this.intentLockedFacing = 0;
    this.pokeTriggered = false;
    this.platformNavCooldown = 0;
    this.moveHistory = [];
    this.consecutiveAttacks = 0;
    this.whiffHesitationTimer = 0;
    this.wasAttackingLastFrame = false;

    const isPlayerFighter = !!(this.dummy.isPlayer);
    this.dummy.x = isPlayerFighter ? 360 : 664;
    this.dummy.y = 430;
    this.dummy.vx = 0;
    this.dummy.vy = 0;
    this.dummy.hitstun = 0;
    this.dummy.hitstop = 0;
    this.dummy.actionLockTimer = 0;
    this.dummy.shieldBreakTimer = 0;
    this.dummy.shieldTapTimer = 0;
    this.dummy.shield = this.dummy.maxShield;
    this.dummy.upSpecialUsed = false;
    this.dummy.isGrounded = true;
    this.dummy.state = 'IDLE';
    this.dummy.facing = isPlayerFighter ? 1 : -1;

    if (this.dummy.partner) {
      this.dummy.partner.x = this.dummy.x - 26 * this.dummy.facing;
      this.dummy.partner.y = this.dummy.y;
      this.dummy.partner.vx = 0;
      this.dummy.partner.vy = 0;
      this.dummy.partner.hitstun = 0;
      this.dummy.partner.hitstop = 0;
      this.dummy.partner.isGrounded = true;
      this.dummy.partner.state = 'IDLE';
      this.dummy.partner.facing = this.dummy.facing;
      this.dummy.partner.respawnTimer = 0;
      this.dummy.partner.isSeparated = false;
      if (resetPercent) {
        this.dummy.partner.percent = this.targetPercent;
      }
    }

    if (resetPercent) {
      this.dummy.percent = this.targetPercent;
      this.comboCount = 0;
      this.comboDamage = 0;
      this.comboActive = false;
      if (this.dummy.clearStatuses) {
        this.dummy.clearStatuses();
      } else if (this.dummy.statuses && this.dummy.statuses.poison) {
        this.dummy.statuses.poison.active = false;
      }
    }
  }

  registerHit(damage) {
    const isUninterrupted = (this.dummy.hitstun > 0 || this.dummy.hitstop > 0);
    if (this.dummy.hitstun > 0 || this.comboActive) {
      this.comboCount++;
      this.comboDamage += damage;
      this.comboActive = true;
      this.comboTimer = 1.2;
      if (!isUninterrupted) {
        this.isTrueCombo = false;
      }
      if (this.comboCount > this.maxCombo) {
        this.maxCombo = this.comboCount;
      }
    } else {
      this.comboCount = 1;
      this.comboDamage = damage;
      this.comboActive = true;
      this.comboTimer = 1.2;
      this.isTrueCombo = true;
    }
    this.totalDamageDealt += damage;
  }

  /**
   * Character Moveset Knowledge Engine
   */
  _getCharacterProfile() {
    const d = this.dummy;
    const active = (d && d.minunDead && d.partner) ? d.partner : d;
    const dex = active ? active.dex : 25;

    switch (dex) {
      case 1: // Bulbasaur: Spacing zoner, vine whips, leaf projectiles, absorb heal
        return {
          dex: 1,
          name: 'Bulbasaur',
          archetype: 'zoner_spacing',
          preferredDist: 66,     // Optimal Vine Whip spacing (55 - 75px)
          minSafeDist: 45,
          maxPokeDist: 80,
          hasProjectile: true,
          projectileType: 'side_special', // Hojas Navaja (Side X)
          hasHeal: true,                  // Absorber (Neutral X)
          antiAir: 'up_basic',            // Látigo Aéreo Elevado
          spike: 'down_basic',            // Látigo Meteoro (D-Air)
          shieldBreaker: null,
          jumpAggression: 0.30,
          floaty: false
        };

      case 25: // Pikachu: Fast agile rushdown, thunder poke, multi-tilts, aerials
        return {
          dex: 25,
          name: 'Pikachu',
          archetype: 'agile_rushdown',
          preferredDist: 45,
          minSafeDist: 30,
          maxPokeDist: 68,
          hasProjectile: true,
          projectileType: 'neutral_special', // Bola Voltio (Neutral X)
          burstMove: 'side_special',          // Placaje Eléctrico (Side X)
          thunderMove: 'down_special',        // Trueno (Down X)
          antiAir: 'up_basic',
          spike: 'down_basic',               // Pisotón Meteoro (D-Air)
          shieldBreaker: null,
          jumpAggression: 0.48,
          floaty: false
        };

      case 94: // Gengar: Tricky ambush/zoner, shadow ball charge, shadow punch
        return {
          dex: 94,
          name: 'Gengar',
          archetype: 'tricky_zoner',
          preferredDist: 60,
          minSafeDist: 36,
          maxPokeDist: 78,
          hasProjectile: true,
          projectileType: 'neutral_special', // Bola Sombra (Neutral X - can charge)
          burstMove: 'side_special',          // Puño Sombra Vertical (Side X)
          trapMove: 'down_special',           // Bomba Lodo / Hipnosis (Down X)
          antiAir: 'up_basic',
          spike: 'down_basic',
          shieldBreaker: null,
          jumpAggression: 0.42,
          floaty: true
        };

      case 39: // Jigglypuff: Floaty aerialist, Wall of Pain, Rest (high risk/reward)
        return {
          dex: 39,
          name: 'Jigglypuff',
          archetype: 'aerial_floaty',
          preferredDist: 50,
          minSafeDist: 34,
          maxPokeDist: 68,
          hasProjectile: false,
          rollout: 'neutral_special',
          shieldBreaker: 'side_special', // Destructor / Pound (Breaks shield!)
          sleepMove: 'up_special',       // Canto / Sing
          restMove: 'down_special',      // Descanso / Rest (Lethal!)
          favoriteAerial: 'side_basic',  // Forward Air: Wall of Pain
          antiAir: 'up_basic',
          spike: 'down_basic',           // Drill kick (D-Air)
          jumpAggression: 0.82,          // Weaves in the air!
          floaty: true,
          maxJumps: 5
        };

      case 312: // Minun & Plusle: Tandem swarm / multi-hit rushdown
        return {
          dex: 312,
          name: 'Minun & Plusle',
          archetype: 'duo_swarm',
          preferredDist: 42,
          minSafeDist: 28,
          maxPokeDist: 65,
          hasProjectile: true,
          projectileType: 'neutral_special', // Chispazo Doble (+ y -)
          burstMove: 'side_special',          // Placaje Magnético Dúo
          antiAir: 'up_basic',
          spike: 'down_basic',
          shieldBreaker: null,
          jumpAggression: 0.45,
          floaty: false
        };

      case 6: // Charizard: Heavyweight powerhouse with armor, Flamethrower, Flare Blitz, Rock Smash
        return {
          dex: 6,
          name: 'Charizard',
          archetype: 'heavy_powerhouse',
          preferredDist: 58,
          minSafeDist: 38,
          maxPokeDist: 85,
          hasProjectile: true,
          projectileType: 'neutral_special', // Lanzallamas (Neutral X)
          burstMove: 'side_special',          // Envite Ígneo / Flare Blitz (Side X)
          armorMove: 'down_special',          // Golpe Roca / Rock Smash (Down X)
          antiAir: 'up_basic',                // Dragon Wing / Up Tilt
          spike: 'down_basic',               // Meteor Stomp (D-Air)
          shieldBreaker: 'down_special',      // Boulder shrapnel shreds shields
          jumpAggression: 0.44,
          floaty: false,
          maxJumps: 3
        };

      default:
        return {
          dex: 0,
          name: 'Fighter',
          archetype: 'balanced',
          preferredDist: 48,
          minSafeDist: 34,
          maxPokeDist: 68,
          hasProjectile: false,
          antiAir: 'up_basic',
          spike: 'down_basic',
          shieldBreaker: null,
          jumpAggression: 0.40,
          floaty: false
        };
    }
  }

  /**
   * Difficulty Parameters (Smash Bros Levels 1 to 9)
   * Nivel 9 es agresivo, adaptativo y castiga whiffs sin caer en hábitos defensivos predecibles.
   */
  _getDifficultyParams(level) {
    const l = Math.max(1, Math.min(9, level));
    return {
      reactionLatency: [0.55, 0.46, 0.38, 0.30, 0.20, 0.15, 0.12, 0.095, 0.075][l - 1],
      perceptionInterval: [0.32, 0.26, 0.22, 0.18, 0.10, 0.075, 0.055, 0.038, 0.024][l - 1],
      spacingNoise: [34, 28, 22, 17, 8, 4.5, 3.0, 1.5, 0.3][l - 1],
      errorRate: [0.55, 0.45, 0.36, 0.26, 0.14, 0.09, 0.05, 0.025, 0.01][l - 1],
      shieldChance: [0.08, 0.15, 0.22, 0.32, 0.45, 0.55, 0.65, 0.72, 0.78][l - 1], // Ajustado para evitar tortuguismo excesivo en niveles 7-9
      whiffPunishChance: [0.10, 0.20, 0.32, 0.45, 0.65, 0.78, 0.88, 0.94, 0.98][l - 1],
      ledgeTrapSkill: [0.05, 0.12, 0.22, 0.34, 0.65, 0.80, 0.90, 0.95, 0.98][l - 1],
      maxConsecutiveAttacks: 1 // Strictly 1 attack pulse before moving/spacing to eliminate spam
    };
  }

  update(dt, playerFighter, stage) {
    if (!this.dummy) return;

    // Combo timeout check
    if (this.comboActive) {
      if (this.dummy.hitstun <= 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) {
          this.comboActive = false;
        }
      }
    }

    // Auto-Reset percent when locked in Training Mode
    if (this.lockedPercent !== null && !this.comboActive && this.dummy.hitstun <= 0 && this.dummy.hitstop <= 0) {
      if (Math.abs(this.dummy.percent - this.lockedPercent) > 0.4) {
        this.dummy.percent = this.lockedPercent;
      }
    }

    // Reset dummy's input state for this tick
    this.dummy.input.left = false;
    this.dummy.input.right = false;
    this.dummy.input.up = false;
    this.dummy.input.down = false;
    this.dummy.input.jumpPressed = false;
    this.dummy.input.attackPressed = false;
    this.dummy.input.specialPressed = false;
    this.dummy.input.shield = false;
    this.dummy.input.shieldPressed = false;
    this.dummy.input.grab = false;
    this.dummy.input.grabPressed = false;

    // Cooldown management
    if (this.projectileCooldown > 0) this.projectileCooldown -= dt;
    if (this.smashCooldown > 0) this.smashCooldown -= dt;
    if (this.surpriseTimer > 0) this.surpriseTimer -= dt;
    if (this.platformNavCooldown > 0) this.platformNavCooldown -= dt;

    // Handle temporary shield holding
    if (this.shieldHoldTimer > 0) {
      this.shieldHoldTimer -= dt;
      this.dummy.input.shield = true;
    }

    // 🧗 Ledge Recovery for CPU (Ledge Jump, Ledge Attack, Ledge Climb)
    if (this.dummy.state === 'LEDGE') {
      this.aiTimer += dt;
      if (this.aiTimer >= 0.28) {
        this.aiTimer = 0;
        const dist = playerFighter ? Math.abs(this.dummy.x - playerFighter.x) : 999;
        const rand = Math.random();
        if (dist < 85 && rand < 0.45) {
          this.dummy.input.attackPressed = true; // Ataque de borde
        } else if (rand < 0.70) {
          this.dummy.input.jumpPressed = true;   // Salto de borde
        } else {
          this.dummy.input.upPressed = true;     // Subir borde
        }
      }
      this.dummy.handleInputs(stage, dt);
      return;
    }

    // 🤼 Grabbed handling for CPU: button mash to escape
    if (this.dummy.state === 'GRABBED') {
      this.dummy.grabEscapeTimer -= dt * (0.6 + this.cpuLevel * 0.18);
      return;
    }

    // 🤼 Grabbing handling for CPU: brief hold + directional throw!
    if (this.dummy.state === 'GRABBING') {
      this.aiTimer += dt;
      if (this.aiTimer >= 0.25) {
        this.aiTimer = 0;
        let choice = 'forward';
        if (playerFighter && playerFighter.percent > 85) {
          choice = (this.dummy.x > 512) ? 'back' : 'forward';
        } else {
          choice = Math.random() < 0.5 ? 'up' : 'down';
        }
        this.dummy.performThrow(choice);
      }
      return;
    }

    // If locked in hitstun or attack animation, cannot input new actions
    if (!this.dummy.canAct()) return;

    // Off-stage recovery check
    const isOffStage = this._checkOffStage(stage);
    if (isOffStage && (this.mode === 'CPU_BATTLE' || this.mode === 'CPU_EASY')) {
      this._handleRecovery(dt, stage);
      this.dummy.handleInputs(stage, dt);
      return;
    }

    // Training Modes
    switch (this.mode) {
      case 'STAND':
        if (playerFighter) {
          this.dummy.facing = playerFighter.x < this.dummy.x ? -1 : 1;
        }
        break;

      case 'CROUCH':
        this.dummy.input.down = true;
        break;

      case 'SHIELD':
        // Continuous shield block
        this.dummy.input.shield = true;
        if (playerFighter) {
          this.dummy.facing = playerFighter.x < this.dummy.x ? -1 : 1;
        }
        break;

      case 'ROLL':
        // Reactive evasion: roll/air-dodge when player gets close
        if (playerFighter) {
          this.dummy.facing = playerFighter.x < this.dummy.x ? -1 : 1;
          const dist = Math.abs(this.dummy.x - playerFighter.x);
          if (dist < 100) {
            this.dummy.input.shield = true;
            if (this.dummy.x < playerFighter.x) {
              this.dummy.input.left = true;
            } else {
              this.dummy.input.right = true;
            }
          }
        }
        break;

      case 'JUMP':
        this.jumpTimer += dt;
        if (this.jumpTimer >= 1.2) {
          this.jumpTimer = 0;
          this.dummy.input.jumpPressed = true;
        }
        break;

      case 'CPU_EASY':
        this.aiTimer += dt;
        if (this.aiTimer > 2.0) {
          this.aiTimer = 0;
          this.cpuDirection = Math.random() < 0.5 ? -1 : 1;
        }
        if (this.cpuDirection === -1 && this.dummy.x > 220) this.dummy.input.left = true;
        if (this.cpuDirection === 1 && this.dummy.x < 800) this.dummy.input.right = true;
        if (this.dummy.isOnSemiSolidPlatform && this.dummy.isOnSemiSolidPlatform(stage) && playerFighter && playerFighter.y > this.dummy.y + 30) {
          if (Math.random() < 0.12) {
            this.dummy.dropThroughPlatform();
          }
        }
        break;

      case 'CPU_BATTLE':
        this._updateBattleAI(dt, playerFighter, stage);
        break;
    }

    this.dummy.handleInputs(stage, dt);
  }

  /**
   * Detects if the dummy is currently off the main platform and in danger of falling
   */
  _checkOffStage(stage) {
    const mainPlat = stage.solidPlatforms && stage.solidPlatforms[0];
    if (!mainPlat) return false;

    const stageLeft = mainPlat.x;
    const stageRight = mainPlat.x + mainPlat.width;
    const stageY = mainPlat.y;

    const activeFighter = (this.dummy.minunDead && this.dummy.partner) ? this.dummy.partner : this.dummy;
    const isOutsideLedges = activeFighter.x < stageLeft + 12 || activeFighter.x > stageRight - 12;
    const isBelowStage = activeFighter.y > stageY + 6 && !activeFighter.isGrounded;

    return isOutsideLedges || isBelowStage;
  }

  /**
   * Intelligent Off-Stage Recovery
   */
  _handleRecovery(dt, stage) {
    const d = this.dummy;
    const activeFighter = (d.minunDead && d.partner) ? d.partner : d;
    const stageCenterX = 512;
    const stageY = 430;

    // 1. Horizontal drift towards stage center
    if (activeFighter.x < stageCenterX - 15) {
      d.input.right = true;
      d.facing = 1;
    } else if (activeFighter.x > stageCenterX + 15) {
      d.input.left = true;
      d.facing = -1;
    }

    // 2. Jump Recovery
    const isDeep = activeFighter.y > stageY + 15;
    const isFalling = activeFighter.vy > 0.8;
    const jumpsLeft = (d.minunDead && d.partner) ? d.partner.jumpsLeft : d.jumpsLeft;

    const isFloaty = !!(d.isFloaty || (d.partner && d.partner.isFloaty));
    const canPacedJump = isFloaty ? (activeFighter.vy > 1.2 || isDeep) : (isDeep || (isFalling && activeFighter.y > stageY - 30));

    if (jumpsLeft > 0 && canPacedJump) {
      d.input.jumpPressed = true;
      return;
    }

    // 3. Up-Special Recovery (Up + X)
    if (!d.upSpecialUsed && (jumpsLeft === 0 || activeFighter.y > stageY + 25)) {
      d.input.up = true;
      d.input.specialPressed = true;

      if (activeFighter.x < stageCenterX) {
        d.input.right = true;
        d.facing = 1;
      } else {
        d.input.left = true;
        d.facing = -1;
      }
    }
  }

  /**
   * Perception Update
   */
  _updatePerception(dt, player, stage, diff) {
    this.perceptionTimer -= dt;
    if (this.perceptionTimer > 0) return;
    this.perceptionTimer = diff.perceptionInterval;

    if (!player) return;
    const myFighter = (this.dummy.minunDead && this.dummy.partner) ? this.dummy.partner : this.dummy;
    const targetFighter = (player.minunDead && player.partner) ? player.partner : player;

    const noiseX = (Math.random() - 0.5) * diff.spacingNoise;
    const noiseY = (Math.random() - 0.5) * (diff.spacingNoise * 0.5);

    const realDx = targetFighter.x - myFighter.x;
    const realDy = targetFighter.y - myFighter.y;

    const perceivedDx = realDx + noiseX;
    const perceivedDy = realDy + noiseY;

    const isPlayerAttacking = (targetFighter.state === 'ATTACK' ||
                               targetFighter.state === 'SPECIAL' ||
                               targetFighter.state === 'SMASH_CHARGE');

    if (isPlayerAttacking) {
      this.perceived.attackObservedDuration += diff.perceptionInterval;
    } else {
      this.perceived.attackObservedDuration = 0;
    }

    let projectileThreat = false;
    let projDist = 999;
    if (player.projectiles && player.projectiles.length > 0) {
      for (const proj of player.projectiles) {
        const pDist = Math.hypot(proj.x - myFighter.x, proj.y - myFighter.y);
        if (pDist < 180) {
          projectileThreat = true;
          projDist = Math.min(projDist, pDist);
        }
      }
    }

    const mainPlat = stage.solidPlatforms && stage.solidPlatforms[0];
    const stageLeft = mainPlat ? mainPlat.x : 172;
    const stageRight = mainPlat ? mainPlat.x + mainPlat.width : 852;
    const stageY = mainPlat ? mainPlat.y : 430;
    const isTargetOffStage = targetFighter.x < stageLeft - 10 ||
                             targetFighter.x > stageRight + 10 ||
                             targetFighter.y > stageY + 15;

    this.perceived = {
      x: targetFighter.x + noiseX,
      y: targetFighter.y + noiseY,
      vx: targetFighter.vx,
      vy: targetFighter.vy,
      distX: perceivedDx,
      distY: perceivedDy,
      dist: Math.hypot(perceivedDx, perceivedDy),
      facing: targetFighter.facing,
      isGrounded: targetFighter.isGrounded,
      state: targetFighter.state,
      percent: targetFighter.percent,
      hitstun: targetFighter.hitstun || 0,
      isShielding: targetFighter.state === 'SHIELD',
      isAttacking: isPlayerAttacking,
      attackObservedDuration: this.perceived.attackObservedDuration,
      hasIncomingProjectile: projectileThreat,
      nearestProjectileDist: projDist,
      isOffStage: isTargetOffStage,
      stageLeft,
      stageRight,
      stageY
    };

    this.playerTendencies.sampleTicks++;
    if (!targetFighter.isGrounded && Math.abs(perceivedDx) < 120) {
      this.playerTendencies.aerialApproaches++;
    }
    if (this.perceived.isShielding) {
      this.playerTendencies.shieldHabit++;
    }
  }

  /**
   * Humanoid Defensive Reaction Pipeline
   */
  _checkDefensiveReaction(dt, diff) {
    const p = this.perceived;
    const d = this.dummy;
    const myFighter = (d.minunDead && d.partner) ? d.partner : d;

    if (!d.canAct() || d.state === 'ROLL' || d.state === 'AIR_DODGE') return false;

    // Solo activar si el ataque/proyectil rival está en rango real de impacto
    const isAttackThreat = p.isAttacking && p.dist < (d.isGrounded ? (this.cpuLevel >= 7 ? 85 : 70) : 62);
    const isProjThreat = p.hasIncomingProjectile && p.nearestProjectileDist < (this.cpuLevel >= 7 ? 130 : 90);

    if (!isAttackThreat && !isProjThreat) {
      this.pendingDefense = null;
      return false;
    }

    const attackingFromBehind = (p.distX * myFighter.facing) < -15;
    const surprisePenalty = attackingFromBehind ? 0.08 : 0;
    const totalReactionNeeded = diff.reactionLatency + surprisePenalty;

    if (p.attackObservedDuration < totalReactionNeeded && !isProjThreat) {
      return false;
    }

    if (this.pendingDefense) {
      this.pendingDefense.executeIn -= dt;
      if (this.pendingDefense.executeIn <= 0) {
        const act = this.pendingDefense.action;
        this.pendingDefense = null;
        this._executeDefense(act, p);
        return true;
      }
      return false;
    }

    if (Math.random() < diff.shieldChance && d.shield > 20) {
      let chosenAction = 'SHIELD';
      if (!d.isGrounded) {
        // En el aire: La IA inteligente NO spamea esquives aéreos que la dejen vendida
        const jumpsLeft = (d.minunDead && d.partner) ? d.partner.jumpsLeft : d.jumpsLeft;
        const airRoll = Math.random();

        if (jumpsLeft > 0 && airRoll < (this.cpuLevel >= 6 ? 0.45 : 0.25)) {
          // Opción 1: Salto de escape aéreo con drift (sin lag de esquive)
          chosenAction = 'AIR_JUMP_ESCAPE';
        } else if (this.cpuLevel >= 6 && airRoll < 0.75 && p.dist < 55) {
          // Opción 2: Contraataque aéreo (interrumpir con ataque aéreo rápido)
          chosenAction = 'AIR_COUNTER';
        } else if (!d.airDodgeUsed && p.dist < 65) {
          // Opción 3: Esquive aéreo direccional solo si es indispensable
          chosenAction = 'AIR_DODGE';
        } else {
          return false;
        }
      } else if (d.isGrounded && this.cpuLevel >= 5 && (d.rollCooldown || 0) <= 0 && Math.random() < 0.45) {
        chosenAction = Math.random() < 0.35 ? 'SPOT_DODGE' : 'ROLL';
      }

      this.pendingDefense = {
        action: chosenAction,
        executeIn: Math.random() * 0.03
      };
      return false;
    }

    return false;
  }

  _executeDefense(action, p) {
    const d = this.dummy;
    if (action === 'AIR_JUMP_ESCAPE') {
      d.input.jumpPressed = true;
      if (p.distX > 0) d.input.left = true;
      else d.input.right = true;
    } else if (action === 'AIR_COUNTER') {
      d.input.attackPressed = true;
      if (p.distY < -12) d.input.up = true;
      else if (p.distX < 0) d.input.left = true;
      else d.input.right = true;
    } else if (action === 'AIR_DODGE') {
      d.input.shieldPressed = true;
      // Esquive direccional alejándose del rival para no quedar bajo su vertical
      if (p.distX > 0) d.input.left = true;
      else d.input.right = true;
      if (p.distY < -15) d.input.down = true;
      else if (p.distY > 15) d.input.up = true;
    } else if (action === 'ROLL') {
      d.input.shield = true;
      const rollCross = (this.cpuLevel >= 7) ? Math.random() < 0.70 : Math.random() < 0.45;
      if (rollCross) {
        if (p.distX < 0) d.input.left = true;
        else d.input.right = true;
      } else {
        if (p.distX < 0) d.input.right = true;
        else d.input.left = true;
      }
    } else if (action === 'SPOT_DODGE') {
      d.input.shield = true;
      d.input.down = true;
    } else {
      // Escudo con soltado rápido en niveles altos para activar ventana de parry
      this.shieldHoldTimer = this.cpuLevel >= 8 ? 0.12 : this.cpuLevel >= 5 ? 0.22 : 0.32;
      d.input.shield = true;
    }
  }

  /**
   * Consumable Potion Usage
   */
  _checkPotionUsage(d, p) {
    if (d.itemCharges > 0 && d.itemCooldown <= 0 && typeof d.useActiveItem === 'function') {
      const needHeal = (d.heldItem === 'potion' && d.percent >= 35) ||
                       (d.heldItem === 'super-potion' && d.percent >= 60) ||
                       (d.heldItem === 'hyper-potion' && d.percent >= 80);
      if (needHeal && p.dist > 110 && !p.isAttacking && d.canAct()) {
        d.useActiveItem();
      }
    }
  }

  /**
   * Platform & Map Awareness Engine
   * Detects which platform a fighter is currently on.
   */
  _getFighterPlatform(fighter, stage) {
    if (!fighter) return null;
    // Check semi-solid floating platforms
    if (stage && stage.semiSolidPlatforms) {
      for (const plat of stage.semiSolidPlatforms) {
        if (fighter.x >= plat.x - 12 && fighter.x <= plat.x + plat.width + 12 &&
            Math.abs(fighter.y - plat.y) < 16) {
          return plat;
        }
      }
    }
    // Check solid main ground
    if (stage && stage.solidPlatforms) {
      for (const plat of stage.solidPlatforms) {
        if (fighter.x >= plat.x - 12 && fighter.x <= plat.x + plat.width + 12 &&
            Math.abs(fighter.y - plat.y) < 16) {
          return plat;
        }
      }
    }
    return null;
  }

  /**
   * Map Awareness & 2D Platform Navigation
   * Enables advanced CPUs to jump onto upper platforms and drop down to lower platforms to reach the player.
   */
  _navigatePlatforms(p, stage, diff, profile) {
    const d = this.dummy;
    const myFighter = (d.minunDead && d.partner) ? d.partner : d;
    if (this.cpuLevel < 3) return false;

    const myPlat = this._getFighterPlatform(myFighter, stage);

    // Case 1: Player is elevated on a higher platform (dy < -35px)
    if (p.distY < -35) {
      // Find the upper semi-solid platform closest to target's X
      let targetPlat = null;
      let minXDist = 999;
      if (stage && stage.semiSolidPlatforms) {
        for (const plat of stage.semiSolidPlatforms) {
          if (plat.y < myFighter.y - 25) {
            const xDist = Math.abs(p.x - (plat.x + plat.width / 2));
            if (xDist < minXDist) {
              minXDist = xDist;
              targetPlat = plat;
            }
          }
        }
      }

      if (targetPlat) {
        const platTargetX = Math.max(targetPlat.x + 22, Math.min(targetPlat.x + targetPlat.width - 22, p.x));
        const dxToPlat = platTargetX - myFighter.x;

        // Move horizontally toward platform
        if (dxToPlat < -12) {
          d.input.left = true;
          if (Math.abs(dxToPlat) > 60 && d.isGrounded) { d.isRunning = true; d.runDirection = -1; }
        } else if (dxToPlat > 12) {
          d.input.right = true;
          if (Math.abs(dxToPlat) > 60 && d.isGrounded) { d.isRunning = true; d.runDirection = 1; }
        }

        // Jump once in alignment with the platform
        const inJumpRange = (myFighter.x >= targetPlat.x - 28 && myFighter.x <= targetPlat.x + targetPlat.width + 28);
        if (inJumpRange) {
          if (d.isGrounded) {
            d.input.jumpPressed = true;
          } else if (d.jumpsLeft > 0 && myFighter.y > targetPlat.y - 10 && myFighter.vy > -1.5) {
            // Double jump to clear platform height
            d.input.jumpPressed = true;
          }
        }
        return true;
      }
    }

    // Case 2: CPU is on an elevated platform and the player is below on the ground (dy > 38px)
    if (p.distY > 38 && d.isOnSemiSolidPlatform && d.isOnSemiSolidPlatform(stage)) {
      const dropChances = [0.15, 0.25, 0.40, 0.55, 0.70, 0.85, 0.92, 0.96, 0.98];
      if (Math.random() < (dropChances[this.cpuLevel - 1] || 0.70)) {
        d.dropThroughPlatform();
        if (p.distX < -15) d.input.left = true;
        else if (p.distX > 15) d.input.right = true;
        return true;
      }
    }

    return false;
  }

  /**
   * Main Smash Bros Battle AI Loop
   */
  _updateBattleAI(dt, player, stage) {
    if (!player) return;
    const d = this.dummy;
    const myFighter = (d.minunDead && d.partner) ? d.partner : d;
    const profile = this.profile || (this.profile = this._getCharacterProfile());
    const diff = this._getDifficultyParams(this.cpuLevel);

    // 1. Update Perception
    this._updatePerception(dt, player, stage, diff);
    const p = this.perceived;

    // 2. Whiff Tracking: If an attack finished without hitting, apply brief hesitation
    if (this.wasAttackingLastFrame && d.state !== 'ATTACK' && d.state !== 'SPECIAL') {
      if (!d.hasHitOpponent) {
        this.whiffHesitationTimer = Math.max(0.08, 0.32 - this.cpuLevel * 0.03);
      }
    }
    this.wasAttackingLastFrame = (d.state === 'ATTACK' || d.state === 'SPECIAL');

    if (this.whiffHesitationTimer > 0) {
      this.whiffHesitationTimer -= dt;
    }

    // 3. Potion healing
    this._checkPotionUsage(d, p);

    // 4. Defensive Reaction
    if (this._checkDefensiveReaction(dt, diff)) {
      return;
    }

    // 5. Advantage State: Ledge Trapping / Edgeguarding (Opponent off-stage)
    if (p.isOffStage && this.cpuLevel >= 4) {
      this._handleLedgeTrap(dt, p, stage, diff, profile);
      return;
    }

    // 6. Advantage State: Juggle / Combo Pursuit (Opponent in hitstun)
    if (p.hitstun > 3 && this.cpuLevel >= 4) {
      this._handleComboPursuit(dt, p, stage, diff, profile);
      return;
    }

    // 7. Full Map Navigation: Ascending to upper platforms or dropping to lower platforms
    if (this._navigatePlatforms(p, stage, diff, profile)) {
      return;
    }

    // 8. Intent Commitment: If currently committed to an action, continue executing
    this.intentTimer -= dt;
    if (this.intentTimer > 0 && this.currentIntent !== 'NEUTRAL') {
      this._executeIntent(dt, p, stage, diff, profile);
      return;
    }

    // 9. Choose New Intent (Decision point)
    this._chooseNewIntent(p, stage, diff, profile);
    this._executeIntent(dt, p, stage, diff, profile);
  }

  /**
   * Intent Selection Engine
   * Eliminates spam and standing in place by enforcing post-attack spacing and movement.
   */
  _chooseNewIntent(p, stage, diff, profile) {
    const d = this.dummy;
    const isJigglypuff = profile.dex === 39;

    // Reset single-pulse trigger and locked facing upon new intent
    this.intentLockedFacing = 0;
    this.pokeTriggered = false;

    // Strict Anti-Spam: After ANY attack, enforce movement / spacing / neutral dance
    if (this.consecutiveAttacks >= 1) {
      this.consecutiveAttacks = 0;
      const roll = Math.random();
      if (roll < 0.45) {
        this.currentIntent = 'SPACE';
        this.intentTimer = 0.26 + Math.random() * 0.16;
      } else if (roll < 0.75) {
        this.currentIntent = 'BAIT';
        this.intentTimer = 0.22 + Math.random() * 0.14;
      } else {
        this.currentIntent = 'CROSS_UP';
        this.intentTimer = 0.32 + Math.random() * 0.14;
      }
      return;
    }

    // If recently whiffed, retreat slightly
    if (this.whiffHesitationTimer > 0) {
      this.currentIntent = 'SPACE';
      this.intentTimer = this.whiffHesitationTimer;
      return;
    }

    const dist = p.dist;
    const absDx = Math.abs(p.distX);

    /* --- LONG RANGE (dist > 180px) --- */
    if (dist > 180) {
      // Zoner projectile opportunity
      if (profile.hasProjectile && this.projectileCooldown <= 0 && Math.random() < 0.55) {
        this.currentIntent = 'POKE';
        this.intentMove = { id: 'projectile', type: 'projectile' };
        this.intentTimer = 0.28;
        this.projectileCooldown = 4.0 + Math.random() * 1.5;
        this.consecutiveAttacks = 1;
        this._recordMove('projectile');
        return;
      }

      // Approach to take stage control
      this.currentIntent = 'APPROACH';
      this.intentTimer = 0.32 + Math.random() * 0.18;
      return;
    }

    /* --- MID RANGE (profile.maxPokeDist < absDx <= 180px): NEUTRAL GAME --- */
    if (absDx > profile.maxPokeDist) {
      const roll = Math.random();

      // Surprise burst move (Pikachu Skull Bash, Minun Magnet Dash, Gengar Teleport)
      if (profile.burstMove && Math.random() < 0.22 && this.projectileCooldown <= 0) {
        this.currentIntent = 'BURST';
        this.intentTimer = 0.35;
        this.projectileCooldown = 3.2;
        this.consecutiveAttacks = 1;
        this._recordMove('burst');
        return;
      }

      // Jigglypuff aerial weave
      if (isJigglypuff && roll < 0.55) {
        this.currentIntent = 'AERIAL_WEAVE';
        this.intentTimer = 0.38 + Math.random() * 0.18;
        return;
      }

      // Foxtrot / Dash-dance / Approach
      if (roll < 0.40) {
        this.currentIntent = 'BAIT';
        this.intentTimer = 0.22 + Math.random() * 0.16;
        return;
      } else if (roll < 0.78) {
        this.currentIntent = 'APPROACH';
        this.intentTimer = 0.28 + Math.random() * 0.16;
        return;
      } else {
        this.currentIntent = 'SPACE';
        this.intentTimer = 0.22 + Math.random() * 0.12;
        return;
      }
    }

    /* --- CLOSE RANGE (absDx <= profile.maxPokeDist): ENGAGEMENT ZONE --- */
    // If opponent is shielding, don't blindly jab!
    if (p.isShielding) {
      if (Math.abs(p.distX) <= 60 && Math.random() < (0.45 + diff.whiffPunishChance * 0.40)) {
        this.currentIntent = 'POKE';
        this.intentMove = { id: 'grab', type: 'grab' };
        this.intentTimer = 0.28;
        return;
      }
      if (profile.shieldBreaker && Math.random() < 0.70) {
        this.currentIntent = 'POKE';
        this.intentMove = { id: 'shield_breaker', type: 'special_side' };
        this.intentTimer = 0.25;
        this.consecutiveAttacks = 1;
        this._recordMove('shield_breaker');
        return;
      }
      if (Math.random() < 0.55) {
        this.currentIntent = 'CROSS_UP';
        this.intentTimer = 0.32;
      } else {
        this.currentIntent = 'SPACE';
        this.intentTimer = 0.24;
      }
      return;
    }

    // Kill Smash Opportunity: Target is > 70% and grounded
    if (d.isGrounded && p.percent > 70 && this.smashCooldown <= 0 && Math.random() < (0.35 + diff.whiffPunishChance * 0.35)) {
      this.currentIntent = 'SMASH';
      this.intentTimer = 0.40;
      this.smashCooldown = 2.4;
      this.consecutiveAttacks = 1;
      this._recordMove('smash');
      return;
    }

    // Tactical Poke: Select move via Staling & Spacing
    const selectedMove = this._selectAttackMove(p, profile, diff);
    if (selectedMove) {
      this.currentIntent = 'POKE';
      this.intentMove = selectedMove;
      this.intentTimer = 0.24;
      this.consecutiveAttacks = 1;
      this._recordMove(selectedMove.id);
      return;
    }

    // Fallback neutral spacing
    this.currentIntent = 'SPACE';
    this.intentTimer = 0.22;
  }

  /**
   * Anti-Spam Move Selection with Staling & Character Knowledge
   */
  _selectAttackMove(p, profile, diff) {
    const d = this.dummy;
    const isAir = !d.isGrounded;
    const candidates = [];

    // 1. Jigglypuff Rest (Down X): VERY HIGH RISK. ONLY on asleep, stunned, or point-blank heavy hitstun!
    if (profile.dex === 39) {
      const isTargetHelpless = (p.hitstun > 18 || p.state === 'HURT' || p.state === 'SHIELD_BREAK');
      if (isTargetHelpless && p.dist < 26) {
        return { id: 'jiggly_rest', type: 'special_down' };
      }
    }

    // 2. Anti-Air: when target is above
    if (p.distY < -24 && Math.abs(p.distX) < 55) {
      candidates.push({ id: 'up_tilt', type: 'basic_up', score: 120 });
      if (profile.thunderMove && Math.random() < 0.45) {
        candidates.push({ id: 'down_special', type: 'special_down', score: 140 });
      }
    }

    // 3. Meteor Spike: Airborne directly above target
    if (isAir && p.distY > 20 && p.distY < 90 && Math.abs(p.distX) < 42) {
      candidates.push({ id: 'down_air_spike', type: 'basic_down', score: 150 });
    }

    // 4. Ground Moves (when grounded)
    if (!isAir) {
      // Bulbasaur signature Vine Whip poke (long reach ~75px)
      if (profile.dex === 1 && Math.abs(p.distX) >= 48 && Math.abs(p.distX) <= 80) {
        candidates.push({ id: 'side_basic', type: 'basic_side', score: 135 });
      } else {
        candidates.push({ id: 'side_basic', type: 'basic_side', score: 90 });
      }

      // Neutral Jab
      if (Math.abs(p.distX) < 45) {
        candidates.push({ id: 'neutral_basic', type: 'basic_neutral', score: 85 });
      }

      // Down Tilt / Sweep
      if (Math.abs(p.distX) < 60) {
        candidates.push({ id: 'down_basic', type: 'basic_down', score: 80 });
      }

      // Absorb heal for Bulbasaur (Neutral X)
      if (profile.hasHeal && d.percent > 40 && Math.abs(p.distX) < 55 && this.projectileCooldown <= 0) {
        candidates.push({ id: 'absorb_heal', type: 'special_neutral', score: 110 });
      }
    }

    // 5. Aerial Moves (when airborne)
    if (isAir) {
      if (profile.dex === 39) {
        candidates.push({ id: 'aerial_side', type: 'basic_side', score: 140 });
        candidates.push({ id: 'aerial_neutral', type: 'basic_neutral', score: 110 });
      } else {
        candidates.push({ id: 'aerial_side', type: 'basic_side', score: 100 });
        candidates.push({ id: 'aerial_neutral', type: 'basic_neutral', score: 90 });
        if (p.distY < -15) candidates.push({ id: 'aerial_up', type: 'basic_up', score: 115 });
      }
    }

    if (candidates.length === 0) {
      candidates.push({ id: 'neutral_basic', type: 'basic_neutral', score: 50 });
    }

    // Apply Move Staling / Recency Penalties (Anti-Spam)
    for (const cand of candidates) {
      // Immediate repetition penalty (-95% score)
      if (this.moveHistory[0] === cand.id) {
        cand.score *= 0.05;
      }
      // Used 2+ times in last 4 actions (-85% score)
      const recentOccurrences = this.moveHistory.slice(0, 4).filter(m => m === cand.id).length;
      if (recentOccurrences >= 2) {
        cand.score *= 0.15;
      }
      // Whiff penalty
      if (this.lastWhiffedMove === cand.id) {
        cand.score *= 0.25;
      }

      // Natural Human Error
      if (Math.random() < diff.errorRate) {
        cand.score *= (0.6 + Math.random() * 0.8);
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    const topCandidates = candidates.slice(0, 3);
    const totalScore = topCandidates.reduce((sum, c) => sum + Math.max(1, c.score), 0);
    let randPoint = Math.random() * totalScore;

    for (const cand of topCandidates) {
      randPoint -= Math.max(1, cand.score);
      if (randPoint <= 0) return cand;
    }

    return topCandidates[0];
  }

  _recordMove(moveId) {
    this.moveHistory.unshift(moveId);
    if (this.moveHistory.length > 5) {
      this.moveHistory.pop();
    }
  }

  /**
   * Intent Execution Engine
   * Enforces single-pulse attack execution and active movement so CPU never freezes in place.
   */
  _executeIntent(dt, p, stage, diff, profile) {
    const d = this.dummy;
    const myFighter = (d.minunDead && d.partner) ? d.partner : d;
    const dx = p.distX;
    const dy = p.distY;

    if (this.intentLockedFacing !== 0) {
      d.facing = this.intentLockedFacing;
      myFighter.facing = d.facing;
    } else {
      d.facing = dx < 0 ? -1 : 1;
      myFighter.facing = d.facing;
    }

    switch (this.currentIntent) {
      case 'APPROACH': {
        // Actively dash/run towards target
        if (dx < -15) {
          d.input.left = true;
          d.isRunning = true;
          d.runDirection = -1;
        } else if (dx > 15) {
          d.input.right = true;
          d.isRunning = true;
          d.runDirection = 1;
        }
        if (dy < -45 && d.isGrounded && Math.random() < profile.jumpAggression) {
          d.input.jumpPressed = true;
        }
        break;
      }

      case 'SPACE': {
        // Actively step back or dash dance out of danger
        const retreatDir = dx < 0 ? 1 : -1;
        if (retreatDir === 1 && myFighter.x < 800) {
          d.input.right = true;
        } else if (retreatDir === -1 && myFighter.x > 220) {
          d.input.left = true;
        }
        if (d.isGrounded && Math.random() < 0.25) {
          d.input.jumpPressed = true;
        }
        break;
      }

      case 'BAIT': {
        // Foxtrot dance (flick back and forth around spacing boundary)
        this.neutralFlourishTimer -= dt;
        if (this.neutralFlourishTimer <= 0) {
          this.neutralFlourishTimer = 0.12 + Math.random() * 0.10;
          this.neutralDanceDir = -this.neutralDanceDir;
        }
        if (this.neutralDanceDir === 1 && myFighter.x < 800) d.input.right = true;
        else if (this.neutralDanceDir === -1 && myFighter.x > 220) d.input.left = true;
        break;
      }

      case 'CROSS_UP': {
        if (d.isGrounded) {
          d.input.jumpPressed = true;
        }
        if (dx < 0) d.input.left = true;
        else d.input.right = true;
        break;
      }

      case 'AERIAL_WEAVE': {
        if (d.isGrounded) {
          d.input.jumpPressed = true;
        } else if (d.jumpsLeft > 0 && myFighter.vy > 0.8) {
          d.input.jumpPressed = true;
        }
        if (Math.abs(dx) > profile.preferredDist) {
          if (dx < 0) d.input.left = true;
          else d.input.right = true;
        } else {
          if (dx < 0) d.input.right = true;
          else d.input.left = true;
        }
        if (Math.abs(dx) <= profile.maxPokeDist && Math.random() < 0.50 && !this.pokeTriggered) {
          this.pokeTriggered = true;
          d.input.attackPressed = true;
          if (dx < 0) d.input.left = true;
          else d.input.right = true;
        }
        break;
      }

      case 'BURST': {
        this.intentLockedFacing = dx < 0 ? -1 : 1;
        d.facing = this.intentLockedFacing;
        if (!this.pokeTriggered) {
          this.pokeTriggered = true;
          d.input.specialPressed = true;
          if (this.intentLockedFacing === -1) d.input.left = true;
          else d.input.right = true;
        }
        break;
      }

      case 'SMASH': {
        if (d.isGrounded && d.startSmashCharge) {
          const smashDir = Math.abs(dy) > 28 ? (dy < 0 ? 'up' : 'down') : 'side';
          this.intentLockedFacing = dx < 0 ? -1 : 1;
          d.facing = this.intentLockedFacing;
          d.startSmashCharge(smashDir);
          const chargeDuration = 100 + Math.random() * (diff.whiffPunishChance * 180);
          setTimeout(() => {
            if (d.state === 'SMASH_CHARGE') {
              d.releaseSmashAttack(Math.min(1.0, chargeDuration / 550));
            }
          }, chargeDuration);
          this.currentIntent = 'SPACE';
          this.intentTimer = 0.28;
          this.pokeTriggered = false;
        }
        break;
      }

      case 'POKE': {
        if (!this.intentMove) break;
        this.intentLockedFacing = dx < 0 ? -1 : 1;
        d.facing = this.intentLockedFacing;

        // ★ SINGLE-PULSE ATTACK TRIGGER: Fired ONCE, never continuously held in place ★
        if (!this.pokeTriggered) {
          this.pokeTriggered = true;
          const m = this.intentMove;

          switch (m.type) {
            case 'grab':
              d.input.grabPressed = true;
              break;

            case 'projectile':
              d.input.specialPressed = true;
              if (profile.dex === 1) { // Bulbasaur Razor Leaf is Side X
                if (this.intentLockedFacing === -1) d.input.left = true;
                else d.input.right = true;
              }
              break;

            case 'special_neutral':
              d.input.specialPressed = true;
              break;

            case 'special_side':
              d.input.specialPressed = true;
              if (this.intentLockedFacing === -1) d.input.left = true;
              else d.input.right = true;
              break;

            case 'special_down':
              d.input.specialPressed = true;
              d.input.down = true;
              break;

            case 'basic_neutral':
              d.input.attackPressed = true;
              break;

            case 'basic_side':
              d.input.attackPressed = true;
              if (this.intentLockedFacing === -1) d.input.left = true;
              else d.input.right = true;
              break;

            case 'basic_up':
              d.input.attackPressed = true;
              d.input.up = true;
              break;

            case 'basic_down':
              d.input.attackPressed = true;
              d.input.down = true;
              break;
          }
        } else {
          // Attack has been fired: Once animation is done, immediately transition out!
          if (d.state !== 'ATTACK' && d.state !== 'SPECIAL') {
            this.currentIntent = Math.random() < 0.5 ? 'SPACE' : 'BAIT';
            this.intentTimer = 0.24 + Math.random() * 0.16;
            this.pokeTriggered = false;
          }
        }
        break;
      }
    }
  }

  /**
   * Advantage State: Combo Pursuit
   */
  _handleComboPursuit(dt, p, stage, diff, profile) {
    const d = this.dummy;
    const dx = p.distX;
    const dy = p.distY;

    if (dx < -10) {
      d.input.left = true;
      if (d.isGrounded) { d.isRunning = true; d.runDirection = -1; }
    } else if (dx > 10) {
      d.input.right = true;
      if (d.isGrounded) { d.isRunning = true; d.runDirection = 1; }
    }

    if (dy < -25 && d.isGrounded) {
      d.input.jumpPressed = true;
    }

    if (p.dist < 75 && !this.pokeTriggered) {
      this.pokeTriggered = true;
      d.input.attackPressed = true;
      if (dy < -15) d.input.up = true;
      else if (dx < 0) d.input.left = true;
      else d.input.right = true;
    }
  }

  /**
   * Advantage State: Ledge Trapping & Edgeguarding
   */
  _handleLedgeTrap(dt, p, stage, diff, profile) {
    const d = this.dummy;
    const myFighter = (d.minunDead && d.partner) ? d.partner : d;
    const stageLeft = p.stageLeft;
    const stageRight = p.stageRight;
    const stageY = p.stageY;

    const ledgeX = p.x < 512 ? stageLeft + 25 : stageRight - 25;
    const distToLedge = Math.abs(myFighter.x - ledgeX);

    // Deep off-stage spike for elite levels (Levels 8 & 9)
    if (this.cpuLevel >= 8 && p.y > stageY - 35 && myFighter.jumpsLeft > 0 && Math.abs(p.distX) < 85) {
      if (p.distX < 0) d.input.left = true;
      else d.input.right = true;

      if (p.distY > 20 && Math.abs(p.distX) < 38) {
        d.input.down = true;
        d.input.attackPressed = true;
        return;
      } else {
        d.input.attackPressed = true;
        return;
      }
    }

    if (distToLedge > 28) {
      if (myFighter.x < ledgeX) d.input.right = true;
      else d.input.left = true;
    } else {
      d.facing = ledgeX < 512 ? -1 : 1;
      myFighter.facing = d.facing;

      if (d.isGrounded && this.smashCooldown <= 0 && Math.random() < diff.ledgeTrapSkill && d.startSmashCharge) {
        this.smashCooldown = 2.0;
        d.startSmashCharge('side');
        const chargeDuration = 110 + Math.random() * 200;
        setTimeout(() => {
          if (d.state === 'SMASH_CHARGE') {
            d.releaseSmashAttack(Math.min(1.0, chargeDuration / 550));
          }
        }, chargeDuration);
      } else if (d.isGrounded) {
        d.input.attackPressed = true;
        if (Math.random() < 0.6) d.input.down = true;
        else if (d.facing === -1) d.input.left = true;
        else d.input.right = true;
      }
    }
  }
}

window.TrainingDummyController = TrainingDummyController;
