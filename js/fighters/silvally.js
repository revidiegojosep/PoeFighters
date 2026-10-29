/**
 * Silvally Fighter (Dex 773)
 * Super Smash Bros Ultimate Moveset:
 * Heavyweight synthetic powerhouse (100.5 kg) engineered for raw speed, high impact,
 * and versatile elemental pressure via RKS System (Sistema Alfa).
 *
 * Specials (Smash Ultimate):
 *  - Neutral X: Tajo Aéreo (Air Slash - Blue returning disc that slows down and accelerates backwards without hurting Silvally)
 *  - Side X: Multiataque (Multi-Attack - Instant slice after 0.3s delay, or instant if charged for >0.3s up to 0.7s max)
 *  - Down X: Alarido (Snarl - Expanding sonic roar ring, 1.3x damage & 1.1x knockback close-up, debuffs rival's attack for 4.5s)
 *  - Up X: Viento Cortante (Razor Wind - 0.5s slow-fall gather, then explosive upward leap leaving a 0.5s high-kill tornado behind)
 *
 * Basics & Smashes (Z):
 *  - Neutral Jab: Corte Quimérico (Twin claw swipe + bite combo)
 *  - Side Tilt: Garra Férrea (Heavy steel claw horizontal blade)
 *  - Up Tilt: Cresta Alfa (Vertical crest backflip cutting skyward)
 *  - Down Tilt: Barrido Cola Pez (Low sweeping fish tail whip that trips)
 *  - Dash Attack: Embestida Sintética (Low-angle predatory dash tackle)
 *  - Neutral Air: Giro Pragmático (360° spin with claws and tail)
 *  - Forward Air: Zarpazo Aéreo (Forward scissor claw strike)
 *  - Back Air: Latigazo de Cola (Massive reverse tail whip with high launch power)
 *  - Up Air: Embestida de Cresta (Upward vertical crest thrust)
 *  - Down Air: Pisotón Meteoro (Heavy downward double talon stomp with meteor spike!)
 *  - Side Smash: ¡Tajo Destructor Alfa! (Devastating cross claw slash with cyan/purple shockwave)
 *  - Up Smash: ¡Impacto Ascendente! (Vertical explosive crest slash launching skyward)
 *  - Down Smash: ¡Barrido Bipolar! (Slamming claws on front and tail on back)
 */
class Silvally extends window.Fighter {
  constructor(config = {}) {
    super({
      name: 'Silvally',
      dex: 773,
      pokedexWeight: 100.5,
      weight: 100.5,
      weightCategory: 'Pesado',
      color: '#e2e8f0',        // Platino / Blanco plateado
      accentColor: '#38bdf8',  // Celeste Alfa
      highlightColor: '#a855f7', // Púrpura Místico
      walkSpeed: 3.40,
      dashSpeed: 8.80,         // Rápido para su peso
      jumpForce: 12.80,
      doubleJumpForce: 9.80,
      scale: 2.75,
      ...config
    });

    this.maxJumps = 2;
    this.jumpsLeft = this.maxJumps;
    this.airFriction = 0.982;

    // Special moves state
    this.multiAttackPending = false;
    this.multiAttackDelayTimer = 0;
    this.multiAttackCharged = 0;

    this.snarlActive = false;
    this.snarlTimer = 0;
    this.snarlRadius = 0;

    this.razorWindStartupTimer = 0;
    this.razorWindActive = false;
    this.tornadoes = [];

    // Efecto de corte de Multiataque (Side X)
    this.multiAttackSlashTimer = 0;
    this.multiAttackSlashes = [];
  }

  getBasicAttackDef(dir, isAir = false) {
    if (isAir) {
      switch (dir) {
        case 'up':
          // Up Air: Embestida de Cresta
          return {
            name: 'Embestida de Cresta (Up Air)',
            anim: 'Attack',
            animSpeed: 1.25,
            hitboxStart: 3,
            hitboxEnd: 9,
            offsetX: 4,
            offsetY: 48,
            radius: 36,
            damage: 9.2,
            baseKnockback: 23,
            knockbackScaling: 1.20,
            angle: 88,
            type: 'normal',
            hitlag: 6,
            onStart: (p) => {
              window.soundEngine && window.soundEngine.playSfx('wing_flap');
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'up', p.facing, '#38bdf8', 'normal', 38, true);
              }
            }
          };

        case 'down':
          // Down Air: Pisotón Meteoro (True Spike!)
          return {
            name: 'Pisotón Meteoro (Down Air Spike)',
            anim: 'Attack',
            animSpeed: 1.15,
            hitboxStart: 4,
            hitboxEnd: 11,
            offsetX: 4,
            offsetY: -8,
            radius: 36,
            damage: 11.8,
            baseKnockback: 27,
            knockbackScaling: 1.35,
            angle: 270, // True meteor spike!
            type: 'normal',
            hitlag: 9,
            onStart: (p) => {
              window.soundEngine && window.soundEngine.playSfx('hit_heavy');
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'down', p.facing, '#a855f7', 'normal', 42, true);
                window.particleManager.spawnHitSparks(p.x, p.y + 10, 6, 'normal');
              }
            }
          };

        case 'forward':
        case 'side':
          // Forward Air: Zarpazo Aéreo
          return {
            name: 'Zarpazo Aéreo (Forward Air)',
            anim: 'Attack',
            animSpeed: 1.30,
            hitboxStart: 3,
            hitboxEnd: 10,
            offsetX: 32,
            offsetY: 22,
            radius: 36,
            damage: 9.8,
            baseKnockback: 25,
            knockbackScaling: 1.18,
            angle: 42,
            type: 'normal',
            hitlag: 6,
            onStart: (p) => {
              window.soundEngine && window.soundEngine.playSfx('hit_medium');
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'side', p.facing, '#38bdf8', 'normal', 38, true);
              }
            }
          };

        case 'back':
          // Back Air: Latigazo de Cola
          return {
            name: 'Latigazo de Cola (Back Air)',
            anim: 'Attack',
            animSpeed: 1.20,
            hitboxStart: 4,
            hitboxEnd: 11,
            offsetX: -36,
            offsetY: 20,
            radius: 40,
            damage: 11.5,
            baseKnockback: 28,
            knockbackScaling: 1.30,
            angle: 140, // High launch behind!
            type: 'normal',
            hitlag: 8,
            onStart: (p) => {
              window.soundEngine && window.soundEngine.playSfx('hit_heavy');
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'side', -p.facing, '#0284c7', 'normal', 42, true);
              }
            }
          };

        default:
          // Neutral Air: Giro Pragmático
          return {
            name: 'Giro Pragmático (Neutral Air)',
            anim: 'Attack',
            animSpeed: 1.35,
            hitboxStart: 2,
            hitboxEnd: 11,
            offsetX: 0,
            offsetY: 20,
            radius: 42,
            damage: 8.0,
            baseKnockback: 18,
            knockbackScaling: 0.95,
            angle: 45,
            type: 'normal',
            hitlag: 5,
            onStart: (p) => {
              window.soundEngine && window.soundEngine.playSfx('wing_flap');
              if (window.particleManager) {
                window.particleManager.spawnRadialBurst(p.x, p.y - 20, '#38bdf8', 'normal', 36);
              }
            }
          };
      }
    }

    // Ground Attacks
    switch (dir) {
      case 'up':
        // Up Tilt: Cresta Alfa
        return {
          name: 'Cresta Alfa (Up Tilt)',
          anim: 'Attack',
          animSpeed: 1.25,
          hitboxStart: 3,
          hitboxEnd: 9,
          offsetX: 8,
          offsetY: 46,
          radius: 36,
          damage: 8.0,
          baseKnockback: 22,
          knockbackScaling: 1.10,
          angle: 88,
          type: 'normal',
          hitlag: 5,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('wing_flap');
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'up', p.facing, '#38bdf8', 'normal', 38, false);
            }
          }
        };

      case 'down':
        // Down Tilt: Barrido Cola Pez
        return {
          name: 'Barrido Cola Pez (Down Tilt)',
          anim: 'Attack',
          animSpeed: 1.25,
          hitboxStart: 3,
          hitboxEnd: 9,
          offsetX: 28,
          offsetY: 8,
          radius: 34,
          damage: 7.0,
          baseKnockback: 19,
          knockbackScaling: 0.90,
          angle: 25, // Low horizontal trip trajectory
          type: 'water',
          hitlag: 5,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('hit_light');
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'down', p.facing, '#0284c7', 'normal', 36, false);
            }
          }
        };

      case 'side':
        // Forward Tilt: Garra Férrea
        return {
          name: 'Garra Férrea (Forward Tilt)',
          anim: 'Attack',
          animSpeed: 1.20,
          hitboxStart: 3,
          hitboxEnd: 10,
          offsetX: 32,
          offsetY: 22,
          radius: 38,
          damage: 9.0,
          baseKnockback: 24,
          knockbackScaling: 1.12,
          angle: 40,
          type: 'steel',
          hitlag: 6,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('hit_medium');
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'side', p.facing, '#e2e8f0', 'normal', 40, false);
            }
          }
        };

      case 'dash':
        // Dash Attack: Embestida Sintética
        return {
          name: 'Embestida Sintética (Dash Attack)',
          anim: 'Attack',
          animSpeed: 1.25,
          hitboxStart: 3,
          hitboxEnd: 11,
          offsetX: 34,
          offsetY: 20,
          radius: 38,
          damage: 8.5,
          baseKnockback: 23,
          knockbackScaling: 1.05,
          angle: 45,
          type: 'normal',
          hitlag: 5,
          onStart: (p) => {
            p.vx = p.facing * 6.8;
            window.soundEngine && window.soundEngine.playSfx('quick_attack');
            if (window.particleManager) {
              window.particleManager.spawnSmoke(p.x, p.y, '#ffffff', 8);
            }
          }
        };

      default:
        // Neutral Jab: Corte Quimérico
        return {
          name: 'Corte Quimérico (Neutral Jab)',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 8,
          offsetX: 26,
          offsetY: 20,
          radius: 30,
          damage: 5.2,
          baseKnockback: 15,
          knockbackScaling: 0.75,
          angle: 45,
          type: 'normal',
          hitlag: 4,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('hit_light');
            if (window.particleManager) {
              window.particleManager.spawnHitSparks(p.x + p.facing * 22, p.y - 20, 2, 'normal');
            }
          }
        };
    }
  }

  getSmashAttackDef(dir) {
    switch (dir) {
      case 'up':
        // Up Smash: ¡Impacto Ascendente!
        return {
          name: '¡Impacto Ascendente! (Up Smash)',
          anim: 'Attack',
          animSpeed: 1.20,
          hitboxStart: 3,
          hitboxEnd: 12,
          offsetX: 6,
          offsetY: 50,
          radius: 46,
          damage: 17.5,
          baseKnockback: 35,
          knockbackScaling: 1.50,
          angle: 88,
          type: 'normal',
          hitlag: 9,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('smash');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(p.x, p.y - 32, '#38bdf8', 'normal', 44);
              window.particleManager.spawnHitSparks(p.x, p.y - 40, 8, 'normal');
            }
          }
        };

      case 'down':
        // Down Smash: ¡Barrido Bipolar!
        return {
          name: '¡Barrido Bipolar! (Down Smash)',
          anim: 'Attack',
          animSpeed: 1.20,
          hitboxStart: 3,
          hitboxEnd: 12,
          offsetX: 0,
          offsetY: 10,
          radius: 52, // Both sides
          damage: 16.0,
          baseKnockback: 32,
          knockbackScaling: 1.40,
          angle: 45,
          type: 'normal',
          hitlag: 8,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('smash');
            if (window.game && typeof window.game.triggerScreenShake === 'function') {
              window.game.triggerScreenShake(14, 0.25);
            }
            if (window.particleManager) {
              window.particleManager.spawnSmoke(p.x - 26, p.y, '#1e293b', 8);
              window.particleManager.spawnSmoke(p.x + 26, p.y, '#1e293b', 8);
              window.particleManager.spawnHitSparks(p.x, p.y - 10, 6, 'impact');
            }
          }
        };

      default:
        // Side Smash: ¡Tajo Destructor Alfa!
        return {
          name: '¡Tajo Destructor Alfa! (Side Smash)',
          anim: 'Attack',
          animSpeed: 1.15,
          hitboxStart: 4,
          hitboxEnd: 13,
          offsetX: 38,
          offsetY: 24,
          radius: 48,
          damage: 18.5,
          baseKnockback: 36,
          knockbackScaling: 1.55,
          angle: 38,
          type: 'normal',
          hitlag: 10,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('smash');
            if (window.game && typeof window.game.triggerScreenShake === 'function') {
              window.game.triggerScreenShake(16, 0.30);
            }
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'side', p.facing, '#38bdf8', 'normal', 52, false);
              window.particleManager.spawnRadialBurst(p.x + p.facing * 30, p.y - 22, '#a855f7', 'normal', 44);
            }
          }
        };
    }
  }

  getSpecialMoveDef(dir) {
    switch (dir) {
      case 'neutral':
        // Neutral X: Tajo Aéreo (Air Slash / Returning Razor Wind Blade)
        // Dispara un tajo de viento azul con nuevo FX3 de corte que recorre el escenario (+20% distancia inicial y +20% tamaño).
        // Este ataque NO tiene lag. A la vuelta, sigue la trayectoria de Silvally.
        // Daño: 4.5% ida (casi sin knockback), 7.5% de vuelta (con algo de knockback). No daña a Silvally.
        return {
          name: 'Tajo Aéreo (Neutral X)',
          anim: 'Shoot',
          animSpeed: 2.2, // Muy rápido para ejecución fluida
          cooldown: 0.70,
          endLag: 0.0, // ¡Este ataque no tiene lag!
          hitboxStart: 999,
          hitboxEnd: 999,
          onStart: (s) => {
            s.actionLockTimer = 0.0; // ¡Cero lag, Silvally puede actuar inmediatamente!
            window.soundEngine && window.soundEngine.playSfx('wing_flap');
            const facing = s.facing;
            const startX = s.x + facing * 26;
            const startY = s.y - 24;

            const airSlash = {
              owner: s,
              x: startX,
              y: startY,
              vx: facing * 11.5, // Rango inicial aumentado notablemente
              vy: 0,
              originFacing: facing,
              radius: 24,
              life: 3.2,
              piercing: true, // Atraviesa oponentes en lugar de desaparecer
              hasHitOutward: false,
              hasHitReturn: false,
              isReturning: false,
              returnTime: 0,
              returnSpeed: 7.5,
              damage: 4.5,
              baseKnockback: 6,
              knockbackScaling: 0.20,
              angle: 45,
              type: 'flying',
              hitlag: 3,
              spinAngle: 0,
              update: function(dt) {
                this.spinAngle += dt * 14;

                if (!this.isReturning) {
                  // Conforme va avanzando frena gradualmente con mayor alcance
                  this.vx *= 0.958;
                  if (Math.abs(this.vx) < 0.75) {
                    this.isReturning = true;
                    this.hasHitReturn = false; // Listo para golpear una vez de vuelta
                    this.damage = 7.5;
                    this.baseKnockback = 18;
                    this.knockbackScaling = 0.65;
                    this.angle = 55;
                    this.returnSpeed = 8.0;
                    if (window.soundEngine) window.soundEngine.playSfx('quick_attack', 0.15);
                  }
                } else {
                  // A la vuelta, seguimiento reducido un 50% (curvatura suave en lugar de seguirlo directamente)
                  this.returnTime += dt;
                  const targetX = this.owner.x;
                  const targetY = this.owner.y - 20;
                  const dx = targetX - this.x;
                  const dy = targetY - this.y;
                  const dist = Math.hypot(dx, dy);

                  if (dist < 26) {
                    // Alcanza a Silvally: reabsorbido limpiamente sin causarle daño
                    this.life = 0;
                    window.soundEngine && window.soundEngine.playSfx('select', 0.15);
                    if (window.particleManager) {
                      window.particleManager.spawnHitSparks(this.x, this.y, 4, 'electric');
                    }
                  } else {
                    // Seguimiento reducido un 50% (interpolación de dirección suave)
                    this.returnSpeed = Math.min(13.0, this.returnSpeed + dt * 10.0);
                    const desiredVx = (dx / dist) * this.returnSpeed;
                    const desiredVy = (dy / dist) * this.returnSpeed;
                    this.vx += (desiredVx - this.vx) * 0.08;
                    this.vy += (desiredVy - this.vy) * 0.08;
                  }
                }

                if (Math.random() < 0.40 && window.particleManager) {
                  window.particleManager.spawnHitSparks(this.x, this.y, 1, 'electric');
                }
              },
              canHitOpponent: function(opp) {
                // Solo puede golpear una vez por ida, y otra por vuelta
                if (!this.isReturning) {
                  return !this.hasHitOutward;
                } else {
                  return !this.hasHitReturn;
                }
              },
              onHit: function(opp) {
                if (!this.isReturning) {
                  this.hasHitOutward = true;
                } else {
                  this.hasHitReturn = true;
                }
                if (window.particleManager) {
                  window.particleManager.spawnRadialBurst(this.x, this.y, '#38bdf8', 'normal', 34);
                  window.particleManager.spawnHitSparks(this.x, this.y, 6, 'normal');
                }
              },
              draw: function(ctx) {
                ctx.save();
                ctx.translate(this.x, this.y);

                // Orientar el tajo aéreo según la dirección de su velocidad de viaje
                const heading = Math.atan2(this.vy, this.vx);
                ctx.rotate(heading);

                // Resplandor áureo / eólico del tajo
                ctx.shadowColor = this.isReturning ? '#38bdf8' : '#7dd3fc';
                ctx.shadowBlur = 16;

                const r = this.radius; // 24 (+20% tamaño)
                const len = r * 1.5;   // 36px
                const thick = r * 0.55; // 13px
                const curve = r * 0.70; // 17px

                // 1. Estela y aura del corte aéreo
                ctx.fillStyle = this.isReturning ? 'rgba(56, 189, 248, 0.45)' : 'rgba(125, 211, 252, 0.38)';
                ctx.beginPath();
                ctx.moveTo(len, 0);
                ctx.quadraticCurveTo(-curve, -len * 0.85, -thick * 1.4, 0);
                ctx.quadraticCurveTo(-curve, len * 0.85, len, 0);
                ctx.closePath();
                ctx.fill();

                // 2. Tajo cortante curvado (Nuevo FX3 Crescent Blade Wave)
                const bladeGrad = ctx.createLinearGradient(-thick, 0, len, 0);
                bladeGrad.addColorStop(0, '#ffffff');
                bladeGrad.addColorStop(0.35, this.isReturning ? '#38bdf8' : '#7dd3fc');
                bladeGrad.addColorStop(1, this.isReturning ? '#0284c7' : '#0ea5e9');

                ctx.fillStyle = bladeGrad;
                ctx.beginPath();
                // Punta superior
                ctx.moveTo(len * 0.75, -len * 0.85);
                // Filo exterior cortante
                ctx.quadraticCurveTo(len * 1.10, 0, len * 0.75, len * 0.85);
                // Curvatura interior del filo
                ctx.quadraticCurveTo(len * 0.20, 0, len * 0.75, -len * 0.85);
                ctx.closePath();
                ctx.fill();

                // 3. Filo blanco nítido y afilado
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.8;
                ctx.beginPath();
                ctx.moveTo(len * 0.75, -len * 0.85);
                ctx.quadraticCurveTo(len * 1.10, 0, len * 0.75, len * 0.85);
                ctx.stroke();

                // 4. Destello central en el ápice del corte
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(len * 0.55, 0, 3.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
              }
            };

            s.projectiles.push(airSlash);
          }
        };

      case 'side':
        // Side X: Multiataque (Multi-Attack - Nerf: 1s obligatorio de carga)
        return {
          name: 'Multiataque (Side X - 1s Carga Obligatoria)',
          anim: 'Attack',
          chargeAnim: 'Charge',
          animSpeed: 1.40,
          canCharge: true,
          holdToCharge: true,
          maxCharge: 1.00, // 1 segundo obligatorio de carga
          allowHoldBeyondMax: false, // se suelta solo al llegar a 1.0s
          cooldown: 1.25,
          endLag: 0.32,
          hitboxStart: 999,
          hitboxEnd: 999,
          chargeBannerText: '¡CARGANDO MULTIATAQUE (1s)! ',
          chargeBannerColor: '#38bdf8',
          onStart: (s) => {
            window.soundEngine && window.soundEngine.playSfx('charge');
          },
          onCharge: (s, chargeTime, maxCharge) => {
            const ratio = Math.min(1.0, chargeTime / maxCharge);
            if (Math.random() < 0.45 && window.particleManager) {
              const pColor = ratio >= 0.95 ? '#22c55e' : (ratio > 0.5 ? '#38bdf8' : '#a855f7');
              window.particleManager.spawnHitSparks(s.x + s.facing * 18, s.y - 24, 2, 'impact');
              window.particleManager.spawnSmoke(s.x + s.facing * 16, s.y - 20, pColor, 3);
            }
          },
          onMaxCharge: (s) => {
            window.soundEngine && window.soundEngine.playSfx('select', 0.2);
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(s.x + s.facing * 24, s.y - 24, '#38bdf8', 'normal', 42);
              window.particleManager.spawnFloatingText(s.x, s.y - s.height - 20, '¡MULTIATAQUE LISTO (1.0s)!', '#38bdf8', 18);
            }
          },
          onFire: (s, chargeRatio) => {
            // Nerf: Requiere exactamente 1 segundo obligatorio de carga (chargeRatio >= 0.95)
            if (chargeRatio >= 0.95) {
              s._executeMultiAttack(chargeRatio);
            } else {
              // Si se suelta antes de 1 segundo obligatorio, el movimiento falla dejando a Silvally en lag
              window.soundEngine && window.soundEngine.playSfx('hit_light');
              s.actionLockTimer = 0.45;
              s.anim.loop('Idle', 1.0);
              if (window.particleManager) {
                window.particleManager.spawnFloatingText(s.x, s.y - s.height - 20, '¡FALLÓ! (Requiere 1s de carga)', '#ef4444', 16);
                window.particleManager.spawnSmoke(s.x, s.y, '#94a3b8', 8);
              }
            }
          }
        };

      case 'down':
        // Down X: Alarido (Snarl - Círculo más grande de su tamaño)
        // 9% mínimo, 11.7% máximo (1.3x) y 1.1x knockback de cerca. Debuff de ataque: 4.5 segundos.
        return {
          name: 'Alarido (Down X - Debuff -30% Atq)',
          anim: 'Shoot',
          animSpeed: 1.30,
          cooldown: 1.20,
          endLag: 0.28,
          hitboxStart: 999,
          hitboxEnd: 999,
          onStart: (s) => {
            s.snarlActive = true;
            s.snarlTimer = 0.38;
            s.snarlRadius = 20;

            window.soundEngine && window.soundEngine.playSfx('shadow');
            if (window.particleManager) {
              window.particleManager.spawnFloatingText(s.x, s.y - s.height - 20, '¡ALARIDO!', '#a855f7', 18);
            }

            const maxRadius = 84; // Círculo mayor que el tamaño de Silvally
            const opp = window.game ? (s === window.game.player ? window.game.dummy : window.game.player) : null;
            if (opp && opp.state !== 'RESPAWN' && opp.invulnTimer <= 0) {
              const dx = opp.x - s.x;
              const dy = (opp.y - opp.height * 0.5) - (s.y - 20);
              const dist = Math.hypot(dx, dy);

              if (dist <= maxRadius) {
                // Cuanto más cerca esté del centro: 1.0 (pegado) a 0.0 (en el borde)
                const proximity = 1.0 - (dist / maxRadius);
                // Daño: 9% mínimo, hasta 11.7% máximo (1.3x)
                const dmg = Math.round((9.0 * (1.0 + proximity * 0.30)) * 10) / 10;
                // Knockback: 1.1x si el rival está pegado
                const baseKb = Math.round(16 * (1.0 + proximity * 0.10));

                opp.takeHit({
                  damage: dmg,
                  baseKnockback: baseKb,
                  knockbackScaling: 0.95,
                  angle: 45,
                  type: 'dark',
                  hitlag: 6
                }, s);

                // Aplica debuff en ataque durante 4.5 segundos
                if (typeof opp.applyStatus === 'function') {
                  opp.applyStatus('attack_debuff', 4.5);
                } else if (opp.statuses) {
                  opp.statuses.attackDebuff = { active: true, timer: 4.5, factor: 0.70 };
                }

                if (window.particleManager) {
                  window.particleManager.spawnHitSparks(opp.x, opp.y - opp.height * 0.5, 8, 'shadow');
                }
              }
            }
          }
        };

      case 'up':
        // Up X: Viento Cortante (Razor Wind)
        // Lapso de 0.5s donde cae muy despacio si está en el aire, luego se impulsa arriba dejando un tornado de 0.5s.
        // Daño: 15%. Knockback: Alto (mata pesados a 100-120%).
        return {
          name: 'Viento Cortante (Up X)',
          anim: 'Charge',
          animSpeed: 1.20,
          cooldown: 1.10,
          endLag: 0.22,
          hitboxStart: 999,
          hitboxEnd: 999,
          onStart: (s) => {
            s.razorWindStartupTimer = 0.50; // Lapso de 0.5 segundos
            s.razorWindActive = true;
            s.actionLockTimer = 0.52;

            window.soundEngine && window.soundEngine.playSfx('charge');
            if (window.particleManager) {
              window.particleManager.spawnFeathers(s.x, s.y - 20, 4, '#38bdf8');
            }
          }
        };

      default:
        return null;
    }
  }

  getSpecialAttackDef(dir) {
    return this.getSpecialMoveDef(dir);
  }

  _executeMultiAttack(chargeRatio) {
    this.multiAttackPending = false;
    this.multiAttackDelayTimer = 0;
    this.anim.play('Attack', { speed: 2.0 });

    window.soundEngine && window.soundEngine.playSfx('hit_heavy');
    window.soundEngine && window.soundEngine.playSfx('whip');
    window.soundEngine && window.soundEngine.playSfx('smash');

    if (window.game && typeof window.game.triggerScreenShake === 'function') {
      window.game.triggerScreenShake(18 + chargeRatio * 10, 0.32);
    }

    const strikeBox = {
      x: this.x + this.facing * 38,
      y: this.y - 24,
      radius: 56
    };

    // Efecto de corte visual (Multi-Attack Razor Cut Trajectories)
    this.multiAttackSlashTimer = 0.28;
    const cx = this.x + this.facing * 38;
    const cy = this.y - 24;
    this.multiAttackSlashes = [
      { x1: cx - this.facing * 38, y1: cy - 32, x2: cx + this.facing * 48, y2: cy + 26, color: '#ffffff', width: 4.5, blur: 18 },
      { x1: cx - this.facing * 28, y1: cy + 34, x2: cx + this.facing * 44, y2: cy - 28, color: '#38bdf8', width: 3.8, blur: 16 },
      { x1: cx - this.facing * 44, y1: cy + 6,  x2: cx + this.facing * 52, y2: cy - 6,  color: '#f43f5e', width: 3.2, blur: 14 },
      { x1: cx - this.facing * 22, y1: cy - 38, x2: cx + this.facing * 38, y2: cy + 36, color: '#a855f7', width: 2.8, blur: 12 }
    ];

    if (window.particleManager) {
      window.particleManager.spawnMeleeSlash(this.x, this.y, 'side', this.facing, '#38bdf8', 'normal', 62, false);
      window.particleManager.spawnMeleeSlash(this.x, this.y, 'up', this.facing, '#f43f5e', 'normal', 54, false);
      window.particleManager.spawnMeleeSlash(this.x, this.y, 'down', this.facing, '#ffffff', 'normal', 56, false);
      window.particleManager.spawnRadialBurst(strikeBox.x, strikeBox.y, '#38bdf8', 'normal', 48);
    }

    const opp = window.game ? (this === window.game.player ? window.game.dummy : window.game.player) : null;
    if (opp && opp.state !== 'RESPAWN' && opp.invulnTimer <= 0) {
      const hurtboxes = opp.getHurtboxes ? opp.getHurtboxes() : [{ x: opp.x, y: opp.y - opp.height * 0.5, radius: opp.hurtboxRadius }];
      let hit = false;
      for (const hb of hurtboxes) {
        if (window.physicsEngine.checkHitboxCollision(strikeBox, hb)) {
          hit = true;
          break;
        }
      }
      if (hit) {
        const dmg = 21.0 + chargeRatio * 5.0;
        const baseKb = 26 + chargeRatio * 10;
        const kbScaling = 1.15 + chargeRatio * 0.30;
        opp.takeHit({
          damage: dmg,
          baseKnockback: baseKb,
          knockbackScaling: kbScaling,
          angle: 40,
          type: 'normal',
          hitlag: 9
        }, this);

        // Efecto de corte profundo en el rival
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(opp.x, opp.y - opp.height * 0.5, 12, 'impact');
          window.particleManager.spawnRadialBurst(opp.x, opp.y - opp.height * 0.5, '#f43f5e', 'normal', 46);
          window.particleManager.spawnFloatingText(opp.x, opp.y - opp.height - 20, '¡CORTE MULTIATAQUE!', '#f43f5e', 18);
        }
      }
    }
  }

  update(dt, opponent, stage) {
    super.update(dt, opponent, stage);

    if (this.multiAttackSlashTimer > 0) {
      this.multiAttackSlashTimer = Math.max(0, this.multiAttackSlashTimer - dt);
    }

    // 1. Multiataque: Delay de 0.3s antes de cortar si no fue cargado
    if (this.multiAttackPending) {
      this.multiAttackDelayTimer -= dt;
      this.vx *= 0.70;
      if (this.multiAttackDelayTimer <= 0) {
        this._executeMultiAttack(this.multiAttackCharged);
      }
    }

    // 2. Alarido: Expansión de onda sonora circular
    if (this.snarlActive) {
      this.snarlTimer -= dt;
      this.snarlRadius += dt * 220;
      if (this.snarlTimer <= 0) {
        this.snarlActive = false;
      }
    }

    // 3. Viento Cortante: Startup de 0.5s (caída ralentizada) y posterior despegue con tornado
    if (this.razorWindActive) {
      this.razorWindStartupTimer -= dt;
      // Si se encuentra en el aire bajará mucho más despacio
      if (!this.isGrounded) {
        this.vy = Math.min(0.45, this.vy);
        this.vx *= 0.85;
      }

      if (this.razorWindStartupTimer <= 0) {
        this.razorWindActive = false;
        // Impulso potente hacia arriba
        this.vy = -16.5;
        this.vx = (this.input.left ? -4.0 : (this.input.right ? 4.0 : this.facing * 1.5));
        this.anim.play('Attack', { speed: 1.8 });

        window.soundEngine && window.soundEngine.playSfx('wing_flap');
        window.soundEngine && window.soundEngine.playSfx('quick_attack');

        // Tornado que perdura 0.5 segundos en el punto de despegue
        const selfFighter = this;
        const tornado = {
          x: this.x,
          y: this.y,
          radius: 48, // Hitbox un poco más grande (antes 36)
          timer: 0.50, // dura 0.5 segundos
          damage: 15.0,
          baseKnockback: 24, // Menos knockback (antes 34)
          knockbackScaling: 1.05, // Menos scaling (antes 1.45)
          angle: 82,
          hasHit: false,
          spinAngle: 0,
          update: function(delta, opp) {
            this.timer -= delta;
            this.spinAngle += delta * 16;
            if (Math.random() < 0.4 && window.particleManager) {
              window.particleManager.spawnFeathers(this.x, this.y - 20, 1, '#38bdf8');
            }
            if (!this.hasHit && opp && opp.state !== 'RESPAWN' && opp.invulnTimer <= 0) {
              const hurtboxes = opp.getHurtboxes ? opp.getHurtboxes() : [{ x: opp.x, y: opp.y - opp.height * 0.5, radius: opp.hurtboxRadius }];
              for (const hb of hurtboxes) {
                if (window.physicsEngine.checkHitboxCollision({ x: this.x, y: this.y - 20, radius: this.radius }, hb)) {
                  this.hasHit = true;
                  opp.takeHit({
                    damage: this.damage,
                    baseKnockback: this.baseKnockback,
                    knockbackScaling: this.knockbackScaling,
                    angle: this.angle,
                    type: 'flying',
                    hitlag: 8
                  }, selfFighter);
                  if (window.particleManager) {
                    window.particleManager.spawnRadialBurst(this.x, this.y - 20, '#38bdf8', 'normal', 46);
                    window.particleManager.spawnFeathers(this.x, this.y - 20, 6, '#7dd3fc');
                  }
                  break;
                }
              }
            }
          },
          draw: function(ctx) {
            ctx.save();
            // Tornado volumétrico animado completo
            const h = 64;
            const topW = 44;
            const botW = 12;
            const layers = 5;

            // Núcleo resplandeciente del tornado
            const grad = ctx.createLinearGradient(this.x, this.y - h, this.x, this.y);
            grad.addColorStop(0, 'rgba(186, 230, 253, 0.70)');
            grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.50)');
            grad.addColorStop(1, 'rgba(14, 165, 233, 0.20)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(this.x - botW * 0.5, this.y);
            ctx.lineTo(this.x - topW * 0.5, this.y - h);
            ctx.lineTo(this.x + topW * 0.5, this.y - h);
            ctx.lineTo(this.x + botW * 0.5, this.y);
            ctx.closePath();
            ctx.fill();

            // Cintas giratorias de viento
            for (let l = 0; l < layers; l++) {
              const t = l / (layers - 1);
              const ly = this.y - t * h;
              const lw = botW + (topW - botW) * t;
              const lh = 6 + t * 4;
              const rot = this.spinAngle + l * 0.85;
              const xOffset = Math.sin(rot) * (lw * 0.20);

              ctx.save();
              ctx.translate(this.x + xOffset, ly);
              ctx.strokeStyle = l % 2 === 0 ? '#ffffff' : '#38bdf8';
              ctx.lineWidth = 2.4 + t * 1.2;
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.ellipse(0, 0, lw * 0.5, lh * 0.5, Math.sin(rot) * 0.2, 0, Math.PI * 2);
              ctx.stroke();
              ctx.restore();
            }
            ctx.restore();
          }
        };
        this.tornadoes.push(tornado);
      }
    }

    // 4. Actualización de tornados activos
    for (let i = this.tornadoes.length - 1; i >= 0; i--) {
      const tor = this.tornadoes[i];
      tor.update(dt, opponent);
      if (tor.timer <= 0) {
        this.tornadoes.splice(i, 1);
      }
    }
  }

  draw(ctx, opts = {}) {
    // 1. Dibujar tornados de Viento Cortante
    for (const tor of this.tornadoes) {
      if (tor.draw) tor.draw(ctx);
    }

    // 2. Onda sonora de Alarido
    if (this.snarlActive) {
      ctx.save();
      const alpha = Math.max(0, this.snarlTimer / 0.38);
      ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.90})`;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 20, Math.min(84, this.snarlRadius), 0, Math.PI * 2);
      ctx.stroke();

      // Anillo concéntrico celeste
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.60})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 20, Math.min(84, this.snarlRadius) * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Efecto de corte visual de Multiataque (Side X)
    if (this.multiAttackSlashTimer > 0 && this.multiAttackSlashes) {
      ctx.save();
      const alpha = Math.max(0, this.multiAttackSlashTimer / 0.28);
      for (const sl of this.multiAttackSlashes) {
        ctx.strokeStyle = sl.color;
        ctx.lineWidth = sl.width * alpha;
        ctx.shadowColor = sl.color;
        ctx.shadowBlur = sl.blur;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(sl.x1, sl.y1);
        ctx.lineTo(sl.x2, sl.y2);
        ctx.stroke();

        // Línea central de corte blanco nítido
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = (sl.width * 0.45) * alpha;
        ctx.beginPath();
        ctx.moveTo(sl.x1, sl.y1);
        ctx.lineTo(sl.x2, sl.y2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Render base
    super.draw(ctx, opts);
  }
}

window.Silvally = Silvally;

