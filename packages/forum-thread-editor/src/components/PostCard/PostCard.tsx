import { useMemo } from "react";
import { useEditorStore } from "@/store";
import { BBCodeRenderer } from "@/components/BBCodeRenderer/BBCodeRenderer";
import { formatTimestamp } from "@/utils/date";
import styles from "./PostCard.module.css";

interface Props {
  postId: string;
  index: number;
  total: number;
}

export function PostCard({ postId, index, total }: Props) {
  const post = useEditorStore((s) => s.project.posts[postId]);
  const users = useEditorStore((s) => s.project.users);
  const assets = useEditorStore((s) => s.project.assets);
  const setEditingPostId = useEditorStore((s) => s.setEditingPostId);
  const deletePost = useEditorStore((s) => s.deletePost);
  const movePostUp = useEditorStore((s) => s.movePostUp);
  const movePostDown = useEditorStore((s) => s.movePostDown);
  const reassignAuthor = useEditorStore((s) => s.reassignAuthor);
  const editorUserName = useEditorStore((s) =>
    post?.editedByUserId
      ? s.project.users[post.editedByUserId]?.name
      : undefined,
  );

  const orderedUsers = useMemo(
    () =>
      Object.values(users).sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );

  if (!post) return null;
  const author = users[post.authorId];
  const avatar =
    author?.avatarAssetId != null ? assets[author.avatarAssetId] : null;

  const handleDelete = () => {
    if (!window.confirm("Delete this post?")) return;
    deletePost(postId);
  };

  return (
    <article className={styles.post}>
      <aside className={styles.userCol}>
        <div className={styles.name}>{author?.name ?? "Unknown user"}</div>
        {author?.rank && <div className={styles.rank}>{author.rank}</div>}
        <div className={styles.avatar}>
          {avatar ? (
            <img src={avatar.dataUrl} alt="" />
          ) : (
            <div className={styles.avatarPlaceholder}>?</div>
          )}
        </div>
        {author?.tagline && (
          <div className={styles.tagline}>{author.tagline}</div>
        )}
        <dl className={styles.userStats}>
          {author?.joinDate && (
            <>
              <dt>Joined:</dt>
              <dd>{author.joinDate}</dd>
            </>
          )}
          {author?.postCount != null && (
            <>
              <dt>Posts:</dt>
              <dd>{author.postCount}</dd>
            </>
          )}
        </dl>
      </aside>

      <section className={styles.bodyCol}>
        <header className={styles.postHeader}>
          <span className={styles.timestamp}>
            Posted: {formatTimestamp(post.timestamp)}
          </span>
          {post.editedAt && (
            <span className={styles.edited} title={post.editedAt}>
              (edited
              {editorUserName ? ` by ${editorUserName}` : ""})
            </span>
          )}
          <span className={styles.postIndex}>
            #{index + 1} of {total}
          </span>
        </header>

        <div className={styles.postBody}>
          <BBCodeRenderer source={post.body} />
        </div>

        {author?.signature && (
          <>
            <hr className={styles.sigDivider} />
            <div className={styles.signature}>
              <BBCodeRenderer source={author.signature} />
            </div>
          </>
        )}

        <footer className={styles.postActions}>
          <label className={styles.reassign}>
            Author:
            <select
              value={post.authorId}
              onChange={(e) => reassignAuthor(postId, e.target.value)}
            >
              {orderedUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.spacer} />
          <button
            type="button"
            onClick={() => movePostUp(postId)}
            disabled={index === 0}
            title="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => movePostDown(postId)}
            disabled={index === total - 1}
            title="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => setEditingPostId(postId)}
          >
            Edit
          </button>
          <button
            type="button"
            className={styles.danger}
            onClick={handleDelete}
          >
            Delete
          </button>
        </footer>
      </section>
    </article>
  );
}
