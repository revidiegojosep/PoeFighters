/**
 * Pokemon Held Items System (Objetos Equipables)
 * Provides passive stats, combat modifiers, and strategic playstyles.
 */
window.POKEMON_ITEMS = {
  none: {
    id: 'none',
    name: 'Sin Objeto',
    icon: null,
    desc: 'Sin bonificaciones ni restricciones adicionales.',
    tag: 'Neutral'
  },
  leftovers: {
    id: 'leftovers',
    name: 'Restos',
    icon: 'assets/items/leftovers.png',
    desc: 'Recupera un 1.5% de daño cada 2.0 segundos de combate de forma continua.',
    tag: 'Sustento',
    color: '#10b981'
  },
  'life-orb': {
    id: 'life-orb',
    name: 'Vida Esfera',
    icon: 'assets/items/life-orb.png',
    desc: 'Aumenta el daño de todos los ataques un +25%, pero el usuario sufre 1.5% de retroceso al golpear.',
    tag: 'Ofensivo',
    color: '#ef4444'
  },
  'choice-band': {
    id: 'choice-band',
    name: 'Cinta Elección (Física)',
    icon: 'assets/items/choice-band.png',
    desc: 'Aumenta el daño y knockback de los ataques básicos [Z] un +35%, pero BLOQUEA todos los movimientos especiales [X].',
    tag: 'Elección Z',
    color: '#3b82f6'
  },
  'choice-specs': {
    id: 'choice-specs',
    name: 'Gafas Elección (Especial)',
    icon: 'assets/items/choice-specs.png',
    desc: 'Aumenta el daño de los movimientos especiales [X] un +35%, pero BLOQUEA todos los ataques básicos cuerpo a cuerpo [Z].',
    tag: 'Elección X',
    color: '#8b5cf6'
  },
  'choice-scarf': {
    id: 'choice-scarf',
    name: 'Pañuelo Elección',
    icon: 'assets/items/choice-scarf.png',
    desc: 'Aumenta la velocidad de movimiento, carrera y aceleración en el aire un +25%.',
    tag: 'Velocidad',
    color: '#06b6d4'
  },
  'focus-sash': {
    id: 'focus-sash',
    name: 'Banda Focus',
    icon: 'assets/items/focus-sash.png',
    desc: 'Una vez por vida, si un golpe fatal te lanzaría fuera del escenario, resistes el impacto y conservas el control.',
    tag: 'Supervivencia',
    color: '#f59e0b'
  },
  'focus-band': {
    id: 'focus-band',
    name: 'Cinta Focus',
    icon: 'assets/items/focus-band.png',
    desc: 'Probabilidad pasiva del 20% al recibir un golpe de reducir el daño y el empuje un 75%.',
    tag: 'Defensivo',
    color: '#d97706'
  },
  'rocky-helmet': {
    id: 'rocky-helmet',
    name: 'Casco Dentado',
    icon: 'assets/items/rocky-helmet.png',
    desc: 'Cuando el enemigo te golpea con ataques cuerpo a cuerpo directos, recibe 4% de daño reflejado instantáneo.',
    tag: 'Contraataque',
    color: '#ea580c'
  },
  'assault-vest': {
    id: 'assault-vest',
    name: 'Chaleco Asalto',
    icon: 'assets/items/assault-vest.png',
    desc: 'Reduce un 25% todo el daño recibido por proyectiles y ataques especiales rivales.',
    tag: 'Defensa Especial',
    color: '#6366f1'
  },
  'shell-bell': {
    id: 'shell-bell',
    name: 'Cascabel Concha',
    icon: 'assets/items/shell-bell.png',
    desc: 'Cada vez que conectas un golpe en el rival, recuperas (reduces) un 1.5% de tu daño acumulado.',
    tag: 'Sustento',
    color: '#0284c7'
  }
};

window.ItemHelper = {
  getItem: function(id) {
    return window.POKEMON_ITEMS[id] || window.POKEMON_ITEMS.none;
  },

  getAllItems: function() {
    return Object.values(window.POKEMON_ITEMS);
  }
};
