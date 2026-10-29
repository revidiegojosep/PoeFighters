/**
 * Charizard Fighter (Dex 6)
 * Super Smash Bros Ultimate Moveset:
 * Heavyweight Fire/Flying powerhouse with immense kill power, super armor specials,
 * multi-jumps with draconic wings, and devastating flame attacks.
 *
 * Specials (Smash Ultimate):
 *  - Neutral X: Flamethrower (Lanzallamas - Stream of continuous multi-hit fire)
 *  - Side X: Flare Blitz (Envite Ígneo - Blazing super-armored ram with huge knockback and 4% recoil)
 *  - Up X: Fly (Vuelo - Multi-hit ascending spinning flight with super armor startup)
 *  - Down X: Rock Smash (Golpe Roca - Headbutts a massive boulder, shattering it into rock shrapnel)
 *
 * Basics & Smash:
 *  - Side Smash: Ala Ígnea (Massive double wing blast with blazing flames)
 *  - Up Smash: Furia Ascendente (Twin wing vertical strike)
 *  - Down Smash: Pisotón Sísmico (Two-sided earth-shattering stomp)
 *  - Down Air: Pisotón Meteoro (Meteor spike stomp beneath feet)
 *  - Back Air: Martillazo de Cola (Lethal tail whip with flame sweetspot)
 */
class Charizard extends window.Fighter {
  constructor(config = {}) {
    super({
      name: 'Charizard',
      dex: 6,
      pokedexWeight: 90.5,
      weight: 90.5,
      weightCategory: 'Pesado',
      color: '#ea580c',       // Flame Orange
      accentColor: '#f97316', // Fiery Amber
      walkSpeed: 2.74,        // Reducido 10% adicional (antes 3.04)
      dashSpeed: 5.90,        // Reducido 10% adicional (antes 6.56)
      jumpForce: 10.8,        
      doubleJumpForce: 8.96,  
      scale: 2.85,            
      ...config
    });

    // 1 Salto en tierra + 2 Saltos en el aire (¡Ahora tiene 3 saltos en total!)
    this.maxJumps = 3;
    this.jumpsLeft = this.maxJumps;

    // Heavyweight physics
    this.airFriction = 0.982;

    // Special moves state
    this.flamethrowerTimer = 0;
    this.flamethrowerFuel = 1.0;
    this.isBreadingFire = false;
    this.flareBlitzActive = false;
    this.flareBlitzTimer = 0;
    this.flareBlitzHit = false;
    this.superArmorActive = false;
  }

  getBasicAttackDef(dir, isAir = false) {
    if (isAir) {
      switch (dir) {
        case 'up':
          // Up Air: Powerful upward horn thrust
          return {
            name: 'Golpe de Cuerno (Up Air)',
            anim: 'Attack',
            animSpeed: 0.96, // Reducido 20% adicional (antes 1.20)
            hitboxStart: 4,
            hitboxEnd: 11,
            offsetX: 4,
            offsetY: 48,
            radius: 38,
            damage: 10.4,
            baseKnockback: 25,
            knockbackScaling: 1.30,
            angle: 88,
            type: 'fire',
            hitlag: 7,
            onStart: (p) => {
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'up', p.facing, '#f97316', 'fire', 40, true);
              }
            }
          };

        case 'down':
          // Down Air: Meteor Stomp (Devastating downward spike)
          return {
            name: 'Pisotón Meteoro (Down Air)',
            anim: 'Attack',
            animSpeed: 0.90, // Reducido 20% adicional (antes 1.12)
            hitboxStart: 5,
            hitboxEnd: 13,
            offsetX: 6,
            offsetY: -10,
            radius: 36,
            damage: 11.2,
            baseKnockback: 28,
            knockbackScaling: 1.35,
            angle: 270, // True meteor spike!
            type: 'fire',
            hitlag: 9,
            onStart: (p) => {
              window.soundEngine && window.soundEngine.playSfx('hit_heavy');
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'down', p.facing, '#ef4444', 'fire', 44, true);
                window.particleManager.spawnHitSparks(p.x, p.y + 10, 6, 'normal');
              }
            }
          };

        case 'forward':
        case 'side':
          // Forward Air: Blazing Claw Swipe
          return {
            name: 'Garra Ígnea (Forward Air)',
            anim: 'Attack',
            animSpeed: 1.02, // Reducido 20% adicional (antes 1.28)
            hitboxStart: 3,
            hitboxEnd: 10,
            offsetX: 36,
            offsetY: 24,
            radius: 38,
            damage: 10.0,
            baseKnockback: 26,
            knockbackScaling: 1.20,
            angle: 42,
            type: 'fire',
            hitlag: 6,
            onStart: (p) => {
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'side', p.facing, '#f97316', 'fire', 42, true);
              }
            }
          };

        case 'back':
          // Back Air: Tail Hammer with fiery tip sweetspot
          return {
            name: 'Martillazo de Cola (Back Air)',
            anim: 'Attack',
            animSpeed: 0.96, // Reducido 20% adicional (antes 1.20)
            hitboxStart: 4,
            hitboxEnd: 11,
            offsetX: -38,
            offsetY: 20,
            radius: 40,
            damage: 11.6,
            baseKnockback: 30,
            knockbackScaling: 1.30,
            angle: 140, // Knocks behind with massive power!
            type: 'fire',
            hitlag: 8,
            onStart: (p) => {
              window.soundEngine && window.soundEngine.playSfx('hit_heavy');
              if (window.particleManager) {
                window.particleManager.spawnMeleeSlash(p.x, p.y, 'side', -p.facing, '#ea580c', 'fire', 44, true);
                window.particleManager.spawnHitSparks(p.x - p.facing * 34, p.y - 20, 8, 'normal');
              }
            }
          };

        default:
          // Neutral Air: 360° Wing Spin
          return {
            name: 'Giro de Alas (Neutral Air)',
            anim: 'Attack',
            animSpeed: 0.99, // Reducido 20% adicional (antes 1.24)
            hitboxStart: 3,
            hitboxEnd: 14,
            offsetX: 0,
            offsetY: 22,
            radius: 44,
            damage: 8.0,
            baseKnockback: 20,
            knockbackScaling: 1.05,
            angle: 45,
            type: 'normal',
            hitlag: 5,
            onStart: (p) => {
              if (window.particleManager) {
                window.particleManager.spawnRadialBurst(p.x, p.y - 22, '#f97316', 'electric', 40);
              }
            }
          };
      }
    }

    // Ground Tilts & Basics
    switch (dir) {
      case 'up':
        // Up Tilt: Upward sweeping horn strike (Anti-Air)
        return {
          name: 'Golpe Ascendente (Up Tilt)',
          anim: 'Attack',
          animSpeed: 0.96, // Reducido 20% adicional (antes 1.20)
          hitboxStart: 3,
          hitboxEnd: 10,
          offsetX: 10,
          offsetY: 46,
          radius: 36,
          damage: 7.6,
          baseKnockback: 23,
          knockbackScaling: 1.10,
          angle: 86,
          type: 'fire',
          hitlag: 5,
          onStart: (p) => {
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'up', p.facing, '#f97316', 'fire', 38, false);
            }
          }
        };

      case 'down':
        // Down Tilt: Low sweeping tail whip (Trips opponents)
        return {
          name: 'Barrido de Cola (Down Tilt)',
          anim: 'Attack',
          animSpeed: 1.02, // Reducido 20% adicional (antes 1.28)
          hitboxStart: 3,
          hitboxEnd: 9,
          offsetX: 28,
          offsetY: 6,
          radius: 34,
          damage: 6.8,
          baseKnockback: 20,
          knockbackScaling: 1.00,
          angle: 25, // Low horizontal trip trajectory
          type: 'fire',
          hitlag: 5,
          onStart: (p) => {
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'down', p.facing, '#ea580c', 'fire', 36, false);
            }
          }
        };

      case 'side':
        // Forward Tilt: Heavy Wing Whip
        return {
          name: 'Latigazo de Ala (Forward Tilt)',
          anim: 'Attack',
          animSpeed: 0.93, // Reducido 20% adicional (antes 1.16)
          hitboxStart: 4,
          hitboxEnd: 11,
          offsetX: 34,
          offsetY: 22,
          radius: 38,
          damage: 8.8,
          baseKnockback: 25,
          knockbackScaling: 1.15,
          angle: 40,
          type: 'fire',
          hitlag: 6,
          onStart: (p) => {
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'side', p.facing, '#f97316', 'fire', 42, false);
            }
          }
        };

      default:
        // Neutral Jab: 3-hit Claw & Wing combo
        return {
          name: 'Garra Doble (Neutral Jab)',
          anim: 'Attack',
          animSpeed: 1.15, // Reducido 20% adicional (antes 1.44)
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 26,
          offsetY: 20,
          radius: 32,
          damage: 5.6,
          baseKnockback: 16,
          knockbackScaling: 0.90,
          angle: 45,
          type: 'normal',
          hitlag: 4,
          onStart: (p) => {
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'side', p.facing, '#f97316', 'normal', 32, false);
            }
          }
        };
    }
  }

  getSpecialMoveDef(dir) {
    switch (dir) {
      case 'neutral':
        // Neutral Special: Flamethrower (Lanzallamas - Hold X to breathe fire!)
        return {
          name: '¡Lanzallamas! (Neutral X)',
          anim: 'Shoot',
          animSpeed: 0.70, // Reducido 20% adicional (antes 0.88)
          canCharge: true,
          holdToCharge: true,
          maxCharge: 3.5,
          allowHoldBeyondMax: false,
          chargeAnim: 'Shoot',
          onCharge: (p, timer, max) => {
            // Spew roaring fire stream continuously
            p.vx *= 0.55;
            p.flamethrowerTimer += 1 / 60;
            const currentReach = Math.max(65, 120 - (timer / max) * 45);

            if (Math.random() < 0.65) {
              window.soundEngine && window.soundEngine.playSfx('flamethrower');
            }

            if (window.particleManager) {
              window.particleManager.spawnFlameStream(
                p.x + p.facing * 28,
                p.y - 24,
                p.facing,
                currentReach,
                28
              );
            }

            // Hitbox pulse every 6 frames (~10 ticks per sec)
            if (Math.floor(timer * 60) % 6 === 0) {
              const opp = window.game ? (p === window.game.player ? window.game.dummy : window.game.player) : null;
              if (opp && opp.state !== 'RESPAWN' && opp.invulnTimer <= 0) {
                const fireBox = {
                  x: p.x + p.facing * (currentReach * 0.5 + 14),
                  y: p.y - 24,
                  radius: currentReach * 0.45
                };
                const hurtboxes = opp.getHurtboxes
                  ? opp.getHurtboxes()
                  : [{ x: opp.x, y: opp.y - opp.height * 0.5, radius: opp.hurtboxRadius }];

                for (const hb of hurtboxes) {
                  if (window.physicsEngine.checkHitboxCollision(fireBox, hb)) {
                    opp.takeHit({
                      damage: 1.76,
                      baseKnockback: 9,
                      knockbackScaling: 0.22,
                      angle: 35,
                      type: 'fire',
                      hitlag: 3
                    }, p);
                    break;
                  }
                }
              }
            }
          },
          onFire: (p) => {
            p.state = 'IDLE';
            p.actionLockTimer = 0.28;
          }
        };

      case 'side':
        // Side Special: Flare Blitz (Envite Ígneo - Sin invulnerabilidad, knockback nerfeado un 15%, 50% recoil)
        return {
          name: '¡Envite Ígneo! (Side X)',
          anim: 'Charge',
          animSpeed: 0.90, // Reducido 20% adicional (antes 1.12)
          hitboxStart: 5,
          hitboxEnd: 30,
          offsetX: 32,
          offsetY: 22,
          radius: 46,
          damage: 16.8,
          baseKnockback: 21.2, // Reducido 15% (antes 25)
          knockbackScaling: 0.89, // Reducido 15% (antes 1.05)
          angle: 38,
          type: 'fire',
          hitlag: 10,
          cooldown: 1.05,
          onStart: (p) => {
            p.superArmorActive = false; // Ya NO es invulnerable
            p.flareBlitzActive = true;
            p.flareBlitzHit = false;
            p.vx = p.facing * 11.8; // Velocidad de embestida reducida ~10%
            window.soundEngine && window.soundEngine.playSfx('flare_blitz');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(p.x, p.y - 20, '#f97316', 'electric', 42);
            }
          },
          onUpdate: (p, frame) => {
            p.superArmorActive = false; // Sin armor
            if (frame < 30 && p.state === 'SPECIAL') {
              p.vx = p.facing * Math.max(6.5, 11.8 - frame * 0.24);
              if (window.particleManager && Math.random() < 0.85) {
                window.particleManager.spawnSmoke(p.x - p.facing * 18, p.y - 14, '#f97316', 9);
                window.particleManager.spawnHitSparks(p.x, p.y - 20, 3, 'fire');
              }
            }
          },
          onHit: (p) => {
            p.superArmorActive = false;
            p.flareBlitzActive = false;
            // Daño a Charizard: 50% del daño realizado (16.8 * 0.5 = 8.4%)
            const recoilDamage = 8.4;
            p.percent = Math.min(999, p.percent + recoilDamage);
            window.soundEngine && window.soundEngine.playSfx('blast_ko');
            if (window.game) window.game.triggerScreenShake(16, 0.35);
            if (window.particleManager) {
              window.particleManager.spawnFieryExplosion(p.x + p.facing * 30, p.y - 24, 55);
              window.particleManager.spawnFloatingText(p.x, p.y - p.height - 10, '+8.4% [50% Recoil]', '#ef4444', 15);
            }
          }
        };

      case 'up':
        // Up Special: Fly (Vuelo - Multi-hit rising spiral with Super Armor on startup)
        return {
          name: '¡Vuelo! (Up X)',
          anim: 'Attack',
          animSpeed: 0.86, // Reducido 20% adicional (antes 1.08)
          hitboxStart: 3,
          hitboxEnd: 23,
          offsetX: 8,
          offsetY: 34,
          radius: 42,
          damage: 12.0,
          baseKnockback: 26,
          knockbackScaling: 1.15,
          angle: 85,
          type: 'fire',
          hitlag: 7,
          onStart: (p) => {
            p.superArmorActive = true;
            p.upSpecialUsed = true;
            p.vy = -12.0; // Reducido (antes -13.2)
            p.vx = p.facing * 3.0; // Reducido (antes 3.36)
            window.soundEngine && window.soundEngine.playSfx('wing_flap');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(p.x, p.y - 18, '#ea580c', 'electric', 46);
              window.particleManager.spawnHitSparks(p.x, p.y - 20, 8, 'fire');
            }
            setTimeout(() => { p.superArmorActive = false; }, 200);
          },
          onUpdate: (p, frame) => {
            if (frame < 23) {
              if (window.particleManager && Math.random() < 0.70) {
                window.particleManager.spawnSmoke(p.x, p.y, '#f97316', 7);
              }
            }
          }
        };

      case 'down':
        // Down Special: Rock Smash (Golpe Roca - Smashes boulder into shrapnel, Super Armor)
        return {
          name: '¡Golpe Roca! (Down X)',
          anim: 'Charge',
          animSpeed: 0.80, // Reducido 20% adicional (antes 1.00)
          hitboxStart: 9,
          hitboxEnd: 20,
          offsetX: 28,
          offsetY: 20,
          radius: 44,
          damage: 12.8,
          baseKnockback: 28,
          knockbackScaling: 1.15,
          angle: 48,
          type: 'normal',
          hitlag: 9,
          cooldown: 0.95, // Mayor lag
          onStart: (p) => {
            p.superArmorActive = true;
            p.vx *= 0.2;
            setTimeout(() => {
              p.superArmorActive = false;
              window.soundEngine && window.soundEngine.playSfx('rock_smash');
              if (window.game) window.game.triggerScreenShake(16, 0.30);
              if (window.particleManager) {
                window.particleManager.spawnRockShards(p.x + p.facing * 28, p.y - 18, 14);
                window.particleManager.spawnRadialBurst(p.x + p.facing * 28, p.y - 18, '#78716c', 'normal', 42);
              }

              // Spawn 3 flying boulder fragment projectiles
              const spreadY = [-3, -1, 2];
              for (let i = 0; i < 3; i++) {
                p.projectiles.push({
                  x: p.x + p.facing * 28,
                  y: p.y - 18 + spreadY[i] * 4,
                  vx: p.facing * (4.8 + Math.random() * 1.8),
                  vy: spreadY[i],
                  radius: 12,
                  damage: 4.0,
                  knockbackScaling: 0.5,
                  baseKnockback: 12,
                  angle: 35,
                  life: 0.35,
                  type: 'normal',
                  hitlag: 4,
                  isProjectile: true,
                  update: (dtProj) => {},
                  draw: (ctx) => {
                    ctx.save();
                    ctx.fillStyle = '#57534e';
                    ctx.strokeStyle = '#a8a29e';
                    ctx.lineWidth = 1.8;
                    ctx.beginPath();
                    ctx.arc(0, 0, 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                  }
                });
              }
            }, 175);
          }
        };
    }
  }

  getSpecialAttackDef(dir) {
    return this.getSpecialMoveDef(dir);
  }

  getSmashAttackDef(dir) {
    switch (dir) {
      case 'up':
        // Up Smash: Blazing Twin Wing Rising Strike
        return {
          name: '¡Aleteo Infernal! (Up Smash)',
          anim: 'Attack',
          animSpeed: 0.93, // Reducido 20% adicional (antes 1.16)
          hitboxStart: 4,
          hitboxEnd: 14,
          offsetX: 8,
          offsetY: 48,
          radius: 46,
          damage: 15.2,
          baseKnockback: 32,
          knockbackScaling: 1.45,
          angle: 88,
          type: 'fire',
          hitlag: 8,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('wing_flap');
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'up', p.facing, '#f97316', 'fire', 48, false);
            }
          }
        };

      case 'down':
        // Down Smash: Earthquake Foot Stomp (Both sides)
        return {
          name: '¡Pisotón Sísmico! (Down Smash)',
          anim: 'Attack',
          animSpeed: 0.96, // Reducido 20% adicional (antes 1.20)
          hitboxStart: 4,
          hitboxEnd: 14,
          offsetX: 0,
          offsetY: 8,
          radius: 54, // Hits on both sides
          damage: 13.6,
          baseKnockback: 28,
          knockbackScaling: 1.30,
          angle: 35,
          type: 'normal',
          hitlag: 8,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('hit_heavy');
            if (window.game) window.game.triggerScreenShake(16, 0.30);
            if (window.particleManager) {
              window.particleManager.spawnSmoke(p.x - 28, p.y, '#78716c', 10);
              window.particleManager.spawnSmoke(p.x + 28, p.y, '#78716c', 10);
            }
          }
        };

      default:
        // Side Smash: Fiery Wing Blast
        return {
          name: '¡Ala Ígnea! (Forward Smash)',
          anim: 'Attack',
          animSpeed: 0.90, // Reducido 20% adicional (antes 1.12)
          hitboxStart: 5,
          hitboxEnd: 15,
          offsetX: 40,
          offsetY: 24,
          radius: 48,
          damage: 17.6,
          baseKnockback: 34,
          knockbackScaling: 1.45,
          angle: 36,
          type: 'fire',
          hitlag: 10,
          onStart: (p) => {
            window.soundEngine && window.soundEngine.playSfx('flare_blitz');
            if (window.particleManager) {
              window.particleManager.spawnMeleeSlash(p.x, p.y, 'side', p.facing, '#ea580c', 'fire', 54, false);
              window.particleManager.spawnRadialBurst(p.x + p.facing * 30, p.y - 20, '#f97316', 'electric', 46);
            }
          }
        };
    }
  }

  takeHit(hitbox, attacker, target = null) {
    // Super Armor: Charizard absorbs hits during Fly startup and Rock Smash!
    if (this.superArmorActive && hitbox) {
      this.percent = Math.min(999, this.percent + (hitbox.damage || 5));
      if (window.soundEngine) window.soundEngine.playSfx('parry_shield');
      if (window.particleManager) {
        window.particleManager.spawnHitSparks(this.x, this.y - this.height * 0.5, 4, 'impact');
        window.particleManager.spawnFloatingText(this.x, this.y - this.height - 18, '🛡️ ARMOR!', '#facc15', 16);
      }
      return; // Does NOT take knockback or enter hitstun!
    }

    super.takeHit(hitbox, attacker, target);
  }

  update(dt, opponent, stage) {
    super.update(dt, opponent, stage);

    // Dynamic Tail Flame Particles
    if (this.state !== 'RESPAWN' && window.particleManager && Math.random() < 0.40) {
      const tailX = this.x - this.facing * 26;
      const tailY = this.y - 18;
      window.particleManager.spawnSmoke(tailX, tailY, Math.random() < 0.5 ? '#f97316' : '#ea580c', 4);
    }
  }
}

window.Charizard = Charizard;
