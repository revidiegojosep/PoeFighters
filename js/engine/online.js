/**
 * PokéFighters - Online Multiplayer Engine & Anti-Cheat System
 * Update: Multijugador en Línea 1v1 en Tiempo Real (WebRTC P2P DataChannel + Non-overlapping HTTP Sync)
 */

class OnlineAntiCheat {
  constructor() {
    this.flags = 0;
    this.lastPacketSeq = -1;
    this.lastPacketTime = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.suspiciousEvents = [];
    this.isDesynced = false;
  }

  reset() {
    this.flags = 0;
    this.lastPacketSeq = -1;
    this.lastPacketTime = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.suspiciousEvents = [];
    this.isDesynced = false;
  }

  /**
   * Valida un paquete de estado recibido del rival.
   * Retorna el estado sanitizado o null si es descartable.
   */
  validateState(incomingState, currentLocalFighter) {
    if (!incomingState || typeof incomingState !== 'object') return null;

    // 1. Verificación de Secuencia de Paquetes (Anti-Replay Attack con tolerancia a fluctuaciones P2P/HTTP)
    if (incomingState.seq !== undefined) {
      if (incomingState.seq <= this.lastPacketSeq && this.lastPacketSeq !== -1) {
        // Permitir paquetes a menos que sean excesivamente antiguos (> 20 secuencias de retraso)
        if (!incomingState.action && !incomingState.hitEvent && (this.lastPacketSeq - incomingState.seq > 20)) {
          return null;
        }
      } else {
        this.lastPacketSeq = incomingState.seq;
      }
    }

    const sanitized = Object.assign({}, incomingState);

    // 2. Clamping y Protección de Stocks (Vidas: 0 a 3)
    if (sanitized.stocks !== undefined) {
      const s = parseInt(sanitized.stocks, 10);
      if (isNaN(s) || s < 0) sanitized.stocks = 0;
      else if (s > 3) {
        sanitized.stocks = 3;
        this._flagSuspicious('Stock tampering: stocks > 3');
      }
    }

    // 3. Verificación de Porcentaje de Daño (0% a 999%)
    if (sanitized.percent !== undefined) {
      sanitized.percent = Math.min(999, Math.max(0, parseFloat(sanitized.percent) || 0));
    }

    // 4. Verificación de Velocidad y Teletransporte (Adaptativo al tiempo entre paquetes)
    if (sanitized.x !== undefined && sanitized.y !== undefined) {
      const now = performance.now();
      const dt = this.lastPacketTime > 0 ? Math.min(1.0, Math.max(0.016, (now - this.lastPacketTime) / 1000)) : 0.05;
      this.lastPacketTime = now;

      const isRespawnWarp = (
        sanitized.x < -500 || sanitized.y < -500 ||
        this.lastX < -500 || this.lastY < -500 ||
        sanitized.state === 'RESPAWN' || sanitized.state === 'KO'
      );

      if (!isRespawnWarp && this.lastX !== 0 && this.lastY !== 0) {
        const dx = sanitized.x - this.lastX;
        const dy = sanitized.y - this.lastY;
        const dist = Math.hypot(dx, dy);

        // Tolerancia física amplia para permitir carreras, ataques dinámicos y knockbacks
        const maxAllowed = Math.max(350, 1600 * dt);
        const isLegitMovement = (
          sanitized.state === 'SPECIAL_UP' ||
          sanitized.state === 'SPECIAL' ||
          sanitized.state === 'ATTACK' ||
          sanitized.state === 'RESPAWN' ||
          sanitized.state === 'KO' ||
          sanitized.state === 'HURT' ||
          sanitized.state === 'LEDGE_CLIMB' ||
          sanitized.state === 'ROLL' ||
          sanitized.state === 'AIR_DODGE' ||
          (sanitized.hitstun && sanitized.hitstun > 0)
        );

        if (dist > maxAllowed && !isLegitMovement) {
          if (dist > 900) {
            this._flagSuspicious(`Extreme anomaly: dist=${dist.toFixed(1)}px (dt=${dt.toFixed(3)}s)`);
            const angle = Math.atan2(dy, dx);
            sanitized.x = this.lastX + Math.cos(angle) * maxAllowed;
            sanitized.y = this.lastY + Math.sin(angle) * maxAllowed;
          }
        }
      }
      this.lastX = sanitized.x;
      this.lastY = sanitized.y;
    }

    // 5. Verificación de Ítems canónicos
    // 4.5. Verificación de Invulnerabilidad (0 a 10 segundos)
    if (sanitized.invuln !== undefined) {
      sanitized.invuln = Math.max(0, Math.min(10, parseFloat(sanitized.invuln) || 0));
    }

    if (sanitized.heldItem) {
      const validItems = ['restos', 'banda_focus', 'cinta_elegida', 'gafas_especiales', 'baya_zidra', 'perla_grande'];
      if (!validItems.includes(sanitized.heldItem)) {
        sanitized.heldItem = null;
        this._flagSuspicious('Illegal item injected');
      }
    }

    return sanitized;
  }

  _flagSuspicious(reason) {
    this.flags++;
    this.suspiciousEvents.push({ time: Date.now(), reason });
    if (this.suspiciousEvents.length > 20) this.suspiciousEvents.shift();
    console.warn(`[🛡️ Anti-Cheat] Infracción: ${reason} (Total flags: ${this.flags})`);
  }

  getSecurityReport() {
    return {
      clean: this.flags === 0,
      flags: this.flags,
      recentEvents: this.suspiciousEvents
    };
  }
}

class OnlineManager {
  constructor(game) {
    this.game = game;
    this.antiCheat = new OnlineAntiCheat();

    this.role = null; // 'host' | 'guest' | null
    this.roomCode = null; // 4 dígitos
    this.token = null;
    this.room = null;
    this.status = 'idle'; // 'idle' | 'waiting' | 'lobby' | 'item_draft' | 'playing' | 'ended' | 'abandoned'

    this.selectedDex = 25; // Pikachu por defecto
    this.selectedItem = null;
    this.isReady = false;

    // WebRTC Peer Connection
    this.peerConnection = null;
    this.dataChannel = null;
    this.isRtcConnected = false;
    this.lastRtcPacketTime = 0;
    this.lastRtcPacketReceivedTime = 0;
    this.addedCandidates = new Set();

    // Sincronización HTTP (No superpuesta)
    this.pollInterval = null;
    this.syncInterval = null;
    this.localHitLockoutTimer = 0;
    this.isHttpInFlight = false;
    this.lastHttpSendTime = 0;
    this.packetSeq = 0;
    this.lastAppliedPacketSeq = 0;
    this.targetX = null;
    this.targetY = null;
    this.ping = 0;

    // Selección de personajes (30 segundos)
    this.charSelectTimeRemaining = 30.0;
    this.charSelectInterval = null;
    this.charConfirmed = false;

    // Draft de objetos (20 segundos)
    this.draftTimeRemaining = 20.0;
    this.draftInterval = null;

    this.apiBase = 'api/online.php';

    // Manejador de desconexión antes de cerrar pestaña
    window.addEventListener('beforeunload', () => {
      // Solo notificar leave en salas de espera o lobby; durante 'playing' dejar que actúe el heartbeat
      if (this.status === 'waiting' || this.status === 'lobby') {
        this._notifyLeaveBeacon();
      }
    });
  }

  /**
   * Marcar estado de Listo (Ready) en el Lobby
   */
  async setReady(isReady = true) {
    this.isReady = !!isReady;
    if (this.roomCode && this.token) {
      try {
        const res = await fetch(`${this.apiBase}?action=set_ready`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: this.roomCode,
            token: this.token,
            ready: this.isReady
          })
        });
        const data = await res.json();
        if (data.success && data.room) {
          const prevStatus = this.status;
          this.room = data.room;
          this.status = data.room.status;
          if (window.onOnlineRoomUpdated) window.onOnlineRoomUpdated(this.room, this.ping);
          if (prevStatus !== this.status) {
            this._handleRoomStatusTransition(this.status);
          }
        }
      } catch (e) {
        console.warn('[OnlineManager] Error en setReady:', e);
      }
    }
  }

  async requestRematch() {
    if (!this.roomCode || !this.token) return;
    try {
      const res = await fetch(`${this.apiBase}?action=rematch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: this.roomCode,
          token: this.token
        })
      });
      const data = await res.json();
      if (data.success && data.room) {
        this.room = data.room;
        if (data.room.status === 'char_select') {
          this._handleRoomStatusTransition('char_select');
        }
      }
      return data;
    } catch (e) {
      console.warn('[Online] Error solicitando revancha:', e);
    }
  }

  /**
   * Seleccionar o confirmar personaje durante la fase de 30s
   */
  async selectCharacter(dex, confirmed = false) {
    this.selectedDex = parseInt(dex, 10) || 25;
    if (confirmed) this.charConfirmed = true;
    if (this.roomCode && this.token) {
      try {
        const res = await fetch(`${this.apiBase}?action=select_fighter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: this.roomCode,
            token: this.token,
            dex: this.selectedDex,
            confirmed: !!confirmed
          })
        });
        const data = await res.json();
        if (data.success && data.room) {
          const prevStatus = this.status;
          this.room = data.room;
          this.status = data.room.status;
          if (window.onOnlineRoomUpdated) window.onOnlineRoomUpdated(this.room, this.ping);
          if (prevStatus !== this.status) {
            this._handleRoomStatusTransition(this.status);
          }
        }
      } catch (e) {
        console.warn('[OnlineManager] Error al sincronizar selección de luchador:', e);
      }
    }
  }

  async setSelectedFighter(dex) {
    return this.selectCharacter(dex, false);
  }

  /**
   * 1. Crear Sala (Host)
   */
  async createRoom(stageId = 'BATTLEFIELD', itemsEnabled = true) {
    try {
      const res = await fetch(`${this.apiBase}?action=create_room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dex: this.selectedDex,
          stage: stageId,
          itemsEnabled: !!itemsEnabled
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error al crear la sala');

      this.role = 'host';
      this.roomCode = data.code;
      this.token = data.host_token;
      this.room = data.room;
      this.status = 'waiting';
      this.antiCheat.reset();
      this.addedCandidates.clear();

      this._startPolling();
      this.initWebRTC(); // Inicializar RTC Host

      return { success: true, code: this.roomCode, room: this.room };
    } catch (err) {
      console.error('[OnlineManager] createRoom error:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * 2. Unirse a Sala (Guest)
   */
  async joinRoom(code) {
    const cleanCode = (code || '').trim().replace(/[^0-9]/g, '');
    if (cleanCode.length !== 4) {
      return { success: false, error: 'El código de sala debe ser de exactamente 4 dígitos.' };
    }

    try {
      const res = await fetch(`${this.apiBase}?action=join_room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cleanCode,
          dex: this.selectedDex
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'No se pudo conectar a la sala');

      this.role = 'guest';
      this.roomCode = cleanCode;
      this.token = data.guest_token;
      this.room = data.room;
      this.status = 'lobby';
      this.antiCheat.reset();
      this.addedCandidates.clear();

      this._startPolling();
      this.initWebRTC(); // Inicializar RTC Guest

      return { success: true, code: this.roomCode, room: this.room };
    } catch (err) {
      console.error('[OnlineManager] joinRoom error:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * 3. Actualizar Ajustes de Sala (Solo Anfitrión)
   */
  async updateSettings(itemsEnabled, stageId) {
    if (this.role !== 'host') return;
    try {
      const res = await fetch(`${this.apiBase}?action=update_settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: this.roomCode,
          token: this.token,
          itemsEnabled: !!itemsEnabled,
          stage: stageId
        })
      });
      const data = await res.json();
      if (data.success) {
        this.room = data.room;
        if (window.onOnlineRoomUpdated) window.onOnlineRoomUpdated(this.room);
      }
    } catch (err) {
      console.error('[OnlineManager] updateSettings error:', err);
    }
  }

  /**
   * 4. Iniciar Partida (Solo Anfitrión)
   */
  async startGame() {
    if (this.role !== 'host') return;
    try {
      const res = await fetch(`${this.apiBase}?action=start_game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: this.roomCode,
          token: this.token,
          dex: this.selectedDex
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error al iniciar la partida');

      this.room = data.room;
      this.status = this.room.status;
      this._handleRoomStatusTransition(this.room.status);
    } catch (err) {
      console.error('[OnlineManager] startGame error:', err);
      alert(err.message);
    }
  }

  /**
   * 5. Seleccionar Objeto durante el Draft de 20s
   */
  async pickDraftItem(itemId) {
    this.selectedItem = itemId;
    try {
      const res = await fetch(`${this.apiBase}?action=pick_item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: this.roomCode,
          token: this.token,
          item_id: itemId
        })
      });
      const data = await res.json();
      if (data.success) {
        this.room = data.room;
        this.status = data.room.status;
        if (data.room.status === 'playing') {
          this._handleRoomStatusTransition('playing');
        }
      }
    } catch (err) {
      console.error('[OnlineManager] pickDraftItem error:', err);
    }
  }

  /**
   * Polling periódico del estado de la sala (heartbeat, señales y detección de abandono)
   */
  _startPolling() {
    this._stopPolling();
    this._pollRoom();
    const interval = (this.isRtcConnected && this.status === 'playing') ? 1000 : 250;
    this.pollInterval = setInterval(() => this._pollRoom(), interval);
  }

  _stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  async _pollRoom() {
    if (!this.roomCode) return;
    try {
      const t0 = performance.now();
      const res = await fetch(`${this.apiBase}?action=get_room&code=${this.roomCode}&token=${encodeURIComponent(this.token || '')}`);
      const data = await res.json();
      this.ping = Math.round(performance.now() - t0);

      // Detección de abandono
      if (data.abandoned || data.room?.status === 'abandoned') {
        this.handleRoomAbandoned(data.abandoned_by || data.room?.abandoned_by);
        return;
      }

      if (data.success && data.room) {
        const prevStatus = this.status;
        this.room = data.room;
        this.status = data.room.status;

        if (window.onOnlineRoomUpdated) {
          window.onOnlineRoomUpdated(this.room, this.ping);
        }

        if (prevStatus !== this.status) {
          this._handleRoomStatusTransition(this.status);
        }

        // WebRTC Signaling Poll: continuar procesando señalización hasta que P2P esté verificado bidireccionalmente
        const isRtcFullyBidirectional = this.isRtcConnected &&
          this.dataChannel &&
          this.dataChannel.readyState === 'open' &&
          this.lastRtcPacketReceivedTime > 0;
        if (!isRtcFullyBidirectional && this.status !== 'waiting' && this.room?.signaling) {
          this._handleSignaling(this.room.signaling);
        }
      }
    } catch (e) {
      // Silencioso en pequeños fallos de red
    }
  }

  _handleRoomStatusTransition(newStatus) {
    this.status = newStatus;
    if (this.room) this.room.status = newStatus;

    if (newStatus === 'char_select') {
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }
      this.lastSentLocalState = null;
      this.currentActionPayload = null;
      this.currentActionFramesLeft = 0;
      this.pendingHitEvent = null;
      this.pendingHitFramesLeft = 0;
      this.lastReceivedHitId = null;
      this.lastAppliedPacketSeq = 0;
      this.packetSeq = 0;
      this.matchId = this.room?.match_id || ((this.matchId || 1) + 1);
      this.antiCheat.reset();
      if (this.game) {
        this.game.isMatchOver = false;
        this.game.isDecisiveFinish = false;
        this.game.matchStarted = false;
        if (this.game.player) {
          this.game.player.percent = 0;
          this.game.player.stocks = 3;
          this.game.player.invulnTimer = 0;
          this.game.player.hitstun = 0;
          this.game.player.hitstop = 0;
          this.game.player.state = 'IDLE';
        }
        if (this.game.dummy) {
          this.game.dummy.percent = 0;
          this.game.dummy.stocks = 3;
          this.game.dummy.invulnTimer = 0;
          this.game.dummy.hitstun = 0;
          this.game.dummy.hitstop = 0;
          this.game.dummy.state = 'IDLE';
        }
      }
      this._startCharSelect();
    } else if (newStatus === 'item_draft') {
      if (this.charSelectInterval) {
        clearInterval(this.charSelectInterval);
        this.charSelectInterval = null;
      }
      this._startItemDraft();
    } else if (newStatus === 'playing') {
      if (this.charSelectInterval) {
        clearInterval(this.charSelectInterval);
        this.charSelectInterval = null;
      }
      if (this.draftInterval) {
        clearInterval(this.draftInterval);
        this.draftInterval = null;
      }
      this._launchOnlineBattle();
    } else if (newStatus === 'abandoned') {
      this.handleRoomAbandoned(this.room?.abandoned_by);
    }
  }

  /**
   * Fase de Selección de Personajes (Cuenta atrás oficial de 30 Segundos)
   */
  _startCharSelect() {
    const totalDuration = 30.0;
    const startTime = Date.now();
    this.charSelectTimeRemaining = totalDuration;
    this.charConfirmed = false;
    if (window.onOnlineStartCharSelect) {
      window.onOnlineStartCharSelect(this.charSelectTimeRemaining, this.room);
    }

    if (this.charSelectInterval) clearInterval(this.charSelectInterval);
    this.charSelectInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      this.charSelectTimeRemaining = Math.max(0, totalDuration - elapsed);
      if (window.onOnlineCharSelectTick) {
        window.onOnlineCharSelectTick(Math.ceil(this.charSelectTimeRemaining), this.room);
      }
      if (this.charSelectTimeRemaining <= 0) {
        clearInterval(this.charSelectInterval);
        this.charSelectInterval = null;
        if (!this.charConfirmed) {
          this.selectCharacter(this.selectedDex || 25, true);
        }
      }
    }, 200);
  }

  /**
   * Fase del Draft de Objetos (20 Segundos)
   */
  _startItemDraft() {
    const totalDuration = 20.0;
    const startTime = Date.now();
    this.draftTimeRemaining = totalDuration;
    if (window.onOnlineStartDraft) {
      window.onOnlineStartDraft(this.draftTimeRemaining);
    }

    if (this.draftInterval) clearInterval(this.draftInterval);
    this.draftInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      this.draftTimeRemaining = Math.max(0, totalDuration - elapsed);
      if (window.onOnlineDraftTick) {
        window.onOnlineDraftTick(Math.ceil(this.draftTimeRemaining));
      }
      if (this.draftTimeRemaining <= 0) {
        clearInterval(this.draftInterval);
        this.draftInterval = null;
        if (!this.selectedItem) {
          this.pickDraftItem('restos');
        }
      }
    }, 200);
  }

  /**
   * Lanzar la Batalla en Línea Oficial (5 Minutos · 3 Vidas)
   */
  _launchOnlineBattle() {
    if (this.draftInterval) {
      clearInterval(this.draftInterval);
      this.draftInterval = null;
    }

    this.antiCheat.reset();
    this.matchId = this.room?.match_id || this.matchId || 1;
    this.battleStartTime = performance.now();
    this.lastRtcPacketTime = 0;
    this.lastRtcPacketReceivedTime = 0;
    this.packetSeq = 0;
    this.lastAppliedPacketSeq = 0;
    this.targetX = null;
    this.targetY = null;
    this.lastReceivedHitId = null;
    this.pendingHitEvent = null;
    this.localHitLockoutTimer = 0;

    if (window.onOnlineBattleStart) {
      window.onOnlineBattleStart({
        room: this.room,
        role: this.role,
        myDex: this.role === 'host' ? (this.room?.p1?.dex || this.selectedDex || 25) : (this.room?.p2?.dex || this.selectedDex || 1),
        rivalDex: this.role === 'host' ? (this.room?.p2?.dex || 1) : (this.room?.p1?.dex || 25),
        stage: this.room.stage || 'BATTLEFIELD',
        itemsEnabled: this.room.rules?.itemsEnabled,
        p1Item: this.room.p1?.item,
        p2Item: this.room.p2?.item
      });
    }

    // Iniciar bucle de sincronización en tiempo real
    this._startBattleSync();
  }

  /**
   * Configuración de WebRTC PeerConnection para latencia mínima directa (P2P)
   */
  initWebRTC() {
    if (this.peerConnection) return;
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
    };

    try {
      this.peerConnection = new RTCPeerConnection(config);

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this._sendSignal('candidate', event.candidate);
        }
      };

      if (this.role === 'host') {
        this.dataChannel = this.peerConnection.createDataChannel('pokefighters_net', {
          ordered: false,
          maxRetransmits: 0
        });
        this._setupDataChannel();

        this.peerConnection.createOffer().then((offer) => {
          this.peerConnection.setLocalDescription(offer);
          this._sendSignal('offer', offer);
        }).catch(err => console.warn('[WebRTC] CreateOffer error:', err));
      } else {
        this.peerConnection.ondatachannel = (event) => {
          this.dataChannel = event.channel;
          this._setupDataChannel();
        };
      }
    } catch (err) {
      console.warn('[WebRTC] Error al inicializar RTC:', err);
    }
  }

  _setupDataChannel() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      this.isRtcConnected = true;
      this.lastRtcPacketTime = performance.now();
      console.log('[🌐 Online WebRTC] ¡DataChannel P2P Abierto con éxito a 60 FPS!');
      if (window.onOnlineNetStatus) window.onOnlineNetStatus('p2p', 8);

      try {
        this.dataChannel.send(JSON.stringify({ type: 'rtc_ping', t: performance.now() }));
      } catch (e) { }
    };

    this.dataChannel.onclose = () => {
      this.isRtcConnected = false;
      console.warn('[🌐 Online WebRTC] DataChannel cerrado.');
      if (window.onOnlineNetStatus) window.onOnlineNetStatus('http', this.ping);
    };

    this.dataChannel.onerror = (err) => {
      console.warn('[🌐 Online WebRTC] DataChannel error:', err);
    };

    this.dataChannel.onmessage = (event) => {
      this.lastRtcPacketReceivedTime = performance.now();
      this.isRtcConnected = true;
      this._handleIncomingPacket(event.data);
    };
  }

  async _sendSignal(type, data) {
    try {
      await fetch(`${this.apiBase}?action=signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: this.roomCode,
          token: this.token,
          type,
          data
        })
      });
    } catch (e) { }
  }

  async _handleSignaling(signals) {
    if (!signals || !this.peerConnection) return;
    try {
      // 1. Manejo de Oferta (Guest)
      if (this.role === 'guest' && signals.offer && !this.peerConnection.remoteDescription) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signals.offer));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        await this._sendSignal('answer', answer);
      }
      // 2. Manejo de Respuesta (Host)
      else if (this.role === 'host' && signals.answer && !this.peerConnection.remoteDescription) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signals.answer));
      }

      // 3. Procesar candidatos ICE SOLO cuando remoteDescription ya esté establecido
      if (this.peerConnection.remoteDescription) {
        const myCandidatesKey = this.role === 'host' ? 'candidates_p2' : 'candidates_p1';
        if (signals[myCandidatesKey] && Array.isArray(signals[myCandidatesKey])) {
          for (const c of signals[myCandidatesKey]) {
            const sig = `${c.candidate}_${c.sdpMid}_${c.sdpMLineIndex}`;
            if (!this.addedCandidates.has(sig)) {
              try {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(c));
                this.addedCandidates.add(sig);
              } catch (err) { }
            }
          }
        }
      }
    } catch (err) {
      // Manejo silencioso de carreras de señalización
    }
  }

  /**
   * Bucle de sincronización de combate: Envío continuo a 60 FPS (WebRTC) o HTTP sin solapamiento
   */
  _startBattleSync() {
    if (this.syncInterval) clearInterval(this.syncInterval);

    // Ticks a ~60 Hz (16ms)
    this.syncInterval = setInterval(() => {
      if (this.status !== 'playing' || !this.game) return;
      this._sendLocalFighterState();
    }, 16);
  }

  recordRivalHit(hitInfo) {
    if (!this.game) return;
    const local = this.game.player;
    const rival = this.game.dummy;
    if (rival && (rival.state === 'RESPAWN' || rival.state === 'KO' || (rival.invulnTimer && rival.invulnTimer > 0))) return;
    if (local && (local.state === 'RESPAWN' || local.state === 'KO' || (local.invulnTimer && local.invulnTimer > 0))) return;
    this.pendingHitEvent = hitInfo;
    this.pendingHitFramesLeft = 18; // Garantizar entrega en múltiples paquetes
    this.localHitLockoutTimer = 0.45; // Proteger la física de lanzamiento local contra rollback prematuro
    this._sendLocalFighterState(); // Emitir inmediatamente sin esperar al siguiente tick
  }

  /**
   * Suavizado e interpolación continua a 60 FPS (elimina micro-tirones y lag visual del rival)
   */
  updateRivalPhysics(dt) {
    if (!this.game || this.status !== 'playing') return;
    const rival = this.game.dummy;
    if (!rival) return;

    if (this.localHitLockoutTimer > 0) {
      this.localHitLockoutTimer = Math.max(0, this.localHitLockoutTimer - dt);
      // Durante el impacto de nuestro golpe, permitir que el rival vuele con la física local inmediata
      return;
    }

    // Si el rival está en reaparición o KO, o fuera de pantalla, no interpolar
    if (rival.state === 'RESPAWN' || rival.state === 'KO' || rival.x < -500 || rival.y < -500) return;

    if (this.targetX !== null && this.targetX !== undefined && this.targetX > -500) {
      const dx = this.targetX - rival.x;
      if (Math.abs(dx) > 140) {
        rival.x = this.targetX;
      } else if (Math.abs(dx) > 0.3) {
        const lerpFactor = Math.min(1.0, 32 * dt);
        rival.x += dx * lerpFactor;
      } else {
        rival.x = this.targetX;
      }
    }

    if (this.targetY !== null && this.targetY !== undefined && this.targetY > -500 && !rival.isGrounded) {
      const dy = this.targetY - rival.y;
      if (Math.abs(dy) > 120) {
        rival.y = this.targetY;
      } else if (Math.abs(dy) > 0.3) {
        const lerpFactor = Math.min(1.0, 32 * dt);
        rival.y += dy * lerpFactor;
      } else {
        rival.y = this.targetY;
      }
    }
  }

  /**
   * Envía los datos locales al rival
   */
  _sendLocalFighterState() {
    if (!this.game) return;
    const localFighter = this.game.player;
    if (!localFighter) return;

    this.packetSeq++;
    const curAnim = localFighter.anim ? (localFighter.anim.curAnim || localFighter.anim.currentAnimName || 'Idle') : 'Idle';
    const aimDir = localFighter.anim ? (localFighter.anim.aimDir || 'center') : 'center';

    // Detección y emisión de eventos de acción ofensiva / defensiva
    let actionPayload = null;
    if (
      localFighter.state === 'ATTACK' ||
      localFighter.state === 'SPECIAL' ||
      localFighter.state === 'SMASH_CHARGE' ||
      localFighter.state === 'SMASH_ATTACK' ||
      localFighter.state === 'GRAB_START' ||
      localFighter.state === 'ROLL' ||
      localFighter.state === 'AIR_DODGE'
    ) {
      if (this.lastSentLocalState !== localFighter.state) {
        this.localActionSeq = (this.localActionSeq || 0) + 1;
        this.currentActionPayload = {
          id: this.localActionSeq,
          type: localFighter.state,
          dir: aimDir !== 'center' ? aimDir : (localFighter.input?.up ? 'up' : localFighter.input?.down ? 'down' : (localFighter.input?.left || localFighter.input?.right) ? 'side' : 'neutral'),
          isAir: !localFighter.isGrounded,
          animName: curAnim
        };
        this.currentActionFramesLeft = 8;
      }
    }
    this.lastSentLocalState = localFighter.state;

    if (this.currentActionPayload && this.currentActionFramesLeft > 0) {
      actionPayload = this.currentActionPayload;
      this.currentActionFramesLeft--;
    }

    const payload = {
      seq: this.packetSeq,
      matchId: this.matchId || this.room?.match_id || 1,
      t: performance.now(),
      role: this.role,
      slot: this.role === 'host' ? 1 : 2,
      dex: localFighter.dex || this.selectedDex,
      platId: localFighter.groundedPlat ? (localFighter.groundedPlat.id || null) : null,
      isGrounded: !!localFighter.isGrounded,
      stageTime: (this.game && this.game.stage) ? Math.round(this.game.stage.time * 100) / 100 : 0,
      x: Math.round(localFighter.x * 10) / 10,
      y: Math.round(localFighter.y * 10) / 10,
      vx: Math.round(localFighter.vx * 10) / 10,
      vy: Math.round(localFighter.vy * 10) / 10,
      state: localFighter.state,
      facing: localFighter.facing,
      percent: Math.round(localFighter.percent * 10) / 10,
      stocks: localFighter.stocks,
      invuln: Math.round((localFighter.invulnTimer || 0) * 10) / 10,
      shield: Math.round(localFighter.shield !== undefined ? localFighter.shield : (localFighter.shieldHealth || 100)),
      hitstun: Math.round((localFighter.hitstun || 0) * 100) / 100,
      animName: curAnim,
      aimDir: aimDir,
      action: actionPayload,
      hitEvent: this.pendingHitEvent || null,
      partner: localFighter.partner ? {
        x: Math.round(localFighter.partner.x * 10) / 10,
        y: Math.round(localFighter.partner.y * 10) / 10,
        vx: Math.round(localFighter.partner.vx * 10) / 10,
        vy: Math.round(localFighter.partner.vy * 10) / 10,
        facing: localFighter.partner.facing,
        state: localFighter.partner.state,
        anim: localFighter.partner.anim ? (localFighter.partner.anim.curAnim || 'Idle') : 'Idle'
      } : null,
      heldItem: localFighter.heldItem ? localFighter.heldItem.id : null,
      input: {
        left: !!localFighter.input?.left,
        right: !!localFighter.input?.right,
        up: !!localFighter.input?.up,
        down: !!localFighter.input?.down,
        attack: !!localFighter.input?.attack,
        special: !!localFighter.input?.special,
        jump: !!localFighter.input?.jump,
        shield: !!localFighter.input?.shield,
        grab: !!localFighter.input?.grab,
        leftPressed: !!localFighter.input?.leftPressed,
        rightPressed: !!localFighter.input?.rightPressed,
        upPressed: !!localFighter.input?.upPressed,
        downPressed: !!localFighter.input?.downPressed,
        attackPressed: !!localFighter.input?.attackPressed,
        specialPressed: !!localFighter.input?.specialPressed,
        jumpPressed: !!localFighter.input?.jumpPressed,
        shieldPressed: !!localFighter.input?.shieldPressed,
        grabPressed: !!localFighter.input?.grabPressed
      }
    };

    if (this.pendingHitEvent) {
      this.pendingHitFramesLeft = (this.pendingHitFramesLeft || 6) - 1;
      if (this.pendingHitFramesLeft <= 0) {
        this.pendingHitEvent = null;
      }
    }

    // 1. Envío prioritario vía WebRTC DataChannel (P2P directo a 60 FPS sin saturar HTTP)
    const now = performance.now();
    const isWebRtcLive = this.isRtcConnected &&
      this.dataChannel &&
      this.dataChannel.readyState === 'open' &&
      this.lastRtcPacketReceivedTime > 0 &&
      (now - this.lastRtcPacketReceivedTime < 2500);

    if (isWebRtcLive) {
      try {
        this.dataChannel.send(JSON.stringify(payload));
        if (window.onOnlineNetStatus) window.onOnlineNetStatus('p2p', this.ping || 6);

        // En modo P2P a 60 FPS, enviamos HTTP sync periódico cada 200ms para mantener el canal HTTP caliente y redundante
        if (!this.isHttpInFlight && (now - this.lastHttpSendTime >= 200)) {
          this.lastHttpSendTime = now;
          this._httpSync(payload, false);
        }
        return;
      } catch (err) {
        this.isRtcConnected = false;
      }
    } else if (this.dataChannel && this.dataChannel.readyState === 'open') {
      try {
        this.dataChannel.send(JSON.stringify(payload));
      } catch (e) { }
    }

    // 2. HTTP Fallback Sync: ~28-30 req/s (intervalo de 32ms)
    // Garantiza sincronización fluida y continua sin retrasos
    if (!this.isHttpInFlight && (now - this.lastHttpSendTime >= 32)) {
      this.lastHttpSendTime = now;
      this._httpSync(payload, false);
    }
  }

  async _httpSync(payload, isHeartbeat = false) {
    if (this.isHttpInFlight || !this.roomCode || !this.token) return;
    this.isHttpInFlight = true;

    const t0 = performance.now();
    try {
      const url = `${this.apiBase}?action=sync&code=${encodeURIComponent(this.roomCode)}&token=${encodeURIComponent(this.token)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: this.roomCode,
          token: this.token,
          state: payload,
          heartbeat: isHeartbeat
        })
      });

      if (!res.ok) {
        console.warn('[OnlineManager] HTTP sync status:', res.status);
        return;
      }

      const data = await res.json();
      this.ping = Math.round(performance.now() - t0);

      if (data.status === 'abandoned' || data.abandoned) {
        this.handleRoomAbandoned(data.abandoned_by);
        return;
      }

      if (data.success && data.rival_state) {
        const rivalPkt = data.rival_state;
        const now = performance.now();
        // WebRTC está entregando paquetes activamente si y solo si recibimos un paquete P2P hace menos de 250ms
        const isRtcActivelyDelivering = this.isRtcConnected &&
          this.dataChannel &&
          this.dataChannel.readyState === 'open' &&
          this.lastRtcPacketReceivedTime > 0 &&
          (now - this.lastRtcPacketReceivedTime < 250);

        // Si WebRTC no está entregando activamente (ej: navegadores distintos en localhost),
        // o si el paquete HTTP es más nuevo que el último recibido:
        if (rivalPkt.matchId && this.matchId && rivalPkt.matchId !== this.matchId) {
          return;
        }
        const isNewerSeq = !rivalPkt.seq || (!this.lastAppliedPacketSeq || rivalPkt.seq >= this.lastAppliedPacketSeq || (this.lastAppliedPacketSeq - rivalPkt.seq) >= 500);
        if (!isRtcActivelyDelivering || isNewerSeq) {
          if (rivalPkt.seq) {
            if (this.lastAppliedPacketSeq && (this.lastAppliedPacketSeq - rivalPkt.seq) >= 500) {
              this.lastAppliedPacketSeq = rivalPkt.seq;
            } else {
              this.lastAppliedPacketSeq = Math.max(this.lastAppliedPacketSeq || 0, rivalPkt.seq);
            }
          }
          this._applyRivalState(rivalPkt);
          if (!isRtcActivelyDelivering && window.onOnlineNetStatus) {
            window.onOnlineNetStatus('http', this.ping);
          }
        }
      }
    } catch (e) {
      console.warn('[OnlineManager] HTTP sync error:', e);
    } finally {
      this.isHttpInFlight = false;
    }
  }

  _handleIncomingPacket(raw) {
    try {
      const packet = JSON.parse(raw);
      this.lastRtcPacketTime = performance.now();
      this.isRtcConnected = true;

      if (packet.type === 'rtc_ping') {
        try {
          this.dataChannel.send(JSON.stringify({ type: 'rtc_pong', t: packet.t }));
        } catch (e) { }
        return;
      }
      if (packet.type === 'rtc_pong') {
        this.ping = Math.max(1, Math.round(performance.now() - packet.t));
        if (window.onOnlineNetStatus) window.onOnlineNetStatus('p2p', this.ping);
        return;
      }

      if (packet.matchId && this.matchId && packet.matchId !== this.matchId) {
        return; // Paquete de partida previa descartado limpiamente
      }

      if (packet.seq !== undefined) {
        if (this.lastAppliedPacketSeq) {
          if (packet.seq < this.lastAppliedPacketSeq && (this.lastAppliedPacketSeq - packet.seq) < 500) {
            return; // Paquete P2P desordenado o antiguo descartado
          }
        }
        this.lastAppliedPacketSeq = packet.seq;
      }
      this.lastRtcPacketReceivedTime = performance.now();

      if (window.onOnlineNetStatus) window.onOnlineNetStatus('p2p', this.ping || 6);
      this._applyRivalState(packet);
    } catch (e) { }
  }

  /**
   * Aplica el estado del rival en tiempo real con validación Anti-Cheat e interpolación física reactiva
   */
  _applyRivalState(incomingPacket) {
    if (!this.game) return;
    let rivalFighter = this.game.dummy;
    const localPlayer = this.game.player;
    if (!rivalFighter || !localPlayer) return;

    // 0. Protección contra paquetes propios: Un jugador NUNCA debe aplicar su propio estado al muñeco rival
    if (incomingPacket.role && incomingPacket.role === this.role) {
      return;
    }
    const mySlot = (this.role === 'host') ? 1 : 2;
    if (incomingPacket.slot && incomingPacket.slot === mySlot) {
      return;
    }

    // 🛡️ Filtro y validación Anti-Cheat
    const safe = this.antiCheat.validateState(incomingPacket, rivalFighter);
    if (!safe) return;

    if (safe.matchId && this.matchId && safe.matchId !== this.matchId) {
      return;
    }

    // Si acabamos de golpear localmente al rival, ignoramos paquetes desfasados que cancelarían el lanzamiento
    if (this.localHitLockoutTimer > 0) {
      if (safe.state !== 'HURT' && safe.percent < rivalFighter.percent) {
        return; // Paquete anterior al impacto descartado
      } else {
        this.localHitLockoutTimer = 0; // El rival ya reconoció el impacto
      }
    }

    // Sincronizar Plusle si el rival es Minun & Plusle
    if (safe.partner && rivalFighter.partner) {
      rivalFighter.onlinePartnerState = safe.partner;
    }

    // 0. Sincronización del reloj de escenario (elimina desincronización de plataformas móviles)
    if (safe.stageTime !== undefined && this.role === 'guest' && this.game.stage) {
      this.game.stage.time = safe.stageTime;
    }

    // Sincronización dinámica de luchador si difiere del paquete de red recibido
    if (safe.dex && rivalFighter.dex !== safe.dex && typeof this.game.swapRivalFighter === 'function') {
      this.game.swapRivalFighter(safe.dex);
      // ¡CRÍTICO! Actualizar la referencia local a la nueva instancia creada por swapRivalFighter
      rivalFighter = this.game.dummy;
      if (!rivalFighter) return;
    }

    // 1. Sincronizar eventos de impacto / daño recibido autoritativo
    if (safe.hitEvent && safe.hitEvent.hitId && safe.hitEvent.hitId !== this.lastReceivedHitId) {
      this.lastReceivedHitId = safe.hitEvent.hitId;
      if (localPlayer.state !== 'RESPAWN' && localPlayer.state !== 'KO' && (!localPlayer.invulnTimer || localPlayer.invulnTimer <= 0)) {
        const targetPercent = Math.min(999, Math.max(localPlayer.percent, safe.hitEvent.totalPercent || (localPlayer.percent + safe.hitEvent.damage)));
        localPlayer.percent = targetPercent;
        localPlayer.state = 'HURT';
        localPlayer.vx = safe.hitEvent.knockbackX;
        localPlayer.vy = safe.hitEvent.knockbackY;
        localPlayer.hitstun = Math.max(localPlayer.hitstun || 0, safe.hitEvent.hitstun || 0.25);
        localPlayer.hitstop = Math.max(localPlayer.hitstop || 0, safe.hitEvent.hitlag || 6);

        if (window.soundEngine && safe.hitEvent.sfx) {
          window.soundEngine.playSfx(safe.hitEvent.sfx);
        }
        if (window.particleManager) {
          window.particleManager.spawnHitSparks(
            localPlayer.x,
            localPlayer.y - localPlayer.height * 0.5,
            safe.hitEvent.damage || 6,
            safe.hitEvent.hitType || 'normal'
          );
          window.particleManager.spawnFloatingText(
            localPlayer.x,
            localPlayer.y - localPlayer.height - 10,
            `+${safe.hitEvent.damage}%`,
            '#ff4444',
            18
          );
        }

        // Responder inmediatamente con nuestro estado de lanzamiento y daño actualizado
        this._sendLocalFighterState();
      }
    }

    // Detectar KO / Muerte del rival recibida por red y reproducir la explosión si localmente no se había mostrado
    if ((safe.state === 'RESPAWN' || safe.state === 'KO') && rivalFighter.state !== 'RESPAWN' && rivalFighter.state !== 'KO') {
      rivalFighter.state = safe.state;
      if (window.soundEngine) window.soundEngine.playSfx('blast_ko');
      if (window.particleManager) {
        const blastX = (rivalFighter.x > -500 && rivalFighter.x < 1500) ? rivalFighter.x : (rivalFighter.facing > 0 ? 1000 : 24);
        const blastY = (rivalFighter.y > -500 && rivalFighter.y < 1000) ? rivalFighter.y : 300;
        window.particleManager.spawnBlastKO(blastX, blastY, rivalFighter.color || '#f43f5e');
      }
    }

    // 2. Sincronizar porcentaje y stocks del rival:
    // El daño acumulado NUNCA se restablece a 0 a menos que el rival reaparezca (RESPAWN/KO)
    if (typeof safe.percent === 'number') {
      if (safe.state === 'RESPAWN' || safe.state === 'KO') {
        rivalFighter.percent = 0;
        rivalFighter.hitstun = 0;
        rivalFighter.hitstop = 0;
        rivalFighter.vx = 0;
        rivalFighter.vy = 0;
        rivalFighter.currentAttack = null;
        rivalFighter.attackFrame = 0;
        this.pendingHitEvent = null;
      } else if (safe.percent < rivalFighter.percent && (rivalFighter.percent - safe.percent) <= 3) {
        // Curación pasiva legítima (Restos / Leftovers)
        rivalFighter.percent = safe.percent;
      } else {
        rivalFighter.percent = Math.max(rivalFighter.percent, safe.percent);
      }
    }

    if (typeof safe.stocks === 'number') {
      rivalFighter.stocks = safe.stocks;
      const matchElapsed = (performance.now() - (this.battleStartTime || 0)) / 1000;
      if (rivalFighter.stocks <= 0 && matchElapsed > 2.0 && this.game && !this.game.isMatchOver && !this.game.isDecisiveFinish) {
        this.game.triggerDecisiveFinish('PLAYER_WIN');
      }
    }

    // 3. Replicación inmediata de acciones ofensivas y defensivas (Ataques, Especiales, Smash, Agarres, Esquives)
    // 2.5. Sincronizar tiempo de invulnerabilidad
    if (typeof safe.invuln === 'number') {
      rivalFighter.invulnTimer = safe.invuln;
    }

    if (safe.action && safe.action.id && safe.action.id !== this.lastAppliedRivalActionId) {
      this.lastAppliedRivalActionId = safe.action.id;
      const act = safe.action;
      if (act.type === 'ATTACK') {
        rivalFighter.performBasicAttack(act.dir || 'neutral', act.isAir);
      } else if (act.type === 'SPECIAL') {
        rivalFighter.performSpecialMove(act.dir || 'neutral');
      } else if (act.type === 'SMASH_CHARGE') {
        rivalFighter.startSmashCharge(act.dir || 'side');
      } else if (act.type === 'SMASH_ATTACK') {
        rivalFighter.releaseSmashAttack(1.0);
      } else if (act.type === 'GRAB_START') {
        rivalFighter.attemptGrab();
      } else if (act.type === 'ROLL') {
        rivalFighter.performRoll(act.dir === 'side' ? rivalFighter.facing : 1);
      } else if (act.type === 'AIR_DODGE') {
        rivalFighter.performAirDodge();
      }
    }

    // 3.5. Replicar entradas de teclado / mando del rival para fluidez visual completa
    if (safe.input) {
      rivalFighter.input = Object.assign({}, safe.input);
    }

    // 4. Orientación, Apuntado y Estados de Animación continuos
    if (safe.facing !== undefined) {
      rivalFighter.facing = safe.facing;
      if (rivalFighter.anim) rivalFighter.anim.setFacing(safe.facing);
    }
    if (safe.aimDir && rivalFighter.anim) {
      rivalFighter.anim.setAim(safe.aimDir);
    }

    // Si el rival no está en un ataque activo, sincronizar su animación de postura
    const isPriorityState = (safe.state === 'RESPAWN' || safe.state === 'KO' || safe.state === 'HURT');
    const isAttacking = (rivalFighter.state === 'ATTACK' || rivalFighter.state === 'SPECIAL' || rivalFighter.state === 'SMASH_CHARGE');
    if (!isAttacking || isPriorityState) {
      if (safe.state !== undefined) {
        rivalFighter.state = safe.state;
      }

      if (rivalFighter.anim) {
        if (safe.state === 'IDLE') {
          rivalFighter.anim.loop('Idle', 1.0);
        } else if (safe.state === 'WALK') {
          rivalFighter.anim.loop('Walk', 1.25);
        } else if (safe.state === 'DASH') {
          rivalFighter.anim.loop('Walk', 1.85);
        } else if (safe.state === 'CROUCH') {
          rivalFighter.anim.loop('Idle', 0.6);
        } else if (safe.state === 'SHIELD') {
          rivalFighter.anim.loop('Idle', 0.55);
        } else if (safe.state === 'HURT') {
          rivalFighter.anim.loop('Hurt', 1.0);
        } else if (safe.state === 'RESPAWN') {
          rivalFighter.anim.loop('Idle', 1.0);
        } else if (safe.animName && rivalFighter.anim.curAnim !== safe.animName) {
          rivalFighter.anim.play(safe.animName);
        }
      }
    }

    // 5. Suavizado e Interpolación Física de Posición con anclaje exacto a plataformas
    let lockedToPlat = false;
    if (safe.isGrounded && safe.platId && this.game.stage) {
      const targetPlat = (this.game.stage.semiSolidPlatforms || []).find(pl => pl.id === safe.platId) ||
        (this.game.stage.solidPlatforms || []).find(pl => pl.id === safe.platId);
      if (targetPlat) {
        rivalFighter.y = targetPlat.y;
        rivalFighter.vy = 0;
        rivalFighter.isGrounded = true;
        rivalFighter.groundedPlat = targetPlat;
        lockedToPlat = true;
      }
    }

    if (!lockedToPlat) {
      rivalFighter.groundedPlat = null;
      rivalFighter.isGrounded = !!safe.isGrounded;
    }

    if (typeof safe.x === 'number') {
      this.targetX = safe.x;
      if (Math.abs(safe.x - rivalFighter.x) > 140 || safe.state === 'RESPAWN' || safe.state === 'KO' || safe.x < -500 || rivalFighter.x < -500) {
        rivalFighter.x = safe.x;
      }
    }

    if (!lockedToPlat && typeof safe.y === 'number') {
      this.targetY = safe.y;
      if (Math.abs(safe.y - rivalFighter.y) > 120 || safe.state === 'RESPAWN' || safe.state === 'KO' || safe.y < -500 || rivalFighter.y < -500) {
        rivalFighter.y = safe.y;
      }
    }

    if (typeof safe.vx === 'number') rivalFighter.vx = safe.vx;
    if (typeof safe.vy === 'number') rivalFighter.vy = safe.vy;
    if (typeof safe.shield === 'number') {
      rivalFighter.shield = safe.shield;
      rivalFighter.shieldHealth = safe.shield;
    }
  }

  /**
   * Manejador de Abandono: Si un jugador abandona, se cierra la sala y se notifica
   */
  handleRoomAbandoned(abandonedBy) {
    if (this.status === 'abandoned') return;
    this.status = 'abandoned';

    console.warn('[OnlineManager] Sala abandonada por:', abandonedBy);

    // Detener la partida y sincronización
    this._stopPolling();
    if (this.syncInterval) clearInterval(this.syncInterval);
    if (this.draftInterval) clearInterval(this.draftInterval);

    if (this.game) {
      this.game.isMatchOver = true;
    }

    // Mostrar modal interactivo de sala cerrada
    const modal = document.getElementById('abandoned-room-modal');
    const msg = document.getElementById('abandoned-room-msg');
    if (modal) {
      if (msg) {
        const who = (abandonedBy === this.role) ? 'Has salido de la partida.' : 'El rival ha abandonado o se ha desconectado.';
        msg.innerHTML = `${who}<br><strong style="color: #facc15;">La sala ha sido cerrada permanentemente.</strong>`;
      }
      modal.classList.add('open');
      if (window.soundEngine) window.soundEngine.playSfx('shock');
    } else {
      alert('⚠️ El rival ha abandonado la partida. La sala ha sido cerrada.');
      this.leaveRoom();
    }
  }

  _notifyLeaveBeacon() {
    if (this.roomCode && this.token) {
      try {
        const url = `${this.apiBase}?action=leave_room`;
        const data = JSON.stringify({ code: this.roomCode, token: this.token });
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, data);
        } else {
          fetch(url, { method: 'POST', body: data, keepalive: true });
        }
      } catch (e) { }
    }
  }

  /**
   * Salir o cerrar la sala de forma voluntaria
   */
  async leaveRoom() {
    this._notifyLeaveBeacon();

    this._stopPolling();
    if (this.syncInterval) clearInterval(this.syncInterval);
    if (this.draftInterval) clearInterval(this.draftInterval);
    if (this.charSelectInterval) clearInterval(this.charSelectInterval);
    this.charSelectInterval = null;
    this.isReady = false;
    this.charConfirmed = false;

    if (this.dataChannel) {
      try { this.dataChannel.close(); } catch (e) { }
    }
    if (this.peerConnection) {
      try { this.peerConnection.close(); } catch (e) { }
    }

    this.role = null;
    this.roomCode = null;
    this.token = null;
    this.room = null;
    this.status = 'idle';
    this.isRtcConnected = false;
    this.peerConnection = null;
    this.dataChannel = null;
    this.addedCandidates.clear();

    const badge = document.getElementById('online-live-badge');
    if (badge) badge.style.display = 'none';

    const modal = document.getElementById('abandoned-room-modal');
    if (modal) modal.classList.remove('open');

    const onlineModal = document.getElementById('online-modal');
    if (onlineModal) onlineModal.classList.remove('open');

    const charModal = document.getElementById('char-select-modal');
    if (charModal) charModal.classList.remove('open');

    const draftModal = document.getElementById('item-draft-modal');
    if (draftModal) draftModal.classList.remove('open');

    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.classList.remove('hidden');

    if (this.game) {
      this.game.matchStarted = false;
      this.game.isMatchOver = false;
      this.game.isOnlineMatch = false;
    }
  }
}

// Exportar globalmente
window.OnlineManager = OnlineManager;
window.OnlineAntiCheat = OnlineAntiCheat;
