# ⚔️ PokéFighters - Super Smash Bros Pokémon Edition

Un juego de lucha y plataformas estilo **Super Smash Bros** ambientado en el universo Pokémon, desarrollado con **HTML5 Canvas**, **Vanilla JavaScript**, **CSS3** y **PHP**.

---

## 🎮 Características Principales

- **Fighters Jugables**:
  - ⚡ **Pikachu** (Dex #25): Rápido, ágil, proyectiles Trueno y Rayo, combate aéreo veloz.
  - 🌿 **Bulbasaur** (Dex #1): Peso medio-pesado, látigo cepa, drenadoras y bombas solares.
  - 🔋 **Minun y Plusle** (Dex #312 & #311): Pareja sincronizada inspirada en los *Ice Climbers*. Disparan proyectiles duales (+ y -). Acumulan daño de forma independiente; si Minun cae pero Plusle sobrevive, ¡Minun reaparece tras 7 segundos! Movimiento especial Abajo: **Refuerzo** (+10% de daño durante 5 segundos).
- **Mecánicas Smash Auténticas**:
  - **Salto Variable**: Pulsación rápida para salto corto (*Short Hop*), mantener pulsado para salto a máxima distancia (*Full Hop*).
  - **Bajar de Plataformas**: Doble pulsación rápida hacia abajo (⬇️⬇️) para atravesar plataformas semi-sólidas.
  - **Caída Rápida** (*Fast Fall*): Pulsar Abajo en el aire durante el descenso.
  - **Porcentaje de Daño & Knockback Escalar**: A mayor %, mayor impulso y distancia de lanzamiento.
  - **Blast Zones**: Fuera de los límites del estadio se produce un KO con efectos y explosiones de partículas.
  - **Escudo y Parada**: Mantener escudo para protegerse; recibir impactos desgasta el escudo hasta el Shield Break.
- **Gran Arena Battlefield**:
  - Plataforma principal de 680px (+31% más espaciosa).
  - Distribución clásica Tri-plat con plataformas semi-sólidas flotantes de luz dura.
  - Iluminación volumétrica con focos móviles de estadio, público animado con barritas de luz, cielo estelar cósmico y emblema central Pokéball con núcleo brillante.
- **Modos de Juego**:
  - **Partida por 3 Vidas (Versus Battle)**: Gana quien conserve vidas en el marcador.
  - **Entrenamiento (Training Mode)**: Configura la CPU en modo Quieto, Salto, Agachado, CPU Fácil o CPU Batalla, y ajusta porcentajes a voluntad.
  - **Modo CPU vs CPU**: Posibilidad de configurar al Jugador 1 como CPU para simulaciones automáticas.
  - **3 Niveles de Inteligencia Artificial (CPU)**:
    - *Nivel 1 (Principiante)*: Movimiento básico y ataques sencillos.
    - *Nivel 2 (Intermedio)*: Espaciado de proyectiles, defensa con escudo, combos y recuperación fuera de escenario.
    - *Nivel 3 (Experto)*: Edge-guarding en los bordes, paradas precisas, picos meteóricos y persecución bajando de plataformas.

---

## 🕹️ Controles

| Tecla | Acción |
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

---

## 🚀 Instalación y Ejecución

1. Clona el repositorio dentro de tu directorio web (ej. `xampp/htdocs/PokeFighters`).
2. Inicia Apache en tu servidor local (XAMPP / WampServer / LAMP).
3. Abre en tu navegador `http://localhost/PokeFighters/` o la ruta correspondiente.
4. ¡Elige tus Pokémon, ajusta la dificultad y entra al combate!
