import { useEffect, useMemo, useRef, useState } from "react";
import { useEditorStore } from "@/store";
import { BBCodeToolbar } from "@/components/BBCodeToolbar/BBCodeToolbar";
import { BBCodeRenderer } from "@/components/BBCodeRenderer/BBCodeRenderer";
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "@/utils/date";
import styles from "./PostEditor.module.css";

interface Props {
  postId: string;
}

export function PostEditor({ postId }: Props) {
  const post = useEditorStore((s) => s.project.posts[postId]);
  const users = useEditorStore((s) => s.project.users);
  const updatePost = useEditorStore((s) => s.updatePost);
  const setEditingPostId = useEditorStore((s) => s.setEditingPostId);

  const [authorId, setAuthorId] = useState(post?.authorId ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [timestampLocal, setTimestampLocal] = useState(
    post ? toDatetimeLocalValue(post.timestamp) : "",
  );
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!post) return;
    setAuthorId(post.authorId);
    setBody(post.body);
    setTimestampLocal(toDatetimeLocalValue(post.timestamp));
  }, [postId, post]);

  const orderedUsers = useMemo(
    () =>
      Object.values(users).sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );

  if (!post) return null;

  const handleSave = () => {
    updatePost(postId, {
      authorId,
      body,
      timestamp: fromDatetimeLocalValue(timestampLocal),
    });
    setEditingPostId(null);
  };

  return (
    <div className={styles.editor}>
      <header className={styles.header}>
        <strong>Editing post</strong>
      </header>
      <div className={styles.fields}>
        <label className={styles.field}>
          Author
          <select
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
          >
            {orderedUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Timestamp
          <input
            type="datetime-local"
            value={timestampLocal}
            onChange={(e) => setTimestampLocal(e.target.value)}
          />
        </label>
      </div>
      <BBCodeToolbar textareaRef={bodyRef} onChange={setBody} />
      <textarea
        ref={bodyRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={8}
        className={styles.body}
      />
      {body && (
        <div className={styles.preview}>
          <div className={styles.previewLabel}>Preview</div>
          <BBCodeRenderer source={body} />
        </div>
      )}
      <footer className={styles.footer}>
        <button type="button" onClick={() => setEditingPostId(null)}>
          Cancel
        </button>
        <button
          type="button"
          className={styles.primary}
          onClick={handleSave}
        >
          Save
        </button>
      </footer>
    </div>
  );
}
