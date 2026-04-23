/**
 * Bulletin V2 types.
 *
 * Backend: app/presentation/schemas/bulletin.py
 *
 * Bulletins are company-specific announcements or general (union-wide) notices.
 */

/**
 * Bulletin record.
 * Backend: bulletin.py :: BulletinV2Response
 */
export interface BulletinV2 {
  /** Bulletin UUID — primary identifier. */
  uuid: string;
  /** Bulletin title. */
  title: string;
  /** Bulletin description/body text. */
  description: string;
  /** Image URL (presigned S3 or relative path). Null if no image attached. */
  image_url: string | null;
  /** Document URL (PDF or other file). Null if no document attached. */
  document_url: string | null;
  /** Company UUID this bulletin belongs to. Null for general bulletins. */
  company_uuid: string | null;
  /** Whether this is a general (union-wide) bulletin vs. company-specific. */
  is_general: boolean;
  /** ISO-8601 datetime when the bulletin was published. */
  published_at: string;
  /** ISO-8601 creation timestamp. */
  created_at: string;
}

/**
 * Request params for GET /api/v2/bulletins.
 */
export interface ListBulletinsV2Request {
  /** Filter by company UUID. Omit to return all bulletins. */
  company_uuid?: string;
}

/**
 * Response from GET /api/v2/bulletins.
 */
export interface ListBulletinsV2Response {
  /** Array of bulletin records. */
  bulletins: BulletinV2[];
  /** Total number of bulletins matching the filter. */
  total: number;
}

/**
 * Body for POST /api/v2/bulletins.
 * Backend: bulletin.py :: BulletinV2CreateBody
 *
 * Scope (`company_uuid` + `is_general`) is set at creation time and is
 * immutable afterwards — there is no way to convert a company-specific
 * bulletin into a general one or vice versa via PATCH.
 */
export interface CreateBulletinV2Body {
  /** Bulletin title. */
  title: string;
  /** Bulletin description/body text. */
  description: string;
  /** Optional image URL (presigned S3 or relative path). */
  image_url?: string | null;
  /** Optional document URL (PDF or other file). */
  document_url?: string | null;
  /** Company UUID for company-specific bulletins. Omit or null for general. */
  company_uuid?: string | null;
  /** True for a general (union-wide) bulletin. */
  is_general?: boolean;
  /** Optional publish timestamp (ISO-8601). Defaults to now() on the server. */
  published_at?: string;
}

/**
 * Body for PATCH /api/v2/bulletins/{uuid}.
 * Backend: bulletin.py :: BulletinV2UpdateBody
 *
 * `company_uuid` and `is_general` are NOT accepted — scope is immutable.
 */
export type UpdateBulletinV2Body = Partial<
  Pick<
    CreateBulletinV2Body,
    "title" | "description" | "image_url" | "document_url" | "published_at"
  >
>;
