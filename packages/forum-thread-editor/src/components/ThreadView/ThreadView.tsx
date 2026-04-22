import { useState } from "react";
import { useEditorStore } from "@/store";
import { PostCard } from "@/components/PostCard/PostCard";
import { PostEditor } from "@/components/PostEditor/PostEditor";
import { NewPostComposer } from "@/components/NewPostComposer/NewPostComposer";
import styles from "./ThreadView.module.css";

const DRAG_MIME = "application/x-forum-thread-editor-post-id";

export function ThreadView() {
  const currentThreadId = useEditorStore((s) => s.currentThreadId);
  const thread = useEditorStore((s) => s.project.threads[currentThreadId]);
  const renameThread = useEditorStore((s) => s.renameThread);
  const editingPostId = useEditorStore((s) => s.editingPostId);
  const movePost = useEditorStore((s) => s.movePost);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  if (!thread) {
    return (
      <div className={styles.thread}>
        <div className={styles.empty}>No thread selected.</div>
      </div>
    );
  }

  const { title, postIds } = thread;

  return (
    <div className={styles.thread}>
      <div className={styles.titleBar}>
        <input
          type="text"
          className={styles.titleInput}
          value={title}
          onChange={(e) => renameThread(currentThreadId, e.target.value)}
          placeholder="Thread title"
        />
      </div>

      {postIds.length === 0 ? (
        <div className={styles.empty}>
          No posts yet — compose the first reply below.
        </div>
      ) : (
        <ol className={styles.posts}>
          {postIds.map((id, index) => {
            if (editingPostId === id) {
              return (
                <li key={id}>
                  <PostEditor postId={id} />
                </li>
              );
            }
            const isDropTarget = dragOverId === id;
            return (
              <li
                key={id}
                draggable
                className={isDropTarget ? styles.dropTarget : undefined}
                onDragStart={(e) => {
                  e.dataTransfer.setData(DRAG_MIME, id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (!e.dataTransfer.types.includes(DRAG_MIME)) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverId !== id) setDragOverId(id);
                }}
                onDragLeave={() => {
                  setDragOverId((prev) => (prev === id ? null : prev));
                }}
                onDrop={(e) => {
                  const src = e.dataTransfer.getData(DRAG_MIME);
                  if (!src) return;
                  e.preventDefault();
                  if (src !== id) movePost(src, postIds.indexOf(id));
                  setDragOverId(null);
                }}
                onDragEnd={() => setDragOverId(null)}
              >
                <PostCard postId={id} index={index} total={postIds.length} />
              </li>
            );
          })}
        </ol>
      )}

      <div className={styles.composerWrap}>
        <NewPostComposer />
      </div>
    </div>
  );
}
