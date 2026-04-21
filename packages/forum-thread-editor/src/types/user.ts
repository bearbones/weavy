export interface User {
  id: string;
  name: string;
  avatarAssetId: string | null;
  tagline?: string;
  signature?: string;
  rank?: string;
  joinDate?: string;
  postCount?: number;
}
