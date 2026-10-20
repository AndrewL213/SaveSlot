# SaveSlot — sitio web

Versión funcional de la web de SaveSlot ("Tu solución gamer"). Proyecto académico de Creación Digital, Universidad El Bosque.

Es un sitio estático (HTML, CSS y JavaScript sin dependencias). No necesita compilar nada.

## Cómo verlo

- **En línea:** activa GitHub Pages en *Settings › Pages › Deploy from a branch › `main` / root*. Queda en `https://andrewl213.github.io/SaveSlot/`.
- **En tu computador:** abre una terminal en esta carpeta y corre `python3 -m http.server 8000`. Luego entra a `http://localhost:8000`.

## Páginas

| Página | Archivo |
|---|---|
| Inicio (mejores de la semana, reseñas, eventos, popup del evento del mes) | `index.html` |
| Búsqueda con filtros | `buscar.html` |
| Juego random por género | `random.html` |
| Página de juego (dificultad, tiempos, reseñas, guías, clips, logros) | `juego.html?id=…` |
| Eventos (torneos y sorteos) | `eventos.html` |
| Detalle e inscripción de evento | `evento.html?id=…` |
| Escribir reseña, guía o clip (con registro en el diario) | `resena.html?id=…` |
| Logros | `logros.html` |
| Iniciar sesión / Crear cuenta | `login.html`, `registro.html` |
| Perfil (actividad, 4 favoritos, géneros, calificaciones, lista de deseos) | `perfil.html` |
| Editar perfil y cuentas vinculadas | `editar-perfil.html` |
| Diario de juegos | `diario.html` |
| MatchPlay (chat con IA, historial y tendencias) | `matchplay.html` |
| Contáctanos | `contacto.html` |
| Error de APIs y limitantes | `error.html?tipo=…` |
| No encontrado | `404.html` |

## Qué funciona hoy

- Cuentas, reseñas, diario, favoritos (máximo 4), lista de deseos, inscripciones a eventos y chats de MatchPlay. Todo se guarda **solo en el navegador** (localStorage). Hay una cuenta de demostración en `login.html`.
- Los datos de juegos son de ejemplo (`js/data.js`) hasta conectar las APIs.
- MatchPlay responde en modo demo.

## Página de error (APIs y limitantes)

`error.html` explica qué pasó y qué puede hacer el usuario, y muestra el estado de cada servicio. Tipos:

| `tipo` | Cuándo aparece |
|---|---|
| `api` | La API no respondió o devolvió error 5xx |
| `limite` | Se llegó al límite de consultas (HTTP 429). El botón Reintentar se activa a los 60 s |
| `tiempo` | La API tardó más de `TIMEOUT_MS` |
| `credenciales` | Clave inválida o vencida (HTTP 401/403) |
| `mantenimiento` | El servicio está en mantenimiento (HTTP 503) |
| `sin-conexion` | El dispositivo no tiene internet |
| `plataforma` | Se intenta vincular PlayStation o Nintendo (no tienen API pública) |
| `pagos` | Se elige una opción de pago (no hay pasarela conectada) |
| `funcion` | Función que depende de una API pendiente (Google, Discord, subir clips) |
| `demo` / `estado` | Información del prototipo y estado de los servicios |

Para probarla en cualquier página: agrega `?simular=limite` (o `api`, `tiempo`, `mantenimiento`, `sin-conexion`, `credenciales`). Ejemplo: `buscar.html?simular=limite&servicio=RAWG`.

## Conectar APIs

Edita `js/config.js`:

- `RAWG_KEY`: clave de RAWG para el catálogo real (RAWG permite usarla desde el navegador). Exige poner un enlace a RAWG; el pie de página ya lo agrega cuando hay clave.
- `AI_ENDPOINT`: URL de una función serverless propia (Vercel, Netlify o Cloudflare) que llame a Claude o Gemini. **Nunca** pongas la clave de la IA en este repositorio: el archivo es público.

Steam, Xbox (OpenXBL), Discord, Twitch e IGDB necesitan un backend porque usan secretos o no permiten llamadas desde el navegador (CORS).

## Estructura

```
css/styles.css       estilos y tokens (paleta, tipografía, hover)
js/config.js         claves públicas y opciones
js/data.js           datos de ejemplo
js/api.js            capa de datos y manejo de errores → error.html
js/app.js            sesión, almacenamiento, header, footer, modales
js/pages-juegos.js   inicio, búsqueda, juego, random, eventos, reseñas, logros
js/pages-cuenta.js   login, registro, perfil, editar, diario, MatchPlay, contacto, error
```
