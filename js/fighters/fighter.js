/**
 * Base Fighter Entity for Super Smash Bros Pokemon
 * Handles states, animation blending, directional attacks (Z & X),
 * hurtboxes, hitboxes, projectiles, and life/respawn cycles.
 */
class Fighter {
  constructor(config = {}) {
    this.name = config.name || 'Pokemon';
    this.dex = config.dex || 25;
    this.color = config.color || '#ffd700';
    this.accentColor = config.accentColor || '#ff6b6b';
    this.isPlayer = config.isPlayer !== false;
    this.isDummy = !!config.isDummy;

    // Dimensions & physics
    this.x = config.x || 400;
    this.y = config.y || 400;
    this.vx = 0;
    this.vy = 0;
    this.width = 36;
    this.height = 48;
    this.hurtboxRadius = 22;
    this.pokedexWeight = config.pokedexWeight !== undefined ? config.pokedexWeight : (config.weight || 6.0);
    this.weight = this.pokedexWeight;
    this.weightCategory = config.weightCategory || (this.pokedexWeight <= 4.5 ? 'Pluma' : this.pokedexWeight <= 6.5 ? 'Ligero' : this.pokedexWeight <= 10.0 ? 'Medio' : 'Pesado');

    // Movement attributes (+20% base speeds)
    this.walkSpeed = config.walkSpeed || 4.6;
    this.dashSpeed = config.dashSpeed || 7.2;
    this.isRunning = false;
    this.runDirection = 0;
    this.jumpForce = config.jumpForce || 13.5;
    this.doubleJumpForce = config.doubleJumpForce || 12.0;
    this.maxJumps = config.maxJumps !== undefined ? config.maxJumps : 2;
    this.jumpsLeft = this.maxJumps;
    this.upSpecialUsed = false;

    // State
    this.state = 'IDLE'; // IDLE, WALK, JUMP, FALL, CROUCH, ATTACK, SPECIAL, SHIELD, HURT, RESPAWN
    this.facing = config.facing || 1; // 1 = right, -1 = left
    this.isGrounded = false;
    this.isFastFalling = false;
    this.isDroppingThrough = false;
    this.dropThroughTimer = 0;

    // Smash damage & combat
    this.percent = 0;
    this.stocks = config.stocks !== undefined ? config.stocks : 3;
    this.hitstun = 0;
    this.hitstop = 0;
    this.invulnTimer = 0;
    this.actionLockTimer = 0;
    this.attackCooldown = 0;
    this.specialCooldown = 0;
    this.shield = 100;
    this.maxShield = 100;
    this.shieldBreakTimer = 0;
    this.shieldTapTimer = 0;

    // Attack state
    this.currentAttack = null;
    this.attackFrame = 0;
    this.attackHitbox = null;
    this.hasHitOpponent = false;

    // Projectiles
    this.projectiles = [];

    // Animation
    this.scale = config.scale || 2.4;
    this.anim = new window.SpriteAnimator(this.dex, this.scale);

    // Inputs
    this.input = {
      left: false,
      right: false,
      up: false,
      down: false,
      leftPressed: false,
      rightPressed: false,
      upPressed: false,
      downPressed: false,
      jump: false,
      jumpPressed: false,
      attack: false,
      attackPressed: false,
      special: false,
      specialPressed: false,
      shield: false,
      shieldPressed: false,
      grab: false,
      grabPressed: false
    };

    // 🤼 Grab & Throw Mechanics (Smash Bros style)
    this.grabbedOpponent = null;
    this.grabber = null;
    this.grabStartupTimer = 0;
    this.grabHoldTimer = 0;
    this.grabEscapeTimer = 0;
    this.pummelCooldown = 0;
    this.isThrowing = false;
    this.throwTimer = 0;
    this.lavaBurnCooldown = 0;

    // Charged Smash Attacks (Double-tap direction on ground + hold Z. Released on keyup)
    this.lastDirTap = {
      left: 0,
      right: 0,
      up: 0,
      down: 0
    };
    this.smashWindowTimer = 0;
    this.smashPendingDir = null;
    this.smashChargeTimer = 0;
    this.smashTimeToMaxCharge = 0.55; // 0.55s para alcanzar el 100% de carga
    this.smashMaxHoldTime = 3.0;      // Límite de seguridad mientras se mantenga Z
    this.smashChargeDir = 'side';
    this.smashMaxNotified = false;

    // Smooth lighting fade interpolation
    this.lightFadeAlpha = 0;
    this.lightFadeR = 250;
    this.lightFadeG = 204;
    this.lightFadeB = 21;

    // Jump & Platform dynamics
    this.isJumping = false;
    this.lastDownTapTime = 0;

    // Held Item
    this.heldItem = config.heldItem || 'none';
    this.itemTimer = 0;
    this.focusSashActive = true;

    // Choice Scarf speed multiplier
    if (this.heldItem === 'choice-scarf') {
      this.walkSpeed = (this.walkSpeed || 4.6) * 1.25;
      this.dashSpeed = (this.dashSpeed || 7.2) * 1.25;
    }

    // Active Consumables (Tecla [1]), Berry and Balloon tracking
    this.itemCooldown = 0;
    this.itemCharges = 0;
    this.maxItemCharges = 0;
    this.oranBerryUsesLeft = 2;
    this.balloonPopped = false;

    if (this.heldItem === 'potion') {
      this.itemCharges = 3;
      this.maxItemCharges = 3;
    } else if (this.heldItem === 'super-potion') {
      this.itemCharges = 2;
      this.maxItemCharges = 2;
    } else if (this.heldItem === 'hyper-potion') {
      this.itemCharges = 1;
      this.maxItemCharges = 1;
    }

    // Status System (Veneno / Poison is the primary status)
    this.statuses = {
      poison: {
        active: false,
        timer: 0,
        tickTimer: 0
      }
    };

    // Air Dodge & Ground Roll (i-frames / Eframes)
    this.airDodgeUsed = false;
    this.rollCooldown = 0;
    this.specialChargeTimer = 0;
    this.specialIsCharging = false;
    this.specialChargeNotified = false;
    this.specialChargeMaxNotified = false;
    this.shadowBallStored = false;
    this.shadowBallStoreTimer = 0;

    // Ledge Grab & Recovery (Super Smash Bros style)
    this.ledgeSide = null;
    this.grabbedLedgePlat = null;
    this.ledgeTimer = 0;
    this.ledgeCooldown = 0;
    this.ledgeHangLockTimer = 0; // Tiempo mínimo colgado visible antes de reaccionar
    this.climbTimer = 0;
    this.climbStartX = 0;
    this.climbStartY = 0;
    this.climbTargetX = 0;
    this.climbTargetY = 0;

    // Perfect Shield / Parry (Ultimate style: release within 3 frames of attack)
    this.parryWindowTimer = 0;
    this.parryFlashTimer = 0;

    // Tracking
    this.lastAttacker = null;
    this.comboHitsReceived = 0;
    this.respawnTimer = 0;
  }

  canAct() {
    return (
      this.state !== 'HURT' &&
      this.state !== 'RESPAWN' &&
      this.state !== 'SHIELD' &&
      this.state !== 'SMASH_CHARGE' &&
      this.state !== 'ROLL' &&
      this.state !== 'AIR_DODGE' &&
      this.state !== 'ATTACK' &&
      this.state !== 'SPECIAL' &&
      this.state !== 'LEDGE' &&
      this.state !== 'LEDGE_CLIMB' &&
      this.state !== 'GRAB_START' &&
      this.state !== 'GRABBING' &&
      this.state !== 'GRABBED' &&
      this.shieldBreakTimer <= 0 &&
      this.hitstun <= 0 &&
      this.hitstop <= 0 &&
      this.actionLockTimer <= 0 &&
      !this.anim.isBusy()
    );
  }

  applyStatus(statusName, duration = 5.0) {
    if (this.invulnTimer > 0 || this.state === 'RESPAWN') return;

    if (!this.statuses) {
      this.statuses = {
        poison: { active: false, timer: 0, tickTimer: 0 }
      };
    }

    if (statusName === 'poison') {
      if (!this.statuses.poison) {
        this.statuses.poison = { active: false, timer: 0, tickTimer: 0 };
      }
      this.statuses.poison.active = true;
      this.statuses.poison.timer = duration;
      this.statuses.poison.tickTimer = 1.7;

      if (window.soundEngine) {
        window.soundEngine.playSfx('poison');
      }
      if (window.particleManager) {
        window.particleManager.spawnFloatingText(
          this.x,
          this.y - this.height - 18,
          '¡ENVENENADO!',
          '#a855f7',
          18
        );
        window.particleManager.spawnHitSparks(this.x, this.y - this.height * 0.5, 8, 'poison');
      }
    } else if (statusName === 'sleep') {
      if (!this.statuses.sleep) {
        this.statuses.sleep = { active: false, timer: 0 };
      }
      this.statuses.sleep.active = true;
      this.statuses.sleep.timer = duration;
      this.actionLockTimer = Math.max(this.actionLockTimer, duration);
      this.state = 'HURT';
      this.vx *= 0.3;
      if (window.soundEngine) {
        window.soundEngine.playSfx('sing');
      }
      if (window.particleManager) {
        window.particleManager.spawnFloatingText(
          this.x,
          this.y - this.height - 18,
          '💤 ¡DORMIDO! (Zzz)',
          '#38bdf8',
          18
        );
      }
    }
  }

  clearStatus(statusName) {
    if (this.statuses && this.statuses[statusName]) {
      this.statuses[statusName].active = false;
      this.statuses[statusName].timer = 0;
      this.statuses[statusName].tickTimer = 0;
    }
  }

  clearStatuses() {
    if (this.statuses) {
      for (const k in this.statuses) {
        this.statuses[k].active = false;
        this.statuses[k].timer = 0;
        this.statuses[k].tickTimer = 0;
      }
    }
  }

  update(dt, opponent, stage) {
    this.actionLockTimer = Math.max(0, this.actionLockTimer - dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.specialCooldown = Math.max(0, this.specialCooldown - dt);
    this.itemCooldown = Math.max(0, this.itemCooldown - dt);
    this.shieldTapTimer = Math.max(0, this.shieldTapTimer - dt);
    this.parryWindowTimer = Math.max(0, this.parryWindowTimer - dt);
    this.parryFlashTimer = Math.max(0, this.parryFlashTimer - dt);
    this.ledgeCooldown = Math.max(0, this.ledgeCooldown - dt);

    // Smooth Environmental Lighting Lerp (Gentle fade in & fade out, eliminating abrupt pop-in)
    const currentStage = stage || (window.game && window.game.stage);
    let targetLight = null;
    if (currentStage && typeof currentStage.getLightingAt === 'function') {
      targetLight = currentStage.getLightingAt(this.x, this.y);
    }
    const targetAlpha = targetLight ? targetLight.alpha : 0;
    const fadeSpeed = targetAlpha > this.lightFadeAlpha ? 4.5 : 3.5;
    this.lightFadeAlpha += (targetAlpha - this.lightFadeAlpha) * Math.min(1.0, dt * fadeSpeed);

    if (targetLight && targetLight.rgb) {
      this.lightFadeR += (targetLight.rgb.r - this.lightFadeR) * Math.min(1.0, dt * fadeSpeed);
      this.lightFadeG += (targetLight.rgb.g - this.lightFadeG) * Math.min(1.0, dt * fadeSpeed);
      this.lightFadeB += (targetLight.rgb.b - this.lightFadeB) * Math.min(1.0, dt * fadeSpeed);
    }

    // Ledge Climb State (Subir de borde suavemente SIN teleport)
    if (this.state === 'LEDGE_CLIMB') {
      this.climbTimer -= dt;
      const progress = Math.min(1.0, Math.max(0, 1.0 - (this.climbTimer / 0.22)));
      // Cubic ease-out curve
      const t = 1 - Math.pow(1 - progress, 3);
      this.x = this.climbStartX + (this.climbTargetX - this.climbStartX) * t;
      this.y = this.climbStartY + (this.climbTargetY - this.climbStartY) * t;
      this.vx = 0;
      this.vy = 0;

      if (this.climbTimer <= 0) {
        this.x = this.climbTargetX;
        this.y = this.climbTargetY;
        this.state = 'IDLE';
        this.isGrounded = true;
        this.grabbedLedgePlat = null;
        this.ledgeCooldown = 0.8;
        this.anim.loop('Idle', 1.0);
      }
      this.anim.setFacing(this.facing);
      this.anim.update(dt);
      return;
    }

    // Ledge Hang State handling
    if (this.state === 'LEDGE') {
      this.vx = 0;
      this.vy = 0;
      this.isGrounded = false;
      if (this.ledgeHangLockTimer > 0) {
        this.ledgeHangLockTimer -= dt;
      }
      this.ledgeTimer -= dt;
      if (this.ledgeTimer <= 0) {
        this.performLedgeClimb();
      }
      // Anclar firmemente la posición en la esquina del borde
      if (this.grabbedLedgePlat) {
        if (this.ledgeSide === 'left') {
          this.x = this.grabbedLedgePlat.x - 8;
        } else {
          this.x = this.grabbedLedgePlat.x + this.grabbedLedgePlat.width + 8;
        }
        this.y = this.grabbedLedgePlat.y + 22;
      }
      this.anim.setFacing(this.facing);
      this.anim.loop('Idle', 0.4);
      this.anim.update(dt);
      return;
    }

    if (this.smashWindowTimer > 0) {
      this.smashWindowTimer -= dt;
      if (this.smashWindowTimer <= 0) {
        this.smashPendingDir = null;
      }
    }
    if (this.input.shieldPressed) {
      this.shieldTapTimer = 0.16;
      this.input.shieldPressed = false;
    }

    // Projectiles update
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.life -= dt;
      if (proj.update) proj.update(dt);

      // Check collision with opponent
      if (opponent && opponent.state !== 'RESPAWN' && opponent.invulnTimer <= 0) {
        const hurtboxes = opponent.getHurtboxes
          ? opponent.getHurtboxes()
          : [{ x: opponent.x, y: opponent.y - opponent.height * 0.5, radius: opponent.hurtboxRadius, target: null }];
        const hitbox = { x: proj.x, y: proj.y, radius: proj.radius };
        let hit = false;
        for (const hurtbox of hurtboxes) {
          if (window.physicsEngine.checkHitboxCollision(hitbox, hurtbox)) {
            const finalHitbox = this.getModifiedHitbox(proj, true);
            opponent.takeHit(finalHitbox, this, hurtbox.target);
            if (proj.onHit) proj.onHit(opponent);
            this.projectiles.splice(i, 1);
            hit = true;
            break;
          }
        }
        if (hit) continue;
      }

      // Check stage collision (for projectiles that hit floor/walls)
      if (proj.hitStage) {
        for (const plat of stage.solidPlatforms) {
          if (
            proj.x >= plat.x &&
            proj.x <= plat.x + plat.width &&
            proj.y >= plat.y &&
            proj.y <= plat.y + plat.height
          ) {
            if (proj.onStageHit) proj.onStageHit(plat);
            this.projectiles.splice(i, 1);
            break;
          }
        }
      }

      if (proj.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // Invulnerability decay
    if (this.invulnTimer > 0) {
      this.invulnTimer -= dt;
      if (this.invulnTimer < 0) this.invulnTimer = 0;
    }

    // Drop through timer
    if (this.dropThroughTimer > 0) {
      this.dropThroughTimer -= dt;
      if (this.dropThroughTimer <= 0) this.isDroppingThrough = false;
    }

    // Respawn handling (Smash-style blast KO & platform descent)
    if (this.state === 'RESPAWN') {
      this.respawnTimer -= dt;

      // First 0.80s: completely off-screen ("sacado de la pantalla")
      if (this.respawnTimer > 1.2) {
        this.x = -9999;
        this.y = -9999;
        this.anim.update(dt);
        return;
      }

      // At 1.2s: Materialize onto the floating revival platform!
      if (!this.respawnPlatformMaterialized) {
        this.respawnPlatformMaterialized = true;
        this.x = this.respawnStageX || stage.respawnX;
        this.y = this.respawnStageY || stage.respawnY;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = false;
        this.anim.setAim('center');
        this.anim.loop('Idle', 1.0);
        window.soundEngine && window.soundEngine.playSfx('select');
        if (window.particleManager) {
          window.particleManager.spawnRadialBurst(this.x, this.y - 12, '#38bdf8', 'electric', 36);
          window.particleManager.spawnSmoke(this.x, this.y, '#ffffff', 8);
        }
      }

      if (this.respawnTimer <= 0) {
        this.state = 'IDLE';
        this.invulnTimer = 2.0; // 2 seconds flashing invulnerability
        this.vx = 0;
        this.vy = 0;
        this.hitstop = 0;
        this.actionLockTimer = 0;
        this.focusSashActive = true;
        this.balloonPopped = false;
        if (this.statuses && this.statuses.poison) this.statuses.poison.active = false;
        this.anim.setAim('center');
        this.anim.loop('Idle', 1.0);
        if (window.particleManager) {
          window.particleManager.spawnSmoke(this.x, this.y, '#ffffff', 10);
        }
      }
      this.anim.update(dt);
      return;
    }

    // Passive Held Item Updates (e.g. Leftovers)
    if (this.heldItem === 'leftovers' && this.state !== 'RESPAWN' && this.percent > 0) {
      this.itemTimer += dt;
      if (this.itemTimer >= 2.0) {
        this.itemTimer = 0;
        const healAmt = 1.5;
        this.percent = Math.max(0, parseFloat((this.percent - healAmt).toFixed(1)));
        if (window.particleManager) {
          window.particleManager.spawnFloatingText(this.x, this.y - this.height - 8, '-1.5% [Restos]', '#10b981', 13);
          window.particleManager.spawnHitSparks(this.x, this.y - this.height * 0.5, 2, 'grass');
        }
      }
    }

    // Status System: Veneno (Poison)
    // "Veneno aumenta el % ACTUAL que tenga el enemigo un 2%. Veneno hace daño cada 1.7 segundos de su duracion."
    if (this.statuses && this.statuses.poison && this.statuses.poison.active) {
      const p = this.statuses.poison;
      p.timer -= dt;
      p.tickTimer -= dt;

      // Poison bubble particles rising from victim
      if (Math.random() < 0.28 && window.particleManager) {
        window.particleManager.spawnHitSparks(
          this.x + (Math.random() - 0.5) * 20,
          this.y - Math.random() * this.height,
          1,
          'poison'
        );
      }

      if (p.tickTimer <= 0) {
        p.tickTimer = 1.7; // Ticks every 1.7 seconds
        const poisonDmg = Math.max(1, Math.round(this.percent * 0.03)); // Veneno aumenta un 3% el % actual
        this.percent = Math.min(999, this.percent + poisonDmg);
        window.soundEngine.playSfx('poison');
        if (window.particleManager) {
          window.particleManager.spawnFloatingText(
            this.x,
            this.y - this.height - 14,
            `+${poisonDmg}% [Veneno]`,
            '#a855f7',
            16
          );
          window.particleManager.spawnHitSparks(this.x, this.y - this.height * 0.5, 4, 'poison');
        }
      }

      if (p.timer <= 0) {
        p.active = false;
      }
    }

    // Status System: Sueño (Sleep)
    if (this.statuses && this.statuses.sleep && this.statuses.sleep.active) {
      this.statuses.sleep.timer -= dt;
      this.actionLockTimer = Math.max(this.actionLockTimer, this.statuses.sleep.timer);
      this.vx *= 0.85;
      if (Math.random() < 0.25 && window.particleManager) {
        window.particleManager.spawnFloatingText(this.x + (Math.random() - 0.5) * 16, this.y - this.height - 10, 'Zzz', '#38bdf8', 12);
      }
      if (this.statuses.sleep.timer <= 0) {
        this.statuses.sleep.active = false;
        if (this.state === 'HURT') this.state = 'IDLE';
      }
    }

    // Roll cooldown decay
    if (this.rollCooldown > 0) this.rollCooldown = Math.max(0, this.rollCooldown - dt);

    // Air Dodge reset when landing
    if (this.isGrounded) {
      if (this.state === 'AIR_DODGE') {
        this.state = 'IDLE';
        this.actionLockTimer = 0.04;
        this.anim.loop('Idle', 1.0);
      }
      this.airDodgeUsed = false;
    }

    // Roll State Physics (i-frames ground roll)
    if (this.state === 'ROLL') {
      this.vx *= 0.975; // Balance Update: Menor fricción para cubrir mayor distancia de roll over
      if (this.actionLockTimer <= 0) {
        this.state = this.input.shield ? 'SHIELD' : 'IDLE';
        this.anim.loop('Idle', 1.0);
      }
    } else if (this.state === 'AIR_DODGE') {
      this.vx *= 0.96;
      this.vy *= 0.96;
      if (this.actionLockTimer <= 0) {
        this.state = 'IDLE';
        this.anim.loop('Walk', 0.8);
      }
    }

    // A hit used to leave the fighter permanently in HURT after landing.
    // Return control as soon as both hitstop and hitstun have ended.
    if (this.state === 'HURT' && this.hitstun <= 0 && this.hitstop <= 0) {
      this.state = 'IDLE';
      this.anim.setAim('center');
      this.anim.loop('Idle', 1.0);
    }

    if (this.shieldBreakTimer > 0) {
      this.shieldBreakTimer -= dt;
      this.vx *= 0.72;
      if (this.shieldBreakTimer <= 0) {
        this.shieldBreakTimer = 0;
        this.state = 'IDLE';
        this.shield = this.maxShield * 0.35;
        this.anim.loop('Idle', 1.0);
      }
    } else if ((this.input.shield || this.shieldTapTimer > 0) && this.state !== 'ATTACK' && this.state !== 'SPECIAL' && this.state !== 'ROLL' && this.state !== 'AIR_DODGE' && this.hitstun <= 0 && this.hitstop <= 0) {
      this.state = 'SHIELD';
      this.vx *= 0.65;
      this.shield = Math.max(0, this.shield - 22 * dt);
      this.anim.setAim('center');
      this.anim.loop('Idle', 0.55);
      if (this.shield <= 0) this.breakShield();
    } else if (this.state === 'SHIELD') {
      this.state = 'IDLE';
      this.parryWindowTimer = 3 / 60; // 3 frames parry window (~0.055s) on shield release
    } else if (this.state !== 'ATTACK' && this.state !== 'SPECIAL' && this.state !== 'ROLL' && this.state !== 'AIR_DODGE') {
      // Slow passive regeneration only while the shield is down.
      this.shield = Math.min(this.maxShield, this.shield + 13 * dt);
    }

    // Handle Attack progression
    if (this.state === 'ATTACK' || this.state === 'SPECIAL') {
      this._updateAttack(dt, opponent);
    }

    // 🤼 Grab State Management
    if (this.lavaBurnCooldown > 0) this.lavaBurnCooldown -= dt;

    if (this.state === 'GRAB_START') {
      this.grabStartupTimer -= dt;
      if (this.grabStartupTimer > 0.03 && this.grabStartupTimer < 0.18 && opponent) {
        this._checkGrabConnection(opponent);
      }
      if (this.state === 'GRAB_START' && this.actionLockTimer <= 0) {
        this.state = 'IDLE';
      }
    } else if (this.state === 'GRABBING') {
      this._updateGrabbing(dt, opponent);
    } else if (this.state === 'GRABBED') {
      this._updateGrabbed(dt);
    }

    // Safety recovery: if attack finishes without currentAttack object
    if (this.state === 'ATTACK' && !this.currentAttack && this.actionLockTimer <= 0) {
      this.state = 'IDLE';
    }

    // Update Physics
    window.physicsEngine.updateFighter(this, stage, dt);

    // Variable Jump Height (Short Hop vs Full Hop):
    // Releasing Space early while rising cuts upward velocity for a smaller jump. Holding it reaches maximum jump height.
    if (this.isJumping && this.vy < 0) {
      if (!this.input.jump) {
        const shortHopCap = -this.jumpForce * 0.36; // Reduced short hop height on quick tap (hold jump retains full height)
        if (this.vy < shortHopCap) {
          this.vy = shortHopCap;
        }
        this.isJumping = false;
      }
    } else if (this.isGrounded || this.vy >= 0) {
      this.isJumping = false;
    }

    // Up specials are a single recovery per airtime. Landing restores it.
    if (this.isGrounded) this.upSpecialUsed = false;

    // If airborne and not attacking or in hitstun, play Fall / Jump
    if (!this.isGrounded && this.state !== 'ATTACK' && this.state !== 'SPECIAL' && this.state !== 'HURT') {
      if (this.vy < 0) {
        this.anim.loop('Walk', 1.2); // Upward jump posture
      } else {
        this.anim.loop('Walk', 0.8); // Falling posture
      }
    }

    // Update Sprite Animation
    this.anim.setFacing(this.facing);
    this.anim.update(dt);
  }

  isOnSemiSolidPlatform(stage) {
    if (!this.isGrounded) return false;
    stage = stage || (window.game ? window.game.stage : null);
    if (!stage || !stage.semiSolidPlatforms) return false;
    for (const plat of stage.semiSolidPlatforms) {
      if (
        Math.abs(this.y - plat.y) < 5 &&
        this.x >= plat.x - 10 &&
        this.x <= plat.x + plat.width + 10
      ) {
        return true;
      }
    }
    return false;
  }

  dropThroughPlatform() {
    this.isDroppingThrough = true;
    this.dropThroughTimer = 0.32;
    this.isGrounded = false;
    this.y += 5;
    this.vy = 2.0;
    if (window.particleManager) {
      window.particleManager.spawnSmoke(this.x, this.y, '#94a3b8', 6);
    }
  }

  handleInputs(stage = null, dt = 1 / 60) {
    stage = stage || (window.game ? window.game.stage : null);
    dt = (typeof dt === 'number' && dt > 0) ? dt : (1 / 60);

    // 🤼 INMOVILIZACIÓN TOTAL SI NOS TIENEN AGARRADOS:
    if (this.state === 'GRABBED') {
      // El rival nos tiene agarrados; el jugador solo puede machear teclas para intentar liberarse
      if (
        this.input.leftPressed || this.input.rightPressed ||
        this.input.upPressed || this.input.downPressed ||
        this.input.jumpPressed || this.input.attackPressed ||
        this.input.specialPressed || this.input.shieldPressed
      ) {
        this.grabEscapeTimer -= 0.08;
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y - this.height * 0.5, 2, 'impact');
        }
      }
      // Limpiar todas las teclas para no realizar saltos ni ataques al salir
      this.input.leftPressed = false;
      this.input.rightPressed = false;
      this.input.upPressed = false;
      this.input.downPressed = false;
      this.input.jumpPressed = false;
      this.input.attackPressed = false;
      this.input.specialPressed = false;
      this.input.shieldPressed = false;
      return; // ¡NO PUEDE MOVERSE, ATACAR, SALTAR NI ESQUIVAR!
    }

    // 🤼 Si estamos agarrando al oponente, la selección direccional se gestiona en _updateGrabbing
    if (this.state === 'GRABBING') {
      return;
    }

    // 🧗 Si estamos subiendo del borde, esperar a que termine la animación suave
    if (this.state === 'LEDGE_CLIMB') {
      return;
    }

    // 🧗 Handle LEDGE state recovery options:
    if (this.state === 'LEDGE') {
      // Si aún no ha transcurrido el tiempo mínimo de agarre, consumir inputs de recuperación acumulados
      if (this.ledgeHangLockTimer > 0) {
        this.input.jumpPressed = false;
        this.input.attackPressed = false;
        this.input.upPressed = false;
        this.input.downPressed = false;
        return;
      }

      // Salto de borde: [Espacio]
      if (this.input.jumpPressed) {
        this.input.jumpPressed = false;
        this.performLedgeJump();
        return;
      }
      // Ataque de borde: [Z]
      if (this.input.attackPressed) {
        this.input.attackPressed = false;
        this.performLedgeAttack();
        return;
      }
      // Subir normal: [Arriba] o inclinación intencional hacia el escenario
      const isClimbDirPressed = (this.ledgeSide === 'left' && this.input.rightPressed) ||
                                (this.ledgeSide === 'right' && this.input.leftPressed);
      if (this.input.upPressed || isClimbDirPressed) {
        this.input.upPressed = false;
        this.input.rightPressed = false;
        this.input.leftPressed = false;
        this.performLedgeClimb();
        return;
      }
      // Soltar borde: [Abajo] o inclinación intencional hacia afuera
      const isDropDirPressed = (this.ledgeSide === 'left' && this.input.leftPressed) ||
                               (this.ledgeSide === 'right' && this.input.rightPressed);
      if (this.input.downPressed || isDropDirPressed) {
        this.input.downPressed = false;
        this.input.leftPressed = false;
        this.input.rightPressed = false;
        this.dropLedge();
        return;
      }
      return;
    }

    // 0. Handle SMASH_CHARGE state (gathering energy while holding Z)
    if (this.state === 'SMASH_CHARGE') {
      this.vx *= 0.72; // Anchored to ground while charging
      this.smashChargeTimer += dt;

      const chargeRatio = Math.min(1.0, this.smashChargeTimer / (this.smashTimeToMaxCharge || 0.55));

      // Energy charge sparks & sound effect
      if (Math.random() < 0.45 && window.particleManager) {
        const sparkType = chargeRatio >= 1.0 ? 'electric' : (this.accentColor ? 'shadow' : 'normal');
        window.particleManager.spawnHitSparks(
          this.x + (Math.random() - 0.5) * 36,
          this.y - Math.random() * this.height,
          chargeRatio >= 1.0 ? 2 : 1,
          sparkType
        );
      }

      // Max charge notification (100% full power reached!)
      if (chargeRatio >= 1.0 && !this.smashMaxNotified) {
        this.smashMaxNotified = true;
        window.soundEngine && window.soundEngine.playSfx('select');
        if (window.particleManager) {
          window.particleManager.spawnRadialBurst(this.x, this.y - 20, '#facc15', 'electric', 38);
          window.particleManager.spawnFloatingText(this.x, this.y - this.height - 22, '¡CARGA MÁXIMA 100%!', '#facc15', 18);
        }
      }

      // AL SOLTAR Z o Ctrl (input.smash): Se ejecuta el ataque cargado!
      // (O si se alcanza el límite de retención de 3.0s)
      const isHoldActive = this.input.attack || this.input.smash;
      if (!isHoldActive || this.smashChargeTimer >= (this.smashMaxHoldTime || 3.0)) {
        this.releaseSmashAttack(chargeRatio);
      }
      return;
    }

    // 1. Ground Roll: While holding Shield on the ground + pressing Left or Right (i-frames / Eframes)
    if (this.isGrounded && (this.input.shield || this.state === 'SHIELD' || this.shieldTapTimer > 0)) {
      if (this.input.left || this.input.right || this.input.leftPressed || this.input.rightPressed) {
        if ((this.rollCooldown || 0) <= 0 && this.shieldBreakTimer <= 0 && this.hitstun <= 0 && this.hitstop <= 0 && this.shield >= 18) {
          const rollDir = (this.input.left || this.input.leftPressed) ? -1 : 1;
          this.input.shieldPressed = false;
          this.shieldTapTimer = 0;
          this.performRoll(rollDir);
          return;
        }
      }
    }

    // 2. Air Dodge: Pressing C (shield) while in the air (i-frames / Eframes)
    if (!this.isGrounded && (this.input.shieldPressed || this.shieldTapTimer > 0 || this.input.shield)) {
      if (!this.airDodgeUsed && this.canAct()) {
        this.input.shieldPressed = false;
        this.shieldTapTimer = 0;
        this.performAirDodge();
        return;
      }
    }

    // Shield is held rather than buffered: it cannot be used during attack recovery.
    if (this.input.shield && this.canAct()) return;
    if (!this.canAct()) return;

    // 🤼 Grab Trigger: Pressing Shift (input.grabPressed)
    if (this.input.grabPressed && this.canAct() && this.isGrounded) {
      this.input.grabPressed = false;
      this.attemptGrab();
      return;
    }

    // 💥 Ctrl + Dirección: Cargar Ataque Smash directamente manteniendo la tecla Smash (Ctrl)
    if (this.isGrounded && this.canAct() && this.input.smash) {
      let smashDir = 'side';
      if (this.input.up) {
        smashDir = 'up';
      } else if (this.input.down) {
        smashDir = 'down';
      } else if (this.input.left) {
        smashDir = 'side';
        this.facing = -1;
      } else if (this.input.right) {
        smashDir = 'side';
        this.facing = 1;
      }
      this.startSmashCharge(smashDir);
      return;
    }

    // Direction Double-Tap Detection for Running (Dash) & Charged Smash Attacks (on ground only)
    if (this.isGrounded && this.canAct()) {
      const now = performance.now() / 1000;

      const checkDirTap = (dir, isPressed) => {
        if (!isPressed) return;
        const dtSince = now - this.lastDirTap[dir];
        this.lastDirTap[dir] = now;
        if (dtSince > 0.04 && dtSince < 0.44) {
          // Double-tap confirmed!
          if (dir === 'left' || dir === 'right') {
            this.isRunning = true;
            this.runDirection = dir === 'left' ? -1 : 1;
            this.facing = this.runDirection;
            window.soundEngine && window.soundEngine.playSfx('dash');
            if (window.particleManager) {
              window.particleManager.spawnSmoke(this.x, this.y, '#cbd5e1', 7);
              window.particleManager.spawnFloatingText(this.x, this.y - this.height - 12, '¡CORRER!', '#38bdf8', 14);
            }
          }

          const smashDir = (dir === 'left' || dir === 'right') ? 'side' : dir;
          if (dir === 'left') this.facing = -1;
          if (dir === 'right') this.facing = 1;

          this.smashPendingDir = smashDir;
          this.smashWindowTimer = 0.50; // 500ms window to press and hold Z

          // If attack key (Z) is already held down: begin charging immediately!
          if (this.input.attack) {
            this.smashPendingDir = null;
            this.smashWindowTimer = 0;
            this.startSmashCharge(smashDir);
          }
        }
      };

      checkDirTap('left', this.input.leftPressed);
      checkDirTap('right', this.input.rightPressed);
      checkDirTap('up', this.input.upPressed);

      // Down double tap
      if (this.input.downPressed) {
        const dtSince = now - this.lastDirTap.down;
        this.lastDirTap.down = now;
        if (dtSince > 0.04 && dtSince < 0.44) {
          // Only drop through semi-solid if NOT holding Z or charging
          if (this.isOnSemiSolidPlatform(stage) && !this.input.attack && !this.input.attackPressed) {
            this.dropThroughPlatform();
            this.lastDirTap.down = 0;
            this.input.downPressed = false;
            return;
          }
          this.smashPendingDir = 'down';
          this.smashWindowTimer = 0.50;
          if (this.input.attack) {
            this.smashPendingDir = null;
            this.smashWindowTimer = 0;
            this.startSmashCharge('down');
          }
        }
      }
    }

    // Clear one-frame press flags
    this.input.leftPressed = false;
    this.input.rightPressed = false;
    this.input.upPressed = false;
    this.input.downPressed = false;

    // Check if Smash Attack should be initiated via holding Z during Smash Window
    if (this.isGrounded && this.canAct() && this.smashWindowTimer > 0 && this.smashPendingDir && (this.input.attackPressed || this.input.attack)) {
      this.input.attackPressed = false;
      const sDir = this.smashPendingDir;
      this.smashPendingDir = null;
      this.smashWindowTimer = 0;
      this.startSmashCharge(sDir);
      return;
    }

    // Movement (Left / Right): Walking vs Running (Dash)
    if (this.input.left && !this.input.right) {
      this.facing = -1;
      const isDash = this.isRunning && this.runDirection === -1;
      this.vx = isDash ? -this.dashSpeed : -this.walkSpeed;
      if (this.isGrounded) {
        this.state = isDash ? 'DASH' : 'WALK';
        this.anim.loop('Walk', isDash ? 1.85 : 1.25);
        if (Math.random() < (isDash ? 0.40 : 0.18) && window.particleManager) {
          window.particleManager.spawnSmoke(this.x + 8, this.y, '#cbd5e1', isDash ? 7 : 5);
        }
      }
    } else if (this.input.right && !this.input.left) {
      this.facing = 1;
      const isDash = this.isRunning && this.runDirection === 1;
      this.vx = isDash ? this.dashSpeed : this.walkSpeed;
      if (this.isGrounded) {
        this.state = isDash ? 'DASH' : 'WALK';
        this.anim.loop('Walk', isDash ? 1.85 : 1.25);
        if (Math.random() < (isDash ? 0.40 : 0.18) && window.particleManager) {
          window.particleManager.spawnSmoke(this.x - 8, this.y, '#cbd5e1', isDash ? 7 : 5);
        }
      }
    } else {
      this.isRunning = false;
      this.runDirection = 0;
      if (this.isGrounded) {
        if (this.input.down) {
          // Crouch
          this.state = 'CROUCH';
          this.anim.setAim('down');
          this.anim.loop('Idle', 0.6);
        } else {
          this.state = 'IDLE';
          this.anim.setAim(this.input.up ? 'up' : 'center');
          this.anim.loop('Idle', 1.0);
        }
      }
    }

    // Jump (Space): Short Hop on tap, Full Hop on hold
    if (this.input.jumpPressed) {
      this.input.jumpPressed = false;

      if (this.isGrounded) {
        // Ground jump
        this.vy = -this.jumpForce;
        this.isGrounded = false;
        this.isJumping = true;
        this.jumpsLeft = this.maxJumps - 1;
        this.state = 'JUMP';
        window.soundEngine.playSfx('jump');
        if (window.particleManager) {
          window.particleManager.spawnSmoke(this.x, this.y, '#ffffff', 8);
        }
      } else if (this.jumpsLeft > 0) {
        // Mid-air double jump
        this.vy = -this.doubleJumpForce;
        this.jumpsLeft--;
        this.isJumping = true;
        this.isFastFalling = false;
        window.soundEngine.playSfx('djump');
        if (window.particleManager) {
          window.particleManager.spawnSmoke(this.x, this.y, this.accentColor, 10);
        }
      }
    }

    // Fast fall (tap Down in air)
    if (!this.isGrounded && this.input.down && this.vy > 0 && !this.isFastFalling) {
      this.isFastFalling = true;
    }

    // Attacks: Z (Basic Attack)
    if (this.input.attackPressed) {
      this.input.attackPressed = false;
      this.performBasicAttack();
      return;
    }

    // Special Pokemon Moves: X (3 directional variations)
    if (this.input.specialPressed) {
      this.input.specialPressed = false;
      this.performSpecialMove();
      return;
    }
  }

  performAirDodge() {
    this.isRunning = false;
    this.runDirection = 0;
    this.state = 'AIR_DODGE';
    this.airDodgeUsed = true;
    this.invulnTimer = 0.28; // ~17 frames de invencibilidad (Eframes)
    this.actionLockTimer = 0.28; // Reducido notablemente (antes 0.38) para eliminar el lag excesivo

    // Directional drift con mayor movilidad para reposicionarse
    let driftX = 0;
    let driftY = 0;
    if (this.input.left) driftX = -6.2;
    else if (this.input.right) driftX = 6.2;
    if (this.input.up) driftY = -4.5;
    else if (this.input.down) driftY = 4.5;

    if (driftX !== 0 || driftY !== 0) {
      this.vx = driftX;
      this.vy = driftY;
    } else {
      this.vx *= 0.65; // Menor penalización de parada en esquive neutral
      this.vy *= 0.65;
    }

    this.anim.play('Hurt', { speed: 0.1 });
    window.soundEngine.playSfx('dash');
    if (window.particleManager) {
      window.particleManager.spawnSmoke(this.x, this.y, '#93c5fd', 8);
      window.particleManager.spawnFloatingText(this.x, this.y - this.height - 12, '¡ESQUIVE!', '#60a5fa', 14);
    }
  }

  performRoll(dir) {
    if (this.shield < 18) return;

    this.shield = Math.max(0, this.shield - 22);
    if (this.shield <= 0) {
      this.breakShield();
      return;
    }

    this.isRunning = false;
    this.runDirection = 0;
    this.state = 'ROLL';
    this.facing = dir;

    let rollSpeed = 25.5; // Balance Update: Aumentada velocidad de roll para mayor distancia física
    let actionLock = 0.58;
    let rollCd = 0.65;
    if (this.heldItem === 'escape-rope') {
      rollSpeed *= 1.30; // +30% distancia del roll con Cuerda Huida
      actionLock *= 0.90; // -10% lag entre esquives
      rollCd *= 0.90; // -10% cooldown entre esquives
    }

    this.vx = dir * rollSpeed;
    this.invulnTimer = 0.38; // ~23 frames de invencibilidad (Eframes)
    this.actionLockTimer = actionLock;
    this.rollCooldown = rollCd;
    this.anim.play('Walk', { speed: 2.2 });
    window.soundEngine.playSfx('dash');
    if (window.particleManager) {
      window.particleManager.spawnSmoke(this.x, this.y, '#94a3b8', 8);
      const ropeTag = this.heldItem === 'escape-rope' ? ' [Cuerda Huida +30%]' : '';
      window.particleManager.spawnFloatingText(this.x, this.y - this.height - 12, `¡ROLL! (-22 Escudo)${ropeTag}`, '#38bdf8', 14);
    }
  }

  // =========================================================================
  // 🧗 AGARRE AL BORDE & RECUPERACIÓN (Ledge Grab & Recovery)
  // =========================================================================
  grabLedge(plat, side) {
    if (this.state === 'RESPAWN' || this.state === 'LEDGE' || this.state === 'LEDGE_CLIMB' || this.invulnTimer > 0) return;
    this.state = 'LEDGE';
    this.ledgeSide = side;
    this.grabbedLedgePlat = plat;
    this.ledgeTimer = 2.5; // Hasta 2.5s colgado antes de subir automáticamente
    this.ledgeHangLockTimer = 0.35; // 350ms de agarre visible obligatorio (no teleport)
    this.invulnTimer = 1.0; // 1 segundo de invulnerabilidad
    this.actionLockTimer = 0.08;
    this.hitstun = 0;
    this.hitstop = 0;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = false;
    this.isFastFalling = false;
    this.jumpsLeft = this.maxJumps;
    this.upSpecialUsed = false;
    this.airDodgeUsed = false;

    // Limpiar inputs residuales de la recuperación en el aire
    this.input.up = false;
    this.input.down = false;
    this.input.left = false;
    this.input.right = false;
    this.input.jump = false;
    this.input.attack = false;
    this.input.special = false;
    this.input.upPressed = false;
    this.input.downPressed = false;
    this.input.leftPressed = false;
    this.input.rightPressed = false;
    this.input.jumpPressed = false;
    this.input.attackPressed = false;
    this.input.specialPressed = false;

    // Posicionamiento preciso: manos sujetando la esquina del borde
    if (side === 'left') {
      this.x = plat.x - 8;
      this.facing = 1;
    } else {
      this.x = plat.x + plat.width + 8;
      this.facing = -1;
    }
    this.y = plat.y + 22;

    this.anim.setFacing(this.facing);
    this.anim.loop('Idle', 0.4);

    if (window.soundEngine) {
      window.soundEngine.playSfx('ledge_grab');
    }
    if (window.particleManager) {
      window.particleManager.spawnHitSparks(this.x, plat.y, 4, 'electric');
      window.particleManager.spawnFloatingText(this.x, this.y - this.height - 14, '¡AGARRE AL BORDE!', '#38bdf8', 16);
    }
  }

  performLedgeJump() {
    this.state = 'IDLE';
    this.vy = -this.jumpForce * 0.95;
    this.vx = this.facing * 4.2;
    this.isGrounded = false;
    this.invulnTimer = 0.22;
    this.ledgeCooldown = 1.0;
    this.jumpsLeft = Math.max(0, this.maxJumps - 1);
    this.grabbedLedgePlat = null;

    if (window.soundEngine) {
      window.soundEngine.playSfx('jump');
    }
    if (window.particleManager) {
      window.particleManager.spawnSmoke(this.x, this.y, '#ffffff', 5);
      window.particleManager.spawnFloatingText(this.x, this.y - this.height - 10, 'Salto de Borde [Espacio]', '#38bdf8', 13);
    }
  }

  performLedgeAttack() {
    const plat = this.grabbedLedgePlat;
    if (plat) {
      this.x = this.ledgeSide === 'left' ? plat.x + 18 : plat.x + plat.width - 18;
      this.y = plat.y;
    } else {
      this.x += this.facing * 24;
    }
    this.isGrounded = true;
    this.vx = this.facing * 2.8;
    this.vy = 0;
    this.invulnTimer = 0.28;
    this.ledgeCooldown = 1.2;
    this.grabbedLedgePlat = null;

    const ledgeAtk = {
      name: 'Ataque de Borde (Ledge Attack)',
      anim: 'Attack',
      animSpeed: 1.45,
      hitboxStart: 2,
      hitboxEnd: 9,
      offsetX: 24,
      offsetY: 20,
      radius: 34,
      damage: 8.5,
      baseKnockback: 22,
      knockbackScaling: 0.95,
      angle: 40,
      type: 'normal',
      hitlag: 6
    };

    this.state = 'ATTACK';
    this.currentAttack = ledgeAtk;
    this.attackFrame = 0;
    this.hasHitOpponent = false;
    this.attackCooldown = 0.25;
    this.anim.setAim('center');
    this.anim.play('Attack', { speed: 1.45 }, () => {
      this.state = 'IDLE';
      this.currentAttack = null;
    });

    if (window.soundEngine) {
      window.soundEngine.playSfx('dash');
    }
    if (window.particleManager) {
      window.particleManager.spawnSlash(this.x + this.facing * 18, this.y - 20, this.facing);
      window.particleManager.spawnFloatingText(this.x, this.y - this.height - 12, 'Ataque de Borde [Z]', '#f59e0b', 14);
    }
  }

  performLedgeClimb() {
    this.state = 'LEDGE_CLIMB';
    this.climbTimer = 0.22;
    this.climbStartX = this.x;
    this.climbStartY = this.y;
    const plat = this.grabbedLedgePlat;
    if (plat) {
      this.climbTargetX = this.ledgeSide === 'left' ? plat.x + 22 : plat.x + plat.width - 22;
      this.climbTargetY = plat.y;
    } else {
      this.climbTargetX = this.x + this.facing * 30;
      this.climbTargetY = this.y - 22;
    }
    this.invulnTimer = 0.35;
    this.actionLockTimer = 0.22;
    this.anim.play('Walk', { speed: 1.6 });

    if (window.soundEngine) {
      window.soundEngine.playSfx('dash');
    }
    if (window.particleManager) {
      window.particleManager.spawnSmoke(this.x, this.y, '#ffffff', 5);
      window.particleManager.spawnFloatingText(this.x, this.y - this.height - 10, 'Subir Borde [Arriba]', '#10b981', 13);
    }
  }

  dropLedge() {
    this.state = 'IDLE';
    this.isGrounded = false;
    this.vy = 2.5;
    this.vx = -this.facing * 2.0;
    this.invulnTimer = 0;
    this.ledgeCooldown = 0.7;
    this.grabbedLedgePlat = null;
    if (window.particleManager) {
      window.particleManager.spawnSmoke(this.x, this.y, '#94a3b8', 4);
    }
  }

  useActiveItem() {
    if (this.state === 'RESPAWN' || this.state === 'HURT') return false;
    if (this.itemCooldown > 0) {
      if (window.particleManager) {
        window.particleManager.spawnFloatingText(this.x, this.y - this.height - 14, `¡En CD! (${Math.ceil(this.itemCooldown)}s)`, '#f87171', 13);
      }
      return false;
    }
    if (this.itemCharges <= 0) {
      if (window.particleManager) {
        window.particleManager.spawnFloatingText(this.x, this.y - this.height - 14, '¡Sin cargas de poción!', '#94a3b8', 13);
      }
      return false;
    }

    let heal = 0;
    let cd = 0;
    let itemName = '';
    const curPercent = this.percent;

    // Nerf de Pociones: Cura % del daño actual acumulado (salvo HiperPoción que cura 100 fijo)
    if (this.heldItem === 'potion') {
      heal = Math.max(0.1, parseFloat((curPercent * 0.20).toFixed(1)));
      cd = 15.0;
      itemName = 'Poción (20% actual)';
    } else if (this.heldItem === 'super-potion') {
      heal = Math.max(0.1, parseFloat((curPercent * 0.50).toFixed(1)));
      cd = 40.0;
      itemName = 'SuperPoción (50% actual)';
    } else if (this.heldItem === 'hyper-potion') {
      heal = 100;
      cd = 0;
      itemName = 'HiperPoción';
    } else {
      return false;
    }

    this.itemCharges--;
    this.itemCooldown = cd;

    if (this.minunDead && this.partner) {
      this.partner.percent = Math.max(0, parseFloat((this.partner.percent - heal).toFixed(1)));
    } else {
      this.percent = Math.max(0, parseFloat((this.percent - heal).toFixed(1)));
      if (this.partner) {
        this.partner.percent = Math.max(0, parseFloat((this.partner.percent - heal).toFixed(1)));
      }
    }

    window.soundEngine && window.soundEngine.playSfx('select');
    if (window.particleManager) {
      window.particleManager.spawnRadialBurst(this.x, this.y - 20, '#10b981', 'normal', 36);
      window.particleManager.spawnFloatingText(
        this.x,
        this.y - this.height - 20,
        `-${heal}% [${itemName}] (${this.itemCharges} rest.)`,
        '#10b981',
        17
      );
    }
    return true;
  }

  onElimination() {
    if (this.heldItem === 'oran-berry' && this.oranBerryUsesLeft > 0) {
      this.oranBerryUsesLeft--;
      const heal = 20;
      this.percent = Math.max(0, parseFloat((this.percent - heal).toFixed(1)));
      if (this.partner) {
        this.partner.percent = Math.max(0, parseFloat((this.partner.percent - heal).toFixed(1)));
      }
      window.soundEngine && window.soundEngine.playSfx('select');
      if (window.particleManager) {
        window.particleManager.spawnRadialBurst(this.x, this.y - 20, '#fb923c', 'normal', 36);
        window.particleManager.spawnFloatingText(
          this.x,
          this.y - this.height - 24,
          `-20% [Baya Aranja] (${this.oranBerryUsesLeft} rest.)`,
          '#fb923c',
          18
        );
      }
    }
  }

  /**
   * Universal item attack restriction validator
   * Validates Choice Specs (blocks Z/Smash) and Choice Band (blocks X).
   */
  checkItemCanUseAttack(type = 'basic') {
    if (type === 'basic' || type === 'smash') {
      if (this.heldItem === 'choice-specs') {
        window.soundEngine && window.soundEngine.playSfx('select');
        if (window.particleManager) {
          window.particleManager.spawnFloatingText(this.x, this.y - this.height - 10, '¡Gafas Elección: Solo Ataques X!', '#8b5cf6', 15);
        }
        return false;
      }
    } else if (type === 'special') {
      if (this.heldItem === 'choice-band') {
        window.soundEngine && window.soundEngine.playSfx('select');
        if (window.particleManager) {
          window.particleManager.spawnFloatingText(this.x, this.y - this.height - 10, '¡Cinta Elección: Solo Ataques Z!', '#3b82f6', 15);
        }
        return false;
      }
    }
    return true;
  }

  /**
   * Universal item offensive modifier calculator
   * Correctly scales melee, smash, special and projectile hits for all current and future Pokémon.
   */
  getModifiedHitbox(hitbox, isProjectile = false) {
    if (!hitbox) return hitbox;

    const isSpecial = hitbox.isSpecial !== undefined
      ? hitbox.isSpecial
      : (this.state === 'SPECIAL' || isProjectile);

    const isBasic = hitbox.isBasic !== undefined
      ? hitbox.isBasic
      : (this.state === 'ATTACK' || hitbox.isSmash || !isSpecial);

    let finalHitbox = {
      ...hitbox,
      isSpecial,
      isBasic,
      isProjectile
    };

    // Aumento MUY ligero del pushback/baseKnockback en ataques básicos [Z] no-Smash (+15%)
    // para que en porcentajes bajos no sea tan fácil spamearlos en bucle de combo infinito
    if (isBasic && !finalHitbox.isSmash) {
      finalHitbox.baseKnockback = Math.round((finalHitbox.baseKnockback || 10) * 1.15);
    }

    // 1. Choice Band: +50% de daño y +25% knockback en ataques básicos [Z] y Smash
    if (this.heldItem === 'choice-band' && isBasic) {
      finalHitbox.damage = Math.round(finalHitbox.damage * 1.50);
      finalHitbox.baseKnockback = Math.round((finalHitbox.baseKnockback || 12) * 1.25);
    }

    // 2. Choice Specs: +50% de daño y +25% knockback en movimientos especiales [X] (cuerpo a cuerpo Y proyectiles!)
    if (this.heldItem === 'choice-specs' && isSpecial) {
      finalHitbox.damage = Math.round(finalHitbox.damage * 1.50);
      finalHitbox.baseKnockback = Math.round((finalHitbox.baseKnockback || 12) * 1.25);
    }

    // 3. Life Orb: +25% de daño en TODOS los ataques, con 1.5% de retroceso al golpear
    if (this.heldItem === 'life-orb') {
      finalHitbox.damage = Math.round(finalHitbox.damage * 1.25);
      if (this.minunDead && this.partner) {
        this.partner.percent = Math.min(999, parseFloat((this.partner.percent + 1.5).toFixed(1)));
      } else {
        this.percent = Math.min(999, parseFloat((this.percent + 1.5).toFixed(1)));
      }
      if (window.particleManager) {
        window.particleManager.spawnFloatingText(this.x, this.y - this.height - 10, '+1.5% [Vida Esfera]', '#ef4444', 12);
      }
    }

    // 4. Shell Bell: Recupera 1.5% de daño SOLO con ataques básicos [Z]
    if (this.heldItem === 'shell-bell' && isBasic) {
      if (this.minunDead && this.partner) {
        this.partner.percent = Math.max(0, parseFloat((this.partner.percent - 1.5).toFixed(1)));
      } else {
        this.percent = Math.max(0, parseFloat((this.percent - 1.5).toFixed(1)));
      }
      if (window.particleManager) {
        window.particleManager.spawnFloatingText(this.x, this.y - this.height - 10, '-1.5% [Cascabel Concha]', '#0284c7', 12);
      }
    }

    return finalHitbox;
  }

  performBasicAttack(forcedDir = null, forcedIsAir = null) {
    if (!forcedDir && (this.attackCooldown > 0 || this.actionLockTimer > 0)) return;
    if (!this.checkItemCanUseAttack('basic')) return;

    this.isRunning = false;
    this.runDirection = 0;

    let dir = forcedDir;
    if (!dir) {
      if (this.input.up) dir = 'up';
      else if (this.input.down) dir = 'down';
      else if (this.input.left) { dir = 'side'; this.facing = -1; }
      else if (this.input.right) { dir = 'side'; this.facing = 1; }
      else dir = 'neutral';
    }

    const isAir = (forcedIsAir !== null && forcedIsAir !== undefined) ? forcedIsAir : !this.isGrounded;
    const attackDef = this.getBasicAttackDef(dir, isAir) || this.getUniversalBasicAttackDef(dir, isAir);
    if (!attackDef) return;

    this.state = 'ATTACK';
    this.currentAttack = attackDef;
    this.attackFrame = 0;
    this.hasHitOpponent = false;
    this.attackCooldown = 0.20; // Nerf a ataques Z: 0.20s de lag/cooldown entre ataques

    // Aim direction for sprite (Row 4 for Up, Row 0 for Down, Row 2/6 for side/neutral)
    if (dir === 'up') this.anim.setAim('up');
    else if (dir === 'down') this.anim.setAim('down');
    else this.anim.setAim('center');

    // Trigger visual melee slash animation on screen
    if (window.particleManager) {
      const slashColor = attackDef.slashColor || this.accentColor || '#ffd700';
      const slashType = attackDef.type || 'normal';
      const slashRadius = attackDef.radius ? attackDef.radius * 1.15 : 34;
      window.particleManager.spawnMeleeSlash(this.x, this.y, dir, this.facing, slashColor, slashType, slashRadius, isAir);
    }

    // Snappy animation speed with 0.20s end lag between attacks
    const animSpd = (attackDef.animSpeed || 1.25) * 1.30;
    const endLag = 0.20; // Nerf: pequeño lag de 0.2 segundos entre ataque

    this.anim.play(attackDef.anim || 'Attack', { speed: animSpd }, () => {
      this.state = 'IDLE';
      this.currentAttack = null;
      this.actionLockTimer = Math.max(this.actionLockTimer, endLag);
      this.attackCooldown = Math.max(this.attackCooldown, 0.20);
      this.anim.setAim('center');
    });

    if (attackDef.onStart) attackDef.onStart(this);
  }

  performSpecialMove(forcedDir = null) {
    if (!forcedDir && (this.specialCooldown > 0 || this.actionLockTimer > 0)) return;
    if (!this.checkItemCanUseAttack('special')) return;

    // 4 distinct moves for X: Up, Down, Side (Left/Right), and Neutral (NO direction)
    let dir = forcedDir;
    if (!dir) {
      if (this.input.up) dir = 'up';
      else if (this.input.down) dir = 'down';
      else if (this.input.left) { dir = 'side'; this.facing = -1; }
      else if (this.input.right) { dir = 'side'; this.facing = 1; }
      else dir = 'neutral'; // Neutral X: strictly when no arrow key is held!
    }

    if (dir === 'up' && this.upSpecialUsed && !forcedDir) return;

    const moveDef = this.getSpecialMoveDef(dir);
    if (!moveDef) {
      this.state = 'IDLE';
      return;
    }
    const wasRunning = this.isRunning || (Math.abs(this.vx) > this.walkSpeed * 1.05);
    const wasWalking = !wasRunning && ((this.input.left || this.input.right) || Math.abs(this.vx) > 0.4);
    this.wasRunningOnAttack = wasRunning;
    this.wasWalkingOnAttack = wasWalking;
    this.isRunning = false;
    this.runDirection = 0;
    this.state = 'SPECIAL';
    this.currentAttack = moveDef;
    this.attackFrame = 0;
    this.hasHitOpponent = false;
    this.specialCooldown = moveDef.cooldown ?? 0.55;
    this.specialChargeTimer = 0;
    if (dir === 'up') this.upSpecialUsed = true;

    if (dir === 'up') this.anim.setAim('up');
    else if (dir === 'down') this.anim.setAim('down');
    else this.anim.setAim('center');

    if (moveDef.canCharge || moveDef.holdToCharge) {
      this.specialChargeTimer = 0;
      this.specialChargeNotified = false;
      this.specialIsCharging = true;
      if (moveDef.onStart) moveDef.onStart(this);
    } else if (moveDef.quickRecover) {
      this.anim.play(moveDef.anim || 'Shoot', { speed: moveDef.animSpeed || 3.0 });
      this.state = 'IDLE';
      this.currentAttack = null;
      this.actionLockTimer = Math.max(this.actionLockTimer, moveDef.endLag ?? 0.02);
      if (moveDef.cooldown !== undefined) {
        this.specialCooldown = Math.max(this.specialCooldown, moveDef.cooldown);
      }
      this.anim.setAim('center');
      if (moveDef.onStart) moveDef.onStart(this);
    } else {
      this.anim.play(moveDef.anim || 'Shoot', { speed: moveDef.animSpeed || 1.1 }, () => {
        this.state = 'IDLE';
        this.currentAttack = null;
        this.actionLockTimer = Math.max(this.actionLockTimer, moveDef.endLag ?? 0.24);
        if (moveDef.cooldown !== undefined) {
          this.specialCooldown = Math.max(this.specialCooldown, moveDef.cooldown);
        }
        this.anim.setAim('center');
      });
      if (moveDef.onStart) moveDef.onStart(this);
    }
  }

  _updateAttack(dt, opponent) {
    if (!this.currentAttack) return;
    this.attackFrame += dt * 60;
    const atk = this.currentAttack;

    // Hold-to-charge specials (e.g., Bulbasaur Down+X, Gengar Neutral+X)
    if ((atk.canCharge || atk.holdToCharge) && this.specialIsCharging) {
      const maxCharge = atk.maxCharge || 0.85;

      // Check if move supports storing charge at maximum by pressing Left or Right (Gengar Bola Sombra)
      if (atk.canStoreCharge && this.specialChargeTimer >= maxCharge) {
        if (this.input.leftPressed || this.input.rightPressed || this.input.left || this.input.right) {
          if (atk.onStoreCharge) {
            atk.onStoreCharge(this);
          }
          this.specialIsCharging = false;
          this.specialChargeTimer = 0;
          this.specialChargeNotified = false;
          this.specialChargeMaxNotified = false;
          this.state = 'IDLE';
          this.currentAttack = null;
          this.anim.play('Idle', { speed: 1.0 });
          this.actionLockTimer = 0.08;
          return;
        }
      }

      // Allow aiming Left / Right while holding (unless canStoreCharge handles it)
      if (!atk.canStoreCharge) {
        if (this.input.left && !this.input.right) this.facing = -1;
        else if (this.input.right && !this.input.left) this.facing = 1;
      }

      // While X is held
      const allowHoldBeyondMax = atk.allowHoldBeyondMax || atk.canStoreCharge;
      const keepHolding = this.input.special && (allowHoldBeyondMax ? true : this.specialChargeTimer < maxCharge);

      if (keepHolding) {
        if (this.specialChargeTimer < maxCharge) {
          this.specialChargeTimer = Math.min(maxCharge, this.specialChargeTimer + dt);
        }
        this.vx *= 0.72; // Anchored to ground while charging

        // Once held longer than 0.10s (confirmed hold, not a quick tap):
        if (this.specialChargeTimer >= 0.10) {
          if (!this.specialChargeNotified) {
            this.specialChargeNotified = true;
            this.anim.loop(atk.chargeAnim || 'Charge', 1.0);
            window.soundEngine && window.soundEngine.playSfx('charge');
            if (atk.chargeBannerText && window.particleManager) {
              window.particleManager.spawnFloatingText(
                this.x,
                this.y - this.height - 18,
                atk.chargeBannerText,
                atk.chargeBannerColor || '#10b981',
                15
              );
            }
          }

          if (this.specialChargeTimer >= maxCharge && !this.specialChargeMaxNotified) {
            this.specialChargeMaxNotified = true;
            if (atk.onMaxCharge) atk.onMaxCharge(this);
          }

          if (atk.onCharge) atk.onCharge(this, this.specialChargeTimer, maxCharge);
        }
        return;
      }

      // X was released (AL SOLTAR X) OR maxCharge reached!
      this.specialIsCharging = false;

      // If released very quickly (< 0.10s), it was a quick tap -> normal attack with chargeRatio = 0!
      const chargeRatio = this.specialChargeTimer < 0.10
        ? 0
        : Math.min(1.0, (this.specialChargeTimer - 0.10) / (maxCharge - 0.10));

      this.specialChargeTimer = 0;
      this.specialChargeNotified = false;
      this.specialChargeMaxNotified = false;

      const fireHandler = atk.onFire || atk.onRelease;
      if (fireHandler) fireHandler(this, chargeRatio);

      if (atk.quickRecover) {
        this.anim.play(atk.anim || 'Shoot', { speed: atk.animSpeed || 3.2 });
        this.state = 'IDLE';
        this.currentAttack = null;
        this.actionLockTimer = Math.max(this.actionLockTimer, atk.endLag ?? 0.02);
        if (atk.cooldown !== undefined) {
          this.specialCooldown = Math.max(this.specialCooldown, atk.cooldown);
        }
        this.anim.setAim('center');
        return;
      }

      this.anim.play(atk.anim || 'Shoot', { speed: atk.animSpeed || 1.25 }, () => {
        this.state = 'IDLE';
        this.currentAttack = null;
        this.actionLockTimer = Math.max(this.actionLockTimer, atk.endLag ?? 0.18);
        if (atk.cooldown !== undefined) {
          this.specialCooldown = Math.max(this.specialCooldown, atk.cooldown);
        }
        this.anim.setAim('center');
      });
      return;
    }

    // Execute move frame events
    if (atk.onUpdate) atk.onUpdate(this, this.attackFrame);

    // Active hitbox window
    if (
      this.attackFrame >= atk.hitboxStart &&
      this.attackFrame <= atk.hitboxEnd &&
      !this.hasHitOpponent
    ) {
      const ox = atk.offsetX !== undefined ? atk.offsetX : 28;
      const oy = atk.offsetY !== undefined ? atk.offsetY : 24;
      const hx = this.x + ox * this.facing;
      const hy = this.y - oy;
      const hitbox = {
        x: hx,
        y: hy,
        radius: atk.radius || 24,
        damage: atk.damage || 8,
        baseKnockback: atk.baseKnockback || 20,
        knockbackScaling: atk.knockbackScaling || 1.0,
        angle: atk.angle !== undefined ? atk.angle : 45,
        type: atk.type || 'normal',
        hitlag: atk.hitlag || 6
      };

      if (opponent && opponent.state !== 'RESPAWN' && opponent.invulnTimer <= 0) {
        const hurtboxes = opponent.getHurtboxes
          ? opponent.getHurtboxes()
          : [{ x: opponent.x, y: opponent.y - opponent.height * 0.5, radius: opponent.hurtboxRadius, target: null }];

        for (const hurtbox of hurtboxes) {
          if (window.physicsEngine.checkHitboxCollision(hitbox, hurtbox)) {
            const finalHitbox = this.getModifiedHitbox(hitbox, false);
            opponent.takeHit(finalHitbox, this, hurtbox.target);
            this.hasHitOpponent = true;
            this.hitstop = finalHitbox.hitlag; // Attacker hitfreeze

            // Combo hit cancel: connecting a Z attack eliminates action lock and minimizes cooldown!
            if (this.state === 'ATTACK') {
              this.attackCooldown = 0.05;
              this.actionLockTimer = 0;
            }

            if (atk.onHit) atk.onHit(this, opponent);
            break;
          }
        }
      }
    }
  }

  takeHit(hitbox, attacker, target = null) {
    if (this.invulnTimer > 0 || this.state === 'RESPAWN' || this.state === 'ROLL' || this.state === 'AIR_DODGE') return;

    // 🛡️ Parry Perfecto (Perfect Shield - Super Smash Bros Ultimate)
    // Si sueltas el escudo en los primeros 3 frames de recibir un ataque:
    // sonido de campana metálica, ojos brillantes, 0 daño de escudo y el rival sufre 5 frames de congelación.
    if (this.parryWindowTimer > 0) {
      this.parryWindowTimer = 0;
      this.parryFlashTimer = 0.50; // Duración del destello dorado y ojos brillantes
      this.invulnTimer = 0.20;
      this.hitstop = 0;
      this.hitstun = 0;
      this.state = 'IDLE';
      this.actionLockTimer = 0;

      // El rival atacante sufre 5 frames de congelación (freeze / stun) permitiendo contraataque inmediato
      if (attacker) {
        attacker.hitstop = Math.max(attacker.hitstop || 0, 5);
      }

      if (window.soundEngine) {
        window.soundEngine.playSfx('parry_shield');
      }

      if (window.particleManager) {
        window.particleManager.spawnRadialBurst(this.x, this.y - this.height * 0.5, '#fef08a', 'electric', 42);
        window.particleManager.spawnHitSparks(this.x, this.y - this.height * 0.5, 8, 'electric');
        window.particleManager.spawnFloatingText(this.x, this.y - this.height - 24, '¡PERFECT SHIELD!', '#facc15', 20);
      }
      return;
    }

    if (this.state === 'SHIELD') {
      let shieldDamage = (hitbox.damage || 5) * 5.5 + (hitbox.baseKnockback || 0) * 0.45;
      if (this.heldItem === 'escape-rope') {
        shieldDamage *= 1.30; // Cuerda Huida: Reduce la eficacia del escudo un 30%
      }
      this.shield = Math.max(0, this.shield - shieldDamage);
      this.hitstop = Math.max(2, Math.floor((hitbox.hitlag || 6) * 0.55));
      this.vx += attacker ? attacker.facing * 0.55 : 0;
      window.soundEngine.playSfx('hit_light');
      if (window.particleManager) {
        window.particleManager.spawnHitSparks(this.x, this.y - this.height * 0.5, 3, 'normal');
      }
      if (this.shield <= 0) this.breakShield();
      return;
    }

    // Apply defensive item modifiers
    let dmg = hitbox.damage || 5;

    // Assault Vest: reduces special / projectile damage by 25%
    if (this.heldItem === 'assault-vest') {
      const isSpecialOrProj = hitbox.isSpecial || hitbox.isProjectile || (attacker && attacker.state === 'SPECIAL') || (hitbox.type && hitbox.type !== 'normal');
      if (isSpecialOrProj) {
        dmg = Math.max(1, Math.round(dmg * 0.75));
      }
    }

    // Focus Band: 20% chance to endure hit and reduce 75% damage & knockback
    let focusBandTriggered = false;
    if (this.heldItem === 'focus-band' && Math.random() < 0.20) {
      focusBandTriggered = true;
      dmg = Math.max(1, Math.round(dmg * 0.25));
      if (window.particleManager) {
        window.particleManager.spawnFloatingText(this.x, this.y - this.height - 18, '¡Cinta Focus aguantó! (-75%)', '#d97706', 16);
      }
    }

    // Rocky Helmet: reflect 4% damage back to close-range melee attacker
    if (this.heldItem === 'rocky-helmet' && attacker && !hitbox.isProjectile) {
      const distToAttacker = Math.hypot(attacker.x - this.x, attacker.y - this.y);
      if (distToAttacker < 75) {
        attacker.percent = Math.min(999, attacker.percent + 4);
        window.soundEngine.playSfx('hit_light');
        if (window.particleManager) {
          window.particleManager.spawnFloatingText(attacker.x, attacker.y - attacker.height - 10, '+4% [Casco Dentado]', '#ea580c', 15);
          window.particleManager.spawnHitSparks(attacker.x, attacker.y - attacker.height * 0.5, 4, 'normal');
        }
      }
    }

    this.percent = Math.min(this.percent + dmg, 999);
    this.lastAttacker = attacker;

    // Wakes up from sleep on taking damage!
    if (this.statuses && this.statuses.sleep && this.statuses.sleep.active) {
      this.statuses.sleep.active = false;
      this.statuses.sleep.timer = 0;
      if (window.particleManager) {
        window.particleManager.spawnFloatingText(this.x, this.y - this.height - 16, '¡DESPERTÓ!', '#fbbf24', 15);
      }
    }

    // Play impact sound & particles
    const sfxName = dmg > 10 ? 'hit_heavy' : dmg > 6 ? 'hit_medium' : 'hit_light';
    window.soundEngine.playSfx(sfxName);
    if (hitbox.type === 'electric') window.soundEngine.playSfx('shock');
    if (hitbox.type === 'poison') window.soundEngine.playSfx('poison');
    if (hitbox.type === 'shadow') window.soundEngine.playSfx('shadow');

    if (window.particleManager) {
      window.particleManager.spawnHitSparks(this.x, this.y - this.height * 0.5, dmg, hitbox.type);
      window.particleManager.spawnFloatingText(this.x, this.y - this.height - 10, `+${dmg}%`, '#ff4444', 18);
    }

    // Status effect infliction on successful unshielded hit
    if (hitbox.type === 'poison') {
      this.applyStatus('poison', hitbox.poisonDuration || 5.0);
    }

    // Freeze frames (hitlag)
    this.hitstop = hitbox.hitlag || 6;
    this.state = 'HURT';
    this.isRunning = false;
    this.runDirection = 0;
    this.smashChargeTimer = 0;
    this.smashPendingDir = null;
    this.specialChargeTimer = 0;
    this.specialIsCharging = false;
    this.specialChargeNotified = false;
    this.currentAttack = null;

    // Calculate launch knockback
    let kbSpeed = window.physicsEngine.calculateKnockback(
      this.percent,
      dmg,
      this.weight,
      hitbox.knockbackScaling,
      hitbox.baseKnockback
    );

    if (focusBandTriggered) {
      kbSpeed *= 0.25;
    }

    // Focus Sash: Survives fatal launch once per life
    if (this.heldItem === 'focus-sash' && this.focusSashActive && kbSpeed > 28) {
      this.focusSashActive = false;
      kbSpeed = 12;
      if (window.particleManager) {
        window.particleManager.spawnFloatingText(this.x, this.y - this.height - 20, '¡Banda Focus salvó!', '#f59e0b', 18);
        window.particleManager.spawnHitSparks(this.x, this.y - this.height * 0.5, 10, 'normal');
      }
    }

    // Apply launch velocity with DI
    const diX = this.input.left ? -1 : this.input.right ? 1 : 0;
    const diY = this.input.up ? -1 : this.input.down ? 1 : 0;
    window.physicsEngine.launch(this, hitbox.angle, kbSpeed, attacker.facing, diX, diY);

    // Play hurt animation
    this.anim.play('Hurt', { speed: 1.0 });

    // Combo tracker
    if (attacker && window.game) {
      window.game.registerHit(attacker, this, dmg);
    }

    // 🌐 Online Hit Synchronization: Si golpeamos al rival online en nuestra pantalla,
    // notificamos inmediatamente a OnlineManager para replicar el impacto autoritativo en su máquina
    if (window.game && window.game.isOnlineMatch && window.game.onlineManager && this === window.game.dummy) {
      window.game.onlineManager.recordRivalHit({
        hitId: Date.now() + Math.random(),
        damage: dmg,
        totalPercent: this.percent,
        knockbackX: Math.round(this.vx * 10) / 10,
        knockbackY: Math.round(this.vy * 10) / 10,
        hitstun: Math.round((this.hitstun || 0.25) * 100) / 100,
        hitlag: this.hitstop || 6,
        sfx: sfxName,
        hitType: hitbox.type || 'normal'
      });
    }
  }

  onBlastZoneKO(stage) {
    if (this.state === 'RESPAWN') return;

    window.soundEngine.playSfx('blast_ko');
    if (window.particleManager) {
      window.particleManager.spawnBlastKO(this.x, this.y, this.color);
    }

    this.stocks--;
    this.percent = 0;
    this.vx = 0;
    this.vy = 0;
    this.hitstun = 0;
    this.hitstop = 0;
    this.actionLockTimer = 0;
    this.shieldBreakTimer = 0;
    this.shieldTapTimer = 0;
    this.shield = this.maxShield;
    this.upSpecialUsed = false;
    this.currentAttack = null;
    this.attackFrame = 0;
    this.smashChargeTimer = 0;
    this.smashPendingDir = null;
    this.specialChargeTimer = 0;
    this.specialIsCharging = false;
    this.specialChargeNotified = false;
    this.specialChargeMaxNotified = false;
    this.shadowBallStored = false;
    this.shadowBallStoreTimer = 0;
    this.clearStatuses();
    this.focusSashActive = true;
    this.balloonPopped = false;

    // SMASH BLAST ZONE KO: Sacar de la pantalla completamente durante la explosión
    this.state = 'RESPAWN';
    this.respawnTimer = 2.0; // 0.8s fuera de pantalla + 1.2s en la plataforma de reaparición
    this.respawnPlatformMaterialized = false;
    this.respawnStageX = stage.respawnX;
    this.respawnStageY = stage.respawnY;

    // Off-screen during initial blast
    this.x = -9999;
    this.y = -9999;
    this.isGrounded = false;

    if (window.game) {
      window.game.onFighterKO(this);
    }
  }

  draw(ctx, opts = {}) {
    // Flickering invulnerability effect after respawn
    if (this.invulnTimer > 0 && Math.floor(performance.now() / 60) % 2 === 0) {
      return;
    }

    // Floating Smash Revival Platform
    if (this.state === 'RESPAWN' && this.x > -500) {
      ctx.save();
      const pPulse = Math.sin(performance.now() * 0.008) * 3;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.38)';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + 4, 38 + pPulse, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + 4, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }


    // Draw active projectiles
    for (const proj of this.projectiles) {
      if (proj.draw) proj.draw(ctx);
    }

    // Ditto Match (Mismo Pokémon): Dibujar outline luminoso y tag P1 distintivo para el jugador
    const isDittoMatch = (opts && opts.isDittoMatch !== undefined)
      ? opts.isDittoMatch
      : (window.game && window.game.playerDex === window.game.dummyDex);

    if (this.isPlayer && isDittoMatch) {
      ctx.save();
      // P1 Inverted Triangle Indicator above character
      const bounce = Math.sin(performance.now() * 0.008) * 3;
      const tagY = this.y - this.height - 24 + bounce;
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(this.x, tagY);
      ctx.lineTo(this.x - 6, tagY - 8);
      ctx.lineTo(this.x + 6, tagY - 8);
      ctx.closePath();
      ctx.fill();

      // "P1" Badge
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('P1', this.x, tagY - 10);
      ctx.restore();
    }

    // Draw sprite using SpriteAnimator (efecto blanco durante el hitstun alto)
    const isHitFlashing = this.hitstop > 0 || (this.state === 'HURT' && this.hitstun > 7);

    // If Ditto Match: Draw a luminous cyan outline around P1 sprite
    if (this.isPlayer && isDittoMatch && !isHitFlashing) {
      ctx.save();
      ctx.globalAlpha = 0.75;
      this.anim.draw(ctx, this.x - 1.5, this.y, { flash: true });
      this.anim.draw(ctx, this.x + 1.5, this.y, { flash: true });
      this.anim.draw(ctx, this.x, this.y - 1.5, { flash: true });
      this.anim.draw(ctx, this.x, this.y + 1.5, { flash: true });
      ctx.restore();
    }

    this.anim.draw(ctx, this.x, this.y, { flash: isHitFlashing });

    // Dynamic Environmental Lighting on Characters (Luz ambiental con fade suave cinematográfico)
    if (this.lightFadeAlpha > 0.008) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const lr = Math.round(this.lightFadeR || 250);
      const lg = Math.round(this.lightFadeG || 204);
      const lb = Math.round(this.lightFadeB || 21);
      const lightGrad = ctx.createRadialGradient(
        this.x,
        this.y - this.height * 0.5,
        4,
        this.x,
        this.y - this.height * 0.5,
        this.height * 0.85
      );
      lightGrad.addColorStop(0, `rgba(${lr}, ${lg}, ${lb}, ${(this.lightFadeAlpha * 0.85).toFixed(3)})`);
      lightGrad.addColorStop(0.55, `rgba(${lr}, ${lg}, ${lb}, ${(this.lightFadeAlpha * 0.35).toFixed(3)})`);
      lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.height * 0.5, this.height * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (this.state === 'SHIELD') {
      const ratio = this.shield / this.maxShield;
      ctx.save();
      ctx.globalAlpha = 0.18 + ratio * 0.18;
      ctx.strokeStyle = ratio > 0.25 ? '#60a5fa' : '#f87171';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.height * 0.5, 31 + ratio * 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Visual Charging Aura during SMASH_CHARGE
    if (this.state === 'SMASH_CHARGE') {
      const ratio = Math.min(1.0, this.smashChargeTimer / (this.smashTimeToMaxCharge || 0.55));
      ctx.save();
      const pulse = Math.sin(performance.now() * 0.02) * 3;
      const auraRadius = 26 + ratio * 14 + pulse;
      ctx.strokeStyle = this.accentColor || '#facc15';
      ctx.lineWidth = 2.5 + ratio * 3.5;
      ctx.shadowColor = this.accentColor || '#facc15';
      ctx.shadowBlur = 12 + ratio * 18;
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.height * 0.45, auraRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Energy percentage badge above character
      ctx.fillStyle = ratio > 0.8 ? '#facc15' : '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(`⚡ ${Math.round(ratio * 100)}%`, this.x, this.y - this.height - 14);
      ctx.restore();
    }

    // 🛡️ Ojos Brillantes & Destello Celestial durante Parry Perfecto (Perfect Shield)
    if (this.parryFlashTimer > 0) {
      ctx.save();
      const pRatio = this.parryFlashTimer / 0.50;
      const eyeY = this.y - this.height * 0.65;
      const eyeX = this.x + this.facing * 8;

      // Ojo brillante central
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 20 * pRatio;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 5 * pRatio, 0, Math.PI * 2);
      ctx.fill();

      // Destello en cruz (Cross star flare)
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5 * pRatio;
      ctx.beginPath();
      ctx.moveTo(eyeX - 18 * pRatio, eyeY);
      ctx.lineTo(eyeX + 18 * pRatio, eyeY);
      ctx.moveTo(eyeX, eyeY - 18 * pRatio);
      ctx.lineTo(eyeX, eyeY + 18 * pRatio);
      ctx.stroke();

      // Anillo expansivo celestial
      ctx.strokeStyle = `rgba(250, 204, 21, ${pRatio * 0.85})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.height * 0.5, 30 + (1 - pRatio) * 20, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // 🤼 Grab Visual FX (Hand reach & Energetic Grip)
    if (this.state === 'GRAB_START') {
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(this.x + this.facing * (this.width * 0.45 + 14), this.y - this.height * 0.45, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (this.state === 'GRABBING' && this.grabbedOpponent) {
      ctx.save();
      const opp = this.grabbedOpponent;
      const timeLeft = Math.max(0, 2.0 - this.grabHoldTimer).toFixed(1);

      // Energetic binding rings around opponent
      const pulse = Math.sin(performance.now() * 0.015) * 3;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(opp.x, opp.y - opp.height * 0.5, 24 + pulse, 12, 0, 0, Math.PI * 2);
      ctx.ellipse(opp.x, opp.y - opp.height * 0.35, 22 - pulse, 10, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Grip beam connecting grabber to opponent
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.height * 0.5);
      ctx.lineTo(opp.x, opp.y - opp.height * 0.5);
      ctx.stroke();

      // Directional Throw prompt & 2-second timer badge
      ctx.font = 'bold 12px "Outfit", monospace, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(`🤼 LANZAR: ⬆️ ⬇️ ⬅️ ➡️ (${timeLeft}s)`, this.x, this.y - this.height - 18);
      ctx.restore();
    }

    // 🧗 Ledge Hang Visual Indicator
    if (this.state === 'LEDGE') {
      ctx.save();
      const p = this.grabbedLedgePlat;
      if (p) {
        const edgeX = this.ledgeSide === 'left' ? p.x : p.x + p.width;
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(edgeX, p.y, 4 + Math.sin(performance.now() * 0.02) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = 'bold 11px "Outfit", monospace, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 5;
      ctx.fillText(`[Espacio] Salto · [Z] Ataque · [Arriba] Subir · [Abajo] Soltar`, this.x, this.y - this.height - 14);
      ctx.restore();
    }

    // 🎯 Hitbox / Hurtbox Visualizer (Modo Entrenamiento Avanzado)
    if (window.game && window.game.showHitboxes) {
      ctx.save();

      // 1. Hurtbox (Green)
      const hurtboxes = this.getHurtboxes
        ? this.getHurtboxes()
        : [{ x: this.x, y: this.y - this.height * 0.5, radius: this.hurtboxRadius }];
      for (const hb of hurtboxes) {
        ctx.strokeStyle = '#22c55e';
        ctx.fillStyle = 'rgba(34, 197, 94, 0.28)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hb.x, hb.y, hb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // 2. Active Attack Hitbox (Red)
      if (this.activeHitbox && (this.state === 'ATTACK' || this.state === 'SPECIAL')) {
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.42)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(this.activeHitbox.x, this.activeHitbox.y, this.activeHitbox.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // 3. Grab Hitbox (Yellow)
      if (this.state === 'GRAB_START') {
        ctx.strokeStyle = '#eab308';
        ctx.fillStyle = 'rgba(234, 179, 8, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + this.facing * (this.width * 0.45 + 14), this.y - this.height * 0.45, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  breakShield() {
    if (this.shieldBreakTimer > 0) return;
    this.state = 'HURT';
    this.shield = 0;
    this.shieldBreakTimer = 1.35;
    this.hitstun = 0;
    this.hitstop = 0;
    this.vx = 0;
    this.vy = 0;
    this.anim.play('Hurt', { speed: 0.55 });
    window.soundEngine.playSfx('hit_heavy');
    if (window.particleManager) {
      window.particleManager.spawnHitSparks(this.x, this.y - this.height * 0.5, 10, 'normal');
      window.particleManager.spawnFloatingText(this.x, this.y - this.height - 12, 'ESCUDO ROTO', '#f87171', 16);
    }
  }

  getBasicAttackDef(dir, isAir = false) {
    return this.getUniversalBasicAttackDef(dir, isAir);
  }

  getUniversalBasicAttackDef(dir, isAir = false) {
    if (isAir) {
      const airMoves = {
        up: {
          name: 'Golpe Aéreo Superior (Up Air)', anim: 'Attack', animSpeed: 1.35,
          hitboxStart: 2, hitboxEnd: 9, offsetX: 8, offsetY: 38,
          radius: 34, damage: 7, baseKnockback: 12, knockbackScaling: 0.85,
          angle: 85, type: 'normal', hitlag: 6
        },
        down: {
          name: 'Pisotón Meteoro (Down Air / Spike)', anim: 'Attack', animSpeed: 1.3,
          hitboxStart: 3, hitboxEnd: 10, offsetX: 6, offsetY: -4,
          radius: 34, damage: 9, baseKnockback: 15, knockbackScaling: 1.1,
          angle: 280, type: 'normal', hitlag: 7
        },
        side: {
          name: 'Golpe Aéreo Lateral (Forward Air)', anim: 'Attack', animSpeed: 1.3,
          hitboxStart: 3, hitboxEnd: 9, offsetX: 28, offsetY: 20,
          radius: 28, damage: 7, baseKnockback: 11, knockbackScaling: 0.85,
          angle: 42, type: 'normal', hitlag: 6
        },
        neutral: {
          name: 'Giro Aéreo (Neutral Air)', anim: 'Attack', animSpeed: 1.4,
          hitboxStart: 2, hitboxEnd: 8, offsetX: 0, offsetY: 20,
          radius: 30, damage: 6, baseKnockback: 9, knockbackScaling: 0.7,
          angle: 45, type: 'normal', hitlag: 5
        }
      };
      return airMoves[dir] || airMoves.neutral;
    }

    const universalMoves = {
      neutral: {
        name: 'Golpe Básico', anim: 'Attack', animSpeed: 1.35,
        hitboxStart: 3, hitboxEnd: 8, offsetX: 24, offsetY: 22,
        radius: 24, damage: 5, baseKnockback: 10, knockbackScaling: 0.65,
        angle: 42, type: 'normal', hitlag: 5
      },
      up: {
        name: 'Golpe Básico Ascendente', anim: 'Attack', animSpeed: 1.3,
        hitboxStart: 2, hitboxEnd: 9, offsetX: 18, offsetY: 28,
        radius: 34, damage: 6, baseKnockback: 11, knockbackScaling: 0.78,
        angle: 85, type: 'normal', hitlag: 6
      },
      down: {
        name: 'Golpe Básico Bajo', anim: 'Attack', animSpeed: 1.3,
        hitboxStart: 3, hitboxEnd: 8, offsetX: 28, offsetY: 12,
        radius: 26, damage: 5, baseKnockback: 10, knockbackScaling: 0.72,
        angle: 68, type: 'normal', hitlag: 5
      },
      side: {
        name: 'Golpe Básico Lateral', anim: 'Attack', animSpeed: 1.3,
        hitboxStart: 4, hitboxEnd: 10, offsetX: 30, offsetY: 22,
        radius: 28, damage: 8, baseKnockback: 13, knockbackScaling: 0.95,
        angle: 40, type: 'normal', hitlag: 6
      }
    };
    return universalMoves[dir] || universalMoves.neutral;
  }
  getSpecialMoveDef(dir) { return null; }

  startSmashCharge(dir) {
    if (this.actionLockTimer > 0 || this.attackCooldown > 0) return;
    if (!this.checkItemCanUseAttack('smash')) return;

    this.state = 'SMASH_CHARGE';
    this.smashChargeDir = dir;
    this.smashChargeTimer = 0;
    this.smashMaxNotified = false;
    this.actionLockTimer = 0;

    if (dir === 'up') this.anim.setAim('up');
    else if (dir === 'down') this.anim.setAim('down');
    else this.anim.setAim('center');

    this.anim.loop('Charge', 1.0);
    window.soundEngine && window.soundEngine.playSfx('charge');

    if (window.particleManager) {
      window.particleManager.spawnRadialBurst(this.x, this.y - 20, this.accentColor || '#facc15', 'normal', 30);
      window.particleManager.spawnFloatingText(this.x, this.y - this.height - 18, '¡CARGANDO! (Suelta Z para golpear)', '#fbbf24', 16);
    }
  }

  releaseSmashAttack(ratio = 0) {
    const dir = this.smashChargeDir || 'side';
    const smashDef = this.getSmashAttackDef(dir) || this.getUniversalSmashAttackDef(dir);
    if (!smashDef) {
      this.state = 'IDLE';
      return;
    }

    this.state = 'ATTACK';

    // Massive impulse & damage scaling:
    // Base knockback is huge (32-38), scaling up by another +75% when fully charged!
    const dmgMultiplier = 1.0 + ratio * 0.65;
    let kbMultiplier = 1.0 + ratio * 0.75;

    // Nuevo item: Lupa
    // El knockback de los ataques cargados al 100% aumenta en un 30%. En cambio, reduce un 30% si no se ha cargado al 100%.
    if (this.heldItem === 'wide-lens') {
      if (ratio >= 1.0) {
        kbMultiplier *= 1.30;
      } else {
        kbMultiplier *= 0.70;
      }
    }

    const chargedAttack = {
      ...smashDef,
      damage: Math.round(smashDef.damage * dmgMultiplier),
      baseKnockback: Math.round(smashDef.baseKnockback * kbMultiplier),
      knockbackScaling: parseFloat((smashDef.knockbackScaling * kbMultiplier).toFixed(2)),
      hitlag: Math.round((smashDef.hitlag || 8) * (1 + ratio * 0.5)),
      isSmash: true,
      chargeRatio: ratio
    };

    this.currentAttack = chargedAttack;
    this.attackFrame = 0;
    this.hasHitOpponent = false;
    this.attackCooldown = 0.26;

    // Aim direction for sprite
    if (dir === 'up') this.anim.setAim('up');
    else if (dir === 'down') this.anim.setAim('down');
    else this.anim.setAim('center');

    // Visual melee slash & explosion
    if (window.particleManager) {
      const sColor = chargedAttack.slashColor || this.accentColor || '#facc15';
      const sType = chargedAttack.type || 'normal';
      const sRad = (chargedAttack.radius || 38) * (1.2 + ratio * 0.35);
      window.particleManager.spawnMeleeSlash(this.x, this.y, dir, this.facing, sColor, sType, sRad, false);
      window.particleManager.spawnRadialBurst(this.x + this.facing * 20, this.y - 22, sColor, sType, 42 + ratio * 28);

      if (ratio >= 0.8) {
        window.particleManager.spawnFloatingText(this.x, this.y - this.height - 24, '¡SUPER SMASH 100%!', '#facc15', 22);
      } else if (ratio > 0.25) {
        window.particleManager.spawnFloatingText(this.x, this.y - this.height - 20, `¡SMASH +${Math.round(ratio * 100)}%!`, '#fbbf24', 18);
      } else {
        window.particleManager.spawnFloatingText(this.x, this.y - this.height - 18, '¡ATAQUE SMASH!', '#fbbf24', 16);
      }
    }

    window.soundEngine && window.soundEngine.playSfx('smash');

    // Lunge forward impulse on side smash
    if (dir === 'side') {
      this.vx = this.facing * (4.2 + ratio * 4.2);
    }

    this.anim.play(chargedAttack.anim || 'Attack', { speed: chargedAttack.animSpeed || 1.45 }, () => {
      this.state = 'IDLE';
      this.currentAttack = null;
      this.actionLockTimer = Math.max(this.actionLockTimer, chargedAttack.endLag ?? 0.16);
      this.anim.setAim('center');
    });

    if (chargedAttack.onStart) chargedAttack.onStart(this, ratio);
  }

  getUniversalSmashAttackDef(dir) {
    switch (dir) {
      case 'up':
        return {
          name: 'Golpe Smash Ascendente',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 16,
          offsetY: 42,
          radius: 38,
          damage: 17,
          baseKnockback: 34,
          knockbackScaling: 1.55,
          angle: 85,
          type: 'normal',
          hitlag: 8,
          slashColor: '#facc15'
        };
      case 'down':
        return {
          name: 'Golpe Smash Terrestre',
          anim: 'Attack',
          animSpeed: 1.4,
          hitboxStart: 2,
          hitboxEnd: 11,
          offsetX: 0,
          offsetY: 15,
          radius: 46,
          damage: 15,
          baseKnockback: 31,
          knockbackScaling: 1.40,
          angle: 55,
          type: 'normal',
          hitlag: 8,
          slashColor: '#fbbf24'
        };
      case 'side':
      default:
        return {
          name: 'Golpe Smash Lateral',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 35,
          offsetY: 22,
          radius: 40,
          damage: 16,
          baseKnockback: 33,
          knockbackScaling: 1.50,
          angle: 38,
          type: 'normal',
          hitlag: 8,
          slashColor: '#facc15'
        };
    }
  }

  // =========================================================================
  // 🤼 SISTEMA DE AGARRES Y LANZAMIENTOS (Grabs & Directional Throws)
  // =========================================================================
  attemptGrab() {
    if (!this.canAct() || this.state === 'GRAB_START' || this.state === 'GRABBING' || this.state === 'GRABBED') return;
    this.state = 'GRAB_START';
    this.grabStartupTimer = 0.22; // ~13 frames
    this.actionLockTimer = 0.36;  // Whiff recovery time
    this.vx *= 0.35;
    this.anim.setAim('center');
    this.anim.loop('Walk', 0.5);

    if (window.soundEngine) {
      window.soundEngine.playSfx('grab');
    }
    if (window.particleManager) {
      window.particleManager.spawnHitSparks(this.x + this.facing * 20, this.y - this.height * 0.45, 4, 'impact');
    }
  }

  _checkGrabConnection(opponent) {
    if (!opponent || opponent.state === 'RESPAWN' || opponent.state === 'AIR_DODGE' || opponent.state === 'ROLL' || opponent.state === 'GRABBED' || opponent.invulnTimer > 0) return;

    // Grab hitbox reaches in front of the fighter
    const grabBox = {
      x: this.x + this.facing * (this.width * 0.45 + 14),
      y: this.y - this.height * 0.45,
      radius: 28
    };

    const hurtboxes = opponent.getHurtboxes
      ? opponent.getHurtboxes()
      : [{ x: opponent.x, y: opponent.y - opponent.height * 0.5, radius: opponent.hurtboxRadius }];

    for (const hb of hurtboxes) {
      if (window.physicsEngine.checkHitboxCollision(grabBox, hb)) {
        // Connected! Grab pierces shield completely!
        this.state = 'GRABBING';
        this.grabbedOpponent = opponent;
        this.grabHoldTimer = 0;
        this.actionLockTimer = 0.15;
        this.vx = 0;
        this.vy = 0;

        // Limpiar inputs previos para no lanzar accidentalmente en el frame 0 de contacto
        this.input.leftPressed = false;
        this.input.rightPressed = false;
        this.input.upPressed = false;
        this.input.downPressed = false;
        this.input.attackPressed = false;

        opponent.getGrabbedBy(this);

        if (window.soundEngine) {
          window.soundEngine.playSfx('grab');
        }
        if (window.particleManager) {
          window.particleManager.spawnRadialBurst(opponent.x, opponent.y - opponent.height * 0.5, '#facc15', 'electric', 28);
          window.particleManager.spawnFloatingText(opponent.x, opponent.y - opponent.height - 18, '¡AGARRE!', '#facc15', 18);
        }
        break;
      }
    }
  }

  getGrabbedBy(grabber) {
    this.state = 'GRABBED';
    this.grabber = grabber;
    // El que agarra tiene 2 segundos completos para elegir la dirección del lanzamiento
    this.grabEscapeTimer = 2.0 + (this.percent * 0.012);
    this.vx = 0;
    this.vy = 0;
    this.hitstun = 0;
    this.hitstop = 0;
    this.actionLockTimer = 0;
    this.anim.loop('Idle', 0.4);
  }

  _updateGrabbed(dt) {
    if (!this.grabber || this.grabber.state !== 'GRABBING' || this.grabber.grabbedOpponent !== this) {
      this.state = 'IDLE';
      this.grabber = null;
      return;
    }

    // Inmovilización total frente al luchador que nos agarra
    this.x = this.grabber.x + this.grabber.facing * 28;
    this.y = this.grabber.y;
    this.vx = 0;
    this.vy = 0;
    this.facing = -this.grabber.facing;

    this.grabEscapeTimer -= dt;
    if (this.grabEscapeTimer <= 0) {
      this.breakFreeFromGrab();
    }
  }

  breakFreeFromGrab() {
    const g = this.grabber;
    this.state = 'IDLE';
    this.grabber = null;
    this.vx = (g ? g.facing : 1) * 4.5;
    this.vy = -3;
    this.invulnTimer = 0.25;

    if (g) {
      g.state = 'IDLE';
      g.grabbedOpponent = null;
      g.vx = -g.facing * 4.5;
      g.actionLockTimer = 0.25;
    }

    if (window.soundEngine) window.soundEngine.playSfx('select');
    if (window.particleManager) {
      window.particleManager.spawnFloatingText(this.x, this.y - this.height - 12, '¡ESCAPE!', '#38bdf8', 15);
    }
  }

  _updateGrabbing(dt, opponent) {
    if (!this.grabbedOpponent || this.grabbedOpponent.state !== 'GRABBED') {
      this.state = 'IDLE';
      this.grabbedOpponent = null;
      return;
    }

    this.grabHoldTimer += dt;
    this.vx = 0;
    this.vy = 0;

    // 4 Lanzamientos direccionales (El jugador tiene 2 segundos para elegir)
    // Se acepta pulsación directa (Pressed) en cualquier momento o mantener dirección tras 0.10s (6 frames)
    const holdThreshold = 0.10;

    // 1. Lanzamiento Arriba (⬆️)
    if (this.input.upPressed || (this.grabHoldTimer > holdThreshold && (this.input.up || this.input.upPressed))) {
      this.input.upPressed = false;
      this.input.up = false;
      this.performThrow('up');
      return;
    }
    // 2. Lanzamiento Abajo (⬇️)
    if (this.input.downPressed || (this.grabHoldTimer > holdThreshold && (this.input.down || this.input.downPressed))) {
      this.input.downPressed = false;
      this.input.down = false;
      this.performThrow('down');
      return;
    }
    // 3. Lanzamiento Adelante (Dirección hacia la que mira)
    const isForwardPressed = (this.facing === 1 && this.input.rightPressed) || (this.facing === -1 && this.input.leftPressed);
    const isForwardHeld = this.grabHoldTimer > holdThreshold && ((this.facing === 1 && this.input.right) || (this.facing === -1 && this.input.left));
    if (isForwardPressed || isForwardHeld) {
      this.input.rightPressed = false;
      this.input.leftPressed = false;
      this.input.right = false;
      this.input.left = false;
      this.performThrow('forward');
      return;
    }
    // 4. Lanzamiento Atrás (Dirección opuesta a la que mira)
    const isBackPressed = (this.facing === 1 && this.input.leftPressed) || (this.facing === -1 && this.input.rightPressed);
    const isBackHeld = this.grabHoldTimer > holdThreshold && ((this.facing === 1 && this.input.left) || (this.facing === -1 && this.input.right));
    if (isBackPressed || isBackHeld) {
      this.input.leftPressed = false;
      this.input.rightPressed = false;
      this.input.left = false;
      this.input.right = false;
      this.performThrow('back');
      return;
    }

    // 5. Pummel (Ataque Z mientras sostiene al oponente)
    if (this.input.attackPressed) {
      this.input.attackPressed = false;
      if (this.pummelCooldown <= 0) {
        this.pummelCooldown = 0.28;
        this.grabbedOpponent.percent += 2.5;
        this.hitstop = 4;
        this.grabbedOpponent.hitstop = 4;
        if (window.soundEngine) window.soundEngine.playSfx('hit_light');
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(this.grabbedOpponent.x, this.grabbedOpponent.y - this.grabbedOpponent.height * 0.5, 5, 'impact');
          window.particleManager.spawnFloatingText(this.grabbedOpponent.x, this.grabbedOpponent.y - this.grabbedOpponent.height - 10, '+2.5%', '#ef4444', 13);
        }
      }
    }
    if (this.pummelCooldown > 0) this.pummelCooldown -= dt;

    // Timeout: Si pasan los 2 segundos completos sin pulsar dirección, ejecuta lanzamiento automático adelante
    if (this.grabHoldTimer >= 2.0) {
      this.performThrow('forward');
    }
  }

  performThrow(direction) {
    const opp = this.grabbedOpponent;
    if (!opp) return;

    this.state = 'ATTACK';
    this.actionLockTimer = 0.28;
    this.grabbedOpponent = null;
    opp.grabber = null;

    let dmg = 8;
    let baseKb = 28;
    let kbScale = 1.0;
    let angle = 45;
    let throwName = 'Forward Throw ➡️';

    if (direction === 'up') {
      dmg = 8.5;
      baseKb = 28;
      kbScale = 0.95;
      angle = 88; // Launches almost straight up for aerial combos!
      throwName = 'Up Throw ⬆️';
      if (window.particleManager) {
        window.particleManager.spawnRadialBurst(this.x, this.y - this.height * 0.5, '#38bdf8', 'electric', 35);
      }
    } else if (direction === 'down') {
      dmg = 7.5;
      baseKb = 20;
      kbScale = 0.75;
      angle = 70; // Bounces off floor diagonally for tech-chases and ground tilts
      throwName = 'Down Throw ⬇️';
      if (window.particleManager) {
        window.particleManager.spawnSmoke(this.x, this.y, '#94a3b8', 12);
      }
    } else if (direction === 'back') {
      this.facing = -this.facing; // Turn around!
      this.anim.setFacing(this.facing);
      opp.x = this.x + this.facing * 24; // Swing opponent to the other side
      dmg = 11.0;
      baseKb = 34; // Lethal high knockback back-throw!
      kbScale = 1.15;
      angle = 42;
      throwName = 'Back Throw ⬅️';
      if (window.particleManager) {
        window.particleManager.spawnRadialBurst(this.x, this.y - this.height * 0.5, '#f43f5e', 'electric', 40);
      }
    } else { // forward
      dmg = 9.0;
      baseKb = 29;
      kbScale = 1.05;
      angle = 40;
      throwName = 'Forward Throw ➡️';
      if (window.particleManager) {
        window.particleManager.spawnRadialBurst(this.x, this.y - this.height * 0.5, '#f59e0b', 'electric', 35);
      }
    }

    const throwHitbox = {
      damage: dmg,
      baseKnockback: baseKb,
      knockbackScaling: kbScale,
      angle: angle,
      type: 'normal',
      hitlag: 7
    };

    opp.takeHit(throwHitbox, this);
    this.anim.play('Attack', { speed: 1.5 }, () => {
      this.state = 'IDLE';
      this.currentAttack = null;
    });
    if (window.soundEngine) window.soundEngine.playSfx('throw');
    if (window.particleManager) {
      window.particleManager.spawnFloatingText(opp.x, opp.y - opp.height - 20, throwName, '#facc15', 18);
    }
  }

  getSmashAttackDef(dir) {
    return this.getUniversalSmashAttackDef(dir);
  }
}

window.Fighter = Fighter;
