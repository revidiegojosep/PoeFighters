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
      weight: 80,
      color: '#7c3aed', // Ghostly Violet
      accentColor: '#c084fc', // Spectral Lilac
      walkSpeed: 3.8,
      dashSpeed: 6.2,
      jumpForce: 13.8,
      doubleJumpForce: 12.2,
      scale: 2.4,
      ...config
    });
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
        // Neutral Special: Bola Sombra (Shadow Ball charging projectile)
        return {
          name: 'Bola Sombra (Neutral X)',
          anim: 'Shoot',
          animSpeed: 1.2,
          hitboxStart: 999,
          hitboxEnd: 999,
          onStart: (g) => {
            window.soundEngine.playSfx('shadow');
            const spawnX = g.x + g.facing * 30;
            const spawnY = g.y - 24;

            g.projectiles.push({
              x: spawnX,
              y: spawnY,
              vx: g.facing * 7.5,
              vy: 0,
              radius: 18,
              damage: 9,
              baseKnockback: 14,
              knockbackScaling: 0.95,
              angle: 45,
              type: 'shadow',
              hitlag: 6,
              life: 2.0,
              hitStage: true,
              pulse: 0,
              update: function(dt) {
                this.pulse += dt * 8;
                if (window.particleManager && Math.random() < 0.4) {
                  window.particleManager.spawnHitSparks(this.x, this.y, 1, 'shadow');
                }
              },
              onHit: function(victim) {
                window.soundEngine.playSfx('shadow');
                if (window.particleManager) {
                  window.particleManager.spawnRadialBurst(this.x, this.y, '#9333ea', 'shadow', 32);
                  window.particleManager.spawnHitSparks(this.x, this.y, 10, 'shadow');
                }
              },
              draw: function(ctx) {
                ctx.save();
                ctx.shadowColor = '#c084fc';
                ctx.shadowBlur = 16;
                const grad = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, this.radius);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, '#c084fc');
                grad.addColorStop(0.7, '#6b21a8');
                grad.addColorStop(1, '#090d16');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();

                // Swirling shadow corona
                ctx.strokeStyle = '#e9d5ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * (0.8 + 0.2 * Math.sin(this.pulse)), 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
              }
            });
          }
        };

      case 'side':
        // Side Special: Lenguetazo (Lick melee whip that stuns for 0.4s!)
        return {
          name: 'Lenguetazo (Side X - Stun)',
          anim: 'Attack',
          animSpeed: 1.25,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 38,
          offsetY: 22,
          radius: 36,
          damage: 7,
          baseKnockback: 4, // Low knockback so victim remains right in front of Gengar
          knockbackScaling: 0.15,
          angle: 30,
          type: 'shadow',
          hitlag: 8,
          slashColor: '#e879f9',
          onStart: (g) => {
            window.soundEngine.playSfx('lick');
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(g.x, g.y, 'side', g.facing, '#e879f9', 'shadow', 42, false);
            }
          },
          onHit: (attacker, victim) => {
            window.soundEngine.playSfx('lick');
            // Stun for exactly 0.4 seconds!
            victim.hitstun = 0.40;
            victim.actionLockTimer = 0.40;
            victim.hitstop = 0.15;
            victim.state = 'HURT';
            victim.anim.play('Hurt', { speed: 1.0 });

            if (window.particleManager) {
              window.particleManager.spawnFloatingText(
                victim.x,
                victim.y - victim.height - 20,
                '¡STUN 0.4s!',
                '#facc15',
                18
              );
              window.particleManager.spawnHitSparks(victim.x, victim.y - victim.height * 0.5, 8, 'shadow');
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

            // Directional teleport offset
            const moveX = (g.input.left ? -1 : g.input.right ? 1 : 0) * 85;
            g.x += moveX;
            g.y -= 135; // Ascend upward
            g.vy = -3.5;
            g.vx = moveX * 0.05;
            g.upSpecialUsed = true;

            // Reappearance burst
            setTimeout(() => {
              window.soundEngine.playSfx('teleport');
              if (window.particleManager) {
                window.particleManager.spawnSmoke(g.x, g.y - 15, '#c084fc', 12);
                window.particleManager.spawnHitSparks(g.x, g.y - 20, 8, 'shadow');
                window.particleManager.spawnFloatingText(g.x, g.y - g.height - 15, '¡TELEPORT!', '#c084fc', 16);
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
            if (victim.applyStatus) {
              victim.applyStatus('poison', 5.0);
            }
          }
        };

      default:
        return this.getSpecialMoveDef('neutral');
    }
  }
}

window.Gengar = Gengar;
