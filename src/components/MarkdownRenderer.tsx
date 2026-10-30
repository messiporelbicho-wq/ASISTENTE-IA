import React, { useState } from 'react';
import { Copy, Check, Code, Lightbulb, Info } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Split lines and parse blocks
  const renderFormattedText = (text: string) => {
    // Process inline code `code`
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\$[^$]+\$)/g);

    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded-md bg-slate-800 text-amber-300 font-mono text-xs border border-slate-700/60"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        // Inline math
        return (
          <span
            key={i}
            className="font-mono text-xs px-1 text-sky-300 bg-sky-950/40 rounded border border-sky-800/40"
          >
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  // Parse lines into logical blocks (code blocks, block math, headers, lists, paragraphs)
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let inMathBlock = false;
  let mathBuffer: string[] = [];
  let codeCounter = 0;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    // 1. Code blocks ```
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const fullCode = codeBuffer.join('\n');
        const codeIndex = codeCounter++;
        elements.push(
          <div
            key={`code_${idx}`}
            className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-md font-mono text-xs"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Code className="w-3.5 h-3.5 text-sky-400" />
                <span>{codeLang || 'código'}</span>
              </span>
              <button
                onClick={() => handleCopyCode(fullCode, codeIndex)}
                className="flex items-center gap-1 hover:text-white transition-colors px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {copiedCodeIndex === codeIndex ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-emerald-300 leading-relaxed font-mono">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        codeLang = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.trim().replace(/^```/, '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // 2. Math blocks $$...$$
    if (line.trim().startsWith('$$') && line.trim().endsWith('$$') && line.trim().length > 4) {
      const mathContent = line.trim().slice(2, -2);
      elements.push(
        <div
          key={`math_${idx}`}
          className="my-3 p-3 bg-slate-900/90 border border-sky-500/30 rounded-xl text-center font-mono text-sky-300 shadow-sm overflow-x-auto"
        >
          {mathContent}
        </div>
      );
      continue;
    }

    if (line.trim() === '$$') {
      if (inMathBlock) {
        elements.push(
          <div
            key={`math_${idx}`}
            className="my-3 p-3 bg-slate-900/90 border border-sky-500/30 rounded-xl text-center font-mono text-sky-300 shadow-sm overflow-x-auto"
          >
            {mathBuffer.join('\n')}
          </div>
        );
        mathBuffer = [];
        inMathBlock = false;
      } else {
        inMathBlock = true;
      }
      continue;
    }

    if (inMathBlock) {
      mathBuffer.push(line);
      continue;
    }

    // 3. Headings with analytical & conclusive styling
    if (line.startsWith('### ')) {
      const headingRaw = line.replace('### ', '');
      const isConclusion =
        headingRaw.toLowerCase().includes('conclusi') ||
        headingRaw.toLowerCase().includes('resultado');
      const isAnalysis =
        headingRaw.toLowerCase().includes('análisis') ||
        headingRaw.toLowerCase().includes('analisis');

      if (isConclusion) {
        elements.push(
          <div
            key={`h3_conclusion_${idx}`}
            className="mt-5 mb-2.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 shadow-sm"
          >
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{renderFormattedText(headingRaw)}</span>
            </div>
          </div>
        );
      } else if (isAnalysis) {
        elements.push(
          <div
            key={`h3_analysis_${idx}`}
            className="mt-4 mb-2 p-2.5 rounded-xl bg-sky-950/30 border border-sky-500/30"
          >
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-sky-300">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>{renderFormattedText(headingRaw)}</span>
            </div>
          </div>
        );
      } else {
        elements.push(
          <h3
            key={`h3_${idx}`}
            className="text-sm sm:text-base font-bold text-white mt-4 mb-2 flex items-center gap-2 border-b border-slate-800 pb-1"
          >
            <span className="w-1.5 h-3.5 bg-sky-400 rounded-full" />
            <span>{renderFormattedText(headingRaw)}</span>
          </h3>
        );
      }
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2_${idx}`}
          className="text-base sm:text-lg font-extrabold text-white mt-5 mb-2.5 flex items-center gap-2"
        >
          <span className="w-2 h-4.5 bg-amber-400 rounded-full" />
          <span>{renderFormattedText(line.replace('## ', ''))}</span>
        </h2>
      );
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1_${idx}`} className="text-lg sm:text-xl font-black text-white mt-5 mb-3">
          {renderFormattedText(line.replace('# ', ''))}
        </h1>
      );
      continue;
    }

    // 4. Blockquotes / Tips
    if (line.startsWith('> ')) {
      elements.push(
        <div
          key={`quote_${idx}`}
          className="my-2.5 p-3 rounded-xl bg-slate-900/80 border-l-4 border-amber-400 text-slate-300 italic text-xs leading-relaxed flex items-start gap-2.5"
        >
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 not-italic" />
          <div className="flex-1">{renderFormattedText(line.replace('> ', ''))}</div>
        </div>
      );
      continue;
    }

    // 5. Unordered List Items
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const text = line.trim().slice(2);
      elements.push(
        <li key={`li_${idx}`} className="flex items-start gap-2 ml-2 my-1 text-xs text-slate-300 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
          <span className="flex-1">{renderFormattedText(text)}</span>
        </li>
      );
      continue;
    }

    // 6. Ordered List Items
    const matchNumber = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (matchNumber) {
      elements.push(
        <div key={`ol_${idx}`} className="flex items-start gap-2.5 ml-1 my-1.5 text-xs text-slate-300 leading-relaxed">
          <span className="w-5 h-5 rounded-md bg-slate-800 text-sky-400 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-700 mt-0.5">
            {matchNumber[1]}
          </span>
          <span className="flex-1">{renderFormattedText(matchNumber[2])}</span>
        </div>
      );
      continue;
    }

    // 7. Horizontal separator
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={`hr_${idx}`} className="my-3 border-slate-800" />);
      continue;
    }

    // 8. Regular paragraph or explicit conclusion line
    if (line.trim()) {
      const isConclusiveLine =
        line.trim().startsWith('✅') ||
        line.toLowerCase().includes('respuesta final:') ||
        line.toLowerCase().includes('conclusión definitiva:');

      if (isConclusiveLine) {
        elements.push(
          <div
            key={`conclusive_p_${idx}`}
            className="my-3 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-medium leading-relaxed shadow-sm"
          >
            {renderFormattedText(line)}
          </div>
        );
      } else {
        elements.push(
          <p key={`p_${idx}`} className="my-1.5 text-xs text-slate-300 leading-relaxed">
            {renderFormattedText(line)}
          </p>
        );
      }
    }
  }

  return <div className="space-y-0.5 font-sans leading-relaxed">{elements}</div>;
};
