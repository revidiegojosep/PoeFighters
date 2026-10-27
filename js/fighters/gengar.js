/**
 * Gengar Fighter (Dex 94)
 * Ghost/Poison powerhouse with deceptive mobility, status infliction,
 * shadow projectiles, and disruptive crowd control.
 *
 * Moveset:
 *  - Neutral X: Bola Sombra (Shadow Ball charging projectile)
 *  - Side X: Lenguetazo (Ghostly tongue whip that stuns target for 0.4s!)
 *  - Up X: Teletransportación (Shadow Teleport ethereal recovery)
 *  - Down X: Tóxico AOE (Area-of-effect venom cloud inflicting Veneno for 5s)
 *  - Neutral Z: Garra Umbría (Shadow Claw multi-jab)
 *  - Side Z: Puño Sombra (Shadow Punch heavy forward blow)
 *  - Up Z: Elevación Espectral (Upward shadow uppercut)
 *  - Down Z (Air): Pesadilla Meteoro (Downward meteor spike)
 */
class Gengar extends window.Fighter {
  constructor(config = {}) {
    super({
      name: 'Gengar',
      dex: 94,
      pokedexWeight: 40.5,
      weight: 40.5,
      weightCategory: 'Pesado',
      color: '#7c3aed', // Ghostly Violet
      accentColor: '#c084fc', // Spectral Lilac
      walkSpeed: 4.0, // Peso pesado corpulento (+20% base)
      dashSpeed: 6.6,
      jumpForce: 10.15, // Reducido un 30% su salto (era 14.5 * 0.70)
      doubleJumpForce: 9.1, // Reducido un 30% (era 13.0 * 0.70)
      scale: 2.4,
      ...config
    });

    // Floaty Ghost physics
    this.isFloaty = true;
    this.gravityMult = 0.60;
    this.terminalVelocityMult = 0.65;
    this.airFriction = 0.985;

    // Shadow Ball (Bola Sombra) charging & storage state
    this.shadowBallStored = false;
    this.shadowBallStoreTimer = 0;
  }

  getBasicAttackDef(dir, isAir = false) {
    if (isAir) {
      switch (dir) {
        case 'up':
          // Up Air: Ethereal upward claw swipe
          return {
            name: 'Garra Astral (Up Air)',
            anim: 'Attack',
            animSpeed: 1.35,
            hitboxStart: 2,
            hitboxEnd: 9,
            offsetX: 8,
            offsetY: 42,
            radius: 36,
            damage: 9,
            baseKnockback: 14,
            knockbackScaling: 0.9,
            angle: 85,
            type: 'shadow',
            hitlag: 6,
            slashColor: '#c084fc',
            onStart: (g) => {
              window.soundEngine.playSfx('lick', 0.1);
              if (window.particleManager) {
                window.particleManager.spawnHitSparks(g.x, g.y - 35, 4, 'shadow');
              }
            }
          };

        case 'down':
          // Down Air: Pesadilla Meteoro (Downward shadow dive / meteor spike!)
          return {
            name: 'Pesadilla Meteoro (Down Air / Spike)',
            anim: 'Attack',
            animSpeed: 1.3,
            hitboxStart: 3,
            hitboxEnd: 11,
            offsetX: 8,
            offsetY: -6,
            radius: 34,
            damage: 11,
            baseKnockback: 18,
            knockbackScaling: 1.15,
            angle: 280, // Downward meteor spike!
            type: 'shadow',
            hitlag: 8,
            slashColor: '#9333ea',
            onStart: (g) => {
              window.soundEngine.playSfx('shadow', 0.1);
              if (window.particleManager) {
                window.particleManager.spawnHitSparks(g.x, g.y + 6, 6, 'shadow');
              }
            }
          };

        case 'side':
          // Forward Air: Spectral Shadow Punch
          return {
            name: 'Puño Fantasma Aéreo (Forward Air)',
            anim: 'Attack',
            animSpeed: 1.3,
            hitboxStart: 3,
            hitboxEnd: 10,
            offsetX: 32,
            offsetY: 20,
            radius: 30,
            damage: 8,
            baseKnockback: 13,
            knockbackScaling: 0.95,
            angle: 45,
            type: 'shadow',
            hitlag: 6,
            slashColor: '#a855f7',
            onStart: (g) => {
              window.soundEngine.playSfx('hit_medium');
            }
          };

        case 'neutral':
        default:
          return {
            name: 'Giro Espectral (Neutral Air)',
            anim: 'Attack',
            animSpeed: 1.4,
            hitboxStart: 2,
            hitboxEnd: 8,
            offsetX: 0,
            offsetY: 20,
            radius: 34,
            damage: 7,
            baseKnockback: 10,
            knockbackScaling: 0.8,
            angle: 50,
            type: 'shadow',
            hitlag: 5,
            slashColor: '#c084fc'
          };
      }
    }

    // Ground Basic Attacks
    switch (dir) {
      case 'up':
        return {
          name: 'Gancho Sombra (Up Tilt)',
          anim: 'Attack',
          animSpeed: 1.35,
          hitboxStart: 2,
          hitboxEnd: 9,
          offsetX: 12,
          offsetY: 40,
          radius: 32,
          damage: 8,
          baseKnockback: 13,
          knockbackScaling: 0.85,
          angle: 85,
          type: 'shadow',
          hitlag: 5,
          slashColor: '#c084fc',
          onStart: (g) => {
            window.soundEngine.playSfx('hit_light');
          }
        };

      case 'down':
        return {
          name: 'Barrido Espectral (Down Tilt)',
          anim: 'Attack',
          animSpeed: 1.3,
          hitboxStart: 2,
          hitboxEnd: 8,
          offsetX: 24,
          offsetY: 10,
          radius: 26,
          damage: 6,
          baseKnockback: 11,
          knockbackScaling: 0.7,
          angle: 70,
          type: 'shadow',
          hitlag: 4,
          slashColor: '#a855f7'
        };

      case 'side':
        return {
          name: 'Puño Sombra (Forward Tilt)',
          anim: 'Attack',
          animSpeed: 1.25,
          hitboxStart: 3,
          hitboxEnd: 10,
          offsetX: 32,
          offsetY: 22,
          radius: 28,
          damage: 9,
          baseKnockback: 14,
          knockbackScaling: 0.95,
          angle: 40,
          type: 'shadow',
          hitlag: 6,
          slashColor: '#9333ea',
          onStart: (g) => {
            window.soundEngine.playSfx('shadow');
          }
        };

      case 'neutral':
      default:
        return {
          name: 'Garra Umbría (Neutral Z)',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 8,
          offsetX: 26,
          offsetY: 20,
          radius: 24,
          damage: 5,
          baseKnockback: 8,
          knockbackScaling: 0.55,
          angle: 45,
          type: 'shadow',
          hitlag: 4,
          slashColor: '#7c3aed',
          onStart: (g) => {
            window.soundEngine.playSfx('hit_light');
          }
        };
    }
  }

  getSpecialMoveDef(dir) {
    switch (dir) {
      case 'neutral':
        // Neutral Special: Bola Sombra (Shadow Ball)
        // If Gengar already has a fully charged Bola Sombra stored, fire it immediately!
        if (this.shadowBallStored) {
          return {
            name: 'Bola Sombra Cargada (Neutral X)',
            anim: 'Shoot',
            animSpeed: 3.2,
            quickRecover: true,
            hitboxStart: 999,
            hitboxEnd: 999,
            cooldown: 1.0, // CD de bola sombra: 1 segundo
            endLag: 0.42, // Lag aumentado en 0.4 segundos (0.02s + 0.40s) para moverse tras lanzar
            onStart: (g) => {
              g.actionLockTimer = Math.max(g.actionLockTimer, 0.42);
              g.specialCooldown = Math.max(g.specialCooldown, 1.0);
              g.shadowBallStored = false;
              g.shadowBallStoreTimer = 0;
              this._fireShadowBall(g, 1.0);
            }
          };
        }

        // Hold X to charge up to 2 seconds; release at any time to fire; press Left or Right at max to store!
        return {
          name: 'Bola Sombra (Neutral X - Mantener para Cargar)',
          anim: 'Shoot',
          chargeAnim: 'Charge',
          animSpeed: 3.2,
          quickRecover: true,
          canCharge: true,
          holdToCharge: true,
          canStoreCharge: true,
          maxCharge: 2.0, // Reducido de 3s a 2s
          cooldown: 1.0, // CD de bola sombra: 1 segundo
          endLag: 0.42, // Lag aumentado en 0.4 segundos (0.02s + 0.40s) para moverse tras lanzar
          hitboxStart: 999,
          hitboxEnd: 999,
          chargeBannerText: '¡CARGANDO BOLA SOMBRA!',
          chargeBannerColor: '#c084fc',
          onStart: (g) => {
            if (window.particleManager) {
              window.particleManager.spawnHitSparks(g.x + g.facing * 20, g.y - 24, 4, 'shadow');
            }
          },
          onCharge: (g, chargeTime, maxCharge) => {
            const ratio = Math.min(1.0, chargeTime / maxCharge);
            if (Math.random() < 0.45 && window.particleManager) {
              const rad = 14 + ratio * 16;
              const angle = Math.random() * Math.PI * 2;
              const sx = g.x + g.facing * 28 + Math.cos(angle) * rad;
              const sy = g.y - 24 + Math.sin(angle) * rad;
              window.particleManager.spawnHitSparks(sx, sy, 1, 'shadow');
            }
          },
          onMaxCharge: (g) => {
            window.soundEngine && window.soundEngine.playSfx('shadow');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(g.x + g.facing * 28, g.y - 24, '#c084fc', 'shadow', 42);
              window.particleManager.spawnFloatingText(
                g.x,
                g.y - g.height - 20,
                '¡BOLA SOMBRA MÁXIMA! (⬅️/➡️ para guardar)',
                '#c084fc',
                17
              );
            }
          },
          onStoreCharge: (g) => {
            g.shadowBallStored = true;
            g.shadowBallStoreTimer = 8.0;
            window.soundEngine && window.soundEngine.playSfx('select');
            window.soundEngine && window.soundEngine.playSfx('shadow');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(g.x, g.y - 20, '#a855f7', 'shadow', 34);
              window.particleManager.spawnFloatingText(
                g.x,
                g.y - g.height - 20,
                '¡BOLA SOMBRA GUARDADA! (8s)',
                '#e9d5ff',
                18
              );
            }
          },
          onFire: (g, chargeRatio) => {
            this._fireShadowBall(g, chargeRatio);
            g.actionLockTimer = Math.max(g.actionLockTimer, 0.42);
            g.specialCooldown = Math.max(g.specialCooldown, 1.0);
          }
        };

      case 'side':
        // Side Special: Puño Sombra (Shadow Punch)
        // Rework: ¡Siempre lanza hacia arriba (angle: 88°) con knockback reducido un 30%!
        return {
          name: 'Puño Sombra (Side X)',
          anim: 'Attack',
          animSpeed: 1.35,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 38,
          offsetY: 22,
          radius: 40,
          damage: 11,
          baseKnockback: 18.2, // Reducido un 30% (de 26 a 18.2)
          knockbackScaling: 0.805, // Reducido un 30% (de 1.15 a 0.805)
          angle: 88, // Siempre lanza hacia arriba en lugar de a los lados!
          type: 'shadow',
          hitlag: 8,
          slashColor: '#c084fc',
          onStart: (g) => {
            // Forward spectral lunge
            g.vx = g.facing * 7.5;
            window.soundEngine.playSfx('shadow');
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(g.x, g.y, 'up', g.facing, '#c084fc', 'shadow', 48, false);
              window.particleManager.spawnFloatingText(g.x, g.y - g.height - 18, '¡PUÑO SOMBRA VERTICAL! ⬆️', '#c084fc', 16);
              window.particleManager.spawnRadialBurst(g.x + g.facing * 28, g.y - 20, '#7c3aed', 'shadow', 36);
            }
          },
          onHit: (attacker, victim) => {
            window.soundEngine.playSfx('shadow');
            if (window.particleManager) {
              window.particleManager.spawnHitSparks(victim.x, victim.y - victim.height * 0.5, 10, 'shadow');
            }
          }
        };

      case 'up':
        // Up Special: Teletransportación (Shadow Teleport ethereal recovery)
        return {
          name: 'Teletransportación (Up X)',
          anim: 'Charge',
          animSpeed: 1.5,
          hitboxStart: 999,
          hitboxEnd: 999,
          onStart: (g) => {
            window.soundEngine.playSfx('teleport');

            // Burst at starting point
            if (window.particleManager) {
              window.particleManager.spawnSmoke(g.x, g.y - 15, '#9333ea', 12);
              window.particleManager.spawnHitSparks(g.x, g.y - 20, 6, 'shadow');
            }

            // Directional teleport calculation (Buffed range: ~210px horizontal, ~240-290px vertical)
            const dirX = g.input.left ? -1 : g.input.right ? 1 : 0;
            const dirY = g.input.up ? -1 : g.input.down ? 1 : 0;

            const moveX = dirX !== 0 ? dirX * 210 : g.facing * 60;
            let moveY = -240; // High upward recovery
            if (dirY === -1) moveY = -295; // Extra altitude when holding Up
            else if (dirY === 1) moveY = -120; // Lower diagonal dash when holding Down

            g.x += moveX;
            g.y += moveY;
            g.vy = -5.2; // Smooth floaty ascent
            g.vx = (dirX !== 0 ? dirX : g.facing * 0.5) * 3.5;
            g.upSpecialUsed = true;
            g.invulnTimer = 0.28; // Ethereal invulnerability during warp

            // Reappearance burst
            setTimeout(() => {
              window.soundEngine.playSfx('teleport');
              if (window.particleManager) {
                window.particleManager.spawnSmoke(g.x, g.y - 15, '#c084fc', 18);
                window.particleManager.spawnHitSparks(g.x, g.y - 20, 12, 'shadow');
                window.particleManager.spawnFloatingText(g.x, g.y - g.height - 15, '¡MEGA TELEPORT!', '#c084fc', 16);
              }
            }, 60);
          }
        };

      case 'down':
        // Down Special: Tóxico AOE (Venomous cloud that inflicts Veneno for 5s)
        return {
          name: 'Tóxico AOE (Down X - Veneno 5s)',
          anim: 'Charge',
          animSpeed: 1.25,
          hitboxStart: 3,
          hitboxEnd: 18,
          offsetX: 0,
          offsetY: 20,
          radius: 54, // 360° area of effect
          damage: 6,
          baseKnockback: 9,
          knockbackScaling: 0.5,
          angle: 60,
          type: 'poison',
          hitlag: 6,
          onStart: (g) => {
            window.soundEngine.playSfx('poison');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(g.x, g.y - 20, '#a855f7', 'poison', 54);
              window.particleManager.spawnHitSparks(g.x, g.y - 20, 10, 'poison');
            }
          },
          onHit: (attacker, victim) => {
            // Apply Veneno status for 5 seconds!
            if (victim && victim.applyStatus) {
              victim.applyStatus('poison', 5.0);
            } else if (victim && victim.statuses && victim.statuses.poison) {
              victim.statuses.poison.active = true;
              victim.statuses.poison.timer = 5.0;
              victim.statuses.poison.tickTimer = 1.7;
            }
          }
        };

      default:
        return this.getSpecialMoveDef('neutral');
    }
  }

  getSmashAttackDef(dir) {
    switch (dir) {
      case 'up':
        return {
          name: '¡Geiser Espectral Devastador! (Up Smash)',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 14,
          offsetY: 48,
          radius: 42,
          damage: 20,
          baseKnockback: 38,
          knockbackScaling: 1.65,
          angle: 86,
          type: 'shadow',
          hitlag: 10,
          slashColor: '#c084fc',
          onStart: (g) => {
            window.soundEngine.playSfx('shadow');
            if (window.particleManager) {
              window.particleManager.spawnSmoke(g.x, g.y - 30, '#c084fc', 14);
              window.particleManager.spawnHitSparks(g.x, g.y - 40, 10, 'shadow');
            }
          }
        };

      case 'down':
        return {
          name: '¡Furia Tóxica Terrestre! (Down Smash - Veneno)',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 0,
          offsetY: 15,
          radius: 52,
          damage: 16,
          baseKnockback: 34,
          knockbackScaling: 1.48,
          angle: 60,
          type: 'poison',
          hitlag: 9,
          slashColor: '#a855f7',
          onStart: (g) => {
            window.soundEngine.playSfx('poison');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(g.x, g.y - 15, '#a855f7', 'poison', 52);
            }
          },
          onHit: (attacker, victim) => {
            if (victim && victim.applyStatus) {
              victim.applyStatus('poison', 5.0);
            }
          }
        };

      case 'side':
      default:
        return {
          name: '¡Puño Sombra Titánico! (Side Smash)',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 38,
          offsetY: 22,
          radius: 44,
          damage: 19,
          baseKnockback: 38,
          knockbackScaling: 1.60,
          angle: 36,
          type: 'shadow',
          hitlag: 10,
          slashColor: '#9333ea',
          onStart: (g) => {
            window.soundEngine.playSfx('shadow');
            if (window.particleManager) {
              window.particleManager.spawnSmoke(g.x + g.facing * 25, g.y - 20, '#9333ea', 12);
              window.particleManager.spawnHitSparks(g.x + g.facing * 30, g.y - 20, 8, 'shadow');
            }
          }
        };
    }
  }

  _fireShadowBall(g, chargeRatio = 0) {
    window.soundEngine && window.soundEngine.playSfx('shadow');
    const spawnX = g.x + g.facing * 30;
    const spawnY = g.y - 24;

    // Up to 30% increase in damage and projectile velocity
    // Base damage: 10.8 (+20% buff) -> at 1.0 charge: 10.8 * 1.30 = 14.0
    const damage = parseFloat((10.8 * (1 + 0.30 * chargeRatio)).toFixed(1));
    // Base speed: 7.5 -> at 1.0 charge: 7.5 * 1.30 = 9.75
    const speed = parseFloat((7.5 * (1 + 0.30 * chargeRatio)).toFixed(2));
    // Base knockback: 14 -> at 1.0 charge: 14 * 1.30 = 18.2
    const baseKnockback = parseFloat((14 * (1 + 0.30 * chargeRatio)).toFixed(1));
    // Scaling: 0.95 -> at 1.0 charge: 0.95 * 1.30 = 1.235
    const knockbackScaling = parseFloat((0.95 * (1 + 0.30 * chargeRatio)).toFixed(3));
    // Radius: 18 -> up to 28
    const radius = Math.round(18 + 10 * chargeRatio);

    if (chargeRatio > 0.3 && window.particleManager) {
      window.particleManager.spawnRadialBurst(spawnX, spawnY, '#9333ea', 'shadow', 24 + chargeRatio * 20);
      if (chargeRatio >= 0.95) {
        window.particleManager.spawnFloatingText(g.x, g.y - g.height - 20, '¡BOLA SOMBRA 100%! (+30%)', '#c084fc', 18);
      }
    }

    g.projectiles.push({
      x: spawnX,
      y: spawnY,
      vx: g.facing * speed,
      vy: 0,
      radius: radius,
      damage: damage,
      baseKnockback: baseKnockback,
      knockbackScaling: knockbackScaling,
      angle: 45,
      type: 'shadow',
      hitlag: 6 + Math.round(chargeRatio * 4),
      life: 2.2,
      hitStage: true,
      pulse: 0,
      chargeRatio: chargeRatio,
      update: function(dt) {
        this.pulse += dt * (8 + chargeRatio * 6);
        if (window.particleManager && Math.random() < 0.45) {
          window.particleManager.spawnHitSparks(this.x, this.y, 1, 'shadow');
        }
      },
      onHit: function(victim) {
        window.soundEngine && window.soundEngine.playSfx('shadow');
        if (window.particleManager) {
          window.particleManager.spawnRadialBurst(this.x, this.y, '#9333ea', 'shadow', 32 + chargeRatio * 18);
          window.particleManager.spawnHitSparks(this.x, this.y, 10 + Math.round(chargeRatio * 8), 'shadow');
        }
      },
      draw: function(ctx) {
        ctx.save();
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 16 + chargeRatio * 16;
        const grad = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, this.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.25, '#e9d5ff');
        grad.addColorStop(0.55, '#a855f7');
        grad.addColorStop(0.85, '#581c87');
        grad.addColorStop(1, '#090d16');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Swirling shadow corona
        ctx.strokeStyle = '#e9d5ff';
        ctx.lineWidth = 2 + chargeRatio * 1.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * (0.8 + 0.25 * Math.sin(this.pulse)), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  update(dt, opponent, stage) {
    super.update(dt, opponent, stage);

    // Stored Bola Sombra countdown (8 seconds limit)
    if (this.shadowBallStored) {
      this.shadowBallStoreTimer -= dt;
      if (this.shadowBallStoreTimer <= 0) {
        this.shadowBallStored = false;
        this.shadowBallStoreTimer = 0;
        window.soundEngine && window.soundEngine.playSfx('shadow');
        if (window.particleManager) {
          window.particleManager.spawnSmoke(this.x, this.y - 25, '#c084fc', 14);
          window.particleManager.spawnFloatingText(
            this.x,
            this.y - this.height - 20,
            '¡Bola Sombra Desaparecida!',
            '#94a3b8',
            15
          );
        }
      } else {
        // Continuous dark ethereal particle effect indicating stored charge
        if (Math.random() < 0.35 && window.particleManager) {
          const offsetX = (Math.random() - 0.5) * 36;
          const offsetY = -10 - Math.random() * 35;
          window.particleManager.spawnHitSparks(this.x + offsetX, this.y + offsetY, 1, 'shadow');
        }
      }
    }
  }

  draw(ctx, opts = {}) {
    // If Gengar has a stored Bola Sombra, draw a glowing swirling shadow aura and mini shadow ball
    if (this.shadowBallStored) {
      ctx.save();
      const time = performance.now() * 0.005;
      const pulse = Math.sin(time * 3) * 3;

      // Flickering warning if less than 2.5s remaining
      const isExpiringSoon = this.shadowBallStoreTimer < 2.5;
      if (!isExpiringSoon || Math.floor(time * 15) % 2 === 0) {
        // Ghostly purple aura around Gengar
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 18 + pulse;
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.height * 0.5, 28 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Swirling mini dark orb orbiting Gengar
        const orbAngle = time * 2;
        const orbDistX = Math.cos(orbAngle) * 32;
        const orbDistY = Math.sin(orbAngle) * 14 - this.height * 0.45;
        const orbX = this.x + orbDistX;
        const orbY = this.y + orbDistY;

        const orbGrad = ctx.createRadialGradient(orbX, orbY, 1, orbX, orbY, 8);
        orbGrad.addColorStop(0, '#ffffff');
        orbGrad.addColorStop(0.3, '#c084fc');
        orbGrad.addColorStop(0.7, '#7c3aed');
        orbGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Tiny timer badge above Gengar
        ctx.fillStyle = isExpiringSoon ? '#f87171' : '#c084fc';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`🔮 BOLA ${Math.ceil(this.shadowBallStoreTimer)}s`, this.x, this.y - this.height - 8);
      }
      ctx.restore();
    }

    super.draw(ctx, opts);
  }
}

window.Gengar = Gengar;
