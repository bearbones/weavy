/**
 * BBCode subset that round-trips to Unity TextMeshPro + Roblox rich text.
 *
 * Supported tags:
 *   [b] [i] [u] [s] [sub] [sup] [mark]
 *   [size=1..7]   — maps to CSS class bb-size-N in preview
 *   [color=hex|name] — whitelisted (#rgb / #rrggbb, or lowercase name <=20 chars)
 *
 * Anything not in this set is left as escaped text — authors see exactly what
 * they wrote, and downstream consumers don't get surprised by extra markup.
 */

const SIMPLE_TAGS: Record<string, string> = {
  b: "strong",
  i: "em",
  u: "u",
  s: "s",
  sub: "sub",
  sup: "sup",
  mark: "mark",
};

const COLOR_NAME_RE = /^[a-z]{3,20}$/;
const COLOR_HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function applySimpleTag(source: string, tag: string, html: string): string {
  const open = `\\[${tag}\\]`;
  const close = `\\[\\/${tag}\\]`;
  const re = new RegExp(`${open}([\\s\\S]*?)${close}`, "gi");
  let prev = source;
  let next = source.replace(re, `<${html}>$1</${html}>`);
  while (next !== prev) {
    prev = next;
    next = next.replace(re, `<${html}>$1</${html}>`);
  }
  return next;
}

function applyColor(source: string): string {
  const re = /\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi;
  let prev = source;
  let next = source.replace(re, (_m, raw: string, inner: string) => {
    const value = raw.trim();
    if (COLOR_HEX_RE.test(value) || COLOR_NAME_RE.test(value.toLowerCase())) {
      const safe = value.toLowerCase();
      return `<span style="color:${safe}">${inner}</span>`;
    }
    return inner;
  });
  while (next !== prev) {
    prev = next;
    next = next.replace(re, (_m, raw: string, inner: string) => {
      const value = raw.trim();
      if (COLOR_HEX_RE.test(value) || COLOR_NAME_RE.test(value.toLowerCase())) {
        return `<span style="color:${value.toLowerCase()}">${inner}</span>`;
      }
      return inner;
    });
  }
  return next;
}

function applySize(source: string): string {
  const re = /\[size=([1-7])\]([\s\S]*?)\[\/size\]/gi;
  let prev = source;
  let next = source.replace(
    re,
    (_m, n: string, inner: string) => `<span class="bb-size-${n}">${inner}</span>`,
  );
  while (next !== prev) {
    prev = next;
    next = next.replace(
      re,
      (_m, n: string, inner: string) => `<span class="bb-size-${n}">${inner}</span>`,
    );
  }
  return next;
}

export function renderBBCode(source: string): string {
  if (!source) return "";
  let out = htmlEscape(source);

  for (const [tag, html] of Object.entries(SIMPLE_TAGS)) {
    out = applySimpleTag(out, tag, html);
  }
  out = applySize(out);
  out = applyColor(out);

  out = out.replace(/\r\n|\r|\n/g, "<br>");
  return out;
}

export const PORTABLE_TAG_NAMES = [
  "b",
  "i",
  "u",
  "s",
  "sub",
  "sup",
  "mark",
  "size=1..7",
  "color=#rgb|name",
] as const;

if (import.meta.env.DEV) {
  const assert = (cond: boolean, label: string) => {
    if (!cond) {
      // eslint-disable-next-line no-console
      console.error("[bbcode] smoke test failed:", label);
    }
  };
  assert(
    renderBBCode("hello <world>") === "hello &lt;world&gt;",
    "escape",
  );
  assert(renderBBCode("[b]x[/b]") === "<strong>x</strong>", "bold");
  assert(
    renderBBCode("[i][b]x[/b][/i]") === "<em><strong>x</strong></em>",
    "nested",
  );
  assert(
    renderBBCode("[color=#ff0000]r[/color]") ===
      '<span style="color:#ff0000">r</span>',
    "color hex",
  );
  assert(
    renderBBCode("[color=javascript:alert(1)]x[/color]") === "x",
    "color rejects junk",
  );
  assert(
    renderBBCode("[size=5]big[/size]") ===
      '<span class="bb-size-5">big</span>',
    "size",
  );
  assert(renderBBCode("line1\nline2") === "line1<br>line2", "newline");
  assert(
    renderBBCode("[unknown]x[/unknown]") === "[unknown]x[/unknown]",
    "unknown tag left as text",
  );
}
