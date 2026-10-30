import { SubjectConfig } from '../types/education';

export const ASSETS = {
  heroBanner: '/src/assets/images/edugenie_hero_banner_1791997620253.jpg',
  mathScienceImg: '/src/assets/images/course_math_science_1791997620681.jpg',
  literatureImg: '/src/assets/images/course_literature_arts_1791997620467.jpg',
  historySocialImg: '/src/assets/images/course_history_social_1791997621315.jpg',
};

export const SUBJECTS: SubjectConfig[] = [
  {
    id: 'comunicacion',
    name: 'Comunicación y Lenguaje',
    category: 'HUMANIDADES',
    tagline: 'Redacción, comprensión de lectura y literatura',
    description: 'Mejora tu redacción de ensayos, analiza textos literarios, domina la ortografía y enriquece tu vocabulario con retroalimentación experta.',
    color: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    avatarImg: ASSETS.literatureImg,
    subtopics: [
      'Redacción y Ensayos',
      'Ortografía y Signos de Puntuación',
      'Comprensión Lectora',
      'Figuras Literarias y Poesía',
      'Conectores Lógicos y Cohesión',
    ],
    promptStarters: [
      {
        label: 'Resumen de obra: Don Quijote',
        prompt: 'Hazme un resumen analítico completo de Don Quijote de la Mancha con argumento, temas y conclusión.',
      },
      {
        label: 'Significado de Metáfora vs Símil',
        prompt: '¿Qué significa metáfora y cuál es su diferencia con el símil? Explica su etimología y ejemplos.',
      },
      {
        label: 'Significado: Denotación vs Connotación',
        prompt: 'Explícame el significado y la diferencia entre sentido denotativo y connotativo con ejemplos claros.',
      },
      {
        label: 'Resumen de La Ilíada de Homero',
        prompt: 'Dame un resumen estructurado de La Ilíada: cólera de Aquiles, guerra de Troya y lección final.',
      },
    ],
  },
  {
    id: 'matematica',
    name: 'Matemática y Lógica',
    category: 'CIENCIAS EXACTAS',
    tagline: 'Álgebra, geometría, trigonometría y cálculo',
    description: 'Resuelve problemas paso a paso, comprende las demostraciones lógicas detrás de cada fórmula y domina desde aritmética escolar hasta cálculo avanzado.',
    color: '#0ea5e9',
    accentBg: 'rgba(14, 165, 233, 0.1)',
    borderColor: 'rgba(14, 165, 233, 0.3)',
    avatarImg: ASSETS.mathScienceImg,
    subtopics: [
      'Álgebra y Ecuaciones',
      'Geometría Plana y del Espacio',
      'Trigonometría y Razones',
      'Cálculo Diferencial e Integral',
      'Estadística y Probabilidad',
    ],
    promptStarters: [
      {
        label: 'Operación elemental: 1 + 1',
        prompt: '¿Cuánto es 1 + 1? Explícame paso a paso con su demostración y conclusión.',
      },
      {
        label: 'Cálculo aritmético: 25 × 4 + 50',
        prompt: 'Calcula paso a paso: 25 * 4 + 50 / 2 aplicando la jerarquía de operaciones.',
      },
      {
        label: 'Resolver ecuación: 3x + 8 = 20',
        prompt: 'Resuelve paso a paso la ecuación lineal 3x + 8 = 20 con comprobación final.',
      },
      {
        label: 'Ecuación cuadrática: x² - 5x + 6 = 0',
        prompt: 'Resuélveme paso a paso la ecuación cuadrática: x² - 5x + 6 = 0 con la fórmula general.',
      },
    ],
  },
  {
    id: 'ciencias',
    name: 'Ciencias Naturales',
    category: 'CIENCIAS EXPERIMENTALES',
    tagline: 'Física, química, biología y ecología',
    description: 'Comprende el universo a través del método científico: leyes del movimiento, reacciones químicas, estructura celular y leyes de la herencia genética.',
    color: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    avatarImg: ASSETS.mathScienceImg,
    subtopics: [
      'Física: Leyes de Newton y Cinemática',
      'Química: Tabla Periódica y Enlaces',
      'Química: Balanceo de Ecuaciones',
      'Biología Celular y ADN',
      'Fisiología y Sistemas del Cuerpo',
    ],
    promptStarters: [
      {
        label: 'Balancear ecuación química',
        prompt: 'Ayúdame a balancear por el método de tanteo y algebraico la siguiente reacción química: C3H8 + O2 -> CO2 + H2O paso a paso.',
      },
      {
        label: 'Leyes de Newton con ejemplos',
        prompt: 'Explícame las Tres Leyes de Newton con analogías de deportes o situaciones cotidianas y cómo calcular la fuerza neta.',
      },
      {
        label: 'Mitosis vs Meiosis celular',
        prompt: 'Crea una tabla comparativa clara entre Mitosis y Meiosis: fases, número de células resultantes, dotación cromosómica e importancia biológica.',
      },
      {
        label: 'Fotosíntesis y respiración',
        prompt: '¿Cómo funciona la fase luminosa y la fase oscura (ciclo de Calvin) en la fotosíntesis? Explícalo de forma visual y concisa.',
      },
    ],
  },
  {
    id: 'sociales',
    name: 'Ciencias Sociales e Historia',
    category: 'CIENCIAS SOCIALES',
    tagline: 'Historia universal, geografía, economía y filosofía',
    description: 'Analiza los hitos que transformaron a la humanidad, causas y consecuencias de revoluciones, corrientes de pensamiento filosófico y principios económicos.',
    color: '#ec4899',
    accentBg: 'rgba(236, 72, 153, 0.1)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
    avatarImg: ASSETS.historySocialImg,
    subtopics: [
      'Historia Universal Contemporánea',
      'Causas de la Primera y Segunda Guerra Mundial',
      'Geografía Física y Población',
      'Economía Básica (Inflación y Mercado)',
      'Filosofía y Ética',
    ],
    promptStarters: [
      {
        label: 'Causas de la Revolución Francesa',
        prompt: 'Explica las causas económicas, sociales e ideológicas de la Revolución Francesa de 1789 y su impacto en los derechos humanos modernos.',
      },
      {
        label: 'Línea de tiempo de la Guerra Fría',
        prompt: 'Genera una cronología resumida con los 5 momentos más críticos de la Guerra Fría (Crisis de los misiles, Guerra de Corea, Muro de Berlín, etc.).',
      },
      {
        label: '¿Qué es la inflación y cómo se controla?',
        prompt: 'Explica en términos sencillos qué causa la inflación en un país, cómo afecta a las familias y qué papel juegan los bancos centrales con las tasas de interés.',
      },
      {
        label: 'Platón: Alegoría de la caverna',
        prompt: '¿Qué significado tiene la alegoría de la caverna de Platón para el conocimiento hoy en día en la era digital?',
      },
    ],
  },
  {
    id: 'idiomas',
    name: 'Idiomas y Lenguas Extranjeras',
    category: 'LINGÜÍSTICA',
    tagline: 'Inglés comunicativo, gramática y vocabulario',
    description: 'Domina los tiempos verbales en inglés, practica conversación por situaciones reales (viajes, entrevistas, estudios) y desglosa idioms y vocabulario clave.',
    color: '#8b5cf6',
    accentBg: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    avatarImg: ASSETS.literatureImg,
    subtopics: [
      'Tiempos Verbales (Present Perfect vs Past)',
      'Simulador de Conversación Práctica',
      'False Friends y Errores Comunes',
      'Phrasal Verbs con Ejemplos',
      'Redacción de Correos Formales en Inglés',
    ],
    promptStarters: [
      {
        label: 'Present Perfect vs Simple Past',
        prompt: '¿Cuándo debo usar exactamente el Present Perfect en vez del Simple Past en inglés? Dame 5 pares de oraciones contrastadas.',
      },
      {
        label: 'Simular conversación de entrevista de trabajo',
        prompt: 'Quiero practicar una entrevista de trabajo en inglés para un puesto junior. Hazme una primera pregunta típica y evalúa mi respuesta.',
      },
      {
        label: 'Phrasal Verbs más usados',
        prompt: 'Enséñame 8 phrasal verbs indispensables en inglés con su significado literal vs figurado y ejemplos prácticos.',
      },
      {
        label: 'Escribir un email formal en inglés',
        prompt: 'Ayúdame a redactar un correo formal en inglés solicitando información sobre un programa de intercambio universitario.',
      },
    ],
  },
  {
    id: 'programacion',
    name: 'Tecnología y Programación',
    category: 'CIENCIAS DE LA COMPUTACIÓN',
    tagline: 'Lógica algorítmica, Python, JavaScript y bases de datos',
    description: 'Aprende a programar desde cero o profundiza en estructuras de datos, resolución de bugs, desarrollo web y algoritmos de búsqueda y ordenamiento.',
    color: '#06b6d4',
    accentBg: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    avatarImg: ASSETS.mathScienceImg,
    subtopics: [
      'Fundamentos y Pseudocódigo',
      'Python para Principiantes',
      'JavaScript y Lógica Web',
      'Estructuras de Datos y Algoritmos',
      'Depuración y Corrección de Código',
    ],
    promptStarters: [
      {
        label: 'Explicar bucles y condicionales',
        prompt: 'Explícame la diferencia entre un bucle "for" y un bucle "while" en Python con un ejemplo práctico de conteo o búsqueda.',
      },
      {
        label: 'Depurar un error en mi código',
        prompt: 'Tengo este código con un error o resultado inesperado. Ayúdame a encontrar el bug y explícame por qué ocurre:',
      },
      {
        label: '¿Qué es una API REST?',
        prompt: 'Explícame qué es una API REST con la analogía de un camarero en un restaurante y los métodos GET, POST, PUT y DELETE.',
      },
      {
        label: 'Algoritmo de búsqueda binaria',
        prompt: '¿Cómo funciona la búsqueda binaria y por qué es O(log n)? Proporciona el código comentado en Python o JavaScript.',
      },
    ],
  },
];
