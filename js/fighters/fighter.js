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
    this.weight = config.weight || 90;

    // Movement attributes
    this.walkSpeed = config.walkSpeed || 3.8;
    this.dashSpeed = config.dashSpeed || 6.5;
    this.jumpForce = config.jumpForce || 13.5;
    this.doubleJumpForce = config.doubleJumpForce || 12.0;
    this.maxJumps = 2;
    this.jumpsLeft = 2;
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
      jump: false,
      jumpPressed: false,
      attack: false,
      attackPressed: false,
      special: false,
      specialPressed: false,
      shield: false,
      shieldPressed: false,
      downPressed: false
    };

    // Jump & Platform dynamics
    this.isJumping = false;
    this.lastDownTapTime = 0;

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
      this.shieldBreakTimer <= 0 &&
      this.hitstun <= 0 &&
      this.hitstop <= 0 &&
      this.actionLockTimer <= 0 &&
      !this.anim.isBusy()
    );
  }

  update(dt, opponent, stage) {
    this.actionLockTimer = Math.max(0, this.actionLockTimer - dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.specialCooldown = Math.max(0, this.specialCooldown - dt);
    this.shieldTapTimer = Math.max(0, this.shieldTapTimer - dt);
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
            opponent.takeHit(proj, this, hurtbox.target);
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

    // Respawn handling
    if (this.state === 'RESPAWN') {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.state = 'IDLE';
        this.invulnTimer = 2.0; // 2 seconds flashing invulnerability
        this.vx = 0;
        this.vy = 0;
        this.hitstop = 0;
        this.actionLockTimer = 0;
        this.anim.setAim('center');
        this.anim.loop('Idle', 1.0);
      }
      this.anim.update(dt);
      return;
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
    } else if ((this.input.shield || this.shieldTapTimer > 0) && this.state !== 'ATTACK' && this.state !== 'SPECIAL' && this.hitstun <= 0 && this.hitstop <= 0) {
      this.state = 'SHIELD';
      this.vx *= 0.65;
      this.shield = Math.max(0, this.shield - 22 * dt);
      this.anim.setAim('center');
      this.anim.loop('Idle', 0.55);
      if (this.shield <= 0) this.breakShield();
    } else if (this.state === 'SHIELD') {
      this.state = 'IDLE';
    } else if (this.state !== 'ATTACK' && this.state !== 'SPECIAL') {
      // Slow passive regeneration only while the shield is down.
      this.shield = Math.min(this.maxShield, this.shield + 13 * dt);
    }

    // Handle Attack progression
    if (this.state === 'ATTACK' || this.state === 'SPECIAL') {
      this._updateAttack(dt, opponent);
    }

    // Update Physics
    window.physicsEngine.updateFighter(this, stage, dt);

    // Variable Jump Height (Short Hop vs Full Hop):
    // Releasing Space early while rising cuts upward velocity for a smaller jump. Holding it reaches maximum jump height.
    if (this.isJumping && this.vy < 0) {
      if (!this.input.jump) {
        const shortHopCap = -this.jumpForce * 0.50;
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

  handleInputs(stage = null) {
    stage = stage || (window.game ? window.game.stage : null);

    // Shield is held rather than buffered: it cannot be used during attack recovery.
    if (this.input.shield && this.canAct()) return;
    if (!this.canAct()) return;

    // Movement (Left / Right)
    if (this.input.left && !this.input.right) {
      this.facing = -1;
      this.vx = -this.walkSpeed;
      if (this.isGrounded) {
        this.state = 'WALK';
        this.anim.loop('Walk', 1.2);
        if (Math.random() < 0.2 && window.particleManager) {
          window.particleManager.spawnSmoke(this.x + 8, this.y, '#cbd5e1', 5);
        }
      }
    } else if (this.input.right && !this.input.left) {
      this.facing = 1;
      this.vx = this.walkSpeed;
      if (this.isGrounded) {
        this.state = 'WALK';
        this.anim.loop('Walk', 1.2);
        if (Math.random() < 0.2 && window.particleManager) {
          window.particleManager.spawnSmoke(this.x - 8, this.y, '#cbd5e1', 5);
        }
      }
    } else if (this.isGrounded) {
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

    // Double tap Down to drop through semi-solid platforms
    if (this.input.downPressed) {
      this.input.downPressed = false;
      const now = performance.now() / 1000;
      if (this.isOnSemiSolidPlatform(stage)) {
        const dtSinceLast = now - this.lastDownTapTime;
        if (dtSinceLast > 0.04 && dtSinceLast < 0.38) {
          this.dropThroughPlatform();
          this.lastDownTapTime = 0;
          return;
        } else {
          this.lastDownTapTime = now;
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

  performBasicAttack() {
    if (this.attackCooldown > 0 || this.actionLockTimer > 0) return;
    let dir = 'neutral';
    if (this.input.up) dir = 'up';
    else if (this.input.down) dir = 'down';
    else if (this.input.left) { dir = 'side'; this.facing = -1; }
    else if (this.input.right) { dir = 'side'; this.facing = 1; }
    else dir = 'neutral';

    const isAir = !this.isGrounded;
    const attackDef = this.getBasicAttackDef(dir, isAir) || this.getUniversalBasicAttackDef(dir, isAir);
    if (!attackDef) return;

    this.state = 'ATTACK';
    this.currentAttack = attackDef;
    this.attackFrame = 0;
    this.hasHitOpponent = false;
    this.attackCooldown = attackDef.cooldown ?? 0.22;

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

    // Trigger animation
    this.anim.play(attackDef.anim || 'Attack', { speed: attackDef.animSpeed || 1.2 }, () => {
      this.state = 'IDLE';
      this.currentAttack = null;
      this.actionLockTimer = Math.max(this.actionLockTimer, attackDef.endLag ?? 0.14);
      this.anim.setAim('center');
    });

    if (attackDef.onStart) attackDef.onStart(this);
  }

  performSpecialMove() {
    if (this.specialCooldown > 0 || this.actionLockTimer > 0) return;
    // 4 distinct moves for X: Up, Down, Side (Left/Right), and Neutral (NO direction)
    let dir = 'neutral';
    if (this.input.up) dir = 'up';
    else if (this.input.down) dir = 'down';
    else if (this.input.left) { dir = 'side'; this.facing = -1; }
    else if (this.input.right) { dir = 'side'; this.facing = 1; }
    else dir = 'neutral'; // Neutral X: strictly when no arrow key is held!

    if (dir === 'up' && this.upSpecialUsed) return;

    const moveDef = this.getSpecialMoveDef(dir);
    if (!moveDef) return;

    this.state = 'SPECIAL';
    this.currentAttack = moveDef;
    this.attackFrame = 0;
    this.hasHitOpponent = false;
    this.specialCooldown = moveDef.cooldown ?? 0.55;
    if (dir === 'up') this.upSpecialUsed = true;

    if (dir === 'up') this.anim.setAim('up');
    else if (dir === 'down') this.anim.setAim('down');
    else this.anim.setAim('center');

    this.anim.play(moveDef.anim || 'Shoot', { speed: moveDef.animSpeed || 1.1 }, () => {
      this.state = 'IDLE';
      this.currentAttack = null;
      this.actionLockTimer = Math.max(this.actionLockTimer, moveDef.endLag ?? 0.24);
      this.anim.setAim('center');
    });

    if (moveDef.onStart) moveDef.onStart(this);
  }

  _updateAttack(dt, opponent) {
    if (!this.currentAttack) return;
    this.attackFrame += dt * 60;
    const atk = this.currentAttack;

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
            opponent.takeHit(hitbox, this, hurtbox.target);
            this.hasHitOpponent = true;
            this.hitstop = hitbox.hitlag; // Attacker hitfreeze
            if (atk.onHit) atk.onHit(this, opponent);
            break;
          }
        }
      }
    }
  }

  takeHit(hitbox, attacker, target = null) {
    if (this.invulnTimer > 0 || this.state === 'RESPAWN') return;

    if (this.state === 'SHIELD') {
      const shieldDamage = (hitbox.damage || 5) * 5.5 + (hitbox.baseKnockback || 0) * 0.45;
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

    // Apply damage %
    const dmg = hitbox.damage || 5;
    this.percent = Math.min(this.percent + dmg, 999);
    this.lastAttacker = attacker;

    // Play impact sound & particles
    const sfxName = dmg > 10 ? 'hit_heavy' : dmg > 6 ? 'hit_medium' : 'hit_light';
    window.soundEngine.playSfx(sfxName);
    if (hitbox.type === 'electric') window.soundEngine.playSfx('shock');

    if (window.particleManager) {
      window.particleManager.spawnHitSparks(this.x, this.y - this.height * 0.5, dmg, hitbox.type);
      window.particleManager.spawnFloatingText(this.x, this.y - this.height - 10, `+${dmg}%`, '#ff4444', 18);
    }

    // Freeze frames (hitlag)
    this.hitstop = hitbox.hitlag || 6;
    this.state = 'HURT';

    // Calculate launch knockback
    const kbSpeed = window.physicsEngine.calculateKnockback(
      this.percent,
      dmg,
      this.weight,
      hitbox.knockbackScaling,
      hitbox.baseKnockback
    );

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
    this.state = 'RESPAWN';
    this.respawnTimer = 1.4; // 1.4s respawn wait

    // Reposition to respawn platform
    this.x = stage.respawnX;
    this.y = stage.respawnY;
    this.isGrounded = false;
    this.anim.setAim('center');
    this.anim.loop('Idle', 1.0);

    if (window.game) {
      window.game.onFighterKO(this);
    }
  }

  draw(ctx) {
    // Flickering invulnerability effect after respawn
    if (this.invulnTimer > 0 && Math.floor(performance.now() / 60) % 2 === 0) {
      return;
    }

    // Shadow under feet if close to stage
    if (this.isGrounded) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.width * 0.55, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw active projectiles
    for (const proj of this.projectiles) {
      if (proj.draw) proj.draw(ctx);
    }

    // Draw sprite using SpriteAnimator
    const isHitFlashing = this.hitstop > 0 || (this.state === 'HURT' && this.hitstun > 15);
    this.anim.draw(ctx, this.x, this.y, { flash: isHitFlashing });

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
}

window.Fighter = Fighter;
