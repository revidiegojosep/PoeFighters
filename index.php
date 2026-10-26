<?php
// PokeFighters - Super Smash Bros Pokemon Edition
// Backend Configuration, Roster, Stages & Items
$fighters = [
    25 => [
        'name' => 'Pikachu',
        'dex' => 25,
        'type' => 'Eléctrico',
        'type_color' => '#facc15',
        'desc' => 'Luchador ágil y veloz con proyectiles eléctricos, recuperación supersónica y el devastador ataque Trueno.',
        'moves_z' => [
            'Neutral' => ['name' => 'Jab Eléctrico (Suelo) / Giro Rayo (Aire)', 'damage' => '4% / 7%', 'desc' => 'Golpes cuerpo a cuerpo rápidos. En el aire ejecuta un giro eléctrico en 360°.'],
            'Lateral (⬅️/➡️)' => ['name' => 'Cola Férrea (Suelo) / Cola Aérea (Aire)', 'damage' => '9% / 8%', 'desc' => 'Potente zarpazo horizontal cuerpo a cuerpo con estela de chispas.'],
            'Arriba (⬆️)' => ['name' => 'Patada Ascendente (Suelo) / Voltereta Trueno (Aire)', 'damage' => '7% / 8%', 'desc' => 'Ataque cuerpo a cuerpo hacia arriba; eleva al rival al aire para combos.'],
            'Abajo (⬇️)' => ['name' => 'Barrido Cola (Suelo) / Pisotón Meteoro (Aire)', 'damage' => '6% / 10%', 'desc' => 'En el suelo barre las patas; en el aire clava al rival hacia abajo (Meteor Spike).']
        ],
        'moves_x' => [
            'Neutral (Sin dirección)' => ['name' => 'Bola Voltio', 'damage' => '10%', 'desc' => 'Lanza una esfera de plasma eléctrico que viaja horizontalmente por el escenario.'],
            'Lateral (⬅️/➡️)' => ['name' => 'Placaje Eléctrico', 'damage' => '12%', 'desc' => 'Dash ultrarrápido electrificado hacia los lados que arrolla al oponente con gran fuerza e impacto eléctrico.'],
            'Arriba (⬆️)' => ['name' => 'Ataque Rápido', 'damage' => '8%', 'desc' => 'Impulso supersónico diagonal con relámpagos que daña y recupera altura.'],
            'Abajo (⬇️)' => ['name' => '¡Trueno!', 'damage' => '14%', 'desc' => 'Invoca un relámpago vertical del cielo que impacta con tremenda explosión.']
        ]
    ],
    1 => [
        'name' => 'Bulbasaur',
        'dex' => 1,
        'type' => 'Planta / Veneno',
        'type_color' => '#10b981',
        'desc' => 'Luchador resistente con látigos cuerpo a cuerpo de gran alcance, esporas radiales y semillas explosivas.',
        'moves_z' => [
            'Neutral' => ['name' => 'Látigo Cepa (Suelo) / Espiral Follaje (Aire)', 'damage' => '5% / 7%', 'desc' => 'Latigazo frontal rápido. En el aire azota en espiral alrededor de su cuerpo.'],
            'Lateral (⬅️/➡️)' => ['name' => 'Placaje Cabeza (Suelo) / Cabezazo Aéreo (Aire)', 'damage' => '10% / 8%', 'desc' => 'Carga con la cabeza con gran empuje horizontal.'],
            'Arriba (⬆️)' => ['name' => 'Látigo Superior (Suelo) / Látigo Aéreo Elevado (Aire)', 'damage' => '8% / 9%', 'desc' => 'Látigos cuerpo a cuerpo hacia arriba para iniciar y continuar combos aéreos.'],
            'Abajo (⬇️)' => ['name' => 'Barrido Cepa (Suelo) / Látigo Meteoro (Aire)', 'damage' => '7% / 11%', 'desc' => 'En el suelo barre a ras de suelo; en el aire estrella al rival abajo (Meteor Spike).']
        ],
        'moves_x' => [
            'Neutral (Sin dirección)' => ['name' => 'Esporas Drenadoras', 'damage' => '9%', 'desc' => 'Vórtice radial en 360° de esporas y semillas tóxicas sin presionar flechas.'],
            'Lateral (⬅️/➡️)' => ['name' => 'Hoja Afilada', 'damage' => '3x 5%', 'desc' => 'Ráfaga de 3 hojas giratorias afiladas lanzadas lateralmente.'],
            'Arriba (⬆️)' => ['name' => 'Látigo Impulso', 'damage' => '11%', 'desc' => 'Lanza látigos hacia arriba impulsando a Bulbasaur de vuelta al escenario.'],
            'Abajo (⬇️)' => ['name' => 'Bomba Germen', 'damage' => '12%', 'desc' => 'Dispara una semilla parabólica que estalla en esporas al impactar.']
        ]
    ],
    312 => [
        'name' => 'Minun y Plusle',
        'dex' => 312,
        'type' => 'Eléctrico (Dúo)',
        'type_color' => '#38bdf8',
        'desc' => 'Dúo de roedores eléctricos coordinados estilo Ice Climbers. Minun (-) lidera y Plusle (+) asiste en tándem. ¡Si Minun muere pero Plusle sobrevive 7 segundos, Minun reaparece sin perder vida! Golpes cuerpo a cuerpo rápidos con Z (-50% CD), y ataques especiales con x2 proyectiles entrelazados con X (-20% CD). Refuerzo (⬇️+X) aumenta el daño un 10% durante 5s si Minun está presente.',
        'moves_z' => [
            'Neutral' => ['name' => 'Chispa Jab (Suelo) / Giro Bipolar (Aire)', 'damage' => '5% (+4% Tándem)', 'desc' => 'Puñetazos rápidos cuerpo a cuerpo a corta distancia. En el aire giran en doble vórtice cuerpo a cuerpo.'],
            'Lateral (⬅️/➡️)' => ['name' => 'Coletazo Polar (Suelo) / Zarpazo Aéreo (Aire)', 'damage' => '8% (+6% Tándem)', 'desc' => 'Zarpazo físico cuerpo a cuerpo con estela de chispas y gran impacto horizontal.'],
            'Arriba (⬆️)' => ['name' => 'Patada Voltereta (Suelo) / Patada Aérea (Aire)', 'damage' => '7% (+5% Tándem)', 'desc' => 'Voltereta ascendente cuerpo a cuerpo que eleva al rival para iniciar combos aéreos.'],
            'Abajo (⬇️)' => ['name' => 'Barrido Bajo (Suelo) / Pisotón Doble Meteoro (Aire)', 'damage' => '6% / 10% (Spike)', 'desc' => 'En el suelo barrido bajo a ras de suelo; en el aire clavan al rival con doble pisotón meteoro descendente (Spike).']
        ],
        'moves_x' => [
            'Neutral (Sin dirección)' => ['name' => 'Chispazo Doble (+ y -)', 'damage' => '2x 7%', 'desc' => 'Minun y Plusle disparan simultáneamente 2 esferas de plasma entrelazadas en doble hélice (negativa azul y positiva roja) con tamaño optimizado (-20%).'],
            'Lateral (⬅️/➡️)' => ['name' => 'Placaje Magnético Dúo', 'damage' => '11%', 'desc' => 'Embestida ultrarrápida coordinada con estela de relámpagos, disparando 2 proyectiles de choque frontales.'],
            'Arriba (⬆️)' => ['name' => 'Impulso Magnético (Belay)', 'damage' => '8%', 'desc' => 'Recuperación Ice Climbers: un rayo polar conecta al dúo; Plusle impulsa a Minun al cielo y ambos disparan 2 cohetes de chispas hacia arriba.'],
            'Abajo (⬇️)' => ['name' => 'Refuerzo (Helping Hand)', 'damage' => '+10% DMG (5s)', 'desc' => 'Coordinación y ánimo que aumenta todo el daño realizado un 10% durante 5 segundos. NO se acumula y requiere que Minun esté presente en el combate.']
        ]
    ],
    94 => [
        'name' => 'Gengar',
        'dex' => 94,
        'type' => 'Fantasma / Veneno',
        'type_color' => '#a855f7',
        'desc' => 'Pokémon Fantasma escurridizo y letal. Se teletransporta por el escenario, paraliza y aturde con su Lenguetazo (0.4s de stun) e intoxica con Tóxico AOE causando estado de Veneno continuado.',
        'moves_z' => [
            'Neutral' => ['name' => 'Garra Umbría (Suelo) / Giro Espectral (Aire)', 'damage' => '5% / 7%', 'desc' => 'Zarpazo sombrío frontal rápido. En el aire gira su cuerpo espectral en 360°.'],
            'Lateral (⬅️/➡️)' => ['name' => 'Puño Sombra (Suelo) / Puño Fantasma (Aire)', 'damage' => '9% / 8%', 'desc' => 'Puñetazo de energía espectral con gran avance horizontal y empuje.'],
            'Arriba (⬆️)' => ['name' => 'Gancho Sombra (Suelo) / Garra Astral (Aire)', 'damage' => '8% / 9%', 'desc' => 'Zarpazo sombrío hacia arriba que eleva al rival para combos aéreos.'],
            'Abajo (⬇️)' => ['name' => 'Barrido Espectral (Suelo) / Pesadilla Meteoro (Aire)', 'damage' => '6% / 11% (Spike)', 'desc' => 'En el suelo barre las piernas; en el aire desciende en picado empotrando al rival contra el abismo (Meteor Spike).']
        ],
        'moves_x' => [
            'Neutral (Sin dirección)' => ['name' => 'Bola Sombra', 'damage' => '9%', 'desc' => 'Dispara una esfera oscura concentrada que cruza la pantalla a gran velocidad.'],
            'Lateral (⬅️/➡️)' => ['name' => 'Lenguetazo (Stun 0.4s)', 'damage' => '7%', 'desc' => 'Saca una larga lengua espectral que inmoviliza y aturde por completo al oponente durante 0.4 segundos.'],
            'Arriba (⬆️)' => ['name' => 'Teletransportación Espectral', 'damage' => 'Recuperación', 'desc' => 'Se desvanece en las sombras y reaparece instantáneamente más arriba en el aire con una explosión sombría.'],
            'Abajo (⬇️)' => ['name' => 'Tóxico AOE (Estado: Veneno 5s)', 'damage' => '6% (+ Veneno)', 'desc' => 'Expulsa una densa nube de miasma venenoso en área. Aplica el estado VENENO durante 5.0 segundos (daño cada 1.7s equivalente al 2% del daño acumulado actual del rival).']
        ]
    ]
];

$stages = [
    'BATTLEFIELD' => [
        'id' => 'BATTLEFIELD',
        'name' => 'Campo de Batalla',
        'badge' => '3 Plataformas Flotantes',
        'desc' => 'Plataforma principal sólida y 3 plataformas aéreas flotantes. Ideal para combos y juego vertical.',
        'icon' => '🏛️'
    ],
    'FINAL_DESTINATION' => [
        'id' => 'FINAL_DESTINATION',
        'name' => 'Destino Final',
        'badge' => 'Plataforma Única (Sin Plataformas Aéreas)',
        'desc' => 'Plataforma principal única y limpia sobre una grieta dimensional cósmica. Pura habilidad sin plataformas intermedias.',
        'icon' => '🌌'
    ]
];

$pokemon_items = [
    'none' => [
        'id' => 'none',
        'name' => 'Sin Objeto',
        'icon' => null,
        'tag' => 'Neutral',
        'desc' => 'Sin bonificaciones ni restricciones adicionales.'
    ],
    'leftovers' => [
        'id' => 'leftovers',
        'name' => 'Restos',
        'icon' => 'assets/items/leftovers.png',
        'tag' => 'Sustento',
        'desc' => 'Recupera un 1.5% de vida/daño cada 2.0 segundos de combate de forma continua.'
    ],
    'life-orb' => [
        'id' => 'life-orb',
        'name' => 'Vida Esfera',
        'icon' => 'assets/items/life-orb.png',
        'tag' => 'Ofensivo (+25%)',
        'desc' => 'Aumenta el daño de todos los ataques un +25%, pero sufres 1.5% de retroceso al golpear.'
    ],
    'choice-band' => [
        'id' => 'choice-band',
        'name' => 'Cinta Elección (Física)',
        'icon' => 'assets/items/choice-band.png',
        'tag' => 'Solo Ataques Z (+35%)',
        'desc' => '+35% de daño y empuje en ataques básicos [Z]. BLOQUEA todos los movimientos especiales [X].'
    ],
    'choice-specs' => [
        'id' => 'choice-specs',
        'name' => 'Gafas Elección (Especial)',
        'icon' => 'assets/items/choice-specs.png',
        'tag' => 'Solo Movimientos X (+35%)',
        'desc' => '+35% de daño en movimientos especiales [X]. BLOQUEA todos los ataques básicos [Z].'
    ],
    'choice-scarf' => [
        'id' => 'choice-scarf',
        'name' => 'Pañuelo Elección',
        'icon' => 'assets/items/choice-scarf.png',
        'tag' => 'Velocidad (+25%)',
        'desc' => '+25% de velocidad de movimiento, carrera y aceleración en el aire.'
    ],
    'rocky-helmet' => [
        'id' => 'rocky-helmet',
        'name' => 'Casco Dentado',
        'icon' => 'assets/items/rocky-helmet.png',
        'tag' => 'Contraataque (4%)',
        'desc' => 'Refleja 4% de daño instantáneo al rival cuando te golpea con ataques cuerpo a cuerpo directos.'
    ],
    'focus-sash' => [
        'id' => 'focus-sash',
        'name' => 'Banda Focus',
        'icon' => 'assets/items/focus-sash.png',
        'tag' => 'Supervivencia',
        'desc' => 'Una vez por vida, sobrevive a un impacto que te causaría un KO fatal fuera del escenario.'
    ],
    'focus-band' => [
        'id' => 'focus-band',
        'name' => 'Cinta Focus',
        'icon' => 'assets/items/focus-band.png',
        'tag' => 'Defensivo (20%)',
        'desc' => '20% de probabilidad al recibir un golpe de reducir el daño y el empuje un 75%.'
    ],
    'assault-vest' => [
        'id' => 'assault-vest',
        'name' => 'Chaleco Asalto',
        'icon' => 'assets/items/assault-vest.png',
        'tag' => 'Defensa Esp. (-25%)',
        'desc' => 'Reduce un 25% el daño recibido por proyectiles y ataques especiales rivales.'
    ],
    'shell-bell' => [
        'id' => 'shell-bell',
        'name' => 'Cascabel Concha',
        'icon' => 'assets/items/shell-bell.png',
        'tag' => 'Sustento (Cura 1.5%)',
        'desc' => 'Curas 1.5% de tu daño acumulado cada vez que conectas un golpe en el oponente.'
    ]
];
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PokéFighters - Super Smash Bros Pokémon Edition</title>
  <meta name="description" content="Juego estilo Super Smash Bros con sprites de Pokémon Mundo Misterioso usando PHP y JS. Controla a Pikachu y Bulbasaur con movimientos direccionales únicos.">
  <link rel="stylesheet" href="css/style.css?v=<?= time() ?>">
  <link rel="icon" type="image/png" href="assets/pokemon/25/Idle.png">
</head>
<body>

  <!-- Game Header -->
  <header class="game-header">
    <div class="logo-container">
      <div class="logo-badge">SMASH</div>
      <h1 class="logo-title">POKÉ<span>FIGHTERS</span></h1>
    </div>

    <div class="header-actions">
      <button id="btn-open-match-menu" class="btn-header highlight" title="Configurar modo de combate y elegir personajes">
        ⚔️ Menú de Partida
      </button>
      <button id="btn-open-settings" class="btn-header" title="Ajustes de sonido, controles y gráficos">
        ⚙️ Ajustes
      </button>
      <button id="btn-header-fullscreen" class="btn-header" title="Pantalla completa para la arena [Ctrl+F]">
        ⛶ Pantalla Completa
      </button>
      <button id="btn-music" class="btn-header" title="Alternar música sintetizada Web Audio">
        🎵 Música: OFF
      </button>
      <button id="btn-moves-guide" class="btn-header" onclick="document.getElementById('moves-modal').classList.add('open')">
        📖 Guía
      </button>
    </div>
  </header>

  <!-- Main Game Container -->
  <main class="main-wrapper">

    <!-- Canvas Viewport -->
    <div class="canvas-container" id="canvas-container">
      <!-- Arena Floating Fullscreen Button -->
      <button id="btn-arena-fullscreen" class="btn-arena-floating-fs" title="Alternar Pantalla Completa [Ctrl+F]">
        ⛶
      </button>

      <!-- Loading State -->
      <div id="loading-overlay">
        <div class="pokeball-spinner"></div>
        <p id="loading-text" style="font-weight: 700; color: #94a3b8; font-size: 16px;">
          Cargando sprites de Pokémon...
        </p>
      </div>

      <!-- Action Move Announcement Banner -->
      <div id="move-banner" class="move-banner">
        <span id="move-banner-text">¡Trueno!</span>
      </div>

      <!-- True Combo Counter -->
      <div id="combo-display" class="combo-display">
        <div id="combo-hits" class="combo-hits">2 GOLPES!</div>
        <div id="combo-damage" class="combo-damage">14% Daño</div>
      </div>

      <!-- Canvas -->
      <canvas id="game-canvas"></canvas>

      <!-- Bottom Smash HUD -->
      <div class="smash-hud">
        <!-- Player 1 Card -->
        <div class="fighter-card player-card" id="player-card">
          <div class="card-avatar-wrap">
            <img id="player-avatar" src="assets/pokemon/25/Idle.png" alt="Pikachu">
          </div>
          <div class="card-info">
            <div class="fighter-name" id="player-name">PIKACHU</div>
            <div class="percent-display" id="player-percent">0%</div>
            <div class="stock-pills" id="player-stocks">
              <div class="stock-pill"></div>
              <div class="stock-pill"></div>
              <div class="stock-pill"></div>
            </div>
          </div>
        </div>

        <!-- Dummy / Opponent Card -->
        <div class="fighter-card dummy-card" id="dummy-card">
          <div class="card-avatar-wrap">
            <img id="dummy-avatar" src="assets/pokemon/1/Idle.png" alt="Bulbasaur">
          </div>
          <div class="card-info">
            <div class="fighter-name" id="dummy-name">BULBASAUR (CPU)</div>
            <div class="percent-display" id="dummy-percent">0%</div>
            <span class="dummy-badge" id="dummy-mode-badge" style="display: none;">DUMMY EN ENTRENAMIENTO</span>
            <div class="stock-pills" id="dummy-stocks">
              <div class="stock-pill stock-pill-cpu"></div>
              <div class="stock-pill stock-pill-cpu"></div>
              <div class="stock-pill stock-pill-cpu"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Training Deck & Controls -->
    <section class="training-deck battle-mode">
      <!-- Left: Dummy Options (Active in Training Mode) -->
      <div class="deck-column training-only">
        <div class="deck-section-title">
          🎯 Opciones de Entrenamiento
        </div>
        <div class="deck-buttons-row">
          <button class="btn-deck active" data-dummy-mode="STAND">Quieto (Stand)</button>
          <button class="btn-deck" data-dummy-mode="JUMP">Saltar (Jump)</button>
          <button class="btn-deck" data-dummy-mode="CROUCH">Agachado</button>
          <button class="btn-deck" data-dummy-mode="CPU_EASY">CPU Fácil</button>
          <button class="btn-deck" data-dummy-mode="CPU_BATTLE">CPU Batalla</button>
        </div>

        <div class="deck-section-title" style="margin-top: 14px;">
          ⚡ Ajustar Daño % del Dummy
        </div>
        <div class="deck-buttons-row">
          <button class="btn-deck" data-preset-percent="0">0%</button>
          <button class="btn-deck" data-preset-percent="50">50%</button>
          <button class="btn-deck" data-preset-percent="100">100%</button>
          <button class="btn-deck" data-preset-percent="150">150%</button>
          <button class="btn-deck danger" id="btn-reset-dummy" title="Atajo: Tecla R">
            🔄 Resetear Dummy [R]
          </button>
        </div>
        <div class="slider-group">
          <input type="range" min="0" max="250" value="0" class="custom-range" id="dummy-percent-slider">
          <span class="slider-val-tag" id="dummy-slider-val">0%</span>
        </div>
      </div>

      <!-- Right: Direct Character Selector & Match Launch -->
      <div class="deck-column">
        <div class="deck-section-title">
          🎮 Selección Directa de Personajes
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="font-size: 12px; color: var(--text-muted);">Jugador 1:</div>
          <button type="button" id="deck-p1-control-toggle" class="btn-deck" style="padding: 3px 8px; font-size: 11px; border-radius: 6px; border: 1px solid var(--border-color);">
            🎮 P1: Humano
          </button>
        </div>
        <div class="deck-buttons-row roster-select-row" id="p1-quick-select" style="margin-bottom: 12px;">
          <button class="btn-deck roster-btn active" data-p1-dex="25">⚡ Pikachu</button>
          <button class="btn-deck roster-btn" data-p1-dex="1">🌿 Bulbasaur</button>
          <button class="btn-deck roster-btn" data-p1-dex="312">🔋 Minun/Plusle</button>
          <button class="btn-deck roster-btn" data-p1-dex="94">👻 Gengar</button>
        </div>

        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">CPU / Rival:</div>
        <div class="deck-buttons-row roster-select-row" id="dummy-quick-select" style="margin-bottom: 14px;">
          <button class="btn-deck roster-btn" data-dummy-dex="25">⚡ Pikachu</button>
          <button class="btn-deck roster-btn active" data-dummy-dex="1">🌿 Bulbasaur</button>
          <button class="btn-deck roster-btn" data-dummy-dex="312">🔋 Minun/Plusle</button>
          <button class="btn-deck roster-btn" data-dummy-dex="94">👻 Gengar</button>
        </div>

        <div class="deck-buttons-row">
          <button class="btn-deck highlight" onclick="document.getElementById('match-setup-modal').classList.add('open')">
            ⚔️ Abrir Menú Completo de Partida / Dificultad
          </button>
        </div>
      </div>
    </section>

    <!-- Controls Guide Table -->
    <section class="controls-card">
      <div class="deck-section-title">
        🕹️ Guía de Controles
      </div>

      <div class="controls-grid">
        <div class="control-item">
          <div class="key-badge">⬅️ ➡️</div>
          <div class="control-desc">
            <span class="control-title">Moverse Horizontalmente</span>
            <span class="control-sub">Camina y corre por la plataforma o en el aire.</span>
          </div>
        </div>

        <div class="control-item">
          <div class="key-badge">Espacio</div>
          <div class="control-desc">
            <span class="control-title">Salto Variable (Corto / Alto)</span>
            <span class="control-sub">Pulsación rápida = Salto corto (Short Hop). Mantener pulsado = Salto a distancia máxima (Full Hop). Doble salto en el aire.</span>
          </div>
        </div>

        <div class="control-item">
          <div class="key-badge">⬇️⬇️ Abajo x2</div>
          <div class="control-desc">
            <span class="control-title">Bajar de Plataforma / Caída Rápida</span>
            <span class="control-sub">Pulsa Abajo dos veces rápido para bajar de plataformas semi-sólidas (la IA también lo usa). Abajo en el aire para caída rápida.</span>
          </div>
        </div>

        <div class="control-item">
          <div class="key-badge">Z</div>
          <div class="control-desc">
            <span class="control-title">Golpes Básicos (Suelo & Aire)</span>
            <span class="control-sub">Z solo (Jab / Nair), ⬅️/➡️ + Z (Lateral / Fair), ⬆️ + Z (Ascendente / Uair), ⬇️ + Z (Barrido / Dair Spike). Todos cuerpo a cuerpo con animaciones.</span>
          </div>
        </div>

        <div class="control-item">
          <div class="key-badge">X</div>
          <div class="control-desc">
            <span class="control-title">Movimiento Especial (4 Movimientos Distintos)</span>
            <span class="control-sub">X solo (Neutral radial en 360°), ⬅️/➡️ + X (Lateral), ⬆️ + X (Recuperación aérea vertical), ⬇️ + X (Ataque especial hacia abajo).</span>
          </div>
        </div>

        <div class="control-item">
          <div class="key-badge">C</div>
          <div class="control-desc">
            <span class="control-title">Escudo</span>
            <span class="control-sub">Mantén C para bloquear. El escudo se desgasta y, si se rompe, quedas aturdido.</span>
          </div>
        </div>

        <div class="control-item">
          <div class="key-badge">R / M</div>
          <div class="control-desc">
            <span class="control-title">Atajos de Teclado</span>
            <span class="control-sub"><strong>[R]</strong>: Resetear dummy a posición inicial. <strong>[M]</strong>: Música ON/OFF.</span>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- Match Setup & Character Selection Modal (Default Open on Load) -->
  <div id="match-setup-modal" class="modal-overlay open">
    <div class="modal-content setup-modal-content">
      <div class="modal-header">
        <h2 style="font-size: 22px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
          ⚔️ Configuración de Partida y Selección de Pokémon
        </h2>
        <button class="modal-close" id="btn-close-setup-modal">✕</button>
      </div>

      <!-- Mode Selection Tabs -->
      <div class="setup-section">
        <label class="setup-label">1. Elige el Modo de Juego</label>
        <div class="mode-select-grid">
          <div class="mode-card active" data-mode="BATTLE">
            <div class="mode-icon">🥊</div>
            <div class="mode-title">Partida Versus</div>
            <div class="mode-desc">Combate a 3 Vidas. Gana quien conserve vidas al final.</div>
            <span class="mode-badge">3 Vidas</span>
          </div>
          <div class="mode-card" data-mode="TRAINING">
            <div class="mode-icon">🎯</div>
            <div class="mode-title">Modo Entrenamiento</div>
            <div class="mode-desc">Vidas infinitas, dummy personalizable, combo counter y slider.</div>
            <span class="mode-badge">Práctica Libre</span>
          </div>
        </div>
      </div>

      <!-- Stage Selection Section -->
      <div class="setup-section">
        <label class="setup-label">2. Elige el Escenario de Combate</label>
        <div class="stage-select-grid">
          <?php foreach ($stages as $sId => $st): ?>
            <div class="stage-card <?= $sId === 'BATTLEFIELD' ? 'active' : '' ?>" data-stage="<?= $sId ?>">
              <div class="stage-icon"><?= $st['icon'] ?></div>
              <div class="stage-info">
                <div class="stage-title"><?= $st['name'] ?></div>
                <div class="stage-badge"><?= $st['badge'] ?></div>
                <div class="stage-desc"><?= $st['desc'] ?></div>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>

      <!-- Fighter Selection Columns -->
      <div class="fighters-select-container">
        <!-- Player 1 Roster -->
        <div class="roster-column">
          <label class="setup-label">3. Tu Pokémon (Jugador 1)</label>

          <!-- Control de Jugador 1: Humano o CPU -->
          <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">
            Control de Jugador 1:
          </div>
          <div class="deck-buttons-row" style="margin-bottom: 10px; display: flex; gap: 8px;">
            <button type="button" class="btn-deck p1-control-toggle-btn active" data-p1-control="HUMAN" style="flex: 1; padding: 7px 10px; font-weight: 700; font-size: 12px; border-radius: 8px;">
              🎮 Humano (Tú)
            </button>
            <button type="button" class="btn-deck p1-control-toggle-btn" data-p1-control="CPU" style="flex: 1; padding: 7px 10px; font-weight: 700; font-size: 12px; border-radius: 8px;">
              🤖 CPU (Auto)
            </button>
          </div>

          <!-- Selector de Nivel de CPU para J1 si es CPU -->
          <div id="p1-cpu-diff-container" style="display: none; margin-bottom: 12px; background: rgba(15,23,42,0.5); padding: 8px 10px; border-radius: 8px; border: 1px dashed rgba(255,255,255,0.12);">
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">Nivel de la CPU J1:</div>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="diff-btn p1-level-btn" data-p1-cpu-level="1" style="flex: 1; padding: 6px; font-size: 11px; font-weight: 700; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-surface); color: #fff; cursor: pointer;">Nv. 1</button>
              <button type="button" class="diff-btn p1-level-btn active" data-p1-cpu-level="2" style="flex: 1; padding: 6px; font-size: 11px; font-weight: 700; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-surface); color: #fff; cursor: pointer;">Nv. 2</button>
              <button type="button" class="diff-btn p1-level-btn" data-p1-cpu-level="3" style="flex: 1; padding: 6px; font-size: 11px; font-weight: 700; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-surface); color: #fff; cursor: pointer;">Nv. 3</button>
            </div>
          </div>

          <div class="roster-grid" id="p1-modal-roster">
            <div class="roster-card active" data-roster-p1="25">
              <div class="roster-card-avatar" data-avatar-dex="25"></div>
              <div class="roster-card-name">Pikachu</div>
              <div class="roster-card-type" style="color: #facc15;">Eléctrico</div>
            </div>
            <div class="roster-card" data-roster-p1="1">
              <div class="roster-card-avatar" data-avatar-dex="1"></div>
              <div class="roster-card-name">Bulbasaur</div>
              <div class="roster-card-type" style="color: #10b981;">Planta / Veneno</div>
            </div>
            <div class="roster-card" data-roster-p1="312">
              <div class="roster-card-avatar" data-avatar-dex="312" data-partner-dex="311"></div>
              <div class="roster-card-name">Minun y Plusle</div>
              <div class="roster-card-type" style="color: #38bdf8;">Eléctrico (Dúo)</div>
            </div>
            <div class="roster-card" data-roster-p1="94">
              <div class="roster-card-avatar" data-avatar-dex="94"></div>
              <div class="roster-card-name">Gengar</div>
              <div class="roster-card-type" style="color: #a855f7;">Fantasma / Veneno</div>
            </div>
          </div>
        </div>

        <!-- CPU Roster -->
        <div class="roster-column">
          <label class="setup-label">Pokémon de la CPU (Rival)</label>
          <div class="roster-grid" id="cpu-modal-roster">
            <div class="roster-card" data-roster-cpu="25">
              <div class="roster-card-avatar" data-avatar-dex="25"></div>
              <div class="roster-card-name">Pikachu</div>
              <div class="roster-card-type" style="color: #facc15;">Eléctrico</div>
            </div>
            <div class="roster-card active" data-roster-cpu="1">
              <div class="roster-card-avatar" data-avatar-dex="1"></div>
              <div class="roster-card-name">Bulbasaur</div>
              <div class="roster-card-type" style="color: #10b981;">Planta / Veneno</div>
            </div>
            <div class="roster-card" data-roster-cpu="312">
              <div class="roster-card-avatar" data-avatar-dex="312" data-partner-dex="311"></div>
              <div class="roster-card-name">Minun y Plusle</div>
              <div class="roster-card-type" style="color: #38bdf8;">Eléctrico (Dúo)</div>
            </div>
            <div class="roster-card" data-roster-cpu="94">
              <div class="roster-card-avatar" data-avatar-dex="94"></div>
              <div class="roster-card-name">Gengar</div>
              <div class="roster-card-type" style="color: #a855f7;">Fantasma / Veneno</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Held Items Selection Section -->
      <div class="setup-section">
        <label class="setup-label">4. Equipar Objetos de Pokémon (Held Items)</label>
        <div class="items-columns-container">
          <!-- P1 Items -->
          <div class="item-player-column">
            <div class="item-column-header">🎒 Objeto Jugador 1:</div>
            <div class="items-grid" id="p1-items-grid">
              <?php foreach ($pokemon_items as $iId => $it): ?>
                <div class="item-choice-card <?= $iId === 'none' ? 'active' : '' ?>" data-p1-item="<?= $iId ?>" title="<?= htmlspecialchars($it['desc']) ?>">
                  <?php if ($it['icon']): ?>
                    <img src="<?= $it['icon'] ?>" alt="<?= $it['name'] ?>" class="item-icon-img">
                  <?php else: ?>
                    <span class="item-icon-none">🚫</span>
                  <?php endif; ?>
                  <div class="item-text-wrap">
                    <div class="item-name"><?= $it['name'] ?></div>
                    <div class="item-tag"><?= $it['tag'] ?></div>
                  </div>
                </div>
              <?php endforeach; ?>
            </div>
          </div>

          <!-- CPU Items -->
          <div class="item-player-column">
            <div class="item-column-header">🎒 Objeto CPU (Rival):</div>
            <div class="items-grid" id="cpu-items-grid">
              <?php foreach ($pokemon_items as $iId => $it): ?>
                <div class="item-choice-card <?= $iId === 'none' ? 'active' : '' ?>" data-cpu-item="<?= $iId ?>" title="<?= htmlspecialchars($it['desc']) ?>">
                  <?php if ($it['icon']): ?>
                    <img src="<?= $it['icon'] ?>" alt="<?= $it['name'] ?>" class="item-icon-img">
                  <?php else: ?>
                    <span class="item-icon-none">🚫</span>
                  <?php endif; ?>
                  <div class="item-text-wrap">
                    <div class="item-name"><?= $it['name'] ?></div>
                    <div class="item-tag"><?= $it['tag'] ?></div>
                  </div>
                </div>
              <?php endforeach; ?>
            </div>
          </div>
        </div>
      </div>

      <!-- CPU Difficulty -->
      <div class="setup-section" id="cpu-diff-section">
        <label class="setup-label">5. Nivel de la CPU</label>
        <div class="diff-select-row">
          <div class="diff-card" data-cpu-level="1">
            <span class="diff-badge green">NIVEL 1</span>
            <div class="diff-title">Principiante</div>
            <div class="diff-desc">Ataques básicos y recuperación inteligente hacia el escenario.</div>
          </div>
          <div class="diff-card active" data-cpu-level="2">
            <span class="diff-badge yellow">NIVEL 2</span>
            <div class="diff-title">Intermedio</div>
            <div class="diff-desc">Combos, uso de escudo frente a ataques y recuperación ágil.</div>
          </div>
          <div class="diff-card" data-cpu-level="3">
            <span class="diff-badge red">NIVEL 3</span>
            <div class="diff-title">Experto Smash</div>
            <div class="diff-desc">Bloqueo de proyectiles, castigos rápidos, edge-guarding y spike.</div>
          </div>
        </div>
      </div>

      <!-- Start Button -->
      <div class="setup-footer">
        <button id="btn-start-configured-match" class="btn-start-match">
          🔥 ¡A LUCHAR! COMENZAR
        </button>
      </div>
    </div>
  </div>

  <!-- Settings Modal (Volume, Keybinds, Graphics & Fullscreen) -->
  <div id="settings-modal" class="modal-overlay">
    <div class="modal-content settings-modal-content">
      <div class="modal-header">
        <h2 style="font-size: 22px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
          ⚙️ Ajustes del Juego
        </h2>
        <button class="modal-close" id="btn-close-settings-modal">✕</button>
      </div>

      <!-- Audio Section -->
      <div class="settings-section">
        <div class="settings-section-title">🔊 Control de Volumen y Audio</div>
        <div class="settings-slider-row">
          <span class="settings-label">Volumen Principal:</span>
          <input type="range" id="setting-master-vol" min="0" max="1" step="0.05" value="0.8" class="custom-range">
          <span id="val-master-vol" class="settings-val">80%</span>
        </div>
        <div class="settings-slider-row">
          <span class="settings-label">Música (Chiptune):</span>
          <input type="range" id="setting-music-vol" min="0" max="1" step="0.05" value="0.25" class="custom-range">
          <span id="val-music-vol" class="settings-val">25%</span>
        </div>
        <div class="settings-slider-row">
          <span class="settings-label">Efectos de Sonido (SFX):</span>
          <input type="range" id="setting-sfx-vol" min="0" max="1" step="0.05" value="0.7" class="custom-range">
          <span id="val-sfx-vol" class="settings-val">70%</span>
        </div>
        <div class="settings-toggle-row">
          <label class="toggle-container">
            <input type="checkbox" id="setting-mute-toggle">
            <span class="toggle-label">🔇 Silenciar Todo (Mute)</span>
          </label>
        </div>
      </div>

      <!-- Graphics Quality Section -->
      <div class="settings-section">
        <div class="settings-section-title">🎨 Presets Gráficos</div>
        <div class="deck-buttons-row">
          <button class="btn-deck active" data-graphics-preset="ultra">
            🌟 Ultra (Efectos Completos + Luces + 60fps)
          </button>
          <button class="btn-deck" data-graphics-preset="high">
            ✨ Alto (Efectos Estándar)
          </button>
          <button class="btn-deck" data-graphics-preset="low">
            ⚡ Bajo (Rendimiento Máximo)
          </button>
        </div>
      </div>

      <!-- Keybinds Section -->
      <div class="settings-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div class="settings-section-title" style="margin-bottom: 0;">⌨️ Configuración de Teclas (Keybinds)</div>
          <button id="btn-reset-keybinds" class="btn-deck" style="padding: 4px 10px; font-size: 11px;">
            🔄 Restablecer por Defecto
          </button>
        </div>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">
          Haz clic en cualquier botón de tecla y pulsa la tecla deseada de tu teclado para reasignarla:
        </p>
        <table class="keybinds-table">
          <thead>
            <tr>
              <th>Acción</th>
              <th>Comando Smash</th>
              <th>Tecla Asignada</th>
            </tr>
          </thead>
          <tbody>
            <tr data-rebind-action="left">
              <td>Mover Izquierda</td>
              <td>Caminar / Correr Izquierda</td>
              <td><button class="keybind-code-btn">← Flecha Izq</button></td>
            </tr>
            <tr data-rebind-action="right">
              <td>Mover Derecha</td>
              <td>Caminar / Correr Derecha</td>
              <td><button class="keybind-code-btn">→ Flecha Der</button></td>
            </tr>
            <tr data-rebind-action="up">
              <td>Arriba</td>
              <td>Mirar / Apuntar Arriba</td>
              <td><button class="keybind-code-btn">↑ Flecha Arriba</button></td>
            </tr>
            <tr data-rebind-action="down">
              <td>Abajo / Caída Rápida</td>
              <td>Bajar plataforma (x2) / Agacharse</td>
              <td><button class="keybind-code-btn">↓ Flecha Abajo</button></td>
            </tr>
            <tr data-rebind-action="jump">
              <td>Salto Variable</td>
              <td>Salto Corto / Salto Alto / Doble Salto</td>
              <td><button class="keybind-code-btn">Espacio</button></td>
            </tr>
            <tr data-rebind-action="attack">
              <td>Ataque Básico (Z)</td>
              <td>Jab, Tilts, Aéreos, Meteor Spike</td>
              <td><button class="keybind-code-btn">Z</button></td>
            </tr>
            <tr data-rebind-action="special">
              <td>Movimiento Especial (X)</td>
              <td>Proyectiles, Stun, Recuperación, Tóxico</td>
              <td><button class="keybind-code-btn">X</button></td>
            </tr>
            <tr data-rebind-action="shield">
              <td>Escudo (C)</td>
              <td>Bloquear impactos y proyectiles</td>
              <td><button class="keybind-code-btn">C</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Fullscreen Action Section -->
      <div class="settings-section">
        <div class="settings-section-title">📺 Pantalla Completa</div>
        <button id="btn-fullscreen-toggle" class="btn-start-match" style="padding: 10px 20px; font-size: 14px;">
          ⛶ Alternar Pantalla Completa de la Arena [Ctrl+F]
        </button>
      </div>
    </div>
  </div>

  <!-- Victory / Game Over Modal -->
  <div id="victory-modal" class="modal-overlay">
    <div class="modal-content victory-modal-content">
      <div class="victory-header">
        <div id="victory-icon" class="victory-icon">🏆</div>
        <h2 id="victory-title" class="victory-title">¡VICTORIA!</h2>
        <p id="victory-subtitle" class="victory-subtitle">Has derrotado al rival en el combate.</p>
      </div>

      <div class="victory-stats-card">
        <div class="victory-stat-item">
          <span class="stat-label">Ganador:</span>
          <span id="victory-winner-name" class="stat-val" style="color: #38bdf8;">PIKACHU</span>
        </div>
        <div class="victory-stat-item">
          <span class="stat-label">Vidas Restantes:</span>
          <span id="victory-stocks-val" class="stat-val">3 vs 0</span>
        </div>
        <div class="victory-stat-item">
          <span class="stat-label">Mayor Combo:</span>
          <span id="victory-combo-val" class="stat-val">4 Golpes</span>
        </div>
        <div class="victory-stat-item">
          <span class="stat-label">Daño Total:</span>
          <span id="victory-damage-val" class="stat-val">124%</span>
        </div>
      </div>

      <div class="victory-actions">
        <button id="btn-victory-rematch" class="btn-start-match" style="width: auto; padding: 12px 28px;">
          🔁 Revancha
        </button>
        <button id="btn-victory-menu" class="btn-header" style="padding: 12px 24px; font-size: 15px;">
          🎮 Menú de Partida
        </button>
      </div>
    </div>
  </div>

  <!-- Moveset & Mechanics Modal -->
  <div id="moves-modal" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2 style="font-size: 20px; font-weight: 800;">📖 Guía de Combate, Objetos y Estados</h2>
        <button class="modal-close" onclick="document.getElementById('moves-modal').classList.remove('open')">✕</button>
      </div>

      <!-- Section: Status System -->
      <div style="margin-bottom: 24px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 14px 18px;">
        <h3 style="color: #c084fc; font-size: 16px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
          ☠️ Nuevo Sistema de Estados: VENENO (Poison)
        </h3>
        <p style="font-size: 13px; color: #e2e8f0; line-height: 1.5;">
          <strong>Veneno</strong> es el primer estado alterado de PokéFighters, aplicado por el movimiento <em>Tóxico AOE</em> (⬇️ + X) de Gengar.
          <br>• <strong>Duración:</strong> 5.0 segundos continuos.
          <br>• <strong>Frecuencia:</strong> Hace daño cada <strong>1.7 segundos</strong> de su duración.
          <br>• <strong>Fórmula de Daño:</strong> Aumenta el <strong>% ACTUAL</strong> que tenga el enemigo un <strong>2%</strong> (mínimo 1%). Cuanto más dañado esté el rival, mayor es el veneno.
        </p>
      </div>

      <!-- Section: Held Items -->
      <div style="margin-bottom: 24px;">
        <h3 style="color: #38bdf8; font-size: 17px; margin-bottom: 8px;">
          🎒 Objetos Equipables de Pokémon (Held Items)
        </h3>
        <table class="moves-table">
          <thead>
            <tr>
              <th>Objeto</th>
              <th>Efecto de Combate</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($pokemon_items as $iId => $it): ?>
              <tr>
                <td style="font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
                  <?php if ($it['icon']): ?>
                    <img src="<?= $it['icon'] ?>" alt="" style="width: 22px; height: 22px; image-rendering: pixelated;">
                  <?php endif; ?>
                  <?= $it['name'] ?>
                </td>
                <td style="color: #cbd5e1;"><?= $it['desc'] ?></td>
                <td><span class="key-badge" style="font-size: 11px;"><?= $it['tag'] ?></span></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>

      <!-- Section: Pokemon Movesets -->
      <?php foreach ($fighters as $dex => $f): ?>
        <div style="margin-bottom: 24px;">
          <h3 style="color: <?= $f['type_color'] ?>; font-size: 17px; margin-bottom: 4px;">
            <?= $f['name'] ?> <span style="font-size: 13px; color: #94a3b8;">(Tipo: <?= $f['type'] ?>)</span>
          </h3>
          <p style="font-size: 13px; color: #cbd5e1; margin-bottom: 12px;"><?= $f['desc'] ?></p>

          <table class="moves-table">
            <thead>
              <tr>
                <th>Comando</th>
                <th>Movimiento</th>
                <th>Daño</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($f['moves_z'] as $dir => $m): ?>
                <tr>
                  <td><span class="key-badge" style="font-size: 11px;">Z</span> <?= $dir ?></td>
                  <td style="font-weight: 700; color: #fff;"><?= $m['name'] ?></td>
                  <td style="color: #fde047; font-weight: 700;"><?= $m['damage'] ?></td>
                  <td style="color: #94a3b8;"><?= $m['desc'] ?></td>
                </tr>
              <?php endforeach; ?>
              <?php foreach ($f['moves_x'] as $dir => $m): ?>
                <tr>
                  <td><span class="key-badge" style="font-size: 11px; color: #f43f5e;">X</span> <?= $dir ?></td>
                  <td style="font-weight: 700; color: #38bdf8;"><?= $m['name'] ?></td>
                  <td style="color: #fde047; font-weight: 700;"><?= $m['damage'] ?></td>
                  <td style="color: #94a3b8;"><?= $m['desc'] ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php endforeach; ?>
    </div>
  </div>

  <!-- Scripts in dependency order with cache-busting -->
  <?php $v = time(); ?>
  <script src="js/data/sprite-meta.js?v=<?= $v ?>"></script>
  <script src="js/data/items.js?v=<?= $v ?>"></script>
  <script src="js/engine/audio.js?v=<?= $v ?>"></script>
  <script src="js/engine/sprites.js?v=<?= $v ?>"></script>
  <script src="js/engine/physics.js?v=<?= $v ?>"></script>
  <script src="js/engine/particles.js?v=<?= $v ?>"></script>
  <script src="js/engine/stage.js?v=<?= $v ?>"></script>
  <script src="js/engine/dummy.js?v=<?= $v ?>"></script>
  <script src="js/fighters/fighter.js?v=<?= $v ?>"></script>
  <script src="js/fighters/pikachu.js?v=<?= $v ?>"></script>
  <script src="js/fighters/bulbasaur.js?v=<?= $v ?>"></script>
  <script src="js/fighters/minun_plusle.js?v=<?= $v ?>"></script>
  <script src="js/fighters/gengar.js?v=<?= $v ?>"></script>
  <script src="js/ui/hud.js?v=<?= $v ?>"></script>
  <script src="js/game.js?v=<?= $v ?>"></script>

</body>
</html>
