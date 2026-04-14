import { forwardRef } from "react";
import type { ResolvedSection } from "@/types/app-state";
import type { DiffChunk, DiffLine } from "@/types/diff";
import type { AnnotationSpec } from "@/types/narrative-spec";
import { SectionStatus } from "@/components/SectionStatus/SectionStatus";
import { Annotation } from "@/components/Annotation/Annotation";
import { useViewerStore } from "@/store";
import styles from "./DiffSection.module.css";

interface DiffSectionProps {
  section: ResolvedSection;
  index: number;
  focused: boolean;
}

export const DiffSection = forwardRef<HTMLElement, DiffSectionProps>(
  function DiffSection({ section, index, focused }, ref) {
    const openCrossLink = useViewerStore((s) => s.openCrossLink);

    return (
      <section
        ref={ref}
        className={`${styles.section} ${focused ? styles.focused : styles.dimmed}`}
        data-section-id={section.id}
        data-section-index={index}
      >
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.heading}>{section.heading}</h2>
            {focused && section.rationale && (
              <p className={styles.rationale}>{section.rationale}</p>
            )}
          </div>
          <SectionStatus sectionId={section.id} />
        </header>

        {section.crossLinks.length > 0 && focused && (
          <div className={styles.crossLinks}>
            {section.crossLinks.map((linkId) => (
              <button
                key={linkId}
                className={styles.crossLinkButton}
                onClick={() => openCrossLink(linkId)}
              >
                &rarr; {linkId}
              </button>
            ))}
          </div>
        )}

        <div className={styles.entries}>
          {section.entries.map((entry, entryIdx) => (
            <div key={entryIdx} className={styles.fileEntry}>
              <div className={styles.filePath}>
                <span className={styles.fileStatus} data-status={entry.file.status}>
                  {entry.file.status === "added" && "+"}
                  {entry.file.status === "deleted" && "-"}
                  {entry.file.status === "renamed" && "→"}
                  {entry.file.status === "modified" && "●"}
                </span>
                {entry.file.newPath !== "/dev/null"
                  ? entry.file.newPath
                  : entry.file.oldPath}
              </div>
              {entry.chunks.map((chunk, chunkIdx) => (
                <ChunkView
                  key={chunkIdx}
                  chunk={chunk}
                  annotations={section.annotations}
                  filePath={entry.file.newPath}
                  showAnnotations={focused}
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  },
);

function ChunkView({
  chunk,
  annotations,
  filePath,
  showAnnotations,
}: {
  chunk: DiffChunk;
  annotations: AnnotationSpec[];
  filePath: string;
  showAnnotations: boolean;
}) {
  return (
    <div className={styles.chunk}>
      <div className={styles.chunkHeader}>{chunk.header}</div>
      <table className={styles.diffTable}>
        <tbody>
          {chunk.changes.map((line, lineIdx) => {
            const lineAnnotations = showAnnotations
              ? annotations.filter(
                  (a) => a.file === filePath && a.line === line.newLineNumber,
                )
              : [];
            return (
              <LineRow
                key={lineIdx}
                line={line}
                annotations={lineAnnotations}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LineRow({
  line,
  annotations,
}: {
  line: DiffLine;
  annotations: AnnotationSpec[];
}) {
  return (
    <>
      <tr className={`${styles.line} ${styles[line.type]}`}>
        <td className={styles.lineNumber}>
          {line.oldLineNumber ?? ""}
        </td>
        <td className={styles.lineNumber}>
          {line.newLineNumber ?? ""}
        </td>
        <td className={styles.linePrefix}>
          {line.type === "add" && "+"}
          {line.type === "delete" && "-"}
          {line.type === "context" && " "}
        </td>
        <td className={styles.lineContent}>
          <pre>{line.content}</pre>
        </td>
      </tr>
      {annotations.map((ann, i) => (
        <tr key={`ann-${i}`} className={styles.annotationRow}>
          <td colSpan={4}>
            <Annotation annotation={ann} />
          </td>
        </tr>
      ))}
    </>
  );
}
