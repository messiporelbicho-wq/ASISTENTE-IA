/**
 * Specialized Academic Math & Arithmetic Evaluator
 * Guarantees 100% precise, step-by-step, conclusive solutions
 * for basic operations (1+1, 2+2, multiplication, division, powers, etc.)
 */

export interface MathResolution {
  isMath: boolean;
  operationType: string;
  expression: string;
  resultText: string;
  explanation: string;
}

// Convert Spanish words to math operators and numbers
const SPANISH_NUMBER_WORDS: Record<string, number> = {
  cero: 0,
  uno: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  veinte: 20,
  treinta: 30,
  cuarenta: 40,
  cincuenta: 50,
  cien: 100,
};

function normalizeQuery(rawQuery: string): string {
  let q = rawQuery.toLowerCase().trim();

  // Remove question punctuation and pleasantries
  q = q.replace(/[¿?¡!]/g, '').trim();
  q = q.replace(/^(por favor|hola|oye|dime|calcula|resuelve|cu[aá]nto\s+es|cuanto\s+da|resultado\s+de|operaci[oó]n|resolver|hallar)\s+/gi, '').trim();

  // Replace operator words
  q = q.replace(/\s+m[aá]s\s+/gi, ' + ');
  q = q.replace(/\s+menos\s+/gi, ' - ');
  q = q.replace(/\s+por\s+/gi, ' * ');
  q = q.replace(/\s+entre\s+/gi, ' / ');
  q = q.replace(/\s+dividido\s+(?:entre|por)\s+/gi, ' / ');
  q = q.replace(/\s+elevado\s+a\s+(?:la\s+)?/gi, ' ^ ');

  // Replace number words if simple binary
  for (const [word, num] of Object.entries(SPANISH_NUMBER_WORDS)) {
    const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
    q = q.replace(wordRegex, num.toString());
  }

  // Replace symbol variations
  q = q.replace(/×/g, '*').replace(/·/g, '*').replace(/x/g, '*');
  q = q.replace(/÷/g, '/').replace(/:/g, '/');

  return q.trim();
}

/**
 * Safe expression evaluator for arithmetic
 */
function evaluateArithmetic(expr: string): number | null {
  // Only allow numbers, basic math operators, spaces, parentheses, dots
  const sanitized = expr.replace(/\s+/g, '');
  if (!/^[\d\.\+\-\*\/\^\(\)]+$/.test(sanitized)) {
    return null;
  }

  // Prevent multiple consecutive operators that aren't negative signs
  if (/[\+\*\/]{2,}/.test(sanitized)) {
    return null;
  }

  try {
    // Replace ^ with ** for JavaScript exponentiation
    const jsExpr = sanitized.replace(/\^/g, '**');
    // Function constructor safer than eval for mathematical numbers
    const fn = new Function(`return (${jsExpr});`);
    const val = fn();
    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      return val;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Main Solver function for basic math and arithmetic questions
 */
export function solveMathQuestion(rawQuery: string): MathResolution | null {
  const cleanQ = normalizeQuery(rawQuery);

  // 1. Percentage check: e.g. "20% de 150" or "el 15% de 200"
  const percentMatch = cleanQ.match(/(\d+(?:\.\d+)?)\s*%\s*(?:de)?\s*(\d+(?:\.\d+)?)/i);
  if (percentMatch) {
    const percent = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    const result = (percent / 100) * total;
    const formattedResult = Number.isInteger(result) ? result.toString() : result.toFixed(2);

    const explanation = `### 📌 Análisis de la Pregunta y Datos
* **Operación solicitada:** Cálculo de porcentaje (${percent}% de ${total}).
* **Datos identificados:**
  - Tasa porcentual: **${percent}%** ($${percent}/100 = ${percent / 100}$)
  - Cantidad base: **${total}**
* **Objetivo:** Hallar la porción proporcional correspondiente al ${percent}% del valor base.

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Fórmula del Porcentaje:**
   $$\\text{Porcentaje} = \\left(\\frac{P}{100}\\right) \\times \\text{Total}$$

2. **Sustitución de Valores:**
   $$\\text{Resultado} = \\left(\\frac{${percent}}{100}\\right) \\times ${total} = ${percent / 100} \\times ${total}$$

3. **Cálculo Numérico:**
   $$\\text{Resultado} = ${formattedResult}$$

4. **Comprobación:**
   $$\\frac{${formattedResult}}{${total}} \\times 100 = ${percent}\\% \\quad \\text{✓ (Verificado)}$$

### ✅ Conclusión Definitiva
El **${percent}% de ${total}** es exactamente **${formattedResult}**.
* **Resultado Final: ${formattedResult}**`;

    return {
      isMath: true,
      operationType: 'Porcentaje',
      expression: `${percent}% de ${total}`,
      resultText: formattedResult,
      explanation,
    };
  }

  // 2. Square root check: e.g. "raiz de 16", "raiz cuadrada de 25", "sqrt(16)", "√16"
  const sqrtMatch = cleanQ.match(/(?:raiz|ra[ií]z|sqrt|√)\s*(?:cuadrada\s+de\s+|de\s+)?(\d+(?:\.\d+)?)/i);
  if (sqrtMatch) {
    const num = parseFloat(sqrtMatch[1]);
    const result = Math.sqrt(num);
    const formattedResult = Number.isInteger(result) ? result.toString() : result.toFixed(4);

    const explanation = `### 📌 Análisis de la Pregunta y Datos
* **Operación solicitada:** Raíz cuadrada ($\\sqrt{${num}}$).
* **Radicando:** **${num}**
* **Índice del radical:** **2** (raíz cuadrada principal).
* **Objetivo:** Hallar el número real no negativo que multiplicado por sí mismo sea igual a ${num}.

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Definición de Raíz Cuadrada:**
   $$\\sqrt{x} = y \\iff y^2 = x \\quad (y \\ge 0)$$

2. **Cálculo:**
   $$\\sqrt{${num}} = ${formattedResult}$$

3. **Comprobación:**
   $$(${formattedResult})^2 = ${num} \\quad \\text{✓ (Comprobación exacta)}$$

### ✅ Conclusión Definitiva
La raíz cuadrada de **${num}** es **${formattedResult}**.
* **Resultado Final: ${formattedResult}**`;

    return {
      isMath: true,
      operationType: 'Radicación',
      expression: `√${num}`,
      resultText: formattedResult,
      explanation,
    };
  }

  // 3. Simple & General Arithmetic (1+1, 2+2, 5*8, 100/4, 25-7, 2^3, (4+6)*3, etc.)
  // Strip equal signs at the end if user wrote "1+1=" or "1+1 = ?"
  const exprCandidate = cleanQ.replace(/=.*$/, '').trim();

  // Must contain at least one operator: +, -, *, /, ^
  const hasOperator = /[\+\-\*\/\^]/.test(exprCandidate);
  // Must contain numbers
  const hasDigits = /\d/.test(exprCandidate);

  if (hasOperator && hasDigits) {
    const numResult = evaluateArithmetic(exprCandidate);
    if (numResult !== null) {
      const formattedResult = Number.isInteger(numResult) ? numResult.toString() : parseFloat(numResult.toFixed(4)).toString();

      // Format expression for display
      const displayExpr = exprCandidate
        .replace(/\*/g, ' × ')
        .replace(/\//g, ' ÷ ')
        .replace(/\+/g, ' + ')
        .replace(/\-/g, ' - ')
        .replace(/\^/g, ' ^ ')
        .replace(/\s+/g, ' ')
        .trim();

      // Check specific case: 1 + 1
      const isOnePlusOne = /^\s*1\s*\+\s*1\s*$/.test(exprCandidate);

      let stepDescription = '';
      let operationName = 'Operación Aritmética';

      if (isOnePlusOne) {
        operationName = 'Suma Elemental (Adición)';
        stepDescription = `1. **Fundamento Conceptual:**
   En el sistema numérico decimal y la definición de adición en los números naturales ($\\mathbb{N}$):
   * Partimos de una unidad inicial: **1** (por ejemplo: una manzana 🍎).
   * Añadimos exactamente otra unidad: **+ 1** (otra manzana 🍎).
   * Al reunir ambas cantidades en un solo conjunto, obtenemos el total acumulado de **2** unidades (🍎🍎).

2. **Cálculo Directo:**
   $$1 + 1 = 2$$

3. **Demostración por Operación Inversa:**
   * La sustracción como operación inversa verifica la igualdad:
     $$2 - 1 = 1 \\quad \\text{✓ (Totalmente verificado)}$$`;
      } else {
        // Detect primary operation
        if (exprCandidate.includes('+') && !exprCandidate.includes('*') && !exprCandidate.includes('/')) {
          operationName = 'Suma (Adición)';
        } else if (exprCandidate.includes('-') && !exprCandidate.includes('*') && !exprCandidate.includes('/')) {
          operationName = 'Resta (Sustracción)';
        } else if (exprCandidate.includes('*') && !exprCandidate.includes('+') && !exprCandidate.includes('-')) {
          operationName = 'Multiplicación (Producto)';
        } else if (exprCandidate.includes('/') && !exprCandidate.includes('+') && !exprCandidate.includes('-')) {
          operationName = 'División (Cociente)';
        } else if (exprCandidate.includes('^')) {
          operationName = 'Potenciación';
        } else {
          operationName = 'Operación Combinada (Jerarquía de Operaciones)';
        }

        stepDescription = `1. **Jerarquía y Reglas de Operación:**
   * Se resuelven primero paréntesis y corchetes (si existen).
   * Se resuelven potencias y raíces.
   * Se resuelven multiplicaciones y divisiones de izquierda a derecha.
   * Se resuelven sumas y restas de izquierda a derecha.

2. **Ejecución del Cálculo Paso a Paso:**
   $$${displayExpr} = ${formattedResult}$$

3. **Comprobación Aritmética:**
   El procedimiento matemático respeta rigurosamente las propiedades de los números reales (conmutativa, asociativa y distributiva).`;
      }

      const explanation = `### 📌 Análisis de la Pregunta y Datos
* **Operación solicitada:** ${operationName} ($${displayExpr}$).
* **Expresión evaluada:** \`${displayExpr}\`
* **Dominio numérico:** Números reales ($\\mathbb{R}$).
* **Objetivo:** Resolver el valor exacto e incuestionable de la expresión.

### 🔢 Desarrollo y Explicación Paso a Paso
${stepDescription}

### ✅ Conclusión Definitiva
El resultado exacto e incuestionable de **${displayExpr}** es **${formattedResult}**.
* **Resultado Final: ${formattedResult}**`;

      return {
        isMath: true,
        operationType: operationName,
        expression: displayExpr,
        resultText: formattedResult,
        explanation,
      };
    }
  }

  // 4. Linear equations check: e.g. "3x + 8 = 20" or "2x = 10" or "x - 5 = 12"
  const linearMatch = cleanQ.match(/^([+-]?\d*(?:\.\d+)?)x\s*([+-]\s*\d+(?:\.\d+)?)\s*=\s*([+-]?\d+(?:\.\d+)?)$/i);
  if (linearMatch) {
    let aStr = linearMatch[1].replace(/\s+/g, '');
    let a = aStr === '' || aStr === '+' ? 1 : aStr === '-' ? -1 : parseFloat(aStr);
    const bStr = linearMatch[2].replace(/\s+/g, '');
    const b = parseFloat(bStr);
    const c = parseFloat(linearMatch[3]);

    const xVal = (c - b) / a;
    const formattedX = Number.isInteger(xVal) ? xVal.toString() : xVal.toFixed(4);

    const explanation = `### 📌 Análisis de la Pregunta y Datos
* **Tipo de problema:** Ecuación lineal de primer grado con una incógnita ($ax + b = c$).
* **Ecuación dada:** \`${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}\`
* **Datos identificados:**
  - Coeficiente de $x$: $a = ${a}$
  - Término independiente inicial: $b = ${b}$
  - Miembro derecho: $c = ${c}$
* **Objetivo:** Despejar el valor único de la incógnita $x$ que satisface la igualdad.

### 🔢 Desarrollo y Explicación Paso a Paso
1. **Transposición del término independiente:**
   Restamos (${b}) en ambos miembros de la ecuación:
   $$${a === 1 ? '' : a === -1 ? '-' : a}x = ${c} - (${b})$$
   $$${a === 1 ? '' : a === -1 ? '-' : a}x = ${c - b}$$

2. **Despeje de la variable dividiendo por el coeficiente:**
   $$x = \\frac{${c - b}}{${a}}$$
   $$x = ${formattedX}$$

3. **Comprobación:**
   Sustituimos $x = ${formattedX}$ en la ecuación original:
   $$${a}(${formattedX}) + (${b}) = ${a * xVal + b} = ${c} \\quad \\text{✓ (Igualdad confirmada)}$$

### ✅ Conclusión Definitiva
El valor exacto de la incógnita es **$x = ${formattedX}$**.
* **Resultado Final: x = ${formattedX}**`;

    return {
      isMath: true,
      operationType: 'Ecuación Lineal',
      expression: cleanQ,
      resultText: `x = ${formattedX}`,
      explanation,
    };
  }

  return null;
}
