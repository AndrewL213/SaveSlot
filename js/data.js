/* SaveSlot — datos de ejemplo.
   Se usan mientras no haya claves de API configuradas (ver js/config.js).
   Las horas, notas y votos son valores de ejemplo para el prototipo. */
window.SS_DATA = {
  games: [
    { id: 'zelda-totk', name: 'The Legend of Zelda: Tears of the Kingdom', short: 'Zelda: TOTK', genres: ['Aventura'], platforms: ['Nintendo'], year: 2023, dev: 'Nintendo EPD', type: 'AAA', hoursMain: 60, hours100: 220, difficulty: 6, rating: 4.8, votes: 12430, color: '#2F6B4F', achievements: 139,
      desc: 'Mundo abierto enorme donde cada puzzle tiene varias soluciones gracias a Ultramano.' },
    { id: 'nier-automata', name: 'NieR: Automata', short: 'NieR: Automata', genres: ['RPG', 'Acción'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2017, dev: 'PlatinumGames', type: 'AAA', hoursMain: 20, hours100: 70, difficulty: 6, rating: 4.7, votes: 8120, color: '#7C7566', achievements: 50,
      desc: 'Combate ágil y una historia que cambia por completo con cada final.' },
    { id: 'rocket-league', name: 'Rocket League', short: 'Rocket League', genres: ['Deportes'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2015, dev: 'Psyonix', type: 'AAA', hoursMain: null, hours100: null, difficulty: 7, rating: 4.3, votes: 9840, color: '#2456C4', achievements: 88,
      desc: 'Fútbol con autos. Partidas de 5 minutos y torneos oficiales varias veces al día.' },
    { id: 'valorant', name: 'Valorant', short: 'Valorant', genres: ['Shooter'], platforms: ['PC', 'PlayStation', 'Xbox'], year: 2020, dev: 'Riot Games', type: 'AAA', hoursMain: null, hours100: null, difficulty: 8, rating: 4.2, votes: 7650, color: '#5B3F96', achievements: 0,
      desc: 'Shooter táctico 5v5 con agentes de habilidades únicas.' },
    { id: 'pokemon-legends-za', name: 'Pokémon Legends Z-A', short: 'Pokémon Legends Z-A', genres: ['RPG'], platforms: ['Nintendo'], year: 2025, dev: 'Game Freak', type: 'AAA', hoursMain: 30, hours100: 80, difficulty: 3, rating: 4.4, votes: 5310, color: '#B8343E', achievements: 0,
      desc: 'Captura y combate en tiempo real dentro de Ciudad Luminalia.' },
    { id: 'fnaf-into-the-pit', name: "Five Nights at Freddy's: Into the Pit", short: 'FNAF: Into the Pit', genres: ['Terror'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2024, dev: 'Mega Cat Studios', type: 'Indie', hoursMain: 6, hours100: 10, difficulty: 5, rating: 4.1, votes: 2140, color: '#6B3A1E', achievements: 24,
      desc: 'Aventura de terror corta con tensión constante y pocos sustos baratos.' },
    { id: 'hollow-knight', name: 'Hollow Knight', short: 'Hollow Knight', genres: ['Aventura', 'Metroidvania'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2017, dev: 'Team Cherry', type: 'Indie', hoursMain: 27, hours100: 60, difficulty: 7, rating: 4.7, votes: 9010, color: '#2B3A55', achievements: 63,
      desc: 'Metroidvania exigente con un mundo para explorar sin prisa.' },
    { id: 'hades', name: 'Hades', short: 'Hades', genres: ['Roguelike', 'Acción'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2020, dev: 'Supergiant Games', type: 'Indie', hoursMain: 22, hours100: 95, difficulty: 6, rating: 4.8, votes: 7720, color: '#8A2B2B', achievements: 49,
      desc: 'Escapa del inframundo partida a partida mientras la historia avanza.' },
    { id: 'elden-ring', name: 'Elden Ring', short: 'Elden Ring', genres: ['RPG', 'Acción'], platforms: ['PC', 'PlayStation', 'Xbox'], year: 2022, dev: 'FromSoftware', type: 'AAA', hoursMain: 55, hours100: 130, difficulty: 8, rating: 4.8, votes: 11200, color: '#3E5A2A', achievements: 42,
      desc: 'Mundo abierto oscuro y desafiante con libertad total para explorar.' },
    { id: 'ghost-of-tsushima', name: 'Ghost of Tsushima', short: 'Ghost of Tsushima', genres: ['Aventura', 'Acción'], platforms: ['PlayStation', 'PC'], year: 2020, dev: 'Sucker Punch', type: 'AAA', hoursMain: 25, hours100: 60, difficulty: 5, rating: 4.7, votes: 6400, color: '#7A2E2E', achievements: 52,
      desc: 'Samurái en mundo abierto con combate preciso y un viento que te guía.' },
    { id: 'inside', name: 'Inside', short: 'Inside', genres: ['Terror', 'Plataformas'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2016, dev: 'Playdead', type: 'Indie', hoursMain: 3, hours100: 5, difficulty: 4, rating: 4.6, votes: 4300, color: '#3A3F45', achievements: 14,
      desc: 'Plataformas oscuro y sin diálogos. Se termina en una tarde.' },
    { id: 'hades-ii', name: 'Hades II', short: 'Hades II', genres: ['Roguelike', 'Acción'], platforms: ['PC', 'Nintendo'], year: 2025, dev: 'Supergiant Games', type: 'Indie', hoursMain: 30, hours100: 100, difficulty: 6, rating: 4.7, votes: 3100, color: '#5A2D6B', achievements: 50,
      desc: 'Secuela de Hades con nueva protagonista, Melínoe, y nuevas armas.' }
  ],
  reviews: [
    { game: 'nier-automata', user: 'kenvel', initials: 'KV', hours: 42, score: 9, diff: 6, useful: 128, text: 'La segunda vuelta no es relleno: cambia todo lo que creías saber. Juégalo completo antes de opinar.' },
    { game: 'rocket-league', user: 'juanvi', initials: 'JV', hours: 300, score: 8, diff: 7, useful: 74, text: 'Fácil de empezar, difícil de dominar. Si llegas a Diamante, revisa la guía de aéreos de la comunidad.' },
    { game: 'zelda-totk', user: 'andresh', initials: 'AH', hours: 48, score: 10, diff: 6, useful: 203, text: 'Ultramano cambia cómo resuelves todo. Haz las islas del cielo antes de bajar al subsuelo.' },
    { game: 'zelda-totk', user: 'mlopez', initials: 'ML', hours: 31, score: 8, diff: 5, useful: 88, text: 'Enorme y generoso. El rendimiento baja en zonas con muchos efectos, pero nunca me sacó del juego.' },
    { game: 'zelda-totk', user: 'valer1a', initials: 'VR', hours: 190, score: 9, diff: 7, useful: 61, spoiler: true, text: 'El final conecta con todo lo que pasó en el cielo. Que la batalla contra Ganondorf sea en caída libre es lo mejor del juego.' },
    { game: 'hollow-knight', user: 'd4ni', initials: 'DA', hours: 60, score: 10, diff: 8, useful: 140, text: 'Cada zona tiene identidad propia. Los jefes opcionales son los mejores del género.' }
  ],
  guides: [
    { game: 'zelda-totk', title: 'Las 4 regiones en el orden recomendado', mins: 12, useful: 94 },
    { game: 'zelda-totk', title: 'Cómo conseguir la armadura Zonai', mins: 6, useful: 88 },
    { game: 'valorant', title: 'Agentes para empezar si vienes de CS', mins: 8, useful: 89 },
    { game: 'nier-automata', title: 'Todos los finales sin perderte ninguno', mins: 15, useful: 91 },
    { game: 'rocket-league', title: 'Aéreos básicos en 10 minutos', mins: 10, useful: 86 }
  ],
  events: [
    { id: 'copa-2v2', type: 'Torneo', game: 'rocket-league', title: 'Copa SaveSlot de Rocket League 2v2', when: 'Sáb 17 oct · 3:00 p. m.', org: '[MARCA] + [ORGANIZADOR]', orgType: 'Marcas y organizadores', slots: 41, max: 64, cost: '[VALOR]', free: false, color: '#1F4A8A', featured: true },
    { id: 'rl-oficial', type: 'Torneo', game: 'rocket-league', title: 'Torneo oficial 3v3 cada [X] horas', when: 'Hoy · próximo a las [HORA]', org: 'Oficial · Psyonix (desarrolladora)', orgType: 'Desarrolladoras oficiales', slots: null, max: null, cost: 'Gratis', free: true, color: '#2456C4' },
    { id: 'liga-valorant', type: 'Torneo', game: 'valorant', title: 'Liga universitaria Bogotá', when: 'Sáb 24 oct · 10:00 a. m.', org: '[MARCA] + [ORGANIZADOR]', orgType: 'Marcas y organizadores', slots: 12, max: 32, cost: '[VALOR]', free: false, color: '#5B3F96' },
    { id: 'giftcard-50', type: 'Sorteo', game: null, title: 'Gift card de 50 USD para tu tienda favorita', when: 'Cierra el domingo · 8:00 p. m.', org: 'SaveSlot', orgType: 'SaveSlot', slots: 1284, max: null, cost: '300 XP o [VALOR]', free: true, color: '#2B5A3F' },
    { id: 'speedrun-fnaf', type: 'Torneo', game: 'fnaf-into-the-pit', title: 'Speedrun de Halloween', when: 'Vie 30 oct · 6:00 p. m.', org: '[ORGANIZADOR] (independiente)', orgType: 'Marcas y organizadores', slots: 58, max: 100, cost: 'Gratis', free: true, color: '#6B3A1E' },
    { id: 'codigo-pokemon', type: 'Sorteo', game: 'pokemon-legends-za', title: 'Código de descarga de Pokémon Legends Z-A', when: 'Cierra el 31 oct', org: '[MARCA]', orgType: 'Marcas y organizadores', slots: 3020, max: null, cost: '300 XP', free: true, color: '#B8343E' }
  ],
  trending: [
    { tag: 'En tendencia · Rocket League', q: '¿Cada cuánto hay torneos en Rocket League?', meta: '2,1k preguntas hoy' },
    { tag: 'Lanzamientos', q: '¿Qué juegos nuevos salen esta semana?', meta: '1,6k preguntas hoy' },
    { tag: 'En tendencia · Pokémon Legends Z-A', q: '¿Qué hago primero en Pokémon Legends Z-A?', meta: '1,2k preguntas hoy' },
    { tag: 'Guía', q: '¿Cuánto dura Hollow Knight al 100%?', meta: '860 preguntas hoy' }
  ],
  achievements: [
    { game: 'zelda-totk', name: 'Primer santuario', desc: 'Completa tu primer santuario', pct: 92, got: true },
    { game: 'zelda-totk', name: 'Explorador del cielo', desc: 'Visita todas las islas del cielo', pct: 14, got: true },
    { game: 'zelda-totk', name: 'Maestro Zonai', desc: 'Fusiona 50 dispositivos distintos', pct: 8, got: false },
    { game: 'fnaf-into-the-pit', name: 'Sin un rasguño', desc: 'Termina sin recibir daño', pct: 3.1, got: true },
    { game: 'nier-automata', name: 'Final E', desc: 'Llega al final verdadero', pct: 22, got: true }
  ],
  diarySeed: [
    { game: 'zelda-totk', date: '2026-10-07', state: 'Terminado', hours: 48, score: 10, like: true, review: true },
    { game: 'fnaf-into-the-pit', date: '2026-10-04', state: 'Terminado', hours: 6, score: 7, like: false, review: true },
    { game: 'nier-automata', date: '2026-10-02', state: 'Rejugado', hours: 21, score: 9, like: true, review: true },
    { game: 'hades', date: '2026-09-27', state: 'Terminado', hours: 24, score: 8, like: false, review: false },
    { game: 'valorant', date: '2026-09-19', state: 'Abandonado', hours: 9, score: 5, like: false, review: true },
    { game: 'pokemon-legends-za', date: '2026-09-08', state: 'Terminado', hours: 31, score: 8, like: true, review: false },
    { game: 'inside', date: '2026-08-30', state: 'Terminado', hours: 3, score: 9, like: true, review: false },
    { game: 'hollow-knight', date: '2026-08-12', state: 'Rejugado', hours: 27, score: 9, like: true, review: true }
  ]
};
