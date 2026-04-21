import { useMemo } from "react";
import { renderBBCode } from "@/utils/bbcode";
import styles from "./BBCodeRenderer.module.css";

interface Props {
  source: string;
  className?: string;
}

export function BBCodeRenderer({ source, className }: Props) {
  const html = useMemo(() => renderBBCode(source), [source]);
  return (
    <div
      className={`${styles.rendered} ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
