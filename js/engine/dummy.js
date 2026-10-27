/**
 * Training Dummy & CPU Battle Controller
 * Controls AI opponent behavior across 9 difficulty levels and training modes.
 * Features smart off-stage ledge recovery (jumps + Up-Special), spacing,
 * zoning, directional shielding, parrying, combos, and meteor spikes.
 * Levels 1 to 9 inspired by Super Smash Bros CPU levels.
 */
class TrainingDummyController {
  constructor(dummyFighter) {
    this.dummy = dummyFighter;
    this.mode = 'STAND'; // 'STAND', 'JUMP', 'CROUCH', 'CPU_EASY', 'CPU_BATTLE'
    this.cpuLevel = 5;   // 1 to 9 (1: Principiante, 5: Medio, 7: Difícil, 9: Inmejorable)
    this.jumpTimer = 0;
    this.aiTimer = 0;
    this.reactionTimer = 0;
    this.shieldHoldTimer = 0;
    this.targetPercent = 0;
    this.projectileCooldown = 0; // Cooldown to stop projectile spamming
    this.smashCooldown = 0;      // Cooldown between smash charges

    // Combo tracking
    this.comboCount = 0;
    this.comboDamage = 0;
    this.comboActive = false;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.totalDamageDealt = 0;
  }

  setDummyFighter(fighter) {
    this.dummy = fighter;
    if (!fighter.isPlayer) {
      this.dummy.isDummy = true;
    }
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

    // Bug Fix: P1 CPU must spawn on player side (360, facing 1), not opponent side (664, facing -1)
    const isPlayerFighter = !!(this.dummy.isPlayer);
    this.dummy.x = isPlayerFighter ? 360 : 664;
    this.dummy.y = 430; // Ground level
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
    if (this.dummy.hitstun > 0 || this.comboActive) {
      this.comboCount++;
      this.comboDamage += damage;
      this.comboActive = true;
      this.comboTimer = 1.2;
      if (this.comboCount > this.maxCombo) {
        this.maxCombo = this.comboCount;
      }
    } else {
      this.comboCount = 1;
      this.comboDamage = damage;
      this.comboActive = true;
      this.comboTimer = 1.2;
    }
    this.totalDamageDealt += damage;
  }

  update(dt, playerFighter, stage) {
    if (!this.dummy) return;

    // Combo timeout check (if hitstun is 0 for over 0.4s, combo resets)
    if (this.comboActive) {
      if (this.dummy.hitstun <= 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) {
          this.comboActive = false;
        }
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

    // Cooldown management
    if (this.projectileCooldown > 0) {
      this.projectileCooldown -= dt;
    }
    if (this.smashCooldown > 0) {
      this.smashCooldown -= dt;
    }

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

    // If dummy is locked in hitstun, hitfreeze, or attack animation, cannot input new actions
    if (!this.dummy.canAct()) return;

    // Check if CPU needs to recover back to the stage (Off-Stage Recovery Logic)
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

      case 'JUMP':
        this.jumpTimer += dt;
        if (this.jumpTimer >= 1.5) {
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
   * Recovers back to the stage using directional air-drift, double jumps,
   * and directional Up-Special (Up+X) recovery move!
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

    // 2. Jump Recovery: Jump when falling or deep
    const isDeep = activeFighter.y > stageY + 15;
    const isFalling = activeFighter.vy > 0.8;
    const jumpsLeft = (d.minunDead && d.partner) ? d.partner.jumpsLeft : d.jumpsLeft;

    if (jumpsLeft > 0 && (isDeep || (isFalling && activeFighter.y > stageY - 30))) {
      d.input.jumpPressed = true;
      return;
    }

    // 3. Up-Special Recovery (Up + X): When double jump is spent or deep in pit
    if (!d.upSpecialUsed && (jumpsLeft === 0 || activeFighter.y > stageY + 25)) {
      d.input.up = true;
      d.input.specialPressed = true;

      // Direct up-special towards stage
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
   * Battle AI with 9 scalable difficulty tiers (Super Smash Bros style):
   * Lvl 1: Principiante (leisurely, rare attacks, slow reactions)
   * Lvl 2: Principiante+ (simple approach, occasional basic attack)
   * Lvl 3: Novato (approaches, short jumps, mixes in tilts)
   * Lvl 4: Casual (dashes, engages airborne player, basic aerials)
   * Lvl 5: Medio (Old Lvl 2: active dashes, snappy smash charges, shields attacks)
   * Lvl 6: Avanzado (chases combos in hitstun, edge pressure, aerial intercepts)
   * Lvl 7: Difícil (Old Lvl 3: expert edgeguarding, ledge trapping, meteor spikes)
   * Lvl 8: Maestro (ruthless combo extension, parries, offstage deep edge-guards, tech chases)
   * Lvl 9: Inmejorable (near frame-perfect parries, optimal kill setups, micro-spacing, brutal spikes)
   */
  _updateBattleAI(dt, player, stage) {
    if (!player) return;

    const d = this.dummy;
    const myFighter = (d.minunDead && d.partner) ? d.partner : d;
    const targetFighter = (player.minunDead && player.partner) ? player.partner : player;
    const dx = targetFighter.x - myFighter.x;
    const dy = targetFighter.y - myFighter.y;
    const dist = Math.hypot(dx, dy);

    // Keep facing towards target
    d.facing = dx < 0 ? -1 : 1;
    myFighter.facing = d.facing;

    // Consumable Potion Usage (AI)
    if (d.itemCharges > 0 && d.itemCooldown <= 0 && typeof d.useActiveItem === 'function') {
      const needHeal = (d.heldItem === 'potion' && d.percent >= 35) ||
                       (d.heldItem === 'super-potion' && d.percent >= 60) ||
                       (d.heldItem === 'hyper-potion' && d.percent >= 80);
      if (needHeal && typeof d.canAct === 'function' && d.canAct()) {
        d.useActiveItem();
      }
    }

    // React frequency according to CPU Level
    this.reactionTimer -= dt;
    if (this.reactionTimer > 0) return;

    // Set reaction tick from 0.40s (Lvl 1) down to 0.012s (Lvl 9)
    const intervals = [0.40, 0.30, 0.22, 0.15, 0.09, 0.065, 0.040, 0.025, 0.012];
    const reactInterval = intervals[this.cpuLevel - 1] || 0.09;
    this.reactionTimer = reactInterval;

    /* =======================================================================
     * DEFENSIVE SHIELDING LOGIC (Levels 2 to 9)
     * Detects incoming attacks or projectiles and shields / spot dodges / parries
     * ======================================================================= */
    if (this.cpuLevel >= 2) {
      const playerAttacking = player.state === 'ATTACK' || player.state === 'SPECIAL' || player.state === 'SMASH_CHARGE';
      const dangerDist = this.cpuLevel >= 8 ? 130 : this.cpuLevel >= 6 ? 110 : 80;
      const playerClose = dist < dangerDist;

      // Check incoming projectiles from player
      let projectileNear = false;
      if (player.projectiles && player.projectiles.length > 0) {
        for (const proj of player.projectiles) {
          const pDist = Math.hypot(proj.x - myFighter.x, proj.y - myFighter.y);
          if (pDist < (this.cpuLevel >= 7 ? 160 : 120)) {
            projectileNear = true;
            break;
          }
        }
      }

      // Shield chances scaled 1 to 9 (0 to 97%)
      const shieldChances = [0, 0.15, 0.28, 0.40, 0.55, 0.70, 0.82, 0.90, 0.97];
      const shieldChance = shieldChances[this.cpuLevel - 1] || 0.55;

      if ((playerAttacking && playerClose) || projectileNear) {
        if (Math.random() < shieldChance && d.shield > 20) {
          if (!d.isGrounded && !d.airDodgeUsed && this.cpuLevel >= 4) {
            // Air dodge in mid-air (Levels 4-9)
            d.input.shieldPressed = true;
            if (this.cpuLevel >= 7) {
              if (dx > 0) d.input.left = true;
              else d.input.right = true;
            }
            return;
          } else if (d.isGrounded && this.cpuLevel >= 5 && Math.random() < (this.cpuLevel >= 8 ? 0.75 : 0.45) && (d.rollCooldown || 0) <= 0) {
            // Ground roll behind or away from attack (Levels 5-9)
            d.input.shield = true;
            if (Math.random() < (this.cpuLevel >= 7 ? 0.8 : 0.5)) {
              if (dx < 0) d.input.left = true;
              else d.input.right = true;
            } else {
              if (dx < 0) d.input.right = true;
              else d.input.left = true;
            }
            return;
          }
          // Hold shield
          this.shieldHoldTimer = this.cpuLevel >= 8 ? 0.18 : this.cpuLevel >= 6 ? 0.28 : 0.40;
          d.input.shield = true;
          return;
        }
      }
    }

    /* =======================================================================
     * PLATFORM DROP-THROUGH LOGIC (CPU drops through semi-solid platforms)
     * When target is below the platform, AI drops down to pursue or engage!
     * ======================================================================= */
    if (d.isOnSemiSolidPlatform && d.isOnSemiSolidPlatform(stage)) {
      if (targetFighter.y > myFighter.y + 26) {
        const dropChances = [0.05, 0.10, 0.18, 0.25, 0.35, 0.50, 0.65, 0.75, 0.88];
        const dropChance = dropChances[this.cpuLevel - 1] || 0.35;
        if (Math.random() < dropChance) {
          d.dropThroughPlatform();
          return;
        }
      }
    }

    /* =======================================================================
     * STAGE BOUNDARIES & LEDGE INFO FOR ADVANCED EDGE-GUARDING
     * ======================================================================= */
    const mainPlat = stage.solidPlatforms && stage.solidPlatforms[0];
    const stageLeft = mainPlat ? mainPlat.x : 172;
    const stageRight = mainPlat ? mainPlat.x + mainPlat.width : 852;
    const stageY = mainPlat ? mainPlat.y : 430;
    const playerOffStage = targetFighter.x < stageLeft || targetFighter.x > stageRight || targetFighter.y > stageY;

    /* =======================================================================
     * HIGH TIER EDGE-GUARDING & METEOR SPIKES (Levels 6, 7, 8, 9)
     * ======================================================================= */
    if (this.cpuLevel >= 6 && playerOffStage) {
      const ledgeX = targetFighter.x < 512 ? stageLeft + 25 : stageRight - 25;
      const distToLedge = Math.abs(myFighter.x - ledgeX);

      // Deep offstage aerial intercept for Levels 8 & 9
      if (this.cpuLevel >= 8 && targetFighter.y > stageY - 40 && myFighter.jumpsLeft > 0 && Math.abs(dx) < 90) {
        if (dx < 0) d.input.left = true;
        else d.input.right = true;

        if (dy > 20 && Math.abs(dx) < 40) {
          d.input.down = true;
          d.input.attackPressed = true; // Lethal offstage spike
          return;
        } else {
          d.input.attackPressed = true; // Forward Air / Back Air wall
          return;
        }
      }

      if (distToLedge > 30) {
        if (myFighter.x < ledgeX) d.input.right = true;
        else d.input.left = true;
      } else {
        // Ledge-trap with Smash or Down-tilt
        if (d.isGrounded && this.smashCooldown <= 0 && Math.random() < (this.cpuLevel >= 8 ? 0.65 : 0.45) && d.startSmashCharge) {
          this.smashCooldown = 1.8;
          d.startSmashCharge('side');
          const chargeDuration = 120 + Math.random() * (this.cpuLevel >= 8 ? 160 : 220);
          setTimeout(() => {
            if (d.state === 'SMASH_CHARGE') {
              d.releaseSmashAttack(Math.min(1.0, chargeDuration / 550));
            }
          }, chargeDuration);
          return;
        } else if (d.isGrounded) {
          d.input.attackPressed = true; // Down-tilt or Side-tilt at the ledge
          if (Math.random() < 0.55) d.input.down = true;
          else if (dx < 0) d.input.left = true;
          else d.input.right = true;
        } else {
          d.input.attackPressed = true;
          if (dx < 0) d.input.left = true;
          else d.input.right = true;
        }
      }
      return;
    }

    // Meteor Spike: If in air directly above player (Levels 6, 7, 8, 9)
    if (this.cpuLevel >= 6 && !d.isGrounded && Math.abs(dx) < 36 && dy > 20 && dy < 100) {
      d.input.down = true;
      d.input.attackPressed = true; // Down Air Spike (Z)!
      return;
    }

    // Combo Pursuit: If target is in hitstun, rush in to juggle with Z! (Levels 5, 6, 7, 8, 9)
    if (this.cpuLevel >= 5 && player.hitstun > 0) {
      if (dx < 0) {
        d.input.left = true;
        if (d.isGrounded) { d.isRunning = true; d.runDirection = -1; }
      } else {
        d.input.right = true;
        if (d.isGrounded) { d.isRunning = true; d.runDirection = 1; }
      }

      if (dy < -25 && d.isGrounded) {
        d.input.jumpPressed = true;
      }
      if (dist < 75) {
        d.input.attackPressed = true; // Z attack
        d.input.up = true; // Up-air / Up-tilt juggle
      }
      return;
    }

    /* =======================================================================
     * OFFENSIVE & COMBAT BEHAVIOR PER LEVEL (1 to 9)
     * ======================================================================= */
    switch (this.cpuLevel) {
      case 1: { // LEVEL 1: Principiante (Ultra-relaxed, slow approach)
        if (Math.abs(dx) > 95) {
          if (dx < 0) d.input.left = true;
          else d.input.right = true;
        }
        if (dy < -70 && d.isGrounded && Math.random() < 0.05) {
          d.input.jumpPressed = true;
        }
        if (dist < 65 && Math.random() < 0.20) {
          d.input.attackPressed = true;
          if (Math.random() < 0.3) {
            if (dx < 0) d.input.left = true;
            else d.input.right = true;
          }
        }
        break;
      }

      case 2: { // LEVEL 2: Novato
        if (Math.abs(dx) > 80) {
          if (dx < 0) d.input.left = true;
          else d.input.right = true;
        }
        if (dy < -55 && d.isGrounded && Math.random() < 0.10) {
          d.input.jumpPressed = true;
        }
        if (dist < 75 && Math.random() < 0.32) {
          if (this.projectileCooldown <= 0 && Math.random() < 0.08) {
            d.input.specialPressed = true;
            this.projectileCooldown = 4.5;
          } else {
            d.input.attackPressed = true;
            if (dy < -20) d.input.up = true;
            else if (Math.random() < 0.4) {
              if (dx < 0) d.input.left = true;
              else d.input.right = true;
            }
          }
        }
        break;
      }

      case 3: { // LEVEL 3: Aficionado
        if (Math.abs(dx) > 70) {
          if (dx < 0) {
            d.input.left = true;
            if (Math.abs(dx) > 160 && d.isGrounded && Math.random() < 0.3) { d.isRunning = true; d.runDirection = -1; }
          } else {
            d.input.right = true;
            if (Math.abs(dx) > 160 && d.isGrounded && Math.random() < 0.3) { d.isRunning = true; d.runDirection = 1; }
          }
        }
        if (dy < -50 && d.isGrounded && Math.random() < 0.14) {
          d.input.jumpPressed = true;
        }
        if (dist < 78 && Math.random() < 0.46) {
          d.input.attackPressed = true;
          if (dy < -18) d.input.up = true;
          else if (Math.random() < 0.5) {
            if (dx < 0) d.input.left = true;
            else d.input.right = true;
          }
        }
        break;
      }

      case 4: { // LEVEL 4: Casual
        if (Math.abs(dx) > 65) {
          if (dx < 0) {
            d.input.left = true;
            if (Math.abs(dx) > 140 && d.isGrounded) { d.isRunning = true; d.runDirection = -1; }
          } else {
            d.input.right = true;
            if (Math.abs(dx) > 140 && d.isGrounded) { d.isRunning = true; d.runDirection = 1; }
          }
        }
        if (dy < -45 && d.isGrounded && Math.random() < 0.18) {
          d.input.jumpPressed = true;
        }
        if (dist > 200 && this.projectileCooldown <= 0 && Math.random() < 0.05) {
          d.input.specialPressed = true;
          this.projectileCooldown = 4.0;
          return;
        }
        if (dist < 80 && Math.random() < 0.58) {
          d.input.attackPressed = true;
          if (dy < -18) d.input.up = true;
          else if (d.isGrounded && Math.random() < 0.25) d.input.down = true;
          else if (Math.random() < 0.6) {
            if (dx < 0) d.input.left = true;
            else d.input.right = true;
          }
        }
        break;
      }

      case 5: { // LEVEL 5: Medio (Equivalent to old Level 2)
        if (Math.abs(dx) > 60) {
          if (dx < 0) {
            d.input.left = true;
            if (Math.abs(dx) > 125 && d.isGrounded) { d.isRunning = true; d.runDirection = -1; }
          } else {
            d.input.right = true;
            if (Math.abs(dx) > 125 && d.isGrounded) { d.isRunning = true; d.runDirection = 1; }
          }
        }
        if (dy < -45 && d.isGrounded && Math.random() < 0.20) {
          d.input.jumpPressed = true;
        }
        if (dist > 200 && this.projectileCooldown <= 0 && Math.random() < 0.05) {
          d.input.specialPressed = true;
          this.projectileCooldown = 4.0;
          return;
        }
        if (dist < 80 && Math.random() < 0.68) {
          if (d.isGrounded && this.smashCooldown <= 0 && targetFighter.percent > 45 && Math.random() < 0.30 && d.startSmashCharge) {
            const smashDir = Math.abs(dy) > 28 ? (dy < 0 ? 'up' : 'down') : 'side';
            this.smashCooldown = 2.4;
            d.startSmashCharge(smashDir);
            const chargeDuration = 120 + Math.random() * 200;
            setTimeout(() => {
              if (d.state === 'SMASH_CHARGE') {
                d.releaseSmashAttack(Math.min(1.0, chargeDuration / 550));
              }
            }, chargeDuration);
            return;
          }
          if (this.projectileCooldown <= 0 && Math.random() < 0.12) {
            d.input.specialPressed = true;
            this.projectileCooldown = 3.5;
            if (Math.random() < 0.4) d.input.down = true;
          } else {
            d.input.attackPressed = true;
            if (dy < -18) d.input.up = true;
            else if (d.isGrounded && Math.random() < 0.28) d.input.down = true;
            else if (Math.random() < 0.65) {
              if (dx < 0) d.input.left = true;
              else d.input.right = true;
            }
          }
        }
        break;
      }

      case 6: { // LEVEL 6: Avanzado
        if (Math.abs(dx) > 55) {
          if (dx < 0) {
            d.input.left = true;
            if (Math.abs(dx) > 115 && d.isGrounded) { d.isRunning = true; d.runDirection = -1; }
          } else {
            d.input.right = true;
            if (Math.abs(dx) > 115 && d.isGrounded) { d.isRunning = true; d.runDirection = 1; }
          }
        }
        if (dy < -40 && d.isGrounded && Math.random() < 0.24) {
          d.input.jumpPressed = true;
        }
        if (dist > 210 && this.projectileCooldown <= 0 && Math.random() < 0.05) {
          d.input.specialPressed = true;
          this.projectileCooldown = 4.2;
          return;
        }
        if (dist < 82 && Math.random() < 0.76) {
          if (d.isGrounded && this.smashCooldown <= 0 && targetFighter.percent > 42 && Math.random() < 0.35 && d.startSmashCharge) {
            const smashDir = Math.abs(dy) > 28 ? (dy < 0 ? 'up' : 'down') : 'side';
            this.smashCooldown = 2.0;
            d.startSmashCharge(smashDir);
            const chargeDuration = 115 + Math.random() * 200;
            setTimeout(() => {
              if (d.state === 'SMASH_CHARGE') {
                d.releaseSmashAttack(Math.min(1.0, chargeDuration / 550));
              }
            }, chargeDuration);
            return;
          }
          d.input.attackPressed = true;
          const r = Math.random();
          if (dy < -18 || r < 0.32) d.input.up = true;
          else if (r < 0.68) {
            if (dx < 0) d.input.left = true;
            else d.input.right = true;
          } else {
            d.input.down = true;
          }
        }
        break;
      }

      case 7: { // LEVEL 7: Difícil (Equivalent to old Level 3)
        if (Math.abs(dx) > 55) {
          if (dx < 0) {
            d.input.left = true;
            if (Math.abs(dx) > 110 && d.isGrounded) { d.isRunning = true; d.runDirection = -1; }
          } else {
            d.input.right = true;
            if (Math.abs(dx) > 110 && d.isGrounded) { d.isRunning = true; d.runDirection = 1; }
          }
        }
        if (dy < -40 && d.isGrounded && Math.random() < 0.28) {
          d.input.jumpPressed = true;
        }
        if (dist > 220 && this.projectileCooldown <= 0 && Math.random() < 0.06) {
          d.input.specialPressed = true;
          this.projectileCooldown = 4.5;
          return;
        }
        if (dist < 85) {
          if (d.isGrounded && this.smashCooldown <= 0 && (targetFighter.percent > 40 || Math.random() < 0.35) && d.startSmashCharge) {
            const smashDir = Math.abs(dy) > 28 ? (dy < 0 ? 'up' : 'down') : 'side';
            this.smashCooldown = 1.8;
            d.startSmashCharge(smashDir);
            const chargeDuration = 110 + Math.random() * 220;
            setTimeout(() => {
              if (d.state === 'SMASH_CHARGE') {
                d.releaseSmashAttack(Math.min(1.0, chargeDuration / 550));
              }
            }, chargeDuration);
            return;
          }
          if (this.projectileCooldown <= 0 && Math.random() < 0.10) {
            d.input.specialPressed = true;
            this.projectileCooldown = 3.5;
            if (Math.random() < 0.5) d.input.down = true;
          } else {
            d.input.attackPressed = true;
            const r = Math.random();
            if (dy < -18 || r < 0.35) d.input.up = true;
            else if (r < 0.70) {
              if (dx < 0) d.input.left = true;
              else d.input.right = true;
            } else {
              d.input.down = true;
            }
          }
        }
        break;
      }

      case 8: { // LEVEL 8: Maestro (Elite tournament level AI)
        if (Math.abs(dx) > 45) {
          if (dx < 0) {
            d.input.left = true;
            if (d.isGrounded) { d.isRunning = true; d.runDirection = -1; }
          } else {
            d.input.right = true;
            if (d.isGrounded) { d.isRunning = true; d.runDirection = 1; }
          }
        }
        if (dy < -35 && d.isGrounded && Math.random() < 0.36) {
          d.input.jumpPressed = true;
        }
        if (dist > 230 && this.projectileCooldown <= 0 && Math.random() < 0.05) {
          d.input.specialPressed = true;
          this.projectileCooldown = 4.8;
          return;
        }
        if (dist < 88) {
          if (d.isGrounded && this.smashCooldown <= 0 && (targetFighter.percent > 38 || Math.random() < 0.42) && d.startSmashCharge) {
            const smashDir = Math.abs(dy) > 26 ? (dy < 0 ? 'up' : 'down') : 'side';
            this.smashCooldown = 1.6;
            d.startSmashCharge(smashDir);
            const chargeDuration = 100 + Math.random() * 200;
            setTimeout(() => {
              if (d.state === 'SMASH_CHARGE') {
                d.releaseSmashAttack(Math.min(1.0, chargeDuration / 550));
              }
            }, chargeDuration);
            return;
          }
          d.input.attackPressed = true;
          const r = Math.random();
          if (dy < -16 || r < 0.38) d.input.up = true;
          else if (r < 0.75) {
            if (dx < 0) d.input.left = true;
            else d.input.right = true;
          } else {
            d.input.down = true;
          }
        }
        break;
      }

      case 9: { // LEVEL 9: Inmejorable (TAS-grade micro-spacing & optimal execution)
        if (Math.abs(dx) > 38) {
          if (dx < 0) {
            d.input.left = true;
            if (d.isGrounded) { d.isRunning = true; d.runDirection = -1; }
          } else {
            d.input.right = true;
            if (d.isGrounded) { d.isRunning = true; d.runDirection = 1; }
          }
        }
        if (dy < -30 && d.isGrounded) {
          d.input.jumpPressed = true;
        }
        // Optimal smash punish when target is in endlag or kill range
        if (dist < 92) {
          if (d.isGrounded && this.smashCooldown <= 0 && (targetFighter.percent > 35 || Math.random() < 0.48) && d.startSmashCharge) {
            const smashDir = Math.abs(dy) > 25 ? (dy < 0 ? 'up' : 'down') : 'side';
            this.smashCooldown = 1.4;
            d.startSmashCharge(smashDir);
            const chargeDuration = 90 + Math.random() * 180;
            setTimeout(() => {
              if (d.state === 'SMASH_CHARGE') {
                d.releaseSmashAttack(Math.min(1.0, chargeDuration / 550));
              }
            }, chargeDuration);
            return;
          }
          d.input.attackPressed = true;
          const r = Math.random();
          if (dy < -15 || r < 0.40) d.input.up = true;
          else if (r < 0.78) {
            if (dx < 0) d.input.left = true;
            else d.input.right = true;
          } else {
            d.input.down = true;
          }
        }
        break;
      }
    }
  }
}

window.TrainingDummyController = TrainingDummyController;
