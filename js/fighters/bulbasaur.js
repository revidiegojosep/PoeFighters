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
      weight: 105,
      color: '#48d0b0',
      accentColor: '#10b981',
      walkSpeed: 3.5,
      dashSpeed: 5.6,
      jumpForce: 13.0,
      doubleJumpForce: 11.5,
      scale: 2.4,
      ...config
    });
  }

  getBasicAttackDef(dir, isAir = false) {
    if (isAir) {
      switch (dir) {
        case 'up':
          // Up Air: Dual vines whipping straight above Bulbasaur
          return {
            name: 'Látigo Aéreo Elevado (Up Air)',
            anim: 'Attack',
            animSpeed: 1.35,
            hitboxStart: 2,
            hitboxEnd: 9,
            offsetX: 10,
            offsetY: 42,
            radius: 36, // Striking directly above Bulbasaur
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
                window.particleManager.spawnRazorLeaves(b.x, b.y - 35, 0, -3, 3);
              }
            }
          };

        case 'down':
          // Down Air: Heavy downward vine slam / meteor spike!
          return {
            name: 'Látigo Meteoro (Down Air / Spike)',
            anim: 'Attack',
            animSpeed: 1.3,
            hitboxStart: 3,
            hitboxEnd: 11,
            offsetX: 8,
            offsetY: -4, // Reaches downward below the feet!
            radius: 34,
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
                window.particleManager.spawnRazorLeaves(b.x, b.y + 4, 0, 3, 3);
              }
            }
          };

        case 'side':
          // Forward Air: Aerial tackle headbutt
          return {
            name: 'Cabezazo Aéreo (Forward Air)',
            anim: 'Attack',
            animSpeed: 1.25,
            hitboxStart: 3,
            hitboxEnd: 10,
            offsetX: 30,
            offsetY: 20,
            radius: 28,
            damage: 8,
            baseKnockback: 13,
            knockbackScaling: 1.0,
            angle: 42,
            type: 'physical',
            hitlag: 7,
            slashColor: '#34d399',
            onStart: (b) => {
              window.soundEngine.playSfx('hit_medium');
            }
          };

        case 'neutral':
        default:
          // Neutral Air: 360 foliage spin
          return {
            name: 'Espiral Follaje (Neutral Air)',
            anim: 'Attack',
            animSpeed: 1.4,
            hitboxStart: 2,
            hitboxEnd: 8,
            offsetX: 0,
            offsetY: 20,
            radius: 32,
            damage: 7,
            baseKnockback: 9,
            knockbackScaling: 0.7,
            angle: 45,
            type: 'grass',
            hitlag: 5,
            slashColor: '#10b981',
            onStart: (b) => {
              window.soundEngine.playSfx('whip');
            }
          };
      }
    }

    // Grounded Basic Attacks
    switch (dir) {
      case 'side':
        return {
          name: 'Placaje Cabeza (Side Tilt)',
          anim: 'Attack',
          animSpeed: 1.2,
          hitboxStart: 4,
          hitboxEnd: 11,
          offsetX: 30,
          offsetY: 20,
          radius: 28,
          damage: 10,
          baseKnockback: 15,
          knockbackScaling: 1.1,
          angle: 42,
          type: 'physical',
          hitlag: 8,
          slashColor: '#34d399',
          onStart: (b) => {
            b.vx = b.facing * 4.0;
            window.soundEngine.playSfx('hit_medium');
            if (window.particleManager) {
              window.particleManager.spawnSmoke(b.x - b.facing * 12, b.y, '#ffffff', 6);
            }
          }
        };

      case 'up':
        return {
          name: 'Látigo Superior (Up Tilt)',
          anim: 'Attack',
          animSpeed: 1.3,
          hitboxStart: 2,
          hitboxEnd: 9,
          offsetX: 18,
          offsetY: 28,
          radius: 36, // Sweeps from front-ground to overhead
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
              window.particleManager.spawnRazorLeaves(b.x, b.y - 30, 0, -3, 2);
            }
          }
        };

      case 'down':
        return {
          name: 'Barrido Cepa (Down Tilt)',
          anim: 'Attack',
          animSpeed: 1.2,
          hitboxStart: 3,
          hitboxEnd: 9,
          offsetX: 30,
          offsetY: 12,
          radius: 28, // Reaches along the ground
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
              window.particleManager.spawnSmoke(b.x + b.facing * 18, b.y, '#34d399', 5);
            }
          }
        };

      case 'neutral':
      default:
        return {
          name: 'Látigo Cepa (Neutral Z)',
          anim: 'Attack',
          animSpeed: 1.4,
          hitboxStart: 2,
          hitboxEnd: 8,
          offsetX: 26,
          offsetY: 20,
          radius: 24,
          damage: 5,
          baseKnockback: 8,
          knockbackScaling: 0.55,
          angle: 45,
          type: 'grass',
          hitlag: 4,
          slashColor: '#10b981',
          onStart: (b) => {
            window.soundEngine.playSfx('whip');
          }
        };
    }
  }

  getSpecialMoveDef(dir) {
    switch (dir) {
      case 'neutral':
        // Neutral Special: Esporas Drenadoras (360° Spore Vortex around Bulbasaur)
        return {
          name: 'Esporas Drenadoras (Neutral X)',
          anim: 'Charge',
          animSpeed: 1.2,
          hitboxStart: 3,
          hitboxEnd: 16,
          offsetX: 0,
          offsetY: 22,
          radius: 46, // 360° radial spore aura
          damage: 9,
          baseKnockback: 13,
          knockbackScaling: 0.9,
          angle: 60,
          type: 'grass',
          hitlag: 7,
          onStart: (b) => {
            window.soundEngine.playSfx('whip');
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(b.x, b.y - 22, '#10b981', 'grass', 46);
            }
          }
        };

      case 'side':
        // Side Special: Hoja Afilada (Razor Leaf 3x Projectiles)
        return {
          name: 'Hoja Afilada (Side X)',
          anim: 'Shoot',
          animSpeed: 1.2,
          hitboxStart: 999,
          hitboxEnd: 999,
          onStart: (b) => {
            window.soundEngine.playSfx('razor_leaf');
            const spawnX = b.x + b.facing * 28;
            const spawnY = b.y - 24;

            // Spawn 3 spinning razor leaves at slight angle spreads
            const angles = [-0.15, 0, 0.15];
            angles.forEach((offsetAngle, idx) => {
              const speed = 7.5;
              const vx = Math.cos(offsetAngle) * speed * b.facing;
              const vy = Math.sin(offsetAngle) * speed;

              b.projectiles.push({
                x: spawnX,
                y: spawnY + idx * 4,
                vx: vx,
                vy: vy,
                radius: 14,
                damage: 5,
                baseKnockback: 10,
                knockbackScaling: 0.8,
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
        // Down Special: Seed Bomb / Bomba Germen
        return {
          name: 'Bomba Germen (Down X)',
          anim: 'Shoot',
          animSpeed: 1.1,
          hitboxStart: 999,
          hitboxEnd: 999,
          onStart: (b) => {
            window.soundEngine.playSfx('seed_bomb');
            const spawnX = b.x + b.facing * 20;
            const spawnY = b.y - 32;

            // Arcing explosive seed projectile
            b.projectiles.push({
              x: spawnX,
              y: spawnY,
              vx: b.facing * 5.2,
              vy: -6.5,
              radius: 12,
              damage: 12,
              baseKnockback: 16,
              knockbackScaling: 1.25,
              angle: 80,
              type: 'grass',
              hitlag: 8,
              life: 2.2,
              hitStage: true,
              update: function(dt) {
                this.vy += 0.42; // Gravity on seed
                this.rot = (this.rot || 0) + 0.2;
              },
              draw: function(ctx) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rot || 0);
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 8;
                ctx.fillStyle = '#059669';
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
                  window.particleManager.spawnHitSparks(this.x, this.y, 10, 'grass');
                  window.particleManager.spawnRazorLeaves(this.x, this.y, 0, -2, 6);
                }
              },
              onStageHit: function(plat) {
                window.soundEngine.playSfx('seed_bomb');
                if (window.particleManager) {
                  window.particleManager.spawnHitSparks(this.x, this.y, 8, 'grass');
                  window.particleManager.spawnRazorLeaves(this.x, this.y, 0, -3, 8);
                }
              }
            });
          }
        };
    }
  }
}

window.Bulbasaur = Bulbasaur;
