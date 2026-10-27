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

    // 1. Verificación de Secuencia de Paquetes (Anti-Replay Attack)
    if (incomingState.seq !== undefined) {
      if (incomingState.seq <= this.lastPacketSeq && this.lastPacketSeq !== -1) {
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
      if (currentLocalFighter && sanitized.stocks > currentLocalFighter.stocks && currentLocalFighter.stocks > 0) {
        sanitized.stocks = currentLocalFighter.stocks;
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

      if (this.lastX !== 0 && this.lastY !== 0) {
        const dx = sanitized.x - this.lastX;
        const dy = sanitized.y - this.lastY;
        const dist = Math.hypot(dx, dy);

        // Tolerancia física dinámica: base 95px + velocidad máxima posible en dt
        const maxAllowed = Math.max(95, 620 * dt);
        const isLegitTeleport = (sanitized.state === 'SPECIAL_UP' || sanitized.state === 'RESPAWN' || sanitized.state === 'KO' || sanitized.state === 'LEDGE_CLIMB');

        if (dist > maxAllowed && !isLegitTeleport) {
          this._flagSuspicious(`Speed anomaly: dist=${dist.toFixed(1)}px (dt=${dt.toFixed(3)}s)`);
          const angle = Math.atan2(dy, dx);
          sanitized.x = this.lastX + Math.cos(angle) * maxAllowed;
          sanitized.y = this.lastY + Math.sin(angle) * maxAllowed;
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

    // WebRTC Peer Connection
    this.peerConnection = null;
    this.dataChannel = null;
    this.isRtcConnected = false;
    this.addedCandidates = new Set();

    // Sincronización HTTP (No superpuesta)
    this.pollInterval = null;
    this.syncInterval = null;
    this.isHttpInFlight = false;
    this.lastHttpSendTime = 0;
    this.packetSeq = 0;
    this.ping = 0;

    // Draft de objetos
    this.draftTimeRemaining = 20.0;
    this.draftInterval = null;

    this.apiBase = 'api/online.php';

    // Manejador de desconexión antes de cerrar pestaña
    window.addEventListener('beforeunload', () => {
      this._notifyLeaveBeacon();
    });
  }

  setSelectedFighter(dex) {
    this.selectedDex = parseInt(dex, 10) || 25;
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
    this.pollInterval = setInterval(() => this._pollRoom(), 800);
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

        // WebRTC Signaling Poll
        if (!this.isRtcConnected && this.status !== 'waiting') {
          this._handleSignaling(this.room.signaling);
        }
      }
    } catch (e) {
      // Silencioso en pequeños fallos de red
    }
  }

  _handleRoomStatusTransition(newStatus) {
    if (newStatus === 'item_draft') {
      this._startItemDraft();
    } else if (newStatus === 'playing') {
      this._launchOnlineBattle();
    } else if (newStatus === 'abandoned') {
      this.handleRoomAbandoned(this.room?.abandoned_by);
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
      console.log('[🌐 Online WebRTC] ¡DataChannel P2P Abierto con éxito a 60 FPS!');
      if (window.onOnlineNetStatus) window.onOnlineNetStatus('p2p', 8);
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
    } catch (e) {}
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

      // 3. Procesar candidatos ICE sin duplicados
      const myCandidatesKey = this.role === 'host' ? 'candidates_p2' : 'candidates_p1';
      if (signals[myCandidatesKey] && Array.isArray(signals[myCandidatesKey])) {
        for (const c of signals[myCandidatesKey]) {
          const sig = `${c.candidate}_${c.sdpMid}_${c.sdpMLineIndex}`;
          if (!this.addedCandidates.has(sig)) {
            this.addedCandidates.add(sig);
            try {
              await this.peerConnection.addIceCandidate(new RTCIceCandidate(c));
            } catch (err) {}
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

  /**
   * Envía los datos locales al rival
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
      slot: this.role === 'host' ? 1 : 2,
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
      animName: localFighter.anim?.currentAnimName || 'Idle',
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

    // 1. Envío prioritario vía WebRTC DataChannel (0-5ms)
    if (this.isRtcConnected && this.dataChannel && this.dataChannel.readyState === 'open') {
      try {
        this.dataChannel.send(JSON.stringify(payload));
        return;
      } catch (err) {
        this.isRtcConnected = false;
      }
    }

    // 2. HTTP Fallback Sync: Garantiza no superposición de peticiones (Max 14 req/s)
    const now = performance.now();
    if (!this.isHttpInFlight && (now - this.lastHttpSendTime >= 65)) {
      this.lastHttpSendTime = now;
      this._httpSync(payload);
    }
  }

  async _httpSync(payload) {
    if (this.isHttpInFlight) return;
    this.isHttpInFlight = true;

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

      if (data.status === 'abandoned' || data.abandoned) {
        this.handleRoomAbandoned(data.abandoned_by);
        return;
      }

      if (data.success && data.rival_state) {
        this._applyRivalState(data.rival_state);
      }
    } catch (e) {
    } finally {
      this.isHttpInFlight = false;
    }
  }

  _handleIncomingPacket(raw) {
    try {
      const packet = JSON.parse(raw);
      this._applyRivalState(packet);
    } catch (e) {}
  }

  /**
   * Aplica el estado del rival en tiempo real con validación Anti-Cheat e interpolación física suave
   */
  _applyRivalState(incomingPacket) {
    if (!this.game) return;
    const rivalFighter = this.game.dummy;
    if (!rivalFighter) return;

    // 🛡️ Filtro y validación Anti-Cheat
    const safe = this.antiCheat.validateState(incomingPacket, rivalFighter);
    if (!safe) return;

    // 1. Sincronizar inputs del rival (movimiento continuo y acciones inmediatas)
    if (safe.input) {
      rivalFighter.input.left = !!safe.input.left;
      rivalFighter.input.right = !!safe.input.right;
      rivalFighter.input.up = !!safe.input.up;
      rivalFighter.input.down = !!safe.input.down;
      rivalFighter.input.jump = !!safe.input.jump;
      rivalFighter.input.attack = !!safe.input.attack;
      rivalFighter.input.special = !!safe.input.special;
      rivalFighter.input.shield = !!safe.input.shield;
      rivalFighter.input.grab = !!safe.input.grab;

      if (safe.input.leftPressed) rivalFighter.input.leftPressed = true;
      if (safe.input.rightPressed) rivalFighter.input.rightPressed = true;
      if (safe.input.upPressed) rivalFighter.input.upPressed = true;
      if (safe.input.downPressed) rivalFighter.input.downPressed = true;
      if (safe.input.jumpPressed) rivalFighter.input.jumpPressed = true;
      if (safe.input.attackPressed) rivalFighter.input.attackPressed = true;
      if (safe.input.specialPressed) rivalFighter.input.specialPressed = true;
      if (safe.input.shieldPressed) rivalFighter.input.shieldPressed = true;
      if (safe.input.grabPressed) rivalFighter.input.grabPressed = true;
    }

    // 2. Orientación y Estado de Animación
    if (safe.facing !== undefined) {
      rivalFighter.facing = safe.facing;
      if (rivalFighter.anim) rivalFighter.anim.setFacing(safe.facing);
    }

    if (safe.state !== undefined && rivalFighter.state !== safe.state) {
      rivalFighter.state = safe.state;
      if (safe.animName && rivalFighter.anim && rivalFighter.anim.currentAnimName !== safe.animName) {
        rivalFighter.anim.play(safe.animName);
      }
    }

    // 3. Suavizado e Interpolación Física de Posición
    if (typeof safe.x === 'number' && typeof safe.y === 'number') {
      const dx = safe.x - rivalFighter.x;
      const dy = safe.y - rivalFighter.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 130 || safe.state === 'RESPAWN') {
        // Teletransporte / Reaparición directa
        rivalFighter.x = safe.x;
        rivalFighter.y = safe.y;
      } else {
        // Interpolación fluida (45% por paquete)
        rivalFighter.x += dx * 0.45;
        rivalFighter.y += dy * 0.45;
      }
    }

    if (typeof safe.vx === 'number') rivalFighter.vx = safe.vx;
    if (typeof safe.vy === 'number') rivalFighter.vy = safe.vy;
    if (typeof safe.percent === 'number') rivalFighter.percent = safe.percent;
    if (typeof safe.stocks === 'number') rivalFighter.stocks = safe.stocks;
    if (typeof safe.shield === 'number') rivalFighter.shieldHealth = safe.shield;
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
      } catch (e) {}
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
    this.addedCandidates.clear();

    const badge = document.getElementById('online-live-badge');
    if (badge) badge.style.display = 'none';

    const modal = document.getElementById('abandoned-room-modal');
    if (modal) modal.classList.remove('open');

    const onlineModal = document.getElementById('online-modal');
    if (onlineModal) onlineModal.classList.remove('open');

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
