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
   * Considerably reduced knockback at low & medium %, scaling into lethal launch at high %.
   * Returns launch speed in pixels per 60Hz frame.
   */
  calculateKnockback(targetPercent, moveDamage, targetWeight, scaling = 1.0, baseKnockback = 12) {
    const p = Math.max(0, targetPercent);
    const d = moveDamage;
    const w = targetWeight || 100;

    // Weight factor: lighter Pokemon fly slightly farther than heavier Pokemon
    const weightFactor = 100 / (w + 40);

    // Minimal base knockback so attacks at 0% don't blast opponents away
    const base = (baseKnockback || 10) * 0.19;

    // Power curve of 1.42 ensures:
    //  - 0% - 40%: low knockback (1.5 - 4.5 px/frame), true combos and tight juggles!
    //  - 50% - 80%: medium knockback (5 - 9 px/frame), edgeguard setups
    //  - 100%+: lethal launch velocity (14 - 28+ px/frame), blast zone KOs!
    const percentRatio = p / 100;
    const growth = Math.pow(percentRatio, 1.38) * (d * 1.6 + 10) * (scaling || 1.0) * 0.43;

    const totalSpeed = (base + growth) * weightFactor;

    // Clamp between comfortable minimum and maximum speed
    return Math.min(Math.max(totalSpeed, 1.45), 28);
  }

  /**
   * Calculate hitstun duration (in 60fps frames) based on knockback
   */
  calculateHitstun(knockbackSpeed) {
    return Math.floor(knockbackSpeed * 2.45) + 8;
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

    // Apply gravity if airborne
    if (!fighter.isGrounded) {
      const maxFall = fighter.isFastFalling ? this.fastFallSpeed : this.terminalVelocity;
      fighter.vy += this.gravity;
      if (fighter.vy > maxFall) {
        fighter.vy = maxFall;
      }
      fighter.vx *= this.airFriction;
    } else {
      // Ground friction
      fighter.vx *= this.friction;
      if (Math.abs(fighter.vx) < 0.05) fighter.vx = 0;
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
    if (stage.isOutsideBlastZone(fighter.x, fighter.y)) {
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
        fighter.jumpsLeft = fighter.maxJumps;
        fighter.isFastFalling = false;
        fighter.isAirDodging = false;
        fighter.hitstun = 0;
        return;
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
          oldY <= plat.y + 2 &&
          fighter.y >= plat.y &&
          fighter.x >= plat.x &&
          fighter.x <= plat.x + plat.width &&
          fighter.vy >= 0
        ) {
          fighter.y = plat.y;
          fighter.vy = 0;
          fighter.isGrounded = true;
          fighter.jumpsLeft = fighter.maxJumps;
          fighter.isFastFalling = false;
          fighter.hitstun = 0;
          return;
        }
      }
    }
  }
}

window.physicsEngine = new PhysicsEngine();
