/**
 * Training Dummy & CPU Battle Controller
 * Controls AI opponent behavior across 3 difficulty levels and training modes.
 * Features smart off-stage ledge recovery (jumps + Up-Special), spacing,
 * zoning, directional shielding, combos, and meteor spikes.
 */
class TrainingDummyController {
  constructor(dummyFighter) {
    this.dummy = dummyFighter;
    this.mode = 'STAND'; // 'STAND', 'JUMP', 'CROUCH', 'CPU_EASY', 'CPU_BATTLE'
    this.cpuLevel = 1;   // 1: Principiante, 2: Intermedio, 3: Experto
    this.jumpTimer = 0;
    this.aiTimer = 0;
    this.reactionTimer = 0;
    this.shieldHoldTimer = 0;
    this.targetPercent = 0;

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
    this.dummy.isDummy = true;
  }

  setMode(mode) {
    this.mode = mode;
    this.resetDummy(false);
  }

  setCpuLevel(level) {
    this.cpuLevel = Math.max(1, Math.min(3, parseInt(level, 10) || 1));
  }

  resetDummy(resetPercent = true) {
    if (!this.dummy) return;
    this.dummy.x = 664;
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
    this.dummy.facing = -1;

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

    // Handle temporary shield holding
    if (this.shieldHoldTimer > 0) {
      this.shieldHoldTimer -= dt;
      this.dummy.input.shield = true;
    }

    // If dummy is locked in hitstun, hitfreeze, or attack animation, cannot input new actions
    if (!this.dummy.canAct()) return;

    // Check if CPU needs to recover back to the stage (Off-Stage Recovery Logic)
    const isOffStage = this._checkOffStage(stage);
    if (isOffStage && (this.mode === 'CPU_BATTLE' || this.mode === 'CPU_EASY')) {
      this._handleRecovery(dt, stage);
      this.dummy.handleInputs(stage);
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

    this.dummy.handleInputs(stage);
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
   * Battle AI with 3 scalable difficulty tiers:
   * Level 1 (Principiante): Relaxed approach, basic attacks, recovers.
   * Level 2 (Intermedio): Dashes, projectile spacing, shields attacks, combo follow-ups.
   * Level 3 (Experto): High-speed zoning, parries/shields projectiles, ledge edge-guards, meteor spikes.
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

    // React frequency according to CPU Level
    this.reactionTimer -= dt;
    if (this.reactionTimer > 0) return;

    // Set reaction tick
    const reactInterval = this.cpuLevel === 3 ? 0.04 : this.cpuLevel === 2 ? 0.08 : 0.16;
    this.reactionTimer = reactInterval;

    /* =======================================================================
     * DEFENSIVE SHIELDING LOGIC (Levels 2 & 3)
     * Detects incoming attacks or projectiles and shields
     * ======================================================================= */
    if (this.cpuLevel >= 2) {
      const playerAttacking = player.state === 'ATTACK' || player.state === 'SPECIAL';
      const playerClose = dist < (this.cpuLevel === 3 ? 110 : 80);

      // Check incoming projectiles from player
      let projectileNear = false;
      if (player.projectiles && player.projectiles.length > 0) {
        for (const proj of player.projectiles) {
          const pDist = Math.hypot(proj.x - myFighter.x, proj.y - myFighter.y);
          if (pDist < 120) {
            projectileNear = true;
            break;
          }
        }
      }

      const shieldChance = this.cpuLevel === 3 ? 0.82 : 0.45;
      if ((playerAttacking && playerClose) || projectileNear) {
        if (Math.random() < shieldChance && d.shield > 25) {
          this.shieldHoldTimer = this.cpuLevel === 3 ? 0.28 : 0.4;
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
      if (targetFighter.y > myFighter.y + 28) {
        const dropChance = this.cpuLevel === 3 ? 0.60 : this.cpuLevel === 2 ? 0.35 : 0.18;
        if (Math.random() < dropChance) {
          d.dropThroughPlatform();
          return;
        }
      }
    }

    /* =======================================================================
     * OFFENSIVE & COMBAT BEHAVIOR PER LEVEL
     * ======================================================================= */
    if (this.cpuLevel === 1) {
      // LEVEL 1: Principiante
      // Steady walk towards player
      if (Math.abs(dx) > 65) {
        if (dx < 0) d.input.left = true;
        else d.input.right = true;
      }

      // Jump if player is on upper platforms
      if (dy < -65 && d.isGrounded && Math.random() < 0.08) {
        d.input.jumpPressed = true;
      }

      // Attack when close
      if (dist < 80 && Math.random() < 0.25) {
        if (Math.random() < 0.3) {
          d.input.specialPressed = true;
        } else {
          d.input.attackPressed = true;
          if (Math.random() < 0.2) d.input.up = true;
        }
      }
    } else if (this.cpuLevel === 2) {
      // LEVEL 2: Intermedio
      // Run / Dash towards player
      if (Math.abs(dx) > 75) {
        if (dx < 0) d.input.left = true;
        else d.input.right = true;
      }

      // Jump to engage airborne player
      if (dy < -45 && d.isGrounded && Math.random() < 0.16) {
        d.input.jumpPressed = true;
      }

      // Projectile Zoning at range (dist > 180)
      if (dist > 180 && Math.random() < 0.22) {
        d.input.specialPressed = true; // Neutral Special projectile
        return;
      }

      // Mid-Range Side Special (dist between 70 and 150)
      if (dist >= 70 && dist <= 150 && Math.random() < 0.28) {
        d.input.specialPressed = true;
        if (dx < 0) d.input.left = true;
        else d.input.right = true;
        return;
      }

      // Close Combat Attacks (dist < 75)
      if (dist < 75 && Math.random() < 0.55) {
        if (Math.random() < 0.35) {
          // Special move
          d.input.specialPressed = true;
          if (Math.random() < 0.4) d.input.down = true;
        } else {
          // Melee attack
          d.input.attackPressed = true;
          if (dy < -20) d.input.up = true; // Up tilt / Up air
          else if (d.isGrounded && Math.random() < 0.3) d.input.down = true; // Down tilt
          else {
            if (dx < 0) d.input.left = true;
            else d.input.right = true;
          }
        }
      }
    } else {
      // LEVEL 3: Experto (Smash Pro AI)
      // Fast pacing, zoning, combo chasing, edge-guarding & meteor spikes

      const mainPlat = stage.solidPlatforms && stage.solidPlatforms[0];
      const stageLeft = mainPlat ? mainPlat.x : 172;
      const stageRight = mainPlat ? mainPlat.x + mainPlat.width : 852;
      const stageY = mainPlat ? mainPlat.y : 430;

      // 1. Edge-guarding: If player is off-stage, position near the ledge and throw attacks!
      const playerOffStage = targetFighter.x < stageLeft || targetFighter.x > stageRight || targetFighter.y > stageY;
      if (playerOffStage) {
        const ledgeX = targetFighter.x < 512 ? stageLeft + 25 : stageRight - 25;
        const distToLedge = Math.abs(myFighter.x - ledgeX);

        if (distToLedge > 30) {
          if (myFighter.x < ledgeX) d.input.right = true;
          else d.input.left = true;
        } else {
          // Fire projectiles or edgeguard aerials
          if (Math.random() < 0.6) {
            d.input.specialPressed = true;
          } else if (d.isGrounded) {
            d.input.attackPressed = true;
            if (dx < 0) d.input.left = true;
            else d.input.right = true;
          }
        }
        return;
      }

      // 2. Meteor Spike: If in air directly above player, spike them!
      if (!d.isGrounded && Math.abs(dx) < 32 && dy > 25 && dy < 95) {
        d.input.down = true;
        d.input.attackPressed = true; // Down Air Spike!
        return;
      }

      // 3. Combo Pursuit: If player is in hitstun, rush in to juggle!
      if (player.hitstun > 0) {
        if (dx < 0) d.input.left = true;
        else d.input.right = true;

        if (dy < -30 && d.isGrounded) {
          d.input.jumpPressed = true;
        }
        if (dist < 65) {
          d.input.attackPressed = true;
          d.input.up = true; // Up-air / Up-tilt juggle
        }
        return;
      }

      // 4. Long-range projectile harassment (dist > 170)
      if (dist > 170 && Math.random() < 0.35) {
        d.input.specialPressed = true; // Neutral Special projectile
        return;
      }

      // 5. Approach & Spacing
      if (Math.abs(dx) > 60) {
        if (dx < 0) d.input.left = true;
        else d.input.right = true;
      }

      if (dy < -40 && d.isGrounded && Math.random() < 0.25) {
        d.input.jumpPressed = true;
      }

      // 6. Aggressive close-range combat
      if (dist < 75) {
        if (Math.random() < 0.7) {
          d.input.attackPressed = true;
          const r = Math.random();
          if (r < 0.35) d.input.up = true;
          else if (r < 0.65) {
            if (dx < 0) d.input.left = true;
            else d.input.right = true;
          } else {
            d.input.down = true;
          }
        } else {
          d.input.specialPressed = true;
          if (Math.random() < 0.5) d.input.down = true;
        }
      }
    }
  }
}

window.TrainingDummyController = TrainingDummyController;
