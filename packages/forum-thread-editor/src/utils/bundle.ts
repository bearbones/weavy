import JSZip from "jszip";
import type {
  Asset,
  AssetMimeType,
  ForumProject,
  SerializedAsset,
  SerializedForumProject,
} from "@/types";
import { CURRENT_SCHEMA_VERSION } from "@/types";
import { migrateProject } from "./migrate";

const PROJECT_JSON_PATH = "project.json";
const ASSETS_DIR = "assets";

function isAssetMime(s: string): s is AssetMimeType {
  return (
    s === "image/png" ||
    s === "image/jpeg" ||
    s === "image/gif" ||
    s === "image/webp"
  );
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) throw new Error("Invalid data URL");
  const b64 = dataUrl.slice(comma + 1);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error ?? new Error("FileReader failed"));
    r.onload = () => resolve(r.result as string);
    r.readAsDataURL(blob);
  });
}

export async function packProject(project: ForumProject): Promise<Blob> {
  const zip = new JSZip();

  const serialized: SerializedForumProject = {
    ...project,
    assets: {},
  };

  for (const asset of Object.values(project.assets)) {
    const bytes = dataUrlToUint8Array(asset.dataUrl);
    zip.file(`${ASSETS_DIR}/${asset.filename}`, bytes);
    const stripped: SerializedAsset = {
      id: asset.id,
      filename: asset.filename,
      mimeType: asset.mimeType,
    };
    serialized.assets[asset.id] = stripped;
  }

  zip.file(PROJECT_JSON_PATH, JSON.stringify(serialized, null, 2));
  return zip.generateAsync({ type: "blob" });
}

export async function unpackProject(file: File): Promise<ForumProject> {
  const zip = await JSZip.loadAsync(file);
  const jsonEntry = zip.file(PROJECT_JSON_PATH);
  if (!jsonEntry) throw new Error(`Bundle missing ${PROJECT_JSON_PATH}`);

  const raw = await jsonEntry.async("string");
  const parsed = JSON.parse(raw) as unknown;
  const serialized = migrateProject<SerializedAsset>(parsed);

  const hydratedAssets: Record<string, Asset> = {};
  for (const asset of Object.values(serialized.assets)) {
    if (!isAssetMime(asset.mimeType)) {
      throw new Error(`Unsupported mimeType: ${asset.mimeType}`);
    }
    const fileEntry = zip.file(`${ASSETS_DIR}/${asset.filename}`);
    if (!fileEntry) {
      throw new Error(`Bundle missing asset file: ${asset.filename}`);
    }
    const blob = await fileEntry.async("blob");
    const typedBlob = new Blob([blob], { type: asset.mimeType });
    const dataUrl = await blobToDataUrl(typedBlob);
    hydratedAssets[asset.id] = {
      id: asset.id,
      filename: asset.filename,
      mimeType: asset.mimeType,
      dataUrl,
    };
  }

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    projectTitle: serialized.projectTitle,
    users: serialized.users,
    posts: serialized.posts,
    assets: hydratedAssets,
    threads: serialized.threads,
    threadOrder: serialized.threadOrder,
    updatedAt: serialized.updatedAt,
  };
}
