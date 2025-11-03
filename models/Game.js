import mongoose from 'mongoose'

const gameSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  genero: { type: String, required: true },
  plataforma: { type: String, required: true },
  anioLanzamiento: { type: Number, required: true },
  ClasificacionEdad: { type: String, required: true },
  desarrollador: { type: String, required: true },
  imagenPortada: { type: String, required: true },
  descripcion: { type: String, default: 'Comienza tu aventura' },
  completado: { type: Boolean, default: false },
  misjuegos: {type: Boolean, default: false},
  fechaCreacion: { type: Date, default: Date.now },
})

const juegos = [
  {
    titulo: 'Call of Duty',
    genero: ['Acción', 'FPS', 'Multijugador'],
    plataforma: 'PC, PlayStation, Xbox',
    anioLanzamiento: 2003,
    ClasificacionEdad: '+18',
    desarrollador: 'Infinity Ward',
    imagenPortada: './Portadas/Call_of_Duty.jpg',
    descripcion: 'Juego de disparos en primera persona ambientado en conflictos bélicos.',
    completado: false
  },
  {
    titulo: 'Fortnite',
    genero: ['Acción', 'Supervivencia', 'Multijugador'],
    plataforma: 'PC, PlayStation, Xbox, Switch, Mobile',
    anioLanzamiento: 2017,
    ClasificacionEdad: '+12',
    desarrollador: 'Epic Games',
    imagenPortada: './Portadas/Fortnite.jpg',
    descripcion: 'Juego battle royale donde debes sobrevivir y ser el último en pie.',
    completado: false
  },
  {
    titulo: 'Hollow Knight',
    genero: ['Indie', 'Aventura', 'Acción'],
    plataforma: 'PC, Switch, PlayStation, Xbox',
    anioLanzamiento: 2017,
    ClasificacionEdad: '+10',
    desarrollador: 'Team Cherry',
    imagenPortada: './Portadas/Hollow_Knight.webp',
    descripcion: 'Explora un vasto mundo subterráneo lleno de criaturas y misterios.',
    completado: false
  },
  {
    titulo: 'Left 4 Dead 2',
    genero: ['Acción', 'Horror', 'Multijugador', 'Supervivencia'],
    plataforma: 'PC, Xbox 360',
    anioLanzamiento: 2009,
    ClasificacionEdad: '+18',
    desarrollador: 'Valve',
    imagenPortada: './Portadas/Left_4_Dead_2.webp',
    descripcion: 'Juego cooperativo donde luchas por sobrevivir contra hordas de zombis.',
    completado: false
  },
  {
    titulo: 'The Elder Scrolls V: Skyrim',
    genero: ['RPG', 'Aventura', 'Acción'],
    plataforma: 'PC, PlayStation, Xbox, Switch',
    anioLanzamiento: 2011,
    ClasificacionEdad: '+17',
    desarrollador: 'Bethesda Game Studios',
    imagenPortada: './Portadas/Skyrim.webp',
    descripcion: 'RPG de mundo abierto ambientado en un continente lleno de magia y desafíos.',
    completado: true
  },
  {
    titulo: 'StarCraft II',
    genero: ['Estrategia', 'Multijugador'],
    plataforma: 'PC',
    anioLanzamiento: 2010,
    ClasificacionEdad: '+16',
    desarrollador: 'Blizzard Entertainment',
    imagenPortada: './Portadas/Starcraft_2.jpeg',
    descripcion: 'Juego de estrategia en tiempo real con tres razas galácticas en guerra.',
    completado: false
  },
  {
    titulo: 'Tetris',
    genero: ['Puzzle'],
    plataforma: 'Multiplataforma',
    anioLanzamiento: 1984,
    ClasificacionEdad: 'Todas las edades',
    desarrollador: 'Alexey Pajitnov',
    imagenPortada: './Portadas/Tetris.png',
    descripcion: 'Completa líneas de bloques en este clásico de rompecabezas.',
    completado: false
  },
  {
    titulo: 'World of Warcraft',
    genero: ['RPG', 'Multijugador'],
    plataforma: 'PC',
    anioLanzamiento: 2004,
    ClasificacionEdad: '+12',
    desarrollador: 'Blizzard Entertainment',
    imagenPortada: './Portadas/World_of_Warcraft.png',
    descripcion: 'Embárcate en misiones épicas dentro del extenso mundo de Azeroth.',
    completado: false
  },
  {
    titulo: 'Minecraft',
    genero: ['Supervivencia', 'Aventura', 'Indie', 'Multijugador'],
    plataforma: 'PC, PlayStation, Xbox, Switch, Mobile',
    anioLanzamiento: 2011,
    ClasificacionEdad: '+7',
    desarrollador: 'Mojang',
    imagenPortada: './Portadas/Minecraft.webp',
    descripcion: 'Explora, construye y sobrevive en mundos generados por procedimientos.',
    completado: false
  },
  {
    titulo: 'Outlast',
    genero: ['Horror', 'Suspenso', 'Supervivencia'],
    plataforma: 'PC, PlayStation, Xbox, Switch',
    anioLanzamiento: 2013,
    ClasificacionEdad: '+18',
    desarrollador: 'Red Barrels',
    imagenPortada: './Portadas/Outlast.jpg',
    descripcion: 'Juego de terror psicológico en primera persona en un manicomio abandonado.',
    completado: false
  },
  {
    titulo: 'Alan Wake',
    genero: ['Suspenso', 'Acción'],
    plataforma: 'PC, Xbox, PlayStation',
    anioLanzamiento: 2010,
    ClasificacionEdad: '+16',
    desarrollador: 'Remedy Entertainment',
    imagenPortada: './Portadas/Alan_Wake.jpg',
    descripcion: 'Un escritor lucha contra fuerzas oscuras mientras busca a su esposa desaparecida.',
    completado: false
  },
  {
    titulo: 'Brawlhalla',
    genero: ['Acción', 'Multijugador'],
    plataforma: 'PC, PlayStation, Xbox, Switch, Mobile',
    anioLanzamiento: 2017,
    ClasificacionEdad: '+10',
    desarrollador: 'Blue Mammoth Games',
    imagenPortada: './Portadas/Brawlhalla.jpg',
    descripcion: 'Juego de peleas estilo plataforma con personajes de todo tipo.',
    completado: false
  },
  {
    titulo: 'Valorant',
    genero: ['FPS', 'Multijugador'],
    plataforma: 'PC',
    anioLanzamiento: 2020,
    ClasificacionEdad: '+16',
    desarrollador: 'Riot Games',
    imagenPortada: './Portadas/Valorant.jpg',
    descripcion: 'Shooter táctico basado en habilidades únicas por personaje.',
    completado: false
  },
  {
    titulo: 'Rocket League',
    genero: ['Acción', 'Multijugador', 'Deportes'],
    plataforma: 'PC, PlayStation, Xbox, Switch',
    anioLanzamiento: 2015,
    ClasificacionEdad: '+10',
    desarrollador: 'Psyonix',
    imagenPortada: './Portadas/Rocket_League.jpg',
    descripcion: 'Fútbol con autos propulsados, rápido y caótico.',
    completado: false
  },
  {
    titulo: 'DOOM (2016)',
    genero: ['Acción', 'FPS'],
    plataforma: 'PC, PlayStation, Xbox, Switch',
    anioLanzamiento: 2016,
    ClasificacionEdad: '+18',
    desarrollador: 'id Software',
    imagenPortada: './Portadas/Doom.webp',
    descripcion: 'Lucha contra hordas de demonios en Marte con acción rápida y violenta.',
    completado: false
  },
  {
    titulo: 'Mortal Kombat 11',
    genero: ['Acción'],
    plataforma: 'PC, PlayStation, Xbox, Switch',
    anioLanzamiento: 2019,
    ClasificacionEdad: '+18',
    desarrollador: 'NetherRealm Studios',
    imagenPortada: './Portadas/Mortal_Kombat_11.jpg',
    descripcion: 'Peleas brutales con personajes icónicos y fatalities sangrientos.',
    completado: false
  },
  {
    titulo: 'Resident Evil 4',
    genero: ['Acción', 'Horror', 'Supervivencia'],
    plataforma: 'PC, PlayStation, Xbox, GameCube, Switch',
    anioLanzamiento: 2005,
    ClasificacionEdad: '+18',
    desarrollador: 'Capcom',
    imagenPortada: './Portadas/Resident_Evil_4.jpg',
    descripcion: 'Leon S. Kennedy se enfrenta a horrores en una aldea europea en busca de la hija del presidente.',
    completado: true
  },
  {
    titulo: 'Silent Hill 2',
    genero: ['Horror', 'Suspenso'],
    plataforma: 'PlayStation 2, Xbox, PC',
    anioLanzamiento: 2001,
    ClasificacionEdad: '+18',
    desarrollador: 'Konami',
    imagenPortada: './Portadas/Silent_Hill_2.avif',
    descripcion: 'James Sunderland explora el inquietante pueblo de Silent Hill en busca de respuestas.',
    completado: false
  },
  {
  titulo: 'Dark Souls III',
  genero: ['Acción', 'RPG', 'Aventura'],
  plataforma: 'PC, PlayStation, Xbox',
  anioLanzamiento: 2016,
  ClasificacionEdad: '+16',
  desarrollador: 'FromSoftware',
  imagenPortada: './Portadas/Dark_Souls_III.webp',
  descripcion: 'Un desafiante RPG de acción donde luchas contra poderosos enemigos en un mundo oscuro y decadente.',
  completado: false
  },
  {
  titulo: 'Among Us',
  genero: ['Multijugador', 'Indie', 'Suspenso'],
  plataforma: 'PC, Mobile, Switch, PlayStation, Xbox',
  anioLanzamiento: 2018,
  ClasificacionEdad: '+10',
  desarrollador: 'InnerSloth',
  imagenPortada: './Portadas/Among_US.jpg',
  descripcion: 'Juego de deducción social donde los tripulantes deben descubrir al impostor antes de ser eliminados.',
  completado: false
  }
]

export default mongoose.model('Game', gameSchema)