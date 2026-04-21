import { useEditorStore } from "@/store";
import { PostCard } from "@/components/PostCard/PostCard";
import { PostEditor } from "@/components/PostEditor/PostEditor";
import { NewPostComposer } from "@/components/NewPostComposer/NewPostComposer";
import styles from "./ThreadView.module.css";

export function ThreadView() {
  const title = useEditorStore((s) => s.project.thread.title);
  const setThreadTitle = useEditorStore((s) => s.setThreadTitle);
  const postIds = useEditorStore((s) => s.project.thread.postIds);
  const editingPostId = useEditorStore((s) => s.editingPostId);

  return (
    <div className={styles.thread}>
      <div className={styles.titleBar}>
        <input
          type="text"
          className={styles.titleInput}
          value={title}
          onChange={(e) => setThreadTitle(e.target.value)}
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
