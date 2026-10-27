/**
 * Super Smash Bros HUD, Mode Controller & Match UI
 * Renders bottom player cards, dynamic damage %, stocks, combo counter,
 * move announcement banners, roster selection cards, and victory results.
 */
class GameHUD {
  constructor() {
    this.playerPercentEl = document.getElementById('player-percent');
    this.playerCardEl = document.getElementById('player-card');
    this.playerNameEl = document.getElementById('player-name');
    this.playerAvatarEl = document.getElementById('player-avatar');
    this.playerStocksEl = document.getElementById('player-stocks');

    this.dummyPercentEl = document.getElementById('dummy-percent');
    this.dummyCardEl = document.getElementById('dummy-card');
    this.dummyNameEl = document.getElementById('dummy-name');
    this.dummyAvatarEl = document.getElementById('dummy-avatar');
    this.dummyStocksEl = document.getElementById('dummy-stocks');
    this.dummyBadgeEl = document.getElementById('dummy-mode-badge');

    this.comboDisplayEl = document.getElementById('combo-display');
    this.comboHitsEl = document.getElementById('combo-hits');
    this.comboDamageEl = document.getElementById('combo-damage');

    this.moveBannerEl = document.getElementById('move-banner');
    this.moveBannerTextEl = document.getElementById('move-banner-text');
    this.bannerTimer = null;

    // Victory modal elements
    this.victoryModalEl = document.getElementById('victory-modal');
    this.victoryTitleEl = document.getElementById('victory-title');
    this.victoryIconEl = document.getElementById('victory-icon');
    this.victorySubtitleEl = document.getElementById('victory-subtitle');
    this.victoryWinnerEl = document.getElementById('victory-winner-name');
    this.victoryStocksEl = document.getElementById('victory-stocks-val');
    this.victoryComboEl = document.getElementById('victory-combo-val');
    this.victoryDamageEl = document.getElementById('victory-damage-val');
  }

  updateFPS(fps, target, showCounter = true) {
    const badge = document.getElementById('fps-counter-badge');
    const valEl = document.getElementById('fps-val');
    const dotEl = document.getElementById('fps-dot');
    if (!badge || !valEl) return;

    if (!showCounter) {
      badge.style.display = 'none';
      return;
    }
    badge.style.display = 'flex';
    valEl.innerText = `${fps}`;

    if (dotEl) {
      if (fps >= 120) {
        dotEl.style.background = '#38bdf8';
        dotEl.style.boxShadow = '0 0 8px #38bdf8';
      } else if (fps >= 55) {
        dotEl.style.background = '#10b981';
        dotEl.style.boxShadow = '0 0 8px #10b981';
      } else {
        dotEl.style.background = '#f59e0b';
        dotEl.style.boxShadow = '0 0 8px #f59e0b';
      }
    }
  }

  showMoveBanner(moveName, type = 'normal') {
    if (!this.moveBannerEl || !this.moveBannerTextEl) return;
    this.moveBannerTextEl.innerText = moveName;
    this.moveBannerEl.className = `move-banner active type-${type}`;

    if (this.bannerTimer) clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => {
      this.moveBannerEl.className = 'move-banner';
    }, 1200);
  }

  update(player, dummy, dummyController) {
    // 1. Update Player %
    if (this.playerPercentEl && player) {
      if (player.minunDead) {
        const timeLeft = Math.max(0, player.minunRespawnTimer).toFixed(1);
        this.playerPercentEl.innerText = `⏳ ${timeLeft}s`;
        this.playerPercentEl.style.color = '#38bdf8';
      } else {
        const p = Math.floor(player.percent);
        this.playerPercentEl.innerText = `${p}%`;
        this.playerPercentEl.style.color = this.getPercentColor(p);
      }
      if (player.hitstop > 0) {
        this.playerPercentEl.classList.add('shake');
      } else {
        this.playerPercentEl.classList.remove('shake');
      }

      // Poison Status Badge for Player
      const isP1Poison = player.statuses && player.statuses.poison && player.statuses.poison.active;
      let pPoisonBadge = document.getElementById('player-poison-badge');
      if (isP1Poison) {
        if (!pPoisonBadge && this.playerCardEl) {
          pPoisonBadge = document.createElement('div');
          pPoisonBadge.id = 'player-poison-badge';
          pPoisonBadge.className = 'status-hud-badge poison-hud-badge';
          this.playerCardEl.appendChild(pPoisonBadge);
        }
        if (pPoisonBadge) {
          pPoisonBadge.innerText = `☠️ VENENO (${player.statuses.poison.timer.toFixed(1)}s)`;
          pPoisonBadge.style.display = 'block';
        }
        this.playerPercentEl.style.color = '#c084fc';
        this.playerPercentEl.classList.add('poisoned-text');
      } else {
        if (pPoisonBadge) pPoisonBadge.style.display = 'none';
        this.playerPercentEl.classList.remove('poisoned-text');
      }

      // Refuerzo badge
      let pBadge = document.getElementById('player-refuerzo-badge');
      if (player.refuerzoTimer > 0 && !player.minunDead) {
        if (!pBadge && this.playerCardEl) {
          pBadge = document.createElement('div');
          pBadge.id = 'player-refuerzo-badge';
          pBadge.className = 'refuerzo-hud-badge';
          this.playerCardEl.appendChild(pBadge);
        }
        if (pBadge) {
          pBadge.innerText = `⚡ +10% DMG (${player.refuerzoTimer.toFixed(1)}s)`;
          pBadge.style.display = 'block';
        }
      } else if (pBadge) {
        pBadge.style.display = 'none';
      }

      // Plusle KO respawn badge for Player
      let pPlusleBadge = document.getElementById('player-plusle-ko-badge');
      if (player.partner && player.partner.respawnTimer > 0) {
        if (!pPlusleBadge && this.playerCardEl) {
          pPlusleBadge = document.createElement('div');
          pPlusleBadge.id = 'player-plusle-ko-badge';
          pPlusleBadge.className = 'status-hud-badge';
          pPlusleBadge.style.background = 'rgba(244, 63, 94, 0.25)';
          pPlusleBadge.style.borderColor = '#f43f5e';
          pPlusleBadge.style.color = '#f43f5e';
          this.playerCardEl.appendChild(pPlusleBadge);
        }
        if (pPlusleBadge) {
          pPlusleBadge.innerText = `⏳ Plusle KO (${player.partner.respawnTimer.toFixed(1)}s)`;
          pPlusleBadge.style.display = 'block';
        }
      } else if (pPlusleBadge) {
        pPlusleBadge.style.display = 'none';
      }
    }

    // 2. Update Dummy / CPU %
    if (this.dummyPercentEl && dummy) {
      if (dummy.minunDead) {
        const timeLeft = Math.max(0, dummy.minunRespawnTimer).toFixed(1);
        this.dummyPercentEl.innerText = `⏳ ${timeLeft}s`;
        this.dummyPercentEl.style.color = '#38bdf8';
      } else {
        const p = Math.floor(dummy.percent);
        this.dummyPercentEl.innerText = `${p}%`;
        this.dummyPercentEl.style.color = this.getPercentColor(p);
      }
      if (dummy.hitstop > 0) {
        this.dummyPercentEl.classList.add('shake');
      } else {
        this.dummyPercentEl.classList.remove('shake');
      }

      // Poison Status Badge for Dummy
      const isDummyPoison = dummy.statuses && dummy.statuses.poison && dummy.statuses.poison.active;
      let dPoisonBadge = document.getElementById('dummy-poison-badge');
      if (isDummyPoison) {
        if (!dPoisonBadge && this.dummyCardEl) {
          dPoisonBadge = document.createElement('div');
          dPoisonBadge.id = 'dummy-poison-badge';
          dPoisonBadge.className = 'status-hud-badge poison-hud-badge';
          this.dummyCardEl.appendChild(dPoisonBadge);
        }
        if (dPoisonBadge) {
          dPoisonBadge.innerText = `☠️ VENENO (${dummy.statuses.poison.timer.toFixed(1)}s)`;
          dPoisonBadge.style.display = 'block';
        }
        this.dummyPercentEl.style.color = '#c084fc';
        this.dummyPercentEl.classList.add('poisoned-text');
      } else {
        if (dPoisonBadge) dPoisonBadge.style.display = 'none';
        this.dummyPercentEl.classList.remove('poisoned-text');
      }

      // Refuerzo badge for Dummy
      let dBadge = document.getElementById('dummy-refuerzo-badge');
      if (dummy.refuerzoTimer > 0 && !dummy.minunDead) {
        if (!dBadge && this.dummyCardEl) {
          dBadge = document.createElement('div');
          dBadge.id = 'dummy-refuerzo-badge';
          dBadge.className = 'refuerzo-hud-badge';
          this.dummyCardEl.appendChild(dBadge);
        }
        if (dBadge) {
          dBadge.innerText = `⚡ +10% DMG (${dummy.refuerzoTimer.toFixed(1)}s)`;
          dBadge.style.display = 'block';
        }
      } else if (dBadge) {
        dBadge.style.display = 'none';
      }

      // Plusle KO respawn badge for Dummy
      let dPlusleBadge = document.getElementById('dummy-plusle-ko-badge');
      if (dummy.partner && dummy.partner.respawnTimer > 0) {
        if (!dPlusleBadge && this.dummyCardEl) {
          dPlusleBadge = document.createElement('div');
          dPlusleBadge.id = 'dummy-plusle-ko-badge';
          dPlusleBadge.className = 'status-hud-badge';
          dPlusleBadge.style.background = 'rgba(244, 63, 94, 0.25)';
          dPlusleBadge.style.borderColor = '#f43f5e';
          dPlusleBadge.style.color = '#f43f5e';
          this.dummyCardEl.appendChild(dPlusleBadge);
        }
        if (dPlusleBadge) {
          dPlusleBadge.innerText = `⏳ Plusle KO (${dummy.partner.respawnTimer.toFixed(1)}s)`;
          dPlusleBadge.style.display = 'block';
        }
      } else if (dPlusleBadge) {
        dPlusleBadge.style.display = 'none';
      }
    }

    // 3. Update Stocks
    if (this.playerStocksEl && player) {
      const pills = this.playerStocksEl.children;
      for (let i = 0; i < pills.length; i++) {
        if (i < player.stocks) {
          pills[i].classList.remove('lost');
        } else {
          pills[i].classList.add('lost');
        }
      }
    }

    if (this.dummyStocksEl && dummy) {
      const pills = this.dummyStocksEl.children;
      for (let i = 0; i < pills.length; i++) {
        if (i < dummy.stocks) {
          pills[i].classList.remove('lost');
        } else {
          pills[i].classList.add('lost');
        }
      }
    }

    // 4. Update Combo Counter (True Combo vs Escapable Combo)
    if (this.comboDisplayEl && dummyController) {
      if (dummyController.comboActive && dummyController.comboCount > 1) {
        this.comboDisplayEl.classList.add('visible');
        const isTrue = dummyController.isTrueCombo !== false;
        if (this.comboHitsEl) {
          this.comboHitsEl.innerText = isTrue
            ? `🔥 ¡TRUE COMBO! ${dummyController.comboCount} GOLPES`
            : `⚡ COMBO ${dummyController.comboCount} GOLPES (Escapable)`;
          this.comboHitsEl.style.color = isTrue ? '#facc15' : '#38bdf8';
          this.comboHitsEl.style.textShadow = isTrue ? '0 0 10px rgba(250, 204, 21, 0.6)' : '0 0 10px rgba(56, 189, 248, 0.6)';
        }
        if (this.comboDamageEl) {
          this.comboDamageEl.innerText = `${Math.floor(dummyController.comboDamage)}% Daño`;
        }
      } else {
        this.comboDisplayEl.classList.remove('visible');
      }
    }

    // 5. Update Held Items (potions charges, cooldown, balloons, etc.)
    this._updateItemHUD(player, 'player');
    this._updateItemHUD(dummy, 'dummy');
  }

  setGameModeUI(gameMode) {
    if (this.dummyBadgeEl) {
      this.dummyBadgeEl.style.display = gameMode === 'TRAINING' ? 'inline-block' : 'none';
    }
    if (this.dummyStocksEl) {
      this.dummyStocksEl.style.display = gameMode === 'BATTLE' ? 'flex' : 'none';
    }

    const deck = document.querySelector('.training-deck');
    if (deck) {
      if (gameMode === 'BATTLE') {
        deck.classList.add('battle-mode');
      } else {
        deck.classList.remove('battle-mode');
      }
    }
  }

  showVictoryModal(data) {
    if (!this.victoryModalEl) return;

    const { isPlayerWin, isCpuVsCpu, winnerFighter, playerStocks, dummyStocks, maxCombo, totalDamage, cpuLevel } = data;

    if (this.victoryTitleEl) {
      if (isCpuVsCpu) {
        this.victoryTitleEl.innerText = '¡FIN DEL COMBATE!';
        this.victoryTitleEl.className = 'victory-title';
      } else {
        this.victoryTitleEl.innerText = isPlayerWin ? '¡VICTORIA!' : '¡DERROTA!';
        this.victoryTitleEl.className = isPlayerWin ? 'victory-title' : 'victory-title defeat';
      }
    }

    if (this.victoryIconEl) {
      this.victoryIconEl.innerText = isCpuVsCpu ? '⚔️' : (isPlayerWin ? '🏆' : '💀');
    }

    if (this.victorySubtitleEl) {
      if (isCpuVsCpu) {
        this.victorySubtitleEl.innerText = `¡${winnerFighter ? winnerFighter.name : 'Luchador'} ha ganado la batalla de CPUs!`;
      } else {
        this.victorySubtitleEl.innerText = isPlayerWin
          ? `¡Has derrotado a la CPU (Nivel ${cpuLevel}) conservando tus vidas!`
          : `La CPU (Nivel ${cpuLevel}) ha noqueado todas tus vidas.`;
      }
    }

    if (this.victoryWinnerEl && winnerFighter) {
      this.victoryWinnerEl.innerText = winnerFighter.name.toUpperCase();
      this.victoryWinnerEl.style.color = isCpuVsCpu ? '#facc15' : (isPlayerWin ? '#38bdf8' : '#f87171');
    }

    if (this.victoryStocksEl) {
      const p1Label = isCpuVsCpu ? 'CPU 1' : 'Jugador';
      this.victoryStocksEl.innerText = `${p1Label}: ${Math.max(0, playerStocks)} ❤️ · CPU 2: ${Math.max(0, dummyStocks)} ❤️`;
    }

    if (this.victoryComboEl) {
      this.victoryComboEl.innerText = `${maxCombo || 0} Golpes`;
    }

    if (this.victoryDamageEl) {
      this.victoryDamageEl.innerText = `${totalDamage || 0}%`;
    }

    this.victoryModalEl.classList.add('open');
  }

  getPercentColor(percent) {
    if (percent < 30) return '#ffffff';
    if (percent < 60) return '#fde047'; // Yellow
    if (percent < 95) return '#fb923c'; // Orange
    if (percent < 130) return '#f87171'; // Red
    return '#ef4444'; // Deep Red
  }

  updateFighterInfo(player, dummy) {
    if (this.playerNameEl && player) {
      const p1Suffix = (window.game && window.game.p1Type === 'CPU') ? ' (CPU)' : '';
      this.playerNameEl.innerText = `${player.name.toUpperCase()}${p1Suffix}`;
      this._setAvatarImage(this.playerAvatarEl, player.dex);
      let partnerBadge = document.getElementById('player-partner-avatar');
      const pDex = player.partnerDex || (player.partner ? player.partner.dex : null);
      if (pDex) {
        if (!partnerBadge) {
          partnerBadge = document.createElement('img');
          partnerBadge.id = 'player-partner-avatar';
          partnerBadge.className = 'partner-avatar-badge';
          this.playerAvatarEl.parentElement.appendChild(partnerBadge);
        }
        this._setAvatarImage(partnerBadge, pDex, true);
        partnerBadge.style.display = 'block';
      } else if (partnerBadge) {
        partnerBadge.style.display = 'none';
      }

      // Player Item Badge
      this._updateItemHUD(player, 'player');

      // Player Weight Badge
      let pWeightTag = document.getElementById('player-weight-tag');
      const pKg = player.pokedexWeight || player.weight || 6.0;
      const pCat = player.weightCategory || 'Medio';
      if (!pWeightTag && this.playerNameEl && this.playerNameEl.parentElement) {
        pWeightTag = document.createElement('div');
        pWeightTag.id = 'player-weight-tag';
        pWeightTag.className = 'fighter-weight-badge';
        this.playerNameEl.parentElement.appendChild(pWeightTag);
      }
      if (pWeightTag) {
        pWeightTag.innerText = `⚖️ ${pKg} kg · ${pCat}`;
      }
    }
    if (this.dummyNameEl && dummy) {
      const modeSuffix = dummy.stocks <= 3 ? ' (CPU)' : ' (DUMMY)';
      this.dummyNameEl.innerText = `${dummy.name.toUpperCase()}${modeSuffix}`;
      this._setAvatarImage(this.dummyAvatarEl, dummy.dex);
      let dummyPartnerBadge = document.getElementById('dummy-partner-avatar');
      const dDex = dummy.partnerDex || (dummy.partner ? dummy.partner.dex : null);
      if (dDex) {
        if (!dummyPartnerBadge) {
          dummyPartnerBadge = document.createElement('img');
          dummyPartnerBadge.id = 'dummy-partner-avatar';
          dummyPartnerBadge.className = 'partner-avatar-badge';
          this.dummyAvatarEl.parentElement.appendChild(dummyPartnerBadge);
        }
        this._setAvatarImage(dummyPartnerBadge, dDex, true);
        dummyPartnerBadge.style.display = 'block';
      } else if (dummyPartnerBadge) {
        dummyPartnerBadge.style.display = 'none';
      }

      // Dummy Item Badge
      this._updateItemHUD(dummy, 'dummy');

      // Dummy Weight Badge
      let dWeightTag = document.getElementById('dummy-weight-tag');
      const dKg = dummy.pokedexWeight || dummy.weight || 6.0;
      const dCat = dummy.weightCategory || 'Medio';
      if (!dWeightTag && this.dummyNameEl && this.dummyNameEl.parentElement) {
        dWeightTag = document.createElement('div');
        dWeightTag.id = 'dummy-weight-tag';
        dWeightTag.className = 'fighter-weight-badge';
        this.dummyNameEl.parentElement.appendChild(dWeightTag);
      }
      if (dWeightTag) {
        dWeightTag.innerText = `⚖️ ${dKg} kg · ${dCat}`;
      }

      // Rebuild Stock Pills dynamically according to configured stocks
      if (this.dummyStocksEl && dummy.stocks !== undefined) {
        this.dummyStocksEl.innerHTML = '';
        if (dummy.stocks <= 10) {
          for (let i = 0; i < dummy.stocks; i++) {
            const pill = document.createElement('div');
            pill.className = 'stock-pill stock-pill-cpu';
            this.dummyStocksEl.appendChild(pill);
          }
        }
      }
    }

    // Rebuild Stock Pills for Player
    if (this.playerStocksEl && player && player.stocks !== undefined) {
      this.playerStocksEl.innerHTML = '';
      if (player.stocks <= 10) {
        for (let i = 0; i < player.stocks; i++) {
          const pill = document.createElement('div');
          pill.className = 'stock-pill';
          this.playerStocksEl.appendChild(pill);
        }
      }
    }
  }

  _updateItemHUD(fighter, prefix) {
    if (!fighter) return;
    const badgeId = `${prefix}-item-badge`;
    let badge = document.getElementById(badgeId);
    const cardEl = prefix === 'player' ? this.playerCardEl : this.dummyCardEl;

    if (!fighter.heldItem || fighter.heldItem === 'none') {
      if (badge) badge.style.display = 'none';
      return;
    }

    const itemDef = window.POKEMON_ITEMS ? window.POKEMON_ITEMS[fighter.heldItem] : null;
    if (!itemDef) {
      if (badge) badge.style.display = 'none';
      return;
    }

    if (!badge && cardEl) {
      badge = document.createElement('div');
      badge.id = badgeId;
      badge.className = 'item-hud-badge';
      cardEl.appendChild(badge);
    }
    if (!badge) return;

    badge.style.display = 'inline-flex';

    let statusText = itemDef.name;
    let extraClass = '';

    if (fighter.heldItem === 'potion' || fighter.heldItem === 'super-potion' || fighter.heldItem === 'hyper-potion') {
      if (fighter.itemCharges <= 0) {
        statusText = `${itemDef.name} (0)`;
        extraClass = 'item-exhausted';
      } else if (fighter.itemCooldown > 0) {
        statusText = `${itemDef.name} (${fighter.itemCharges}) ⏳${Math.ceil(fighter.itemCooldown)}s`;
        extraClass = 'item-cooldown';
      } else {
        const keyHint = prefix === 'player' ? ' [1]' : '';
        statusText = `${itemDef.name} (${fighter.itemCharges})${keyHint}`;
        extraClass = 'item-ready';
      }
    } else if (fighter.heldItem === 'oran-berry') {
      const uses = fighter.oranBerryUsesLeft !== undefined ? fighter.oranBerryUsesLeft : 2;
      statusText = uses > 0 ? `${itemDef.name} (${uses})` : `${itemDef.name} (0)`;
      if (uses <= 0) extraClass = 'item-exhausted';
    } else if (fighter.heldItem === 'air-balloon') {
      if (fighter.balloonPopped || fighter.percent >= 50) {
        statusText = '🎈 Explotado';
        extraClass = 'item-exhausted';
      } else {
        statusText = '🎈 Globo (<50%)';
        extraClass = 'item-active';
      }
    }

    badge.className = `item-hud-badge ${extraClass}`.trim();
    badge.innerHTML = `<img src="${itemDef.icon}" alt="${itemDef.name}"><span>${statusText}</span>`;
  }

  _setAvatarImage(imgEl, dex, isBadge = false) {
    if (!imgEl) return;
    const meta = window.spriteManager ? window.spriteManager.getAnimMeta(dex, 'Idle') : null;
    const sheet = window.spriteManager ? window.spriteManager.getSheet(dex, 'Idle') : null;
    if (meta && sheet && sheet.ready) {
      const size = isBadge ? 32 : 48;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const scale = Math.min((size - 4) / meta.w, (size - 4) / meta.h);
      const dw = meta.w * scale;
      const dh = meta.h * scale;
      const dx = (size - dw) / 2;
      const dy = (size - dh) / 2;
      ctx.drawImage(sheet.img, 0, 0, meta.w, meta.h, dx, dy, dw, dh);
      imgEl.src = c.toDataURL();
    } else {
      imgEl.src = `assets/pokemon/${dex}/Idle.png`;
      if (sheet && !sheet.ready) {
        sheet.img.addEventListener('load', () => this._setAvatarImage(imgEl, dex, isBadge), { once: true });
      }
    }
  }

  renderModalAvatars() {
    const avatarSlots = document.querySelectorAll('[data-avatar-dex]');
    avatarSlots.forEach(slot => {
      const dex = parseInt(slot.getAttribute('data-avatar-dex'), 10);
      const partnerDex = slot.getAttribute('data-partner-dex');
      slot.innerHTML = '';

      const img = document.createElement('img');
      this._setAvatarImage(img, dex, false);
      slot.appendChild(img);

      if (partnerDex) {
        const pImg = document.createElement('img');
        pImg.className = 'partner-avatar-badge';
        pImg.style.position = 'absolute';
        pImg.style.bottom = '-4px';
        pImg.style.right = '-4px';
        pImg.style.width = '20px';
        pImg.style.height = '20px';
        this._setAvatarImage(pImg, parseInt(partnerDex, 10), true);
        slot.appendChild(pImg);
      }
    });
  }
}

window.GameHUD = GameHUD;
