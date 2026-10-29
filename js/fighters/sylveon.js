/**
 * Sylveon Fighter (Dex 700)
 * Tipo Hada - Luchador elegante, grácil y de control a media y larga distancia.
 *
 * Movimientos Especiales (X):
 *  - Neutral X: Hiper Rayo (Hyper Beam) - Haz de energía lineal en línea recta. Mantén X para cargarlo y desatar mayor alcance, grosor y un daño colosal de hasta 26%.
 *  - Side X: Beso Drenaje (Draining Kiss) - Proyectil feérico en forma de corazón que viaja hacia adelante y cura a Sylveon un 30% del daño infligido al impactar.
 *  - Up X: Fuerza Lunar (Moonblast) - Se teletransporta hacia arriba en un estallido lunar y dispara una ráfaga en abanico de 3 rayos de luz lunar hacia el suelo.
 *  - Down X: Ojitos Tiernos (Baby-Doll Eyes) - Mirada cautivadora en área a corto alcance que ralentiza la velocidad del oponente un 30% durante 7 segundos.
 *
 * Ataques Básicos (Z):
 *  - Uso acrobático de sus lazos y cintas mágicas para jabs rápidos, latigazos y remate meteoro aéreo.
 *
 * Ataques Smash (Z Cargable):
 *  - Latigazo Meteoro Feérico (Forward Smash), Estallido Cinta Estelar (Up Smash) y Doble Azote de Lazo (Down Smash).
 */
class Sylveon extends window.Fighter {
  constructor(config = {}) {
    super({
      name: 'Sylveon',
      dex: 700,
      pokedexWeight: 23.5,
      weight: 23.5,
      weightCategory: 'Medio',
      color: '#f472b6',       // Pastel Fairy Pink
      accentColor: '#38bdf8', // Fairy Ribbon Cyan
      walkSpeed: 4.4,
      dashSpeed: 7.5,
      jumpForce: 13.2,
      doubleJumpForce: 11.8,
      scale: 2.15,
      ...config
    });

    // Estado de ataques especiales
    this.hyperBeamActive = false;
    this.hyperBeamTimer = 0;
    this.hyperBeamTotalDuration = 0.55;
    this.hyperBeamTravelDuration = 0.40;
    this.hyperBeamElapsed = 0;
    this.hyperBeamTargetLength = 210;
    this.hyperBeamLength = 0;
    this.hyperBeamThickness = 14;
    this.hyperBeamDamage = 12;
    this.hyperBeamFacing = 1;
    this.hyperBeamStartX = 0;
    this.hyperBeamStartY = 0;
    this.hyperBeamChargeRatio = 0;
    this.hyperBeamHasHit = false;

    // Ojitos Tiernos AOE pulse animation y cooldown específico de 4s
    this.babyDollPulseTimer = 0;
    this.babyDollPulseRadius = 0;
    this.babyDollCooldown = 0;
  }

  getBasicAttackDef(dir, isAir = false) {
    if (isAir) {
      switch (dir) {
        case 'up':
          // Up Air: Arco de cinta en voltereta aérea
          return {
            name: 'Lazo Lunar (Up Air)',
            anim: 'Attack',
            animSpeed: 1.45,
            hitboxStart: 2,
            hitboxEnd: 9,
            offsetX: 4,
            offsetY: 38,
            radius: 30,
            damage: 9,
            baseKnockback: 13,
            knockbackScaling: 0.9,
            angle: 86,
            type: 'fairy',
            hitlag: 6,
            slashColor: '#f472b6',
            onStart: () => {
              window.soundEngine && window.soundEngine.playSfx('whip', 0.1);
            }
          };

        case 'down':
          // Down Air: Taladro de lazos hacia abajo con efecto meteoro (Spike)
          return {
            name: 'Taladro Feérico (Down Air Spike)',
            anim: 'Attack',
            animSpeed: 1.5,
            hitboxStart: 3,
            hitboxEnd: 11,
            offsetX: 4,
            offsetY: -6,
            radius: 28,
            damage: 10.5,
            baseKnockback: 15,
            knockbackScaling: 0.95,
            angle: 270, // Spike vertical directo al abismo
            type: 'fairy',
            hitlag: 8,
            slashColor: '#ec4899',
            onStart: () => {
              window.soundEngine && window.soundEngine.playSfx('whip', 0.15);
            }
          };

        case 'side':
          // Forward Air: Zarpazo de cintas frontal
          return {
            name: 'Latigazo Feérico (Forward Air)',
            anim: 'Attack',
            animSpeed: 1.4,
            hitboxStart: 2,
            hitboxEnd: 9,
            offsetX: 26,
            offsetY: 18,
            radius: 30,
            damage: 9.5,
            baseKnockback: 14,
            knockbackScaling: 0.9,
            angle: 40,
            type: 'fairy',
            hitlag: 6,
            slashColor: '#f472b6',
            onStart: () => {
              window.soundEngine && window.soundEngine.playSfx('whip', 0.08);
            }
          };

        case 'neutral':
        default:
          // Neutral Air: Giro de cintas 360° en torno a Sylveon
          return {
            name: 'Espiral Hada (Neutral Air)',
            anim: 'Attack',
            animSpeed: 1.45,
            hitboxStart: 1,
            hitboxEnd: 8,
            offsetX: 0,
            offsetY: 16,
            radius: 34,
            damage: 7.5,
            baseKnockback: 11,
            knockbackScaling: 0.8,
            angle: 45,
            type: 'fairy',
            hitlag: 5,
            slashColor: '#38bdf8',
            onStart: () => {
              window.soundEngine && window.soundEngine.playSfx('whip', 0.05);
            }
          };
      }
    }

    // Ataques Básicos en Tierra
    switch (dir) {
      case 'up':
        // Up Tilt: Arco de lazos hacia arriba para elevar al rival
        return {
          name: 'Arco Cinta Ascendente (Up Tilt)',
          anim: 'Attack',
          animSpeed: 1.4,
          hitboxStart: 2,
          hitboxEnd: 8,
          offsetX: 10,
          offsetY: 38,
          radius: 30,
          damage: 7.5,
          baseKnockback: 13,
          knockbackScaling: 0.85,
          angle: 86,
          type: 'fairy',
          hitlag: 5,
          slashColor: '#f472b6',
          onStart: () => {
            window.soundEngine && window.soundEngine.playSfx('whip', 0.08);
          }
        };

      case 'down':
        // Down Tilt: Barrido bajo con sus cintas a ras de suelo
        return {
          name: 'Barrido Dulce (Down Tilt)',
          anim: 'Attack',
          animSpeed: 1.4,
          hitboxStart: 2,
          hitboxEnd: 8,
          offsetX: 20,
          offsetY: 4,
          radius: 26,
          damage: 6.5,
          baseKnockback: 11,
          knockbackScaling: 0.75,
          angle: 65,
          type: 'fairy',
          hitlag: 5,
          slashColor: '#fb7185',
          onStart: () => {
            window.soundEngine && window.soundEngine.playSfx('whip', 0.05);
          }
        };

      case 'side':
        // Side Tilt: Fuerte látigo mágico frontal
        return {
          name: 'Latigazo Mágico (Side Tilt)',
          anim: 'Attack',
          animSpeed: 1.35,
          hitboxStart: 2,
          hitboxEnd: 9,
          offsetX: 28,
          offsetY: 18,
          radius: 32,
          damage: 8.5,
          baseKnockback: 14,
          knockbackScaling: 0.9,
          angle: 35,
          type: 'fairy',
          hitlag: 6,
          slashColor: '#f472b6',
          onStart: () => {
            window.soundEngine && window.soundEngine.playSfx('whip', 0.1);
          }
        };

      case 'neutral':
      default:
        // Neutral Jab: Golpes rápidos de lazo
        return {
          name: 'Doble Látigo Lazo (Neutral Jab)',
          anim: 'Attack',
          animSpeed: 1.6,
          hitboxStart: 1,
          hitboxEnd: 7,
          offsetX: 20,
          offsetY: 16,
          radius: 26,
          damage: 4.0,
          baseKnockback: 8,
          knockbackScaling: 0.6,
          angle: 40,
          type: 'fairy',
          hitlag: 4,
          slashColor: '#38bdf8',
          onStart: () => {
            window.soundEngine && window.soundEngine.playSfx('hit_light');
          }
        };
    }
  }

  getSmashAttackDef(dir) {
    switch (dir) {
      case 'up':
        return {
          name: '¡Estallido Cinta Estelar! (Up Smash)',
          anim: 'Attack',
          animSpeed: 1.45,
          hitboxStart: 2,
          hitboxEnd: 10,
          offsetX: 10,
          offsetY: 48,
          radius: 42,
          damage: 18.5,
          baseKnockback: 37,
          knockbackScaling: 1.62,
          angle: 88,
          type: 'fairy',
          hitlag: 9,
          slashColor: '#f472b6',
          onStart: (s) => {
            window.soundEngine && window.soundEngine.playSfx('select', 0.15);
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(s.x + s.facing * 8, s.y - 36, '#f472b6', 'fairy', 38);
              window.particleManager.spawnHitSparks(s.x + s.facing * 8, s.y - 42, 8, 'fairy');
            }
          }
        };

      case 'down':
        return {
          name: '¡Doble Azote de Lazo! (Down Smash)',
          anim: 'Attack',
          animSpeed: 1.4,
          hitboxStart: 2,
          hitboxEnd: 11,
          offsetX: 0,
          offsetY: 14,
          radius: 46, // Área 360° alrededor de Sylveon
          damage: 16,
          baseKnockback: 32,
          knockbackScaling: 1.45,
          angle: 48,
          type: 'fairy',
          hitlag: 8,
          slashColor: '#38bdf8',
          onStart: (s) => {
            window.soundEngine && window.soundEngine.playSfx('whip', 0.12);
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(s.x, s.y - 14, '#38bdf8', 'fairy', 44);
            }
          }
        };

      case 'side':
      default:
        return {
          name: '¡Latigazo Meteoro Feérico! (Side Smash)',
          anim: 'Attack',
          animSpeed: 1.4,
          hitboxStart: 3,
          hitboxEnd: 11,
          offsetX: 34,
          offsetY: 20,
          radius: 40,
          damage: 19.5,
          baseKnockback: 38,
          knockbackScaling: 1.68,
          angle: 40,
          type: 'fairy',
          hitlag: 10,
          slashColor: '#ec4899',
          onStart: (s) => {
            window.soundEngine && window.soundEngine.playSfx('smash');
            if (window.particleManager) {
              window.particleManager.spawnHitSparks(s.x + s.facing * 32, s.y - 20, 10, 'fairy');
              window.particleManager.spawnRadialBurst(s.x + s.facing * 28, s.y - 20, '#ec4899', 'normal', 34);
            }
          }
        };
    }
  }

  getSpecialMoveDef(dir) {
    switch (dir) {
      case 'neutral':
        // Neutral Special: Hiper Rayo (Cargable)
        // "Lanza un rayo en línea recta. Este rayo se puede mantener para hacer más daño y cubrir más distancia."
        return {
          name: 'Hiper Rayo (Neutral X - Mantener para Cargar)',
          anim: 'Shoot',
          chargeAnim: 'Charge',
          animSpeed: 2.8,
          canCharge: true,
          holdToCharge: true,
          maxCharge: 1.5, // 1.5s para alcanzar el 100% de carga
          cooldown: 1.2,
          endLag: 0.32,
          hitboxStart: 999,
          hitboxEnd: 999,
          chargeBannerText: '¡CARGANDO HIPER RAYO!',
          chargeBannerColor: '#f472b6',
          onStart: (s) => {
            if (window.particleManager) {
              window.particleManager.spawnHitSparks(s.x + s.facing * 16, s.y - 20, 3, 'fairy');
            }
          },
          onCharge: (s, chargeTime, maxCharge) => {
            const ratio = Math.min(1.0, chargeTime / maxCharge);
            if (Math.random() < 0.45 && window.particleManager) {
              const rad = 14 + ratio * 20;
              const angle = Math.random() * Math.PI * 2;
              const px = s.x + s.facing * 22 + Math.cos(angle) * rad;
              const py = s.y - 20 + Math.sin(angle) * rad;
              window.particleManager.spawnHitSparks(px, py, 1, 'fairy');
            }
          },
          onMaxCharge: (s) => {
            window.soundEngine && window.soundEngine.playSfx('select', 0.2);
            if (window.particleManager) {
              window.particleManager.spawnRadialBurst(s.x + s.facing * 24, s.y - 20, '#f472b6', 'normal', 36);
              window.particleManager.spawnFloatingText(
                s.x,
                s.y - s.height - 20,
                '¡HIPER RAYO MÁXIMO!',
                '#f472b6',
                18
              );
            }
          },
          onFire: (s, chargeRatio) => {
            this._fireHyperBeam(s, chargeRatio);
            s.actionLockTimer = Math.max(s.actionLockTimer, 0.32);
            s.specialCooldown = Math.max(s.specialCooldown, 1.2);
          }
        };

      case 'side':
        // Side Special: Beso Drenaje (Draining Kiss)
        // "Proyectil hacia los lados. Cura un 30% del daño realizado."
        return {
          name: 'Beso Drenaje (Side X)',
          anim: 'Shoot',
          animSpeed: 2.4,
          cooldown: 1.25, // Nerf: CD aumentada un 0.4s (antes 0.85s -> ahora 1.25s)
          endLag: 0.20,
          hitboxStart: 999,
          hitboxEnd: 999,
          onStart: (s) => {
            if (s.specialCooldowns) {
              s.specialCooldowns.side = 1.25;
              s.specialMaxCooldowns.side = 1.25;
            }
            this._fireDrainingKiss(s);
          }
        };

      case 'up':
        // Up Special: Fuerza Lunar (Moonblast)
        // "Se teletransporta arriba y lanza rayos de luz lunar al suelo en un spread de 3 proyectiles."
        return {
          name: 'Fuerza Lunar (Moonblast / Up X)',
          anim: 'Shoot',
          animSpeed: 2.2,
          cooldown: 1.1,
          endLag: 0.22,
          hitboxStart: 999,
          hitboxEnd: 999,
          onStart: (s) => {
            if (s.specialCooldowns) {
              s.specialCooldowns.up = 1.1;
              s.specialMaxCooldowns.up = 1.1;
            }
            this._executeMoonblastRecovery(s);
          }
        };

      case 'down':
        // Down Special: Ojitos Tiernos (Baby-Doll Eyes)
        // "Reduce la velocidad del oponente durante 7 segundos en un 30%. Ataque en AOE desde cerca."
        return {
          name: 'Ojitos Tiernos (Down X - AOE Slow)',
          anim: 'Shoot',
          animSpeed: 2.0,
          cooldown: 4.0, // Cooldown independiente para Ojitos Tiernos
          endLag: 0.24,
          hitboxStart: 999,
          hitboxEnd: 999,
          onStart: (s) => {
            if (s.specialCooldowns) {
              s.specialCooldowns.down = 4.0;
              s.specialMaxCooldowns.down = 4.0;
            }
            this._executeBabyDollEyes(s);
          }
        };

      default:
        return this.getBasicAttackDef('neutral', false);
    }
  }

  // =========================================================================
  // IMPLEMENTACIÓN DE MOVIMIENTOS ESPECIALES
  // =========================================================================

  /**
   * Neutral X: Hiper Rayo lineal de carga variable
   */
  _fireHyperBeam(s, chargeRatio = 0) {
    // Al solo pulsar, la distancia es un 50% menor a la actual (210px en vez de 420px)
    const minLen = 210;
    const maxLen = 780;
    const targetLength = minLen + chargeRatio * (maxLen - minLen);
    const thickness = 14 + chargeRatio * 16;
    const damage = Math.round(12 + chargeRatio * 14); // 12% a 26%

    // Al pulsar, en lugar de directamente aparecer, el proyectil debe viajar al menos 0.4 segundos
    const travelDuration = 0.40 + chargeRatio * 0.20;
    const lingerDuration = 0.15;
    const totalDuration = travelDuration + lingerDuration;

    s.hyperBeamActive = true;
    s.hyperBeamTimer = totalDuration;
    s.hyperBeamTotalDuration = totalDuration;
    s.hyperBeamTravelDuration = travelDuration;
    s.hyperBeamElapsed = 0;
    s.hyperBeamTargetLength = targetLength;
    s.hyperBeamLength = 0; // Empieza en 0 y viaja hacia adelante
    s.hyperBeamThickness = thickness;
    s.hyperBeamDamage = damage;
    s.hyperBeamFacing = s.facing;
    s.hyperBeamStartX = s.x + s.facing * 20;
    s.hyperBeamStartY = s.y - 20;
    s.hyperBeamChargeRatio = chargeRatio;
    s.hyperBeamHasHit = false;

    // Retroceso por el tremendo retroceso del Hiper Rayo
    s.vx = -s.facing * (2.4 + chargeRatio * 3.8);

    // Sonido y sacudida de pantalla si está cargado
    if (window.soundEngine) {
      window.soundEngine.playSfx('hyper_beam');
    }
    if (chargeRatio > 0.6 && window.game) {
      if (typeof window.game.triggerScreenShake === 'function') {
        window.game.triggerScreenShake(6 + chargeRatio * 8, 0.22);
      } else if (typeof window.game.shakeScreen === 'function') {
        window.game.shakeScreen(6 + chargeRatio * 8, 0.22);
      }
    }

    if (window.particleManager) {
      window.particleManager.spawnRadialBurst(
        s.hyperBeamStartX,
        s.hyperBeamStartY,
        '#ffffff',
        'fairy',
        18 + Math.round(chargeRatio * 16)
      );
    }
  }

  /**
   * Side X: Beso Drenaje (Draining Kiss)
   * Proyectil de corazón feérico que cura un 30% del daño realizado al impactar
   */
  _fireDrainingKiss(s) {
    const projSpeed = 9.4;
    const spawnX = s.x + s.facing * 22;
    const spawnY = s.y - 20;
    const damage = 14;

    if (window.soundEngine) {
      window.soundEngine.playSfx('draining_kiss');
    }
    if (window.particleManager) {
      window.particleManager.spawnHitSparks(spawnX, spawnY, 4, 'fairy');
    }

    const kissProj = {
      x: spawnX,
      y: spawnY,
      vx: projSpeed * s.facing,
      vy: 0,
      radius: 16,
      damage: damage,
      baseKnockback: 9, // Reducido en un 30% (antes 13)
      knockbackScaling: 0.60, // Reducido en un 30% (antes 0.85)
      angle: 38,
      type: 'fairy',
      isSpecial: true,
      isProjectile: true,
      life: 1.15,
      hitlag: 6,
      pulsePhase: 0,
      draw: function(ctx) {
        ctx.save();
        this.pulsePhase += 0.25;
        const scale = 1.0 + Math.sin(this.pulsePhase) * 0.15;
        // Centrar visualmente el corazón en la posición (this.x, this.y)
        ctx.translate(this.x, this.y - 15);
        ctx.scale(scale, scale);

        // Glowing outer heart aura
        ctx.shadowColor = '#f472b6';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#ec4899';

        // Heart shape
        ctx.beginPath();
        const topCurveHeight = 10;
        ctx.moveTo(0, topCurveHeight);
        ctx.bezierCurveTo(0, 0, -12, 0, -12, topCurveHeight);
        ctx.bezierCurveTo(-12, 18, 0, 24, 0, 30);
        ctx.bezierCurveTo(0, 24, 12, 18, 12, topCurveHeight);
        ctx.bezierCurveTo(12, 0, 0, 0, 0, topCurveHeight);
        ctx.closePath();
        ctx.fill();

        // Inner white shine
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4, topCurveHeight + 3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      },
      onHit: (opponent) => {
        // "Cura un 30% del daño realizado"
        const healAmt = parseFloat((damage * 0.30).toFixed(1)); // 4.2%
        s.percent = Math.max(0, parseFloat((s.percent - healAmt).toFixed(1)));

        if (window.soundEngine) {
          window.soundEngine.playSfx('select');
        }
        if (window.particleManager) {
          window.particleManager.spawnFloatingText(
            s.x,
            s.y - s.height - 18,
            `-${healAmt}% [Beso Drenaje]`,
            '#10b981',
            16
          );
          window.particleManager.spawnHitSparks(opponent.x, opponent.y - opponent.height * 0.5, 8, 'fairy');
          window.particleManager.spawnRadialBurst(s.x, s.y - 20, '#10b981', 'grass', 14);
        }
      }
    };

    s.projectiles.push(kissProj);
  }

  /**
   * Up X: Moonblast (Fuerza Lunar)
   * Se teletransporta arriba y lanza rayos de luz lunar al suelo en spread de 3 proyectiles
   */
  _executeMoonblastRecovery(s) {
    // 1. Destello previo y sonido
    if (window.soundEngine) {
      window.soundEngine.playSfx('moonblast');
    }
    if (window.particleManager) {
      window.particleManager.spawnRadialBurst(s.x, s.y - 18, '#fbcfe8', 'normal', 24);
      window.particleManager.spawnSmoke(s.x, s.y, '#ffffff', 8);
    }

    // 2. Control direccional horizontal durante la recuperación
    const dirX = s.input ? (s.input.left ? -1 : s.input.right ? 1 : 0) : 0;
    if (dirX !== 0) {
      s.facing = dirX;
      s.x += dirX * 70;
      s.vx = dirX * 3.6;
    } else {
      s.vx = s.facing * 1.2;
    }

    // Teletransporte hacia arriba con límite seguro de techo para no auto-eliminarse
    const minSafeY = (window.game && window.game.stage && window.game.stage.blastZones)
      ? window.game.stage.blastZones.top + 60
      : -100;
    s.y = Math.max(minSafeY, s.y - 145);
    s.vy = -3.6;
    s.isGrounded = false;
    s.upSpecialUsed = true;
    s.invulnTimer = 0.22;

    // Destello en la nueva posición
    if (window.particleManager) {
      window.particleManager.spawnRadialBurst(s.x, s.y - 18, '#ffffff', 'fairy', 28);
    }

    // 3. Spread de 3 proyectiles de luz lunar hacia el suelo
    const spreadConfigs = [
      { vx: -4.8, vy: 8.5 },
      { vx: 0.6 * s.facing, vy: 9.6 },
      { vx: 4.8, vy: 8.5 }
    ];

    spreadConfigs.forEach((cfg) => {
      const moonProj = {
        x: s.x + cfg.vx * 2,
        y: s.y - 10,
        vx: cfg.vx,
        vy: cfg.vy,
        radius: 13,
        damage: 8.0,
        baseKnockback: 13,
        knockbackScaling: 0.8,
        angle: 285, // Fuerza hacia el suelo
        type: 'fairy',
        isSpecial: true,
        isProjectile: true,
        life: 1.2,
        hitlag: 5,
        hitStage: true,
        rot: 0,
        draw: function(ctx) {
          ctx.save();
          this.rot += 0.18;
          ctx.translate(this.x, this.y);
          ctx.rotate(this.rot);

          // Glowing moonlight sphere
          const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.4, '#e0e7ff');
          grad.addColorStop(0.8, '#f472b6');
          grad.addColorStop(1, 'rgba(244, 114, 182, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();

          // Inner crescent moon shine
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(2, -2, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        },
        onStageHit: function(plat) {
          if (window.particleManager) {
            window.particleManager.spawnHitSparks(this.x, this.y, 4, 'fairy');
          }
        },
        onHit: function(opponent) {
          if (window.soundEngine) {
            window.soundEngine.playSfx('hit_light');
          }
          if (window.particleManager) {
            window.particleManager.spawnHitSparks(opponent.x, opponent.y - 20, 6, 'fairy');
          }
        }
      };

      s.projectiles.push(moonProj);
    });
  }

  /**
   * Down X: Ojitos Tiernos (Baby-Doll Eyes)
   * Reduce la velocidad del oponente en un 40% y sus ataques Z en un 10% durante 7 segundos. Ataque en AOE desde cerca.
   */
  _executeBabyDollEyes(s) {
    if (s.babyDollCooldown > 0) {
      if (window.particleManager) {
        window.particleManager.spawnFloatingText(
          s.x,
          s.y - s.height - 14,
          `¡En CD! (${Math.ceil(s.babyDollCooldown)}s)`,
          '#f87171',
          13
        );
      }
      return;
    }
    s.babyDollCooldown = 4.0; // Cooldown exclusivo para Ojitos Tiernos

    const aoeRadius = 115;
    s.babyDollPulseTimer = 0.40;
    s.babyDollPulseRadius = 10;

    if (window.soundEngine) {
      window.soundEngine.playSfx('baby_doll_eyes');
    }

    if (window.particleManager) {
      window.particleManager.spawnRadialBurst(s.x, s.y - 20, '#f472b6', 'fairy', 32);
      window.particleManager.spawnFloatingText(
        s.x,
        s.y - s.height - 20,
        '🥺 ¡OJITOS TIERNOS!',
        '#f472b6',
        18
      );
    }

    // Verificar si el rival está dentro del radio AOE
    const opponent = s.getOpponent ? s.getOpponent() : (window.game ? (s === window.game.player ? window.game.dummy : window.game.player) : null);
    if (opponent && opponent.state !== 'RESPAWN' && opponent.invulnTimer <= 0) {
      const oppY = opponent.y - opponent.height * 0.5;
      const dist = Math.hypot(opponent.x - s.x, oppY - (s.y - 20));
      if (dist <= aoeRadius) {
        // Inflige daño leve (5%) y aplica reducción de velocidad de 30% por 7 segundos si no está bloqueando
        const hitbox = {
          damage: 5,
          baseKnockback: 6,
          knockbackScaling: 0.3,
          angle: 45,
          type: 'fairy',
          hitlag: 4,
          isSpecial: true
        };
        const finalHitbox = s.getModifiedHitbox ? s.getModifiedHitbox(hitbox, true) : hitbox;
        opponent.takeHit(finalHitbox, s);

        if (opponent.state !== 'SHIELD' && opponent.parryFlashTimer <= 0) {
          if (typeof opponent.applyStatus === 'function') {
            opponent.applyStatus('slow', 7.0);
          } else if (opponent.statuses && opponent.statuses.slow) {
            opponent.statuses.slow.active = true;
            opponent.statuses.slow.timer = 7.0;
          }
        }

        if (window.particleManager) {
          window.particleManager.spawnHitSparks(opponent.x, opponent.y - opponent.height * 0.5, 8, 'fairy');
        }
      }
    }
  }

  getOpponent() {
    if (!window.game) return null;
    return this === window.game.player ? window.game.dummy : window.game.player;
  }

  onBlastZoneKO(stage) {
    this.hyperBeamActive = false;
    this.hyperBeamTimer = 0;
    this.babyDollPulseTimer = 0;
    this.babyDollCooldown = 0;
    super.onBlastZoneKO(stage);
  }

  update(dt, opponent, stage) {
    super.update(dt, opponent, stage);

    if (this.babyDollCooldown > 0) {
      this.babyDollCooldown = Math.max(0, this.babyDollCooldown - dt);
    }

    // Cancelar rayo si Sylveon es golpeado o eliminado
    if (this.state === 'HURT' || this.state === 'RESPAWN' || this.state === 'FAINT') {
      this.hyperBeamActive = false;
      this.hyperBeamTimer = 0;
    }

    // Actualización del Hiper Rayo activo
    if (this.hyperBeamActive) {
      this.hyperBeamTimer -= dt;
      this.hyperBeamElapsed += dt;

      // El proyectil viaja hacia adelante durante al menos 0.4s en lugar de aparecer de golpe
      const travelProgress = Math.min(1.0, this.hyperBeamElapsed / (this.hyperBeamTravelDuration || 0.40));
      this.hyperBeamLength = this.hyperBeamTargetLength * travelProgress;

      this.hyperBeamStartX = this.x + this.hyperBeamFacing * 20;
      this.hyperBeamStartY = this.y - 20;

      const headX = this.hyperBeamStartX + this.hyperBeamFacing * this.hyperBeamLength;
      const headY = this.hyperBeamStartY;

      // Chispas y estallidos en la punta del proyectil mientras viaja
      if (window.particleManager && Math.random() < 0.70) {
        window.particleManager.spawnHitSparks(headX, headY, 2, 'fairy');
      }

      // Colisión del Hiper Rayo con el rival en tiempo real (solo hasta donde ha viajado el rayo)
      const opp = opponent || this.getOpponent();
      if (!this.hyperBeamHasHit && opp && opp.state !== 'RESPAWN' && opp.invulnTimer <= 0) {
        const startX = this.hyperBeamStartX;
        const endX = headX;
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const beamY = this.hyperBeamStartY;
        const halfThick = this.hyperBeamThickness * 0.8;

        const hurtboxes = opp.getHurtboxes
          ? opp.getHurtboxes()
          : [{ x: opp.x, y: opp.y - opp.height * 0.5, radius: opp.hurtboxRadius || 24, target: null }];

        for (const hb of hurtboxes) {
          const hRadius = hb.radius || 18;
          if (
            hb.x >= minX - hRadius &&
            hb.x <= maxX + hRadius &&
            Math.abs(hb.y - beamY) <= halfThick + hRadius
          ) {
            this.hyperBeamHasHit = true;
            const beamHitbox = {
              damage: this.hyperBeamDamage,
              baseKnockback: 12 + this.hyperBeamChargeRatio * 10,
              knockbackScaling: 0.85 + this.hyperBeamChargeRatio * 0.40,
              angle: 35,
              type: 'fairy',
              hitlag: 8 + Math.round(this.hyperBeamChargeRatio * 8),
              isSpecial: true,
              isProjectile: true
            };
            const finalHitbox = this.getModifiedHitbox ? this.getModifiedHitbox(beamHitbox, true) : beamHitbox;
            opp.takeHit(finalHitbox, this, hb.target);
            this.hitstop = 4;

            if (window.soundEngine) {
              window.soundEngine.playSfx('hit_heavy');
            }

            if (window.particleManager) {
              window.particleManager.spawnHitSparks(
                opp.x,
                beamY,
                this.hyperBeamDamage,
                'fairy'
              );
              window.particleManager.spawnRadialBurst(
                opp.x,
                beamY,
                '#f472b6',
                'normal',
                24
              );
            }
            break;
          }
        }
      }

      // Partículas a lo largo del haz mientras esté activo
      if (Math.random() < 0.6 && window.particleManager) {
        const t = Math.random();
        const px = this.hyperBeamStartX + this.hyperBeamFacing * this.hyperBeamLength * t;
        const py = this.hyperBeamStartY + (Math.random() - 0.5) * this.hyperBeamThickness;
        window.particleManager.spawnHitSparks(px, py, 1, 'fairy');
      }

      if (this.hyperBeamTimer <= 0) {
        this.hyperBeamActive = false;
      }
    }

    // Animación de pulso de Ojitos Tiernos
    if (this.babyDollPulseTimer > 0) {
      this.babyDollPulseTimer -= dt;
      this.babyDollPulseRadius += dt * 260;
    }
  }

  draw(ctx, opts = {}) {
    // 1. Dibujar onda expansiva de Ojitos Tiernos si está activa
    if (this.babyDollPulseTimer > 0) {
      ctx.save();
      const alpha = Math.max(0, this.babyDollPulseTimer / 0.40);
      ctx.strokeStyle = `rgba(244, 114, 182, ${alpha * 0.8})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 20, Math.min(115, this.babyDollPulseRadius), 0, Math.PI * 2);
      ctx.stroke();

      // Corazoncitos flotantes en la onda
      ctx.fillStyle = `rgba(236, 72, 153, ${alpha})`;
      ctx.font = '14px sans-serif';
      ctx.fillText('💖', this.x - this.babyDollPulseRadius * 0.7, this.y - 20);
      ctx.fillText('💖', this.x + this.babyDollPulseRadius * 0.7, this.y - 20);
      ctx.restore();
    }

    // 2. Dibujar haz del Hiper Rayo
    if (this.hyperBeamActive) {
      ctx.save();
      const startX = this.hyperBeamStartX;
      const startY = this.hyperBeamStartY;
      const endX = startX + this.hyperBeamFacing * this.hyperBeamLength;
      const thick = this.hyperBeamThickness;

      // Glow exterior
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 24 + this.hyperBeamChargeRatio * 16;

      // Haz exterior coloreado (degradado feérico)
      const grad = ctx.createLinearGradient(startX, startY - thick, startX, startY + thick);
      grad.addColorStop(0, 'rgba(244, 114, 182, 0.85)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.85)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.rect(
        this.hyperBeamFacing === 1 ? startX : endX,
        startY - thick * 0.5,
        this.hyperBeamLength,
        thick
      );
      ctx.fill();

      // Núcleo blanco incandescente concentrado
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.rect(
        this.hyperBeamFacing === 1 ? startX : endX,
        startY - thick * 0.22,
        this.hyperBeamLength,
        thick * 0.44
      );
      ctx.fill();

      // Resplandor en la boca de Sylveon
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(startX, startY, thick * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Cabecera brillante del proyectil viajero
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(endX, startY, thick * 0.70, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(244, 114, 182, 0.7)';
      ctx.beginPath();
      ctx.arc(endX, startY, thick * 1.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 3. Renderizado base del personaje
    super.draw(ctx, opts);
  }
}

window.Sylveon = Sylveon;
