# ⚔️ PokéFighters - Super Smash Bros Pokémon Edition

Un juego de lucha y plataformas estilo **Super Smash Bros** ambientado en el universo Pokémon, desarrollado con **HTML5 Canvas**, **Vanilla JavaScript**, **CSS3** y **PHP**.

---

## 🎮 Características Principales

- **Fighters Jugables**:
  - ⚡ **Pikachu** (Dex #25): Rápido, ágil, proyectiles Trueno y Rayo, combate aéreo veloz.
  - 🌿 **Bulbasaur** (Dex #1): Peso medio-pesado, látigo cepa, drenadoras y bombas germen.
  - 🔋 **Minun y Plusle** (Dex #312 & #311): Pareja sincronizada inspirada en los *Ice Climbers*. Disparan proyectiles duales (+ y -). Acumulan daño de forma independiente; si Minun cae pero Plusle sobrevive, ¡Minun reaparece tras 7 segundos! Movimiento especial Abajo: **Refuerzo** (+10% de daño durante 5 segundos).
  - 👻 **Gengar** (Dex #94): Pokémon Fantasma/Veneno escurridizo y letal.
    - *Bola Sombra* (Neutro X): Esfera de energía umbría a alta velocidad.
    - *Lenguetazo* (Lateral X): Látigo espectral que **inmoviliza y aturde por 0.4 segundos**.
    - *Teletransportación* (Arriba X): Desaparición en sombras y reaparición aérea de recuperación.
    - *Tóxico AOE* (Abajo X): Nube circular venenosa que aplica el estado **Veneno** durante 5 segundos.

- **Nuevo Sistema de Estados (Status Effects)**:
  - ☠️ **Veneno (Poison)**: Primer estado alterado de combate. Dura **5.0 segundos** y realiza daño cada **1.7 segundos**, incrementando un **2% del % ACTUAL** que tenga el enemigo. Cuanto más dañado esté el rival, mayor es el castigo del veneno.

- **Escenarios Competitivos Smash**:
  - 🏛️ **Campo de Batalla (Battlefield)**: Gran plataforma principal de 680px y 3 plataformas semi-sólidas flotantes de luz dura. Iluminación volumétrica con focos móviles de estadio y público con barritas de luz.
  - 🌌 **Destino Final (Final Destination)**: Escenario plano de torneo con una **única plataforma sólida de 720px y CERO plataformas flotantes**. Ambientado en una grieta dimensional cósmica con monolitos y asteroides de cristal flotantes.

- **Objetos Equipables de Pokémon (Held Items)**:
  - 🍎 **Restos**: Recupera un 1.5% de vida cada 2.0 segundos de combate de forma pasiva.
  - 🔴 **Vida Esfera**: +25% de daño en todos los ataques, con 1.5% de retroceso al golpear.
  - 🥊 **Cinta Elección (Física)**: +35% daño y empuje en ataques básicos [Z]. **BLOQUEA** ataques especiales [X].
  - 👓 **Gafas Elección (Especial)**: +35% daño en ataques especiales [X]. **BLOQUEA** ataques básicos [Z].
  - 🧣 **Pañuelo Elección**: +25% de velocidad y aceleración de movimiento.
  - 🪖 **Casco Dentado**: Refleja un 4% de daño instantáneo al rival frente a ataques cuerpo a cuerpo directos.
  - 🎗️ **Banda Focus**: Una vez por vida, sobrevive a impactos que causarían un KO fatal.
  - 🥋 **Cinta Focus**: 20% de probabilidad pasiva de reducir el daño y knockback recibido un 75%.
  - 🦺 **Chaleco Asalto**: Reduce un 25% el daño recibido por proyectiles y ataques especiales rivales.
  - 🐚 **Cascabel Concha**: Cura un 1.5% de daño acumulado cada vez que conectas un golpe en el oponente.

- **Ajustes y Personalización**:
  - 🔊 **Control de Volumen y Audio**: Sliders para Volumen General, Música y SFX con opción de Silencio (Mute) y persistencia en `localStorage`.
  - ⌨️ **Keybinds Reconfigurables**: Tabla interactiva para reasignar cualquier tecla del teclado a los comandos de combate Smash.
  - 🎨 **Presets Gráficos**: Calidad Ultra (luces y partículas 60fps), Alto y Bajo (rendimiento optimizado).
  - 📺 **Pantalla Completa**: Botón en cabecera y botón flotante en la arena para jugar a pantalla completa manteniendo pixel art nítido.

- **Mecánicas Smash Auténticas**:
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
| **C** | Escudo defensivo |
| **R** | Resetear posición y estados en Entrenamiento |
| **M** | Activar / Desactivar música del estadio |
| **Ctrl + F** | Alternar Pantalla Completa |
| *Personalizable* | Puedes reasignar todas las teclas desde el menú **⚙️ Ajustes** |

---

## 🚀 Instalación y Ejecución

1. Clona el repositorio dentro de tu directorio web (ej. `xampp/htdocs/PokeFighters`).
2. Inicia Apache en tu servidor local (XAMPP / WampServer / LAMP).
3. Abre en tu navegador `http://localhost/PokeFighters/`.
4. ¡Elige escenario, equipa tus objetos de Pokémon y entra al combate!
