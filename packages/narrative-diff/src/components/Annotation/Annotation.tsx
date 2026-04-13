import type { AnnotationSpec } from "@/types/narrative-spec";
import styles from "./Annotation.module.css";

interface AnnotationProps {
  annotation: AnnotationSpec;
}

const kindLabels: Record<NonNullable<AnnotationSpec["kind"]>, string> = {
  info: "Info",
  warning: "Warning",
  question: "Question",
  suggestion: "Suggestion",
};

export function Annotation({ annotation }: AnnotationProps) {
  const kind = annotation.kind ?? "info";

  return (
    <div className={`${styles.annotation} ${styles[kind]}`}>
      <span className={styles.badge}>{kindLabels[kind]}</span>
      <span className={styles.body}>{annotation.body}</span>
    </div>
  );
}
