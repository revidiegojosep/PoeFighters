# ⚔️ PokéFighters - Super Smash Bros Pokémon Edition

Un juego de lucha y plataformas estilo **Super Smash Bros** ambientado en el universo Pokémon, desarrollado con **HTML5 Canvas**, **Vanilla JavaScript**, **CSS3** y **PHP**.

---

## 🎮 Características Principales

- **Fighters Jugables**:
  - ⚡ **Pikachu** (Dex #25): Rápido, ágil, proyectiles Trueno y Rayo, combate aéreo veloz.
  - 🌿 **Bulbasaur** (Dex #1): Peso medio-pesado, especialista en látigo cepa y proyectiles vegetales.
    - *Básicos Z Ampliados*: Rango mejorado considerablemente en todos los ataques normales y aéreos [Z], acompañados de efectos visuales orgánicos de **Látigo Cepa** con estela esmeralda.
    - *Absorber* (Neutro X - **Rework**): Drena savia en un vórtice botánico causando daño y **reduciendo el contador de daño de Bulbasaur un 3%** al conectar.
    - *Hojas Navaja* (Lateral X - **Rework Dinámico**): Dispara una ráfaga de 3 hojas con **knockback aumentado un 20%** y lag de 0.4s. **El spread en abanico SOLO se hace si el ataque se realiza ANDANDO**. En cambio, si se ejecuta **CORRIENDO**, aumenta la velocidad de los proyectiles un **+20% (a 9.36) pero NO tiene spread** (disparo concentrado en línea recta).
    - *Bomba Germen* (Abajo X): Disparo parabólico que estalla en esporas. Mantener X permite cargar distancia e impulsarla mucho más lejos.
  - 🔋 **Minun y Plusle** (Dex #312 & #311): Pareja sincronizada inspirada en los *Ice Climbers*.
    - *Regla Climber*: Si **Minun muere, mueren ambos de inmediato** perdiendo la vida. Si **Plusle** cae fuera del escenario, reaparece a los **10 segundos** con alerta y temporizador visual en HUD.
    - *Salto Tándem con 0.4s de Retraso*: Plusle **salta exactamente 0.4 segundos después de Minun** (tanto en salto terrestre como en doble salto aéreo con física desfasada en tándem), pero **NUNCA salta por su propia cuenta** de forma autónoma. Cuenta con seguridad en bordes para no caer a los abismos.
    - *Placaje Magnético Dúo* (Lateral X): Embestida coordinada con estela de relámpagos, disparando 2 proyectiles de choque frontales. **Cooldown aumentado en +0.4s (a 1.10s)**.
    - *Refuerzo* (Abajo X): +10% de daño durante 5 segundos y **teletransporta a Plusle instantáneamente junto a Minun** si está cerca (≤ 350px).
    - *Balance*: Nerf del **15% en todo su daño base** para un combate equilibrado.
  - 👻 **Gengar** (Dex #94): Pokémon Fantasma/Veneno escurridizo y flotante.
    - *Físicas Floaty y Salto*: Gravedad reducida a 0.60x, caída lenta, suspensión aérea y **fuerza de salto reducida un 30%** (10.15) para un control aéreo perfecto.
    - *Bola Sombra* (Neutro X): Daño base y de carga aumentado en un 20% (10.8 base a 14.0 al 100%). Carga máxima en 2s. Lag de 0.42s y CD de 1.0s. Almacenable con esquive ⬅️/➡️.
    - *Puño Sombra* (Lateral X): Puñetazo espectral con lanzamiento vertical hacia arriba (88°) con knockback -30% para combos aéreos.
    - *Lenguetazo* (Lateral Z en suelo): Zarpazo lingual que aturde al rival durante 0.3 segundos.
    - *Teletransportación* (Arriba X): Desaparición en sombras y reaparición aérea a gran distancia.
    - *Tóxico AOE* (Abajo X): Nube circular venenosa que aplica el estado Veneno durante 5 segundos.
  - 💖 **Jigglypuff** (Dex #39) · **¡NUEVO EN UPDATE 1!**:
    - *Físicas Floaty & Balance de Salto*: Gravedad reducida (0.52x) y **5 saltos aéreos consecutivos con distancia máxima moderada** y curva de impulso decreciente para un control aéreo perfecto sin salir disparado.
    - *Desenrollar / Rollout* (Neutro X): Se enrolla en una bola acumulando inercia y velocidad para arrollar con gran knockback horizontal.
    - *Destructor / Pound* (Lateral X): Bofetón volador hacia adelante con **CD de 0.4 segundos** que inflige un colosal **daño de 55 a los escudos**, rompiéndolos al instante.
    - *Canto Somnífero / Sing* (Arriba X): Melodía en área circular con **0.4 segundos de lag al activarlo y CD aumentada a 5.0s**, durmiendo a los rivales que no logren reaccionar a tiempo.
    - *¡Descanso! / Rest* (Abajo X): El legendario ataque milimétrico de Smash Bros. Si conecta cuerpo a cuerpo directo dentro del rival, desata una **explosión devastadora con 25% de daño y un knockback vertical instantáneo demoledor**.
    - *Wall of Pain*: Capacidad de encadenar patadas aéreas Fair hacia el abismo arrastrando al rival fuera del escenario.

- **🌟 Novedades de la UPDATE 1**:
  - 📜 **Menú de Changelog**: Pantalla interactiva en cabecera y menú de inicio detallando todas las notas de actualización.
  - 🎮 **Rework del Menú de Inicio**: Nueva pantalla de bienvenida con showcase animado del roster y accesos directos a "JUGAR", "AJUSTES", "NOVEDADES" y "GUÍA".
  - 🕹️ **Menú de Partida Compacto y Retro**: Rediseñado con estética retro arcade, tipografía `'Press Start 2P'` y organización limpia.
  - 🎚️ **Slider de Dificultad CPU de 1 a 9**: Selector continuo de dificultad Smash (1: Principiante muy permisivo, 5: Intermedio equilibrado, 7: Difícil previo, 9: Inmejorable TAS con parries del 97% y reacción de 0.012s).
  - ⏱️ **Contador 3.. 2.. 1.. ¡YA!**: Entrada cinemática retro con beeps de sintetizador antes de comenzar la batalla.
  - 💡 **Iluminación Dinámica en Luchadores**: Los personajes reflejan en tiempo real los focos de luz y haces celestiales del mapa.
  - 🌠 **Estrellas Fugaces & Follaje Denso**: Firmamento con meteoros veloces y campo de batalla con hierba y flores más densas.
  - 🪞 **Indicador de Partida Espejo (Ditto Match)**: Si juegas contra el mismo Pokémon que el tuyo, tu personaje tiene un contorno cian brillante y etiqueta "P1".
  - 🧪 **Nerf de Pociones**: Curan un % del **daño acumulado actual** (Poción: 20%; SuperPoción: 50%), manteniendo la HiperPoción fija en 100%.
  - 🌀 **Físicas de Roll Aumentadas**: Distancia y velocidad del roll defensivo con escudo incrementadas.
  - 🐛 **Bug Fixing**: Corregido el spawn de la CPU Jugador para no superponerse sobre la CPU oponente al elegirse como IA.

- **Efecto de Salida de Pantalla Smash al Morir (Blast KO Update)**:
  - 💥 **Sacar de la Pantalla como en Smash Bros**: Al atravesar los límites del escenario, el luchador es **sacado completamente de la pantalla** durante la explosión (se mantiene invisible y fuera del mapa durante 0.8s).
  - 🌟 **Impacto en el Borde de la Pantalla**: La explosión de Blast Zone KO se ajusta al límite visible de la pantalla, generando:
    - **Haz láser estelar en cruz de 420px** con núcleo blanco y aura del color del Pokémon.
    - **Ondas de choque triples concéntricas** de hasta 320px de diámetro.
    - **Destello de impacto a pantalla completa** (*Screen Flash* reactivo).
    - **Sacudida de pantalla / cámara** (*Screen Shake* de alta intensidad).
    - **Plataforma Celestial de Reaparición**: El luchador desciende sobre una **plataforma flotante brillante de Smash Bros** con halos de energía antes de entrar al combate con 2 segundos de invulnerabilidad.

- **Ajustes de Físicas & Recovery**:
  - 🔄 **Hitstun Reducido un 50%**: El tiempo de parálisis y congelación (*stun* con destello blanco) tras recibir un impacto de lanzamiento ha sido **reducido un 50%**. Esto permite recuperar el control en el aire a tiempo para ejecutar saltos, esquives aéreos (Air Dodge) y movimientos de recuperación (Up Special) sin ser condenado a la blast zone.

- **Nuevo Sistema de Estados (Status Effects)**:
  - ☠️ **Veneno (Poison)**: Primer estado alterado de combate. Dura **5.0 segundos** y realiza daño cada **1.7 segundos**, incrementando un **3% del % ACTUAL** que tenga el enemigo. Cuanto más dañado esté el rival, mayor es el castigo del veneno.

- **Escenarios Competitivos Smash**:
  - 🏛️ **Campo de Batalla (Battlefield)**: Gran plataforma principal de 680px y 3 plataformas semi-sólidas flotantes de luz dura. Iluminación volumétrica con focos móviles de estadio y público con barritas de luz.
  - 🌌 **Destino Final (Final Destination)**: Escenario plano de torneo con una **única plataforma sólida de 720px y CERO plataformas flotantes**. Ambientado en una grieta dimensional cósmica con monolitos y asteroides de cristal flotantes.

- **Mochila de Objetos de Pokémon (Held Items & Consumibles)**:
  - 🧪 **Medicina & Pociones (Uso Activo con Tecla [1])**:
    - **Poción**: Pulsa [1] para consumir. Reduce en 20 el daño del contador. 3 cargas por combate. Cooldown: 15s.
    - **SuperPoción**: Pulsa [1] para consumir. Reduce en 50 el daño del contador. 2 cargas por combate. Cooldown: 40s.
    - **HiperPoción**: Pulsa [1] para consumir. Reduce en 100 el daño del contador. 1 carga por combate.
  - 🍒 **Bayas (Activación Automática)**:
    - **Baya Aranja**: Reduce un 20% el daño del contador tras noquear a un oponente (se activa automáticamente). 2 usos por combate.
  - 🥊 **Objetos de Combate**:
    - **Cinta Elección (Física)**: **+50% de daño** y empuje en ataques básicos [Z]. BLOQUEA ataques especiales [X].
    - **Gafas Elección (Especial)**: **+50% de daño** en ataques especiales [X]. BLOQUEA ataques básicos [Z].
    - **Pañuelo Elección**: +25% de velocidad y aceleración de movimiento.
    - **Vida Esfera**: +25% de daño en todos los ataques, con 1.5% de retroceso al golpear.
    - **Lupa**: El knockback de los ataques Smash cargados al 100% aumenta en un **+30%**. En cambio, reduce un **-30%** si no se ha cargado al 100%.
  - 🛡️ **Defensa & Evasión**:
    - **Cuerda Huida**: Aumenta un **30% la distancia del roll** y reduce un **10% el lag** entre esquives. Reduce la eficacia del escudo un 30% (recibe más daño).
    - **Casco Dentado**: Refleja un 4% de daño instantáneo al rival frente a ataques cuerpo a cuerpo directos.
    - **Banda Focus**: Una vez por vida, sobrevive a impactos que causarían un KO fatal.
    - **Cinta Focus**: 20% de probabilidad pasiva de reducir el daño y knockback recibido un 75%.
    - **Chaleco Asalto**: Reduce un 25% el daño recibido por proyectiles y ataques especiales rivales.
  - ✨ **Objetos Especiales**:
    - **Globo Helio**: Otorga físicas "Floaty" (menor gravedad y mayor suspensión aérea) hasta alcanzar el 50% de daño (donde explota). En Pokémon ya flotantes (Gengar), el efecto se reduce en un 80%.
    - **Restos**: Recupera un 1.5% de daño cada 2.0 segundos de combate de forma pasiva.
    - **Cascabel Concha**: Cura un 1.5% de daño acumulado **únicamente con ataques básicos [Z]** (Nerf: No funciona con especiales ni proyectiles).
  - 🛠️ **Arquitectura Universal de Objetos (Bug Fixing & Futuros Pokémon)**:
    - **Cálculo Centralizado**: Todo el escalado ofensivo y defensivo de objetos se procesa mediante `getModifiedHitbox(hitbox, isProjectile)`, asegurando que **Gafas Elección (+50% daño)** y **Vida Esfera (+25% daño)** potencien rigurosamente **todos los proyectiles y ataques especiales** presentes y futuros, mientras que **Cinta Elección** y **Cascabel Concha** se reservan exclusivamente para básicos [Z] y Smash.
    - **Restricción de Acciones**: Bloqueo absoluto de ataques básicos [Z] y carga Smash al llevar Gafas Elección, y de movimientos especiales [X] al llevar Cinta Elección.
    - **Protección Defensiva Integral**: Plusle y futuros aliados heredan soporte completo para Chaleco Asalto (-25% ante proyectiles/especiales), Cinta Focus (20% proc de -75% daño/kb), Casco Dentado, Banda Focus y Globo Helio.
    - **Reinicio Limpio por Vida**: La reactivación de Banda Focus y reabastecimiento de Globo Helio se ejecutan de manera garantizada tras cada reaparición.

- **Ajustes y Personalización**:
  - 🎒 **Interfaz Estilo Mochila Pokémon**: Selector organizado por pestañas de categoría (Medicina, Bayas, Combate, Defensa, Especiales) e indicador dinámico de cargas y enfriamiento en el HUD.
  - 🔊 **Control de Volumen y Audio**: Sliders para Volumen General, Música y SFX con opción de Silencio (Mute) y persistencia en `localStorage`.
  - ⌨️ **Keybinds Reconfigurables**: Tabla interactiva para reasignar cualquier tecla del teclado (incluida la tecla [1] de Poción).
  - 🎨 **Presets Gráficos de 4 Niveles & Sombras Reales**:
    - 🌟 **Ultra (Nueva Generación)**: Sombras dinámicas en tiempo real proyectadas en mapas y personajes (Drop Shadows y sombras de contacto bajo luchadores, Plusle y proyectiles pesados sobre las plataformas), sombras proyectadas de plataformas flotantes sobre el suelo principal, oclusión ambiental bajo repisas, foliage reactivo (hierba y flores ondulantes con viento suave, lianas colgantes con hojas), haces de luz volumétrica celestiales (God Rays), partículas de esporas y pétalos flotantes, y viñeteado cinematográfico.
    - ✨ **Alto (Anterior Ultra)**: Focos dinámicos de estadio, luces de escenario completas y partículas ricas.
    - ⚡ **Medio**: Sombras proyectadas estándar y partículas equilibradas.
    - 🍃 **Bajo (Actual Bajo)**: Rendimiento máximo optimizado sin sombras pesadas.
  - 🚀 **Soporte para 140 FPS & Pantalla de Alta Frecuencia**:
    - Selector dedicado de tasa de cuadros: **140 FPS (Recomendado)**, **120 FPS**, **60 FPS** o **Ilimitado / Frecuencia Máxima del Monitor (144Hz, 165Hz, 240Hz)**.
    - Contador de FPS en tiempo real integrado en la esquina de la arena con indicador luminoso de estabilidad.
    - Simulación física fija desacoplada a 60Hz para asegurar consistencia perfecta de hitboxes y frame data a cualquier tasa de refresco.
  - 🍃 **Estricto Control de Suavidad (Cero Temblores)**:
    - Ningún efecto gráfico nuevo genera vibraciones ni sacudidas en pantalla. La vegetación, lianas, haces de luz y partículas ambientales se mueven mediante ondas armónicas sinusoidales continuas y relajadas.
  - 📺 **Pantalla Completa**: Botón en cabecera y botón flotante en la arena para jugar a pantalla completa manteniendo pixel art nítido.

- **Mecánicas Smash Auténticas**:
  - ⚖️ **Categoría de PESO y Knockback Escalado**:
    - **+20% de knockback general** aplicado a todos los ataques para combates más dinámicos y aéreos.
    - Cada Pokémon cuenta con su **Peso Oficial de la Pokédex** y **Velocidades Base (+20%)**:
      - 🔋 **Minun & Plusle** (4.2 kg - *Pluma*): Máxima velocidad de desplazamiento y agilidad (`walk: 5.0, dash: 8.6`), mayor vulnerabilidad al knockback (+10% máx).
      - ⚡ **Pikachu** (6.0 kg - *Ligero*): Gran velocidad (`walk: 4.8, dash: 8.2`), +9% knockback recibido.
      - 🌿 **Bulbasaur** (6.9 kg - *Medio*): Velocidad equilibrada (`walk: 4.2, dash: 7.0`), +8.5% knockback recibido.
      - 👻 **Gengar** (40.5 kg - *Pesado*): Más lento y tanque (`walk: 4.0, dash: 6.6`), amortigua golpes con una reducción de knockback del **-10% (máximo permitido)**.
    - **Regla estricta de balance**: El peso modifica el knockback entre un **mínimo de -10% y un máximo de +10%**.
  - 🏃 **Doble Tap para Correr (Dash)**: Pulsa dos veces rápido izquierda o derecha (⬅️⬅️ / ➡️➡️) para correr velozmente a máxima aceleración con efectos de polvo.
  - 💥 **Ataques Cargados (Smash Attacks)**: Pulsa **dos veces rápido una dirección en el suelo (⬅️⬅️, ➡️➡️, ⬆️⬆️ o ⬇️⬇️) + mantener Z** para acumular energía (0% a 100%). Al soltar o alcanzar el 100%, desata un golpe demoledor con **impulso y knockback masivo (+75%)**, aura elemental y efectos visuales de impacto únicos para cada Pokémon.
  - 🛡️ **Air Dodge & Roll de Gran Distancia**: Pulsar **C en el aire** realiza un Air Dodge con frames de invulnerabilidad. Pulsar **C + ⬅️ o ➡️ en el suelo** realiza una rodada defensiva (*Roll*) que consume escudo, otorga intangibilidad y ahora cubre **más del doble de distancia** para escapar de castigos rivales.
  - ⏱️ **Balance de Ataques Básicos (Z)**: Pequeño lag de **0.2 segundos entre ataque** para evitar spam ininterrumpido y enfatizar el timing de combate.
  - **Salto Variable**: Pulsación rápida para salto corto (*Short Hop*), mantener pulsado para salto a máxima distancia (*Full Hop*).
  - **Bajar de Plataformas**: Doble pulsación rápida hacia abajo (⬇️⬇️) para atravesar plataformas semi-sólidas.
  - **Caída Rápida** (*Fast Fall*): Pulsar Abajo en el aire durante el descenso.
  - **Porcentaje de Daño & Knockback Escalar**: A mayor %, mayor impulso y distancia de lanzamiento.
  - **Blast Zones**: Fuera de los límites del estadio se produce un KO con efectos y explosiones de partículas.
  - **Escudo y Parada**: Mantener escudo para protegerse; recibir impactos desgasta el escudo hasta el Shield Break.

- **Modos de Juego**:
  - **Partida por 3 Vidas (Versus Battle)**: Gana quien conserve vidas en el marcador.
  - **Entrenamiento (Training Mode)**: Configura la CPU en modo Quieto, Salto, Agachado, CPU Fácil o CPU Batalla, y ajusta porcentajes a voluntad.
  - **Modo CPU vs CPU**: Posibilidad de configurar al Jugador 1 como CPU para simulaciones automáticas.
  - **3 Niveles de Inteligencia Artificial (CPU)**:
    - *Nivel 1 (Principiante)*: Movimiento básico y ataques sencillos.
    - *Nivel 2 (Intermedio)*: Espaciado de proyectiles, defensa con escudo, combos y recuperación fuera de escenario.
    - *Nivel 3 (Experto)*: Edge-guarding en los bordes, paradas precisas, picos meteóricos y persecución bajando de plataformas.

---

## 🕹️ Controles por Defecto

| Comando | Acción |
| :--- | :--- |
| **⬅️ / ➡️** (o A / D) | Moverse / Correr horizontalmente |
| **Espacio** | Salto Variable (Tap = Corto / Mantener = Máximo). Doble salto en el aire. |
| **⬇️⬇️ (Doble Abajo)** | Bajar de plataformas semi-sólidas |
| **⬇️ (En el aire)** | Caída rápida (*Fast Fall*) |
| **Z** | Ataques Básicos Cuerpo a Cuerpo (Neutro, Lateral, Arriba, Abajo / Spike) |
| **X** | Movimientos Especiales (Neutro, Lateral, Recuperación Arriba, Especial Abajo) |
| **C** | Escudo defensivo (Suelo) / Esquive Aéreo con i-frames (Aire) |
| **C + ⬅️/➡️** | Rodar por el suelo (*Ground Roll*) con frames de invencibilidad |
| **Soltar C (3 frames)** | **🛡️ Parry Perfecto (*Perfect Shield*)**: 0 daño, campana metálica, ojos brillantes y congela al rival 5 frames |
| **Borde del Escenario** | **🧗 Agarre al Borde (*Ledge Grab*)**: Agarre automático con 1s de invulnerabilidad. Opciones: **[Espacio]** Salto de borde, **[Z]** Ataque de borde, **[Arriba]** Subir normal, **[Abajo]** Soltar borde |
| **1** | Usar Objeto Activo (Consumir Poción / SuperPoción / HiperPoción) |
| **R** | Resetear posición y estados en Entrenamiento |
| **M** | Activar / Desactivar música del estadio |
| **Ctrl + F** | Alternar Pantalla Completa |
| *Personalizable* | Puedes reasignar todas las teclas desde el menú **⚙️ Ajustes** |

---

## 🏟️ Escenarios Disponibles

- **🏛️ Campo de Batalla (*Battlefield*)**: Plataforma principal sólida con 3 plataformas flotantes semi-sólidas.
- **🌌 Destino Final (*Final Destination*)**: Plataforma única y limpia suspendida sobre el vacío cósmico.
- **👻 Torre Pokémon de Pueblo Lavanda (*Lavender Town Tower*)**: Escenario tétrico en blanco/negro/morado con niebla animada multicapa, plataformas en forma de lápidas ancestrales y ojos fantasmales vigilantes en la oscuridad.

---

## 🎮 Flujo de Menú por Pasos (Estilo Super Smash Bros)

1. **① Reglas de la Partida**: Configuración de formato (Versus/Entrenamiento), número de vidas (1 a 10 stocks), límite de tiempo (Sin límite, 2m, 3m, 5m, 7m, 10m con reloj de arena retro en el HUD) y activación de la mochila de objetos.
2. **② Selección de Escenario**: Elección limpia del campo de batalla.
3. **③ Selección de Luchadores & Equipamiento**: Selección de Pokémon para P1 (Humano o CPU) y CPU rival con slider de dificultad 1 a 9 y equipamiento de objetos.

---

## 🚀 Instalación y Ejecución

1. Clona el repositorio dentro de tu directorio web (ej. `xampp/htdocs/PokeFighters`).
2. Inicia Apache en tu servidor local (XAMPP / WampServer / LAMP).
3. Abre en tu navegador `http://localhost/PokeFighters/`.
4. ¡Elige escenario, equipa tus objetos de Pokémon y entra al combate!
