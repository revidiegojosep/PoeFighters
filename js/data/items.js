/**
 * Pokemon Held Items System (Objetos Equipables)
 * Categorized items with active consumables, berries, choice items, and strategic playstyles.
 */
window.POKEMON_ITEM_CATEGORIES = {
  medicines: { id: 'medicines', name: 'Medicina & Pociones', icon: '🧪', color: '#10b981', desc: 'Objetos consumibles activos mediante la tecla [1]' },
  berries: { id: 'berries', name: 'Bayas', icon: '🍒', color: '#f43f5e', desc: 'Se activan automáticamente bajo condiciones específicas' },
  combat: { id: 'combat', name: 'Combate & Elección', icon: '🥊', color: '#3b82f6', desc: 'Modificadores ofensivos, velocidades y ataques Smash' },
  defense: { id: 'defense', name: 'Defensa & Supervivencia', icon: '🛡️', color: '#f59e0b', desc: 'Resistencia, mitigación de knockback y evasión' },
  special: { id: 'special', name: 'Especiales & Neutral', icon: '✨', color: '#8b5cf6', desc: 'Efectos singulares o combate estándar' }
};

window.POKEMON_ITEMS = {
  // --- MEDICINAS & CONSUMIBLES (TECLA [1]) ---
  potion: {
    id: 'potion',
    name: 'Poción',
    category: 'medicines',
    icon: 'assets/items/potion.png',
    desc: 'Pulsa la tecla [1] para consumir. Cura el 20% del daño acumulado actual (Nerf). 3 cargas por combate. CD: 15 segundos.',
    tag: 'Activo [1] (-20% Actual)',
    charges: 3,
    cooldown: 15.0,
    healPercent: 20,
    color: '#10b981'
  },
  'super-potion': {
    id: 'super-potion',
    name: 'SuperPoción',
    category: 'medicines',
    icon: 'assets/items/super-potion.png',
    desc: 'Pulsa la tecla [1] para consumir. Cura el 50% del daño acumulado actual (Nerf). 2 cargas por combate. CD: 40 segundos.',
    tag: 'Activo [1] (-50% Actual)',
    charges: 2,
    cooldown: 40.0,
    healPercent: 50,
    color: '#06b6d4'
  },
  'hyper-potion': {
    id: 'hyper-potion',
    name: 'HiperPoción',
    category: 'medicines',
    icon: 'assets/items/hyper-potion.png',
    desc: 'Pulsa la tecla [1] para consumir. Reduce en 100 fijo el daño del contador. 1 sola carga por combate.',
    tag: 'Activo [1] (-100 Fijo)',
    charges: 1,
    cooldown: 0,
    heal: 100,
    color: '#ec4899'
  },

  // --- BAYAS ---
  'oran-berry': {
    id: 'oran-berry',
    name: 'Baya Aranja',
    category: 'berries',
    icon: 'assets/items/oran-berry.png',
    desc: 'Reduce un 20% el daño del contador tras lograr una eliminación rival. Se activa automáticamente. 2 usos por combate.',
    tag: 'Auto-Eliminación',
    uses: 2,
    healPercent: 20,
    color: '#f43f5e'
  },

  // --- COMBATE & ELECCIÓN ---
  'choice-band': {
    id: 'choice-band',
    name: 'Cinta Elección (Física)',
    category: 'combat',
    icon: 'assets/items/choice-band.png',
    desc: 'Aumenta el daño de los ataques básicos [Z] un +50%, pero BLOQUEA todos los movimientos especiales [X].',
    tag: 'Solo Z (+50%)',
    color: '#3b82f6'
  },
  'choice-specs': {
    id: 'choice-specs',
    name: 'Gafas Elección (Especial)',
    category: 'combat',
    icon: 'assets/items/choice-specs.png',
    desc: 'Aumenta el daño de los movimientos especiales [X] un +50%, pero BLOQUEA todos los ataques básicos [Z].',
    tag: 'Solo X (+50%)',
    color: '#8b5cf6'
  },
  'choice-scarf': {
    id: 'choice-scarf',
    name: 'Pañuelo Elección',
    category: 'combat',
    icon: 'assets/items/choice-scarf.png',
    desc: 'Aumenta la velocidad de movimiento, carrera y aceleración en el aire un +25%.',
    tag: 'Velocidad (+25%)',
    color: '#0284c7'
  },
  'life-orb': {
    id: 'life-orb',
    name: 'Vida Esfera',
    category: 'combat',
    icon: 'assets/items/life-orb.png',
    desc: 'Aumenta el daño de todos los ataques un +25%, pero el usuario sufre 1.5% de retroceso al golpear.',
    tag: 'Ofensivo (+25%)',
    color: '#ef4444'
  },
  'wide-lens': {
    id: 'wide-lens',
    name: 'Lupa',
    category: 'combat',
    icon: 'assets/items/wide-lens.png',
    desc: 'El knockback de los ataques cargados al 100% aumenta en un +30%. En cambio, reduce un -30% si no se ha cargado al 100%.',
    tag: 'Smash 100%',
    color: '#a855f7'
  },

  // --- DEFENSA & SUPERVIVENCIA ---
  leftovers: {
    id: 'leftovers',
    name: 'Restos',
    category: 'defense',
    icon: 'assets/items/leftovers.png',
    desc: 'Recupera un 1.5% de daño cada 2.0 segundos de combate de forma pasiva y continua.',
    tag: 'Sustento Pasivo',
    color: '#10b981'
  },
  'air-balloon': {
    id: 'air-balloon',
    name: 'Globo Helio',
    category: 'defense',
    icon: 'assets/items/air-balloon.png',
    desc: 'Hace al Pokémon "Floaty" (menor gravedad y caída) hasta alcanzar el 50% de daño (donde explota). Si el Pokémon ya es floaty, el efecto se reduce en un 80%.',
    tag: 'Flotabilidad',
    color: '#38bdf8'
  },
  'escape-rope': {
    id: 'escape-rope',
    name: 'Cuerda Huida',
    category: 'defense',
    icon: 'assets/items/escape-rope.png',
    desc: 'Aumenta un +30% la distancia recorrida con un roll. Reduce un -10% el lag entre esquives. Reduce la eficacia del escudo un 30%.',
    tag: 'Super Evasión',
    color: '#d97706'
  },
  'focus-sash': {
    id: 'focus-sash',
    name: 'Banda Focus',
    category: 'defense',
    icon: 'assets/items/focus-sash.png',
    desc: 'Una vez por vida, sobrevive a un impacto que causaría un KO fatal fuera del escenario.',
    tag: 'Supervivencia',
    color: '#f59e0b'
  },
  'focus-band': {
    id: 'focus-band',
    name: 'Cinta Focus',
    category: 'defense',
    icon: 'assets/items/focus-band.png',
    desc: 'Probabilidad pasiva del 20% al recibir un golpe de reducir el daño y el empuje un 75%.',
    tag: 'Mitigación 20%',
    color: '#d97706'
  },
  'rocky-helmet': {
    id: 'rocky-helmet',
    name: 'Casco Dentado',
    category: 'defense',
    icon: 'assets/items/rocky-helmet.png',
    desc: 'Cuando el enemigo te golpea con ataques cuerpo a cuerpo directos, recibe 4% de daño reflejado instantáneo.',
    tag: 'Contraataque',
    color: '#ea580c'
  },
  'assault-vest': {
    id: 'assault-vest',
    name: 'Chaleco Asalto',
    category: 'defense',
    icon: 'assets/items/assault-vest.png',
    desc: 'Reduce un 25% todo el daño recibido por proyectiles y ataques especiales rivales.',
    tag: 'Defensa Especial',
    color: '#6366f1'
  },

  // --- ESPECIALES & NEUTRAL ---
  'shell-bell': {
    id: 'shell-bell',
    name: 'Cascabel Concha',
    category: 'special',
    icon: 'assets/items/shell-bell.png',
    desc: 'Recuperas 1.5% de daño acumulado al conectar un golpe. Nerf: SOLO funciona con ataques básicos [Z].',
    tag: 'Sustento Z',
    color: '#0284c7'
  },
  none: {
    id: 'none',
    name: 'Sin Objeto',
    category: 'special',
    icon: null,
    desc: 'Sin bonificaciones ni restricciones adicionales.',
    tag: 'Neutral',
    color: '#94a3b8'
  }
};

window.ItemHelper = {
  getItem: function(id) {
    return window.POKEMON_ITEMS[id] || window.POKEMON_ITEMS.none;
  },

  getAllItems: function() {
    return Object.values(window.POKEMON_ITEMS);
  },

  getItemsByCategory: function(catId) {
    return Object.values(window.POKEMON_ITEMS).filter(it => it.category === catId);
  },

  getCategories: function() {
    return Object.values(window.POKEMON_ITEM_CATEGORIES);
  }
};
