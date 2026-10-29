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
    this.hyperBeamMaxTime = 0.26;
    this.hyperBeamLength = 320;
    this.hyperBeamThickness = 14;
    this.hyperBeamDamage = 12;
    this.hyperBeamFacing = 1;
    this.hyperBeamStartX = 0;
    this.hyperBeamStartY = 0;
    this.hyperBeamChargeRatio = 0;
    this.hyperBeamHasHit = false;

    // Ojitos Tiernos AOE pulse animation
    this.babyDollPulseTimer = 0;
    this.babyDollPulseRadius = 0;
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
        // Side Tilt / Smash: Fuerte látigo mágico frontal
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

  getSpecialMoveDef(dir) {
    switch (dir) {
      case 'neutral':
        // Neutral Special: Hiper Rayo (Cargable)
        // "Lanza un rayo en linea recta. Este rayo se puede mantener para hacer mas daño cubrir mas distancia."
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
          cooldown: 0.85,
          endLag: 0.18,
          hitboxStart: 999,
          hitboxEnd: 999,
          onStart: (s) => {
            this._fireDrainingKiss(s);
          }
        };

      case 'up':
        // Up Special: Fuerza Lunar (Moonblast)
        // "Se teletransporta arriba; y lanza rayos de luz lunar al suelo, en un spread de 3 proyectiles."
        return {
          name: 'Fuerza Lunar (Moonblast / Up X)',
          anim: 'Shoot',
          animSpeed: 2.2,
          cooldown: 1.1,
          endLag: 0.22,
          hitboxStart: 999,
          hitboxEnd: 999,
          onStart: (s) => {
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
          cooldown: 4.0, // Cooldown de 4s para balance competitivo
          endLag: 0.24,
          hitboxStart: 999,
          hitboxEnd: 999,
          onStart: (s) => {
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
    const minLen = 290;
    const maxLen = 680;
    const length = minLen + chargeRatio * (maxLen - minLen);
    const thickness = 12 + chargeRatio * 16;
    const damage = Math.round(12 + chargeRatio * 14); // 12% a 26%
    const baseKnockback = 12 + chargeRatio * 10;
    const knockbackScaling = 0.85 + chargeRatio * 0.40;

    s.hyperBeamActive = true;
    s.hyperBeamTimer = s.hyperBeamMaxTime;
    s.hyperBeamLength = length;
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
      window.game.shakeScreen(6 + chargeRatio * 8, 0.22);
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
      baseKnockback: 13,
      knockbackScaling: 0.85,
      angle: 38,
      type: 'fairy',
      life: 1.15,
      hitlag: 6,
      pulsePhase: 0,
      draw: function(ctx) {
        ctx.save();
        this.pulsePhase += 0.25;
        const scale = 1.0 + Math.sin(this.pulsePhase) * 0.15;
        ctx.translate(this.x, this.y);
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

    // 2. Teletransporte hacia arriba
    s.y -= 135;
    s.vy = -3.2;
    s.isGrounded = false;

    // Destello en la nueva posición
    if (window.particleManager) {
      window.particleManager.spawnRadialBurst(s.x, s.y - 18, '#ffffff', 'fairy', 28);
    }

    // 3. Spread de 3 proyectiles de luz lunar hacia el suelo
    // Spread: izquierda, centro, derecha
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
   * Reduce la velocidad del oponente durante 7 segundos en un 30%. Ataque en AOE desde cerca.
   */
  _executeBabyDollEyes(s) {
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
    const opponent = s.getOpponent ? s.getOpponent() : (window.game ? (s.isPlayer ? window.game.dummy : window.game.player) : null);
    if (opponent && opponent.state !== 'RESPAWN' && opponent.invulnTimer <= 0) {
      const dist = Math.hypot(opponent.x - s.x, opponent.y - s.y);
      if (dist <= aoeRadius) {
        // Inflige daño leve (5%) y aplica reducción de velocidad de 30% por 7 segundos
        const hitbox = {
          damage: 5,
          baseKnockback: 6,
          knockbackScaling: 0.3,
          angle: 45,
          type: 'fairy',
          hitlag: 4
        };
        opponent.takeHit(hitbox, s);
        opponent.applyStatus('slow', 7.0);

        if (window.particleManager) {
          window.particleManager.spawnHitSparks(opponent.x, opponent.y - opponent.height * 0.5, 8, 'fairy');
        }
      }
    }
  }

  getOpponent() {
    if (!window.game) return null;
    return this.isPlayer ? window.game.dummy : window.game.player;
  }

  update(dt, stage, opponent) {
    super.update(dt, stage, opponent);

    // Actualización del Hiper Rayo activo
    if (this.hyperBeamActive) {
      this.hyperBeamTimer -= dt;
      this.hyperBeamStartX = this.x + this.hyperBeamFacing * 20;
      this.hyperBeamStartY = this.y - 20;

      // Colisión del Hiper Rayo con el rival en tiempo real
      if (!this.hyperBeamHasHit && opponent && opponent.state !== 'RESPAWN' && opponent.invulnTimer <= 0) {
        const startX = this.hyperBeamStartX;
        const endX = startX + this.hyperBeamFacing * this.hyperBeamLength;
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const beamY = this.hyperBeamStartY;
        const halfThick = this.hyperBeamThickness * 0.8;

        const oppCenterY = opponent.y - opponent.height * 0.5;
        if (
          opponent.x >= minX - 16 &&
          opponent.x <= maxX + 16 &&
          Math.abs(oppCenterY - beamY) <= halfThick + opponent.hurtboxRadius
        ) {
          this.hyperBeamHasHit = true;
          const beamHitbox = {
            damage: this.hyperBeamDamage,
            baseKnockback: 12 + this.hyperBeamChargeRatio * 10,
            knockbackScaling: 0.85 + this.hyperBeamChargeRatio * 0.40,
            angle: 35,
            type: 'fairy',
            hitlag: 8 + Math.round(this.hyperBeamChargeRatio * 8)
          };
          const finalHitbox = this.getModifiedHitbox(beamHitbox, false);
          opponent.takeHit(finalHitbox, this);

          if (window.particleManager) {
            window.particleManager.spawnHitSparks(
              opponent.x,
              beamY,
              this.hyperBeamDamage,
              'fairy'
            );
            window.particleManager.spawnRadialBurst(
              opponent.x,
              beamY,
              '#f472b6',
              'normal',
              24
            );
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

      ctx.restore();
    }

    // 3. Renderizado base del personaje
    super.draw(ctx, opts);
  }
}

window.Sylveon = Sylveon;
