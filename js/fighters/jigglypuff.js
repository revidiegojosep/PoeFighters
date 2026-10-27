/**
 * Jigglypuff Fighter (Dex 39)
 * Normal / Fairy Floaty aerial specialist with Super Smash Bros moveset.
 *
 * Characteristics:
 *  - Floaty Physics: Very low gravity (0.48x), slow terminal fall (0.55x), supreme aerial mobility.
 *  - Multiple Mid-Air Jumps: 5 mid-air jumps (6 jumps total) as in Super Smash Bros!
 *  - Moveset:
 *    - Neutral X: Rollout (Desenrollar - Mantener para cargar velocidad y rodar como bola de demolición)
 *    - Side X: Pound (Destructor - Bofetada con impulso aéreo y daño colosal a escudos)
 *    - Up X: Sing (Canto - Ondas musicales que duermen al rival durante 2.2s dejándolo vulnerable)
 *    - Down X: Rest (Descanso - Hitbox en el centro exacto con daño de 25% y knockback vertical demoledor, duerme 2.2s)
 *    - Neutral Z: Bofetada Doble (Suelo) / Sex Kick (Aire - Nair persistente)
 *    - Side Z: Patada Frontal (Suelo) / Forward Air (Aire - "Wall of Pain" horizontal)
 *    - Up Z: Bofetada Ascendente (Suelo) / Up Air (Aire - Acrobacia de malabares)
 *    - Down Z: Barrido Bajo (Suelo) / Drill Kick (Aire - Taladro giratorio multihit con spike)
 */
class Jigglypuff extends window.Fighter {
  constructor(config = {}) {
    super({
      name: 'Jigglypuff',
      dex: 39,
      pokedexWeight: 5.5,
      weight: 5.5,
      weightCategory: 'Ligero',
      color: '#f472b6',      // Balloon Pink
      accentColor: '#ec4899',// Vivid Rose
      walkSpeed: 3.6,
      dashSpeed: 6.8,
      jumpForce: 6.8,        // Distancia de salto moderada para equilibrar sus 5 saltos
      doubleJumpForce: 5.2,  // Aleteos aéreos más suaves y controlables
      scale: 2.3,
      ...config
    });

    // Authentic Smash Bros Floaty Physics
    this.isFloaty = true;
    this.gravityMult = 0.52;
    this.terminalVelocityMult = 0.58;
    this.airFriction = 0.988;

    // 5 Mid-Air Jumps (6 jumps total)
    this.maxJumps = 5;
    this.jumpsLeft = this.maxJumps;

    // Special moves state
    this.restSleepTimer = 0;
    this.singCooldown = 0;
    this.singStartupTimer = 0;
    this.singAuraTimer = 0;
    this.singAuraRadius = 0;
    this.isRollingOut = false;
    this.rolloutSpeed = 0;
    this.rolloutTimer = 0;
  }

  getBasicAttackDef(dir, isAir = false) {
    if (isAir) {
      switch (dir) {
        case 'up':
          // Up Air: Overhead acrobatic flip slap (Juggling)
          return {
            name: 'Up Air (Voltereta Aérea)',
            anim: 'Attack',
            animSpeed: 1.4,
            hitboxStart: 2,
            hitboxEnd: 9,
            offsetX: 4,
            offsetY: 38,
            radius: 32,
            damage: 8,
            baseKnockback: 13,
            knockbackScaling: 0.9,
            angle: 88,
            type: 'normal',
            hitlag: 6,
            slashColor: '#f472b6',
            onStart: (p) => {
              window.soundEngine && window.soundEngine.playSfx('slap', 0.1);
            }
          };

        case 'down':
          // Down Air: Drill Kick - Multihit spinning drill kick with mild downward spike
          return {
            name: 'Drill Kick (Down Air)',
            anim: 'Attack',
            animSpeed: 1.5,
            hitboxStart: 2,
            hitboxEnd: 11,
            offsetX: 4,
            offsetY: -4,
            radius: 28,
            damage: 9,
            baseKnockback: 14,
            knockbackScaling: 0.85,
            angle: 275, // Downward drill pull
            type: 'normal',
            hitlag: 7,
            slashColor: '#ec4899',
            onStart: (p) => {
              window.soundEngine && window.soundEngine.playSfx('slap', 0.15);
            }
          };

        case 'side':
          // Forward Air: "Wall of Pain" aerial side kick with forward push!
          return {
            name: 'Forward Air ("Wall of Pain")',
            anim: 'Attack',
            animSpeed: 1.35,
            hitboxStart: 2,
            hitboxEnd: 10,
            offsetX: 30,
            offsetY: 18,
            radius: 30,
            damage: 9,
            baseKnockback: 14,
            knockbackScaling: 1.05,
            angle: 35, // Horizontal carry angle
            type: 'normal',
            hitlag: 6,
            slashColor: '#f472b6',
            onStart: (p) => {
              p.vx += p.facing * 3.2; // Forward aerial boost
              window.soundEngine && window.soundEngine.playSfx('slap', 0.05);
            }
          };

        case 'neutral':
        default:
          // Neutral Air: Sex Kick (early strong kick, late persistent linger)
          return {
            name: 'Nair (Patada Circular)',
            anim: 'Attack',
            animSpeed: 1.35,
            hitboxStart: 1,
            hitboxEnd: 12,
            offsetX: 16,
            offsetY: 18,
            radius: 30,
            damage: 8,
            baseKnockback: 12,
            knockbackScaling: 0.8,
            angle: 48,
            type: 'normal',
            hitlag: 6,
            slashColor: '#f472b6',
            onStart: (p) => {
              window.soundEngine && window.soundEngine.playSfx('slap', 0.1);
            }
          };
      }
    }

    // Ground attacks
    switch (dir) {
      case 'up':
        // Up Tilt: Arc upward slap
        return {
          name: 'Bofetada Ascendente (Up Tilt)',
          anim: 'Attack',
          animSpeed: 1.4,
          hitboxStart: 2,
          hitboxEnd: 8,
          offsetX: 12,
          offsetY: 34,
          radius: 28,
          damage: 7,
          baseKnockback: 12,
          knockbackScaling: 0.8,
          angle: 86,
          type: 'normal',
          hitlag: 5,
          slashColor: '#f472b6',
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('slap', 0.1);
          }
        };

      case 'down':
        // Down Tilt: Low trip foot swipe
        return {
          name: 'Barrido Bajo (Down Tilt)',
          anim: 'Attack',
          animSpeed: 1.4,
          hitboxStart: 2,
          hitboxEnd: 7,
          offsetX: 26,
          offsetY: 8,
          radius: 22,
          damage: 6,
          baseKnockback: 9,
          knockbackScaling: 0.7,
          angle: 70,
          type: 'normal',
          hitlag: 5,
          slashColor: '#ec4899',
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('slap', 0.05);
          }
        };

      case 'side':
        // Forward Tilt: Front kick
        return {
          name: 'Patada Frontal (Side Tilt)',
          anim: 'Attack',
          animSpeed: 1.3,
          hitboxStart: 2,
          hitboxEnd: 8,
          offsetX: 30,
          offsetY: 16,
          radius: 26,
          damage: 8,
          baseKnockback: 13,
          knockbackScaling: 0.95,
          angle: 40,
          type: 'normal',
          hitlag: 6,
          slashColor: '#f472b6',
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('slap', 0.1);
          }
        };

      case 'neutral':
      default:
        // Jab 1 & 2
        return {
          name: 'Doble Bofetada (Neutral Z)',
          anim: 'Attack',
          animSpeed: 1.5,
          hitboxStart: 2,
          hitboxEnd: 7,
          offsetX: 24,
          offsetY: 18,
          radius: 22,
          damage: 5,
          baseKnockback: 7,
          knockbackScaling: 0.5,
          angle: 45,
          type: 'normal',
          hitlag: 4,
          slashColor: '#f472b6',
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('hit_light');
          }
        };
    }
  }

  getSpecialMoveDef(dir) {
    switch (dir) {
      case 'neutral':
        // Neutral Special: Desenrollar (Rollout)
        return {
          name: 'Desenrollar (Neutral X - Mantener para Cargar)',
          anim: 'Walk',
          chargeAnim: 'Charge',
          animSpeed: 2.5,
          quickRecover: true,
          canCharge: true,
          holdToCharge: true,
          maxCharge: 1.6,
          cooldown: 0.8,
          endLag: 0.15,
          hitboxStart: 999,
          hitboxEnd: 999,
          chargeBannerText: '¡CARGANDO DESENROLLAR!',
          chargeBannerColor: '#f472b6',
          onStart: (j) => {
            window.soundEngine && window.soundEngine.playSfx('rollout', 0.05);
            if (window.particleManager) {
              window.particleManager.spawnSmoke(j.x, j.y, '#f472b6', 6);
            }
          },
          onCharge: (j, chargeTime, maxCharge) => {
            const ratio = Math.min(1.0, chargeTime / maxCharge);
            if (Math.random() < 0.4 && window.particleManager) {
              window.particleManager.spawnSmoke(j.x + (Math.random() - 0.5) * 20, j.y, '#fbcfe8', 3);
            }
          },
          onFire: (j, chargeRatio) => {
            const speed = 12 + chargeRatio * 15;
            const dmg = Math.round(8 + chargeRatio * 11);
            j.isRollingOut = true;
            j.rolloutSpeed = j.facing * speed;
            j.rolloutTimer = 0.55 + chargeRatio * 0.45;
            j.actionLockTimer = j.rolloutTimer;
            j.anim.loop('Walk', 3.0);
            window.soundEngine && window.soundEngine.playSfx('dash');

            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(j.x, j.y - 15, '#f472b6', 'normal', 28);
              window.particleManager.spawnFloatingText(j.x, j.y - j.height - 18, `¡DESENROLLAR! (${dmg}%)`, '#ec4899', 16);
            }
          }
        };

      case 'side':
        // Side Special: Destructor (Pound)
        // Aerial propulsion + colossal shield breaker
        return {
          name: 'Destructor / Pound (Side X)',
          anim: 'Attack',
          animSpeed: 1.3,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 36,
          offsetY: 20,
          radius: 36,
          damage: 11,
          baseKnockback: 16,
          knockbackScaling: 1.05,
          angle: 40,
          type: 'normal',
          hitlag: 8,
          slashColor: '#ec4899',
          cooldown: 0.4, // CD de 0.4 segundos
          endLag: 0.18,
          onStart: (j) => {
            j.specialCooldown = Math.max(j.specialCooldown, 0.4);
            // Forward and slight upward momentum to float horizontally
            j.vx = j.facing * 7.5;
            j.vy = -3.8;
            window.soundEngine && window.soundEngine.playSfx('slap', 0.2);
            if (window.particleManager) {
              window.particleManager.spawnSmoke(j.x, j.y, '#f472b6', 7);
              window.particleManager.spawnFloatingText(j.x, j.y - j.height - 16, '¡DESTRUCTOR! (Escudo++)', '#f472b6', 15);
            }
          },
          onHit: (j, opponent) => {
            // Massive bonus damage to shields
            if (opponent && opponent.state === 'SHIELD') {
              opponent.shield = Math.max(0, opponent.shield - 55);
              if (opponent.shield <= 0) opponent.breakShield();
            }
          }
        };

      case 'up':
        // Up Special: Canto (Sing)
        // Sings soothing lullaby in musical soundwaves: puts nearby foes to SLEEP
        return {
          name: 'Canto (Up X - Duerme al Rival)',
          anim: 'Shoot',
          animSpeed: 1.0,
          hitboxStart: 999,
          hitboxEnd: 999,
          cooldown: 5.0, // Nerf Canto: CD aumentada (de 2.2s a 5.0s)
          endLag: 0.4,   // Lag de 0.4 segundos
          onStart: (j) => {
            // Lag de 0.4 segundos al hacer el movimiento: Jigglypuff queda fija cantando
            j.actionLockTimer = 0.4;
            j.specialCooldown = Math.max(j.specialCooldown, 5.0);
            j.singStartupTimer = 0.4; // Lag de inicio de 0.4s antes del sueño
            j.singAuraTimer = 1.4;
            j.singAuraRadius = 25;
            window.soundEngine && window.soundEngine.playSfx('sing');

            if (window.particleManager) {
              window.particleManager.spawnFloatingText(j.x, j.y - j.height - 20, '🎵 ¡CANTO! (0.4s Lag)', '#38bdf8', 18);
            }
          }
        };

      case 'down':
        // Down Special: Descanso (Rest)
        // Pinpoint instant center hitbox: 25% damage + MASSIVE vertical knockback. Jigglypuff sleeps 2.2s.
        return {
          name: '¡Descanso! / Rest (Down X)',
          anim: 'Charge',
          animSpeed: 1.0,
          hitboxStart: 1,
          hitboxEnd: 4,
          offsetX: 0, // Hitbox directly in center!
          offsetY: 16,
          radius: 20,
          damage: 25,
          baseKnockback: 34,
          knockbackScaling: 1.9,
          angle: 88, // Devastating vertical blast!
          type: 'electric',
          hitlag: 16, // Freeze frame impact
          slashColor: '#ffffff',
          onStart: (j) => {
            j.restSleepTimer = 2.2;
            j.actionLockTimer = 2.2;
            window.soundEngine && window.soundEngine.playSfx('rest');

            if (window.particleManager) {
              window.particleManager.spawnFloatingText(j.x, j.y - j.height - 22, '💤 ¡DESCANSO! (Zzz)', '#f472b6', 20);
            }
          },
          onHit: (j, opponent) => {
            // Blast impact!
            if (window.game) {
              window.game.triggerScreenShake(26, 0.55);
            }
            window.soundEngine && window.soundEngine.playSfx('blast_ko');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(opponent.x, opponent.y - 20, '#f472b6', 'electric', 60);
              window.particleManager.spawnFloatingText(opponent.x, opponent.y - opponent.height - 30, '★ ¡REST KO! ★', '#facc15', 28);
            }
          }
        };

      default:
        return this.getUniversalSpecialMoveDef(dir);
    }
  }

  update(dt, opponent, stage) {
    // 1. Handle Rest Sleep
    if (this.restSleepTimer > 0) {
      this.restSleepTimer = Math.max(0, this.restSleepTimer - dt);
      this.actionLockTimer = Math.max(this.actionLockTimer, this.restSleepTimer);
      this.vx *= 0.85;
      if (this.anim.curAnim !== 'Idle') {
        this.anim.loop('Idle', 0.4);
      }
      if (Math.random() < 0.25 && window.particleManager) {
        window.particleManager.spawnFloatingText(this.x + (Math.random() - 0.5) * 16, this.y - this.height - 10, 'Zzz', '#f472b6', 13);
      }
    }

    // 2. Handle Sing Lullaby Aura
    if (this.singAuraTimer > 0) {
      if (this.singStartupTimer > 0) {
        this.singStartupTimer = Math.max(0, this.singStartupTimer - dt);
      }
      this.singAuraTimer = Math.max(0, this.singAuraTimer - dt);
      this.singAuraRadius = Math.min(105, this.singAuraRadius + dt * 70);

      // Check if opponent is caught in singing range (only active after 0.4s lag!)
      if (this.singStartupTimer <= 0 && opponent && opponent.state !== 'RESPAWN' && opponent.invulnTimer <= 0) {
        const dist = Math.hypot(opponent.x - this.x, opponent.y - this.y);
        if (dist <= this.singAuraRadius && (!opponent.statuses || !opponent.statuses.sleep || !opponent.statuses.sleep.active)) {
          if (typeof opponent.applyStatus === 'function') {
            opponent.applyStatus('sleep', 2.0);
          } else {
            opponent.actionLockTimer = Math.max(opponent.actionLockTimer || 0, 2.0);
          }
          window.soundEngine && window.soundEngine.playSfx('sing');
          if (window.particleManager) {
            window.particleManager.spawnFloatingText(opponent.x, opponent.y - opponent.height - 18, '💤 ¡DORMIDO! (Zzz)', '#38bdf8', 18);
          }
        }
      }
    }

    // 3. Handle Rollout Movement
    if (this.isRollingOut) {
      this.rolloutTimer -= dt;
      this.vx = this.rolloutSpeed;

      // Spawn dust
      if (Math.random() < 0.5 && window.particleManager) {
        window.particleManager.spawnSmoke(this.x, this.y, '#f472b6', 5);
      }

      // Check collision with opponent during rollout
      if (opponent && opponent.state !== 'RESPAWN' && opponent.invulnTimer <= 0) {
        const dist = Math.hypot(opponent.x - this.x, (opponent.y - 20) - (this.y - 20));
        if (dist < 38) {
          const roHitbox = this.getModifiedHitbox({
            x: this.x,
            y: this.y - 18,
            radius: 30,
            damage: 14,
            baseKnockback: 22,
            knockbackScaling: 1.25,
            angle: 45,
            type: 'normal',
            hitlag: 8
          }, false);
          opponent.takeHit(roHitbox, this);
          this.isRollingOut = false;
          this.vx = -this.rolloutSpeed * 0.45; // Bounce off
          this.actionLockTimer = 0.25;
          window.soundEngine && window.soundEngine.playSfx('hit_heavy');
        }
      }

      // Check wall hit
      if (this.x < 120 || this.x > (stage ? stage.width - 120 : 900)) {
        this.rolloutSpeed = -this.rolloutSpeed;
        this.facing = this.rolloutSpeed > 0 ? 1 : -1;
      }

      if (this.rolloutTimer <= 0) {
        this.isRollingOut = false;
        this.actionLockTimer = 0.2;
        this.anim.loop('Idle', 1.0);
      }
    }

    // Call base update
    super.update(dt, opponent, stage);

    // Reset jumps upon touching ground and apply progressive jump force
    if (this.isGrounded) {
      this.jumpsLeft = this.maxJumps;
      this.doubleJumpForce = 5.2;
    } else {
      // Each consecutive mid-air flutter hop has slightly lower force to keep max height balanced
      const jumpsUsed = this.maxJumps - this.jumpsLeft;
      this.doubleJumpForce = Math.max(3.6, 5.2 - jumpsUsed * 0.35);
    }
  }

  draw(ctx, opts = {}) {
    // Sing Musical Soundwaves
    if (this.singAuraTimer > 0) {
      ctx.save();
      const pulse = Math.sin(performance.now() * 0.015);
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.45 + pulse * 0.25})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;

      ctx.beginPath();
      ctx.arc(this.x, this.y - 22, this.singAuraRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(244, 114, 182, ${0.35 + pulse * 0.2})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 22, Math.max(10, this.singAuraRadius * 0.65), 0, Math.PI * 2);
      ctx.stroke();

      // Floating musical notes
      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('♪', this.x - this.singAuraRadius * 0.7, this.y - 28 + pulse * 4);
      ctx.fillText('♫', this.x + this.singAuraRadius * 0.65, this.y - 34 - pulse * 4);
      ctx.restore();
    }

    // Base draw
    super.draw(ctx, opts);
  }
}

window.Jigglypuff = Jigglypuff;
