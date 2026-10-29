/**
 * Pikachu Fighter (Dex 25)
 * Agile, electric platform fighter.
 * Moveset:
 *  - Neutral Z: Jab Eléctrico (ground) / Giro Rayo (air)
 *  - Side Z: Cola Férrea (ground) / Cola Aérea (air)
 *  - Up Z: Patada Ascendente (ground) / Voltereta Trueno (air)
 *  - Down Z: Barrido Cola (ground) / Pisotón Meteoro (air spike)
 *  - Neutral X: Bola Voltio (horizontal electric projectile)
 *  - Side X: Placaje Eléctrico (fast electrified dash towards the side)
 *  - Up X: Ataque Rápido (high-speed recovery dash)
 *  - Down X: ¡Trueno! (sky lightning strike + shockwave)
 */
class Pikachu extends window.Fighter {
  constructor(config = {}) {
    super({
      name: 'Pikachu',
      dex: 25,
      pokedexWeight: 6.0,
      weight: 6.0,
      weightCategory: 'Ligero',
      color: '#ffd700',
      accentColor: '#00e5ff',
      walkSpeed: 4.8,
      dashSpeed: 8.2,
      jumpForce: 13.8,
      doubleJumpForce: 12.2,
      scale: 2.3,
      ...config
    });
  }

  getBasicAttackDef(dir, isAir = false) {
    if (isAir) {
      switch (dir) {
        case 'up':
          // Up Air: Overhead electric somersault flip
          return {
            name: 'Voltereta Trueno (Up Air)',
            anim: 'Attack',
            animSpeed: 1.4,
            hitboxStart: 2,
            hitboxEnd: 10,
            offsetX: 10,
            offsetY: 38,
            radius: 36, // Sweeps overhead in the air
            damage: 8,
            baseKnockback: 13,
            knockbackScaling: 0.9,
            angle: 85,
            type: 'electric',
            hitlag: 6,
            slashColor: '#00e5ff',
            onStart: (p) => {
              window.soundEngine.playSfx('whip', 0.1);
            }
          };

        case 'down':
          // Down Air: Electric downward dive kick / meteor spike!
          return {
            name: 'Pisotón Meteoro (Down Air / Spike)',
            anim: 'Attack',
            animSpeed: 1.35,
            hitboxStart: 3,
            hitboxEnd: 11,
            offsetX: 8,
            offsetY: -4, // Strikes BELOW Pikachu's feet
            radius: 34,
            damage: 10,
            baseKnockback: 16,
            knockbackScaling: 1.15,
            angle: 280, // Downward meteor spike!
            type: 'electric',
            hitlag: 8,
            slashColor: '#ffd700',
            onStart: (p) => {
              window.soundEngine.playSfx('shock');
            }
          };

        case 'side':
          // Forward Air: Aerial iron tail swipe
          return {
            name: 'Cola Aérea (Forward Air)',
            anim: 'Attack',
            animSpeed: 1.3,
            hitboxStart: 3,
            hitboxEnd: 10,
            offsetX: 32,
            offsetY: 20,
            radius: 30,
            damage: 8,
            baseKnockback: 13,
            knockbackScaling: 1.0,
            angle: 42,
            type: 'electric',
            hitlag: 7,
            slashColor: '#ffd700',
            onStart: (p) => {
              window.soundEngine.playSfx('whip');
            }
          };

        case 'neutral':
        default:
          // Neutral Air: 360 electric spin
          return {
            name: 'Giro Rayo (Neutral Air)',
            anim: 'Attack',
            animSpeed: 1.5,
            hitboxStart: 2,
            hitboxEnd: 8,
            offsetX: 0,
            offsetY: 20,
            radius: 32,
            damage: 7,
            baseKnockback: 10,
            knockbackScaling: 0.75,
            angle: 45,
            type: 'electric',
            hitlag: 5,
            slashColor: '#facc15',
            onStart: (p) => {
              window.soundEngine.playSfx('shock');
            }
          };
      }
    }

    // Grounded Basic Attacks
    switch (dir) {
      case 'side':
        return {
          name: 'Cola Férrea (Side Tilt)',
          anim: 'Attack',
          animSpeed: 1.3,
          hitboxStart: 4,
          hitboxEnd: 10,
          offsetX: 34,
          offsetY: 22,
          radius: 30,
          damage: 9,
          baseKnockback: 14,
          knockbackScaling: 1.1,
          angle: 40,
          type: 'electric',
          hitlag: 7,
          slashColor: '#ffd700',
          onStart: (p) => {
            p.vx = p.facing * 3.5;
            window.soundEngine.playSfx('whip');
          }
        };

      case 'up':
        return {
          name: 'Patada Ascendente (Up Tilt)',
          anim: 'Attack',
          animSpeed: 1.4,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 18,
          offsetY: 28,
          radius: 36, // Sweeps from front-ground to overhead
          damage: 7,
          baseKnockback: 12,
          knockbackScaling: 0.85,
          angle: 85,
          type: 'electric',
          hitlag: 6,
          slashColor: '#00e5ff',
          onStart: (p) => {
            window.soundEngine.playSfx('whip', 0.1);
          }
        };

      case 'down':
        return {
          name: 'Barrido Cola (Down Tilt)',
          anim: 'Attack',
          animSpeed: 1.3,
          hitboxStart: 3,
          hitboxEnd: 9,
          offsetX: 30,
          offsetY: 12,
          radius: 28, // Reaches forward along the floor
          damage: 6,
          baseKnockback: 10,
          knockbackScaling: 0.8,
          angle: 70,
          type: 'electric',
          hitlag: 5,
          slashColor: '#facc15',
          onStart: (p) => {
            window.soundEngine.playSfx('hit_light');
            if (window.particleManager) {
              window.particleManager.spawnSmoke(p.x + p.facing * 18, p.y, '#ffffff', 5);
            }
          }
        };

      case 'neutral':
      default:
        return {
          name: 'Jab Eléctrico (Neutral Z)',
          anim: 'Attack',
          animSpeed: 1.5,
          hitboxStart: 2,
          hitboxEnd: 7,
          offsetX: 24,
          offsetY: 22,
          radius: 26,
          damage: 4,
          baseKnockback: 8,
          knockbackScaling: 0.5,
          angle: 45,
          type: 'electric',
          hitlag: 4,
          slashColor: '#facc15',
          onStart: (p) => {
            window.soundEngine.playSfx('hit_light');
          }
        };
    }
  }

  getSpecialMoveDef(dir) {
    switch (dir) {
      case 'neutral':
        // Neutral Special (X Default): Bola Voltio (Horizontal Electric Projectile)
        return {
          name: 'Bola Voltio (Neutral X)',
          anim: 'Shoot',
          animSpeed: 1.1,
          hitboxStart: 999, // Handled via projectile
          hitboxEnd: 999,
          cooldown: 0.45,
          onStart: (p) => {
            window.soundEngine.playSfx('shock');
            const spawnX = p.x + p.facing * 30;
            const spawnY = p.y - 24;
            const speed = 7.2 * p.facing;

            p.projectiles.push({
              x: spawnX,
              y: spawnY,
              vx: speed,
              vy: 0,
              radius: 16,
              damage: 10,
              baseKnockback: 12,
              knockbackScaling: 0.95,
              angle: 45,
              type: 'electric',
              hitlag: 6,
              life: 1.8,
              hitStage: true,
              update: function(dt) {
                this.y += Math.sin(performance.now() * 0.02) * 0.8;
                if (Math.random() < 0.4 && window.particleManager) {
                  window.particleManager.spawnHitSparks(this.x, this.y, 2, 'electric');
                }
              },
              draw: function(ctx) {
                ctx.save();
                ctx.shadowColor = '#00e5ff';
                ctx.shadowBlur = 14;
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 0.55, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              },
              onHit: function(target) {
                window.soundEngine.playSfx('shock');
                if (window.particleManager) {
                  window.particleManager.spawnHitSparks(this.x, this.y, 8, 'electric');
                }
              },
              onStageHit: function() {
                window.soundEngine.playSfx('hit_light');
                if (window.particleManager) {
                  window.particleManager.spawnHitSparks(this.x, this.y, 4, 'electric');
                }
              }
            });
          }
        };

      case 'side':
        // Side Special: Placaje Eléctrico (Fast Electrified Dash towards sides)
        return {
          name: 'Placaje Eléctrico (Side X)',
          anim: 'Charge',
          animSpeed: 1.8,
          hitboxStart: 2,
          hitboxEnd: 15,
          offsetX: 22,
          offsetY: 20,
          radius: 34,
          damage: 12,
          baseKnockback: 16,
          knockbackScaling: 1.2,
          angle: 42,
          type: 'electric',
          hitlag: 8,
          endLag: 0.16,
          cooldown: 0.55,
          onStart: (p) => {
            const dashDir = p.input.left ? -1 : p.input.right ? 1 : p.facing;
            p.facing = dashDir;
            p.vx = dashDir * 13.5;
            if (!p.isGrounded) p.vy = -1.0;
            window.soundEngine.playSfx('shock');
            if (window.particleManager) {
              window.particleManager.spawnLightningBolt(p.x - p.facing * 25, p.y - 18, p.x + p.facing * 25, p.y - 18, '#ffffff', '#ffff00', 5);
              window.particleManager.spawnHitSparks(p.x, p.y - 18, 8, 'electric');
              window.particleManager.spawnSmoke(p.x - p.facing * 14, p.y, '#ffffff', 8);
            }
          },
          onUpdate: (p, frame) => {
            if (frame < 14) {
              p.vx = p.facing * Math.max(7.5, 13.5 - frame * 0.45);
              if (window.particleManager) {
                if (Math.random() < 0.65) {
                  window.particleManager.spawnHitSparks(p.x - p.facing * 12, p.y - 18, 3, 'electric');
                }
                if (frame % 3 === 0) {
                  window.particleManager.spawnLightningBolt(p.x - p.facing * 20, p.y - 18, p.x, p.y - 18, '#00e5ff', '#ffff00', 3);
                }
              }
            }
          },
          onHit: (p, opponent) => {
            window.soundEngine.playSfx('thunder');
            if (window.particleManager) {
              window.particleManager.spawnHitSparks(p.x + p.facing * 20, p.y - 20, 12, 'electric');
              window.particleManager.spawnRadialBurst(p.x + p.facing * 20, p.y - 20, '#ffff00', 'electric', 36);
            }
          }
        };

      case 'up':
        // Up Special: Quick Attack (Recovery Move)
        return {
          name: 'Ataque Rápido (Up X)',
          anim: 'Walk',
          animSpeed: 2.2,
          hitboxStart: 2,
          hitboxEnd: 14,
          offsetX: 16,
          offsetY: 24,
          radius: 28,
          damage: 8,
          baseKnockback: 12,
          knockbackScaling: 0.85,
          angle: 60,
          type: 'electric',
          hitlag: 6,
          onStart: (p) => {
            const upwardForce = -14.5;
            const forwardForce = (p.input.left ? -1 : p.input.right ? 1 : p.facing) * 7.5;
            p.vy = upwardForce;
            p.vx = forwardForce;
            p.isGrounded = false;
            p.isFastFalling = false;
            window.soundEngine.playSfx('quick_attack');

            if (window.particleManager) {
              window.particleManager.spawnLightningBolt(p.x, p.y, p.x + p.vx * 4, p.y + p.vy * 4, '#00e5ff', '#ffd700', 4);
              window.particleManager.spawnHitSparks(p.x, p.y - 20, 5, 'electric');
            }
          },
          onUpdate: (p, frame) => {
            if (frame < 12 && window.particleManager && Math.random() < 0.6) {
              window.particleManager.spawnHitSparks(p.x, p.y - 20, 2, 'electric');
            }
          }
        };

      case 'down':
        // Down Special: Thunder (Rayo que cae desde el cielo, daño reducido, knockback horizontal izquierda o derecha)
        return {
          name: '¡Trueno! (Down X)',
          anim: 'Charge',
          animSpeed: 1.0,
          hitboxStart: 999, // Handled via descending bolt projectile and Pikachu discharge
          hitboxEnd: 999,
          cooldown: 0.65,
          onStart: (p) => {
            window.soundEngine.playSfx('shock');
            p.spawnThunderBolt();
          }
        };
    }
  }

  getSmashAttackDef(dir) {
    switch (dir) {
      case 'up':
        return {
          name: '¡Cola Férrea Eléctrica! (Up Smash)',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 14,
          offsetY: 44,
          radius: 40,
          damage: 18,
          baseKnockback: 36,
          knockbackScaling: 1.60,
          angle: 88, // Giant vertical launch
          type: 'electric',
          hitlag: 9,
          slashColor: '#ffff00',
          onStart: (p) => {
            window.soundEngine.playSfx('shock');
            if (window.particleManager) {
              window.particleManager.spawnHitSparks(p.x + p.facing * 10, p.y - 35, 8, 'electric');
            }
          }
        };

      case 'down':
        return {
          name: '¡Descarga Terrestre! (Down Smash)',
          anim: 'Attack',
          animSpeed: 1.4,
          hitboxStart: 2,
          hitboxEnd: 11,
          offsetX: 0,
          offsetY: 15,
          radius: 48, // 360° around Pikachu
          damage: 16,
          baseKnockback: 32,
          knockbackScaling: 1.45,
          angle: 50,
          type: 'electric',
          hitlag: 8,
          slashColor: '#00e5ff',
          onStart: (p) => {
            window.soundEngine.playSfx('shock');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(p.x, p.y - 15, '#00e5ff', 'electric', 46);
            }
          }
        };

      case 'side':
      default:
        return {
          name: '¡Placaje Eléctrico Smash! (Side Smash)',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 35,
          offsetY: 22,
          radius: 42,
          damage: 17,
          baseKnockback: 35,
          knockbackScaling: 1.55,
          angle: 35, // Horizontal rocket launch
          type: 'electric',
          hitlag: 9,
          slashColor: '#ffd700',
          onStart: (p) => {
            window.soundEngine.playSfx('shock');
            if (window.particleManager) {
              window.particleManager.spawnLightningBolt(p.x, p.y - 20, p.x + p.facing * 50, p.y - 20, '#ffffff', '#ffd700', 5);
            }
          }
        };
    }
  }

  /**
   * Spawns an animated Thunder bolt falling from the sky.
   * - Descending bolt deals reduced damage (6%) and knocks opponents horizontally left or right (never up).
   * - Striking Pikachu triggers an electrical discharge burst (13%) that also knocks horizontally away (never up).
   */
  spawnThunderBolt() {
    const p = this;
    const startX = p.x;
    const skyY = -140;
    let currentY = skyY;
    const fallSpeed = 26; // Descends smoothly and rapidly from the sky
    const hitOpponents = new Set();
    let hasStruckPikachu = false;

    // Cloud / sparks at the sky start
    if (window.particleManager) {
      window.particleManager.spawnSmoke(startX, 10, '#334155', 8);
      window.particleManager.spawnHitSparks(startX, 20, 5, 'electric');
    }

    p.projectiles.push({
      x: startX,
      y: skyY,
      vx: 0,
      vy: 0,
      radius: 26,
      damage: 6, // Reduced damage for falling bolt
      baseKnockback: 12,
      knockbackScaling: 0.75,
      angle: 0, // Strictly horizontal knockback! Never upwards!
      type: 'electric',
      hitlag: 6,
      life: 1.5,
      isThunder: true,
      update: function(dt) {
        currentY += fallSpeed;
        this.y = currentY;

        // Visual electric sparks along descent
        if (window.particleManager && Math.random() < 0.65) {
          window.particleManager.spawnHitSparks(startX + (Math.random() - 0.5) * 18, currentY, 2, 'electric');
        }

        const opponent = p.lastOpponent || (window.game ? (p === window.game.player1 ? window.game.player2 : window.game.player1) : null);

        // 1. Check falling bolt collision with opponent
        if (opponent && opponent.state !== 'RESPAWN' && opponent.invulnTimer <= 0 && !hitOpponents.has(opponent)) {
          const oppHurtboxes = opponent.getHurtboxes ? opponent.getHurtboxes() : [{ x: opponent.x, y: opponent.y - opponent.height * 0.5, radius: opponent.hurtboxRadius || 24 }];
          for (const hb of oppHurtboxes) {
            const dx = Math.abs(hb.x - startX);
            const inY = hb.y >= (currentY - fallSpeed - 24) && hb.y <= (currentY + 24);
            if (dx < (24 + hb.radius) && inY) {
              hitOpponents.add(opponent);
              // Strictly horizontal knockback to left or right (angle 0, NEVER upwards!)
              const launchDir = hb.x >= startX ? 1 : -1;
              const fakeAttacker = {
                facing: launchDir,
                x: startX,
                y: currentY,
                input: { left: false, right: false, up: false, down: false }
              };
              opponent.takeHit({
                damage: 6, // reduced damage
                angle: 0, // strictly horizontal, never upwards!
                baseKnockback: 12,
                knockbackScaling: 0.75,
                type: 'electric',
                hitlag: 6
              }, fakeAttacker);
              window.soundEngine.playSfx('shock');
              if (window.particleManager) {
                window.particleManager.spawnHitSparks(hb.x, hb.y, 8, 'electric');
              }
              break;
            }
          }
        }

        // 2. Check if bolt reaches Pikachu (SSBU Thunder absorption & discharge burst)
        const distToPikachu = Math.hypot(startX - p.x, currentY - (p.y - 18));
        if (!hasStruckPikachu && (distToPikachu < 38 || currentY >= p.y - 8)) {
          hasStruckPikachu = true;
          this.life = 0; // Terminate bolt

          // Big Thunder discharge explosion centered on Pikachu!
          window.soundEngine.playSfx('thunder');
          if (window.particleManager) {
            window.particleManager.spawnRadialBurst(p.x, p.y - 20, '#ffff00', 'electric', 54);
            window.particleManager.spawnHitSparks(p.x, p.y - 20, 14, 'electric');
            window.particleManager.spawnSmoke(p.x, p.y, '#facc15', 8);
          }
          if (window.game && window.game.triggerScreenShake) {
            window.game.triggerScreenShake(7, 0.22);
          }

          // Discharge burst hitbox (around Pikachu) - also strictly horizontal knockback (never upward!)
          if (opponent && opponent.state !== 'RESPAWN' && opponent.invulnTimer <= 0) {
            const oppHurtboxes = opponent.getHurtboxes ? opponent.getHurtboxes() : [{ x: opponent.x, y: opponent.y - opponent.height * 0.5, radius: opponent.hurtboxRadius || 24 }];
            for (const hb of oppHurtboxes) {
              const dist = Math.hypot(hb.x - p.x, hb.y - (p.y - 20));
              if (dist <= (52 + hb.radius)) {
                // Direction strictly horizontal away from Pikachu (left or right, angle 0)
                const launchDir = hb.x >= p.x ? 1 : -1;
                const fakeAttacker = {
                  facing: launchDir,
                  x: p.x,
                  y: p.y,
                  input: { left: false, right: false, up: false, down: false }
                };
                opponent.takeHit({
                  damage: 13,
                  angle: 0, // strictly horizontal, never upwards!
                  baseKnockback: 18,
                  knockbackScaling: 1.35,
                  type: 'electric',
                  hitlag: 9
                }, fakeAttacker);
                break;
              }
            }
          }
        }

        // 3. Stage boundary / bottom limit
        if (currentY > 700) {
          this.life = 0;
        }
      },
      draw: function(ctx) {
        ctx.save();
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 18;

        // Draw animated jagged lightning bolt from skyY to currentY
        const segments = Math.max(4, Math.floor((currentY - skyY) / 24));
        const dy = (currentY - skyY) / segments;

        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 6;
        ctx.lineJoin = 'miter';
        ctx.beginPath();
        ctx.moveTo(startX, skyY);
        for (let s = 1; s < segments; s++) {
          const segY = skyY + s * dy;
          const jitter = ((s % 2 === 0 ? 1 : -1) * 14) + (Math.random() - 0.5) * 8;
          ctx.lineTo(startX + jitter, segY);
        }
        ctx.lineTo(startX, currentY);
        ctx.stroke();

        // Inner glowing white core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, skyY);
        for (let s = 1; s < segments; s++) {
          const segY = skyY + s * dy;
          const jitter = ((s % 2 === 0 ? 1 : -1) * 10) + (Math.random() - 0.5) * 5;
          ctx.lineTo(startX + jitter, segY);
        }
        ctx.lineTo(startX, currentY);
        ctx.stroke();

        // Glowing spark ball at the head of the bolt
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(startX, currentY, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    });
  }
}

window.Pikachu = Pikachu;
