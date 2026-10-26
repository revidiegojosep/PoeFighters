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

    // 4. Update Combo Counter
    if (this.comboDisplayEl && dummyController) {
      if (dummyController.comboActive && dummyController.comboCount > 1) {
        this.comboDisplayEl.classList.add('visible');
        if (this.comboHitsEl) {
          this.comboHitsEl.innerText = `${dummyController.comboCount} GOLPES!`;
        }
        if (this.comboDamageEl) {
          this.comboDamageEl.innerText = `${Math.floor(dummyController.comboDamage)}% Daño`;
        }
      } else {
        this.comboDisplayEl.classList.remove('visible');
      }
    }
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
      let pItemBadge = document.getElementById('player-item-badge');
      if (player.heldItem && player.heldItem !== 'none' && window.POKEMON_ITEMS) {
        const itemDef = window.POKEMON_ITEMS[player.heldItem];
        if (itemDef) {
          if (!pItemBadge && this.playerCardEl) {
            pItemBadge = document.createElement('div');
            pItemBadge.id = 'player-item-badge';
            pItemBadge.className = 'item-hud-badge';
            this.playerCardEl.appendChild(pItemBadge);
          }
          if (pItemBadge) {
            pItemBadge.innerHTML = `<img src="${itemDef.icon}" alt="${itemDef.name}"><span>${itemDef.name}</span>`;
            pItemBadge.style.display = 'inline-flex';
          }
        }
      } else if (pItemBadge) {
        pItemBadge.style.display = 'none';
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
      let dItemBadge = document.getElementById('dummy-item-badge');
      if (dummy.heldItem && dummy.heldItem !== 'none' && window.POKEMON_ITEMS) {
        const itemDef = window.POKEMON_ITEMS[dummy.heldItem];
        if (itemDef) {
          if (!dItemBadge && this.dummyCardEl) {
            dItemBadge = document.createElement('div');
            dItemBadge.id = 'dummy-item-badge';
            dItemBadge.className = 'item-hud-badge';
            this.dummyCardEl.appendChild(dItemBadge);
          }
          if (dItemBadge) {
            dItemBadge.innerHTML = `<img src="${itemDef.icon}" alt="${itemDef.name}"><span>${itemDef.name}</span>`;
            dItemBadge.style.display = 'inline-flex';
          }
        }
      } else if (dItemBadge) {
        dItemBadge.style.display = 'none';
      }
    }
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
