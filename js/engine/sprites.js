/**
 * SpriteCollab Sprite Loader & Animator for Super Smash Bros Pokemon
 * Uses exact frame dimensions, delays, and ground anchors from metadata.
 */
class SpriteManager {
  constructor() {
    this.sheets = new Map(); // "dex/Anim" -> { img, ready, failed }
    this.whiteCache = new WeakMap();
    this.scale = 2.4; // Pixel art zoom scale in arena
  }

  getMeta(dex) {
    return window.SPRITE_META && window.SPRITE_META[dex] ? window.SPRITE_META[dex] : null;
  }

  getAnimMeta(dex, anim) {
    const meta = this.getMeta(dex);
    if (!meta || !meta.a) return null;
    return meta.a[anim] || meta.a['Idle'] || null;
  }

  getSheet(dex, anim) {
    const key = `${dex}/${anim}`;
    if (this.sheets.has(key)) {
      return this.sheets.get(key);
    }

    const s = {
      ready: false,
      failed: false,
      img: new Image()
    };

    s.img.onload = () => {
      s.ready = true;
    };
    s.img.onerror = () => {
      s.failed = true;
      console.warn(`Could not load sprite: assets/pokemon/${dex}/${anim}.png`);
    };
    s.img.src = `assets/pokemon/${dex}/${anim}.png`;
    this.sheets.set(key, s);
    return s;
  }

  preloadAll(onProgress, onComplete) {
    const dexes = [1, 25, 94, 311, 312];
    const anims = ['Idle', 'Walk', 'Attack', 'Shoot', 'Charge', 'Hurt', 'Faint'];
    let loaded = 0;
    const total = dexes.length * anims.length;

    dexes.forEach(dex => {
      anims.forEach(anim => {
        const s = this.getSheet(dex, anim);
        if (s.ready) {
          loaded++;
          if (onProgress) onProgress(loaded, total);
          if (loaded === total && onComplete) onComplete();
        } else {
          s.img.addEventListener('load', () => {
            loaded++;
            if (onProgress) onProgress(loaded, total);
            if (loaded === total && onComplete) onComplete();
          }, { once: true });
          s.img.addEventListener('error', () => {
            loaded++;
            if (onProgress) onProgress(loaded, total);
            if (loaded === total && onComplete) onComplete();
          }, { once: true });
        }
      });
    });
  }

  getWhiteSilhouette(img) {
    let c = this.whiteCache.get(img);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    this.whiteCache.set(img, c);
    return c;
  }
}

class SpriteAnimator {
  constructor(dex, scale = 2.4) {
    this.dex = dex;
    this.scale = scale;
    this.curAnim = 'Idle';
    this.baseAnim = 'Idle';
    this.frame = 0;
    this.timer = 0;
    this.speed = 1.0;
    this.isOnce = false;
    this.isHold = false;
    this.isDone = false;
    this.facing = 1; // 1 = right, -1 = left
    this.aimDir = 'center'; // 'up', 'down', 'center'
    this.onFinishCallback = null;
  }

  setFacing(facing) {
    this.facing = facing >= 0 ? 1 : -1;
  }

  setAim(aim) {
    this.aimDir = aim;
  }

  loop(anim, speed = 1.0) {
    this.baseAnim = anim;
    if (!this.isOnce && this.curAnim !== anim) {
      this._start(anim, false);
    }
    if (!this.isOnce) {
      this.speed = speed;
    }
  }

  play(anim, opts = {}, onFinish = null) {
    this._start(anim, true);
    this.speed = opts.speed || 1.0;
    this.isHold = !!opts.hold;
    this.onFinishCallback = onFinish;
  }

  isBusy() {
    return this.isOnce && !this.isDone;
  }

  _start(anim, once) {
    this.curAnim = anim;
    this.frame = 0;
    this.timer = 0;
    this.isOnce = once;
    this.isDone = false;
  }

  update(dt) {
    const meta = window.spriteManager.getAnimMeta(this.dex, this.curAnim);
    if (!meta || this.isDone) return;

    this.timer += dt * 60 * this.speed;
    const frameDelay = meta.d[this.frame] || 4;

    while (this.timer >= frameDelay) {
      this.timer -= frameDelay;
      this.frame++;
      if (this.frame >= meta.n) {
        if (this.isOnce) {
          if (this.isHold) {
            this.frame = meta.n - 1;
            this.isDone = true;
            if (this.onFinishCallback) this.onFinishCallback();
            return;
          }
          this.isDone = true;
          if (this.onFinishCallback) this.onFinishCallback();
          this._start(this.baseAnim, false);
          return;
        } else {
          this.frame = 0;
        }
      }
    }
  }

  getRow() {
    // 8-directional rows in SpriteCollab:
    // 0: Down · 1: DownRight · 2: Right · 3: UpRight · 4: Up · 5: UpLeft · 6: Left · 7: DownLeft
    if (this.aimDir === 'up') return 4;   // Pure Upward attack / facing
    if (this.aimDir === 'down') return 0; // Pure Downward attack / facing
    return this.facing >= 0 ? 2 : 6;     // Pure Right (2) or Left (6)
  }

  draw(ctx, feetX, feetY, opts = {}) {
    const meta = window.spriteManager.getAnimMeta(this.dex, this.curAnim);
    const sheet = window.spriteManager.getSheet(this.dex, this.curAnim);
    const k = this.scale;

    if (!sheet || !sheet.ready || !meta) {
      // Fallback placeholder circle if sprite is still decoding
      ctx.fillStyle = opts.fallbackColor || (this.dex === 25 ? '#ffd700' : '#48d0b0');
      ctx.beginPath();
      ctx.arc(feetX, feetY - 24, 18, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    const row = Math.min(this.getRow(), meta.r - 1);
    const currentFrame = Math.min(this.frame, meta.n - 1);
    const sx = currentFrame * meta.w;
    const sy = row * meta.h;

    // Anchor: meta.ax, meta.ay is the ground anchor relative to sprite frame
    const dx = Math.round(feetX - meta.ax * k);
    const dy = Math.round(feetY - meta.ay * k);

    const prevAlpha = ctx.globalAlpha;
    if (opts.alpha !== undefined) {
      ctx.globalAlpha = prevAlpha * opts.alpha;
    }

    if (!opts.flash) {
      ctx.drawImage(sheet.img, sx, sy, meta.w, meta.h, dx, dy, meta.w * k, meta.h * k);
    } else {
      // Hit flash white
      const whiteImg = window.spriteManager.getWhiteSilhouette(sheet.img);
      ctx.drawImage(whiteImg, sx, sy, meta.w, meta.h, dx, dy, meta.w * k, meta.h * k);
    }

    ctx.globalAlpha = prevAlpha;
  }
}

window.spriteManager = new SpriteManager();
window.SpriteAnimator = SpriteAnimator;
