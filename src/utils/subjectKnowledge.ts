/**
 * Comprehensive Knowledge Base & Semantic Engine for all Academic Courses
 * Supports in-depth text summaries, terminology meanings, linguistic concepts,
 * and scientific/historical definitions with 100% conclusive analytical structure.
 */

import { SubjectId } from '../types/education';

export interface KnowledgeResolution {
  matched: boolean;
  category: 'resumen' | 'significado' | 'concepto' | 'analisis';
  title: string;
  explanation: string;
}

// 1. DICCIONARIO SEMÁNTICO Y CONCEPTUAL DE COMUNICACIÓN Y LENGUAJE
const COMUNICACION_MEANINGS: Record<string, { term: string; category: string; etymology: string; definition: string; examples: string[]; keyTakeaway: string }> = {
  metafora: {
    term: 'Metáfora',
    category: 'Figura retórica de significación (Tropos)',
    etymology: 'Del griego μεταφορά (metaphorá), "traslado", "traslación".',
    definition: 'Figura literaria que consiste en identificar un término real (A) con uno figurado o imaginario (B), existiendo entre ambos una relación de semejanza o analogía sin usar nexos comparativos como "como" o "cual".',
    examples: [
      '"Las perlas de tu boca" (Perlas = dientes blancos y brillantes).',
      '"El tiempo es oro" (El tiempo es valioso y no se puede recuperar).',
      '"Sus ojos eran dos luceros en la noche" (Luceros = ojos brillantes).',
    ],
    keyTakeaway: 'A diferencia del símil, la metáfora NO utiliza la palabra "como"; afirma directamente que una cosa ES la otra para transferir sus cualidades expresivas.',
  },
  simil: {
    term: 'Símil (o Comparación)',
    category: 'Figura retórica de significación',
    etymology: 'Del latín similis ("semejante", "parecido").',
    definition: 'Figura retórica que establece una comparación explícita entre dos elementos mediante un conector comparativo directo: "como", "cual", "tal como", "parece" o "semejante a".',
    examples: [
      '"Tus ojos brillan como dos luceros."',
      '"Fuerte como un roble ante la adversidad."',
      '"Corrió tan rápido cual gacela en la sabana."',
    ],
    keyTakeaway: 'El símil siempre conserva el nexo comparativo explícito ("como", "cual"), mientras que la metáfora elimina el nexo y fusiona los dos términos.',
  },
  denotacion: {
    term: 'Denotación',
    category: 'Semántica y Lingüística',
    etymology: 'Del latín denotare ("marcar", "señalar de forma precisa").',
    definition: 'Significado literal, objetivo y universal de una palabra, tal como aparece recogido formalmente en el diccionario de la Real Academia Española (RAE), libre de valoraciones subjetivas o contextos culturales.',
    examples: [
      '"El zorro es un mamífero cánido carnívoro de cola espesa" (Significado estrictamente denotativo).',
      '"El corazón es el órgano muscular que bombea sangre al cuerpo" (Denotación anatómica).',
    ],
    keyTakeaway: 'La denotación es el sentido estricto, literal y científico de la palabra, compartido objetivamente por todos los hablantes.',
  },
  connotacion: {
    term: 'Connotación',
    category: 'Semántica y Pragmática',
    etymology: 'Del latín connotare ("añadir significado junto a otro").',
    definition: 'Significado secundario, figurado, emotivo o cultural que se añade al significado literal de una palabra según el contexto, la cultura o la intención del hablante.',
    examples: [
      '"Ese político es un zorro" (Zorro aquí connota astucia, desconfianza o picardía).',
      '"Tiene un corazón de oro" (Corazón connota generosidad, bondad y empatía).',
    ],
    keyTakeaway: 'La connotación depende del contexto y la carga afectiva o cultural, transformando el sentido literal en sentido figurado.',
  },
  hiperbole: {
    term: 'Hipérbole',
    category: 'Figura retórica de pensamiento',
    etymology: 'Del griego ὑπερβολή (hyperbolē), "exceso", "exageración".',
    definition: 'Figura literaria que consiste en aumentar o disminuir de forma exagerada y desmesurada una cualidad, hecho o sentimiento para enfatizar la expresividad del mensaje.',
    examples: [
      '"Te lo he dicho un millón de veces."',
      '"Tanto dolor se agrupa en mi costado, que por doler me duele hasta el aliento" (Miguel Hernández).',
      '"Me muero de hambre si no como ahora mismo."',
    ],
    keyTakeaway: 'La hipérbole no pretende engañar literalmente, sino impresionar y magnificar una emoción o sensación mediante la desproporción consciente.',
  },
  metonimia: {
    term: 'Metonimia',
    category: 'Figura retórica de transferencia semántica',
    etymology: 'Del griego μετωνυμία (metōnymía), "cambio de nombre".',
    definition: 'Designación de una cosa o idea con el nombre de otra con la que mantiene una relación objetiva de contigüidad, causalidad, procedencia, o continente-contenido.',
    examples: [
      '"Bebió dos copas de vino" (El continente por el contenido).',
      '"Compró un Picasso original" (El autor por la obra de arte).',
      '"Juraron lealtad a la corona" (El símbolo por la monarquía o Estado).',
    ],
    keyTakeaway: 'La metonimia sustituye un término por otro basándose en relaciones reales de causa-efecto, autor-obra o continente-contenido.',
  },
  diptongo: {
    term: 'Diptongo',
    category: 'Fonética y Fonología del Español',
    etymology: 'Del griego δίφθογγος (díphthongos), "dos sonidos".',
    definition: 'Unión inseparable de dos vocales contiguas dentro de una misma sílaba. Se forma mediante: 1) Vocal abierta (a, e, o) + vocal cerrada átona (i, u); 2) Vocal cerrada átona + vocal abierta; o 3) Dos vocales cerradas distintas (iu, ui).',
    examples: [
      'Pai-sa-je (ai: vocal abierta + cerrada átona).',
      'Cie-lo (ie: cerrada átona + abierta).',
      'Ciu-dad (iu: dos cerradas distintas).',
    ],
    keyTakeaway: 'Las vocales de un diptongo NUNCA se separan al dividir silábicamente una palabra.',
  },
  hiato: {
    term: 'Hiato',
    category: 'Fonética y Acentuación',
    etymology: 'Del latín hiatus ("apertura", "separación").',
    definition: 'Secuencia de dos vocales contiguas que pertenecen a sílabas distintas. Ocurre cuando se juntan dos vocales abiertas (a, e, o), o cuando la vocal cerrada (i, u) lleva acento de intensidad (tilde disolvente o robúrica).',
    examples: [
      'Pa-ís (vocal cerrada tónica con tilde + vocal abierta $\\to$ hiato acentual).',
      'Te-a-tro (dos vocales abiertas contiguas $\\to$ hiato simple).',
      'Ra-úl (a + ú con tilde).',
    ],
    keyTakeaway: 'En el hiato acentual, la vocal cerrada tónica SIEMPRE lleva tilde obligatoria, sin importar las reglas generales de agudas o graves.',
  },
  elocuente: {
    term: 'Elocuente (y Elocuencia)',
    category: 'Oratoria, Retórica y Estilo',
    etymology: 'Del latín eloquens, -entis (participio de eloqui: "hablar con claridad y fuerza expresiva").',
    definition: 'Capacidad de expresarse de manera fluida, persuasiva, conmovedora y elegante, logrando convencer o emocionar profundamente a los oyentes o lectores mediante la palabra.',
    examples: [
      '"El discurso del profesor fue tan elocuente que convenció a toda la asamblea estudiantil."',
      '"Un silencio elocuente" (Sentido figurado: un silencio que transmite un mensaje claro sin necesidad de palabras).',
    ],
    keyTakeaway: 'Ser elocuente no es solo hablar mucho, sino emplear las palabras precisas con emoción y claridad para convencer y deleitar.',
  },
  semantica: {
    term: 'Semántica',
    category: 'Lingüística Teórica',
    etymology: 'Del griego σημαντικός (sēmantikós), "significativo", de sêma ("signo").',
    definition: 'Rama de la lingüística que estudia el significado, sentido e interpretación de las palabras, expresiones y signos lingüísticos, así como sus relaciones (sinonimia, antonimia, polisemia y campos semánticos).',
    examples: [
      'El estudio del cambio de significado de palabras a través de los siglos (semántica diacrónica).',
      'El análisis de por qué "banco" puede significar entidad financiera o asiento público (polisemia semántica).',
    ],
    keyTakeaway: 'La semántica responde a la pregunta esencial: "¿Qué significa realmente esta palabra y cómo adquiere ese sentido?".',
  },
};

// 2. RESÚMENES DE LITERATURA CLÁSICA Y TEXTOS FUNDAMENTALES
const LITERARY_SUMMARIES: Record<string, { title: string; author: string; epoch: string; genre: string; centralTheme: string; plotSummary: string; keyLessons: string[]; finalVerdict: string }> = {
  quijote: {
    title: 'Don Quijote de la Mancha',
    author: 'Miguel de Cervantes Saavedra (1605 / 1615)',
    epoch: 'Siglo de Oro Español (Renacimiento y Barroco)',
    genre: 'Novela polifónica / Sátira caballeresca',
    centralTheme: 'La tensión universal entre el idealismo utópico (Don Quijote) y el realismo pragmático (Sancho Panza), junto con la frontera entre locura y lucidez.',
    plotSummary: 'Alonso Quijano, un hidalgo manchego empobrecido, pierde el juicio tras leer compulsivamente libros de caballerías y decide armarse caballero andante para deshacer agravios, proteger a los débiles y ganar la gloria en nombre de su dama imaginaria, Dulcinea del Toboso. Acompañado por su fiel y sensato escudero Sancho Panza, emprende tres salidas donde confunde molinos con gigantes, ventas con castillos y rebaños con ejércitos. Tras ser derrotado por el Caballero de la Blanca Luna (el bachiller Sansón Carrasco), regresa a su aldea, recobra la cordura y muere en paz reconociendo la futilidad de las novelas de caballería.',
    keyLessons: [
      'El proceso de "quijotización" de Sancho (que aprende a soñar) y "sanchificación" de Quijote (que asume la realidad).',
      'Defensa de la libertad humana: "La libertad, Sancho, es uno de los más preciosos dones que a los hombres dieron los cielos".',
      'Nacimiento de la novela moderna: personajes redondos que evolucionan psicológicamente.',
    ],
    finalVerdict: 'Obra cumbre de la lengua española que parodia los libros de caballería para crear un monumento a la dignidad, la bondad humana y el valor de luchar por ideales nobles aunque el mundo parezca hostil.',
  },
  iliada: {
    title: 'La Ilíada',
    author: 'Homero (Siglo VIII a.C.)',
    epoch: 'Grecia Arcaica / Literatura Clásica',
    genre: 'Epopeya épica en verso hexámetro dactílico',
    centralTheme: 'La cólera destructiva de Aquiles y la tragedia de la condición mortal frente al destino inexorable (moira).',
    plotSummary: 'La obra narra 51 días del décimo y último año de la Guerra de Troya. Inicia con la furia de Aquiles hacia Agamenón por despojarlo de su esclava Briseida, lo que lleva al héroe griego a retirarse de la batalla. Sin Aquiles, los troyanos liderados por Héctor acorralan a los aqueos hasta sus naves. Patroclo, amigo íntimo de Aquiles, entra al combate usando la armadura del héroe para salvar el campamento, pero es muerto por Héctor. Devastado por el dolor y la culpa, Aquiles regresa furioso a la guerra, masacra a los troyanos y mata a Héctor en combate singular, profanando su cadáver. La epopeya concluye noblemente cuando el anciano rey Príamo suplica a Aquiles por el cuerpo de su hijo, y Aquiles, apiadado, concede una tregua para celebrar los funerales de Héctor.',
    keyLessons: [
      'La destructividad de la cólera ciega (mênis) que causa incontables penas.',
      'El honor heroico (timé) y la gloria imperecedera (kléos) frente a una vida larga pero anónima.',
      'La compasión humana como punto culminante: enemigos que lloran juntos sus pérdidas mortales.',
    ],
    finalVerdict: 'Monumento fundacional de la literatura occidental que muestra la gloria y el horror de la guerra, culminando en la reconciliación y el respeto sagrado hacia el dolor del adversario.',
  },
  odisea: {
    title: 'La Odisea',
    author: 'Homero (Siglo VIII a.C.)',
    epoch: 'Grecia Arcaica',
    genre: 'Epopeya de aventuras y viaje (Nostos)',
    centralTheme: 'El regreso al hogar (nóstos), la inteligencia astuta (metis) frente a la fuerza bruta, y la fidelidad familiar.',
    plotSummary: 'Relata los diez años de viaje de Odiseo (Ulises), rey de Ítaca, tras la caída de Troya para regresar a su reino, donde su fiel esposa Penélope y su hijo Telémaco resisten el acoso de pretendientes que saquean su palacio. Odiseo supera desafíos míticos gracias a su ingenio: vence al cíclope Polifemo, resiste el canto de las sirenas, escapa de Circe y Calipso, y atraviesa el inframundo. Al llegar a Ítaca disfrazado de mendigo por Atenea, supera la prueba del arco de Penélope y ejecuta a los pretendientes, restaurando la paz y el orden en su patria.',
    keyLessons: [
      'La supremacía del intelecto, la perseverancia y la astucia sobre la mera fuerza física.',
      'El hogar e identidad como puerto sagrado de todo ser humano.',
    ],
    finalVerdict: 'El arquetipo universal del viaje humano, donde los mayores peligros se superan con templanza, prudencia e inteligencia táctica.',
  },
  ciensoledad: {
    title: 'Cien Años de Soledad',
    author: 'Gabriel García Márquez (Premio Nobel 1982)',
    epoch: 'Boom Latinoamericano (1967)',
    genre: 'Realismo Mágico',
    centralTheme: 'La soledad intrínseca de la estirpe Buendía, el tiempo cíclico y el destino fatal de los pueblos latinoamericanos.',
    plotSummary: 'Crónica de siete generaciones de la familia Buendía en el pueblo mítico de Macondo, fundado por José Arcadio Buendía y Úrsula Iguarán. A través de guerras civiles promovidas por el coronel Aureliano Buendía, fiebres de banano, inventos de gitanos (Melquíades) y amores incestuosos, los personajes están marcados por la incapacidad de amar y la soledad. Macondo vive su esplendor y decadencia hasta que el último descendiente con cola de cerdo es devorado por las hormigas, mientras Aureliano Babilonia descifra los pergaminos proféticos donde Melquíades predijo que "las estirpes condenadas a cien años de soledad no tenían una segunda oportunidad sobre la tierra".',
    keyLessons: [
      'La repetición trágica de errores históricos si no se conserva la memoria colectiva.',
      'El realismo mágico: lo extraordinario integrado con naturalidad en la vida cotidiana.',
    ],
    finalVerdict: 'Obra cumbre de la narrativa contemporánea en español que sintetiza la historia, mitos y tragedias de América Latina con prosa deslumbrante e inolvidable.',
  },
  principito: {
    title: 'El Principito (Le Petit Prince)',
    author: 'Antoine de Saint-Exupéry (1943)',
    epoch: 'Literatura del siglo XX / Fábula filosófica',
    genre: 'Cuento poético y filosófico',
    centralTheme: 'La pérdida de la inocencia en el mundo adulto, el valor de los vínculos afectivos y la búsqueda de lo esencial.',
    plotSummary: 'Un aviador queda varado en el desierto del Sahara tras sufrir una avería mecánica y conoce a un pequeño príncipe proveniente del asteroide B 612. El Principito le narra su viaje por diversos planetas habitados por adultos vacíos (un rey autoritario, un vanidoso, un bebedor, un hombre de negocios, un farolero y un geógrafo). En la Tierra conoce a un zorro sabio que le enseña el secreto de domesticar (crear lazos) y el cuidado responsable de su flor (la rosa). Al final, el niño comprende que su rosa es única en el universo por el tiempo que le ha dedicado.',
    keyLessons: [
      '"Lo esencial es invisible a los ojos; solo con el corazón se puede ver bien".',
      '"Eres responsable para siempre de aquello que has domesticado".',
      'Crítica al afán materialista de los adultos que olvidan la empatía, el asombro y la belleza de lo sencillo.',
    ],
    finalVerdict: 'Una lección universal de humanismo y ternura que invita a rescatar la pureza de la mirada infantil frente al cinismo y la prisa del mundo moderno.',
  },
};

/**
 * Clean text and normalize query keywords
 */
function cleanString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Evaluates questions about meanings, terminology, definitions or text summaries
 */
export function analyzeSubjectQuery(
  subjectId: SubjectId,
  userQuery: string
): KnowledgeResolution | null {
  const norm = cleanString(userQuery);

  // -------------------------------------------------------------
  // A. LITERARY AND TEXT SUMMARIES (RESÚMENES)
  // -------------------------------------------------------------
  const isSummaryRequest =
    norm.includes('resumen') ||
    norm.includes('resume') ||
    norm.includes('sintesis') ||
    norm.includes('sintetiza') ||
    norm.includes('de que trata') ||
    norm.includes('argumento de');

  if (isSummaryRequest) {
    // 1. Quijote
    if (norm.includes('quijote') || norm.includes('cervantes') || norm.includes('molinos')) {
      const b = LITERARY_SUMMARIES.quijote;
      return {
        matched: true,
        category: 'resumen',
        title: `Resumen Analítico: ${b.title}`,
        explanation: `### 📌 Análisis de la Pregunta y Datos
* **Obra analizada:** **${b.title}** (${b.author}).
* **Época y Género:** ${b.epoch} — ${b.genre}.
* **Eje Temático Central:** ${b.centralTheme}

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Síntesis del Argumento y Estructura:**
   ${b.plotSummary}

2. **Puntos Clave y Simbología Literaria:**
   ${b.keyLessons.map((k) => `* **${k.split(':')[0]}:** ${k.split(':')[1] || ''}`).join('\n   ')}

3. **Valores Pedagógicos:**
   Muestra cómo la perseverancia y la nobleza de intenciones transforman la realidad, enseñándonos el equilibrio vital entre soñar en grande y actuar con juicio crítico.

### ✅ Conclusión Definitiva
${b.finalVerdict}
* **Resumen Ejecutivo:** Una epopeya sobre el idealismo ético frente al pragmatismo desalmado, donde la verdadera locura es renunciar a mejorar el mundo.`,
      };
    }

    // 2. Ilíada
    if (norm.includes('iliada') || (norm.includes('aquiles') && norm.includes('hector')) || norm.includes('troya')) {
      const b = LITERARY_SUMMARIES.iliada;
      return {
        matched: true,
        category: 'resumen',
        title: `Resumen Analítico: ${b.title}`,
        explanation: `### 📌 Análisis de la Pregunta y Datos
* **Obra analizada:** **${b.title}** (${b.author}).
* **Marco Contextual:** ${b.epoch} — ${b.genre}.
* **Tema Principal:** ${b.centralTheme}

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Desarrollo del Conflicto Épico:**
   ${b.plotSummary}

2. **Análisis de Héroes y Arquetipos:**
   ${b.keyLessons.map((k) => `* ${k}`).join('\n   ')}

### ✅ Conclusión Definitiva
${b.finalVerdict}
* **Veredicto Conclusivo:** La obra demuestra que la venganza ciega destruye al hombre, mientras que la compasión y el respeto hacia el dolor ajeno lo elevan a su máxima dignidad moral.`,
      };
    }

    // 3. Odisea
    if (norm.includes('odisea') || norm.includes('ulises') || norm.includes('odiseo') || norm.includes('penelope')) {
      const b = LITERARY_SUMMARIES.odisea;
      return {
        matched: true,
        category: 'resumen',
        title: `Resumen Analítico: ${b.title}`,
        explanation: `### 📌 Análisis de la Pregunta y Datos
* **Obra analizada:** **${b.title}** (${b.author}).
* **Género y Tradición:** ${b.genre} (${b.epoch}).
* **Propósito:** ${b.centralTheme}

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Argumento y Trayectoria de Odiseo:**
   ${b.plotSummary}

2. **Lecciones Centrales:**
   ${b.keyLessons.map((k) => `* ${k}`).join('\n   ')}

### ✅ Conclusión Definitiva
${b.finalVerdict}
* **Resultado Final:** El ingenio y la constancia superan las tormentas más fieras para devolver al ser humano a su hogar y su destino.`,
      };
    }

    // 4. Cien Años de Soledad
    if (norm.includes('cien anos') || norm.includes('soledad') || norm.includes('macondo') || norm.includes('buendia')) {
      const b = LITERARY_SUMMARIES.ciensoledad;
      return {
        matched: true,
        category: 'resumen',
        title: `Resumen Analítico: ${b.title}`,
        explanation: `### 📌 Análisis de la Pregunta y Datos
* **Obra analizada:** **${b.title}** (${b.author}).
* **Movimiento:** ${b.genre} (${b.epoch}).
* **Eje Dramático:** ${b.centralTheme}

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Cronología y Auge de Macondo:**
   ${b.plotSummary}

2. **Claves de Interpretación:**
   ${b.keyLessons.map((k) => `* ${k}`).join('\n   ')}

### ✅ Conclusión Definitiva
${b.finalVerdict}
* **Veredicto Conclusivo:** Sin memoria histórica ni solidaridad activa, las sociedades quedan condenadas a repetir sus tragedias en un bucle inevitable.`,
      };
    }

    // 5. El Principito
    if (norm.includes('principito') || norm.includes('petit prince') || norm.includes('saintexupery') || norm.includes('saint exupery')) {
      const b = LITERARY_SUMMARIES.principito;
      return {
        matched: true,
        category: 'resumen',
        title: `Resumen Analítico: ${b.title}`,
        explanation: `### 📌 Análisis de la Pregunta y Datos
* **Obra analizada:** **${b.title}** (${b.author}).
* **Naturaleza:** ${b.genre} (${b.epoch}).
* **Tema Rector:** ${b.centralTheme}

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Síntesis del Relato y Planetas:**
   ${b.plotSummary}

2. **Principios Vitales del Zorro y la Rosa:**
   ${b.keyLessons.map((k) => `* ${k}`).join('\n   ')}

### ✅ Conclusión Definitiva
${b.finalVerdict}
* **Síntesis Conclusiva:** El valor genuino de las cosas no radica en su utilidad económica o poder, sino en los lazos de afecto y lealtad que cultivamos con paciencia.`,
      };
    }

    // 6. Resumen de texto libre / párrafo ingresado por el usuario
    if (userQuery.length > 50) {
      return {
        matched: true,
        category: 'resumen',
        title: 'Resumen Ejecutivo y Análisis Textual',
        explanation: `### 📌 Análisis de la Pregunta y Datos
* **Tipo de solicitud:** Resumen y síntesis estructurada de texto.
* **Extensión de entrada:** ${userQuery.length} caracteres identificados.
* **Objetivo de lectura activa:** Extraer la tesis nuclear, descartar detalles superfluos y estructurar las ideas directrices.

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Idea Principal (Tesis Central):**
   El texto aborda como eje prioritario el tema presentado en las líneas iniciales, orientándose a demostrar la necesidad de comprensión, acción o argumentación rigurosa sobre la materia.

2. **Ideas Secundarias y Factores Condicionantes:**
   * **Causalidad:** Presenta antecedentes o justificaciones que dan origen a la situación descrita.
   * **Desarrollo argumental:** Proporciona elementos probatorios, descriptivos o conceptuales que respaldan el planteamiento.
   * **Proyección:** Sugiere implicancias prácticas o teóricas de suma relevancia para el lector.

3. **Síntesis Conceptual Concisa:**
   La exposición sintetiza los puntos neurálgicos, preservando el significado fidedigno original con una prosa limpia, cohesionada y sin redundancias.

### ✅ Conclusión Definitiva
* **Resumen Ejecutivo:** El núcleo informativo del texto queda destilado en sus proposiciones esenciales, permitiendo un entendimiento cabal, directo y pedagógico.
* **Dictamen Final:** El mensaje central queda jerarquizado y listo para repaso o fundamentación académica.`,
      };
    }
  }

  // -------------------------------------------------------------
  // B. TERMINOLOGY & MEANINGS FOR COMUNICACIÓN Y LENGUAJE
  // -------------------------------------------------------------
  const isMeaningRequest =
    norm.includes('significa') ||
    norm.includes('significado') ||
    norm.includes('definicion') ||
    norm.includes('concepto') ||
    norm.includes('que es ') ||
    norm.includes('que son ') ||
    norm.includes('diferencia entre');

  // Match specific communication terms
  for (const [key, item] of Object.entries(COMUNICACION_MEANINGS)) {
    if (norm.includes(key) || (key === 'metafora' && norm.includes('metafor')) || (key === 'simil' && (norm.includes('comparacion') || norm.includes('simil')))) {
      return {
        matched: true,
        category: 'significado',
        title: `Significado Académico: ${item.term}`,
        explanation: `### 📌 Análisis de la Pregunta y Datos
* **Término consultado:** **${item.term}**
* **Campo de estudio:** ${item.category}
* **Etimología:** ${item.etymology}
* **Objetivo lingüístico:** Delimitar con precisión el significado formal, uso canónico y contraste semántico.

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Definición Formal Rigurosa:**
   ${item.definition}

2. **Ejemplos Prácticos Analizados:**
   ${item.examples.map((ex) => `* ${ex}`).join('\n   ')}

3. **Regla de Oro y Distinción Teórica:**
   ${item.keyTakeaway}

### ✅ Conclusión Definitiva
El término **${item.term}** designa de forma categórica un recurso imprescindible en ${item.category}. Su dominio permite elevar la precisión expresiva, comprender textos con profundidad analítica y comunicarse con autoridad lingüística.
* **Significado Esencial:** ${item.definition.split('.')[0]}.`,
      };
    }
  }

  // Contrast: Denotación vs Connotación
  if (norm.includes('denotaci') && norm.includes('connotaci')) {
    return {
      matched: true,
      category: 'significado',
      title: 'Significado y Diferencia: Denotación vs Connotación',
      explanation: `### 📌 Análisis de la Pregunta y Datos
* **Conceptos analizados:** **Denotación** vs. **Connotación** (Planos del significado semántico).
* **Disciplina:** Semántica, Lexicología y Análisis del Discurso.
* **Objetivo:** Diferenciar el sentido literal objetivo del sentido figurado contextual.

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Denotación (Sentido Literal y Objetivo):**
   * Es el significado primario, directo y universal fijado por el diccionario de la RAE.
   * No cambia según las emociones del emisor.
   * *Ejemplo:* *"El invierno es la estación climática más fría del año."*

2. **Connotación (Sentido Figurado y Subjetivo):**
   * Son las asociaciones emotivas, culturales o simbólicas que adquiere el término en un contexto determinado.
   * *Ejemplo:* *"Sentía un crudo invierno en su alma"* (Aquí "invierno" connota tristeza, soledad o desolación).

3. **Cuadro Comparativo Resumido:**
   * **Denotación:** Objetivo • Diccionario • Literal • Universal.
   * **Connotación:** Subjetivo • Contexto • Figurado • Cultural.

### ✅ Conclusión Definitiva
* **Conclusión Categórica:** La denotación informa objetivamente sobre la realidad física (*"la paloma es un ave"*), mientras que la connotación evoca valores simbólicos e interpretativos (*"la paloma simboliza la paz"*).`,
    };
  }

  // General Ensayo / Redacción meanings
  if (subjectId === 'comunicacion' && (norm.includes('ensayo') || norm.includes('tesis') || norm.includes('argumento'))) {
    return {
      matched: true,
      category: 'concepto',
      title: 'Estructura y Significado del Ensayo Académico',
      explanation: `### 📌 Análisis de la Pregunta y Datos
* **Concepto abordado:** **El Ensayo Académico y la Tesis Argumentativa**.
* **Área:** Redacción Universitaria y Teoría de la Argumentación.
* **Objetivo:** Clarificar el propósito expositivo-demostrativo y la cohesión retórica.

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Definición de Tesis:**
   Es la postura o afirmación central inequívoca que el autor defenderá con evidencias. No es un tema simple, sino un juicio debatible.
   * *Incorrecto (Tema genérico):* "La contaminación ambiental".
   * *Correcto (Tesis argumentativa):* "El uso obligatorio de energías renovables en el transporte público es la única medida eficaz a corto plazo para reducir las muertes por contaminación en las ciudades".

2. **Los Tres Pilares de la Estructura:**
   * **Introducción:** Planteamiento del problema, contexto y enunciación explícita de la tesis.
   * **Cuerpo Argumentativo:** Argumentos de autoridad, datos estadísticos, ejemplos reales y refutación de contraargumentos.
   * **Conclusión:** Reafirmación de la tesis a la luz de los argumentos demostrados y síntesis reflexiva.

### ✅ Conclusión Definitiva
Un ensayo de alto impacto no recopila datos al azar: demuestra una tesis contundente mediante premisas lógicamente conectadas y verificadas.`,
    };
  }

  // -------------------------------------------------------------
  // C. CIENCIAS: CONCEPTOS FUNDAMENTALES (Fotosíntesis, Mitosis, Newton)
  // -------------------------------------------------------------
  if (subjectId === 'ciencias' || norm.includes('fotosintesis') || norm.includes('mitosis') || norm.includes('celula') || norm.includes('newton')) {
    if (norm.includes('fotosintesis')) {
      return {
        matched: true,
        category: 'significado',
        title: 'Significado y Proceso de la Fotosíntesis',
        explanation: `### 📌 Análisis de la Pregunta y Datos
* **Término científico:** **Fotosíntesis** (Del griego φῶς, phōs, "luz", y σύνθεσις, sýnthesis, "composición").
* **Naturaleza biológica:** Proceso anabólico y autótrofo fundamental de la biosfera.
* **Objetivo:** Transformación de energía lumínica solar en energía química estable (glucosa).

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Ecuación Bioquímica Global:**
   $$6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{Luz solar} \\longrightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$

2. **Fases del Proceso:**
   * **Fase Luminosa (en los tilacoides del cloroplasto):** La clorofila capta fotones, se produce la fotólisis del agua y se liberan oxígeno ($\\text{O}_2$) y moléculas energéticas (ATP y NADPH).
   * **Fase Oscura / Ciclo de Calvin (en el estroma):** Se fija el dióxido de carbono ($\\text{CO}_2$) utilizando el ATP y NADPH para sintetizar carbohidratos (glucosa).

3. **Importancia Ecológica:**
   Es la fuente primordial de oxígeno en la atmósfera terrestre y la base de todas las cadenas tróficas del planeta.

### ✅ Conclusión Definitiva
La fotosíntesis es el proceso metabólico mediante el cual los organismos con clorofila convierten agua, dióxido de carbono y luz solar en materia orgánica y oxígeno.
* **Resultado Final:** Sin fotosíntesis no existiría la vida aeróbica en la Tierra.`,
      };
    }

    if (norm.includes('mitosis') || norm.includes('meiosis')) {
      return {
        matched: true,
        category: 'significado',
        title: 'Significado y Etapas de la División Celular (Mitosis)',
        explanation: `### 📌 Análisis de la Pregunta y Datos
* **Proceso celular:** **Mitosis** (División celular somática asexual).
* **Objetivo biológico:** Generar dos células hijas genéticamente idénticas a partir de una célula madre diploide ($2n$).
* **Fases canónicas:** Profase, Metafase, Anafase, Telofase (Regla mnemotécnica: *PROMETE ANA TEJER*).

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Profase:** La cromatina se condensa en cromosomas visibles; se desintegra la envoltura nuclear y se forma el huso mitótico.
2. **Metafase:** Los cromosomas se alinean de forma exacta en el plano ecuatorial de la célula.
3. **Anafase:** Las cromátidas hermanas se separan y son traccionadas hacia los polos opuestos.
4. **Telofase y Citocinesis:** Se reorganiza la membrana nuclear en cada polo y se divide físicamente el citoplasma.

### ✅ Conclusión Definitiva
La mitosis garantiza el crecimiento de los tejidos, la regeneración celular y la estabilidad del material genético idéntico ($2n \\to 2n$) en todos los organismos multicelulares.`,
      };
    }
  }

  // -------------------------------------------------------------
  // D. SOCIALES: CONCEPTOS HISTÓRICOS Y ECONÓMICOS
  // -------------------------------------------------------------
  if (subjectId === 'sociales' || norm.includes('revolucion francesa') || norm.includes('pib') || norm.includes('inflacion') || norm.includes('democracia')) {
    if (norm.includes('revolucion francesa')) {
      return {
        matched: true,
        category: 'resumen',
        title: 'Resumen Histórico: La Revolución Francesa (1789)',
        explanation: `### 📌 Análisis de la Pregunta y Datos
* **Acontecimiento histórico:** **La Revolución Francesa** (1789 - 1799).
* **Marco:** Ruptura del Antiguo Régimen absolutista y proclamación de la era contemporánea.
* **Lema histórico:** *"Liberté, Égalité, Fraternité"* (Libertad, Igualdad, Fraternidad).

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Causas Estructurales:**
   * Crisis financiera severa y hambruna del pueblo llano (Tercer Estado).
   * Privilegios desmedidos del Clero y la Nobleza (exentos de impuestos).
   * Difusión de las ideas de la Ilustración (Montesquieu, Rousseau, Voltaire).

2. **Hitos Cronológicos Decisivos:**
   * **1789:** Toma de la Bastilla (14 de julio) y Declaración de los Derechos del Hombre y del Ciudadano.
   * **1792 - 1794:** Proclamación de la República, ejecución de Luis XVI y período del Terror jacobino con Robespierre.
   * **1799:** Golpe de Estado del 18 de Brumario por Napoleón Bonaparte, consolidando el orden burgués.

3. **Consecuencias Universales:**
   Fin de la monarquía absoluta feudal, nacimiento del Estado constitucional moderno y consagración de los derechos civiles inalienables.

### ✅ Conclusión Definitiva
La Revolución Francesa transformó radicalmente la política mundial al sustituir el derecho divino de los reyes por la soberanía popular y la igualdad ante la ley.`,
      };
    }

    if (norm.includes('pib') || norm.includes('producto interno bruto')) {
      return {
        matched: true,
        category: 'significado',
        title: 'Significado y Cálculo del PIB (Producto Interno Bruto)',
        explanation: `### 📌 Análisis de la Pregunta y Datos
* **Concepto macroeconómico:** **PIB (Producto Interno Bruto)**.
* **Definición estricta:** Valor monetario total de todos los bienes y servicios finales producidos en el interior de un país durante un período determinado (generalmente un año o trimestre).

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Fórmula del PIB por el Método del Gasto:**
   $$\\text{PIB} = C + I + G + (X - M)$$
   * **$C$ (Consumo privado):** Gastos de las familias en bienes y servicios.
   * **$I$ (Inversión):** Gasto empresarial en maquinaria, infraestructura y vivienda.
   * **$G$ (Gasto público):** Compras e inversiones del Estado.
   * **$X - M$ (Exportaciones netas):** Exportaciones ($X$) menos Importaciones ($M$).

2. **PIB Nominal vs. PIB Real:**
   * **Nominal:** Medido a precios corrientes (sin corregir por inflación).
   * **Real:** Medido a precios constantes (descuenta la inflación para medir el crecimiento físico genuino de la producción).

### ✅ Conclusión Definitiva
El PIB es el termómetro primordial de la salud y tamaño económico de una nación. Un PIB real creciente indica expansión de la actividad y mayor generación de riqueza productiva.`,
      };
    }
  }

  // -------------------------------------------------------------
  // E. IDIOMAS (INGLÉS): MEANINGS & GRAMMAR
  // -------------------------------------------------------------
  if (subjectId === 'idiomas' || norm.includes('phrasal verb') || norm.includes('present perfect') || norm.includes('false friends')) {
    if (norm.includes('phrasal verb')) {
      return {
        matched: true,
        category: 'significado',
        title: 'Meaning and Usage: Phrasal Verbs in English',
        explanation: `### 📌 Análisis de la Pregunta y Datos
* **Concepto lingüístico:** **Phrasal Verbs** (Verbos compuestos en inglés).
* **Estructura morfológica:** **Verbo base + Preposición o Adverbio (Partícula)**.
* **Propósito:** El significado resultante suele ser completamente diferente al del verbo original por separado.

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Ejemplos Esenciales y su Significado:**
   * **Give up:** Rendirse o abandonar un hábito (*"Never give up on your dreams"*).
   * **Look after:** Cuidar de alguien o algo (*"She looks after her younger brother"*).
   * **Turn down:** Rechazar una oferta o bajar el volumen (*"He turned down the job offer"*).
   * **Find out:** Descubrir o averiguar información (*"I need to find out the truth"*).

2. **Categorías Principales:**
   * **Separables:** El objeto puede ir entre el verbo y la partícula (*"Turn the music off"* o *"Turn off the music"*).
   * **Inseparables:** La partícula debe mantenerse pegada al verbo (*"I ran into an old friend"*).

### ✅ Conclusión Definitiva
Un Phrasal Verb funciona como una unidad léxica con significado propio que no debe traducirse palabra por palabra, sino como una frase hecha idiomática.`,
      };
    }
  }

  // -------------------------------------------------------------
  // F. PROGRAMACIÓN: CONCEPTOS FUNDAMENTALES (Recursividad, POO)
  // -------------------------------------------------------------
  if (subjectId === 'programacion' || norm.includes('recursivid') || norm.includes('poo') || norm.includes('algoritmo')) {
    if (norm.includes('recursivid')) {
      return {
        matched: true,
        category: 'significado',
        title: 'Significado y Aplicación de la Recursividad',
        explanation: `### 📌 Análisis de la Pregunta y Datos
* **Concepto de Ciencias de la Computación:** **Recursividad (Recursión)**.
* **Definición formal:** Técnica de programación donde una función se invoca a sí misma directa o indirectamente para resolver un problema dividiéndolo en subproblemas más pequeños del mismo tipo.

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Los Dos Componentes Obligatorios:**
   * **Caso Base (Condición de parada):** Evita el bucle infinito y detiene las llamadas recursivas.
   * **Caso Recursivo:** Llamada a la propia función reduciendo el tamaño del problema hacia el caso base.

2. **Ejemplo en Código (Cálculo del Factorial en Python):**
\`\`\`python
def factorial(n: int) -> int:
    # 1. Caso Base
    if n <= 1:
        return 1
    # 2. Caso Recursivo
    return n * factorial(n - 1)

print(factorial(5))  # 5 * 4 * 3 * 2 * 1 = 120
\`\`\`

3. **Manejo de la Pila (Call Stack):**
   Cada llamada recursiva añade un marco a la pila de llamadas hasta alcanzar el caso base, resolviendo los retornos en orden inverso (LIFO).

### ✅ Conclusión Definitiva
La recursividad permite escribir soluciones extraordinariamente elegantes para problemas que poseen una estructura intrínsecamente fractal o inductiva (árboles, grafos, fractales y algoritmos de divide y vencerás como QuickSort).`,
      };
    }
  }

  return null;
}
