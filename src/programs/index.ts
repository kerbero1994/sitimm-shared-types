/**
 * Program V2 types.
 *
 * Backend: app/presentation/schemas/programs_v2.py
 *
 * Programs are simple content cards with nested SubPrograms — used by the
 * SITIMM marketing site and member dashboard. The V2 surface is a clean
 * port of the legacy Node.js endpoints with two upgrades:
 *
 * 1. Routing by `uuid` instead of integer `id`.
 * 2. Soft-delete for SubProgram (parity with Program).
 *
 * No audience targeting, fan-out, or notifications — programs are static
 * content the union edits centrally.
 */

/**
 * SubProgram record — child node of a Program.
 * Backend: programs_v2.py :: SubProgramV2Response
 */
export interface SubProgramV2 {
  /** SubProgram UUID — primary identifier. */
  uuid: string;
  /** Title text. Null in legacy rows that predate the field. */
  title: string | null;
  /** Image URL (relative or absolute). */
  img: string | null;
  /** Free-form JSONB content blob (rich text body, blocks, etc.). */
  content: unknown | null;
  /** URL slug (server auto-derives `/<title-with-dashes>` when omitted). */
  url: string | null;
  /** Parent Program UUID. Null only on detached/legacy rows. */
  program_uuid: string | null;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last-update timestamp. */
  updatedAt: string;
  /** ISO-8601 soft-delete timestamp. Null when active. */
  deletedAt: string | null;
}

/**
 * Program record with embedded active SubPrograms.
 * Backend: programs_v2.py :: ProgramV2Response
 */
export interface ProgramV2 {
  /** Program UUID — primary identifier. */
  uuid: string;
  /** Title text. */
  title: string | null;
  /** Long-form description (max 100k chars). */
  description: string | null;
  /** Hero image URL. */
  img: string | null;
  /** Free-form JSONB content blob. */
  content: unknown | null;
  /** URL slug (server auto-derives `/<title-with-dashes>` when omitted). */
  url: string | null;
  /** Active SubPrograms (deletedAt IS NULL). */
  sub_programs: SubProgramV2[];
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last-update timestamp. */
  updatedAt: string;
  /** ISO-8601 soft-delete timestamp. Null when active. */
  deletedAt: string | null;
}

/**
 * Trimmed Program payload returned by the public endpoint.
 * Backend: programs_v2.py :: ProgramV2PublicResponse
 *
 * Internal timestamps are stripped so the marketing site never displays
 * createdAt/updatedAt/deletedAt by accident.
 */
export interface ProgramV2Public {
  uuid: string;
  title: string | null;
  description: string | null;
  img: string | null;
  content: unknown | null;
  url: string | null;
  sub_programs: SubProgramV2[];
}

/**
 * Body for POST /api/v2/programs/{program_uuid}/subprograms or inside a
 * `CreateProgramV2Body.sub_programs` array.
 * Backend: programs_v2.py :: SubProgramV2Create
 */
export interface CreateSubProgramV2Body {
  /** Required title (1-500 chars). */
  title: string;
  /** Optional image URL. */
  img?: string | null;
  /** Optional free-form JSONB content. */
  content?: unknown | null;
  /** Optional URL slug. */
  url?: string | null;
}

/**
 * Body for POST /api/v2/programs.
 * Backend: programs_v2.py :: ProgramV2Create
 */
export interface CreateProgramV2Body {
  /** Required title (1-500 chars). */
  title: string;
  /** Optional description (max 100k chars). */
  description?: string | null;
  /** Optional image URL. */
  img?: string | null;
  /** Optional free-form JSONB content. */
  content?: unknown | null;
  /** Optional URL slug — server derives one from `title` if omitted. */
  url?: string | null;
  /** Optional inline subprograms; each is created in the same transaction. */
  sub_programs?: CreateSubProgramV2Body[];
}

/**
 * Body for PATCH /api/v2/programs/{program_uuid}.
 * Backend: programs_v2.py :: ProgramV2Update
 *
 * Partial update — every field is optional. SubPrograms are managed via
 * their own endpoints (see CreateSubProgramV2Body / UpdateSubProgramV2Body).
 */
export type UpdateProgramV2Body = Partial<
  Pick<CreateProgramV2Body, "title" | "description" | "img" | "content" | "url">
>;

/**
 * Body for PATCH /api/v2/subprograms/{sub_uuid}.
 * Backend: programs_v2.py :: SubProgramV2Update
 */
export type UpdateSubProgramV2Body = Partial<CreateSubProgramV2Body>;

/**
 * Response from GET /api/v2/programs.
 * Backend: programs_v2.py :: ProgramV2ListResponse
 */
export interface ListProgramsV2Response {
  programs: ProgramV2[];
  total: number;
}

/**
 * Response from GET /api/v2/programs/public.
 * Backend: programs_v2.py :: ProgramV2PublicListResponse
 */
export interface ListProgramsV2PublicResponse {
  programs: ProgramV2Public[];
  total: number;
}
