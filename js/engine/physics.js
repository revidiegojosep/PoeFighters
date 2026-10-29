/**
 * Super Smash Bros Physics Engine
 * Handles gravity, horizontal drift, platform collisions, knockback formulas,
 * hitstun, hitlag/freeze frames, DI (Directional Influence), and blast zones.
 */
class PhysicsEngine {
  constructor() {
    this.gravity = 0.52;
    this.terminalVelocity = 14.0;
    this.fastFallSpeed = 19.0;
    this.friction = 0.84;
    this.airFriction = 0.96;
  }

  /**
   * Super Smash Bros Knockback Formula:
   * Incremented overall by +20% in general.
   * Modulated by official Pokédex weight (clamped strictly between -10% and +10% max variation).
   * Lighter Pokémon (e.g. Minun/Plusle 4.2kg) are launched earlier (+10%),
   * while heavier Pokémon (e.g. Gengar 40.5kg) reduce knockback by at most -10%.
   * Returns launch speed in pixels per 60Hz frame.
   */
  calculateKnockback(targetPercent, moveDamage, targetWeight, scaling = 1.0, baseKnockback = 12) {
    const p = Math.max(0, targetPercent);
    const d = moveDamage;
    const w = targetWeight || 6.0;

    // Minimal base knockback so attacks at 0% don't blast opponents away
    const base = (baseKnockback || 10) * 0.19;

    // Growth power curve ensuring combos at low % and blast zone KOs at high %
    const percentRatio = p / 100;
    const growth = Math.pow(percentRatio, 1.38) * (d * 1.6 + 10) * (scaling || 1.0) * 0.43;

    // 1. Aumento general de todo el knockback en un 20%
    const baseKnockbackTotal = (base + growth) * 1.20;

    // 2. Modificador de Peso Oficial de la Pokédex:
    // Restringido estrictamente: El peso solo puede reducir como MÁXIMO y como MÍNIMO hasta un 10% (0.90 a 1.10)
    let kg = typeof w === 'number' ? w : 6.0;
    if (kg > 95) {
      if (kg === 75 || kg === 70) kg = 4.2;
      else if (kg === 85) kg = 6.0;
      else if (kg === 105) kg = 6.9;
      else if (kg === 80) kg = 40.5;
      else kg = kg * 0.1;
    }

    // Roster de pesos Pokédex: Minun/Plusle (4.2 kg) a Charizard (90.5 kg)
    const t = Math.max(0, Math.min(1, (kg - 4.2) / (90.5 - 4.2)));
    const calculatedFactor = 1.10 - t * 0.20;

    // Clamp riguroso entre 0.90 (-10% reducción máxima) y 1.10 (+10% aumento máximo)
    const weightFactor = Math.min(1.10, Math.max(0.90, calculatedFactor));

    const totalSpeed = baseKnockbackTotal * weightFactor;

    // Límite de velocidad máxima ajustado un 20% (de 28 a 34 px/frame)
    return Math.min(Math.max(totalSpeed, 1.75), 34);
  }

  /**
   * Calculate hitstun duration (in 60fps frames) based on knockback
   * Reducido un 50% para que el jugador pueda reaccionar y recuperarse (recover)
   */
  calculateHitstun(knockbackSpeed) {
    return Math.max(1, Math.floor((knockbackSpeed * 2.45 + 8) * 0.5));
  }

  /**
   * Applies launch velocity along an angle (in degrees), adjusting for attacker's facing direction
   * and defender's DI (directional influence).
   */
  launch(target, angleDeg, speed, facing = 1, diX = 0, diY = 0) {
    let rad = (angleDeg * Math.PI) / 180;

    // Flip horizontal angle if attacker faces left
    let vx = Math.cos(rad) * speed * facing;
    let vy = -Math.sin(rad) * speed; // Negative is upward in screen coords

    // Apply subtle Directional Influence (DI)
    if (diX !== 0 || diY !== 0) {
      vx += diX * (speed * 0.18);
      vy += diY * (speed * 0.18);
    }

    target.vx = vx;
    target.vy = vy;
    target.isGrounded = false;
    target.hitstun = this.calculateHitstun(speed);
  }

  /**
   * Circle vs Circle or Circle vs Box hitbox collision detection
   */
  checkHitboxCollision(hitbox, hurtbox) {
    const dx = hitbox.x - hurtbox.x;
    const dy = hitbox.y - hurtbox.y;
    const distSq = dx * dx + dy * dy;
    const radiusSum = hitbox.radius + hurtbox.radius;
    return distSq <= radiusSum * radiusSum;
  }

  /**
   * Updates fighter kinematics and handles stage/platform collisions
   */
  updateFighter(fighter, stage, dt) {
    if (fighter.state === 'LEDGE' || fighter.state === 'LEDGE_CLIMB' || fighter.state === 'GRABBED' || fighter.state === 'GRABBING' || fighter.state === 'RESPAWN' || fighter.state === 'KO') {
      fighter.vx = 0;
      fighter.vy = 0;
      return;
    }

    if (fighter.hitstop > 0) {
      fighter.hitstop--;
      return;
    }

    if (fighter.hitstun > 0) {
      fighter.hitstun--;
      // Spawn hitstun smoke/sparks
      if (Math.abs(fighter.vx) > 5 || Math.abs(fighter.vy) > 5) {
        if (Math.random() < 0.6 && window.particleManager) {
          window.particleManager.spawnSmoke(fighter.x, fighter.y - fighter.height * 0.5, '#ffffff', 0.6);
        }
      }
    }

    // Apply gravity if airborne (supporting Floaty Pokémon & Air Balloon)
    if (!fighter.isGrounded) {
      let gMult = fighter.gravityMult !== undefined ? fighter.gravityMult : (fighter.isFloaty ? 0.62 : 1.0);
      let termVelMult = fighter.terminalVelocityMult !== undefined ? fighter.terminalVelocityMult : (fighter.isFloaty ? 0.68 : 1.0);
      let airFric = fighter.airFriction !== undefined ? fighter.airFriction : this.airFriction;

      // Air Balloon (Globo Helio) effect:
      // Floaty until reaching 50% damage. If fighter is already floaty, effect is reduced by 80%.
      if (fighter.heldItem === 'air-balloon') {
        if (fighter.percent < 50 && !fighter.balloonPopped) {
          if (fighter.isFloaty) {
            gMult *= 0.93; // 80% reduced effect on naturally floaty Pokemon
            termVelMult *= 0.94;
          } else {
            gMult *= 0.62;
            termVelMult *= 0.68;
            airFric = Math.max(airFric, 0.985);
          }
        } else if (fighter.percent >= 50 && !fighter.balloonPopped) {
          fighter.balloonPopped = true;
          window.soundEngine && window.soundEngine.playSfx('blast_ko', 0.2);
          if (window.particleManager) {
            window.particleManager.spawnRadialBurst(fighter.x, fighter.y - 20, '#38bdf8', 'normal', 30);
            window.particleManager.spawnFloatingText(fighter.x, fighter.y - fighter.height - 18, '¡GLOBO REVENTÓ! (>50%)', '#f87171', 16);
          }
        }
      }

      const maxFall = (fighter.isFastFalling ? this.fastFallSpeed : this.terminalVelocity) * termVelMult;
      fighter.vy += this.gravity * gMult;
      if (fighter.vy > maxFall) {
        fighter.vy = maxFall;
      }
      fighter.vx *= airFric;
    } else {
      // Ground friction: balance update - allow longer roll over distance with shield
      // Para rivales remotos en línea (ONLINE_RIVAL), no matar su velocidad si están caminando o corriendo
      const isOnlineRivalMoving = fighter.isDummy && window.game && window.game.p2Type === 'ONLINE_RIVAL' &&
                                  (fighter.state === 'WALK' || fighter.state === 'DASH' || (fighter.input && (fighter.input.left || fighter.input.right)));
      if (!isOnlineRivalMoving) {
        const groundFriction = fighter.state === 'ROLL' ? 0.80 : this.friction;
        fighter.vx *= groundFriction;
        if (Math.abs(fighter.vx) < 0.05) fighter.vx = 0;
      }
    }

    // Sincronización vertical continua con plataformas móviles
    if (fighter.isGrounded && fighter.groundedPlat && fighter.groundedPlat.moveAmp && !fighter.isDroppingThrough) {
      const p = fighter.groundedPlat;
      if (fighter.x >= p.x - 6 && fighter.x <= p.x + p.width + 6) {
        fighter.y = p.y;
        fighter.vy = 0;
      } else {
        fighter.groundedPlat = null;
        fighter.isGrounded = false;
      }
    }

    // Previous position for tunneling prevention
    const oldX = fighter.x;
    const oldY = fighter.y;

    // Integrate velocities
    fighter.x += fighter.vx;
    fighter.y += fighter.vy;

    // Platform collisions
    this.resolveStageCollisions(fighter, stage, oldX, oldY);

    // Blast zone check
    if (fighter.x > -1000 && fighter.y > -1000 && fighter.state !== 'RESPAWN' && fighter.state !== 'KO' && !isNaN(fighter.x) && !isNaN(fighter.y) && stage.isOutsideBlastZone(fighter.x, fighter.y)) {
      fighter.onBlastZoneKO(stage);
    }
  }

  resolveStageCollisions(fighter, stage, oldX, oldY) {
    fighter.isGrounded = false;

    // 1. Check solid main stage platforms
    for (const plat of stage.solidPlatforms) {
      // Land on top
      if (
        oldY <= plat.y + 4 &&
        fighter.y >= plat.y &&
        fighter.x >= plat.x &&
        fighter.x <= plat.x + plat.width &&
        fighter.vy >= 0
      ) {
        fighter.y = plat.y;
        fighter.vy = 0;
        fighter.isGrounded = true;
        fighter.groundedPlat = plat;
        fighter.jumpsLeft = fighter.maxJumps;
        fighter.isFastFalling = false;
        fighter.isAirDodging = false;
        fighter.hitstun = 0;
        return;
      }

      // 🧗 Ledge Grab: Si caes cerca del borde del escenario principal,
      // el personaje se agarra automáticamente al borde con 1s de invulnerabilidad
      if (
        !fighter.isGrounded &&
        fighter.state !== 'LEDGE' &&
        fighter.state !== 'LEDGE_CLIMB' &&
        fighter.state !== 'GRABBED' &&
        fighter.state !== 'GRABBING' &&
        fighter.state !== 'RESPAWN' &&
        fighter.state !== 'HURT' &&
        (fighter.ledgeCooldown || 0) <= 0 &&
        fighter.vy >= -4.5 &&
        typeof fighter.grabLedge === 'function'
      ) {
        // Borde izquierdo de la plataforma sólida
        const leftDistX = Math.abs(fighter.x - plat.x);
        const leftDistY = fighter.y - plat.y;
        if (leftDistX <= 26 && leftDistY >= -14 && leftDistY <= 48) {
          fighter.grabLedge(plat, 'left');
          return;
        }

        // Borde derecho de la plataforma sólida
        const rightDistX = Math.abs(fighter.x - (plat.x + plat.width));
        const rightDistY = fighter.y - plat.y;
        if (rightDistX <= 26 && rightDistY >= -14 && rightDistY <= 48) {
          fighter.grabLedge(plat, 'right');
          return;
        }
      }

      // Walls / ceiling of solid stage
      if (
        fighter.y > plat.y &&
        fighter.y < plat.y + plat.height + fighter.height
      ) {
        // Left wall
        if (oldX < plat.x && fighter.x >= plat.x - 12) {
          fighter.x = plat.x - 12;
          fighter.vx = -fighter.vx * 0.4;
        }
        // Right wall
        else if (oldX > plat.x + plat.width && fighter.x <= plat.x + plat.width + 12) {
          fighter.x = plat.x + plat.width + 12;
          fighter.vx = -fighter.vx * 0.4;
        }
        // Bottom ceiling
        if (oldY > plat.y + plat.height && fighter.y <= plat.y + plat.height + fighter.height && fighter.vy < 0) {
          fighter.y = plat.y + plat.height + fighter.height;
          fighter.vy = 0;
        }
      }
    }

    // 2. Check semi-solid floating platforms (pass through from bottom, drop through if down held)
    if (!fighter.isDroppingThrough) {
      for (const plat of stage.semiSolidPlatforms) {
        if (
          oldY <= plat.y + 6 &&
          fighter.y >= plat.y &&
          fighter.x >= plat.x - 4 &&
          fighter.x <= plat.x + plat.width + 4 &&
          fighter.vy >= 0
        ) {
          fighter.y = plat.y;
          fighter.vy = 0;
          fighter.isGrounded = true;
          fighter.jumpsLeft = fighter.maxJumps;
          fighter.isFastFalling = false;
          fighter.hitstun = 0;
          fighter.groundedPlat = plat;
          return;
        }
      }
    }
    fighter.groundedPlat = null;
  }
}

window.physicsEngine = new PhysicsEngine();
