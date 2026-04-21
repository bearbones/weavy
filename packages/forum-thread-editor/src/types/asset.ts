export type AssetMimeType =
  | "image/png"
  | "image/jpeg"
  | "image/gif"
  | "image/webp";

export interface Asset {
  id: string;
  filename: string;
  mimeType: AssetMimeType;
  dataUrl: string;
}

export type SerializedAsset = Omit<Asset, "dataUrl">;
