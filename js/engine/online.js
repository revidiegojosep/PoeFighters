/**
 * PokéFighters - Online Multiplayer Engine & Anti-Cheat System
 * Update: Multijugador en Línea (WebRTC Peer-to-Peer + HTTP Fallback Sync)
 */

class OnlineAntiCheat {
  constructor() {
    this.flags = 0;
    this.lastPacketSeq = -1;
    this.lastPacketTime = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.maxVelocityPerFrame = 42; // Tolerancia física máxima por fotograma
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
   * Retorna el estado sanitizado o null si es malicioso/descartable.
   */
  validateState(incomingState, currentLocalFighter) {
    if (!incomingState || typeof incomingState !== 'object') return null;

    // 1. Verificación de Secuencia de Paquetes (Anti-Replay Attack)
    if (incomingState.seq !== undefined) {
      if (incomingState.seq <= this.lastPacketSeq && this.lastPacketSeq !== -1) {
        // Paquete obsoleto o duplicado recibido fuera de orden
        return null;
      }
      this.lastPacketSeq = incomingState.seq;
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
      // Los stocks nunca pueden aumentar durante una partida
      if (currentLocalFighter && sanitized.stocks > currentLocalFighter.stocks && currentLocalFighter.stocks > 0) {
        sanitized.stocks = currentLocalFighter.stocks;
        this._flagSuspicious('Stock resurrection exploit detected');
      }
    }

    // 3. Verificación de Porcentaje de Daño (0% a 999%)
    if (sanitized.percent !== undefined) {
      sanitized.percent = Math.min(999, Math.max(0, parseFloat(sanitized.percent) || 0));
    }

    // 4. Verificación de Velocidad y Teletransporte (Speed Hack / Position Spoofing)
    if (sanitized.x !== undefined && sanitized.y !== undefined) {
      if (this.lastX !== 0 && this.lastY !== 0) {
        const dx = sanitized.x - this.lastX;
        const dy = sanitized.y - this.lastY;
        const dist = Math.hypot(dx, dy);

        // Excluir teletransportaciones legítimas (p.ej. Up-B de Gengar o reaparición)
        const isLegitTeleport = (sanitized.state === 'SPECIAL_UP' || sanitized.state === 'RESPAWN' || sanitized.state === 'KO');
        if (dist > this.maxVelocityPerFrame && !isLegitTeleport) {
          this._flagSuspicious(`Speed hack / teleport anomaly: dist=${dist.toFixed(1)}`);
          // Clampear desplazamiento máximo permitido
          const angle = Math.atan2(dy, dx);
          sanitized.x = this.lastX + Math.cos(angle) * this.maxVelocityPerFrame;
          sanitized.y = this.lastY + Math.sin(angle) * this.maxVelocityPerFrame;
        }
      }
      this.lastX = sanitized.x;
      this.lastY = sanitized.y;
    }

    // 5. Verificación de Ítems canónicos
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
    console.warn(`[🛡️ Anti-Cheat] Infracción detectada: ${reason} (Total flags: ${this.flags})`);
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
    this.status = 'idle'; // 'idle' | 'waiting' | 'lobby' | 'item_draft' | 'playing' | 'ended'

    this.selectedDex = 25; // Pikachu por defecto
    this.selectedItem = null;

    // WebRTC Peer Connection
    this.peerConnection = null;
    this.dataChannel = null;
    this.isRtcConnected = false;

    // Fallback Polling / Signaling
    this.pollInterval = null;
    this.syncInterval = null;
    this.lastPollTime = 0;
    this.packetSeq = 0;
    this.ping = 0;
    this.lastPingSent = 0;

    // Draft de objetos
    this.draftTimeRemaining = 20.0;
    this.draftInterval = null;

    this.apiBase = 'api/online.php';
  }

  /**
   * 1. Seleccionar Personaje antes de crear o unirse
   */
  setSelectedFighter(dex) {
    this.selectedDex = parseInt(dex, 10) || 25;
  }

  /**
   * 2. Crear Sala (Host)
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

      this._startPolling();
      return { success: true, code: this.roomCode, room: this.room };
    } catch (err) {
      console.error('[OnlineManager] createRoom error:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * 3. Unirse a Sala (Guest)
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

      this._startPolling();
      return { success: true, code: this.roomCode, room: this.room };
    } catch (err) {
      console.error('[OnlineManager] joinRoom error:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * 4. Actualizar Ajustes de Sala (Solo Anfitrión)
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
   * 5. Iniciar Partida (Solo Anfitrión)
   */
  async startGame() {
    if (this.role !== 'host') return;
    try {
      const res = await fetch(`${this.apiBase}?action=start_game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: this.roomCode,
          token: this.token
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error al iniciar la partida');

      this.room = data.room;
      this._handleRoomStatusTransition(this.room.status);
    } catch (err) {
      console.error('[OnlineManager] startGame error:', err);
      alert(err.message);
    }
  }

  /**
   * 6. Seleccionar Objeto durante el Draft de 20s
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
        if (data.room.status === 'playing') {
          this._handleRoomStatusTransition('playing');
        }
      }
    } catch (err) {
      console.error('[OnlineManager] pickDraftItem error:', err);
    }
  }

  /**
   * Polling periódico del estado de la sala (heartbeat & sincronización de lobby)
   */
  _startPolling() {
    this._stopPolling();
    this._pollRoom();
    this.pollInterval = setInterval(() => this._pollRoom(), 900);
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

        // WebRTC Signaling Poll si aún no se ha establecido canal de datos directo
        if (!this.isRtcConnected && this.status !== 'waiting') {
          this._handleSignaling(this.room.signaling);
        }
      }
    } catch (e) {
      // Silencioso en desconexiones temporales
    }
  }

  /**
   * Transiciones de Estado de Sala
   */
  _handleRoomStatusTransition(newStatus) {
    if (newStatus === 'item_draft') {
      this._startItemDraft();
    } else if (newStatus === 'playing') {
      this._launchOnlineBattle();
    }
  }

  /**
   * Fase del Draft de Objetos (20 Segundos)
   */
  _startItemDraft() {
    this.draftTimeRemaining = 20.0;
    if (window.onOnlineStartDraft) {
      window.onOnlineStartDraft(this.draftTimeRemaining);
    }

    if (this.draftInterval) clearInterval(this.draftInterval);
    this.draftInterval = setInterval(() => {
      this.draftTimeRemaining = Math.max(0, this.draftTimeRemaining - 0.25);
      if (window.onOnlineDraftTick) {
        window.onOnlineDraftTick(Math.ceil(this.draftTimeRemaining));
      }
      if (this.draftTimeRemaining <= 0) {
        clearInterval(this.draftInterval);
        this.draftInterval = null;
        // Si no seleccionó ítem, asignar uno automático
        if (!this.selectedItem) {
          this.pickDraftItem('restos');
        }
      }
    }, 250);
  }

  /**
   * Lanzar la Batalla en Línea Oficial (5 Minutos · 3 Vidas)
   */
  _launchOnlineBattle() {
    if (this.draftInterval) {
      clearInterval(this.draftInterval);
      this.draftInterval = null;
    }

    if (window.onOnlineBattleStart) {
      window.onOnlineBattleStart({
        room: this.room,
        role: this.role,
        myDex: this.selectedDex,
        rivalDex: this.role === 'host' ? this.room.p2?.dex : this.room.p1?.dex,
        stage: this.room.stage || 'BATTLEFIELD',
        itemsEnabled: this.room.rules?.itemsEnabled,
        p1Item: this.room.p1?.item,
        p2Item: this.room.p2?.item
      });
    }

    // Iniciar bucle de sincronización en combate (WebRTC o HTTP Fallback)
    this._startBattleSync();
  }

  /**
   * Configuración de WebRTC PeerConnection para latencia mínima
   */
  initWebRTC() {
    if (this.peerConnection) return;
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
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
        });
      } else {
        this.peerConnection.ondatachannel = (event) => {
          this.dataChannel = event.channel;
          this._setupDataChannel();
        };
      }
    } catch (err) {
      console.warn('[WebRTC] Error al inicializar RTC, usando fallback HTTP:', err);
    }
  }

  _setupDataChannel() {
    if (!this.dataChannel) return;
    this.dataChannel.onopen = () => {
      this.isRtcConnected = true;
      console.log('[🌐 Online WebRTC] ¡DataChannel P2P Abierto con éxito!');
      if (window.onOnlineNetStatus) window.onOnlineNetStatus('p2p', 0);
    };
    this.dataChannel.onclose = () => {
      this.isRtcConnected = false;
      console.warn('[🌐 Online WebRTC] DataChannel cerrado, alternando a HTTP Sync');
      if (window.onOnlineNetStatus) window.onOnlineNetStatus('http', this.ping);
    };
    this.dataChannel.onmessage = (event) => {
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
    } catch (e) {
      // Ignorar errores de señalización transitorios
    }
  }

  async _handleSignaling(signals) {
    if (!signals || !this.peerConnection) return;
    try {
      if (this.role === 'guest' && signals.offer && !this.peerConnection.remoteDescription) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signals.offer));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        await this._sendSignal('answer', answer);
      } else if (this.role === 'host' && signals.answer && !this.peerConnection.remoteDescription) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signals.answer));
      }

      // Procesar candidatos ICE
      const myCandidatesKey = this.role === 'host' ? 'candidates_p2' : 'candidates_p1';
      if (signals[myCandidatesKey] && Array.isArray(signals[myCandidatesKey])) {
        for (const c of signals[myCandidatesKey]) {
          try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(c));
          } catch (err) {}
        }
      }
    } catch (err) {
      // Fallback
    }
  }

  /**
   * Bucle de sincronización de combate: Envío continuo de inputs y estado
   */
  _startBattleSync() {
    if (this.syncInterval) clearInterval(this.syncInterval);

    // Si WebRTC no está disponible, HTTP Fallback a 70ms (~14 ticks/segundo con interpolación suave)
    this.syncInterval = setInterval(() => {
      if (this.status !== 'playing' || !this.game) return;
      this._sendLocalFighterState();
    }, 65);
  }

  /**
   * Envía los datos locales al rival (mediante WebRTC P2P si está activo, o HTTP Sync como fallback)
   */
  _sendLocalFighterState() {
    if (!this.game) return;
    const localFighter = this.game.player;
    if (!localFighter) return;

    this.packetSeq++;
    const payload = {
      seq: this.packetSeq,
      t: performance.now(),
      role: this.role,
      x: Math.round(localFighter.x * 10) / 10,
      y: Math.round(localFighter.y * 10) / 10,
      vx: Math.round(localFighter.vx * 10) / 10,
      vy: Math.round(localFighter.vy * 10) / 10,
      state: localFighter.state,
      facing: localFighter.facing,
      percent: Math.round(localFighter.percent * 10) / 10,
      stocks: localFighter.stocks,
      shield: Math.round(localFighter.shieldHealth || 0),
      hitstun: Math.round((localFighter.hitstun || 0) * 100) / 100,
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
        grab: !!localFighter.input?.grab
      }
    };

    // 1. Envío prioritario vía WebRTC DataChannel (0-5ms)
    if (this.isRtcConnected && this.dataChannel && this.dataChannel.readyState === 'open') {
      try {
        this.dataChannel.send(JSON.stringify(payload));
        return;
      } catch (err) {
        this.isRtcConnected = false;
      }
    }

    // 2. HTTP Fallback Sync
    this._httpSync(payload);
  }

  async _httpSync(payload) {
    try {
      const res = await fetch(`${this.apiBase}?action=sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: this.roomCode,
          token: this.token,
          state: payload
        })
      });
      const data = await res.json();
      if (data.success && data.rival_state) {
        this._applyRivalState(data.rival_state);
      }
    } catch (e) {}
  }

  _handleIncomingPacket(raw) {
    try {
      const packet = JSON.parse(raw);
      this._applyRivalState(packet);
    } catch (e) {}
  }

  /**
   * Aplica el estado del rival con validación Anti-Cheat e interpolación física
   */
  _applyRivalState(incomingPacket) {
    if (!this.game) return;
    const rivalFighter = this.game.dummy;
    if (!rivalFighter) return;

    // 🛡️ Filtro y validación Anti-Cheat
    const safe = this.antiCheat.validateState(incomingPacket, rivalFighter);
    if (!safe) return;

    // Sincronizar inputs del rival
    if (safe.input) {
      rivalFighter.input = Object.assign(rivalFighter.input || {}, safe.input);
    }

    // Suavizado e interpolación de posición
    if (safe.x !== undefined && safe.y !== undefined) {
      const dx = safe.x - rivalFighter.x;
      const dy = safe.y - rivalFighter.y;

      if (Math.hypot(dx, dy) > 85 || safe.state === 'RESPAWN') {
        // Corrección directa si la divergencia es muy alta
        rivalFighter.x = safe.x;
        rivalFighter.y = safe.y;
      } else {
        // Interpolación lineal suave (lerp 35%)
        rivalFighter.x += dx * 0.35;
        rivalFighter.y += dy * 0.35;
      }
    }

    if (safe.vx !== undefined) rivalFighter.vx = safe.vx;
    if (safe.vy !== undefined) rivalFighter.vy = safe.vy;
    if (safe.facing !== undefined) rivalFighter.facing = safe.facing;
    if (safe.percent !== undefined) rivalFighter.percent = safe.percent;
    if (safe.stocks !== undefined) rivalFighter.stocks = safe.stocks;
    if (safe.shield !== undefined) rivalFighter.shieldHealth = safe.shield;
    if (safe.state !== undefined && safe.state !== 'IDLE' && rivalFighter.state !== safe.state) {
      rivalFighter.state = safe.state;
    }
  }

  /**
   * Salir o cerrar la sala
   */
  leaveRoom() {
    this._stopPolling();
    if (this.syncInterval) clearInterval(this.syncInterval);
    if (this.draftInterval) clearInterval(this.draftInterval);
    if (this.dataChannel) {
      try { this.dataChannel.close(); } catch (e) {}
    }
    if (this.peerConnection) {
      try { this.peerConnection.close(); } catch (e) {}
    }

    this.role = null;
    this.roomCode = null;
    this.token = null;
    this.room = null;
    this.status = 'idle';
    this.isRtcConnected = false;
    this.peerConnection = null;
    this.dataChannel = null;
  }
}

// Exportar globalmente
window.OnlineManager = OnlineManager;
window.OnlineAntiCheat = OnlineAntiCheat;
