import type { Asset, SerializedAsset } from "./asset";
import type { Post } from "./post";
import type { Thread } from "./thread";
import type { User } from "./user";

export const CURRENT_SCHEMA_VERSION = 2 as const;

export interface ForumProject {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION;
  projectTitle: string;
  users: Record<string, User>;
  posts: Record<string, Post>;
  assets: Record<string, Asset>;
  threads: Record<string, Thread>;
  threadOrder: string[];
  updatedAt: string;
}

export interface SerializedForumProject
  extends Omit<ForumProject, "assets"> {
  assets: Record<string, SerializedAsset>;
}
