import type { ForumProject } from "./project";
import type { User } from "./user";
import type { Post } from "./post";

export type EditorView = "thread" | "users";

export interface EditorState {
  project: ForumProject;
  currentView: EditorView;
  editingUserId: string | null;
  editingPostId: string | null;
  hydrated: boolean;
  ioError: string | null;

  // User actions
  createUser: (partial?: Partial<Omit<User, "id">>) => string;
  updateUser: (id: string, patch: Partial<Omit<User, "id">>) => void;
  deleteUser: (id: string) => void;

  // Post actions
  createPost: (args: {
    authorId: string;
    body: string;
    timestamp?: string;
  }) => string;
  updatePost: (id: string, patch: Partial<Omit<Post, "id">>) => void;
  deletePost: (id: string) => void;
  reassignAuthor: (postId: string, authorId: string) => void;

  // Reorder
  movePostUp: (id: string) => void;
  movePostDown: (id: string) => void;
  movePost: (id: string, toIndex: number) => void;

  // Thread
  setThreadTitle: (title: string) => void;

  // Assets
  addAsset: (file: File) => Promise<string>;
  removeAsset: (id: string) => void;

  // Project IO
  loadProject: (project: ForumProject) => void;
  resetProject: () => void;
  markHydrated: () => void;

  // View / editing
  setCurrentView: (view: EditorView) => void;
  setEditingUserId: (id: string | null) => void;
  setEditingPostId: (id: string | null) => void;

  // IO error
  setIoError: (msg: string | null) => void;
}
