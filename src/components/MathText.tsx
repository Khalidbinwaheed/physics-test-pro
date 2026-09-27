import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Renders question / option text, turning $...$ segments into typeset formulas
 * (KaTeX) so teachers can write things like $F = ma$ or $\lambda = h/p$.
 * Text outside the delimiters is rendered as plain text (never as HTML).
 */
export function MathText({ text, className }: { text: string; className?: string }) {
  const parts = splitMath(text ?? "");

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.math ? (
          <span
            key={index}
            // KaTeX output only; source is escaped by KaTeX itself.
            dangerouslySetInnerHTML={{ __html: renderMath(part.value) }}
          />
        ) : (
          <span key={index}>{part.value}</span>
        ),
      )}
    </span>
  );
}

function renderMath(value: string) {
  try {
    return katex.renderToString(value, { throwOnError: false, output: "html" });
  } catch {
    return escapeHtml(value);
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}

function splitMath(text: string): { math: boolean; value: string }[] {
  const out: { math: boolean; value: string }[] = [];
  const regex = /\$([^$]+)\$/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) out.push({ math: false, value: text.slice(last, match.index) });
    out.push({ math: true, value: match[1]! });
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push({ math: false, value: text.slice(last) });
  return out.length ? out : [{ math: false, value: text }];
}
