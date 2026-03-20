/**
 * Bulletin V2 types.
 *
 * Backend: app/presentation/schemas/bulletin.py
 */

export interface BulletinV2 {
  uuid: string;
  title: string;
  description: string;
  image_url: string | null;
  document_url: string | null;
  company_uuid: string | null;
  is_general: boolean;
  published_at: string;
  created_at: string;
}

export interface ListBulletinsV2Request {
  company_uuid?: string;
}

export interface ListBulletinsV2Response {
  bulletins: BulletinV2[];
  total: number;
}
