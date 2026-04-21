import { useEffect, useMemo, useRef, useState } from "react";
import { useEditorStore } from "@/store";
import { BBCodeToolbar } from "@/components/BBCodeToolbar/BBCodeToolbar";
import { BBCodeRenderer } from "@/components/BBCodeRenderer/BBCodeRenderer";
import styles from "./NewPostComposer.module.css";

export function NewPostComposer() {
  const users = useEditorStore((s) => s.project.users);
  const postIds = useEditorStore((s) => s.project.thread.postIds);
  const posts = useEditorStore((s) => s.project.posts);
  const createPost = useEditorStore((s) => s.createPost);

  const orderedUsers = useMemo(
    () =>
      Object.values(users).sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );

  const lastAuthorId = useMemo(() => {
    const last = postIds[postIds.length - 1];
    if (!last) return undefined;
    return posts[last]?.authorId;
  }, [postIds, posts]);

  const [authorId, setAuthorId] = useState<string>(
    lastAuthorId ?? orderedUsers[0]?.id ?? "",
  );
  const [body, setBody] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!authorId && orderedUsers[0]) {
      setAuthorId(orderedUsers[0].id);
    } else if (authorId && !users[authorId]) {
      setAuthorId(orderedUsers[0]?.id ?? "");
    }
  }, [authorId, orderedUsers, users]);

  if (orderedUsers.length === 0) {
    return (
      <div className={styles.empty}>
        Add a user before composing posts.
      </div>
    );
  }

  const handleSubmit = () => {
    if (!authorId || !body.trim()) return;
    createPost({ authorId, body });
    setBody("");
    if (lastAuthorId !== authorId) {
      // keep the author as the last one used
    }
  };

  return (
    <div className={styles.composer}>
      <header className={styles.header}>
        <span>New post</span>
        <label className={styles.authorPicker}>
          as
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
      </header>
      <BBCodeToolbar textareaRef={bodyRef} onChange={setBody} />
      <textarea
        ref={bodyRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="Write a reply…"
        className={styles.body}
      />
      {body && (
        <div className={styles.preview}>
          <div className={styles.previewLabel}>Preview</div>
          <BBCodeRenderer source={body} />
        </div>
      )}
      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.primary}
          onClick={handleSubmit}
          disabled={!body.trim()}
        >
          Post
        </button>
      </footer>
    </div>
  );
}
