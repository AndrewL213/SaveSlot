/* SaveSlot — configuración.
   IMPORTANTE: este archivo se publica. No pongan aquí secretos (client secrets, claves de Claude/Gemini, tokens).
   - RAWG_KEY: la clave de RAWG sí puede usarse desde el navegador (es la forma documentada por RAWG),
     pero tiene cupo mensual. Si la dejan vacía, la web usa los datos de ejemplo de js/data.js.
   - AI_ENDPOINT: URL de una función serverless propia (Vercel/Netlify/Cloudflare) que llame a Claude o Gemini
     guardando la clave en el servidor. Vacío = MatchPlay responde en modo demo.
   Estado de cada API: ver claude/apis-saveslot.md en el proyecto. */
window.SS_CONFIG = {
  RAWG_KEY: '',
  AI_ENDPOINT: '',
  // Tiempo máximo de espera de una API antes de mostrar la página de error (ms)
  TIMEOUT_MS: 8000,
  // Plataformas sin API pública: al intentar vincularlas se muestra la página de error tipo "plataforma"
  PLATFORMS_WITHOUT_API: ['PlayStation', 'Nintendo']
};
