/**
 * Minun y Plusle Fighter (Dex 312 & 311)
 * Duo character inspired by Super Smash Bros Ice Climbers.
 * 
 * Mechanics:
 *  - Minun (Dex 312, Polarity -) is the leader controlled directly by the player.
 *  - Plusle (Dex 311, Polarity +) is the synchronized companion trailing Minun.
 *  - Dual Pokémon on screen that function as a single character.
 *  - All attacks fire x2 projectiles (Negative Blue + Positive Red).
 *  - Both Minun and Plusle have active hurtboxes and accumulate damage independently.
 *  - ONLY Minun's damage determines the on-screen % and stock KO loss.
 */
class MinunPlusle extends window.Fighter {
  constructor(config = {}) {
    super({
      name: 'Minun y Plusle',
      dex: 312,
      pokedexWeight: 4.2,
      weight: 4.2,
      weightCategory: 'Pluma',
      color: '#38bdf8', // Minun Electric Blue
      accentColor: '#f43f5e', // Plusle Ruby Red
      walkSpeed: 5.0, // Rápido y ágil por ser peso pluma (+20% base)
      dashSpeed: 8.6,
      jumpForce: 13.8,
      doubleJumpForce: 12.2,
      scale: 2.5,
      ...config
    });

    this.partnerHasHit = false;
    this.minunDead = false;
    this.minunRespawnTimer = 0;
    this.refuerzoTimer = 0;
    this.partnerPendingJumps = [];

    // Partner entity: Plusle (Dex 311)
    this.partner = {
      dex: 311,
      name: 'Plusle',
      x: this.x - 26 * this.facing,
      y: this.y,
      vx: 0,
      vy: 0,
      width: 32,
      height: 44,
      hurtboxRadius: 20,
      pokedexWeight: 4.2,
      weight: 4.2,
      weightCategory: 'Pluma',
      percent: 0, // Independent damage accumulation for Plusle!
      facing: this.facing,
      isGrounded: true,
      hitstun: 0,
      hitstop: 0,
      invulnTimer: 0,
      state: 'IDLE',
      anim: new window.SpriteAnimator(311, this.scale),
      respawnTimer: 0,
      isSeparated: false,
      rejoinTimer: 0,
      jumpsLeft: 2,
      maxJumps: 2,
      attackCooldown: 0,
      specialCooldown: 0,
      actionLockTimer: 0,
      currentAttack: null,
      attackFrame: 0,
      hasHitOpponent: false,
      isDroppingThrough: false,
      isFastFalling: false,
      shield: 100,
      maxShield: 100,
      onBlastZoneKO: (stage) => {
        if (this.partner.respawnTimer > 0) return;
        window.soundEngine.playSfx('blast_ko');
        if (window.particleManager) {
          window.particleManager.spawnBlastKO(this.partner.x, this.partner.y, '#f43f5e');
          window.particleManager.spawnFloatingText(this.x, this.y - this.height - 20, '¡Plusle KO! Vuelve en 10s', '#f43f5e', 18);
        }
        this.partner.respawnTimer = 10.0; // Aparece dentro de 10 segundos
        this.partner.vx = 0;
        this.partner.vy = 0;
        this.partner.hitstun = 0;
        this.partner.hitstop = 0;
        this.partner.actionLockTimer = 0;
        this.partner.state = 'RESPAWN';
        this.partner.currentAttack = null;
        this.partner.x = -9999;
        this.partner.y = -9999;
      }
    };
  }

  canAct() {
    if (this.minunDead) {
      const p = this.partner;
      return (
        p &&
        p.respawnTimer <= 0 &&
        p.state !== 'HURT' &&
        p.state !== 'ROLL' &&
        p.state !== 'AIR_DODGE' &&
        p.state !== 'SHIELD' &&
        p.state !== 'SMASH_CHARGE' &&
        p.state !== 'ATTACK' &&
        p.state !== 'SPECIAL' &&
        p.hitstop <= 0 &&
        p.hitstun <= 0 &&
        (!p.actionLockTimer || p.actionLockTimer <= 0)
      );
    }
    return super.canAct();
  }

  getHurtboxes() {
    const list = [];
    if (!this.minunDead) {
      list.push({
        x: this.x,
        y: this.y - this.height * 0.5,
        radius: this.hurtboxRadius,
        target: 'minun'
      });
    }

    // Plusle is targetable whenever she is active on screen
    if (this.partner && this.partner.respawnTimer <= 0) {
      list.push({
        x: this.partner.x,
        y: this.partner.y - this.partner.height * 0.5,
        radius: this.partner.hurtboxRadius,
        target: 'plusle'
      });
    }

    return list;
  }

  takeHit(hitbox, attacker, target = null) {
    if (this.minunDead || target === 'plusle') {
      this.takePartnerHit(hitbox, attacker);
      return;
    }

    // Otherwise, Minun (leader) takes the hit
    super.takeHit(hitbox, attacker, target);

    // If Plusle is close to Minun during a heavy blow, apply sympathetic stagger
    if (!this.partner.isSeparated && this.partner.hitstun <= 0 && hitbox.damage > 8) {
      this.partner.vx = attacker ? attacker.facing * 2.0 : this.facing * -2.0;
      this.partner.anim.play('Hurt', { speed: 1.2 });
    }
  }

  takePartnerHit(hitbox, attacker) {
    if (this.partner.invulnTimer > 0 || this.partner.respawnTimer > 0) return;

    // If Minun or Plusle is currently shielding
    if (this.state === 'SHIELD' || (this.minunDead && this.partner.state === 'SHIELD')) {
      let shieldDamage = (hitbox.damage || 5) * 5.0;
      if (this.heldItem === 'escape-rope') {
        shieldDamage *= 1.30;
      }
      this.shield = Math.max(0, this.shield - shieldDamage);
      this.partner.hitstop = Math.max(2, Math.floor((hitbox.hitlag || 6) * 0.5));
      window.soundEngine.playSfx('hit_light');
      if (window.particleManager) {
        window.particleManager.spawnHitSparks(this.partner.x, this.partner.y - 20, 3, 'electric');
      }
      if (this.shield <= 0) this.breakShield();
      return;
    }

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
        window.particleManager.spawnFloatingText(this.partner.x, this.partner.y - this.partner.height - 18, '¡Cinta Focus aguantó! (-75%)', '#d97706', 16);
      }
    }

    // Rocky Helmet: reflect 4% damage back to close-range melee attacker
    if (this.heldItem === 'rocky-helmet' && attacker && !hitbox.isProjectile) {
      const distToAttacker = Math.hypot(attacker.x - this.partner.x, attacker.y - this.partner.y);
      if (distToAttacker < 75) {
        attacker.percent = Math.min(999, attacker.percent + 4);
        window.soundEngine.playSfx('hit_light');
        if (window.particleManager) {
          window.particleManager.spawnFloatingText(attacker.x, attacker.y - attacker.height - 10, '+4% [Casco Dentado]', '#ea580c', 15);
          window.particleManager.spawnHitSparks(attacker.x, attacker.y - attacker.height * 0.5, 4, 'normal');
        }
      }
    }

    // CRITICAL: Accumulate damage ONLY on Plusle! Minun's % (and HUD %) is untouched!
    this.partner.percent = Math.min(this.partner.percent + dmg, 999);

    window.soundEngine.playSfx(dmg > 9 ? 'hit_heavy' : 'hit_medium');
    window.soundEngine.playSfx('shock');

    if (window.particleManager) {
      window.particleManager.spawnHitSparks(this.partner.x, this.partner.y - 20, dmg, 'electric');
      window.particleManager.spawnFloatingText(
        this.partner.x,
        this.partner.y - this.partner.height - 8,
        `+${dmg}% [Plusle]`,
        '#f43f5e',
        16
      );
    }

    this.partner.hitstop = hitbox.hitlag || 6;
    this.partner.state = 'HURT';
    this.partner.isSeparated = true;

    // Launch knockback calculated with Plusle's own accumulated %!
    let kbSpeed = window.physicsEngine.calculateKnockback(
      this.partner.percent,
      dmg,
      this.partner.weight,
      hitbox.knockbackScaling,
      hitbox.baseKnockback
    );

    if (focusBandTriggered) {
      kbSpeed *= 0.25;
    }

    // Focus Sash for Plusle
    if (this.heldItem === 'focus-sash' && this.focusSashActive && kbSpeed > 28) {
      this.focusSashActive = false;
      kbSpeed = 12;
      if (window.particleManager) {
        window.particleManager.spawnFloatingText(this.partner.x, this.partner.y - this.partner.height - 20, '¡Banda Focus salvó!', '#f59e0b', 18);
        window.particleManager.spawnHitSparks(this.partner.x, this.partner.y - this.partner.height * 0.5, 10, 'normal');
      }
    }

    window.physicsEngine.launch(
      this.partner,
      hitbox.angle,
      kbSpeed,
      attacker ? attacker.facing : 1
    );

    this.partner.anim.play('Hurt', { speed: 1.0 });

    if (attacker && window.game) {
      window.game.registerHit(attacker, this, dmg);
    }
  }

  /**
   * Blast zone KO override:
   * Si muere Minun, mueren ambos inmediatamente (pierden 1 vida).
   * La condición anterior de supervivencia de 7s queda totalmente eliminada.
   */
  onBlastZoneKO(stage) {
    if (this.state === 'RESPAWN') return;
    this._fullKO(stage);
  }

  _fullKO(stage) {
    this.partnerPendingJumps = [];
    this.minunDead = false;
    this.minunRespawnTimer = 0;
    this.refuerzoTimer = 0;
    this.focusSashActive = true;
    this.balloonPopped = false;
    super.onBlastZoneKO(stage);

    if (this.partner) {
      this.partner.x = -9999;
      this.partner.y = -9999;
      this.partner.vx = 0;
      this.partner.vy = 0;
      this.partner.hitstun = 0;
      this.partner.hitstop = 0;
      this.partner.percent = 0;
      this.partner.state = 'RESPAWN';
      this.partner.isSeparated = false;
      this.partner.respawnTimer = 0;
      this.partner.invulnTimer = 2.0;
      this.partner.jumpsLeft = 2;
      this.partner.currentAttack = null;
    }
  }

  _respawnMinunBesidePlusle(stage) {
    this.minunDead = false;
    this.minunRespawnTimer = 0;

    const p = this.partner;
    this.x = p.x - 26 * p.facing;
    this.y = p.y;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = p.isGrounded;
    this.facing = p.facing;
    this.state = 'IDLE';
    this.hitstun = 0;
    this.hitstop = 0;
    this.actionLockTimer = 0;
    this.invulnTimer = 1.4;
    this.jumpsLeft = this.maxJumps;
    this.anim.setAim('center');
    this.anim.loop('Idle', 1.0);
    p.isSeparated = false;

    window.soundEngine.playSfx('shock');
    window.soundEngine.playSfx('thunder');
    if (window.particleManager) {
      window.particleManager.spawnLightningBolt(this.x, this.y - 140, this.x, this.y, '#38bdf8', '#ffffff', 6);
      window.particleManager.spawnHitSparks(this.x, this.y - 20, 12, 'electric');
      window.particleManager.spawnRadialBurst(this.x, this.y - 20, '#38bdf8', 'electric', 40);
      window.particleManager.spawnFloatingText(this.x, this.y - 45, '¡MINUN HA REAPARECIDO!', '#38bdf8', 20);
    }
  }

  dropThroughPlatform() {
    if (this.minunDead && this.partner) {
      this.partner.isDroppingThrough = true;
      this.partner.dropThroughTimer = 0.32;
      this.partner.isGrounded = false;
      this.partner.y += 5;
      this.partner.vy = 2.0;
      if (window.particleManager) {
        window.particleManager.spawnSmoke(this.partner.x, this.partner.y, '#94a3b8', 6);
      }
      return;
    }
    super.dropThroughPlatform();
    if (this.partner && !this.partner.isSeparated) {
      this.partner.isDroppingThrough = true;
      this.partner.dropThroughTimer = 0.32;
      this.partner.isGrounded = false;
      this.partner.y += 5;
      this.partner.vy = 2.0;
    }
  }

  handleInputs(stage = null, dt = 1 / 60) {
    stage = stage || (window.game ? window.game.stage : null);
    if (this.minunDead) {
      this._handlePlusleInputs(stage, dt);
      return;
    }

    // Guardar si se pulsa salto antes de que super.handleInputs limpie el flag jumpPressed
    const willJump = this.input.jumpPressed;
    const canMinunAct = this.canAct();
    const minunCanJump = canMinunAct && (this.isGrounded || this.jumpsLeft > 0);

    super.handleInputs(stage, dt);

    // Salto sincronizado en tándem: Plusle salta 0.4 segundos después de Minun
    if (willJump && minunCanJump && this.partner && this.partner.respawnTimer <= 0) {
      if (!this.partnerPendingJumps) this.partnerPendingJumps = [];
      this.partnerPendingJumps.push({ timer: 0.40 });
    }
  }

  _handlePlusleInputs(stage = null, dt = 1 / 60) {
    const p = this.partner;
    if (!p || p.respawnTimer > 0) return;
    if (p.hitstop > 0 || p.hitstun > 0 || (p.actionLockTimer && p.actionLockTimer > 0)) return;

    // Double tap Down to drop through platform for Plusle
    if (this.input.downPressed) {
      this.input.downPressed = false;
      const now = performance.now() / 1000;
      if (p.isGrounded && stage && stage.semiSolidPlatforms) {
        const onPlat = stage.semiSolidPlatforms.some(plat =>
          Math.abs(p.y - plat.y) < 5 && p.x >= plat.x - 10 && p.x <= plat.x + plat.width + 10
        );
        if (onPlat) {
          const dtSince = now - (this.lastPlusleDownTap || 0);
          if (dtSince > 0.04 && dtSince < 0.38) {
            this.dropThroughPlatform();
            this.lastPlusleDownTap = 0;
            return;
          } else {
            this.lastPlusleDownTap = now;
          }
        }
      }
    }

    // Ground Roll for Plusle (i-frames / Eframes)
    if (p.isGrounded && (this.input.shield || p.state === 'SHIELD' || this.shieldTapTimer > 0)) {
      if (this.input.left || this.input.right || this.input.leftPressed || this.input.rightPressed) {
        if ((this.rollCooldown || 0) <= 0 && this.shieldBreakTimer <= 0 && p.hitstun <= 0 && p.hitstop <= 0 && this.shield >= 18) {
          const rollDir = (this.input.left || this.input.leftPressed) ? -1 : 1;
          this.input.shieldPressed = false;
          this.shieldTapTimer = 0;
          this.shield = Math.max(0, this.shield - 22);
          if (this.shield <= 0) {
            this.breakShield();
            return;
          }
          this.rollCooldown = 0.65;
          this.actionLockTimer = 0.60;
          p.state = 'ROLL';
          p.vx = rollDir * 25.5; // Balance Update: mayor distancia de roll over
          p.facing = rollDir;
          p.invulnTimer = 0.38; // ~23 frames de invencibilidad (Eframes)
          p.actionLockTimer = 0.60;
          p.anim.play('Walk', { speed: 2.2 });
          window.soundEngine.playSfx('dash');
          if (window.particleManager) {
            window.particleManager.spawnSmoke(p.x, p.y, '#94a3b8', 7);
            window.particleManager.spawnFloatingText(p.x, p.y - p.height - 12, '¡ROLL! (-22 Escudo)', '#38bdf8', 14);
          }
          return;
        }
      }
    }

    // Air Dodge for Plusle (i-frames / Eframes)
    if (!p.isGrounded && (this.input.shieldPressed || this.shieldTapTimer > 0 || this.input.shield)) {
      if (!this.airDodgeUsed && p.hitstun <= 0 && p.hitstop <= 0 && (!p.actionLockTimer || p.actionLockTimer <= 0)) {
        this.input.shieldPressed = false;
        this.shieldTapTimer = 0;
        this.performAirDodge();
        p.state = 'AIR_DODGE';
        p.invulnTimer = 0.35;
        p.vx = (this.input.left ? -4.8 : this.input.right ? 4.8 : p.vx * 0.35);
        p.vy = (this.input.up ? -3.8 : this.input.down ? 3.8 : p.vy * 0.35);
        return;
      }
    }

    // Shielding
    if (this.input.shield && p.isGrounded) {
      p.state = 'SHIELD';
      p.vx *= 0.6;
      p.anim.loop('Idle', 0.6);
      return;
    } else if (p.state === 'SHIELD') {
      p.state = 'IDLE';
    }

    // Jumps: Short Hop on tap, Full Hop on hold
    if (this.input.jumpPressed) {
      this.input.jumpPressed = false;
      if (p.isGrounded) {
        p.vy = -this.jumpForce;
        p.isGrounded = false;
        p.isJumping = true;
        p.jumpsLeft = 1;
        p.state = 'JUMP';
        window.soundEngine.playSfx('jump');
        if (window.particleManager) {
          window.particleManager.spawnSmoke(p.x, p.y, '#f43f5e', 8);
        }
      } else if (p.jumpsLeft > 0) {
        p.vy = -this.doubleJumpForce;
        p.jumpsLeft--;
        p.isJumping = true;
        p.isFastFalling = false;
        window.soundEngine.playSfx('djump');
        if (window.particleManager) {
          window.particleManager.spawnSmoke(p.x, p.y, '#f43f5e', 10);
        }
      }
    }

    // Fast-falling
    if (!p.isGrounded && this.input.down && p.vy > 0 && !p.isFastFalling) {
      p.isFastFalling = true;
    }

    // Attacks: Z (Basic Attack)
    if (this.input.attackPressed) {
      this.input.attackPressed = false;
      this._performPlusleBasicAttack();
      return;
    }

    // Specials: X
    if (this.input.specialPressed) {
      this.input.specialPressed = false;
      this._performPlusleSpecialMove();
      return;
    }

    // Horizontal Movement
    if (this.input.left) {
      p.vx = -this.dashSpeed;
      p.facing = -1;
      if (p.isGrounded && p.state !== 'ATTACK' && p.state !== 'SPECIAL') {
        p.anim.loop('Walk', 1.3);
      }
    } else if (this.input.right) {
      p.vx = this.dashSpeed;
      p.facing = 1;
      if (p.isGrounded && p.state !== 'ATTACK' && p.state !== 'SPECIAL') {
        p.anim.loop('Walk', 1.3);
      }
    } else {
      p.vx *= 0.72;
      if (p.isGrounded && p.state !== 'ATTACK' && p.state !== 'SPECIAL') {
        if (this.input.down) {
          p.state = 'CROUCH';
          p.anim.setAim('down');
          p.anim.loop('Idle', 0.6);
        } else {
          p.state = 'IDLE';
          p.anim.setAim('center');
          p.anim.loop('Idle', 1.0);
        }
      }
    }
  }

  _performPlusleBasicAttack() {
    const p = this.partner;
    if (!p || p.respawnTimer > 0) return;
    if (p.attackCooldown && p.attackCooldown > 0) return;
    if (p.actionLockTimer && p.actionLockTimer > 0) return;
    if (!this.checkItemCanUseAttack('basic')) return;

    let dir = 'neutral';
    if (this.input.up) dir = 'up';
    else if (this.input.down) dir = 'down';
    else if (this.input.left) { dir = 'side'; p.facing = -1; }
    else if (this.input.right) { dir = 'side'; p.facing = 1; }

    const isAir = !p.isGrounded;
    p.state = 'ATTACK';
    p.attackFrame = 0;
    p.hasHitOpponent = false;
    p.attackCooldown = 0.20; // 50% reduced basic cooldown

    const atk = {
      name: `Plusle ${dir.toUpperCase()} Attack`,
      hitboxStart: 2,
      hitboxEnd: 9,
      offsetX: dir === 'neutral' ? 24 : dir === 'side' ? 32 : dir === 'up' ? 12 : 24,
      offsetY: dir === 'up' ? 36 : dir === 'down' ? (isAir ? -4 : 8) : 22,
      radius: 34,
      damage: dir === 'down' && isAir ? 8 : 6,
      baseKnockback: dir === 'down' && isAir ? 14 : 11,
      knockbackScaling: dir === 'down' && isAir ? 1.1 : 0.85,
      angle: dir === 'down' && isAir ? 280 : dir === 'up' ? 85 : 45,
      hitlag: 6
    };
    p.currentAttack = atk;

    if (dir === 'up') p.anim.setAim('up');
    else if (dir === 'down') p.anim.setAim('down');
    else p.anim.setAim('center');

    window.soundEngine.playSfx(isAir ? 'whip' : 'hit_light');
    if (window.particleManager) {
      window.particleManager.spawnMeleeSlash(p.x, p.y, dir, p.facing, '#f43f5e', 'electric', 38, isAir);
    }

    p.anim.play('Attack', { speed: 1.35 }, () => {
      p.state = 'IDLE';
      p.currentAttack = null;
      p.actionLockTimer = 0.20; // Nerf: 0.2s de lag entre ataques
      p.attackCooldown = Math.max(p.attackCooldown || 0, 0.20);
      p.anim.setAim('center');
    });
  }

  _performPlusleSpecialMove() {
    const p = this.partner;
    if (!p || p.respawnTimer > 0) return;
    if (p.specialCooldown && p.specialCooldown > 0) return;
    if (p.actionLockTimer && p.actionLockTimer > 0) return;
    if (!this.checkItemCanUseAttack('special')) return;

    let dir = 'neutral';
    if (this.input.up) dir = 'up';
    else if (this.input.down) dir = 'down';
    else if (this.input.left) { dir = 'side'; p.facing = -1; }
    else if (this.input.right) { dir = 'side'; p.facing = 1; }

    p.specialCooldown = (dir === 'side' ? 0.95 : 0.55); // CD de X+lados aumentada en 0.4s (0.55s -> 0.95s)

    if (dir === 'down') {
      // "NO funciona si no esta minun presente"
      window.soundEngine.playSfx('hit_light');
      if (window.particleManager) {
        window.particleManager.spawnFloatingText(p.x, p.y - 30, '¡Refuerzo requiere a Minun!', '#94a3b8', 14);
      }
      return;
    }

    if (dir === 'up') {
      // Plusle solo Up-Special recovery
      const forward = (this.input.left ? -1 : this.input.right ? 1 : p.facing) * 5.5;
      p.vy = -14.2;
      p.vx = forward;
      p.isGrounded = false;
      p.isFastFalling = false;
      p.state = 'SPECIAL';

      window.soundEngine.playSfx('quick_attack');
      if (window.particleManager) {
        window.particleManager.spawnHitSparks(p.x, p.y - 18, 5, 'electric');
      }
      this.spawnDualSparkProjectiles(forward * 0.4, -10.0, 13, '#f43f5e', '#f43f5e', 5);

      p.anim.play('Walk', { speed: 2.0 }, () => {
        p.state = 'IDLE';
        p.actionLockTimer = 0.28;
      });
      return;
    }

    if (dir === 'side') {
      p.vx = p.facing * 10.5;
      p.state = 'SPECIAL';
      window.soundEngine.playSfx('shock');
      if (window.particleManager) {
        window.particleManager.spawnLightningBolt(p.x, p.y - 18, p.x + p.facing * 35, p.y - 18, '#f43f5e', '#ffffff', 5);
      }
      this.spawnDualSparkProjectiles(9.0 * p.facing, 0, 14, '#f43f5e', '#f43f5e', 6);

      p.anim.play('Charge', { speed: 1.4 }, () => {
        p.state = 'IDLE';
        p.actionLockTimer = 0.25;
      });
      return;
    }

    // Neutral Special: 1 Red Positive Plasma Orb (20% reduced radius = 13)
    p.state = 'SPECIAL';
    window.soundEngine.playSfx('shock');
    this.projectiles.push({
      x: p.x + p.facing * 22,
      y: p.y - 22,
      vx: 7.4 * p.facing,
      vy: 0,
      radius: 13, // 20% reduced size
      damage: 7,
      baseKnockback: 12,
      knockbackScaling: 0.95,
      angle: 45,
      type: 'electric',
      hitlag: 6,
      life: 1.9,
      hitStage: true,
      color: '#f43f5e',
      sign: '+',
      origY: p.y - 22,
      phase: 0,
      update: function(dt) {
        this.phase += dt * 9;
        this.y = this.origY + Math.sin(this.phase) * 12;
        if (Math.random() < 0.4 && window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 2, 'electric');
        }
      },
      draw: function(ctx) {
        ctx.save();
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${Math.round(this.radius * 1.2)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', this.x, this.y);
        ctx.restore();
      },
      onHit: function(target) {
        window.soundEngine.playSfx('shock');
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 8, 'electric');
        }
      },
      onStageHit: function() {
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 4, 'electric');
        }
      }
    });

    p.anim.play('Shoot', { speed: 1.1 }, () => {
      p.state = 'IDLE';
      p.actionLockTimer = 0.28;
    });
  }

  performBasicAttack() {
    this.partnerHasHit = false;
    super.performBasicAttack();
  }

  performSpecialMove() {
    this.partnerHasHit = false;
    super.performSpecialMove();
  }

  getModifiedHitbox(hitbox, isSpecial = false) {
    const finalHitbox = super.getModifiedHitbox(hitbox, isSpecial);
    // Nerf 2.5: Reducción general de daño del 10%
    if (finalHitbox && finalHitbox.damage) {
      finalHitbox.damage = Math.max(1, Math.round(finalHitbox.damage * 0.90));
    }
    return finalHitbox;
  }

  _updateAttack(dt, opponent) {
    const boostActive = this.refuerzoTimer > 0 && !this.minunDead;
    // Nerf 2.5: Daño general reducido un 10% adicional
    const dmgMultiplier = (boostActive ? 1.10 : 1.0) * 0.765;

    if (this.currentAttack) {
      const origDmg = this.currentAttack.damage;
      this.currentAttack.damage = Math.max(1, Math.round(origDmg * dmgMultiplier));
      super._updateAttack(dt, opponent);
      this.currentAttack.damage = origDmg;
    } else {
      super._updateAttack(dt, opponent);
    }

    // Plusle tandem physical melee strike during basic melee attacks
    const p = this.partner;
    if (this.currentAttack && p && p.respawnTimer <= 0 && p.hitstun <= 0 && p.hitstop <= 0 && (this.state === 'ATTACK' || (this.state === 'SPECIAL' && this.currentAttack.name && this.currentAttack.name.includes('Chispazo')))) {
      const atk = this.currentAttack;
      if (this.attackFrame >= atk.hitboxStart && this.attackFrame <= atk.hitboxEnd && !this.partnerHasHit) {
        const ox = atk.offsetX !== undefined ? atk.offsetX : 28;
        const oy = atk.offsetY !== undefined ? atk.offsetY : 24;
        const hx = p.x + ox * p.facing;
        const hy = p.y - oy;
        const hitbox = {
          x: hx,
          y: hy,
          radius: atk.radius || 28,
          damage: Math.round((atk.damage || 6) * 0.75 * dmgMultiplier),
          baseKnockback: (atk.baseKnockback || 12) * 0.8,
          knockbackScaling: atk.knockbackScaling || 0.8,
          angle: atk.angle !== undefined ? atk.angle : 45,
          type: 'electric',
          hitlag: 5
        };

        if (opponent && opponent.state !== 'RESPAWN' && opponent.invulnTimer <= 0) {
          const hurtboxes = opponent.getHurtboxes
            ? opponent.getHurtboxes()
            : [{ x: opponent.x, y: opponent.y - opponent.height * 0.5, radius: opponent.hurtboxRadius, target: null }];

          for (const hurtbox of hurtboxes) {
            if (window.physicsEngine.checkHitboxCollision(hitbox, hurtbox)) {
              if (window.game && window.game.isOnlineMatch && this === window.game.dummy) {
                break;
              }
              const finalHitbox = this.getModifiedHitbox(hitbox, false);
              opponent.takeHit(finalHitbox, this, hurtbox.target);
              this.partnerHasHit = true;
              p.hitstop = finalHitbox.hitlag;
              window.soundEngine.playSfx('shock');
              if (window.particleManager) {
                window.particleManager.spawnHitSparks(hx, hy, 5, 'electric');
                window.particleManager.spawnFloatingText(hx, hy - 16, '+TÁNDEM', '#f43f5e', 14);
              }
              break;
            }
          }
        }
      }
    }
  }

  update(dt, opponent, stage) {
    if (this.minunDead) {
      // Minun is awaiting respawn after 7 seconds
      this.refuerzoTimer = 0;
      this.minunRespawnTimer -= dt;
      if (this.minunRespawnTimer <= 0) {
        this._respawnMinunBesidePlusle(stage);
      }

      if (this.attackCooldown > 0) this.attackCooldown -= dt;
      if (this.specialCooldown > 0) this.specialCooldown -= dt;

      // Projectiles update
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const proj = this.projectiles[i];
        proj.life -= dt;
        proj.x += proj.vx;
        proj.y += proj.vy;
        if (proj.update) proj.update(dt);
        if (proj.hitStage && stage.solidPlatforms) {
          for (const plat of stage.solidPlatforms) {
            if (proj.x >= plat.x && proj.x <= plat.x + plat.width && proj.y >= plat.y && proj.y <= plat.y + plat.height) {
              if (proj.onStageHit) proj.onStageHit();
            }
          }
        }

        // Collision with opponent
        if (opponent && opponent.state !== 'RESPAWN' && opponent.invulnTimer <= 0) {
          // En modo online, los proyectiles del rival remoto dummy NO causan daño local al jugador
          if (window.game && window.game.isOnlineMatch && this === window.game.dummy) {
            continue;
          }
          const hurtboxes = opponent.getHurtboxes
            ? opponent.getHurtboxes()
            : [{ x: opponent.x, y: opponent.y - opponent.height * 0.5, radius: opponent.hurtboxRadius, target: null }];

          let hitSomething = false;
          for (const hurtbox of hurtboxes) {
            if (window.physicsEngine.checkHitboxCollision(proj, hurtbox)) {
              const finalHitbox = this.getModifiedHitbox(proj, true);
              opponent.takeHit(finalHitbox, this, hurtbox.target);
              hitSomething = true;
              if (proj.onHit) proj.onHit(opponent);
              break;
            }
          }
          if (hitSomething) {
            this.projectiles.splice(i, 1);
            continue;
          }
        }

        if (proj.life <= 0) {
          this.projectiles.splice(i, 1);
        }
      }

      this._updatePartner(dt, opponent, stage);
      return;
    }

    if (this.refuerzoTimer > 0) {
      this.refuerzoTimer = Math.max(0, this.refuerzoTimer - dt);
    }

    super.update(dt, opponent, stage);
    this._updatePartner(dt, opponent, stage);
  }

  _updatePartner(dt, opponent, stage) {
    const p = this.partner;
    if (p) {
      p.heldItem = this.heldItem;
      p.balloonPopped = this.balloonPopped;
      p.focusSashActive = this.focusSashActive;
    }

    // En partidas online, si este luchador es el muñeco rival (dummy), sincronizar a Plusle
    // directamente según el estado recibido de red por el dueño
    if (window.game && window.game.isOnlineMatch && this === window.game.dummy) {
      if (this.onlinePartnerState) {
        const s = this.onlinePartnerState;
        p.x = s.x !== undefined ? s.x : p.x;
        p.y = s.y !== undefined ? s.y : p.y;
        p.vx = s.vx !== undefined ? s.vx : 0;
        p.vy = s.vy !== undefined ? s.vy : 0;
        p.facing = s.facing !== undefined ? s.facing : this.facing;
        p.state = s.state || 'IDLE';
        p.anim.setFacing(p.facing);
        if (s.anim) p.anim.loop(s.anim, 1.0);
        p.anim.update(dt);
        return;
      }
    }

    // Sincronización fuera de pantalla con Minun durante RESPAWN (Smash Blast KO)
    if (this.state === 'RESPAWN') {
      if (this.respawnTimer > 1.2) {
        p.x = -9999;
        p.y = -9999;
        return;
      } else if (p.x < -500 && this.x > -500) {
        p.x = this.x - 26 * this.facing;
        p.y = this.y;
        p.state = 'IDLE';
        p.invulnTimer = 2.0;
        p.anim.setAim('center');
        p.anim.loop('Idle', 1.0);
      }
    }

    // Plusle delayed jump execution (0.4s after Minun)
    if (this.partnerPendingJumps && this.partnerPendingJumps.length > 0 && !this.minunDead) {
      for (let i = this.partnerPendingJumps.length - 1; i >= 0; i--) {
        this.partnerPendingJumps[i].timer -= dt;
        if (this.partnerPendingJumps[i].timer <= 0) {
          this.partnerPendingJumps.splice(i, 1);
          if (p && p.respawnTimer <= 0) {
            const canPartnerJump = p.state !== 'HURT' && p.hitstop <= 0 && p.hitstun <= 0 && (!p.actionLockTimer || p.actionLockTimer <= 0);
            if (canPartnerJump) {
              if (p.isGrounded) {
                // Salto sincronizado terrestre con 0.4s de retraso
                p.vy = -this.jumpForce;
                p.isGrounded = false;
                p.isJumping = true;
                p.jumpsLeft = 1;
                p.state = 'JUMP';
                window.soundEngine && window.soundEngine.playSfx('jump');
                if (window.particleManager) {
                  window.particleManager.spawnSmoke(p.x, p.y, '#f43f5e', 8);
                }
              } else if (p.jumpsLeft > 0) {
                // Doble salto sincronizado aéreo con 0.4s de retraso
                p.vy = -this.doubleJumpForce;
                p.jumpsLeft--;
                p.isJumping = true;
                p.isFastFalling = false;
                window.soundEngine && window.soundEngine.playSfx('djump');
                if (window.particleManager) {
                  window.particleManager.spawnSmoke(p.x, p.y, '#f43f5e', 10);
                }
              }
            }
          }
        }
      }
    }

    // Respawn / Rejoining timer after blast zone launch
    if (p.respawnTimer > 0) {
      p.respawnTimer -= dt;
      if (p.respawnTimer <= 0) {
        // Rejoin beside Minun with an electric warp burst
        p.x = this.x - 26 * this.facing;
        p.y = this.y;
        p.vx = 0;
        p.vy = 0;
        p.isGrounded = this.isGrounded;
        p.state = 'IDLE';
        p.hitstun = 0;
        p.hitstop = 0;
        p.invulnTimer = 1.0;
        p.isSeparated = false;
        p.percent = Math.floor(p.percent * 0.5); // Reset partial damage on rejoin
        p.anim.setAim('center');
        p.anim.loop('Idle', 1.0);

        window.soundEngine.playSfx('shock');
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(p.x, p.y - 20, 8, 'electric');
          window.particleManager.spawnFloatingText(p.x, p.y - 40, '¡PLUSLE REAGRUPADA!', '#f43f5e', 16);
          window.particleManager.spawnLightningBolt(this.x, this.y - 20, p.x, p.y - 20, '#f43f5e', '#ffffff', 4);
        }
      }
      return;
    }

    if (p.invulnTimer > 0) {
      p.invulnTimer = Math.max(0, p.invulnTimer - dt);
    }

    // Freeze frames for partner
    if (p.hitstop > 0) {
      p.hitstop--;
      p.anim.update(dt);
      return;
    }

    // Hitstun decay for partner
    if (p.hitstun > 0) {
      p.hitstun--;
    }

    // Return control to partner as soon as hitstop & hitstun end
    if (p.hitstun <= 0 && p.hitstop <= 0) {
      if (p.state === 'HURT' || p.state === 'AIR_DODGE') {
        p.state = p.isGrounded ? 'IDLE' : 'FALL';
        p.anim.loop(p.isGrounded ? 'Idle' : 'Fall', 1.0);
      }
    }

    // Action lock timer and cooldown decrements for partner
    if (p.actionLockTimer > 0) p.actionLockTimer = Math.max(0, p.actionLockTimer - dt);
    if (p.attackCooldown > 0) p.attackCooldown = Math.max(0, p.attackCooldown - dt);
    if (p.specialCooldown > 0) p.specialCooldown = Math.max(0, p.specialCooldown - dt);
    if (p.dropThroughTimer > 0) p.dropThroughTimer = Math.max(0, p.dropThroughTimer - dt);

    if (p.state === 'ROLL') {
      p.vx *= 0.975; // Menor fricción durante el roll
      if (p.actionLockTimer <= 0) {
        p.state = (this.state === 'SHIELD' || this.input.shield) ? 'SHIELD' : 'IDLE';
        p.anim.loop('Idle', 1.0);
      }
    }

    // Kinematics and stage collision for Plusle
    window.physicsEngine.updateFighter(p, stage, dt);

    // Variable Jump Height for Plusle (Short Hop vs Full Hop sincronizado con Minun)
    if (p.isJumping && p.vy < 0) {
      if (this.minunDead && !this.input.jump) {
        const shortHopCap = -this.jumpForce * 0.50;
        if (p.vy < shortHopCap) p.vy = shortHopCap;
        p.isJumping = false;
      }
    } else if (p.isGrounded || p.vy >= 0) {
      p.isJumping = false;
    }

    // Blast zone check for partner
    if (p.x > -1000 && p.y > -1000 && p.respawnTimer <= 0 && stage.isOutsideBlastZone(p.x, p.y)) {
      if (this.minunDead) {
        this._fullKO(stage);
        return;
      }
      if (p.onBlastZoneKO) {
        p.onBlastZoneKO(stage);
      }
      return;
    }

    // If Minun is dead, Plusle is controlled directly and acts autonomously
    if (this.minunDead) {
      if (p.attackCooldown > 0) p.attackCooldown -= dt;
      if (p.specialCooldown > 0) p.specialCooldown -= dt;
      if (p.actionLockTimer > 0) p.actionLockTimer -= dt;

      // Check active attack hitbox
      if (p.currentAttack && opponent && opponent.state !== 'RESPAWN' && opponent.invulnTimer <= 0) {
        if (window.game && window.game.isOnlineMatch && this === window.game.dummy) {
          // No aplicar daño local si es el dummy rival
        } else 
        p.attackFrame = (p.attackFrame || 0) + dt * 60;
        const atk = p.currentAttack;
        if (p.attackFrame >= atk.hitboxStart && p.attackFrame <= atk.hitboxEnd && !p.hasHitOpponent) {
          const ox = atk.offsetX !== undefined ? atk.offsetX : 28;
          const oy = atk.offsetY !== undefined ? atk.offsetY : 20;
          const hx = p.x + ox * p.facing;
          const hy = p.y - oy;
          const hitbox = {
            x: hx,
            y: hy,
            radius: atk.radius || 32,
            damage: atk.damage || 7,
            baseKnockback: atk.baseKnockback || 12,
            knockbackScaling: atk.knockbackScaling || 0.85,
            angle: atk.angle !== undefined ? atk.angle : 45,
            type: 'electric',
            hitlag: 6
          };

          const hurtboxes = opponent.getHurtboxes
            ? opponent.getHurtboxes()
            : [{ x: opponent.x, y: opponent.y - opponent.height * 0.5, radius: opponent.hurtboxRadius, target: null }];

          for (const hurtbox of hurtboxes) {
            if (window.physicsEngine.checkHitboxCollision(hitbox, hurtbox)) {
              if (window.game && window.game.isOnlineMatch && this === window.game.dummy) {
                break;
              }
              const finalHitbox = this.getModifiedHitbox(hitbox, false);
              opponent.takeHit(finalHitbox, this, hurtbox.target);
              p.hasHitOpponent = true;
              p.hitstop = finalHitbox.hitlag;
              window.soundEngine.playSfx('shock');
              if (window.particleManager) {
                window.particleManager.spawnHitSparks(hx, hy, 6, 'electric');
                window.particleManager.spawnFloatingText(hx, hy - 16, '+PLUSLE', '#f43f5e', 14);
              }
              break;
            }
          }
        }
      }

      p.anim.setFacing(p.facing);
      p.anim.update(dt);
      return;
    }

    // Synchronization & Ice Climbers Tether AI when Plusle is following Minun
    const canPartnerAct = p.state !== 'HURT' && p.hitstun <= 0 && p.hitstop <= 0;
    if (canPartnerAct) {
      // Ideal position: behind Minun by 26px
      const targetX = this.x - 26 * this.facing;
      const targetY = this.y;
      const dx = targetX - p.x;
      const dist = Math.abs(dx);

      // Facing matches Minun
      p.facing = this.facing;

      // Match attack states if Minun is attacking
      if ((this.state === 'ATTACK' || this.state === 'SPECIAL') && !p.anim.isBusy()) {
        const animName = this.currentAttack ? (this.currentAttack.anim || 'Attack') : 'Attack';
        p.anim.setAim(this.anim.aimDir);
        p.anim.play(animName, { speed: 1.25 });
      }

      // Match Shield
      if (this.state === 'SHIELD') {
        p.state = 'SHIELD';
        p.vx *= 0.7;
        p.anim.loop('Idle', 0.6);
      } else if (p.state === 'SHIELD') {
        p.state = 'IDLE';
      }

      // Movement & catch-up with ledge detection
      if (dist > 8) {
        const followSpeed = dist > 90 ? this.dashSpeed * 1.15 : this.walkSpeed;
        const moveDir = Math.sign(dx);
        let canMove = true;

        // Ledge safety: Don't walk off platforms into the void on her own
        if (p.isGrounded && stage && stage.solidPlatforms) {
          const plat = stage.solidPlatforms.find(pl =>
            p.y >= pl.y - 4 && p.y <= pl.y + 10 &&
            p.x >= pl.x - 12 && p.x <= pl.x + pl.width + 12
          );
          if (plat) {
            const nextX = p.x + moveDir * (followSpeed * dt * 60 + 14);
            if ((nextX < plat.x + 8 && moveDir < 0) || (nextX > plat.x + plat.width - 8 && moveDir > 0)) {
              const minunOnSamePlat = this.isGrounded && (this.x >= plat.x && this.x <= plat.x + plat.width && Math.abs(this.y - plat.y) < 12);
              if (!minunOnSamePlat) {
                canMove = false;
              }
            }
          }
        }

        if (canMove) {
          p.vx += moveDir * 1.35;
          p.vx = Math.max(-followSpeed, Math.min(followSpeed, p.vx));

          if (p.isGrounded && p.state !== 'SHIELD' && !p.anim.isBusy()) {
            p.anim.loop('Walk', 1.25);
          }
        } else {
          p.vx *= 0.6;
          if (p.isGrounded && p.state !== 'SHIELD' && !p.anim.isBusy()) {
            p.state = 'IDLE';
            p.anim.loop('Idle', 1.0);
          }
        }
      } else {
        p.vx *= 0.75;
        if (p.isGrounded && p.state !== 'SHIELD' && !p.anim.isBusy()) {
          if (this.state === 'CROUCH') {
            p.state = 'CROUCH';
            p.anim.setAim('down');
            p.anim.loop('Idle', 0.6);
          } else {
            p.state = 'IDLE';
            p.anim.setAim(this.anim.aimDir);
            p.anim.loop('Idle', 1.0);
          }
        }
      }

      // Plusle ya NO salta por su propia cuenta (se elimina el salto autónomo por AI)

      // Drop through platform with Minun
      if (this.isDroppingThrough) {
        p.isDroppingThrough = true;
        p.isGrounded = false;
        p.y += 4;
      }

      // If separated and Minun is grounded far away, super-dash back
      if (dist > 220 && p.isGrounded) {
        p.vx = Math.sign(dx) * 10;
        if (window.particleManager && Math.random() < 0.4) {
          window.particleManager.spawnLightningBolt(p.x, p.y - 15, p.x + p.vx * 3, p.y - 15, '#f43f5e', '#ffffff', 3);
        }
      }

      // Emergency Warp if separated far away (> 480px) and leader is safe
      if (dist > 480 && this.isGrounded && stage && !stage.isOutsideBlastZone(this.x, this.y)) {
        p.x = this.x - 26 * this.facing;
        p.y = this.y;
        p.vx = 0;
        p.vy = 0;
        p.isGrounded = true;
        p.state = 'IDLE';
        if (window.particleManager) {
          window.particleManager.spawnRadialBurst(p.x, p.y - 20, '#f43f5e', 'electric', 25);
          window.particleManager.spawnFloatingText(p.x, p.y - 35, '⚡ ¡REAGRUPACIÓN!', '#f43f5e', 14);
        }
      }
    }

    p.anim.setFacing(p.facing);
    p.anim.update(dt);
  }

  /* =========================================================================
   * ATTACKS & 2X PROJECTILES IMPLEMENTATION
   * Every single move fires 2x synchronized negative & positive projectiles!
   * ========================================================================= */

  getBasicAttackDef(dir, isAir = false) {
    if (isAir) {
      switch (dir) {
        case 'up':
          // Up Air: Patada Aérea Ascendente (Cuerpo a cuerpo hacia arriba)
          return {
            name: 'Patada Aérea Ascendente (Up Air)',
            anim: 'Attack',
            animSpeed: 1.35,
            hitboxStart: 2,
            hitboxEnd: 9,
            offsetX: 10,
            offsetY: 38,
            radius: 38,
            damage: 8,
            baseKnockback: 13,
            knockbackScaling: 0.88,
            angle: 85,
            type: 'electric',
            hitlag: 6,
            slashColor: '#38bdf8',
            cooldown: 0.22, // 50% reduced CD
            endLag: 0.16,
            onStart: (p) => {
              window.soundEngine.playSfx('whip', 0.1);
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'up', p.facing, '#38bdf8', 'electric', 42, true);
              }
              if (this.partner && this.partner.respawnTimer <= 0) {
                this.partner.anim.play('Attack', { speed: 1.35 });
              }
            }
          };

        case 'down':
          // Down Air: Pisotón Doble Meteoro (Ice Climbers Spike cuerpo a cuerpo)
          return {
            name: 'Pisotón Doble Meteoro (Down Air / Spike)',
            anim: 'Attack',
            animSpeed: 1.25,
            hitboxStart: 3,
            hitboxEnd: 11,
            offsetX: 8,
            offsetY: -6,
            radius: 38,
            damage: 10,
            baseKnockback: 15,
            knockbackScaling: 1.15,
            angle: 280, // Downward meteor spike!
            type: 'electric',
            hitlag: 8,
            slashColor: '#f43f5e',
            cooldown: 0.24, // 50% reduced CD
            endLag: 0.18,
            onStart: (p) => {
              window.soundEngine.playSfx('shock');
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'down', p.facing, '#f43f5e', 'electric', 42, true);
              }
              if (this.partner && this.partner.respawnTimer <= 0) {
                this.partner.anim.play('Attack', { speed: 1.25 });
              }
            }
          };

        case 'side':
          // Forward Air: Zarpazo Aéreo Doble (Cuerpo a cuerpo frontal)
          return {
            name: 'Zarpazo Aéreo Doble (Forward Air)',
            anim: 'Attack',
            animSpeed: 1.25,
            hitboxStart: 2,
            hitboxEnd: 10,
            offsetX: 34,
            offsetY: 20,
            radius: 36,
            damage: 8,
            baseKnockback: 13,
            knockbackScaling: 0.95,
            angle: 42,
            type: 'electric',
            hitlag: 7,
            slashColor: '#38bdf8',
            cooldown: 0.23, // 50% reduced CD
            endLag: 0.16,
            onStart: (p) => {
              window.soundEngine.playSfx('whip');
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'side', p.facing, '#38bdf8', 'electric', 42, true);
              }
              if (this.partner && this.partner.respawnTimer <= 0) {
                this.partner.anim.play('Attack', { speed: 1.25 });
              }
            }
          };

        case 'neutral':
        default:
          // Neutral Air: Giro Bipolar (Giro 360° cuerpo a cuerpo en el aire)
          return {
            name: 'Giro Bipolar (Neutral Air)',
            anim: 'Attack',
            animSpeed: 1.35,
            hitboxStart: 2,
            hitboxEnd: 8,
            offsetX: 0,
            offsetY: 20,
            radius: 36,
            damage: 7,
            baseKnockback: 10,
            knockbackScaling: 0.72,
            angle: 45,
            type: 'electric',
            hitlag: 5,
            slashColor: '#38bdf8',
            cooldown: 0.21, // 50% reduced CD
            endLag: 0.15,
            onStart: (p) => {
              window.soundEngine.playSfx('shock');
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'neutral', p.facing, '#38bdf8', 'electric', 40, true);
              }
              if (this.partner && this.partner.respawnTimer <= 0) {
                this.partner.anim.play('Attack', { speed: 1.35 });
              }
            }
          };
      }
    }

    // Grounded Melee Basic Attacks (Cuerpo a cuerpo al usar Z en direcciones)
    switch (dir) {
      case 'side':
        // Side Tilt (⬅️/➡️ + Z): Coletazo Polar Cuerpo a Cuerpo
        return {
          name: 'Coletazo Polar (Side Tilt)',
          anim: 'Attack',
          animSpeed: 1.25,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 36,
          offsetY: 20,
          radius: 38,
          damage: 8,
          baseKnockback: 14,
          knockbackScaling: 0.95,
          angle: 42,
          type: 'electric',
          hitlag: 7,
          slashColor: '#38bdf8',
          cooldown: 0.23, // 50% reduced CD
          endLag: 0.16,
          onStart: (p) => {
            p.vx = p.facing * 3.2; // Quick forward step
            window.soundEngine.playSfx('whip');
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'side', p.facing, '#38bdf8', 'electric', 44, false);
            }
            if (this.partner && this.partner.respawnTimer <= 0) {
              this.partner.vx = p.facing * 3.2;
              this.partner.anim.play('Attack', { speed: 1.25 });
            }
          }
        };

      case 'up':
        // Up Tilt (⬆️ + Z): Patada Voltereta Ascendente Cuerpo a Cuerpo
        return {
          name: 'Patada Voltereta Ascendente (Up Tilt)',
          anim: 'Attack',
          animSpeed: 1.3,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 14,
          offsetY: 34,
          radius: 40,
          damage: 7,
          baseKnockback: 13,
          knockbackScaling: 0.85,
          angle: 85,
          type: 'electric',
          hitlag: 6,
          slashColor: '#38bdf8',
          cooldown: 0.22, // 50% reduced CD
          endLag: 0.16,
          onStart: (p) => {
            p.vy = -2.4; // Little hop
            window.soundEngine.playSfx('whip', 0.1);
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'up', p.facing, '#38bdf8', 'electric', 46, false);
            }
            if (this.partner && this.partner.respawnTimer <= 0) {
              this.partner.vy = -2.2;
              this.partner.anim.play('Attack', { speed: 1.3 });
            }
          }
        };

      case 'down':
        // Down Tilt (⬇️ + Z): Barrido Bajo Cuerpo a Cuerpo
        return {
          name: 'Barrido Bajo (Down Tilt)',
          anim: 'Attack',
          animSpeed: 1.2,
          hitboxStart: 3,
          hitboxEnd: 10,
          offsetX: 30,
          offsetY: 10,
          radius: 36,
          damage: 6,
          baseKnockback: 11,
          knockbackScaling: 0.75,
          angle: 75,
          type: 'electric',
          hitlag: 6,
          slashColor: '#f43f5e',
          cooldown: 0.22, // 50% reduced CD
          endLag: 0.16,
          onStart: (p) => {
            p.vx = p.facing * 2.0;
            window.soundEngine.playSfx('hit_light');
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'down', p.facing, '#f43f5e', 'electric', 42, false);
            }
            if (this.partner && this.partner.respawnTimer <= 0) {
              this.partner.vx = p.facing * 2.0;
              this.partner.anim.play('Attack', { speed: 1.2 });
            }
          }
        };

      case 'neutral':
      default:
        // Neutral Jab (Z sin dirección): Chispa Jab Cuerpo a Cuerpo
        return {
          name: 'Chispa Jab (Neutral Z)',
          anim: 'Attack',
          animSpeed: 1.4,
          hitboxStart: 2,
          hitboxEnd: 8,
          offsetX: 26,
          offsetY: 22,
          radius: 32,
          damage: 5,
          baseKnockback: 7,
          knockbackScaling: 0.5,
          angle: 45,
          type: 'electric',
          hitlag: 4,
          slashColor: '#38bdf8',
          cooldown: 0.18, // 50% reduced CD
          endLag: 0.12,
          onStart: (p) => {
            window.soundEngine.playSfx('hit_light');
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'neutral', p.facing, '#38bdf8', 'electric', 36, false);
            }
            if (this.partner && this.partner.respawnTimer <= 0) {
              this.partner.anim.play('Attack', { speed: 1.4 });
            }
          }
        };
    }
  }

  getSpecialMoveDef(dir) {
    switch (dir) {
      case 'neutral':
        // Neutral Special (X): Chispazo (Discharge)
        // Rework 2.5: Daño en AOE desde cerca
        return {
          name: 'Chispazo (Neutral X - AOE)',
          anim: 'Shoot',
          animSpeed: 1.25,
          hitboxStart: 2,
          hitboxEnd: 15,
          offsetX: 0,
          offsetY: 20,
          radius: 70, // Daño en área desde cerca
          damage: 9,
          baseKnockback: 14,
          knockbackScaling: 0.95,
          angle: 55,
          type: 'electric',
          hitlag: 7,
          cooldown: 0.65,
          endLag: 0.22,
          onStart: (p) => {
            window.soundEngine.playSfx('shock');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(p.x, p.y - 20, '#00e5ff', 'electric', 55);
              if (this.partner && this.partner.respawnTimer <= 0) {
                window.particleManager.spawnRadialBurst(this.partner.x, this.partner.y - 20, '#f43f5e', 'electric', 55);
              }
              window.particleManager.spawnFloatingText(p.x, p.y - p.height - 20, '⚡ ¡CHISPAZO! (AOE)', '#00e5ff', 16);
            }
          },
          onUpdate: (p, frame) => {
            if (window.particleManager && Math.random() < 0.45) {
              window.particleManager.spawnHitSparks(p.x + (Math.random() - 0.5) * 45, p.y - 20 + (Math.random() - 0.5) * 35, 2, 'electric');
              if (this.partner && this.partner.respawnTimer <= 0) {
                window.particleManager.spawnHitSparks(this.partner.x + (Math.random() - 0.5) * 45, this.partner.y - 20 + (Math.random() - 0.5) * 35, 2, 'electric');
              }
            }
          },
          onHit: (p, opponent) => {
            window.soundEngine.playSfx('thunder');
            if (window.particleManager) {
              window.particleManager.spawnHitSparks(opponent.x, opponent.y - opponent.height * 0.5, 12, 'electric');
            }
          }
        };

      case 'side':
        // Side Special: Placaje Magnético Dúo (Side X)
        // Dash with 2x lightning bolts launched forward
        return {
          name: 'Placaje Magnético Dúo (Side X)',
          anim: 'Charge',
          animSpeed: 1.5,
          hitboxStart: 2,
          hitboxEnd: 15,
          offsetX: 24,
          offsetY: 20,
          radius: 36,
          damage: 11,
          baseKnockback: 15,
          knockbackScaling: 1.1,
          angle: 42,
          type: 'electric',
          hitlag: 7,
          endLag: 0.25,
          cooldown: 1.10, // Aumentada en 0.4s (era 0.70s)
          onStart: (p) => {
            const dashDir = p.input.left ? -1 : p.input.right ? 1 : p.facing;
            p.facing = dashDir;
            p.vx = dashDir * 11.5;
            if (!p.isGrounded) p.vy = -1.0;

            // Partner dashes with Minun
            this.partner.facing = dashDir;
            this.partner.vx = dashDir * 11.5;
            if (!this.partner.isGrounded) this.partner.vy = -1.0;

            window.soundEngine.playSfx('shock');
            if (window.particleManager) {
              window.particleManager.spawnLightningBolt(p.x, p.y - 18, p.x + p.facing * 35, p.y - 18, '#38bdf8', '#ffffff', 5);
              window.particleManager.spawnLightningBolt(this.partner.x, this.partner.y - 18, this.partner.x + p.facing * 35, this.partner.y - 18, '#f43f5e', '#ffffff', 5);
            }

            // Launch 2x Forward Shock Bolts
            this.spawnDualSparkProjectiles(9.0 * p.facing, 0, 15, '#38bdf8', '#f43f5e', 5);
          },
          onUpdate: (p, frame) => {
            if (frame < 13) {
              p.vx = p.facing * Math.max(6.0, 11.5 - frame * 0.45);
              this.partner.vx = p.vx;
              if (window.particleManager && Math.random() < 0.4) {
                window.particleManager.spawnHitSparks(p.x, p.y - 18, 2, 'electric');
                window.particleManager.spawnHitSparks(this.partner.x, this.partner.y - 18, 2, 'electric');
              }
            }
          },
          onHit: (p, opponent) => {
            window.soundEngine.playSfx('thunder');
            if (window.particleManager) {
              window.particleManager.spawnHitSparks(p.x + p.facing * 20, p.y - 20, 10, 'electric');
              window.particleManager.spawnRadialBurst(p.x + p.facing * 20, p.y - 20, '#38bdf8', 'electric', 32);
            }
          }
        };

      case 'up':
        // Up Special: Impulso Magnético (Belay Recovery)
        return {
          name: 'Impulso Magnético (Up X)',
          anim: 'Walk',
          animSpeed: 2.0,
          hitboxStart: 2,
          hitboxEnd: 14,
          offsetX: 16,
          offsetY: 24,
          radius: 30,
          damage: 8,
          baseKnockback: 12,
          knockbackScaling: 0.85,
          angle: 70,
          type: 'electric',
          hitlag: 6,
          cooldown: 0.88, // 20% reduced CD (from 1.10s)
          endLag: 0.28,
          onStart: (p) => {
            const forwardForce = (p.input.left ? -1 : p.input.right ? 1 : p.facing) * 6.0;
            p.vy = -14.2;
            p.vx = forwardForce;
            p.isGrounded = false;
            p.isFastFalling = false;

            // Plusle pulls herself up with Minun
            this.partner.vy = -13.8;
            this.partner.vx = forwardForce;
            this.partner.isGrounded = false;

            window.soundEngine.playSfx('quick_attack');
            if (window.particleManager) {
              window.particleManager.spawnLightningBolt(p.x, p.y - 15, this.partner.x, this.partner.y - 15, '#00e5ff', '#f43f5e', 5);
              window.particleManager.spawnHitSparks(p.x, p.y - 20, 5, 'electric');
            }

            // Launch 2x Upward Spark Rockets
            this.spawnDualSparkProjectiles(forwardForce * 0.4, -10.0, 13, '#38bdf8', '#f43f5e', 4);
          }
        };

      case 'down':
        // Down Special (⬇️ + X): Refuerzo (Helping Hand)
        // Aumenta el daño realizado un 10% durante 5 segundos. NO se stackea. NO funciona si no está Minun presente.
        // NUEVO: Teletransporta a Plusle a Minun siempre y cuando esté cerca (dist <= 350px).
        return {
          name: 'Refuerzo (Down X)',
          anim: 'Charge',
          animSpeed: 1.3,
          hitboxStart: 999,
          hitboxEnd: 999,
          cooldown: 0.80, // 20% reduced CD
          endLag: 0.22,
          onStart: (p) => {
            // Rule: NO funciona si no esta minun presente
            if (this.minunDead) {
              window.soundEngine.playSfx('hit_light');
              if (window.particleManager) {
                window.particleManager.spawnFloatingText(this.partner.x, this.partner.y - 25, '¡Requiere a Minun!', '#94a3b8', 14);
              }
              return;
            }

            // Rule: NO se stackea (timer refreshes to 5.0s, multiplier strictly 1.10x)
            this.refuerzoTimer = 5.0;

            window.soundEngine.playSfx('thunder');
            window.soundEngine.playSfx('select');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(p.x, p.y - 20, '#fbbf24', 'electric', 35);
              window.particleManager.spawnFloatingText(p.x, p.y - 40, '¡REFUERZO! +10% DAÑO (5s)', '#fbbf24', 18);
            }

            // Refuerzo: Teletransporta a Plusle a Minun si está viva y cerca (dist <= 350px)
            if (this.partner && this.partner.respawnTimer <= 0) {
              const dx = this.partner.x - this.x;
              const dy = this.partner.y - this.y;
              const dist = Math.hypot(dx, dy);

              if (dist <= 350) {
                const oldPx = this.partner.x;
                const oldPy = this.partner.y;
                const targetX = this.x - 26 * this.facing;
                const targetY = this.y;

                this.partner.x = targetX;
                this.partner.y = targetY;
                this.partner.vx = 0;
                this.partner.vy = 0;
                this.partner.isGrounded = this.isGrounded;
                this.partner.facing = this.facing;
                this.partner.state = 'IDLE';
                this.partner.hitstun = 0;
                this.partner.hitstop = 0;
                this.partner.actionLockTimer = 0;
                this.partner.isSeparated = false;
                this.partner.anim.setAim('center');
                this.partner.anim.play('Charge', { speed: 1.3 });

                window.soundEngine.playSfx('shock');
                if (window.particleManager) {
                  window.particleManager.spawnLightningBolt(oldPx, oldPy - 20, targetX, targetY - 20, '#f43f5e', '#ffffff', 5);
                  window.particleManager.spawnRadialBurst(oldPx, oldPy - 20, '#f43f5e', 'electric', 25);
                  window.particleManager.spawnRadialBurst(targetX, targetY - 20, '#fbbf24', 'electric', 35);
                  window.particleManager.spawnFloatingText(targetX, targetY - 35, '⚡ ¡PLUSLE REAGRUPADA!', '#fbbf24', 16);
                }
              } else {
                if (window.particleManager) {
                  window.particleManager.spawnFloatingText(this.x, this.y - 25, '¡Plusle está lejos!', '#94a3b8', 14);
                }
                this.partner.anim.play('Charge', { speed: 1.3 });
              }
            }
          }
        };
    }
  }

  /* =========================================================================
   * 2X PROJECTILE SPAWNING HELPERS
   * ========================================================================= */

  /**
   * Spawns 2 synchronized electric spark projectiles (Minun's Blue & Plusle's Red)
   */
  spawnDualSparkProjectiles(vx, vy, radius = 12, color1 = '#38bdf8', color2 = '#f43f5e', dmg = 4) {
    const boostActive = this.refuerzoTimer > 0 && !this.minunDead;
    const finalDmg = Math.round(dmg * (boostActive ? 1.10 : 1.0));

    // Projectile 1: Minun (-)
    this.projectiles.push({
      x: this.x + this.facing * 18,
      y: this.y - 22,
      vx: vx,
      vy: vy,
      radius: radius,
      damage: finalDmg,
      baseKnockback: 10,
      knockbackScaling: 0.75,
      angle: 45,
      type: 'electric',
      hitlag: 5,
      life: 1.6,
      hitStage: true,
      color: color1,
      sign: '-',
      update: function(dt) {
        if (Math.random() < 0.35 && window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 1, 'electric');
        }
      },
      draw: function(ctx) {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // White core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Polarity mark
        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${Math.round(this.radius * 1.1)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.sign, this.x, this.y);
        ctx.restore();
      },
      onHit: function(target) {
        window.soundEngine.playSfx('shock');
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 5, 'electric');
        }
      },
      onStageHit: function() {
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 3, 'electric');
        }
      }
    });

    // Projectile 2: Plusle (+)
    const startX2 = this.partner.respawnTimer <= 0 ? this.partner.x + this.partner.facing * 18 : this.x + this.facing * 24;
    const startY2 = this.partner.respawnTimer <= 0 ? this.partner.y - 22 : this.y - 14;

    this.projectiles.push({
      x: startX2,
      y: startY2,
      vx: vx * 0.96, // Slight realistic stagger
      vy: vy + (Math.random() - 0.5) * 0.4,
      radius: radius,
      damage: finalDmg,
      baseKnockback: 10,
      knockbackScaling: 0.75,
      angle: 45,
      type: 'electric',
      hitlag: 5,
      life: 1.6,
      hitStage: true,
      color: color2,
      sign: '+',
      update: function(dt) {
        if (Math.random() < 0.35 && window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 1, 'electric');
        }
      },
      draw: function(ctx) {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // White core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Polarity mark
        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${Math.round(this.radius * 1.1)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.sign, this.x, this.y);
        ctx.restore();
      },
      onHit: function(target) {
        window.soundEngine.playSfx('shock');
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 5, 'electric');
        }
      },
      onStageHit: function() {
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 3, 'electric');
        }
      }
    });
  }

  /**
   * Spawns 2 radial sparks in opposing directions (Neutral Air)
   */
  spawnOpposingSparks(speed = 6.5, color1 = '#38bdf8', color2 = '#f43f5e') {
    // Spark 1: Leftward (-)
    this.projectiles.push({
      x: this.x,
      y: this.y - 20,
      vx: -speed,
      vy: 0,
      radius: 12,
      damage: 4,
      baseKnockback: 9,
      knockbackScaling: 0.7,
      angle: 135,
      type: 'electric',
      hitlag: 5,
      life: 1.2,
      hitStage: true,
      color: color1,
      sign: '-',
      draw: function(ctx) {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // Spark 2: Rightward (+)
    this.projectiles.push({
      x: this.partner.x,
      y: this.partner.y - 20,
      vx: speed,
      vy: 0,
      radius: 12,
      damage: 4,
      baseKnockback: 9,
      knockbackScaling: 0.7,
      angle: 45,
      type: 'electric',
      hitlag: 5,
      life: 1.2,
      hitStage: true,
      color: color2,
      sign: '+',
      draw: function(ctx) {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  /**
   * Neutral Special: 2x Intertwined Double Helix Plasma Balls (Minun Blue & Plusle Red)
   * Reduced projectile size by 20% (radius: 13px vs 16px).
   */
  spawnDoubleHelixPlasmaBalls() {
    const baseSpeed = 7.4 * this.facing;
    const startX1 = this.x + this.facing * 24;
    const startY1 = this.y - 22;

    const startX2 = this.partner.respawnTimer <= 0 ? this.partner.x + this.partner.facing * 24 : this.x + this.facing * 28;
    const startY2 = this.partner.respawnTimer <= 0 ? this.partner.y - 22 : this.y - 12;

    const boostActive = this.refuerzoTimer > 0 && !this.minunDead;
    const finalDmg = Math.round(7 * (boostActive ? 1.10 : 1.0));

    // Orb 1: Minun Negative Ion (-)
    this.projectiles.push({
      x: startX1,
      y: startY1,
      vx: baseSpeed,
      vy: 0,
      radius: 13, // 20% reduced size (from 16 to 13)
      damage: finalDmg,
      baseKnockback: 12,
      knockbackScaling: 0.95,
      angle: 45,
      type: 'electric',
      hitlag: 6,
      life: 1.9,
      hitStage: true,
      color: '#00e5ff',
      sign: '-',
      origY: startY1,
      phase: 0,
      update: function(dt) {
        this.phase += dt * 9;
        this.y = this.origY + Math.sin(this.phase) * 14;
        if (Math.random() < 0.4 && window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 2, 'electric');
        }
      },
      draw: function(ctx) {
        ctx.save();
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#00e5ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${Math.round(this.radius * 1.2)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('-', this.x, this.y);
        ctx.restore();
      },
      onHit: function(target) {
        window.soundEngine.playSfx('shock');
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 8, 'electric');
        }
      },
      onStageHit: function() {
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 4, 'electric');
        }
      }
    });

    // Orb 2: Plusle Positive Ion (+)
    this.projectiles.push({
      x: startX2,
      y: startY2,
      vx: baseSpeed,
      vy: 0,
      radius: 13, // 20% reduced size (from 16 to 13)
      damage: finalDmg,
      baseKnockback: 12,
      knockbackScaling: 0.95,
      angle: 45,
      type: 'electric',
      hitlag: 6,
      life: 1.9,
      hitStage: true,
      color: '#f43f5e',
      sign: '+',
      origY: startY2,
      phase: Math.PI, // Opposite wave phase creates intertwined helix!
      update: function(dt) {
        this.phase += dt * 9;
        this.y = this.origY + Math.sin(this.phase) * 14;
        if (Math.random() < 0.4 && window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 2, 'electric');
        }
      },
      draw: function(ctx) {
        ctx.save();
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${Math.round(this.radius * 1.2)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', this.x, this.y);
        ctx.restore();
      },
      onHit: function(target) {
        window.soundEngine.playSfx('shock');
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 8, 'electric');
        }
      },
      onStageHit: function() {
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 4, 'electric');
        }
      }
    });
  }

  /**
   * Down Special: 2x Bouncing Ion Grenades (Blue Negative & Red Positive)
   */
  spawnDualIonGrenades() {
    const p1Speed = 6.2 * this.facing;
    const p2Speed = 4.8 * this.facing;

    // Grenade 1: Minun Blue Ion
    this.projectiles.push({
      x: this.x + this.facing * 18,
      y: this.y - 20,
      vx: p1Speed,
      vy: -5.5,
      radius: 14,
      damage: 8,
      baseKnockback: 14,
      knockbackScaling: 1.1,
      angle: 65,
      type: 'electric',
      hitlag: 7,
      life: 2.2,
      hitStage: true,
      color: '#38bdf8',
      sign: '-',
      bounces: 3,
      update: function(dt) {
        this.vy += 0.42; // Gravity
      },
      draw: function(ctx) {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${Math.round(this.radius * 1.1)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.sign, this.x, this.y);
        ctx.restore();
      },
      onHit: function(target) {
        window.soundEngine.playSfx('thunder');
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 10, 'electric');
          window.particleManager.spawnRadialBurst(this.x, this.y, '#38bdf8', 'electric', 28);
        }
      },
      onStageHit: function() {
        this.bounces--;
        if (this.bounces > 0) {
          this.vy = -Math.abs(this.vy) * 0.72;
          this.vx *= 0.85;
          window.soundEngine.playSfx('hit_light');
        } else {
          this.life = 0;
          window.soundEngine.playSfx('thunder');
          if (window.particleManager) {
            window.particleManager.spawnHitSparks(this.x, this.y, 8, 'electric');
          }
        }
      }
    });

    // Grenade 2: Plusle Red Ion
    const startX2 = this.partner.respawnTimer <= 0 ? this.partner.x + this.partner.facing * 18 : this.x + this.facing * 24;
    const startY2 = this.partner.respawnTimer <= 0 ? this.partner.y - 20 : this.y - 12;

    this.projectiles.push({
      x: startX2,
      y: startY2,
      vx: p2Speed,
      vy: -7.2, // Arcs higher!
      radius: 14,
      damage: 8,
      baseKnockback: 14,
      knockbackScaling: 1.1,
      angle: 70,
      type: 'electric',
      hitlag: 7,
      life: 2.2,
      hitStage: true,
      color: '#f43f5e',
      sign: '+',
      bounces: 3,
      update: function(dt) {
        this.vy += 0.42; // Gravity
      },
      draw: function(ctx) {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${Math.round(this.radius * 1.1)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.sign, this.x, this.y);
        ctx.restore();
      },
      onHit: function(target) {
        window.soundEngine.playSfx('thunder');
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(this.x, this.y, 10, 'electric');
          window.particleManager.spawnRadialBurst(this.x, this.y, '#f43f5e', 'electric', 28);
        }
      },
      onStageHit: function() {
        this.bounces--;
        if (this.bounces > 0) {
          this.vy = -Math.abs(this.vy) * 0.72;
          this.vx *= 0.85;
          window.soundEngine.playSfx('hit_light');
        } else {
          this.life = 0;
          window.soundEngine.playSfx('thunder');
          if (window.particleManager) {
            window.particleManager.spawnHitSparks(this.x, this.y, 8, 'electric');
          }
        }
      }
    });
  }

  /* =========================================================================
   * RENDERING
   * Draws both Minun and Plusle, shadows, dual shields, and active polarity link
   * ========================================================================= */

  draw(ctx, opts = {}) {
    const isDittoMatch = (opts && opts.isDittoMatch !== undefined)
      ? opts.isDittoMatch
      : (window.game && window.game.playerDex === window.game.dummyDex);

    // Ditto Match P1 Indicator
    if (this.isPlayer && isDittoMatch) {
      ctx.save();
      const bounce = Math.sin(performance.now() * 0.008) * 3;
      const leaderY = !this.minunDead ? this.y : this.partner.y;
      const leaderX = !this.minunDead ? this.x : this.partner.x;
      const tagY = leaderY - 45 + bounce;
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(leaderX, tagY);
      ctx.lineTo(leaderX - 6, tagY - 8);
      ctx.lineTo(leaderX + 6, tagY - 8);
      ctx.closePath();
      ctx.fill();

      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('P1', leaderX, tagY - 10);
      ctx.restore();
    }

    // 1. Shadows under feet
    if (this.isGrounded && !this.minunDead) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.width * 0.52, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (this.partner.isGrounded && this.partner.respawnTimer <= 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(this.partner.x, this.partner.y, this.partner.width * 0.52, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Refuerzo Golden Aura Effect (+10% damage boost active)
    if (this.refuerzoTimer > 0 && !this.minunDead) {
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.globalAlpha = 0.5 + Math.sin(performance.now() * 0.012) * 0.3;
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.height * 0.5, this.hurtboxRadius + 8, 0, Math.PI * 2);
      ctx.stroke();

      if (this.partner && this.partner.respawnTimer <= 0) {
        ctx.beginPath();
        ctx.arc(this.partner.x, this.partner.y - this.partner.height * 0.5, this.partner.hurtboxRadius + 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Subtle electric polarity link between them when close (only when Minun is alive)
    if (!this.minunDead && this.partner.respawnTimer <= 0) {
      const dist = Math.hypot(this.x - this.partner.x, this.y - this.partner.y);
      if (dist < 90 && Math.random() < 0.25) {
        ctx.save();
        ctx.strokeStyle = Math.random() < 0.5 ? '#38bdf8' : '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 20);
        const midX = (this.x + this.partner.x) * 0.5 + (Math.random() - 0.5) * 12;
        const midY = (this.y + this.partner.y) * 0.5 - 20 + (Math.random() - 0.5) * 12;
        ctx.lineTo(midX, midY);
        ctx.lineTo(this.partner.x, this.partner.y - 20);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 4. Draw active projectiles
    for (const proj of this.projectiles) {
      if (proj.draw) proj.draw(ctx);
    }

    // 5. Draw Plusle (partner)
    if (this.partner.respawnTimer <= 0) {
      const partnerHitFlashing = this.partner.hitstop > 0 || (this.partner.state === 'HURT' && this.partner.hitstun > 7);
      const partnerInvulnAlpha = this.partner.invulnTimer > 0 && Math.floor(performance.now() / 60) % 2 === 0 ? 0.35 : 1.0;

      this.partner.anim.draw(ctx, this.partner.x, this.partner.y, {
        flash: partnerHitFlashing,
        alpha: partnerInvulnAlpha
      });

      // Plusle's Red Shield
      if (this.partner.state === 'SHIELD' || (!this.minunDead && this.state === 'SHIELD')) {
        const ratio = this.shield / this.maxShield;
        ctx.save();
        ctx.globalAlpha = 0.18 + ratio * 0.18;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.partner.x, this.partner.y - this.partner.height * 0.5, 29 + ratio * 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // If Minun is dead, draw countdown text above Plusle
      if (this.minunDead) {
        ctx.save();
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        const txt = `⏳ Minun: ${Math.max(0, this.minunRespawnTimer).toFixed(1)}s`;
        const tw = ctx.measureText(txt).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(this.partner.x - tw * 0.5 - 8, this.partner.y - this.partner.height - 24, tw + 16, 20);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(this.partner.x - tw * 0.5 - 8, this.partner.y - this.partner.height - 24, tw + 16, 20);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(txt, this.partner.x, this.partner.y - this.partner.height - 10);
        ctx.restore();
      }
    } else if (!this.minunDead) {
      // Draw Plusle respawn countdown above Minun
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      const txt = `⏳ Plusle KO: ${this.partner.respawnTimer.toFixed(1)}s`;
      const tw = ctx.measureText(txt).width;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(this.x - tw * 0.5 - 8, this.y - this.height - 28, tw + 16, 20);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(this.x - tw * 0.5 - 8, this.y - this.height - 28, tw + 16, 20);
      ctx.fillStyle = '#f43f5e';
      ctx.fillText(txt, this.x, this.y - this.height - 14);
      ctx.restore();
    }

    // 6. Draw Minun (leader) - ONLY if alive!
    if (!this.minunDead) {
      if (!(this.invulnTimer > 0 && Math.floor(performance.now() / 60) % 2 === 0)) {
        const isHitFlashing = this.hitstop > 0 || (this.state === 'HURT' && this.hitstun > 7);
        this.anim.draw(ctx, this.x, this.y, { flash: isHitFlashing });
      }

      // Minun's Blue Shield
      if (this.state === 'SHIELD') {
        const ratio = this.shield / this.maxShield;
        ctx.save();
        ctx.globalAlpha = 0.18 + ratio * 0.18;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.height * 0.5, 30 + ratio * 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Dynamic Environmental Lighting with smooth cinematic fade
    if (this.lightFadeAlpha > 0.008) {
      const activeChar = !this.minunDead ? this : this.partner;
      if (activeChar) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const lr = Math.round(this.lightFadeR || 250);
        const lg = Math.round(this.lightFadeG || 204);
        const lb = Math.round(this.lightFadeB || 21);
        const lightGrad = ctx.createRadialGradient(
          activeChar.x,
          activeChar.y - activeChar.height * 0.5,
          4,
          activeChar.x,
          activeChar.y - activeChar.height * 0.5,
          activeChar.height * 0.85
        );
        lightGrad.addColorStop(0, `rgba(${lr}, ${lg}, ${lb}, ${(this.lightFadeAlpha * 0.85).toFixed(3)})`);
        lightGrad.addColorStop(0.55, `rgba(${lr}, ${lg}, ${lb}, ${(this.lightFadeAlpha * 0.35).toFixed(3)})`);
        lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(activeChar.x, activeChar.y - activeChar.height * 0.5, activeChar.height * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  getSmashAttackDef(dir) {
    switch (dir) {
      case 'up':
        return {
          name: '¡Salto Alto Voltaje Sinergia! (Up Smash)',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 14,
          offsetY: 45,
          radius: 40,
          damage: 18,
          baseKnockback: 36,
          knockbackScaling: 1.60,
          angle: 88,
          type: 'electric',
          hitlag: 9,
          slashColor: '#f43f5e',
          onStart: (p) => {
            window.soundEngine.playSfx('shock');
            if (window.particleManager) {
              window.particleManager.spawnHitSparks(p.x, p.y - 35, 8, 'electric');
            }
          }
        };

      case 'down':
        return {
          name: '¡Polaridad Cruzada Terrestre! (Down Smash)',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 0,
          offsetY: 15,
          radius: 48,
          damage: 16,
          baseKnockback: 33,
          knockbackScaling: 1.45,
          angle: 52,
          type: 'electric',
          hitlag: 8,
          slashColor: '#38bdf8',
          onStart: (p) => {
            window.soundEngine.playSfx('shock');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(p.x, p.y - 15, '#38bdf8', 'electric', 46);
            }
          }
        };

      case 'side':
      default:
        return {
          name: '¡Chispazo Dúo Smash! (Side Smash)',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 38,
          offsetY: 22,
          radius: 42,
          damage: 17,
          baseKnockback: 35,
          knockbackScaling: 1.55,
          angle: 35,
          type: 'electric',
          hitlag: 9,
          slashColor: '#fbbf24',
          onStart: (p) => {
            window.soundEngine.playSfx('shock');
            if (window.particleManager) {
              window.particleManager.spawnLightningBolt(p.x, p.y - 20, p.x + p.facing * 55, p.y - 20, '#ffffff', '#fbbf24', 5);
            }
          }
        };
    }
  }
}

window.MinunPlusle = MinunPlusle;
