/**
 * Staraptor Fighter (Dex 398)
 * Super Smash Bros Ultimate Moveset:
 * Agile and fierce Normal/Flying predator from Sinnoh with exceptional air mobility,
 * 5 jumps, devastating high-speed Brave Bird straight rush, Whirlwind cyclone vortex,
 * ascending Fly recovery with apex glide, and Detección (Detect) counter stance.
 *
 * Specials (Smash Ultimate):
 *  - Neutral X: Torbellino (Whirlwind - Cyclonic vortex that captures & launches)
 *  - Side X: Pájaro Osado (Brave Bird - Hold to charge, rockets in pure straight line unaffected by gravity)
 *  - Up X: Vuelo (Fly - Vertical recovery liftoff launching foes upward with gliding apex)
 *  - Down X: Detección (Detect - 0.5s counter stance that counters incoming melee attacks with massive strike)
 *
 * Basics & Smashes (Z):
 *  - Neutral Jab: Picotazo Furtivo (3-hit rapid beak pecks)
 *  - Side Tilt: Golpe de Ala (Horizontal razor wing blade)
 *  - Up Tilt: Cresta Cortante (Quick backflip with crest cutting skyward)
 *  - Down Tilt: Barrido de Garras (Low sweeping talon trip)
 *  - Dash Attack: Embestida Aérea (Low-altitude dive tackle)
 *  - Neutral Air: Giro Huracán (360° spinning wing cyclone)
 *  - Forward Air: Corte de Ala (Twin wing scissor cut)
 *  - Back Air: Zarpazo Dorsal (High knockback reverse talon strike)
 *  - Up Air: Vuelo Tijera (Vertical beak & talon snap)
 *  - Down Air: Picado Meteoro (Plummeting talon spike - true Meteor Spike!)
 *  - Side Smash: ¡Tajo Aéreo Titánico! (Supercharged wing blade with sonic boom)
 *  - Up Smash: ¡Tormenta Plumaria! (Explosive upward wing vortex)
 *  - Down Smash: ¡Doble Golpe de Garras! (Slamming talons on both sides)
 */
class Staraptor extends window.Fighter {
  constructor(config = {}) {
    super({
      name: 'Staraptor',
      dex: 398,
      pokedexWeight: 24.9,
      weight: 24.9,
      weightCategory: 'Medio',
      color: '#475569',        // Slate plumage
      accentColor: '#ef4444',  // Crimson crest
      highlightColor: '#38bdf8', // Aero cyan
      walkSpeed: 4.80,
      dashSpeed: 10.40,
      jumpForce: 13.50,
      doubleJumpForce: 7.80,
      scale: 2.70,
      ...config
    });

    // 5 Saltos en total (1 en tierra + 4 aéreos)
    this.maxJumps = 5;
    this.jumpsLeft = this.maxJumps;
    this.airFriction = 0.985;

    // Special moves state
    this.whirlwindCooldown = 0;
    this.braveBirdActive = false;
    this.braveBirdTimer = 0;
    this.braveBirdSpeed = 0;
    this.braveBirdCharge = 0;

    // Gliding & Vuelo state (Up X)
    this.isGliding = false;
    this.vueloActive = false;
    this.vueloLiftoffTimer = 0;
    this.vueloApexReached = false;
    this.diveBombActive = false;
    this.diveBombMidairHit = false;
    this.diveBombGroundHit = false;

    // Detect state (Down X Counter)
    this.detectActive = false;
    this.detectTimer = 0;
    this.detectPulseRadius = 0;
    this.counterFlashTimer = 0;
  }

  getBasicAttackDef(dir, isAir = false) {
    if (isAir) {
      switch (dir) {
        case 'up':
          // Up Air: Vuelo Tijera (Vertical beak & talon snap)
          return {
            name: 'Vuelo Tijera (Up Air)',
            anim: 'Attack',
            animSpeed: 1.25,
            hitboxStart: 3,
            hitboxEnd: 10,
            offsetX: 4,
            offsetY: 46,
            radius: 36,
            damage: 8.5,
            baseKnockback: 22,
            knockbackScaling: 1.15,
            angle: 86,
            type: 'flying',
            hitlag: 6,
            onStart: (p) => {
              window.soundEngine && window.soundEngine.playSfx('wing_flap');
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'up', p.facing, '#38bdf8', 'normal', 38, true);
                window.particleManager.spawnFeathers(p.x, p.y - 20, 3, '#38bdf8');
              }
            }
          };

        case 'down':
          // Down Air: Picado Meteoro (Meteor Spike!)
          return {
            name: 'Picado Meteoro (Down Air Spike)',
            anim: 'Attack',
            animSpeed: 1.15,
            hitboxStart: 4,
            hitboxEnd: 12,
            offsetX: 4,
            offsetY: -8,
            radius: 35,
            damage: 11.5,
            baseKnockback: 26,
            knockbackScaling: 1.30,
            angle: 270, // True meteor spike!
            type: 'flying',
            hitlag: 9,
            onStart: (p) => {
              window.soundEngine && window.soundEngine.playSfx('hit_heavy');
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'down', p.facing, '#ef4444', 'normal', 42, true);
                window.particleManager.spawnHitSparks(p.x, p.y + 10, 6, 'normal');
                window.particleManager.spawnFeathers(p.x, p.y, 4, '#ef4444');
              }
            }
          };

        case 'forward':
        case 'side':
          // Forward Air: Corte de Ala (Twin wing scissor slash)
          return {
            name: 'Corte de Ala (Forward Air)',
            anim: 'Attack',
            animSpeed: 1.30,
            hitboxStart: 3,
            hitboxEnd: 10,
            offsetX: 32,
            offsetY: 20,
            radius: 36,
            damage: 9.5,
            baseKnockback: 24,
            knockbackScaling: 1.15,
            angle: 42,
            type: 'flying',
            hitlag: 6,
            onStart: (p) => {
              window.soundEngine && window.soundEngine.playSfx('wing_flap');
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'side', p.facing, '#38bdf8', 'normal', 38, true);
                window.particleManager.spawnFeathers(p.x + p.facing * 20, p.y - 18, 3, '#e2e8f0');
              }
            }
          };

        case 'back':
          // Back Air: Zarpazo Dorsal (Heavy reverse talon strike)
          return {
            name: 'Zarpazo Dorsal (Back Air)',
            anim: 'Attack',
            animSpeed: 1.20,
            hitboxStart: 4,
            hitboxEnd: 11,
            offsetX: -34,
            offsetY: 18,
            radius: 38,
            damage: 11.0,
            baseKnockback: 28,
            knockbackScaling: 1.25,
            angle: 140, // Knocks behind with heavy launch power
            type: 'flying',
            hitlag: 8,
            onStart: (p) => {
              window.soundEngine && window.soundEngine.playSfx('hit_medium');
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'side', -p.facing, '#ef4444', 'normal', 40, true);
                window.particleManager.spawnFeathers(p.x - p.facing * 22, p.y - 18, 4, '#475569');
              }
            }
          };

        default:
          // Neutral Air: Giro Huracán (360° spinning wing cyclone)
          return {
            name: 'Giro Huracán (Neutral Air)',
            anim: 'Attack',
            animSpeed: 1.40,
            hitboxStart: 2,
            hitboxEnd: 12,
            offsetX: 0,
            offsetY: 18,
            radius: 42,
            damage: 7.5,
            baseKnockback: 18,
            knockbackScaling: 0.90,
            angle: 45,
            type: 'flying',
            hitlag: 5,
            onStart: (p) => {
              window.soundEngine && window.soundEngine.playSfx('wing_flap');
              if (window.particleManager) {
                window.particleManager.spawnRadialBurst(p.x, p.y - 18, '#38bdf8', 'normal', 36);
                window.particleManager.spawnFeathers(p.x, p.y - 18, 4, '#e2e8f0');
              }
            }
          };
      }
    }

    // Ground Attacks
    switch (dir) {
      case 'up':
        // Up Tilt: Cresta Cortante (Quick backflip with crest cutting skyward)
        return {
          name: 'Cresta Cortante (Up Tilt)',
          anim: 'Attack',
          animSpeed: 1.25,
          hitboxStart: 3,
          hitboxEnd: 9,
          offsetX: 8,
          offsetY: 42,
          radius: 34,
          damage: 7.2,
          baseKnockback: 21,
          knockbackScaling: 1.05,
          angle: 88,
          type: 'flying',
          hitlag: 5,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('wing_flap');
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'up', p.facing, '#ef4444', 'normal', 36, false);
            }
          }
        };

      case 'down':
        // Down Tilt: Barrido de Garras (Low sweeping talon trip)
        return {
          name: 'Barrido de Garras (Down Tilt)',
          anim: 'Attack',
          animSpeed: 1.30,
          hitboxStart: 2,
          hitboxEnd: 8,
          offsetX: 26,
          offsetY: 6,
          radius: 32,
          damage: 6.5,
          baseKnockback: 18,
          knockbackScaling: 0.85,
          angle: 28, // Low horizontal trip
          type: 'normal',
          hitlag: 5,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('hit_light');
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'down', p.facing, '#475569', 'normal', 34, false);
            }
          }
        };

      case 'side':
        // Forward Tilt: Golpe de Ala (Heavy forward wing blade whip)
        return {
          name: 'Golpe de Ala (Forward Tilt)',
          anim: 'Attack',
          animSpeed: 1.20,
          hitboxStart: 3,
          hitboxEnd: 10,
          offsetX: 30,
          offsetY: 20,
          radius: 36,
          damage: 8.8,
          baseKnockback: 23,
          knockbackScaling: 1.10,
          angle: 40,
          type: 'flying',
          hitlag: 6,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('wing_flap');
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'side', p.facing, '#38bdf8', 'normal', 38, false);
              window.particleManager.spawnFeathers(p.x + p.facing * 24, p.y - 18, 3, '#cbd5e1');
            }
          }
        };

      case 'dash':
        // Dash Attack: Embestida Aérea (Low-altitude dive tackle)
        return {
          name: 'Embestida Aérea (Dash Attack)',
          anim: 'Attack',
          animSpeed: 1.30,
          hitboxStart: 3,
          hitboxEnd: 11,
          offsetX: 32,
          offsetY: 18,
          radius: 36,
          damage: 8.0,
          baseKnockback: 22,
          knockbackScaling: 1.00,
          angle: 45,
          type: 'flying',
          hitlag: 5,
          onStart: (p) => {
            p.vx = p.facing * 6.5;
            window.soundEngine && window.soundEngine.playSfx('quick_attack');
            if (window.particleManager) {
              window.particleManager.spawnSmoke(p.x, p.y, '#ffffff', 6);
              window.particleManager.spawnFeathers(p.x, p.y - 12, 3, '#38bdf8');
            }
          }
        };

      default:
        // Neutral Jab: Picotazo Furtivo (3-hit rapid beak pecks)
        return {
          name: 'Picotazo Furtivo (Neutral Jab)',
          anim: 'Attack',
          animSpeed: 1.50,
          hitboxStart: 1,
          hitboxEnd: 7,
          offsetX: 24,
          offsetY: 18,
          radius: 28,
          damage: 4.8,
          baseKnockback: 14,
          knockbackScaling: 0.70,
          angle: 45,
          type: 'normal',
          hitlag: 4,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('hit_light');
            if (window.particleManager) {
              window.particleManager.spawnHitSparks(p.x + p.facing * 20, p.y - 18, 2, 'normal');
            }
          }
        };
    }
  }

  getSmashAttackDef(dir) {
    switch (dir) {
      case 'up':
        // Up Smash: ¡Tormenta Plumaria!
        return {
          name: '¡Tormenta Plumaria! (Up Smash)',
          anim: 'Attack',
          animSpeed: 1.25,
          hitboxStart: 3,
          hitboxEnd: 12,
          offsetX: 6,
          offsetY: 48,
          radius: 44,
          damage: 17.5,
          baseKnockback: 35,
          knockbackScaling: 1.50,
          angle: 88,
          type: 'flying',
          hitlag: 9,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('wing_flap');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(p.x, p.y - 30, '#38bdf8', 'normal', 44);
              window.particleManager.spawnFeathers(p.x, p.y - 20, 6, '#38bdf8');
            }
          }
        };

      case 'down':
        // Down Smash: ¡Doble Golpe de Garras!
        return {
          name: '¡Doble Golpe de Garras! (Down Smash)',
          anim: 'Attack',
          animSpeed: 1.20,
          hitboxStart: 3,
          hitboxEnd: 12,
          offsetX: 0,
          offsetY: 8,
          radius: 50, // Hits both front and back
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
              window.particleManager.spawnSmoke(p.x - 24, p.y, '#475569', 8);
              window.particleManager.spawnSmoke(p.x + 24, p.y, '#475569', 8);
              window.particleManager.spawnFeathers(p.x, p.y - 6, 4, '#ef4444');
            }
          }
        };

      default:
        // Side Smash: ¡Tajo Aéreo Titánico!
        return {
          name: '¡Tajo Aéreo Titánico! (Side Smash)',
          anim: 'Attack',
          animSpeed: 1.15,
          hitboxStart: 4,
          hitboxEnd: 13,
          offsetX: 36,
          offsetY: 22,
          radius: 46,
          damage: 18.5,
          baseKnockback: 36,
          knockbackScaling: 1.55,
          angle: 38,
          type: 'flying',
          hitlag: 10,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('smash');
            if (window.game && typeof window.game.triggerScreenShake === 'function') {
              window.game.triggerScreenShake(16, 0.30);
            }
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'side', p.facing, '#38bdf8', 'normal', 50, false);
              window.particleManager.spawnRadialBurst(p.x + p.facing * 28, p.y - 20, '#ef4444', 'normal', 42);
              window.particleManager.spawnFeathers(p.x + p.facing * 24, p.y - 20, 6, '#e2e8f0');
            }
          }
        };
    }
  }

  getSpecialMoveDef(dir) {
    switch (dir) {
      case 'neutral':
        // Neutral Special: Torbellino (Whirlwind / Tornado)
        // Genera un tornado imponente con FX3 mejorado que siempre manda al enemigo hacia arriba
        return {
          name: 'Torbellino (Neutral X)',
          anim: 'Shoot',
          animSpeed: 1.40,
          cooldown: 0.80,
          endLag: 0.22,
          hitboxStart: 999, // Uses projectile collision
          hitboxEnd: 999,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('wing_flap');
            if (window.particleManager) {
              window.particleManager.spawnFeathers(p.x + p.facing * 20, p.y - 20, 6, '#38bdf8');
            }

            const tornado = {
              x: p.x + p.facing * 30,
              y: p.y - 10,
              vx: p.facing * 6.5,
              vy: 0,
              radius: 42, // Aumentado significativamente (antes 26)
              life: 1.60,
              damage: 7.5,
              baseKnockback: 16, // Nerf 20% knockback
              knockbackScaling: 0.76, // Nerf 20% scaling
              angle: 90, // Siempre manda al enemigo hacia arriba (90° vertical)
              type: 'flying',
              hitlag: 6,
              hitTimer: 0,
              spinAngle: 0,
              update: function(dt) {
                this.spinAngle += dt * 16;
                this.hitTimer -= dt;
                if (Math.random() < 0.45 && window.particleManager) {
                  window.particleManager.spawnFeathers(
                    this.x + (Math.random() - 0.5) * 36,
                    this.y - Math.random() * 60,
                    1,
                    '#38bdf8'
                  );
                }
              },
              onHit: function(opp) {
                // Siempre manda al enemigo hacia arriba con fuerza
                opp.vx = 0;
                opp.vy = -12.8; // Nerf 20%
                if (window.particleManager) {
                  window.particleManager.spawnRadialBurst(this.x, this.y - 30, '#38bdf8', 'normal', 45);
                  window.particleManager.spawnFeathers(this.x, this.y - 30, 6, '#7dd3fc');
                }
              },
              draw: function(ctx) {
                ctx.save();
                // 3D-feeling Volumetric Cyclone Funnel
                const h = 72;
                const topW = 48;
                const botW = 14;
                const layers = 6;

                // Glowing tornado core gradient
                const grad = ctx.createLinearGradient(this.x, this.y - h, this.x, this.y);
                grad.addColorStop(0, 'rgba(186, 230, 253, 0.75)');
                grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.55)');
                grad.addColorStop(1, 'rgba(14, 165, 233, 0.25)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(this.x - botW * 0.5, this.y);
                ctx.lineTo(this.x - topW * 0.5, this.y - h);
                ctx.lineTo(this.x + topW * 0.5, this.y - h);
                ctx.lineTo(this.x + botW * 0.5, this.y);
                ctx.closePath();
                ctx.fill();

                // Swirling Wind Ellipses (Tornado Ribbons)
                for (let l = 0; l < layers; l++) {
                  const t = l / (layers - 1);
                  const ly = this.y - t * h;
                  const lw = botW + (topW - botW) * t;
                  const lh = 7 + t * 5;
                  const rot = this.spinAngle + l * 0.85;
                  const xOffset = Math.sin(rot) * (lw * 0.22);

                  ctx.save();
                  ctx.translate(this.x + xOffset, ly);
                  ctx.strokeStyle = l % 2 === 0 ? '#ffffff' : (l % 3 === 0 ? '#7dd3fc' : '#38bdf8');
                  ctx.lineWidth = 2.5 + t * 1.5;
                  ctx.shadowColor = '#38bdf8';
                  ctx.shadowBlur = 10;
                  ctx.beginPath();
                  ctx.ellipse(0, 0, lw * 0.5, lh * 0.5, Math.sin(rot) * 0.2, 0, Math.PI * 2);
                  ctx.stroke();
                  ctx.restore();
                }

                // Outer spiraling vortex gusts
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
                ctx.lineWidth = 2.0;
                for (let g = 0; g < 3; g++) {
                  const a = this.spinAngle * 1.4 + (g * Math.PI * 2) / 3;
                  const gy = this.y - ((Math.sin(a) + 1) * 0.5) * h;
                  const gw = botW + (topW - botW) * ((this.y - gy) / h);
                  ctx.beginPath();
                  ctx.arc(this.x + Math.cos(a) * (gw * 0.45), gy, 5, 0, Math.PI * 2);
                  ctx.stroke();
                }

                ctx.restore();
              }
            };

            p.projectiles.push(tornado);
          }
        };

      case 'side':
        // Side Special: Pájaro Osado (Brave Bird - Cargable, se mantiene en línea recta sin gravedad)
        return {
          name: 'Pájaro Osado (Side X - Cargable)',
          anim: 'Attack',
          chargeAnim: 'Charge',
          animSpeed: 1.50,
          canCharge: true,
          holdToCharge: true,
          maxCharge: 0.85,
          cooldown: 1.05,
          endLag: 0.28,
          hitboxStart: 999,
          hitboxEnd: 999,
          chargeBannerText: '¡CARGANDO PÁJARO OSADO!',
          chargeBannerColor: '#ef4444',
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('charge');
            if (window.particleManager) {
              window.particleManager.spawnFeathers(p.x, p.y - 18, 3, '#ef4444');
            }
          },
          onCharge: (p, chargeTime, maxCharge) => {
            const ratio = Math.min(1.0, chargeTime / maxCharge);
            if (Math.random() < 0.45 && window.particleManager) {
              window.particleManager.spawnFeathers(p.x - p.facing * 12, p.y - 18, 1, ratio > 0.8 ? '#ef4444' : '#f87171');
              window.particleManager.spawnSmoke(p.x, p.y, '#ef4444', 3);
            }
          },
          onMaxCharge: (p) => {
            window.soundEngine && window.soundEngine.playSfx('select', 0.2);
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(p.x, p.y - 20, '#ef4444', 'normal', 38);
              window.particleManager.spawnFloatingText(p.x, p.y - p.height - 20, '¡PÁJARO OSADO MÁXIMO!', '#ef4444', 18);
            }
          },
          onFire: (p, chargeRatio) => {
            // Se lanza en línea recta supersónica libre de gravedad
            p.braveBirdActive = true;
            p.braveBirdCharge = chargeRatio;
            p.braveBirdSpeed = 13.5 + chargeRatio * 10.5;
            p.braveBirdTimer = 0.32 + chargeRatio * 0.22;
            p.vy = 0; // Inmune a gravedad
            p.vx = p.facing * p.braveBirdSpeed;
            p.isGliding = false;

            window.soundEngine && window.soundEngine.playSfx('quick_attack');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(p.x, p.y - 20, '#ef4444', 'fire', 42);
              window.particleManager.spawnFeathers(p.x, p.y - 20, 6, '#ef4444');
            }
          }
        };

      case 'up':
        // Up Special: Vuelo (Fly - Vertical recovery liftoff & gliding apex)
        return {
          name: 'Vuelo (Up X)',
          anim: 'Hover',
          animSpeed: 1.40,
          cooldown: 0.90,
          endLag: 0.22,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 4,
          offsetY: 36,
          radius: 36,
          damage: 12.0,
          baseKnockback: 23,
          knockbackScaling: 1.15,
          angle: 88,
          type: 'flying',
          hitlag: 8,
          onStart: (p) => {
            p.vy = -16.8;
            p.vx = (p.input.left ? -4.5 : (p.input.right ? 4.5 : p.facing * 1.8));
            p.isGliding = true;
            p.vueloActive = true;
            p.vueloLiftoffTimer = 0.35;
            p.vueloApexReached = false;
            p.diveBombActive = false;
            p.diveBombMidairHit = false;
            p.diveBombGroundHit = false;

            window.soundEngine && window.soundEngine.playSfx('wing_flap');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(p.x, p.y, '#38bdf8', 'normal', 40);
              window.particleManager.spawnFeathers(p.x, p.y, 6, '#38bdf8');
              window.particleManager.spawnSmoke(p.x, p.y, '#ffffff', 8);
            }
          }
        };

      case 'down':
        // Down Special: Detección (Detect - 0.5s counter stance con lag tras fallar)
        return {
          name: 'Detección (Down X - Counter)',
          anim: 'Charge',
          animSpeed: 1.20,
          cooldown: 1.10,
          endLag: 0.38, // Punishable end lag si falla
          hitboxStart: 999, // Counter does not have attack hitbox unless triggered
          hitboxEnd: 999,
          onStart: (p) => {
            p.detectActive = true;
            p.detectTimer = 0.50; // Exactamente 0.5 segundos activo
            p.actionLockTimer = 0.50; // Bloqueado en postura defensiva
            p.detectPulseRadius = 12;

            window.soundEngine && window.soundEngine.playSfx('parry_shield');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(p.x, p.y - 20, '#38bdf8', 'normal', 34);
              window.particleManager.spawnFloatingText(p.x, p.y - p.height - 20, '¡DETECCIÓN!', '#38bdf8', 18);
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

  takeHit(hitbox, attacker, target = null) {
    // Detección (Detect Counter Stance)
    // Si te atacan durante la ventana activa de 0.5 segundos, bloquea todo daño
    if (this.detectActive && this.detectTimer > 0) {
      this.detectActive = false;
      this.detectTimer = 0;
      this.invulnTimer = 0.45;
      this.counterFlashTimer = 0.40;
      this.hitstop = 0;
      this.hitstun = 0;
      // Si acierta el counter, Staraptor NO tiene lag!
      this.state = 'IDLE';
      this.actionLockTimer = 0;

      window.soundEngine && window.soundEngine.playSfx('parry_shield');

      // El contraataque es un ataque estrictamente FÍSICO cuerpo a cuerpo (dist <= 85)
      const dist = attacker ? Math.hypot(attacker.x - this.x, (attacker.y - (attacker.height || 40) * 0.5) - (this.y - this.height * 0.5)) : 999;
      const isMeleePhysical = dist <= 85;

      if (attacker && isMeleePhysical) {
        // Impacto cuerpo a cuerpo: aplica el contraataque devastador
        attacker.hitstop = Math.max(attacker.hitstop || 0, 14);
        this.facing = attacker.x > this.x ? 1 : -1;
        this.anim.play('Attack', { speed: 2.2 });

        window.soundEngine && window.soundEngine.playSfx('smash');
        if (window.game && typeof window.game.triggerScreenShake === 'function') {
          window.game.triggerScreenShake(20, 0.35);
        }

        if (window.particleManager) {
          window.particleManager.spawnRadialBurst(this.x, this.y - 20, '#38bdf8', 'normal', 50);
          window.particleManager.spawnHitSparks(this.x, this.y - 20, 12, 'normal');
          window.particleManager.spawnFeathers(this.x, this.y - 20, 8, '#ef4444');
          window.particleManager.spawnFloatingText(this.x, this.y - this.height - 24, '¡CONTRAATAQUE!', '#38bdf8', 22);
        }

        const incomingDmg = (hitbox && hitbox.damage) ? hitbox.damage : 8;
        const counterDmg = Math.max(14.0, Math.round(incomingDmg * 1.45 * 10) / 10);

        if (typeof attacker.takeHit === 'function') {
          attacker.takeHit({
            damage: counterDmg,
            baseKnockback: 24,
            knockbackScaling: 1.30,
            angle: 42,
            type: 'flying',
            hitlag: 10
          }, this);
        }
      } else {
        // Ataque a distancia o proyectil: Staraptor se protege y desvía sin recibir daño,
        // pero NO daña al rival lejano (es un ataque físico). Staraptor queda libre sin lag.
        if (window.particleManager) {
          window.particleManager.spawnRadialBurst(this.x, this.y - 20, '#38bdf8', 'normal', 38);
          window.particleManager.spawnHitSparks(this.x, this.y - 20, 6, 'normal');
          window.particleManager.spawnFloatingText(this.x, this.y - this.height - 24, '¡DESVIADO!', '#38bdf8', 18);
        }
      }
      return; // Totalmente inmune al golpe recibido
    }

    super.takeHit(hitbox, attacker, target);
  }

  handleInputs(stage = null, dt = 1 / 60) {
    if (this.diveBombActive) {
      // Mientras cae en picado puede dirigir ligeramente horizontalmente pero no ejecutar otros ataques
      if (this.input.left) this.vx = -3.5;
      else if (this.input.right) this.vx = 3.5;
      return;
    }

    // SOLO hace el ataque hacia abajo cuando se hace vuelo, es decir es un segundo input de vuelo
    // (Up + Especial tras ascender). Requiere estrictamente Especial + Arriba.
    if (!this.isGrounded && this.vueloActive && this.vueloLiftoffTimer <= 0 && !this.diveBombActive) {
      const isSecondUpSpecial = this.input.specialPressed && (this.input.up || this.input.upPressed);
      if (isSecondUpSpecial) {
        this.input.specialPressed = false;
        this.input.upPressed = false;
        this.startDiveBomb();
        return;
      }
    }
    super.handleInputs(stage, dt);
  }

  startDiveBomb() {
    this.isGliding = false;
    this.vueloActive = false;
    this.diveBombActive = true;
    this.diveBombMidairHit = false;
    this.diveBombGroundHit = false;
    this.diveBombTimer = 1.6; // Temporizador de seguridad
    this.state = 'FALL'; // Estado FALL para que las físicas y aterrizaje funcionen con total fluidez
    this.actionLockTimer = 0;
    this.vy = 21.5;
    this.vx = (this.input.left ? -3.5 : (this.input.right ? 3.5 : this.facing * 2.5));
    this.anim.setAim('down');
    this.anim.play('Attack', { speed: 2.2, hold: true });
    window.soundEngine && window.soundEngine.playSfx('dive_bomb');
    if (window.particleManager) {
      window.particleManager.spawnRadialBurst(this.x, this.y, '#38bdf8', 'normal', 36);
      window.particleManager.spawnFeathers(this.x, this.y, 6, '#38bdf8');
    }
  }

  update(dt, opponent, stage) {
    super.update(dt, opponent, stage);

    if (this.state === 'RESPAWN') {
      this.isGliding = false;
      this.vueloActive = false;
      this.diveBombActive = false;
      this.vueloLiftoffTimer = 0;
    }

    // Sprite volando cuando salta o está en el aire (Hover)
    if (!this.isGrounded) {
      if (!this.diveBombActive && (this.state === 'IDLE' || this.state === 'WALK' || this.state === 'JUMP' || this.state === 'FALL')) {
        const hoverSpeed = this.isGliding ? 0.90 : (this.vy < -1 ? 1.35 : 1.0);
        this.anim.loop('Hover', hoverSpeed);
      }
    } else {
      if (this.anim.curAnim === 'Hover' && !this.anim.isBusy()) {
        this.anim.loop('Idle', 1.0);
      }
      this.isGliding = false;
      this.vueloActive = false;
    }

    // 1. Gestión de los 5 saltos y aleteo
    if (this.isGrounded) {
      this.jumpsLeft = this.maxJumps;
      this.doubleJumpForce = 7.80;
      this.isGliding = false;
      this.diveBombActive = false;
    } else {
      // Salto progresivo aéreo
      const jumpsUsed = this.maxJumps - this.jumpsLeft;
      this.doubleJumpForce = Math.max(5.40, 7.80 - jumpsUsed * 0.60);
    }

    if (this.vueloLiftoffTimer > 0) {
      this.vueloLiftoffTimer = Math.max(0, this.vueloLiftoffTimer - dt);
    }

    // Detección de apex de Vuelo
    if (this.vueloActive && this.vy >= -2.0) {
      this.vueloApexReached = true;
    }

    // Caída en Picado (Dive Bomb)
    if (this.diveBombActive) {
      this.vy = 21.5; // Caída acelerada en picado
      this.diveBombTimer = (this.diveBombTimer || 1.6) - dt;
      if (this.diveBombTimer <= 0) {
        this.diveBombActive = false;
        this.anim.setAim('center');
      }
      if (window.particleManager && Math.random() < 0.70) {
        window.particleManager.spawnFeathers(this.x, this.y - 12, 1, '#38bdf8');
        window.particleManager.spawnSmoke(this.x, this.y - 10, '#e0f2fe', 3);
      }

      // Spike aéreo: SOLO DAÑA UNA VEZ en el aire
      if (!this.diveBombMidairHit && opponent && opponent.state !== 'RESPAWN' && opponent.invulnTimer <= 0) {
        const talonBox = { x: this.x, y: this.y + 4, radius: 34 };
        const hurtboxes = opponent.getHurtboxes ? opponent.getHurtboxes() : [{ x: opponent.x, y: opponent.y - opponent.height * 0.5, radius: opponent.hurtboxRadius }];
        let hitMidair = false;
        for (const hb of hurtboxes) {
          if (window.physicsEngine.checkHitboxCollision(talonBox, hb)) {
            hitMidair = true;
            break;
          }
        }
        if (hitMidair) {
          this.diveBombMidairHit = true; // Solo puede dañar una vez
          opponent.takeHit({
            damage: 14.0,
            baseKnockback: 26,
            knockbackScaling: 1.25,
            angle: 270, // Spike meteórico hacia abajo
            type: 'flying',
            hitlag: 9
          }, this);
          window.soundEngine && window.soundEngine.playSfx('hit_heavy');
          if (window.game) window.game.triggerScreenShake(18, 0.35);
          if (window.particleManager) {
            window.particleManager.spawnRadialBurst(this.x, this.y + 10, '#38bdf8', 'normal', 42);
            window.particleManager.spawnFeathers(this.x, this.y, 8, '#38bdf8');
          }
        }
      }

      // Impacto contra el suelo: Onda de choque explosiva terrestre (solo daña una vez)
      if (this.isGrounded) {
        this.diveBombActive = false;
        this.vueloActive = false;
        this.vy = 0;
        this.vx *= 0.20;
        this.state = 'IDLE';
        this.actionLockTimer = 0.22;
        this.anim.setAim('center');
        this.anim.loop('Idle', 1.0);
        window.soundEngine && window.soundEngine.playSfx('heavy_hit');
        if (window.game) window.game.triggerScreenShake(16, 0.32);
        if (window.particleManager) {
          window.particleManager.spawnRadialBurst(this.x, this.y, '#38bdf8', 'normal', 48);
          window.particleManager.spawnSmoke(this.x, this.y, '#ffffff', 14);
          window.particleManager.spawnFeathers(this.x, this.y, 8, '#7dd3fc');
        }

        if (!this.diveBombGroundHit && opponent && opponent.state !== 'RESPAWN' && opponent.invulnTimer <= 0) {
          const dist = Math.abs(opponent.x - this.x);
          if (dist <= 80 && Math.abs(opponent.y - this.y) <= 38) {
            this.diveBombGroundHit = true; // Solo puede dañar una vez
            opponent.takeHit({
              damage: 15.0,
              baseKnockback: 24,
              knockbackScaling: 1.20,
              angle: 85, // Lanza hacia arriba
              type: 'flying',
              hitlag: 8
            }, this);
          }
        }
      }
    }

    // 2. Lógica de Pájaro Osado (Brave Bird - Trayectoria horizontal pura sin gravedad)
    if (this.braveBirdActive) {
      this.braveBirdTimer -= dt;
      // Inmune a gravedad mientras viaja
      this.vy = 0;
      this.vx = this.facing * this.braveBirdSpeed;

      // Partículas y estela aerodinámica
      if (window.particleManager && Math.random() < 0.65) {
        window.particleManager.spawnFeathers(this.x - this.facing * 18, this.y - 18, 1, '#ef4444');
        window.particleManager.spawnSmoke(this.x - this.facing * 14, this.y - 16, '#f87171', 4);
      }

      // Detección de colisión frontal
      if (opponent && opponent.state !== 'RESPAWN' && opponent.invulnTimer <= 0) {
        const myBox = { x: this.x + this.facing * 22, y: this.y - 20, radius: 36 };
        const hurtboxes = opponent.getHurtboxes
          ? opponent.getHurtboxes()
          : [{ x: opponent.x, y: opponent.y - opponent.height * 0.5, radius: opponent.hurtboxRadius }];
        
        let hit = false;
        for (const hb of hurtboxes) {
          if (window.physicsEngine.checkHitboxCollision(myBox, hb)) {
            hit = true;
            break;
          }
        }

        if (hit) {
          const dmg = 12.0 + this.braveBirdCharge * 12.0;
          opponent.takeHit({
            damage: dmg,
            baseKnockback: 22 + this.braveBirdCharge * 10,
            knockbackScaling: 1.25 + this.braveBirdCharge * 0.35,
            angle: 38,
            type: 'flying',
            hitlag: 8
          }, this);

          // Daño de retroceso (Recoil 2.5% signature Brave Bird)
          this.percent = Math.min(999, this.percent + 2.5);

          window.soundEngine && window.soundEngine.playSfx('hit_heavy');
          if (window.game && typeof window.game.triggerScreenShake === 'function') {
            window.game.triggerScreenShake(18, 0.32);
          }
          if (window.particleManager) {
            window.particleManager.spawnRadialBurst(this.x + this.facing * 24, this.y - 20, '#ef4444', 'fire', 46);
            window.particleManager.spawnHitSparks(this.x + this.facing * 24, this.y - 20, 10, 'normal');
            window.particleManager.spawnFeathers(this.x, this.y - 20, 6, '#ef4444');
          }

          this.braveBirdActive = false;
          this.actionLockTimer = 0.20;
          this.vx *= 0.25;
        }
      }

      if (this.braveBirdTimer <= 0) {
        this.braveBirdActive = false;
        this.actionLockTimer = 0.28; // Punishable end lag
        this.vx *= 0.35;
      }
    }

    // 3. Postura de Detección (Detect Timer & Lag)
    if (this.detectActive) {
      this.detectTimer -= dt;
      this.detectPulseRadius += dt * 80;
      this.vx *= 0.70;

      if (this.detectTimer <= 0) {
        // Expiró sin impacto: sufre lag de castigo
        this.detectActive = false;
        this.actionLockTimer = 0.38; // Lag tras postura fallida
        this.state = 'IDLE';
      }
    }

    if (this.counterFlashTimer > 0) {
      this.counterFlashTimer -= dt;
    }

    // 4. Planeo en el aire (Fly Gliding)
    if (this.isGliding && !this.isGrounded) {
      // Permite control lateral suave mientras cae lentamente
      if (this.input.left) this.vx = Math.max(-5.2, this.vx - 0.40);
      if (this.input.right) this.vx = Math.min(5.2, this.vx + 0.40);

      // Descenso atenuado
      this.vy = Math.min(2.8, this.vy);

      if (this.input.down || this.input.attack || this.input.special) {
        this.isGliding = false;
      }
    }
  }

  draw(ctx, opts = {}) {
    // 1. Efecto visual de Detección (Onda de pulso defensivo azul)
    if (this.detectActive) {
      ctx.save();
      const alpha = Math.max(0, this.detectTimer / 0.50);
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.85})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 20, Math.min(55, this.detectPulseRadius), 0, Math.PI * 2);
      ctx.stroke();

      // Círculo central protector
      ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.20})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 20, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Estela cónica de Pájaro Osado
    if (this.braveBirdActive) {
      ctx.save();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.40)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 16;

      ctx.beginPath();
      ctx.ellipse(this.x - this.facing * 16, this.y - 20, 36, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Vórtice de velocidad
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x - this.facing * 44, this.y - 26);
      ctx.lineTo(this.x + this.facing * 20, this.y - 20);
      ctx.lineTo(this.x - this.facing * 44, this.y - 14);
      ctx.stroke();

      ctx.restore();
    }

    // Estela aerodinámica de Caída en Picado
    if (this.diveBombActive) {
      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + 14);
      ctx.lineTo(this.x - 22, this.y - 36);
      ctx.lineTo(this.x + 22, this.y - 36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 3. Renderizado base
    super.draw(ctx, opts);
  }
}

window.Staraptor = Staraptor;

