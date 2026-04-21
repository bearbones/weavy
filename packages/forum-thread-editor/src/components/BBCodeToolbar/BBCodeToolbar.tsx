import { useCallback, type RefObject } from "react";
import styles from "./BBCodeToolbar.module.css";

interface Props {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
}

type InsertSpec =
  | { kind: "wrap"; tag: string }
  | { kind: "wrapAttr"; tag: string; attr: string };

export function BBCodeToolbar({ textareaRef, onChange }: Props) {
  const insert = useCallback(
    (spec: InsertSpec) => {
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const value = el.value;
      const selected = value.slice(start, end);
      const openTag =
        spec.kind === "wrap"
          ? `[${spec.tag}]`
          : `[${spec.tag}=${spec.attr}]`;
      const closeTagName =
        spec.kind === "wrap" ? spec.tag : spec.tag;
      const closeTag = `[/${closeTagName}]`;
      const inserted = `${openTag}${selected}${closeTag}`;
      const next = value.slice(0, start) + inserted + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        const cursor = start + openTag.length + selected.length;
        el.focus();
        el.setSelectionRange(cursor, cursor);
      });
    },
    [onChange, textareaRef],
  );

  const insertColor = useCallback(() => {
    const input = window.prompt(
      "Color (hex like #ff0000 or CSS color name):",
      "#ff0000",
    );
    if (!input) return;
    const trimmed = input.trim();
    insert({ kind: "wrapAttr", tag: "color", attr: trimmed });
  }, [insert]);

  const insertSize = useCallback(
    (n: number) => insert({ kind: "wrapAttr", tag: "size", attr: String(n) }),
    [insert],
  );

  return (
    <div className={styles.bar} role="toolbar" aria-label="BBCode formatting">
      <button
        type="button"
        onClick={() => insert({ kind: "wrap", tag: "b" })}
        title="Bold"
      >
        <b>B</b>
      </button>
      <button
        type="button"
        onClick={() => insert({ kind: "wrap", tag: "i" })}
        title="Italic"
      >
        <i>I</i>
      </button>
      <button
        type="button"
        onClick={() => insert({ kind: "wrap", tag: "u" })}
        title="Underline"
      >
        <u>U</u>
      </button>
      <button
        type="button"
        onClick={() => insert({ kind: "wrap", tag: "s" })}
        title="Strikethrough"
      >
        <s>S</s>
      </button>
      <button
        type="button"
        onClick={() => insert({ kind: "wrap", tag: "sub" })}
        title="Subscript"
      >
        x<sub>2</sub>
      </button>
      <button
        type="button"
        onClick={() => insert({ kind: "wrap", tag: "sup" })}
        title="Superscript"
      >
        x<sup>2</sup>
      </button>
      <button
        type="button"
        onClick={() => insert({ kind: "wrap", tag: "mark" })}
        title="Highlight"
      >
        <mark>hl</mark>
      </button>
      <button type="button" onClick={insertColor} title="Color">
        color
      </button>
      <span className={styles.sizeGroup}>
        size
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => insertSize(n)}
            title={`Size ${n}`}
          >
            {n}
          </button>
        ))}
      </span>
      <span className={styles.hint} title="Only these tags survive export">
        portable tags only
      </span>
    </div>
  );
}
