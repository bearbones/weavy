import type { Post, Thread, User } from "@/types";
import { CURRENT_SCHEMA_VERSION } from "@/types";

export interface MigratedProject<A> {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION;
  projectTitle: string;
  users: Record<string, User>;
  posts: Record<string, Post>;
  assets: Record<string, A>;
  threads: Record<string, Thread>;
  threadOrder: string[];
  updatedAt: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}

function requireRecord(v: unknown, key: string): Record<string, unknown> {
  if (!isRecord(v)) {
    throw new Error(`Invalid project.json: missing or invalid ${key}`);
  }
  return v;
}

export function migrateProject<A>(raw: unknown): MigratedProject<A> {
  const v = requireRecord(raw, "root");
  const version = v.schemaVersion;

  if (version === CURRENT_SCHEMA_VERSION) {
    requireRecord(v.users, "users");
    requireRecord(v.posts, "posts");
    requireRecord(v.assets, "assets");
    requireRecord(v.threads, "threads");
    if (!Array.isArray(v.threadOrder)) {
      throw new Error("Invalid project.json: threadOrder must be an array");
    }
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      projectTitle:
        typeof v.projectTitle === "string" ? v.projectTitle : "Untitled project",
      users: v.users as Record<string, User>,
      posts: v.posts as Record<string, Post>,
      assets: v.assets as Record<string, A>,
      threads: v.threads as Record<string, Thread>,
      threadOrder: v.threadOrder as string[],
      updatedAt: typeof v.updatedAt === "string" ? v.updatedAt : new Date().toISOString(),
    };
  }

  if (version === 1) {
    const thread = requireRecord(v.thread, "thread") as unknown as Thread;
    if (typeof thread.id !== "string") {
      throw new Error("Invalid v1 project: thread.id missing");
    }
    requireRecord(v.users, "users");
    requireRecord(v.posts, "posts");
    requireRecord(v.assets, "assets");
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      projectTitle: thread.title || "Untitled project",
      users: v.users as Record<string, User>,
      posts: v.posts as Record<string, Post>,
      assets: v.assets as Record<string, A>,
      threads: { [thread.id]: thread },
      threadOrder: [thread.id],
      updatedAt: typeof v.updatedAt === "string" ? v.updatedAt : new Date().toISOString(),
    };
  }

  throw new Error(`Unsupported schemaVersion: ${String(version)}`);
}
