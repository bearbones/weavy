import { create } from "zustand";
import type {
  Asset,
  AssetMimeType,
  EditorState,
  ForumProject,
  Post,
  Thread,
  User,
} from "@/types";
import { CURRENT_SCHEMA_VERSION } from "@/types";
import { newId } from "@/utils/id";
import { nowIso } from "@/utils/date";

function extensionFor(mime: AssetMimeType): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error ?? new Error("FileReader failed"));
    r.onload = () => resolve(r.result as string);
    r.readAsDataURL(file);
  });
}

export function createEmptyProject(): ForumProject {
  const seedThread: Thread = {
    id: newId(),
    title: "Untitled thread",
    postIds: [],
  };
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    projectTitle: "Untitled project",
    users: {},
    posts: {},
    assets: {},
    threads: { [seedThread.id]: seedThread },
    threadOrder: [seedThread.id],
    updatedAt: nowIso(),
  };
}

function touch(project: ForumProject): ForumProject {
  return { ...project, updatedAt: nowIso() };
}

function findThreadIdForPost(
  project: ForumProject,
  postId: string,
): string | null {
  for (const tid of project.threadOrder) {
    if (project.threads[tid]?.postIds.includes(postId)) return tid;
  }
  return null;
}

const emptyProject = createEmptyProject();
const emptyProjectFirstThread = emptyProject.threadOrder[0]!;

export const useEditorStore = create<EditorState>()((set, get) => ({
  project: emptyProject,
  currentView: "thread",
  currentThreadId: emptyProjectFirstThread,
  editingUserId: null,
  editingPostId: null,
  hydrated: false,
  ioError: null,

  createUser: (partial) => {
    const id = newId();
    const user: User = {
      id,
      name: partial?.name ?? "New user",
      avatarAssetId: partial?.avatarAssetId ?? null,
      tagline: partial?.tagline,
      signature: partial?.signature,
      rank: partial?.rank,
      joinDate: partial?.joinDate,
      postCount: partial?.postCount,
    };
    set((s) => ({
      project: touch({
        ...s.project,
        users: { ...s.project.users, [id]: user },
      }),
    }));
    return id;
  },

  updateUser: (id, patch) => {
    set((s) => {
      const existing = s.project.users[id];
      if (!existing) return {};
      const updated: User = { ...existing, ...patch, id: existing.id };
      return {
        project: touch({
          ...s.project,
          users: { ...s.project.users, [id]: updated },
        }),
      };
    });
  },

  deleteUser: (id) => {
    const s = get();
    const referenced = Object.values(s.project.posts).some(
      (p) => p.authorId === id,
    );
    if (referenced) {
      set({
        ioError:
          "Can't delete a user who has authored posts. Reassign their posts first.",
      });
      return;
    }
    set((state) => {
      const nextUsers = { ...state.project.users };
      delete nextUsers[id];
      const nextAssets = { ...state.project.assets };
      const assetId = state.project.users[id]?.avatarAssetId;
      if (assetId) {
        const otherUses = Object.values(nextUsers).some(
          (u) => u.avatarAssetId === assetId,
        );
        if (!otherUses) delete nextAssets[assetId];
      }
      return {
        project: touch({
          ...state.project,
          users: nextUsers,
          assets: nextAssets,
        }),
        editingUserId:
          state.editingUserId === id ? null : state.editingUserId,
      };
    });
  },

  createPost: ({ authorId, body, timestamp }) => {
    const id = newId();
    const post: Post = {
      id,
      authorId,
      body,
      timestamp: timestamp ?? nowIso(),
    };
    set((s) => {
      const threadId = s.currentThreadId;
      const thread = s.project.threads[threadId];
      if (!thread) return {};
      return {
        project: touch({
          ...s.project,
          posts: { ...s.project.posts, [id]: post },
          threads: {
            ...s.project.threads,
            [threadId]: {
              ...thread,
              postIds: [...thread.postIds, id],
            },
          },
        }),
      };
    });
    return id;
  },

  updatePost: (id, patch) => {
    set((s) => {
      const existing = s.project.posts[id];
      if (!existing) return {};
      const updated: Post = {
        ...existing,
        ...patch,
        id: existing.id,
        editedAt: nowIso(),
      };
      return {
        project: touch({
          ...s.project,
          posts: { ...s.project.posts, [id]: updated },
        }),
      };
    });
  },

  deletePost: (id) => {
    set((s) => {
      const owningThreadId = findThreadIdForPost(s.project, id);
      const nextPosts = { ...s.project.posts };
      delete nextPosts[id];
      const nextThreads = { ...s.project.threads };
      if (owningThreadId) {
        const owning = nextThreads[owningThreadId];
        if (owning) {
          nextThreads[owningThreadId] = {
            ...owning,
            postIds: owning.postIds.filter((pid) => pid !== id),
          };
        }
      }
      return {
        project: touch({
          ...s.project,
          posts: nextPosts,
          threads: nextThreads,
        }),
        editingPostId:
          s.editingPostId === id ? null : s.editingPostId,
      };
    });
  },

  reassignAuthor: (postId, authorId) => {
    set((s) => {
      const existing = s.project.posts[postId];
      if (!existing) return {};
      if (!s.project.users[authorId]) return {};
      return {
        project: touch({
          ...s.project,
          posts: {
            ...s.project.posts,
            [postId]: { ...existing, authorId },
          },
        }),
      };
    });
  },

  movePost: (id, toIndex) => {
    set((s) => {
      const threadId = findThreadIdForPost(s.project, id);
      if (!threadId) return {};
      const thread = s.project.threads[threadId];
      if (!thread) return {};
      const ids = thread.postIds;
      const from = ids.indexOf(id);
      if (from < 0) return {};
      const clampedTo = Math.max(0, Math.min(ids.length - 1, toIndex));
      if (from === clampedTo) return {};
      const next = ids.slice();
      next.splice(from, 1);
      next.splice(clampedTo, 0, id);
      return {
        project: touch({
          ...s.project,
          threads: {
            ...s.project.threads,
            [threadId]: { ...thread, postIds: next },
          },
        }),
      };
    });
  },

  movePostUp: (id) => {
    const project = get().project;
    const threadId = findThreadIdForPost(project, id);
    if (!threadId) return;
    const thread = project.threads[threadId];
    if (!thread) return;
    const idx = thread.postIds.indexOf(id);
    if (idx > 0) get().movePost(id, idx - 1);
  },

  movePostDown: (id) => {
    const project = get().project;
    const threadId = findThreadIdForPost(project, id);
    if (!threadId) return;
    const thread = project.threads[threadId];
    if (!thread) return;
    const ids = thread.postIds;
    const idx = ids.indexOf(id);
    if (idx >= 0 && idx < ids.length - 1) get().movePost(id, idx + 1);
  },

  createThread: (title) => {
    const id = newId();
    const thread: Thread = {
      id,
      title: title ?? "New thread",
      postIds: [],
    };
    set((s) => ({
      project: touch({
        ...s.project,
        threads: { ...s.project.threads, [id]: thread },
        threadOrder: [...s.project.threadOrder, id],
      }),
      currentThreadId: id,
    }));
    return id;
  },

  renameThread: (id, title) => {
    set((s) => {
      const thread = s.project.threads[id];
      if (!thread) return {};
      return {
        project: touch({
          ...s.project,
          threads: {
            ...s.project.threads,
            [id]: { ...thread, title },
          },
        }),
      };
    });
  },

  deleteThread: (id) => {
    const s = get();
    if (s.project.threadOrder.length <= 1) {
      set({
        ioError:
          "Can't delete the only thread. Create another thread first.",
      });
      return;
    }
    const thread = s.project.threads[id];
    if (!thread) return;
    set((state) => {
      const nextThreads = { ...state.project.threads };
      delete nextThreads[id];
      const nextOrder = state.project.threadOrder.filter((tid) => tid !== id);
      const nextPosts = { ...state.project.posts };
      for (const pid of thread.postIds) {
        delete nextPosts[pid];
      }
      let nextCurrent = state.currentThreadId;
      if (nextCurrent === id) {
        const removedIdx = state.project.threadOrder.indexOf(id);
        const fallbackIdx = Math.max(
          0,
          Math.min(removedIdx, nextOrder.length - 1),
        );
        nextCurrent = nextOrder[fallbackIdx] ?? state.currentThreadId;
      }
      const nextEditingPostId =
        state.editingPostId && thread.postIds.includes(state.editingPostId)
          ? null
          : state.editingPostId;
      return {
        project: touch({
          ...state.project,
          threads: nextThreads,
          threadOrder: nextOrder,
          posts: nextPosts,
        }),
        currentThreadId: nextCurrent,
        editingPostId: nextEditingPostId,
      };
    });
  },

  setCurrentThreadId: (id) => {
    const s = get();
    if (!s.project.threads[id]) return;
    set({ currentThreadId: id, editingPostId: null });
  },

  moveThread: (id, toIndex) => {
    set((s) => {
      const order = s.project.threadOrder;
      const from = order.indexOf(id);
      if (from < 0) return {};
      const clampedTo = Math.max(0, Math.min(order.length - 1, toIndex));
      if (from === clampedTo) return {};
      const next = order.slice();
      next.splice(from, 1);
      next.splice(clampedTo, 0, id);
      return {
        project: touch({
          ...s.project,
          threadOrder: next,
        }),
      };
    });
  },

  setProjectTitle: (title) => {
    set((s) => ({
      project: touch({
        ...s.project,
        projectTitle: title,
      }),
    }));
  },

  addAsset: async (file) => {
    const mime = file.type;
    if (
      mime !== "image/png" &&
      mime !== "image/jpeg" &&
      mime !== "image/gif" &&
      mime !== "image/webp"
    ) {
      const msg = `Unsupported image type: ${mime || "unknown"}. Use PNG, JPEG, GIF, or WebP.`;
      set({ ioError: msg });
      throw new Error(msg);
    }
    const dataUrl = await readFileAsDataUrl(file);
    const id = newId();
    const filename = `${id}.${extensionFor(mime)}`;
    const asset: Asset = { id, filename, mimeType: mime, dataUrl };
    set((s) => ({
      project: touch({
        ...s.project,
        assets: { ...s.project.assets, [id]: asset },
      }),
    }));
    return id;
  },

  removeAsset: (id) => {
    set((s) => {
      const referenced = Object.values(s.project.users).some(
        (u) => u.avatarAssetId === id,
      );
      if (referenced) return {};
      const nextAssets = { ...s.project.assets };
      delete nextAssets[id];
      return {
        project: touch({ ...s.project, assets: nextAssets }),
      };
    });
  },

  loadProject: (project) => {
    const firstThread = project.threadOrder[0];
    set({
      project,
      currentThreadId: firstThread,
      editingUserId: null,
      editingPostId: null,
      ioError: null,
    });
  },

  resetProject: () => {
    const fresh = createEmptyProject();
    set({
      project: fresh,
      currentThreadId: fresh.threadOrder[0],
      editingUserId: null,
      editingPostId: null,
      ioError: null,
    });
  },

  markHydrated: () => set({ hydrated: true }),

  setCurrentView: (view) => set({ currentView: view }),
  setEditingUserId: (id) => set({ editingUserId: id }),
  setEditingPostId: (id) => set({ editingPostId: id }),

  setIoError: (msg) => set({ ioError: msg }),
}));
