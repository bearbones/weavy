import { useEditorStore } from "@/store";
import { PostCard } from "@/components/PostCard/PostCard";
import { PostEditor } from "@/components/PostEditor/PostEditor";
import { NewPostComposer } from "@/components/NewPostComposer/NewPostComposer";
import styles from "./ThreadView.module.css";

export function ThreadView() {
  const currentThreadId = useEditorStore((s) => s.currentThreadId);
  const thread = useEditorStore((s) => s.project.threads[currentThreadId]);
  const renameThread = useEditorStore((s) => s.renameThread);
  const editingPostId = useEditorStore((s) => s.editingPostId);

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
          {postIds.map((id, index) =>
            editingPostId === id ? (
              <li key={id}>
                <PostEditor postId={id} />
              </li>
            ) : (
              <li key={id}>
                <PostCard postId={id} index={index} total={postIds.length} />
              </li>
            ),
          )}
        </ol>
      )}

      <div className={styles.composerWrap}>
        <NewPostComposer />
      </div>
    </div>
  );
}
