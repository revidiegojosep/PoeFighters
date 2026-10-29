/**
 * Bulbasaur Fighter (Dex 1)
 * Sturdy Grass/Poison fighter with disjointed vine hitboxes and leaf projectiles.
 * Moveset:
 *  - Neutral Z: Látigo Cepa (ground) / Espiral Follaje (air)
 *  - Side Z: Placaje Cabeza (ground) / Cabezazo Aéreo (air)
 *  - Up Z: Látigo Superior (ground) / Látigo Aéreo Elevado (air)
 *  - Down Z: Barrido Cepa (ground) / Látigo Meteoro (air spike)
 *  - Neutral X: ¡Esporas Drenadoras! (360° radial spore vortex)
 *  - Side X: Hoja Afilada (3 spinning sharp razor leaves)
 *  - Up X: Látigo Impulso (upward vine whip recovery)
 *  - Down X: Bomba Germen (arcing explosive seed bomb)
 */
class Bulbasaur extends window.Fighter {
  constructor(config = {}) {
    super({
      name: 'Bulbasaur',
      dex: 1,
      pokedexWeight: 6.9,
      weight: 6.9,
      weightCategory: 'Medio',
      color: '#48d0b0',
      accentColor: '#10b981',
      walkSpeed: 4.2,
      dashSpeed: 7.0,
      jumpForce: 13.0,
      doubleJumpForce: 11.5,
      scale: 2.4,
      ...config
    });

    // Nerf de Defensa: Cuesta sacarle del campo -> Toma +25% de knockback
    this.knockbackTakenMultiplier = 1.25;
  }

  getBasicAttackDef(dir, isAir = false) {
    if (isAir) {
      switch (dir) {
        case 'up':
          // Up Air: Dual vines whipping straight above Bulbasaur
          return {
            name: 'Látigo Aéreo Elevado (Up Air)',
            anim: 'Attack',
            animSpeed: 1.15,
            hitboxStart: 2,
            hitboxEnd: 9,
            offsetX: 10,
            offsetY: 46,
            radius: 46, // Rango mejorado: Látigo ascendente
            damage: 9,
            baseKnockback: 13,
            knockbackScaling: 0.9,
            angle: 85,
            type: 'grass',
            hitlag: 6,
            slashColor: '#10b981',
            onStart: (b) => {
              window.soundEngine.playSfx('whip');
              if (window.particleManager) {
                window.particleManager.spawnVineWhip(b.x, b.y, 'up', b.facing, 66);
              }
            }
          };

        case 'down':
          // Down Air: Heavy downward vine slam / meteor spike!
          return {
            name: 'Látigo Meteoro (Down Air / Spike)',
            anim: 'Attack',
            animSpeed: 1.10,
            hitboxStart: 3,
            hitboxEnd: 11,
            offsetX: 8,
            offsetY: -8, // Rango mejorado: Impacto hacia abajo
            radius: 44,
            damage: 11,
            baseKnockback: 17,
            knockbackScaling: 1.15,
            angle: 280, // Downward meteor spike!
            type: 'grass',
            hitlag: 8,
            slashColor: '#34d399',
            onStart: (b) => {
              window.soundEngine.playSfx('whip', 0.1);
              if (window.particleManager) {
                window.particleManager.spawnVineWhip(b.x, b.y, 'down', b.facing, 64);
              }
            }
          };

        case 'side':
          // Forward Air: Aerial vine lash
          return {
            name: 'Látigo Cepa Aéreo (Forward Air)',
            anim: 'Attack',
            animSpeed: 1.06,
            hitboxStart: 3,
            hitboxEnd: 10,
            offsetX: 42,
            offsetY: 20,
            radius: 40, // Rango mejorado
            damage: 8,
            baseKnockback: 13,
            knockbackScaling: 1.0,
            angle: 42,
            type: 'grass',
            hitlag: 7,
            slashColor: '#34d399',
            onStart: (b) => {
              window.soundEngine.playSfx('whip');
              if (window.particleManager) {
                window.particleManager.spawnVineWhip(b.x, b.y, 'side', b.facing, 65);
              }
            }
          };

        case 'neutral':
        default:
          // Neutral Air: 360 foliage spin
          return {
            name: 'Espiral Follaje (Neutral Air)',
            anim: 'Attack',
            animSpeed: 1.19,
            hitboxStart: 2,
            hitboxEnd: 8,
            offsetX: 0,
            offsetY: 20,
            radius: 44, // Rango mejorado
            damage: 7,
            baseKnockback: 9,
            knockbackScaling: 0.7,
            angle: 45,
            type: 'grass',
            hitlag: 5,
            slashColor: '#10b981',
            onStart: (b) => {
              window.soundEngine.playSfx('whip');
              if (window.particleManager) {
                window.particleManager.spawnRadialBurst(b.x, b.y - 20, '#10b981', 'grass', 44);
                window.particleManager.spawnVineWhip(b.x, b.y, 'side', b.facing, 58);
              }
            }
          };
      }
    }

    // Grounded Basic Attacks
    switch (dir) {
      case 'side':
        return {
          name: 'Látigo Cepa Frontal (Side Tilt)',
          anim: 'Attack',
          animSpeed: 1.02,
          hitboxStart: 3,
          hitboxEnd: 11,
          offsetX: 48,
          offsetY: 20,
          radius: 42, // Rango mejorado
          damage: 10,
          baseKnockback: 15,
          knockbackScaling: 1.1,
          angle: 42,
          type: 'grass',
          hitlag: 8,
          slashColor: '#34d399',
          onStart: (b) => {
            b.vx = b.facing * 3.5;
            window.soundEngine.playSfx('whip');
            if (window.particleManager) {
              window.particleManager.spawnVineWhip(b.x, b.y, 'side', b.facing, 72);
            }
          }
        };

      case 'up':
        return {
          name: 'Látigo Superior (Up Tilt)',
          anim: 'Attack',
          animSpeed: 1.10,
          hitboxStart: 2,
          hitboxEnd: 9,
          offsetX: 20,
          offsetY: 36,
          radius: 48, // Rango mejorado: Gran barrido ascendente
          damage: 8,
          baseKnockback: 13,
          knockbackScaling: 0.85,
          angle: 82,
          type: 'grass',
          hitlag: 6,
          slashColor: '#10b981',
          onStart: (b) => {
            window.soundEngine.playSfx('whip');
            if (window.particleManager) {
              window.particleManager.spawnVineWhip(b.x, b.y, 'up', b.facing, 74);
            }
          }
        };

      case 'down':
        return {
          name: 'Barrido Cepa (Down Tilt)',
          anim: 'Attack',
          animSpeed: 1.02,
          hitboxStart: 3,
          hitboxEnd: 9,
          offsetX: 46,
          offsetY: 10,
          radius: 40, // Rango mejorado a ras de suelo
          damage: 7,
          baseKnockback: 11,
          knockbackScaling: 0.8,
          angle: 72,
          type: 'grass',
          hitlag: 5,
          slashColor: '#34d399',
          onStart: (b) => {
            window.soundEngine.playSfx('whip', 0.1);
            if (window.particleManager) {
              window.particleManager.spawnVineWhip(b.x, b.y, 'down', b.facing, 66);
            }
          }
        };

      case 'neutral':
      default:
        return {
          name: 'Látigo Cepa (Neutral Z)',
          anim: 'Attack',
          animSpeed: 1.19,
          hitboxStart: 2,
          hitboxEnd: 8,
          offsetX: 40,
          offsetY: 20,
          radius: 38, // Rango mejorado
          damage: 5,
          baseKnockback: 8,
          knockbackScaling: 0.55,
          angle: 45,
          type: 'grass',
          hitlag: 4,
          slashColor: '#10b981',
          onStart: (b) => {
            window.soundEngine.playSfx('whip');
            if (window.particleManager) {
              window.particleManager.spawnVineWhip(b.x, b.y, 'side', b.facing, 64);
            }
          }
        };
    }
  }

  getSpecialMoveDef(dir) {
    switch (dir) {
      case 'neutral':
        // Neutral Special: Absorber (Absorb)
        // Rework: Hace daño y reduce el contador de daño de bulbasaur un 3%
        return {
          name: 'Absorber (Neutral X)',
          anim: 'Charge',
          animSpeed: 1.10,
          hitboxStart: 2,
          hitboxEnd: 15,
          offsetX: 18,
          offsetY: 22,
          radius: 46, // Vórtice de drenaje de savia
          damage: 9,
          baseKnockback: 12,
          knockbackScaling: 0.75,
          angle: 50,
          type: 'grass',
          hitlag: 7,
          slashColor: '#22c55e',
          onStart: (b) => {
            window.soundEngine.playSfx('whip');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(b.x + b.facing * 18, b.y - 22, '#22c55e', 'grass', 46);
              window.particleManager.spawnVineWhip(b.x, b.y, 'side', b.facing, 52);
            }
          },
          onHit: (attacker, victim) => {
            // Reduce el contador de daño de Bulbasaur un 3%
            attacker.percent = Math.max(0, parseFloat((attacker.percent - 3).toFixed(1)));
            window.soundEngine.playSfx('select');
            if (window.particleManager) {
              window.particleManager.spawnFloatingText(attacker.x, attacker.y - attacker.height - 20, '¡ABSORBER! -3%', '#22c55e', 18);
              window.particleManager.spawnRadialBurst(attacker.x, attacker.y - 20, '#22c55e', 'grass', 36);
              window.particleManager.spawnHitSparks(victim.x, victim.y - victim.height * 0.5, 10, 'grass');
            }
          }
        };

      case 'side':
        // Side Special: Hojas Navaja (Side X)
        // Rework: Si bulbasaur está corriendo: spread +20%, velocidad proyectil +20%.
        // Knockback aumentado un 20%. Lag para empezar a moverse de 0.4s.
        return {
          name: 'Hojas Navaja (Side X)',
          anim: 'Shoot',
          animSpeed: 1.25,
          hitboxStart: 999,
          hitboxEnd: 999,
          cooldown: 1.05, // +0.2s Nerf
          endLag: 0.40, // Lag de 0.4 segundos para poder empezar a moverse
          onStart: (b) => {
            b.actionLockTimer = Math.max(b.actionLockTimer, 0.40); // 0.4s lag
            window.soundEngine.playSfx('razor_leaf');
            const spawnX = b.x + b.facing * 28;
            const spawnY = b.y - 24;

            const isRunning = b.wasRunningOnAttack || (Math.abs(b.vx) > b.walkSpeed * 1.05);
            const isWalking = !isRunning && (b.wasWalkingOnAttack || (Math.abs(b.vx) > 0.4) || (b.input && (b.input.left || b.input.right)));

            // El spread SOLO se hace si el ataque X + lados es ANDANDO.
            // En cambio si es corriendo, aumenta la velocidad pero NO el spread.
            let angles;
            let speed = 7.02;
            const baseKnockback = 12; // Knockback aumentado un 20%
            const knockbackScaling = 0.96;

            if (isWalking) {
              // Andando: SÍ se hace el spread en abanico
              angles = [-0.0456, 0, 0.0456];
              speed = 7.02;
              if (window.particleManager) {
                window.particleManager.spawnFloatingText(b.x, b.y - b.height - 20, '🌿 ¡HOJAS NAVAJA! (Andando: Spread Activo)', '#22c55e', 15);
              }
            } else if (isRunning) {
              // Corriendo: Aumenta la velocidad +20% (9.36) pero NO el spread (ráfaga recta concentrada)
              angles = [0, 0, 0];
              speed = 8.424;
              if (window.particleManager) {
                window.particleManager.spawnSmoke(b.x - b.facing * 14, b.y, '#ffffff', 8);
                window.particleManager.spawnFloatingText(b.x, b.y - b.height - 20, '🌿 ¡RÁFAGA EN CARRERA! (+20% Vel, Sin Spread)', '#22c55e', 15);
              }
            } else {
              // Parado / neutro: Sin spread, velocidad estándar
              angles = [0, 0, 0];
              speed = 7.02;
            }

            angles.forEach((offsetAngle, idx) => {
              const vx = Math.cos(offsetAngle) * speed * b.facing;
              const vy = Math.sin(offsetAngle) * speed;

              b.projectiles.push({
                x: spawnX,
                y: spawnY + (idx - 1) * 6,
                vx: vx,
                vy: vy,
                radius: 11.2,
                damage: 5,
                baseKnockback: baseKnockback,
                knockbackScaling: knockbackScaling,
                angle: 45,
                type: 'grass',
                hitlag: 5,
                life: 1.4,
                hitStage: true,
                rot: Math.random() * Math.PI,
                update: function(dt) {
                  this.rot += 0.35;
                  if (Math.random() < 0.25 && window.particleManager) {
                    window.particleManager.spawnRazorLeaves(this.x, this.y, -this.vx * 0.2, 0, 1);
                  }
                },
                draw: function(ctx) {
                  ctx.save();
                  ctx.translate(this.x, this.y);
                  ctx.rotate(this.rot);
                  ctx.shadowColor = '#10b981';
                  ctx.shadowBlur = 10;
                  ctx.fillStyle = '#22c55e';
                  ctx.beginPath();
                  ctx.ellipse(0, 0, this.radius * 1.5, this.radius * 0.65, 0, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.strokeStyle = '#ffffff';
                  ctx.lineWidth = 1.5;
                  ctx.stroke();
                  ctx.restore();
                },
                onHit: function(target) {
                  window.soundEngine.playSfx('hit_light');
                  if (window.particleManager) {
                    window.particleManager.spawnRazorLeaves(this.x, this.y, 0, -2, 3);
                  }
                },
                onStageHit: function() {
                  window.soundEngine.playSfx('hit_light');
                }
              });
            });
          }
        };

      case 'up':
        // Up Special: Vine Whip Recovery
        return {
          name: 'Látigo Impulso (Up X)',
          anim: 'Attack',
          animSpeed: 1.6,
          hitboxStart: 2,
          hitboxEnd: 12,
          offsetX: 10,
          offsetY: 48,
          radius: 32,
          damage: 11,
          baseKnockback: 13,
          knockbackScaling: 0.9,
          angle: 75,
          type: 'grass',
          hitlag: 8,
          onStart: (b) => {
            // High upward vertical launch
            b.vy = -14.2;
            b.vx = (b.input.left ? -1 : b.input.right ? 1 : b.facing) * 3.5;
            b.isGrounded = false;
            b.isFastFalling = false;
            window.soundEngine.playSfx('whip');

            if (window.particleManager) {
              window.particleManager.spawnRazorLeaves(b.x, b.y - 25, b.vx * 0.5, -4, 5);
            }
          }
        };

      case 'down':
        // Down Special: Seed Bomb / Bomba Germen (Hold X to Charge distance, or tap for normal attack)
        return {
          name: 'Bomba Germen (Down X)',
          anim: 'Shoot',
          chargeAnim: 'Charge',
          animSpeed: 1.25,
          canCharge: true,
          holdToCharge: true,
          maxCharge: 0.85,
          hitboxStart: 999,
          hitboxEnd: 999,
          cooldown: 0.50,
          endLag: 0.18,
          onStart: (b) => {
            if (window.particleManager) {
              window.particleManager.spawnHitSparks(b.x + b.facing * 18, b.y - 28, 4, 'grass');
            }
          },
          onCharge: (b, chargeTime) => {
            if (Math.random() < 0.40 && window.particleManager) {
              window.particleManager.spawnHitSparks(
                b.x + b.facing * 20 + (Math.random() - 0.5) * 16,
                b.y - 28 + (Math.random() - 0.5) * 16,
                1,
                'grass'
              );
            }
          },
          onFire: (b, chargeRatio) => {
            window.soundEngine.playSfx('seed_bomb');
            const spawnX = b.x + b.facing * 22;
            const spawnY = b.y - 32;

            // Push projectile much farther left or right according to charge!
            // Quick tap (chargeRatio == 0): normal base horizontal speed 5.2
            // Held charge (chargeRatio up to 1.0): massive launch speed up to 16.5!
            const hSpeed = 5.2 + chargeRatio * 11.3;
            const vSpeed = -5.8 - chargeRatio * 2.6;
            const vx = b.facing * hSpeed;
            const vy = vSpeed;
            const seedDamage = Math.round(11 + chargeRatio * 10);
            const seedKnockback = Math.round((15 + chargeRatio * 12) * 0.85 * 0.80); // Nerf 20% knockback
            const seedRadius = Math.round(12 + chargeRatio * 6);

            if (chargeRatio > 0.25 && window.particleManager) {
              window.particleManager.spawnRadialBurst(spawnX, spawnY, '#10b981', 'grass', 24 + chargeRatio * 24);
              window.particleManager.spawnFloatingText(
                b.x,
                b.y - b.height - 20,
                chargeRatio >= 0.9 ? '¡BOMBA GERMEN MÁXIMA!' : `¡BOMBA +${Math.round(chargeRatio * 100)}%!`,
                '#10b981',
                18
              );
            }

            b.projectiles.push({
              x: spawnX,
              y: spawnY,
              vx: vx,
              vy: vy,
              radius: seedRadius,
              damage: seedDamage,
              baseKnockback: seedKnockback,
              knockbackScaling: (1.25 + chargeRatio * 0.35) * 0.85 * 0.80, // Nerf 20% scaling
              angle: 80,
              type: 'grass',
              hitlag: 8 + Math.round(chargeRatio * 4),
              life: 3.2,
              hitStage: true,
              chargeRatio: chargeRatio,
              update: function(dt) {
                this.vy += 0.38; // Gravity on seed
                this.rot = (this.rot || 0) + (0.18 + (this.chargeRatio || 0) * 0.22);
              },
              draw: function(ctx) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rot || 0);
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 8 + (this.chargeRatio || 0) * 14;
                ctx.fillStyle = (this.chargeRatio || 0) > 0.5 ? '#047857' : '#059669';
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#6ee7b7';
                ctx.beginPath();
                ctx.arc(-2, -2, this.radius * 0.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              },
              onHit: function(target) {
                window.soundEngine.playSfx('hit_heavy');
                if (window.particleManager) {
                  window.particleManager.spawnHitSparks(this.x, this.y, 10 + (this.chargeRatio || 0) * 8, 'grass');
                  window.particleManager.spawnRazorLeaves(this.x, this.y, 0, -2, 6 + (this.chargeRatio || 0) * 8);
                }
              },
              onStageHit: function(plat) {
                window.soundEngine.playSfx('seed_bomb');
                if (window.particleManager) {
                  window.particleManager.spawnHitSparks(this.x, this.y, 8 + (this.chargeRatio || 0) * 8, 'grass');
                  window.particleManager.spawnRazorLeaves(this.x, this.y, 0, -3, 8 + (this.chargeRatio || 0) * 8);
                }
              }
            });
          },
          onRelease: function(b, chargeRatio) {
            this.onFire(b, chargeRatio);
          }
        };
    }
  }

  getSmashAttackDef(dir) {
    switch (dir) {
      case 'up':
        return {
          name: '¡Testarazo Sísmico! (Up Smash)',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 12,
          offsetY: 46,
          radius: 42,
          damage: 19,
          baseKnockback: 37,
          knockbackScaling: 1.62,
          angle: 86,
          type: 'grass',
          hitlag: 9,
          slashColor: '#34d399',
          onStart: (b) => {
            window.soundEngine.playSfx('hit_heavy');
            if (window.particleManager) {
              window.particleManager.spawnRazorLeaves(b.x, b.y - 35, 0, -5, 4);
            }
          }
        };

      case 'down':
        return {
          name: '¡Doble Azote de Espinas! (Down Smash)',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 0,
          offsetY: 15,
          radius: 50,
          damage: 16,
          baseKnockback: 33,
          knockbackScaling: 1.45,
          angle: 58,
          type: 'grass',
          hitlag: 8,
          slashColor: '#10b981',
          onStart: (b) => {
            window.soundEngine.playSfx('whip');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(b.x, b.y - 15, '#10b981', 'grass', 48);
            }
          }
        };

      case 'side':
      default:
        return {
          name: '¡Látigo Titán Colosal! (Side Smash)',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 40,
          offsetY: 22,
          radius: 44,
          damage: 18,
          baseKnockback: 36,
          knockbackScaling: 1.58,
          angle: 38,
          type: 'grass',
          hitlag: 9,
          slashColor: '#059669',
          onStart: (b) => {
            window.soundEngine.playSfx('whip');
            if (window.particleManager) {
              window.particleManager.spawnRazorLeaves(b.x + b.facing * 20, b.y - 20, b.facing * 6, -1, 3);
            }
          }
        };
    }
  }
}

window.Bulbasaur = Bulbasaur;
