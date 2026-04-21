import { useEffect, useMemo, useRef, useState } from "react";
import { useEditorStore } from "@/store";
import { BBCodeToolbar } from "@/components/BBCodeToolbar/BBCodeToolbar";
import { BBCodeRenderer } from "@/components/BBCodeRenderer/BBCodeRenderer";
import styles from "./UserEditor.module.css";

interface Props {
  userId: string;
  onClose: () => void;
}

export function UserEditor({ userId, onClose }: Props) {
  const user = useEditorStore((s) => s.project.users[userId]);
  const assets = useEditorStore((s) => s.project.assets);
  const updateUser = useEditorStore((s) => s.updateUser);
  const deleteUser = useEditorStore((s) => s.deleteUser);
  const addAsset = useEditorStore((s) => s.addAsset);
  const removeAsset = useEditorStore((s) => s.removeAsset);
  const posts = useEditorStore((s) => s.project.posts);

  const [name, setName] = useState(user?.name ?? "");
  const [tagline, setTagline] = useState(user?.tagline ?? "");
  const [rank, setRank] = useState(user?.rank ?? "");
  const [joinDate, setJoinDate] = useState(user?.joinDate ?? "");
  const [postCount, setPostCount] = useState<string>(
    user?.postCount != null ? String(user.postCount) : "",
  );
  const [signature, setSignature] = useState(user?.signature ?? "");

  const sigRef = useRef<HTMLTextAreaElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setTagline(user.tagline ?? "");
    setRank(user.rank ?? "");
    setJoinDate(user.joinDate ?? "");
    setPostCount(user.postCount != null ? String(user.postCount) : "");
    setSignature(user.signature ?? "");
  }, [userId, user]);

  const isReferenced = useMemo(
    () => Object.values(posts).some((p) => p.authorId === userId),
    [posts, userId],
  );

  if (!user) return null;

  const avatar = user.avatarAssetId ? assets[user.avatarAssetId] : null;

  const handleSave = () => {
    const postCountNum = postCount === "" ? undefined : Number(postCount);
    updateUser(userId, {
      name: name.trim() || "Unnamed user",
      tagline: tagline || undefined,
      rank: rank || undefined,
      joinDate: joinDate || undefined,
      postCount:
        postCountNum != null && Number.isFinite(postCountNum)
          ? postCountNum
          : undefined,
      signature: signature || undefined,
    });
    onClose();
  };

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const previousAssetId = user.avatarAssetId;
      const assetId = await addAsset(file);
      updateUser(userId, { avatarAssetId: assetId });
      if (previousAssetId) removeAsset(previousAssetId);
    } catch {
      // ioError is set by the store
    }
  };

  const handleRemoveAvatar = () => {
    const previousAssetId = user.avatarAssetId;
    updateUser(userId, { avatarAssetId: null });
    if (previousAssetId) removeAsset(previousAssetId);
  };

  const handleDelete = () => {
    if (isReferenced) return;
    if (!window.confirm(`Delete user "${user.name}"?`)) return;
    deleteUser(userId);
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-label="Edit user"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h3>Edit user</h3>
          <button type="button" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarPreview}>
              {avatar ? (
                <img src={avatar.dataUrl} alt="" />
              ) : (
                <div className={styles.avatarPlaceholder}>?</div>
              )}
            </div>
            <div className={styles.avatarActions}>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
              >
                Upload image…
              </button>
              {avatar && (
                <button type="button" onClick={handleRemoveAvatar}>
                  Remove
                </button>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className={styles.hiddenInput}
              />
            </div>
          </div>

          <div className={styles.row}>
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Rank / Title
              <input
                type="text"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="e.g. Senior Member"
              />
            </label>
          </div>
          <div className={styles.row}>
            <label>
              Tagline
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Short phrase under the name"
              />
            </label>
          </div>
          <div className={styles.row}>
            <label>
              Join date
              <input
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
              />
            </label>
            <label>
              Post count
              <input
                type="number"
                min={0}
                value={postCount}
                onChange={(e) => setPostCount(e.target.value)}
              />
            </label>
          </div>
          <div className={styles.signatureSection}>
            <label>Signature (BBCode)</label>
            <BBCodeToolbar textareaRef={sigRef} onChange={setSignature} />
            <textarea
              ref={sigRef}
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              rows={3}
              placeholder="[i]— quote or flourish here[/i]"
            />
            {signature && (
              <div className={styles.signaturePreview}>
                <div className={styles.previewLabel}>Preview</div>
                <BBCodeRenderer source={signature} />
              </div>
            )}
          </div>
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.danger}
            onClick={handleDelete}
            disabled={isReferenced}
            title={
              isReferenced
                ? "User has posts — reassign them first"
                : "Delete this user"
            }
          >
            Delete
          </button>
          <div className={styles.spacer} />
          <button type="button" onClick={onClose}>
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
    </div>
  );
}
