export interface Post {
  id: string;
  authorId: string;
  body: string;
  timestamp: string;
  editedAt?: string;
  editedByUserId?: string;
}
