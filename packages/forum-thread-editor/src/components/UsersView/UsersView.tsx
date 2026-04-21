import { useMemo } from "react";
import { useEditorStore } from "@/store";
import { UserEditor } from "@/components/UserEditor/UserEditor";
import styles from "./UsersView.module.css";

export function UsersView() {
  const users = useEditorStore((s) => s.project.users);
  const assets = useEditorStore((s) => s.project.assets);
  const editingUserId = useEditorStore((s) => s.editingUserId);
  const setEditingUserId = useEditorStore((s) => s.setEditingUserId);
  const createUser = useEditorStore((s) => s.createUser);

  const orderedUsers = useMemo(
    () =>
      Object.values(users).sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );

  const handleAdd = () => {
    const id = createUser({ name: "New user" });
    setEditingUserId(id);
  };

  return (
    <div className={styles.usersView}>
      <div className={styles.header}>
        <h2>Users</h2>
        <span className={styles.count}>
          {orderedUsers.length} total
        </span>
      </div>
      <div className={styles.grid}>
        {orderedUsers.map((user) => {
          const avatar = user.avatarAssetId
            ? assets[user.avatarAssetId]
            : null;
          return (
            <button
              key={user.id}
              type="button"
              className={styles.card}
              onClick={() => setEditingUserId(user.id)}
            >
              <div className={styles.avatar}>
                {avatar ? (
                  <img src={avatar.dataUrl} alt="" />
                ) : (
                  <div className={styles.avatarPlaceholder}>?</div>
                )}
              </div>
              <div className={styles.meta}>
                <div className={styles.name}>{user.name}</div>
                {user.rank && (
                  <div className={styles.rank}>{user.rank}</div>
                )}
                {user.tagline && (
                  <div className={styles.tagline}>{user.tagline}</div>
                )}
              </div>
            </button>
          );
        })}
        <button
          type="button"
          className={styles.addCard}
          onClick={handleAdd}
        >
          + Add user
        </button>
      </div>
      {editingUserId && (
        <UserEditor
          userId={editingUserId}
          onClose={() => setEditingUserId(null)}
        />
      )}
    </div>
  );
}
