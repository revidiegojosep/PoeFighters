<?php
// PokeFighters - Super Smash Bros Pokemon Edition
// Backend Configuration, Roster, Stages & Items
$fighters = [
    25 => [
        'name' => 'Pikachu',
        'dex' => 25,
        'type' => 'Eléctrico',
        'type_color' => '#facc15',
        'weight' => '6.0 kg',
        'weight_category' => 'Ligero',
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
        'weight' => '6.9 kg',
        'weight_category' => 'Medio',
        'desc' => 'Luchador resistente con látigos cepa de largo alcance en todos sus ataques Z, drenaje con Absorber, ráfagas de Hojas Navaja dinámicas en carrera y semillas explosivas.',
        'moves_z' => [
            'Neutral' => ['name' => 'Látigo Cepa Rápido (Suelo) / Espiral Follaje (Aire)', 'damage' => '5% / 7%', 'desc' => 'Rango ampliado con efectos orgánicos de látigo cepa que azotan a gran distancia tanto en tierra como en aire.'],
            'Lateral (⬅️/➡️)' => ['name' => 'Látigo Cepa Frontal (Suelo) / Látigo Aéreo (Aire)', 'damage' => '10% / 8%', 'desc' => 'Zarpazo de látigo con rango ampliado que propina un fuerte azote horizontal hacia adelante.'],
            'Arriba (⬆️)' => ['name' => 'Látigo Superior (Suelo) / Látigo Aéreo Elevado (Aire)', 'damage' => '8% / 9%', 'desc' => 'Látigos cuerpo a cuerpo con arco extendido hacia arriba para iniciar y continuar combos aéreos.'],
            'Abajo (⬇️)' => ['name' => 'Barrido Cepa (Suelo) / Látigo Meteoro (Aire)', 'damage' => '7% / 11%', 'desc' => 'En el suelo barrido bajo de largo alcance; en el aire clava al rival abajo (Meteor Spike).']
        ],
        'moves_x' => [
            'Neutral (Sin dirección)' => ['name' => 'Absorber (Cura 3% Daño)', 'damage' => '9% (-3% Daño)', 'desc' => 'Vórtice botánico de absorción: daña al rival y reduce el contador de daño de Bulbasaur en un 3% al conectar.'],
            'Lateral (⬅️/➡️)' => ['name' => 'Hojas Navaja (Dinámico)', 'damage' => '3x 5%', 'desc' => 'Ráfaga de 3 hojas con knockback +20% y lag de 0.4s. El spread en abanico SOLO se hace si se ejecuta ANDANDO. En cambio, si se hace CORRIENDO aumenta la velocidad un 20% (9.36) pero NO tiene spread (ráfaga recta concentrada).'],
            'Arriba (⬆️)' => ['name' => 'Látigo Impulso', 'damage' => '11%', 'desc' => 'Lanza látigos hacia arriba impulsando a Bulbasaur de vuelta al escenario.'],
            'Abajo (⬇️)' => ['name' => 'Bomba Germen (Mantener para Impulsar)', 'damage' => '11% - 21%', 'desc' => 'Dispara una semilla parabólica explosiva. Mantener X permite empujarla a mucha más distancia lateralmente.']
        ]
    ],
    312 => [
        'name' => 'Minun y Plusle',
        'dex' => 312,
        'type' => 'Eléctrico (Dúo)',
        'type_color' => '#38bdf8',
        'weight' => '4.2 kg (Dúo)',
        'desc' => 'Dúo de roedores coordinados estilo Ice Climbers. Minun (-) lidera y Plusle (+) asiste en tándem. ¡Si Minun muere, mueren ambos de inmediato! Si Plusle muere, reaparece a los 10 segundos. Plusle salta exactamente 0.4 segundos después de Minun (en tierra y aire), pero NO por su propia cuenta. Refuerzo (⬇️+X) aumenta el daño un 10% durante 5s y teletransporta a Plusle junto a Minun si está cerca.',
        'moves_z' => [
            'Neutral' => ['name' => 'Chispa Jab (Suelo) / Giro Bipolar (Aire)', 'damage' => '4.2% (+3.4% Tándem)', 'desc' => 'Puñetazos rápidos cuerpo a cuerpo a corta distancia. En el aire giran en doble vórtice.'],
            'Lateral (⬅️/➡️)' => ['name' => 'Coletazo Polar (Suelo) / Zarpazo Aéreo (Aire)', 'damage' => '6.8% (+5.1% Tándem)', 'desc' => 'Zarpazo físico cuerpo a cuerpo con estela de chispas y gran impacto horizontal.'],
            'Arriba (⬆️)' => ['name' => 'Patada Voltereta (Suelo) / Patada Aérea (Aire)', 'damage' => '6.0% (+4.2% Tándem)', 'desc' => 'Voltereta ascendente cuerpo a cuerpo que eleva al rival para iniciar combos aéreos.'],
            'Abajo (⬇️)' => ['name' => 'Barrido Bajo (Suelo) / Pisotón Doble Meteoro (Aire)', 'damage' => '5.1% / 8.5% (Spike)', 'desc' => 'En el suelo barrido bajo a ras de suelo; en el aire clavan al rival con doble pisotón meteoro descendente (Spike).']
        ],
        'moves_x' => [
            'Neutral (Sin dirección)' => ['name' => 'Chispazo Doble (+ y -)', 'damage' => '2x 6.0%', 'desc' => 'Minun y Plusle disparan simultáneamente 2 esferas de plasma entrelazadas en doble hélice con tamaño optimizado.'],
            'Lateral (⬅️/➡️)' => ['name' => 'Placaje Magnético Dúo', 'damage' => '9.3%', 'desc' => 'Embestida coordinada con estela de relámpagos, disparando 2 proyectiles de choque frontales (CD aumentado a 1.10s).'],
            'Arriba (⬆️)' => ['name' => 'Impulso Magnético (Belay)', 'damage' => '6.8%', 'desc' => 'Recuperación Ice Climbers: un rayo polar conecta al dúo; Plusle impulsa a Minun al cielo y ambos disparan chispas.'],
            'Abajo (⬇️)' => ['name' => 'Refuerzo (Helping Hand)', 'damage' => '+10% DMG (5s)', 'desc' => 'Coordinación y ánimo que aumenta todo el daño un 10% durante 5 segundos y teletransporta instantáneamente a Plusle junto a Minun si está cerca. NO se acumula y requiere que Minun esté presente en el combate.']
        ]
    ],
    94 => [
        'name' => 'Gengar',
        'dex' => 94,
        'type' => 'Fantasma / Veneno',
        'type_color' => '#a855f7',
        'weight' => '40.5 kg',
        'weight_category' => 'Pesado · Floaty (-30% Salto)',
        'desc' => 'Pokémon Fantasma escurridizo con físicas "Floaty" (gravedad reducida a 0.60x, caída lenta y salto reducido un 30% a 10.15). Carga y almacena Bola Sombra buffeada (Neutral X), lanza rivales al cielo con Puño Sombra vertical (Side X), aturde con Lenguetazo e intoxica con Tóxico AOE.',
        'moves_z' => [
            'Neutral' => ['name' => 'Garra Umbría (Suelo) / Giro Espectral (Aire)', 'damage' => '5% / 7%', 'desc' => 'Zarpazo sombrío frontal rápido. En el aire gira su cuerpo espectral en 360°.'],
            'Lateral (⬅️/➡️)' => ['name' => 'Lenguetazo (Suelo / Stun 0.3s) / Puño Fantasma (Aire)', 'damage' => '7% / 8%', 'desc' => 'En el suelo saca una larga lengua que inmoviliza 0.3s; en el aire lanza un potente puñetazo espectral.'],
            'Arriba (⬆️)' => ['name' => 'Gancho Sombra (Suelo) / Garra Astral (Aire)', 'damage' => '8% / 9%', 'desc' => 'Zarpazo sombrío hacia arriba que eleva al rival para combos aéreos.'],
            'Abajo (⬇️)' => ['name' => 'Barrido Espectral (Suelo) / Pesadilla Meteoro (Aire)', 'damage' => '6% / 11% (Spike)', 'desc' => 'En el suelo barre las piernas; en el aire desciende en picado empotrando al rival contra el abismo (Meteor Spike).']
        ],
        'moves_x' => [
            'Neutral (Sin dirección)' => ['name' => 'Bola Sombra (Carga 2s / CD 1s / Lag 0.4s)', 'damage' => '10.8% - 14.0% (+30%)', 'desc' => 'Mantén X hasta 2s (+20% daño base y carga). Se lanza al soltar. Al alcanzar el máximo, pulsa ⬅️/➡️ para guardarla con aura espectral (se dispara al instante pulsando X; expira en 8s). Enfriamiento (CD) de 1.0 segundo y lag aumentado en 0.4 segundos antes de poder empezar a moverse tras lanzar.'],
            'Lateral (⬅️/➡️)' => ['name' => 'Puño Sombra (Lanzamiento Vertical ⬆️ / -30% KB)', 'damage' => '11%', 'desc' => 'Lunge frontal con puñetazo espectral. ¡Siempre lanza al rival hacia arriba (88°) con knockback ajustado un -30% para encadenar combos aéreos!'],
            'Arriba (⬆️)' => ['name' => 'Teletransportación Espectral', 'damage' => 'Recuperación', 'desc' => 'Se desvanece en las sombras y reaparece instantáneamente a enorme distancia en el aire con una explosión sombría.'],
            'Abajo (⬇️)' => ['name' => 'Tóxico AOE (Estado: Veneno 5s)', 'damage' => '6% (+ Veneno)', 'desc' => 'Expulsa una densa nube de miasma venenoso en área. Aplica el estado VENENO durante 5.0 segundos (daño continuado equivalente al 3% del daño acumulado actual del rival).']
        ]
    ],
    39 => [
        'name' => 'Jigglypuff',
        'dex' => 39,
        'type' => 'Normal / Hada',
        'type_color' => '#f472b6',
        'weight' => '5.5 kg',
        'weight_category' => 'Floaty Ultraligero (5 Saltos Aéreos)',
        'desc' => 'El icónico Pokémon Globo de Smash Bros. Personaje ultra floaty con 5 saltos en el aire, gran movilidad aérea y el letal combo Wall of Pain. Sus ataques especiales incluyen Desenrollar (Neutral X), Destructor con daño masivo a escudos (Side X), Canto somnífero (Up X) y el legendario Descanso (Down X) que noquea instantáneamente.',
        'moves_z' => [
            'Neutral' => ['name' => 'Bofetón Doble (Suelo) / Giro Aéreo Nair (Aire)', 'damage' => '4% / 9%', 'desc' => 'Bofetadas rápidas en tierra. En el aire ejecuta un golpe de cuerpo giratorio con hitbox persistente duradera.'],
            'Lateral (⬅️/➡️)' => ['name' => 'Patada Frontal (Suelo) / Fair Wall of Pain (Aire)', 'damage' => '8% / 11%', 'desc' => 'Patada horizontal en tierra; patada aérea frontal para empujar al rival repetidamente fuera del escenario (Wall of Pain).'],
            'Arriba (⬆️)' => ['name' => 'Patada Hada (Suelo) / Voltereta Uair (Aire)', 'damage' => '7% / 9%', 'desc' => 'Patada curva ascendente que eleva al rival al aire para iniciar y continuar malabares aéreos.'],
            'Abajo (⬇️)' => ['name' => 'Pisar Suelo (Suelo) / Taladro Dair (Aire)', 'damage' => '6% / 12%', 'desc' => 'En el suelo pisa los pies; en el aire gira los pies en un rápido taladro multihit que atrapa y arrastra al oponente.']
        ],
        'moves_x' => [
            'Neutral (Sin dirección)' => ['name' => 'Desenrollar (Rollout)', 'damage' => '10% - 22%', 'desc' => 'Carga un giro rodante a toda velocidad por el suelo que atropella brutalmente con gran inercia y knockback.'],
            'Lateral (⬅️/➡️)' => ['name' => 'Destructor (Pound / Rompe-Escudos)', 'damage' => '13%', 'desc' => 'Potente bofetón volador hacia adelante (CD: 0.4s) que inflige un daño colosal de 55 a los escudos, ideal para romperlos de un solo golpe.'],
            'Arriba (⬆️)' => ['name' => 'Canto Somnífero (Sing / Up-B)', 'damage' => 'Estado: Sueño', 'desc' => 'Entona una dulce melodía en área (Lag: 0.4s / CD: 5.0s) que duerme a los oponentes cercanos dejándolos vulnerables.'],
            'Abajo (⬇️)' => ['name' => '¡Descanso! (Rest / Down-B)', 'damage' => '25% (Devastador)', 'desc' => 'Ataque de contacto directo milimétrico. Si conecta dentro del oponente, desata una explosión colosal con lanzamiento vertical letal y manda a Jigglypuff a dormir.']
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
    ],
    'LAVENDER_TOWER' => [
        'id' => 'LAVENDER_TOWER',
        'name' => 'Torre Pokémon de Pueblo Lavanda',
        'badge' => 'Lápidas Ancestrales & Niebla Espectral',
        'desc' => 'Escenario tétrico en tonos morados con niebla en movimiento, plataformas en forma de lápidas ancestrales y ojos fantasmales vigilantes.',
        'icon' => '👻'
    ]
];

$pokemon_item_categories = [
    'medicine' => [
        'id' => 'medicine',
        'name' => 'Medicina & Pociones',
        'icon' => '🧪',
        'badge' => 'Activo [1]',
        'desc' => 'Pociones curativas de uso activo en pleno combate (pulsa la tecla [1]).'
    ],
    'berries' => [
        'id' => 'berries',
        'name' => 'Bayas',
        'icon' => '🍒',
        'badge' => 'Auto-KO',
        'desc' => 'Bayas naturales que se activan automáticamente tras cumplir una condición de combate.'
    ],
    'combat' => [
        'id' => 'combat',
        'name' => 'Objetos de Combate',
        'icon' => '🥊',
        'badge' => 'Ofensivo',
        'desc' => 'Equipamiento competitivo que potencia el daño (+50%), knockback o velocidad de carrera.'
    ],
    'defense' => [
        'id' => 'defense',
        'name' => 'Defensa & Evasión',
        'icon' => '🛡️',
        'badge' => 'Defensivo',
        'desc' => 'Herramientas para mitigar daño, escapar con roll mejorado o resistir impactos letales.'
    ],
    'special' => [
        'id' => 'special',
        'name' => 'Objetos Especiales',
        'icon' => '✨',
        'badge' => 'Especial',
        'desc' => 'Objetos con propiedades únicas como flotabilidad aérea, sustento o sin objeto.'
    ]
];

$pokemon_items = [
    'none' => [
        'id' => 'none',
        'category' => 'special',
        'name' => 'Sin Objeto',
        'icon' => null,
        'tag' => 'Neutral',
        'desc' => 'Sin bonificaciones ni restricciones adicionales.'
    ],
    // Medicina & Pociones (Activos tecla [1])
    'potion' => [
        'id' => 'potion',
        'category' => 'medicine',
        'name' => 'Poción',
        'icon' => 'assets/items/potion.png',
        'tag' => 'Activo [1] (-20% Actual)',
        'desc' => 'Pulsa el botón [1] para consumir. Reduce un 20% de tu DAÑO ACUMULADO ACTUAL (ej. a 20% cura 4.0%). 3 cargas. Cooldown: 15s.'
    ],
    'super-potion' => [
        'id' => 'super-potion',
        'category' => 'medicine',
        'name' => 'SuperPoción',
        'icon' => 'assets/items/super-potion.png',
        'tag' => 'Activo [1] (-50% Actual)',
        'desc' => 'Pulsa el botón [1] para consumir. Reduce un 50% de tu DAÑO ACUMULADO ACTUAL (ej. a 50% cura 25.0%). 2 cargas. Cooldown: 40s.'
    ],
    'hyper-potion' => [
        'id' => 'hyper-potion',
        'category' => 'medicine',
        'name' => 'HiperPoción',
        'icon' => 'assets/items/hyper-potion.png',
        'tag' => 'Activo [1] (-100 Fijo)',
        'desc' => 'Pulsa el botón [1] para consumir. Cura 100 puntos FIJOS de daño en el contador. 1 carga por combate. Sin enfriamiento.'
    ],
    // Bayas
    'oran-berry' => [
        'id' => 'oran-berry',
        'category' => 'berries',
        'name' => 'Baya Aranja',
        'icon' => 'assets/items/oran-berry.png',
        'tag' => 'Auto-KO (-20%)',
        'desc' => 'Reduce un 20% el daño del contador tras una eliminación a un oponente (se activa automáticamente). 2 usos por combate.'
    ],
    // Combate
    'choice-band' => [
        'id' => 'choice-band',
        'category' => 'combat',
        'name' => 'Cinta Elección (Física)',
        'icon' => 'assets/items/choice-band.png',
        'tag' => 'Solo Ataques Z (+50%)',
        'desc' => '+50% aumento de daño y empuje en ataques básicos [Z]. BLOQUEA todos los movimientos especiales [X].'
    ],
    'choice-specs' => [
        'id' => 'choice-specs',
        'category' => 'combat',
        'name' => 'Gafas Elección (Especial)',
        'icon' => 'assets/items/choice-specs.png',
        'tag' => 'Solo Movimientos X (+50%)',
        'desc' => '+50% aumento de daño en movimientos especiales [X]. BLOQUEA todos los ataques básicos [Z].'
    ],
    'choice-scarf' => [
        'id' => 'choice-scarf',
        'category' => 'combat',
        'name' => 'Pañuelo Elección',
        'icon' => 'assets/items/choice-scarf.png',
        'tag' => 'Velocidad (+25%)',
        'desc' => '+25% de velocidad de movimiento, carrera y aceleración en el aire.'
    ],
    'life-orb' => [
        'id' => 'life-orb',
        'category' => 'combat',
        'name' => 'Vida Esfera',
        'icon' => 'assets/items/life-orb.png',
        'tag' => 'Ofensivo (+25%)',
        'desc' => 'Aumenta el daño de todos los ataques un +25%, pero sufres 1.5% de retroceso al golpear.'
    ],
    'wide-lens' => [
        'id' => 'wide-lens',
        'category' => 'combat',
        'name' => 'Lupa',
        'icon' => 'assets/items/wide-lens.png',
        'tag' => 'Smash 100% (+30% KB)',
        'desc' => 'El knockback de los ataques cargados al 100% aumenta en un +30%. En cambio, reduce un -30% si no se ha cargado al 100%.'
    ],
    // Defensa & Evasión
    'escape-rope' => [
        'id' => 'escape-rope',
        'category' => 'defense',
        'name' => 'Cuerda Huida',
        'icon' => 'assets/items/escape-rope.png',
        'tag' => 'Roll +30% / Escudo -30%',
        'desc' => 'Aumenta un 30% la distancia del roll y reduce un 10% el lag entre esquives. Reduce la eficacia del escudo un 30% (recibe más daño de escudo).'
    ],
    'rocky-helmet' => [
        'id' => 'rocky-helmet',
        'category' => 'defense',
        'name' => 'Casco Dentado',
        'icon' => 'assets/items/rocky-helmet.png',
        'tag' => 'Contraataque (4%)',
        'desc' => 'Refleja 4% de daño instantáneo al rival cuando te golpea con ataques cuerpo a cuerpo directos.'
    ],
    'focus-sash' => [
        'id' => 'focus-sash',
        'category' => 'defense',
        'name' => 'Banda Focus',
        'icon' => 'assets/items/focus-sash.png',
        'tag' => 'Supervivencia',
        'desc' => 'Una vez por vida, sobrevive a un impacto que te causaría un KO fatal fuera del escenario.'
    ],
    'focus-band' => [
        'id' => 'focus-band',
        'category' => 'defense',
        'name' => 'Cinta Focus',
        'icon' => 'assets/items/focus-band.png',
        'tag' => 'Defensivo (20%)',
        'desc' => '20% de probabilidad al recibir un golpe de reducir el daño y el empuje un 75%.'
    ],
    'assault-vest' => [
        'id' => 'assault-vest',
        'category' => 'defense',
        'name' => 'Chaleco Asalto',
        'icon' => 'assets/items/assault-vest.png',
        'tag' => 'Defensa Esp. (-25%)',
        'desc' => 'Reduce un 25% el daño recibido por proyectiles y ataques especiales rivales.'
    ],
    // Especiales & Flotabilidad
    'air-balloon' => [
        'id' => 'air-balloon',
        'category' => 'special',
        'name' => 'Globo Helio',
        'icon' => 'assets/items/air-balloon.png',
        'tag' => 'Floaty (<50% daño)',
        'desc' => 'Hace al Pokémon "Floaty" (menor gravedad y suspensión aérea) hasta que alcance un 50% de daño. Si el Pokémon ya es floaty (Gengar), el efecto se reduce en un 80%.'
    ],
    'leftovers' => [
        'id' => 'leftovers',
        'category' => 'special',
        'name' => 'Restos',
        'icon' => 'assets/items/leftovers.png',
        'tag' => 'Sustento Pasivo',
        'desc' => 'Recupera un 1.5% de vida/daño cada 2.0 segundos de combate de forma continua.'
    ],
    'shell-bell' => [
        'id' => 'shell-bell',
        'category' => 'special',
        'name' => 'Cascabel Concha',
        'icon' => 'assets/items/shell-bell.png',
        'tag' => 'Solo Ataques Z (Cura 1.5%)',
        'desc' => 'Curas 1.5% de tu daño cada vez que conectas un ataque básico [Z]. (Nerf: Solo funciona con ataques Z; no con especiales ni proyectiles).'
    ]
];
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PokéFighters - Super Smash Bros Pokémon Edition · Update 1</title>
  <meta name="description" content="Juego estilo Super Smash Bros con sprites de Pokémon Mundo Misterioso usando PHP y JS. Controla a Pikachu, Bulbasaur, Minun & Plusle, Gengar y Jigglypuff.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css?v=<?= time() ?>">
  <link rel="icon" type="image/png" href="assets/pokemon/25/Idle.png">
</head>
<body>

  <!-- Game Header -->
  <header class="game-header">
    <div class="logo-container">
      <div class="logo-badge">UPDATE 1</div>
      <h1 class="logo-title">POKÉ<span>FIGHTERS</span></h1>
    </div>

    <div class="header-actions">
      <button id="btn-start-menu-return" class="btn-header" title="Volver al Menú de Inicio">
        🏠 Inicio
      </button>
      <button id="btn-open-match-menu" class="btn-header highlight" title="Configurar modo de combate y elegir personajes">
        ⚔️ Partida
      </button>
      <button id="btn-open-changelog" class="btn-header changelog-badge-btn" title="Registro de cambios de la Update 1">
        📜 Novedades
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

      <!-- Live Real-Time FPS Counter Badge -->
      <div id="fps-counter-badge" class="fps-counter-badge" title="Tasa de frames en tiempo real">
        <span id="fps-dot" class="fps-dot"></span>
        <span id="fps-val">140</span> FPS
      </div>

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
            <div class="fighter-weight-badge" id="player-weight-tag">⚖️ 6.0 kg · Ligero</div>
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
            <div class="fighter-weight-badge" id="dummy-weight-tag">⚖️ 6.9 kg · Medio</div>
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
          <button class="btn-deck roster-btn active" data-p1-dex="25" title="Peso Oficial: 6.0 kg (Ligero)">⚡ Pikachu (6.0kg)</button>
          <button class="btn-deck roster-btn" data-p1-dex="1" title="Peso Oficial: 6.9 kg (Medio)">🌿 Bulbasaur (6.9kg)</button>
          <button class="btn-deck roster-btn" data-p1-dex="312" title="Peso Oficial: 4.2 kg (Pluma)">🔋 Minun/Plusle (4.2kg)</button>
          <button class="btn-deck roster-btn" data-p1-dex="94" title="Peso Oficial: 40.5 kg (Pesado)">👻 Gengar (40.5kg)</button>
          <button class="btn-deck roster-btn" data-p1-dex="39" title="Peso Oficial: 5.5 kg (Floaty)">🎈 Jigglypuff (5.5kg)</button>
        </div>

        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">CPU / Rival:</div>
        <div class="deck-buttons-row roster-select-row" id="dummy-quick-select" style="margin-bottom: 14px;">
          <button class="btn-deck roster-btn" data-dummy-dex="25" title="Peso Oficial: 6.0 kg (Ligero)">⚡ Pikachu (6.0kg)</button>
          <button class="btn-deck roster-btn active" data-dummy-dex="1" title="Peso Oficial: 6.9 kg (Medio)">🌿 Bulbasaur (6.9kg)</button>
          <button class="btn-deck roster-btn" data-dummy-dex="312" title="Peso Oficial: 4.2 kg (Pluma)">🔋 Minun/Plusle (4.2kg)</button>
          <button class="btn-deck roster-btn" data-dummy-dex="94" title="Peso Oficial: 40.5 kg (Pesado)">👻 Gengar (40.5kg)</button>
          <button class="btn-deck roster-btn" data-dummy-dex="39" title="Peso Oficial: 5.5 kg (Floaty)">🎈 Jigglypuff (5.5kg)</button>
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

        <div class="control-item" style="border-left: 3px solid #facc15;">
          <div class="key-badge" style="background: linear-gradient(135deg, #f59e0b, #ef4444); color: #fff;">Dirección x2 + Z</div>
          <div class="control-desc">
            <span class="control-title" style="color: #facc15;">💥 ¡Ataque Cargado (Smash Attack)!</span>
            <span class="control-sub">En el suelo, pulsa dos veces rápido una dirección (⬅️⬅️, ➡️➡️, ⬆️⬆️ o ⬇️⬇️) y <strong>mantén Z</strong> para cargar energía. <strong>¡AL SOLTAR Z se ejecuta el ataque!</strong> Cuanto más tiempo lo cargues (alcanza el 100% en solo 0.5s), más demoledor será el impulso y knockback.</span>
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
            <span class="control-title">Escudo (En el Suelo)</span>
            <span class="control-sub">Mantén C en el suelo para bloquear. Se desgasta y si se rompe quedas aturdido.</span>
          </div>
        </div>

        <div class="control-item" style="border-left: 3px solid #38bdf8;">
          <div class="key-badge" style="background: linear-gradient(135deg, #0284c7, #38bdf8); color: #fff;">C (en el aire)</div>
          <div class="control-desc">
            <span class="control-title" style="color: #38bdf8;">💨 Esquive Aéreo (Air Dodge)</span>
            <span class="control-sub">Pulsa C en el aire para obtener <strong>i-frames de invulnerabilidad</strong> y esquivar ataques rivales. Puedes dirigirlo con las flechas.</span>
          </div>
        </div>

        <div class="control-item" style="border-left: 3px solid #06b6d4;">
          <div class="key-badge" style="background: linear-gradient(135deg, #0891b2, #06b6d4); color: #fff;">C + ⬅️ / ➡️</div>
          <div class="control-desc">
            <span class="control-title" style="color: #06b6d4;">🌀 Rodar / Roll con Escudo</span>
            <span class="control-sub">Mantén C y pulsa Izquierda o Derecha en el suelo para hacer un <strong>Roll con i-frames</strong>, atravesando proyectiles y ataques.</span>
          </div>
        </div>

        <div class="control-item" style="border-left: 3px solid #facc15;">
          <div class="key-badge" style="background: linear-gradient(135deg, #eab308, #facc15); color: #000; font-weight: 800;">Soltar C (3 frames)</div>
          <div class="control-desc">
            <span class="control-title" style="color: #facc15;">🛡️ Parry Perfecto (Perfect Shield)</span>
            <span class="control-sub">Si sueltas el escudo en los <strong>primeros 3 frames</strong> de recibir un ataque: campana metálica, ojos brillantes, <strong>0 daño de escudo</strong> y el rival sufre <strong>5 frames de congelación</strong>, permitiendo un contraataque inmediato.</span>
          </div>
        </div>

        <div class="control-item" style="border-left: 3px solid #38bdf8;">
          <div class="key-badge" style="background: linear-gradient(135deg, #0284c7, #38bdf8); color: #fff; font-weight: 800;">Borde + Espacio/Z/⬆️/⬇️</div>
          <div class="control-desc">
            <span class="control-title" style="color: #38bdf8;">🧗 Agarre al Borde & Recuperación (Ledge Grab)</span>
            <span class="control-sub">Al caer cerca del borde del escenario, te agarras automáticamente con <strong>1 segundo de invulnerabilidad</strong>. Opciones de recuperación: <strong>[Espacio]</strong> Salto de borde, <strong>[Z]</strong> Ataque de borde, <strong>[Arriba]</strong> Subir normal, o <strong>[Abajo]</strong> Soltar borde.</span>
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

  <!-- Start Screen Overlay (Menú de Inicio) -->
  <div id="start-screen" class="start-screen-overlay">
    <div class="start-screen-backdrop"></div>
    <div class="start-screen-content">
      <div class="start-screen-badge retro-font">UPDATE 1 · SUPER SMASH BROS</div>
      <h1 class="start-screen-title">
        <span class="poke-glow">POKÉ</span><span class="fighters-glow">FIGHTERS</span>
      </h1>
      <p class="start-screen-subtitle">Plataforma de Lucha Competitiva Pokémon en Tiempo Real</p>

      <!-- Animated Roster Showcase Preview -->
      <div class="start-screen-roster">
        <div class="start-roster-item" title="Pikachu">
          <img src="assets/pokemon/25/Idle.png" alt="Pikachu" class="start-roster-sprite">
          <span class="start-roster-name">Pikachu</span>
        </div>
        <div class="start-roster-item" title="Bulbasaur">
          <img src="assets/pokemon/1/Idle.png" alt="Bulbasaur" class="start-roster-sprite">
          <span class="start-roster-name">Bulbasaur</span>
        </div>
        <div class="start-roster-item" title="Minun y Plusle">
          <img src="assets/pokemon/312/Idle.png" alt="Minun y Plusle" class="start-roster-sprite">
          <span class="start-roster-name">Minun & Plusle</span>
        </div>
        <div class="start-roster-item" title="Gengar">
          <img src="assets/pokemon/94/Idle.png" alt="Gengar" class="start-roster-sprite">
          <span class="start-roster-name">Gengar</span>
        </div>
        <div class="start-roster-item new-fighter-showcase" title="¡NUEVO LUCHADOR! Jigglypuff">
          <div class="new-pill retro-font">¡NUEVO!</div>
          <img src="assets/pokemon/39/Idle.png" alt="Jigglypuff" class="start-roster-sprite">
          <span class="start-roster-name" style="color: #f472b6;">Jigglypuff</span>
        </div>
      </div>

      <!-- Main Start Screen Buttons -->
      <div class="start-screen-menu">
        <button id="btn-start-play" class="start-menu-btn start-btn-primary">
          <span class="btn-icon">⚔️</span>
          <div class="btn-text-group">
            <span class="btn-main-title retro-font">JUGAR</span>
            <span class="btn-sub-desc">Configuración de partida y combate</span>
          </div>
        </button>

        <button id="btn-start-changelog" class="start-menu-btn start-btn-changelog">
          <span class="btn-icon">📜</span>
          <div class="btn-text-group">
            <span class="btn-main-title retro-font">NOVEDADES (CHANGELOG)</span>
            <span class="btn-sub-desc">Jigglypuff, dificultad 1-9, nerf pociones</span>
          </div>
        </button>

        <button id="btn-start-settings" class="start-menu-btn">
          <span class="btn-icon">⚙️</span>
          <div class="btn-text-group">
            <span class="btn-main-title retro-font">AJUSTES</span>
            <span class="btn-sub-desc">Sonido, controles, FPS y gráficos</span>
          </div>
        </button>

        <button id="btn-start-guide" class="start-menu-btn">
          <span class="btn-icon">📖</span>
          <div class="btn-text-group">
            <span class="btn-main-title retro-font">GUÍA Y MOVIMIENTOS</span>
            <span class="btn-sub-desc">Movesets Smash, roll y combos</span>
          </div>
        </button>
      </div>

      <div class="start-screen-footer">
        <span>© PokéFighters 2026 · Super Smash Bros Pokémon Edition · v1.1.0 Update 1</span>
      </div>
    </div>
  </div>

  <!-- Match Setup & Character Selection Modal (Compact & Retro Arcade Style) -->
  <div id="match-setup-modal" class="modal-overlay">
    <div class="modal-content setup-modal-content retro-setup-modal">
      <div class="modal-header">
        <h2 class="retro-font" style="font-size: 15px; color: #facc15; display: flex; align-items: center; gap: 8px;">
          ⚔️ MENÚ DE PARTIDA · CONFIGURACIÓN
        </h2>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button id="btn-setup-back-menu" class="btn-compact-retro" onclick="document.getElementById('match-setup-modal').classList.remove('open'); document.getElementById('start-screen').classList.remove('hidden');" title="Volver al Menú Principal">
            🏠 Inicio
          </button>
          <button class="modal-close" id="btn-close-setup-modal">✕</button>
        </div>
      </div>

      <!-- Smash Bros Step Navigation Breadcrumbs -->
      <div class="setup-steps-breadcrumbs retro-font">
        <button type="button" class="step-crumb active" id="crumb-step-1" onclick="window.game && window.game.goToSetupStep(1)">
          <span class="crumb-num">1</span> REGLAS
        </button>
        <span class="step-crumb-sep">➔</span>
        <button type="button" class="step-crumb" id="crumb-step-2" onclick="window.game && window.game.goToSetupStep(2)">
          <span class="crumb-num">2</span> ESCENARIO
        </button>
        <span class="step-crumb-sep">➔</span>
        <button type="button" class="step-crumb" id="crumb-step-3" onclick="window.game && window.game.goToSetupStep(3)">
          <span class="crumb-num">3</span> LUCHADORES
        </button>
      </div>

      <!-- =====================================================================
           PASO 1: REGLAS DE LA PARTIDA (NUEVO)
           ===================================================================== -->
      <div id="setup-step-rules" class="setup-step-screen active">
        <div class="step-screen-title retro-font">⚙️ PASO 1: REGLAS DE LA BATALLA</div>
        <p class="step-screen-desc">Configura el formato competitivo, número de vidas y límite de tiempo antes de luchar.</p>

        <!-- Mode Selection Tabs -->
        <div class="setup-section" style="margin-bottom: 12px;">
          <label class="setup-label">Formato de Juego</label>
          <div class="mode-select-grid">
            <div class="mode-card active" data-mode="BATTLE">
              <div class="mode-icon">🥊</div>
              <div class="mode-title">Partida Versus</div>
              <div class="mode-desc">Combate por Vidas y/o Tiempo. Quien conserve vidas al final gana.</div>
              <span class="mode-badge" id="rule-versus-badge">3 Vidas</span>
            </div>
            <div class="mode-card" data-mode="TRAINING">
              <div class="mode-icon">🎯</div>
              <div class="mode-title">Modo Entrenamiento</div>
              <div class="mode-desc">Vidas infinitas, dummy personalizable, combo counter y slider.</div>
              <span class="mode-badge">Práctica Libre</span>
            </div>
          </div>
        </div>

        <!-- Stock Selector -->
        <div class="setup-section" id="section-rule-stocks" style="margin-bottom: 12px;">
          <label class="setup-label">Vidas de Combate (Stocks)</label>
          <div class="rule-chips-row">
            <button type="button" class="rule-chip" data-rule-stocks="1">1 Vida</button>
            <button type="button" class="rule-chip" data-rule-stocks="2">2 Vidas</button>
            <button type="button" class="rule-chip active" data-rule-stocks="3">3 Vidas (Recomendado)</button>
            <button type="button" class="rule-chip" data-rule-stocks="4">4 Vidas</button>
            <button type="button" class="rule-chip" data-rule-stocks="5">5 Vidas</button>
            <button type="button" class="rule-chip" data-rule-stocks="10">10 Vidas</button>
          </div>
        </div>

        <!-- Time Limit Selector -->
        <div class="setup-section" id="section-rule-time" style="margin-bottom: 12px;">
          <label class="setup-label">Límite de Tiempo</label>
          <div class="rule-chips-row">
            <button type="button" class="rule-chip active" data-rule-time="0">Sin Límite (∞)</button>
            <button type="button" class="rule-chip" data-rule-time="120">2 Minutos</button>
            <button type="button" class="rule-chip" data-rule-time="180">3 Minutos</button>
            <button type="button" class="rule-chip" data-rule-time="300">5 Minutos</button>
            <button type="button" class="rule-chip" data-rule-time="420">7 Minutos</button>
            <button type="button" class="rule-chip" data-rule-time="600">10 Minutos</button>
          </div>
        </div>

        <!-- Items Enable / Disable -->
        <div class="setup-section" style="margin-bottom: 14px;">
          <label class="setup-label">Mochila Pokémon (Objetos de Combate)</label>
          <div class="rule-chips-row">
            <button type="button" class="rule-chip active" data-rule-items="on">🎒 Activada (18 Objetos Equipables)</button>
            <button type="button" class="rule-chip" data-rule-items="off">🚫 Desactivada (Sin Objetos / Pura Habilidad)</button>
          </div>
        </div>

        <!-- Step 1 Navigation Footer -->
        <div class="step-nav-footer">
          <button type="button" class="btn-compact-retro" onclick="document.getElementById('match-setup-modal').classList.remove('open'); document.getElementById('start-screen').classList.remove('hidden');">
            🏠 Inicio
          </button>
          <button type="button" class="btn-step-next retro-font" onclick="window.game && window.game.goToSetupStep(2)">
            Elegir Escenario ➔
          </button>
        </div>
      </div>

      <!-- =====================================================================
           PASO 2: SELECCIÓN DE ESCENARIO
           ===================================================================== -->
      <div id="setup-step-stage" class="setup-step-screen">
        <div class="step-screen-title retro-font">🏟️ PASO 2: SELECCIONA EL ESCENARIO</div>
        <p class="step-screen-desc">Elige el campo de batalla donde se disputará el encuentro.</p>

        <!-- Stage Selection Grid -->
        <div class="setup-section">
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

        <!-- Step 2 Navigation Footer -->
        <div class="step-nav-footer">
          <button type="button" class="btn-step-prev retro-font" onclick="window.game && window.game.goToSetupStep(1)">
            ⬅️ Reglas
          </button>
          <button type="button" class="btn-step-next retro-font" onclick="window.game && window.game.goToSetupStep(3)">
            Elegir Luchadores ➔
          </button>
        </div>
      </div>

      <!-- =====================================================================
           PASO 3: SELECCIÓN DE PERSONAJES & OBJETOS
           ===================================================================== -->
      <div id="setup-step-fighters" class="setup-step-screen">
        <div class="step-screen-title retro-font">🥊 PASO 3: LUCHADORES Y EQUIPAMIENTO</div>
        <p class="step-screen-desc">Elige a tu Pokémon, al rival de la CPU y equipa objetos de la mochila si están activados.</p>

        <!-- Fighter Selection Columns -->
        <div class="fighters-select-container">
          <!-- Player 1 Roster -->
          <div class="roster-column">
            <label class="setup-label">Tu Pokémon (Jugador 1)</label>

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
            <div id="p1-cpu-diff-container" style="display: none; margin-bottom: 12px; background: rgba(15,23,42,0.65); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 11px; color: var(--text-muted); font-weight: 700;">Dificultad CPU Jugador 1:</span>
                <span id="p1-difficulty-level-label" class="retro-font" style="font-size: 10px; color: #38bdf8;">Nivel 5: Intermedio</span>
              </div>
              <input type="range" id="p1-difficulty-slider" min="1" max="9" step="1" value="5" class="custom-range difficulty-slider">
              <div class="slider-ticks-row">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
              </div>
            </div>

            <div class="roster-grid" id="p1-modal-roster">
              <div class="roster-card active" data-roster-p1="25">
                <div class="roster-card-avatar" data-avatar-dex="25"></div>
                <div class="roster-card-name">Pikachu</div>
                <div class="roster-card-type" style="color: #facc15;">Eléctrico</div>
                <div class="roster-card-weight">⚖️ 6.0 kg · Ligero</div>
              </div>
              <div class="roster-card" data-roster-p1="1">
                <div class="roster-card-avatar" data-avatar-dex="1"></div>
                <div class="roster-card-name">Bulbasaur</div>
                <div class="roster-card-type" style="color: #10b981;">Planta / Veneno</div>
                <div class="roster-card-weight">⚖️ 6.9 kg · Medio</div>
              </div>
              <div class="roster-card" data-roster-p1="312">
                <div class="roster-card-avatar" data-avatar-dex="312" data-partner-dex="311"></div>
                <div class="roster-card-name">Minun y Plusle</div>
                <div class="roster-card-type" style="color: #38bdf8;">Eléctrico (Dúo)</div>
                <div class="roster-card-weight">⚖️ 4.2 kg · Pluma</div>
              </div>
              <div class="roster-card" data-roster-p1="94">
                <div class="roster-card-avatar" data-avatar-dex="94"></div>
                <div class="roster-card-name">Gengar</div>
                <div class="roster-card-type" style="color: #a855f7;">Fantasma / Veneno</div>
                <div class="roster-card-weight">⚖️ 40.5 kg · Pesado</div>
              </div>
              <div class="roster-card" data-roster-p1="39">
                <div class="roster-card-avatar" data-avatar-dex="39"></div>
                <div class="roster-card-name">Jigglypuff</div>
                <div class="roster-card-type" style="color: #f472b6;">Normal / Hada</div>
                <div class="roster-card-weight">⚖️ 5.5 kg · Floaty</div>
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
                <div class="roster-card-weight">⚖️ 6.0 kg · Ligero</div>
              </div>
              <div class="roster-card active" data-roster-cpu="1">
                <div class="roster-card-avatar" data-avatar-dex="1"></div>
                <div class="roster-card-name">Bulbasaur</div>
                <div class="roster-card-type" style="color: #10b981;">Planta / Veneno</div>
                <div class="roster-card-weight">⚖️ 6.9 kg · Medio</div>
              </div>
              <div class="roster-card" data-roster-cpu="312">
                <div class="roster-card-avatar" data-avatar-dex="312" data-partner-dex="311"></div>
                <div class="roster-card-name">Minun y Plusle</div>
                <div class="roster-card-type" style="color: #38bdf8;">Eléctrico (Dúo)</div>
                <div class="roster-card-weight">⚖️ 4.2 kg · Pluma</div>
              </div>
              <div class="roster-card" data-roster-cpu="94">
                <div class="roster-card-avatar" data-avatar-dex="94"></div>
                <div class="roster-card-name">Gengar</div>
                <div class="roster-card-type" style="color: #a855f7;">Fantasma / Veneno</div>
                <div class="roster-card-weight">⚖️ 40.5 kg · Pesado</div>
              </div>
              <div class="roster-card" data-roster-cpu="39">
                <div class="roster-card-avatar" data-avatar-dex="39"></div>
                <div class="roster-card-name">Jigglypuff</div>
                <div class="roster-card-type" style="color: #f472b6;">Normal / Hada</div>
                <div class="roster-card-weight">⚖️ 5.5 kg · Floaty</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Held Items Selection Section (Estilo Mochila Pokémon) -->
        <div class="setup-section" id="setup-items-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label class="setup-label" style="margin-bottom: 0;">Mochila Pokémon: Equipar Objetos (Held Items)</label>
            <span style="font-size: 11px; color: var(--accent-color); font-weight: 700;">🎒 18 Objetos Clasificados</span>
          </div>

          <!-- Categorías Mochila Tabs -->
          <div class="item-category-tabs">
            <button type="button" class="item-tab-pill active" data-item-tab="all">
              <span>🎒 Todos (18)</span>
            </button>
            <?php foreach ($pokemon_item_categories as $cId => $c): ?>
              <?php
                $count = 0;
                foreach ($pokemon_items as $it) if ($it['category'] === $cId) $count++;
              ?>
              <button type="button" class="item-tab-pill" data-item-tab="<?= $cId ?>">
                <span><?= $c['icon'] ?> <?= $c['name'] ?> (<?= $count ?>)</span>
              </button>
            <?php endforeach; ?>
          </div>

          <div class="items-columns-container">
            <!-- P1 Items Column -->
            <div class="item-player-column">
              <div class="item-column-header">
                <span>🎒 Mochila Jugador 1:</span>
                <span class="active-item-hint" id="p1-selected-item-name">Sin Objeto</span>
              </div>
              <div class="items-category-container" id="p1-items-container">
                <?php foreach ($pokemon_item_categories as $cId => $c): ?>
                  <div class="item-category-group" data-group-cat="<?= $cId ?>">
                    <div class="item-category-header">
                      <span class="cat-icon"><?= $c['icon'] ?></span>
                      <span class="cat-name"><?= $c['name'] ?></span>
                      <span class="cat-badge"><?= $c['badge'] ?></span>
                    </div>
                    <div class="items-grid">
                      <?php foreach ($pokemon_items as $iId => $it): ?>
                        <?php if ($it['category'] === $cId): ?>
                          <div class="item-choice-card <?= $iId === 'none' ? 'active' : '' ?>" data-p1-item="<?= $iId ?>" data-item-name="<?= htmlspecialchars($it['name']) ?>" title="<?= htmlspecialchars($it['desc']) ?>">
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
                        <?php endif; ?>
                      <?php endforeach; ?>
                    </div>
                  </div>
                <?php endforeach; ?>
              </div>
            </div>

            <!-- CPU Items Column -->
            <div class="item-player-column">
              <div class="item-column-header">
                <span>🎒 Mochila CPU (Rival):</span>
                <span class="active-item-hint" id="cpu-selected-item-name">Sin Objeto</span>
              </div>
              <div class="items-category-container" id="cpu-items-container">
                <?php foreach ($pokemon_item_categories as $cId => $c): ?>
                  <div class="item-category-group" data-group-cat="<?= $cId ?>">
                    <div class="item-category-header">
                      <span class="cat-icon"><?= $c['icon'] ?></span>
                      <span class="cat-name"><?= $c['name'] ?></span>
                      <span class="cat-badge"><?= $c['badge'] ?></span>
                    </div>
                    <div class="items-grid">
                      <?php foreach ($pokemon_items as $iId => $it): ?>
                        <?php if ($it['category'] === $cId): ?>
                          <div class="item-choice-card <?= $iId === 'none' ? 'active' : '' ?>" data-cpu-item="<?= $iId ?>" data-item-name="<?= htmlspecialchars($it['name']) ?>" title="<?= htmlspecialchars($it['desc']) ?>">
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
                        <?php endif; ?>
                      <?php endforeach; ?>
                    </div>
                  </div>
                <?php endforeach; ?>
              </div>
            </div>
          </div>
        </div>

        <!-- CPU Difficulty Slider (1 to 9) -->
        <div class="setup-section" id="cpu-diff-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label class="setup-label" style="margin-bottom: 0;">Dificultad de la CPU (Smash Bros Lvl 1 - 9)</label>
            <span id="cpu-difficulty-level-label" class="retro-font difficulty-live-badge">Nivel 5: Intermedio (Equilibrado)</span>
          </div>
          <div class="difficulty-slider-container">
            <input type="range" id="cpu-difficulty-slider" min="1" max="9" step="1" value="5" class="custom-range difficulty-slider">
            <div class="slider-ticks-row">
              <span>1 (Muy Fácil)</span>
              <span>3</span>
              <span>5 (Medio)</span>
              <span>7 (Difícil)</span>
              <span>9 (Inmejorable)</span>
            </div>
            <div class="difficulty-guide-row">
              <span class="diff-chip chip-green">1-3: Casual</span>
              <span class="diff-chip chip-yellow">4-6: Intermedio</span>
              <span class="diff-chip chip-orange">7: Experto</span>
              <span class="diff-chip chip-red">8-9: TAS Pro AI</span>
            </div>
          </div>
        </div>

        <!-- Step 3 Navigation & Start Button -->
        <div class="step-nav-footer">
          <button type="button" class="btn-step-prev retro-font" onclick="window.game && window.game.goToSetupStep(2)">
            ⬅️ Escenario
          </button>
          <button id="btn-start-configured-match" class="btn-start-match retro-font">
            🔥 ¡A LUCHAR! COMENZAR
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Changelog Modal (Update 1) -->
  <div id="changelog-modal" class="modal-overlay">
    <div class="modal-content changelog-modal-content retro-setup-modal">
      <div class="modal-header">
        <h2 class="retro-font" style="font-size: 14px; color: #facc15; display: flex; align-items: center; gap: 8px;">
          📜 REGISTRO DE CAMBIOS · UPDATE 1
        </h2>
        <button class="modal-close" id="btn-close-changelog-modal">✕</button>
      </div>
      <div class="changelog-body">
        <div class="changelog-badge-header">
          <span class="cl-ver retro-font">VERSIÓN 1.2.0</span>
          <span class="cl-badge" style="background: linear-gradient(135deg, #a855f7, #ec4899);">NUEVOS ESCENARIOS & MECÁNICAS</span>
        </div>

        <div class="changelog-section" style="border-left: 3px solid #a855f7;">
          <h3 class="cl-sec-title" style="color: #c084fc;">🏟️ NUEVO ESCENARIO DINÁMICO: TORRE POKÉMON DE PUEBLO LAVANDA</h3>
          <ul class="cl-list">
            <li><strong>Atmósfera Tétrica:</strong> Paleta espectral en blanco, negro y morado con niebla animada multicapa en movimiento continuo.</li>
            <li><strong>Plataformas de Lápidas Ancestrales:</strong> Plataformas talladas en pizarra gótica con runas arcanas luminosas y fuegos fatuos.</li>
            <li><strong>Ojos Fantasmales Vigilantes:</strong> Ojos espectrales que observan y parpadean en la oscuridad siguiendo el movimiento del combate.</li>
          </ul>
        </div>

        <div class="changelog-section" style="border-left: 3px solid #38bdf8;">
          <h3 class="cl-sec-title" style="color: #38bdf8;">🧗 AGARRE AL BORDE DE PLATAFORMAS (LEDGE GRAB & RECOVERY)</h3>
          <ul class="cl-list">
            <li><strong>Agarre Automático:</strong> Al caer cerca del borde del escenario principal, el personaje se agarra automáticamente con <strong>1 segundo de invulnerabilidad</strong>.</li>
            <li><strong>Opciones de Recuperación Auténticas:</strong>
              <ul>
                <li><strong>Salto de Borde [Espacio]:</strong> Salto acrobático hacia el escenario para ganar ventaja aérea.</li>
                <li><strong>Ataque de Borde [Z]:</strong> Barrido frontal con hitbox activa para castigar a rivales que acechan el borde.</li>
                <li><strong>Subir Normal [Arriba]:</strong> Incorporación ágil a la plataforma con frames de intangibilidad.</li>
                <li><strong>Soltar Borde [Abajo]:</strong> Suelta el agarre para maniobras libres o caídas rápidas.</li>
              </ul>
            </li>
          </ul>
        </div>

        <div class="changelog-section" style="border-left: 3px solid #facc15;">
          <h3 class="cl-sec-title" style="color: #facc15;">🛡️ PARRY PERFECTO (PERFECT SHIELD - SMASH ULTIMATE)</h3>
          <ul class="cl-list">
            <li><strong>Ventana de 3 Frames:</strong> Si sueltas el escudo en los <strong>primeros 3 frames</strong> de recibir un ataque:
              <ul>
                <li>Sonido de campana metálica resonante.</li>
                <li>Efecto visual de ojos brillantes y destello celestial en cruz.</li>
                <li><strong>0 daño de escudo y 0% de daño a la vida</strong>.</li>
                <li>El rival sufre <strong>5 frames de congelación (freeze stun)</strong>, permitiendo un contraataque instantáneo.</li>
              </ul>
            </li>
          </ul>
        </div>

        <div class="changelog-section" style="border-left: 3px solid #10b981;">
          <h3 class="cl-sec-title" style="color: #34d399;">🎮 REWORK AL MENÚ DE JUGAR (FLUJO MENÚ POR MENÚ)</h3>
          <ul class="cl-list">
            <li>Flujo intuitivo paso a paso inspirado en Super Smash Bros:
              <ul>
                <li><strong>Paso 1: Reglas de la Partida:</strong> Modo (Versus/Training), número de vidas (1 a 10 stocks), límite de tiempo (∞, 2m, 3m, 5m, 7m, 10m) y activación de mochila de objetos.</li>
                <li><strong>Paso 2: Selección de Escenario:</strong> Navegación visual limpia con Campo de Batalla, Destino Final y Torre Pokémon de Pueblo Lavanda.</li>
                <li><strong>Paso 3: Luchadores & Mochila:</strong> Configuración de Jugador 1 y CPU con sliders de dificultad 1 a 9 y botón ¡A LUCHAR!</li>
              </ul>
            </li>
          </ul>
        </div>

        <div class="changelog-section">
          <h3 class="cl-sec-title">💖 NUEVO LUCHADOR: JIGGLYPUFF (#039)</h3>
          <ul class="cl-list">
            <li><strong>Físicas Floaty Auténticas:</strong> Gravedad reducida (0.55x), caída lenta y <strong>5 saltos aéreos consecutivos</strong>.</li>
            <li><strong>Moveset Smash Bros:</strong>
              <ul>
                <li><strong>Neutral X (Desenrollar / Rollout):</strong> Giro rodante que gana inercia continua por el suelo y arrolla con gran knockback.</li>
                <li><strong>Lateral X (Destructor / Pound):</strong> Potente bofetón volador hacia adelante que inflige <strong>55 de daño de escudo</strong> para romperlos casi de un solo golpe.</li>
                <li><strong>Arriba X (Canto Somnífero / Sing):</strong> Dulce melodía en área que duerme al rival en tierra.</li>
                <li><strong>Abajo X (¡Descanso! / Rest):</strong> Impacto milimétrico devastador (25% de daño con explosión y lanzamiento vertical letal).</li>
                <li><strong>Ataques Z & Wall of Pain:</strong> Nair giratorio duradero, Fair para empujar hacia el abismo (Wall of Pain) y Dair taladro multihit.</li>
              </ul>
            </li>
          </ul>
        </div>

        <div class="changelog-section">
          <h3 class="cl-sec-title">🎚️ SLIDER DE DIFICULTAD DE CPU (NIVELES 1 A 9)</h3>
          <ul class="cl-list">
            <li>Selector continuo de dificultad de <strong>Nivel 1 a 9</strong> estilo Super Smash Bros.</li>
            <li><strong>Nivel 1:</strong> Más relajado y permisivo que antes, ataques pausados y sin castigos agresivos.</li>
            <li><strong>Nivel 5:</strong> Equilibrio ideal equivalente al anterior Nivel Medio.</li>
            <li><strong>Nivel 7:</strong> Nivel Difícil previo con trampas en borde y meteor spikes.</li>
            <li><strong>Niveles 8 y 9 (Maestro & Inmejorable):</strong> Reacciones frame-perfect (0.012s), parries de proyectiles (97%), persecución aérea fuera del escenario y castigos TAS.</li>
          </ul>
        </div>

        <div class="changelog-section">
          <h3 class="cl-sec-title">⏱️ CONTADOR 3.. 2.. 1.. ¡YA!</h3>
          <ul class="cl-list">
            <li>Animación de inicio retro arcade sincronizada con sintetizador chiptune antes de habilitar el control de los luchadores.</li>
          </ul>
        </div>

        <div class="changelog-section">
          <h3 class="cl-sec-title">🎨 MEJORAS GRÁFICAS & DITTO MATCH</h3>
          <ul class="cl-list">
            <li><strong>Iluminación Dinámica:</strong> Focos de luz y rayos celestiales tiñen en tiempo real a los luchadores al pasar bajo ellos.</li>
            <li><strong>Estrellas Fugaces & Más Constelaciones:</strong> Más de 90 estrellas titilantes y meteoros que cruzan el cielo cósmico.</li>
            <li><strong>Follaje y Flora Viva:</strong> Mayor densidad de hierba ondeante con múltiples variedades de flores.</li>
            <li><strong>Partida Espejo (Ditto Match):</strong> Si juegas contra tu mismo Pokémon, tu personaje luce un contorno cian brillante y etiqueta "P1".</li>
          </ul>
        </div>

        <div class="changelog-section">
          <h3 class="cl-sec-title">⚖️ BALANCE & BUG FIXING</h3>
          <ul class="cl-list">
            <li><strong>Nerf de Pociones:</strong> Ahora curan un porcentaje del <strong>daño acumulado actual</strong> (Poción: 20%; SuperPoción: 50%). La HiperPoción se mantiene fija en 100%.</li>
            <li><strong>Físicas de Roll:</strong> Mayor distancia y velocidad al rodar con escudo [C + ⬅️/➡️] para facilitar escapes.</li>
            <li><strong>Balance Jigglypuff:</strong> Salto máximo moderado con curvas progresivas en sus 5 aleteos aéreos; Destructor con 0.4s de cooldown; Canto con lag de 0.4s al iniciarlo y CD aumentada a 5.0s.</li>
            <li><strong>Bug Fix Spawn CPU P1:</strong> Corregido el error que hacía que la CPU Jugador apareciera sobre la CPU oponente al elegirse como IA.</li>
          </ul>
        </div>
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

      <!-- Graphics Quality & FPS Section -->
      <div class="settings-section">
        <div class="settings-section-title">🎨 Presets Gráficos & Rendimiento</div>
        
        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">Calidad de Efectos Visuales:</div>
        <div class="deck-buttons-row graphics-presets-row" style="margin-bottom: 14px;">
          <button class="btn-deck active" data-graphics-preset="ultra" title="Nueva generación: Sombras dinámicas en mapas y personajes + Iluminación volumétrica + Foliage reactivo">
            🌟 Ultra (Nueva: Sombras Dinámicas + Iluminación + Foliage)
          </button>
          <button class="btn-deck" data-graphics-preset="high" title="Anterior Ultra: Focos dinámicos + Luces completas + Partículas">
            ✨ Alto (Anterior Ultra: Luces + Partículas)
          </button>
          <button class="btn-deck" data-graphics-preset="medium" title="Calidad media: Sombras proyectadas básicas + Efectos equilibrados">
            ⚡ Medio (Sombras Básicas + Efectos Estándar)
          </button>
          <button class="btn-deck" data-graphics-preset="low" title="Rendimiento máximo: Sin sombras pesadas">
            🍃 Bajo (Rendimiento Máximo)
          </button>
        </div>

        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">Tasa de Refresco Objetivo (FPS):</div>
        <div class="deck-buttons-row fps-presets-row" id="fps-presets-row" style="margin-bottom: 12px;">
          <button class="btn-deck active" data-fps-preset="140" title="140 FPS ultra fluidos">
            🚀 140 FPS (Recomendado)
          </button>
          <button class="btn-deck" data-fps-preset="120" title="120 FPS de alta fluidez">
            ⚡ 120 FPS
          </button>
          <button class="btn-deck" data-fps-preset="60" title="60 FPS estándar Smash">
            🎮 60 FPS
          </button>
          <button class="btn-deck" data-fps-preset="0" title="Sin límite (Frecuencia máxima del monitor: 144Hz, 165Hz, 240Hz)">
            ♾️ Ilimitado / Monitor Máx.
          </button>
        </div>

        <div class="settings-toggle-row">
          <label class="toggle-container">
            <input type="checkbox" id="setting-fps-counter-toggle" checked>
            <span class="toggle-label">📊 Mostrar Contador de FPS en Pantalla</span>
          </label>
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
            <tr data-rebind-action="item">
              <td>Usar Objeto / Poción (1)</td>
              <td>Consumir Poción, SuperPoción o HiperPoción</td>
              <td><button class="keybind-code-btn">1</button></td>
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
          <br>• <strong>Fórmula de Daño:</strong> Aumenta el <strong>% ACTUAL</strong> que tenga el enemigo un <strong>3%</strong> (mínimo 1%). Cuanto más dañado esté el rival, mayor es el veneno.
        </p>
      </div>

      <!-- Section: Charged Smash Attacks -->
      <div style="margin-bottom: 24px; background: rgba(250, 204, 21, 0.08); border: 1px solid rgba(250, 204, 21, 0.35); border-radius: 12px; padding: 14px 18px;">
        <h3 style="color: #facc15; font-size: 16px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
          💥 ¡NUEVO!: Ataques Cargados (Smash Attacks)
        </h3>
        <p style="font-size: 13px; color: #e2e8f0; line-height: 1.5;">
          ¡Todos los Pokémon ahora pueden acumular energía para desatar devastadores <strong>Ataques Smash</strong>!
          <br>• <strong>Cómo realizarlo:</strong> En el suelo, pulsa <strong>dos veces rápido</strong> una dirección (⬅️⬅️, ➡️➡️, ⬆️⬆️ o ⬇️⬇️) y <strong>mantén pulsado Z</strong>.
          <br>• <strong>Carga de Poder:</strong> Verás una cúpula de energía y el porcentaje de carga (0% a 100%).
          <br>• <strong>Impulso Descomunal:</strong> Al soltar Z (o al 100%), el golpe se desata con hasta <strong>+75% de impulso / knockback adicional</strong> y daño masivo, ideal para noquear rivales en porcentajes medios y altos.
        </p>
      </div>

      <!-- Section: Balance & New Mechanics -->
      <div style="margin-bottom: 24px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.35); border-radius: 12px; padding: 16px 20px;">
        <h3 style="color: #60a5fa; font-size: 16px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          ✨ Novedades: Balance, Físicas Floaty y Reworks de Combate
        </h3>
        <p style="font-size: 13px; color: #e2e8f0; line-height: 1.6; margin-bottom: 0;">
          • <strong>👻 Rework a Gengar (Bola Sombra, Puño Sombra y Físicas Floaty):</strong>
          <br>&nbsp;&nbsp;🔮 <em>Bola Sombra (Neutral X):</em> Ahora se puede mantener pulsado X hasta <strong>3.0 segundos</strong> para cargar energía. El daño (+30%), knockback (+30%) y velocidad del proyectil (+30%) aumentan gradualmente. Se lanza al dejar de mantener. Si se carga al máximo, puedes pulsar <strong>⬅️ Izquierda o ➡️ Derecha</strong> para cancelar y mantenerla cargada (con un orbe fantasmal orbitante y aura visual); pulsar X la dispara al instante (desaparece tras <strong>8 segundos</strong> si no se lanza). Su lag de recuperación se reduce a <strong>0.3 segundos</strong> para poder empezar a moverse de inmediato.
          <br>&nbsp;&nbsp;🥊 <em>Puño Sombra (Side X):</em> ¡Siempre lanza al oponente <strong>hacia arriba (88°)</strong> en lugar de a los lados, permitiendo combos aéreos letales!
          <br>&nbsp;&nbsp;🦘 <em>Stat Base (Salto):</em> Se reduce un <strong>30% su distancia y fuerza de salto</strong> (de 14.5 a 10.15), equilibrando a la perfección su gravedad reducida Floaty (0.60x).
          <br>• <strong>⚡ Minun y Plusle (Dúo Climber):</strong> Si <strong>Minun muere, mueren ambos</strong> de inmediato perdiendo la vida. Si <strong>Plusle</strong> cae al abismo, reaparece tras <strong>10 segundos</strong>. Todo su daño base cuenta con un nerf del <strong>-15%</strong>.
          <br>• <strong>🥊 Buff a Gafas y Cinta Elección:</strong> Aumentan su bono de daño a un <strong>+50%</strong> (antes +45%).
          <br>• <strong>🐚 Nerf a Cascabel Concha:</strong> Solo cura un 1.5% al impactar con <strong>ataques básicos [Z]</strong> (ya no con proyectiles ni especiales).
          <br>• <strong>🧪 Objetos Consumibles (Pociones):</strong> Pulsa la <strong>tecla [1]</strong> para beber tu poción equipada y reducir daño del contador al instante.
        </p>
      </div>

      <!-- Section: Held Items -->
      <div style="margin-bottom: 24px;">
        <h3 style="color: #38bdf8; font-size: 17px; margin-bottom: 8px;">
          🎒 Mochila de Objetos de Pokémon (Held Items)
        </h3>
        <table class="moves-table">
          <thead>
            <tr>
              <th>Objeto</th>
              <th>Categoría</th>
              <th>Efecto de Combate</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($pokemon_items as $iId => $it): ?>
              <?php $cat = $pokemon_item_categories[$it['category']] ?? null; ?>
              <tr>
                <td style="font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
                  <?php if ($it['icon']): ?>
                    <img src="<?= $it['icon'] ?>" alt="" style="width: 22px; height: 22px; image-rendering: pixelated;">
                  <?php else: ?>
                    <span style="font-size: 14px;">🚫</span>
                  <?php endif; ?>
                  <?= $it['name'] ?>
                </td>
                <td style="white-space: nowrap;">
                  <?php if ($cat): ?>
                    <span style="font-size: 11px; color: #cbd5e1; font-weight: 600;"><?= $cat['icon'] ?> <?= $cat['name'] ?></span>
                  <?php endif; ?>
                </td>
                <td style="color: #cbd5e1;"><?= $it['desc'] ?></td>
                <td><span class="key-badge" style="font-size: 11px;"><?= $it['tag'] ?></span></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>

      <!-- Section: Weight & Knockback System -->
      <div style="margin-bottom: 24px; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 14px 18px;">
        <h3 style="color: #38bdf8; font-size: 16px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
          ⚖️ Nueva Mecánica: Categoría de PESO y Knockback (+20% General)
        </h3>
        <p style="font-size: 13px; color: #e2e8f0; line-height: 1.5;">
          Todo el <strong>knockback e impulso general</strong> ha aumentado un <strong>+20%</strong> en todos los combates.
          <br>• <strong>Peso Oficial de la Pokédex:</strong> Cada Pokémon cuenta con su peso oficial y categoría (Pluma, Ligero, Medio, Pesado).
          <br>• <strong>Velocidad vs Empuje:</strong> Los Pokémon con menos peso (<em>Minun/Plusle 4.2 kg</em>, <em>Pikachu 6.0 kg</em>) son más rápidos y ágiles en carrera, pero salen despedidos por los aires antes.
          <br>• <strong>Límite Estricto de Variación (±10%):</strong> El peso solo puede reducir o aumentar el knockback como <strong>máximo y como mínimo hasta un 10%</strong> (Gengar como peso pesado reduce hasta un -10% el knockback recibido, mientras que Minun y Plusle reciben hasta un +10%).
        </p>
      </div>

      <!-- Section: Movement, Roll & Z Balance -->
      <div style="margin-bottom: 24px; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 14px 18px;">
        <h3 style="color: #4ade80; font-size: 16px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
          🏃 Carrera (Dash), Roll Mejorado y Balance de Ataques Z
        </h3>
        <p style="font-size: 13px; color: #e2e8f0; line-height: 1.5;">
          • <strong>🏃 Doble Tap para Correr (Dash):</strong> Pulsa <strong>dos veces rápido</strong> izquierda (⬅️⬅️) o derecha (➡️➡️) en el suelo para iniciar una carrera veloz a máxima aceleración. ¡Además, la <strong>velocidad base de todos los Pokémon ha aumentado un +20%</strong>!
          <br>• <strong>🛡️ Roll de Gran Distancia:</strong> Al rodar por el suelo manteniendo escudo [C] + dirección, ahora recorres <strong>más del doble de distancia</strong> con frames de intangibilidad, permitiéndote escapar limpiamente de situaciones de presión.
          <br>• <strong>⏱️ Nerf a los Ataques Z:</strong> Se ha añadido un pequeño lag de <strong>0.2 segundos entre ataques básicos [Z]</strong> consecutivos, evitando spam desmedido y fomentando el ritmo y spacing táctico.
        </p>
      </div>

      <!-- Section: Pokemon Movesets -->
      <?php foreach ($fighters as $dex => $f): ?>
        <div style="margin-bottom: 24px;">
          <h3 style="color: <?= $f['type_color'] ?>; font-size: 17px; margin-bottom: 4px;">
            <?= $f['name'] ?> <span style="font-size: 13px; color: #94a3b8;">(Tipo: <?= $f['type'] ?> · ⚖️ Peso: <?= $f['weight'] ?> [<?= $f['weight_category'] ?>])</span>
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
  <script src="js/fighters/jigglypuff.js?v=<?= $v ?>"></script>
  <script src="js/ui/hud.js?v=<?= $v ?>"></script>
  <script src="js/game.js?v=<?= $v ?>"></script>

</body>
</html>
