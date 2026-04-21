import type { Asset, SerializedAsset } from "./asset";
import type { Post } from "./post";
import type { Thread } from "./thread";
import type { User } from "./user";

export const CURRENT_SCHEMA_VERSION = 1 as const;

export interface ForumProject {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION;
  users: Record<string, User>;
  posts: Record<string, Post>;
  assets: Record<string, Asset>;
  thread: Thread;
  updatedAt: string;
}

export interface SerializedForumProject
  extends Omit<ForumProject, "assets"> {
  assets: Record<string, SerializedAsset>;
}
