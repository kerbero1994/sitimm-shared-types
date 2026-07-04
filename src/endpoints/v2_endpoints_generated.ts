/* AUTO-GENERATED — do not edit by hand.
 * Source: mini-back ``scripts/dump_v2_routes.py``
 * Regenerate via:
 *   cd <mini-back> && make dump-v2-routes
 *   cd <sitimm-shared-types> && ./scripts/import-v2-endpoints.sh
 *
 * Source version : 4ad29b67
 * Generated at   : 2026-06-04T19:03:59.523102+00:00
 * Route count    : 421 (421 method-rows across 27 feature groups)
 *
 * Path params (e.g. {uuid}, {id}, {slug}) are emitted as
 * arrow-function builders: ``(uuid: string) => string``.
 *
 * MANUAL PATCH (SITIMM-41, 2026-07-01): 7 rows hand-added to the
 * `galleries` / `galleryItems` groups ahead of the next full regen —
 * the SITIMM-40 public (`/galleries/public*`) + admin translation
 * (`.../translations[/{lang}]`) routes did not exist on mini-back at the
 * `4ad29b67` source version above. Safe to overwrite on the next
 * `make dump-v2-routes` once that backend branch ships.
 *
 * MANUAL PATCH (SITIMM-46, 2026-07-02): 8 more rows hand-added to the
 * `galleries` / `galleryItems` groups for the Phase B member-contribution
 * + moderation surface (`app/presentation/api/v2/galleries_contribute.py`,
 * shipped on mini-back branch `SITIMM-45-member-contribute`, not yet
 * merged to `main` at this source version). Safe to overwrite on the next
 * `make dump-v2-routes` once that backend branch ships.
 */

export const V2_ENDPOINTS_GENERATED = {
  admin: {
    /** GET — Admin Users V2 */
    LIST_USERS: "/api/v2/admin/users",
    /** POST — Admin Users V2 */
    CREATE_USER: "/api/v2/admin/users",
    /** DELETE — Admin Users V2 */
    DELETE_USER: (uuid: string | number) => `/api/v2/admin/users/${uuid}`,
    /** GET — Admin Users V2 */
    GET_USER: (uuid: string | number) => `/api/v2/admin/users/${uuid}`,
    /** PATCH — Admin Users V2 */
    UPDATE_USER: (uuid: string | number) => `/api/v2/admin/users/${uuid}`,
    /** POST — Admin Users V2 */
    SEND_INVITE: (uuid: string | number) => `/api/v2/admin/users/${uuid}/invite`,
  },
  advisorAssignments: {
    /** POST — V2 Advisor Assignments */
    ASSIGN_COMPANIES: "/api/v2/advisor-assignments/assign",
    /** GET — V2 Advisor Assignments */
    BY_ADVISOR: (advisor_uuid: string | number) => `/api/v2/advisor-assignments/by-advisor/${advisor_uuid}`,
    /** GET — V2 Advisor Assignments */
    LIST_ADVISORS_BY_COMPANY_UUID: (company_uuid: string | number) => `/api/v2/advisor-assignments/by-company-uuid/${company_uuid}`,
    /** GET — V2 Advisor Assignments */
    BY_COMPANY: (company_uuid: string | number) => `/api/v2/advisor-assignments/by-company/${company_uuid}`,
    /** GET — V2 Advisor Assignments */
    LIST_ADVISOR_CATALOG: "/api/v2/advisor-assignments/catalog",
    /** GET — V2 Advisor Assignments */
    GET_ADVISOR_BY_UUID: (advisor_uuid: string | number) => `/api/v2/advisor-assignments/catalog/${advisor_uuid}`,
    /** GET — V2 Advisor Assignments */
    MY_COMPANIES: "/api/v2/advisor-assignments/my-companies",
    /** POST — V2 Advisor Assignments */
    UNASSIGN_COMPANY: "/api/v2/advisor-assignments/unassign",
  },
  audienceTemplates: {
    /** GET — V2 Audience Templates */
    LIST_AUDIENCE_TEMPLATES: "/api/v2/audience-templates",
    /** POST — V2 Audience Templates */
    CREATE_AUDIENCE_TEMPLATE: "/api/v2/audience-templates",
    /** DELETE — V2 Audience Templates */
    DELETE_AUDIENCE_TEMPLATE: (uuid: string | number) => `/api/v2/audience-templates/${uuid}`,
    /** GET — V2 Audience Templates */
    GET_AUDIENCE_TEMPLATE: (uuid: string | number) => `/api/v2/audience-templates/${uuid}`,
    /** PATCH — V2 Audience Templates */
    UPDATE_AUDIENCE_TEMPLATE: (uuid: string | number) => `/api/v2/audience-templates/${uuid}`,
  },
  auth: {
    /** POST — Auth V2 */
    FORGOT_PASSWORD_V2: "/api/v2/auth/forgot-password",
    /** POST — Auth V2 */
    RESET_PASSWORD_V2: "/api/v2/auth/reset-password",
    /** POST — Auth V2 */
    VERIFY_RESET_V2: "/api/v2/auth/verify-reset",
  },
  blog: {
    /** POST — Blogs Admin, Blogs Admin */
    CREATE_CATEGORY: "/api/v2/blog/admin/categories",
    /** DELETE — Blogs Admin, Blogs Admin */
    DELETE_CATEGORY: (category_id: string | number) => `/api/v2/blog/admin/categories/${category_id}`,
    /** PATCH — Blogs Admin, Blogs Admin */
    UPDATE_CATEGORY: (category_id: string | number) => `/api/v2/blog/admin/categories/${category_id}`,
    /** GET — Blogs Admin, Blogs Admin */
    LIST_ADMIN_POSTS: "/api/v2/blog/admin/posts",
    /** POST — Blogs Admin, Blogs Admin */
    CREATE_POST: "/api/v2/blog/admin/posts",
    /** DELETE — Blogs Admin, Blogs Admin */
    DELETE_POST: (post_uuid: string | number) => `/api/v2/blog/admin/posts/${post_uuid}`,
    /** GET — Blogs Admin, Blogs Admin */
    GET_ADMIN_POST: (post_uuid: string | number) => `/api/v2/blog/admin/posts/${post_uuid}`,
    /** PATCH — Blogs Admin, Blogs Admin */
    UPDATE_POST: (post_uuid: string | number) => `/api/v2/blog/admin/posts/${post_uuid}`,
    /** GET — Blogs Admin, Blogs Admin */
    POST_ANALYTICS: (post_uuid: string | number) => `/api/v2/blog/admin/posts/${post_uuid}/analytics`,
    /** POST — Blogs Admin, Blogs Admin */
    ARCHIVE_POST: (post_uuid: string | number) => `/api/v2/blog/admin/posts/${post_uuid}/archive`,
    /** GET — Blogs Admin, Blogs Admin */
    GET_POST_AUDIT_TRAIL: (post_uuid: string | number) => `/api/v2/blog/admin/posts/${post_uuid}/audit-trail`,
    /** POST — Blogs Admin, Blogs Admin */
    RETRIGGER_TRANSLATION: (post_uuid: string | number, locale: string | number) => `/api/v2/blog/admin/posts/${post_uuid}/translate/${locale}`,
    /** PATCH — Blogs Admin, Blogs Admin */
    UPDATE_TRANSLATION: (post_uuid: string | number, locale: string | number) => `/api/v2/blog/admin/posts/${post_uuid}/translations/${locale}`,
    /** POST — Blogs Admin, Blogs Admin */
    UNARCHIVE_POST: (post_uuid: string | number) => `/api/v2/blog/admin/posts/${post_uuid}/unarchive`,
    /** POST — Blogs Admin, Blogs Admin */
    BULK_POST_ACTION: "/api/v2/blog/admin/posts/bulk",
    /** POST — Blogs Admin, Blogs Admin */
    IMPORT_POSTS: "/api/v2/blog/admin/posts/import",
    /** GET — Blogs Admin, Blogs Admin */
    SEARCH_GAPS: "/api/v2/blog/admin/search-gaps",
    /** POST — Blogs Admin, Blogs Admin */
    CREATE_TAG: "/api/v2/blog/admin/tags",
    /** DELETE — Blogs Admin, Blogs Admin */
    DELETE_TAG: (tag_id: string | number) => `/api/v2/blog/admin/tags/${tag_id}`,
    /** PATCH — Blogs Admin, Blogs Admin */
    UPDATE_TAG: (tag_id: string | number) => `/api/v2/blog/admin/tags/${tag_id}`,
    /** GET — V2 Blogs, V2 Blogs */
    LIST_CATEGORIES: "/api/v2/blog/categories",
    /** GET — V2 Blogs, V2 Blogs */
    LIST_POSTS: "/api/v2/blog/posts",
    /** GET — V2 Blogs, V2 Blogs */
    GET_POST_RELATED: (post_uuid: string | number) => `/api/v2/blog/posts/${post_uuid}/related`,
    /** GET — V2 Blogs, V2 Blogs */
    GET_POST_BY_SLUG: (slug: string | number) => `/api/v2/blog/posts/${slug}`,
    /** POST — Engagement — blog_post */
    ADMIN_PAUSE_COMMENTS: (subject_uuid: string | number) => `/api/v2/blog/posts/${subject_uuid}/admin/comments/pause`,
    /** POST — Engagement — blog_post */
    ADMIN_RESUME_COMMENTS: (subject_uuid: string | number) => `/api/v2/blog/posts/${subject_uuid}/admin/comments/resume`,
    /** POST — Engagement — blog_post */
    ADMIN_PAUSE_REACTIONS: (subject_uuid: string | number) => `/api/v2/blog/posts/${subject_uuid}/admin/reactions/pause`,
    /** POST — Engagement — blog_post */
    ADMIN_RESUME_REACTIONS: (subject_uuid: string | number) => `/api/v2/blog/posts/${subject_uuid}/admin/reactions/resume`,
    /** GET — Engagement — blog_post */
    ADMIN_GET_SETTINGS: (subject_uuid: string | number) => `/api/v2/blog/posts/${subject_uuid}/admin/settings`,
    /** PATCH — Engagement — blog_post */
    ADMIN_PATCH_SETTINGS: (subject_uuid: string | number) => `/api/v2/blog/posts/${subject_uuid}/admin/settings`,
    /** GET — Engagement — blog_post */
    ADMIN_LIST_SUSPENSION_LOG: (subject_uuid: string | number) => `/api/v2/blog/posts/${subject_uuid}/admin/suspension-log`,
    /** DELETE — Engagement — blog_post */
    REMOVE_BOOKMARK: (subject_uuid: string | number) => `/api/v2/blog/posts/${subject_uuid}/bookmark`,
    /** POST — Engagement — blog_post */
    ADD_BOOKMARK: (subject_uuid: string | number) => `/api/v2/blog/posts/${subject_uuid}/bookmark`,
    /** GET — Engagement — blog_post */
    LIST_COMMENTS: (subject_uuid: string | number) => `/api/v2/blog/posts/${subject_uuid}/comments`,
    /** POST — Engagement — blog_post */
    CREATE_COMMENT: (subject_uuid: string | number) => `/api/v2/blog/posts/${subject_uuid}/comments`,
    /** POST — Engagement — blog_post */
    TOGGLE_REACTION: (subject_uuid: string | number) => `/api/v2/blog/posts/${subject_uuid}/reactions`,
    /** POST — Engagement — blog_post */
    RECORD_SHARE: (subject_uuid: string | number) => `/api/v2/blog/posts/${subject_uuid}/share`,
    /** POST — Engagement — blog_post */
    RECORD_VIEW: (subject_uuid: string | number) => `/api/v2/blog/posts/${subject_uuid}/view`,
    /** DELETE — Engagement — blog_post */
    DELETE_OWN_COMMENT: (comment_uuid: string | number) => `/api/v2/blog/posts/comments/${comment_uuid}`,
    /** GET — V2 Blogs, V2 Blogs */
    SEARCH_POSTS: "/api/v2/blog/search",
    /** GET — V2 Blogs, V2 Blogs */
    SEARCH_SUGGEST: "/api/v2/blog/search/suggest",
    /** GET — V2 Blogs, V2 Blogs */
    LIST_TAGS: "/api/v2/blog/tags",
  },
  bonuses: {
    /** GET — Bonuses V2 */
    LIST_BONUSES: "/api/v2/bonuses",
    /** POST — Bonuses V2 */
    CREATE_BONUS: "/api/v2/bonuses",
    /** DELETE — Bonuses V2 */
    DELETE_BONUS: (uuid: string | number) => `/api/v2/bonuses/${uuid}`,
    /** GET — Bonuses V2 */
    GET_BONUS: (uuid: string | number) => `/api/v2/bonuses/${uuid}`,
    /** PATCH — Bonuses V2 */
    UPDATE_BONUS: (uuid: string | number) => `/api/v2/bonuses/${uuid}`,
    /** POST — Bonuses V2 */
    UPLOAD_BONUS_MEDIA: (uuid: string | number) => `/api/v2/bonuses/${uuid}/media`,
    /** DELETE — Bonuses V2 */
    DELETE_BONUS_MEDIA: (uuid: string | number, media_uuid: string | number) => `/api/v2/bonuses/${uuid}/media/${media_uuid}`,
    /** DELETE — Bonuses V2 */
    DELETE_BONUS_TRANSLATION: (uuid: string | number, locale: string | number) => `/api/v2/bonuses/${uuid}/translations/${locale}`,
    /** PUT — Bonuses V2 */
    UPSERT_BONUS_TRANSLATION: (uuid: string | number, locale: string | number) => `/api/v2/bonuses/${uuid}/translations/${locale}`,
    /** GET — Bonuses V2 */
    LIST_AMENITIES: "/api/v2/bonuses/amenities",
    /** POST — Bonuses V2 */
    CREATE_AMENITY: "/api/v2/bonuses/amenities",
    /** DELETE — Bonuses V2 */
    DELETE_AMENITY: (amenity_id: string | number) => `/api/v2/bonuses/amenities/${amenity_id}`,
    /** PATCH — Bonuses V2 */
    UPDATE_AMENITY: (amenity_id: string | number) => `/api/v2/bonuses/amenities/${amenity_id}`,
    /** GET — Bonuses V2 */
    LIST_CATEGORIES: "/api/v2/bonuses/categories",
    /** POST — Bonuses V2 */
    CREATE_CATEGORY: "/api/v2/bonuses/categories",
    /** DELETE — Bonuses V2 */
    DELETE_CATEGORY: (category_id: string | number) => `/api/v2/bonuses/categories/${category_id}`,
    /** PATCH — Bonuses V2 */
    UPDATE_CATEGORY: (category_id: string | number) => `/api/v2/bonuses/categories/${category_id}`,
    /** GET — Bonuses V2 */
    GET_CATEGORY_BY_SLUG: (slug: string | number) => `/api/v2/bonuses/categories/${slug}`,
    /** GET — Bonuses V2 */
    LIST_PAYMENT_METHODS: "/api/v2/bonuses/payment-methods",
    /** POST — Bonuses V2 */
    CREATE_PAYMENT_METHOD: "/api/v2/bonuses/payment-methods",
    /** DELETE — Bonuses V2 */
    DELETE_PAYMENT_METHOD: (pm_id: string | number) => `/api/v2/bonuses/payment-methods/${pm_id}`,
    /** PATCH — Bonuses V2 */
    UPDATE_PAYMENT_METHOD: (pm_id: string | number) => `/api/v2/bonuses/payment-methods/${pm_id}`,
    /** POST — Bonuses V2 */
    CREATE_SUBCATEGORY: "/api/v2/bonuses/subcategories",
    /** DELETE — Bonuses V2 */
    DELETE_SUBCATEGORY: (subcategory_id: string | number) => `/api/v2/bonuses/subcategories/${subcategory_id}`,
    /** PATCH — Bonuses V2 */
    UPDATE_SUBCATEGORY: (subcategory_id: string | number) => `/api/v2/bonuses/subcategories/${subcategory_id}`,
  },
  bulletins: {
    /** GET — V2 Bulletins */
    LIST_BULLETINS: "/api/v2/bulletins",
    /** POST — V2 Bulletins */
    CREATE_BULLETIN: "/api/v2/bulletins",
    /** DELETE — V2 Bulletins */
    DELETE_BULLETIN: (uuid: string | number) => `/api/v2/bulletins/${uuid}`,
    /** GET — V2 Bulletins */
    GET_BULLETIN: (uuid: string | number) => `/api/v2/bulletins/${uuid}`,
    /** PATCH — V2 Bulletins */
    UPDATE_BULLETIN: (uuid: string | number) => `/api/v2/bulletins/${uuid}`,
    /** POST — V2 Bulletins */
    DISMISS_BULLETIN: (uuid: string | number) => `/api/v2/bulletins/${uuid}/dismiss`,
    /** POST — V2 Bulletins */
    PIN_BULLETIN: (uuid: string | number) => `/api/v2/bulletins/${uuid}/pin`,
    /** POST — V2 Bulletins */
    MARK_BULLETIN_READ: (uuid: string | number) => `/api/v2/bulletins/${uuid}/read`,
    /** GET — V2 Bulletins */
    LIST_RECIPIENTS: (uuid: string | number) => `/api/v2/bulletins/${uuid}/recipients`,
    /** GET — V2 Bulletins */
    LIST_FEED: "/api/v2/bulletins/feed",
    /** POST — V2 Bulletins */
    PREVIEW_AUDIENCE: "/api/v2/bulletins/preview-audience",
    /** GET — V2 Bulletins */
    LIST_BULLETINS_PUBLIC: "/api/v2/bulletins/public",
  },
  campuses: {
    /** GET — V2 Campuses */
    LIST_CAMPUSES: "/api/v2/campuses",
    /** POST — V2 Campuses */
    CREATE_CAMPUS: "/api/v2/campuses",
    /** DELETE — V2 Campuses */
    DELETE_CAMPUS: (uuid: string | number) => `/api/v2/campuses/${uuid}`,
    /** GET — V2 Campuses */
    GET_CAMPUS: (uuid: string | number) => `/api/v2/campuses/${uuid}`,
    /** PATCH — V2 Campuses */
    UPDATE_CAMPUS: (uuid: string | number) => `/api/v2/campuses/${uuid}`,
  },
  censuses: {
    /** GET — V2 Censuses */
    GET_CENSUS_MAP: (census_uuid: string | number) => `/api/v2/censuses/${census_uuid}/map`,
    /** GET — V2 Censuses */
    GET_CENSUS_MUNICIPALITIES: (census_uuid: string | number) => `/api/v2/censuses/${census_uuid}/municipalities`,
    /** GET — V2 Censuses */
    GET_CENSUS_STATISTICS: (census_uuid: string | number) => `/api/v2/censuses/${census_uuid}/statistics`,
  },
  companies: {
    /** GET — V2 Company Documents */
    LIST_COMPANY_DOCUMENTS: (company_id: string | number) => `/api/v2/companies/${company_id}/documents`,
    /** POST — V2 Company Documents */
    UPLOAD_COMPANY_DOCUMENT: (company_id: string | number) => `/api/v2/companies/${company_id}/documents`,
    /** DELETE — V2 Company Documents */
    DELETE_COMPANY_DOCUMENT: (company_id: string | number, doc_uuid: string | number) => `/api/v2/companies/${company_id}/documents/${doc_uuid}`,
    /** GET — V2 Company Documents */
    GET_COMPANY_DOCUMENT: (company_id: string | number, doc_uuid: string | number) => `/api/v2/companies/${company_id}/documents/${doc_uuid}`,
    /** GET — V2 Union Representatives */
    LIST_UNION_REPRESENTATIVES: (company_id: string | number) => `/api/v2/companies/${company_id}/union-representatives`,
    /** POST — V2 Union Representatives */
    CREATE_UNION_REPRESENTATIVE: (company_id: string | number) => `/api/v2/companies/${company_id}/union-representatives`,
    /** DELETE — V2 Union Representatives */
    DELETE_UNION_REPRESENTATIVE: (company_id: string | number, rep_uuid: string | number) => `/api/v2/companies/${company_id}/union-representatives/${rep_uuid}`,
    /** PATCH — V2 Union Representatives */
    UPDATE_UNION_REPRESENTATIVE: (company_id: string | number, rep_uuid: string | number) => `/api/v2/companies/${company_id}/union-representatives/${rep_uuid}`,
    /** GET — V2 Union Representatives */
    LIST_UNION_ROLES: (company_id: string | number) => `/api/v2/companies/${company_id}/union-representatives/roles`,
  },
  consultations: {
    /** POST — Consultations [list_consultations] */
    LIST_CONSULTATIONS_V2: "/api/v2/consultations",
    /** DELETE — Consultations [delete_consultation] */
    DELETE_CONSULTATION_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}`,
    /** GET — Consultations [get_consultation] */
    GET_CONSULTATION_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}`,
    /** PATCH — Consultations [update_consultation] */
    UPDATE_CONSULTATION_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}`,
    /** POST — Consultation Admin [add_co_advisor] */
    ADD_CO_ADVISOR_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/add-advisor`,
    /** DELETE — Consultations [unarchive_consultation] */
    UNARCHIVE_CONSULTATION_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/archive`,
    /** POST — Consultations [archive_consultation] */
    ARCHIVE_CONSULTATION_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/archive`,
    /** POST — Consultation Admin [assign_consultation] */
    ASSIGN_CONSULTATION_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/assign`,
    /** POST — Consultation Close [confirm_close] */
    CONFIRM_CLOSE_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/confirm-close`,
    /** POST — Consultation Admin [de_escalate_consultation] */
    DE_ESCALATE_CONSULTATION_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/de-escalate`,
    /** POST — Consultation Admin [escalate_consultation] */
    ESCALATE_CONSULTATION_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/escalate`,
    /** GET — Consultation Messages [list_messages] */
    LIST_MESSAGES_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/messages`,
    /** POST — Consultation Messages [send_message] */
    SEND_MESSAGE_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/messages`,
    /** PATCH — Consultation Messages [mark_messages_read] */
    MARK_MESSAGES_READ_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/messages/read`,
    /** POST — Consultation Messages [send_message_with_attachments] */
    SEND_MESSAGE_WITH_ATTACHMENTS_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/messages/with-attachments`,
    /** POST — Consultation Close [propose_close] */
    PROPOSE_CLOSE_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/propose-close`,
    /** POST — Consultation Close [rate_consultation] */
    RATE_CONSULTATION_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/rate`,
    /** POST — Consultation Close [reject_close] */
    REJECT_CLOSE_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/reject-close`,
    /** POST — Consultation Admin [remove_co_advisor] */
    REMOVE_CO_ADVISOR_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/remove-advisor`,
    /** POST — Consultation Reports [create_report] */
    CREATE_REPORT_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/report`,
    /** POST — Consultation Messages [take_consultation] */
    TAKE_CONSULTATION_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/take`,
    /** POST — Consultation Admin [transfer_consultation] */
    TRANSFER_CONSULTATION_V2: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/transfer`,
    /** GET — Consultation Transitions [list_transitions] */
    LIST_TRANSITIONS: (consultation_uuid: string | number) => `/api/v2/consultations/${consultation_uuid}/transitions`,
    /** POST — Consultations [create_consultation] */
    CREATE_CONSULTATION_V2: "/api/v2/consultations/create",
    /** GET — Consultation Stats [get_my_stats] */
    ADVISOR_MY_STATS_V2: "/api/v2/consultations/my-stats",
    /** GET — Consultation Reports [list_reports] */
    LIST_REPORTS_V2: "/api/v2/consultations/reports",
    /** DELETE — Consultation Reports [delete_report] */
    DELETE_REPORT_V2: (report_uuid: string | number) => `/api/v2/consultations/reports/${report_uuid}`,
    /** PATCH — Consultation Reports [resolve_report] */
    RESOLVE_REPORT_V2: (report_uuid: string | number) => `/api/v2/consultations/reports/${report_uuid}`,
    /** GET — Consultation States */
    LIST_STATES: "/api/v2/consultations/states",
    /** POST — Consultation States */
    CREATE_STATE: "/api/v2/consultations/states",
    /** DELETE — Consultation States */
    DELETE_STATE: (state_id: string | number) => `/api/v2/consultations/states/${state_id}`,
    /** GET — Consultation States */
    GET_STATE: (state_id: string | number) => `/api/v2/consultations/states/${state_id}`,
    /** PATCH — Consultation States */
    UPDATE_STATE: (state_id: string | number) => `/api/v2/consultations/states/${state_id}`,
    /** POST — Consultation Stats [get_admin_stats] */
    CONSULTATION_STATS_V2: "/api/v2/consultations/stats",
    /** GET — Consultation Templates [list_templates] */
    LIST_TEMPLATES_V2: "/api/v2/consultations/templates",
    /** POST — Consultation Templates [create_template] */
    CREATE_TEMPLATE_V2: "/api/v2/consultations/templates",
    /** DELETE — Consultation Templates [delete_template] */
    DELETE_TEMPLATE_V2: (template_uuid: string | number) => `/api/v2/consultations/templates/${template_uuid}`,
    /** PATCH — Consultation Templates [update_template] */
    UPDATE_TEMPLATE_V2: (template_uuid: string | number) => `/api/v2/consultations/templates/${template_uuid}`,
    /** POST — Consultation Templates [increment_template_usage] */
    USE_TEMPLATE_V2: (template_uuid: string | number) => `/api/v2/consultations/templates/${template_uuid}/use`,
    /** GET — Consultation Types */
    LIST_TYPES: "/api/v2/consultations/types",
    /** GET — Consultations [list_consultation_types] */
    LIST_CONSULTATION_TYPES_V2: "/api/v2/consultations/types",
    /** POST — Consultation Types */
    CREATE_TYPE: "/api/v2/consultations/types",
    /** DELETE — Consultation Types */
    DELETE_TYPE: (type_id: string | number) => `/api/v2/consultations/types/${type_id}`,
    /** GET — Consultation Types */
    GET_TYPE: (type_id: string | number) => `/api/v2/consultations/types/${type_id}`,
    /** PATCH — Consultation Types */
    UPDATE_TYPE: (type_id: string | number) => `/api/v2/consultations/types/${type_id}`,
  },
  engagement: {
    /** GET — Engagement Admin */
    GET_ENGAGEMENT_ANALYTICS: "/api/v2/engagement/admin/analytics",
    /** GET — Engagement Admin */
    LIST_MODERATION_COMMENTS: "/api/v2/engagement/admin/comments",
    /** DELETE — Engagement Admin */
    MODERATE_DELETE_COMMENT: (comment_uuid: string | number) => `/api/v2/engagement/admin/comments/${comment_uuid}`,
    /** GET — Engagement Admin */
    LIST_DLQ: (queue: string | number) => `/api/v2/engagement/admin/dlq/${queue}`,
    /** POST — Engagement Admin */
    REPLAY_DLQ: (queue: string | number) => `/api/v2/engagement/admin/dlq/${queue}/replay`,
    /** GET — Engagement Admin */
    GET_POLICY: (subject_type: string | number) => `/api/v2/engagement/admin/policy/${subject_type}`,
    /** PATCH — Engagement Admin */
    PATCH_POLICY: (subject_type: string | number) => `/api/v2/engagement/admin/policy/${subject_type}`,
    /** GET — Engagement Admin */
    LIST_PROFANITY_TERMS: "/api/v2/engagement/admin/profanity-terms",
    /** POST — Engagement Admin */
    CREATE_PROFANITY_TERM: "/api/v2/engagement/admin/profanity-terms",
    /** DELETE — Engagement Admin */
    DELETE_PROFANITY_TERM: (term_id: string | number) => `/api/v2/engagement/admin/profanity-terms/${term_id}`,
    /** GET — Engagement Admin */
    LIST_REGISTERED_SUBJECTS: "/api/v2/engagement/admin/registered-subjects",
    /** GET — Engagement Admin */
    EXPORT_SUBJECTS_CSV: "/api/v2/engagement/admin/subjects/export.csv",
    /** GET — Engagement Admin */
    LIST_WEBHOOKS: "/api/v2/engagement/admin/webhooks",
    /** POST — Engagement Admin */
    CREATE_WEBHOOK: "/api/v2/engagement/admin/webhooks",
    /** DELETE — Engagement Admin */
    DELETE_WEBHOOK: (webhook_uuid: string | number) => `/api/v2/engagement/admin/webhooks/${webhook_uuid}`,
    /** GET — Engagement Admin */
    GET_WEBHOOK: (webhook_uuid: string | number) => `/api/v2/engagement/admin/webhooks/${webhook_uuid}`,
    /** PATCH — Engagement Admin */
    PATCH_WEBHOOK: (webhook_uuid: string | number) => `/api/v2/engagement/admin/webhooks/${webhook_uuid}`,
    /** GET — Engagement Admin */
    LIST_WEBHOOK_DELIVERIES: (webhook_uuid: string | number) => `/api/v2/engagement/admin/webhooks/${webhook_uuid}/deliveries`,
    /** POST — Engagement Admin */
    TEST_WEBHOOK: (webhook_uuid: string | number) => `/api/v2/engagement/admin/webhooks/${webhook_uuid}/test`,
  },
  eventParticipants: {
    /** DELETE — V2 Event Transport */
    RELEASE_PARTICIPANT_TRANSPORT: (participant_uuid: string | number) => `/api/v2/event-participants/${participant_uuid}/transport`,
    /** PATCH — V2 Event Transport */
    CHANGE_PARTICIPANT_TRANSPORT: (participant_uuid: string | number) => `/api/v2/event-participants/${participant_uuid}/transport`,
    /** DELETE — V2 Event Participants */
    CANCEL_REGISTRATION: (uuid: string | number) => `/api/v2/event-participants/${uuid}`,
    /** GET — V2 Event Participants */
    GET_REGISTRATION: (uuid: string | number) => `/api/v2/event-participants/${uuid}`,
    /** PATCH — V2 Event Participants */
    UPDATE_REGISTRATION: (uuid: string | number) => `/api/v2/event-participants/${uuid}`,
    /** POST — V2 Event Participants */
    CONFIRM_ATTENDANCE: (uuid: string | number) => `/api/v2/event-participants/${uuid}/confirm`,
    /** PATCH — V2 Event Participants */
    SET_PARTICIPANT_NOTES: (uuid: string | number) => `/api/v2/event-participants/${uuid}/notes`,
    /** GET — V2 Event Participants */
    GET_USER_EVENT_HISTORY: (user_id: string | number) => `/api/v2/event-participants/history/${user_id}`,
  },
  eventTypes: {
    /** GET — V2 Event Types */
    LIST_EVENT_TYPES: "/api/v2/event-types",
    /** POST — V2 Event Types */
    CREATE_EVENT_TYPE: "/api/v2/event-types",
    /** DELETE — V2 Event Types */
    DELETE_EVENT_TYPE: (type_id: string | number) => `/api/v2/event-types/${type_id}`,
    /** PATCH — V2 Event Types */
    UPDATE_EVENT_TYPE: (type_id: string | number) => `/api/v2/event-types/${type_id}`,
  },
  events: {
    /** GET — V2 Events */
    LIST_EVENTS: "/api/v2/events",
    /** POST — V2 Events */
    CREATE_EVENT: "/api/v2/events",
    /** GET — Events V2 — Agenda */
    GET_AGENDA: (event_uuid: string | number) => `/api/v2/events/${event_uuid}/agenda`,
    /** POST — Events V2 — Agenda */
    CREATE_SESSION: (event_uuid: string | number) => `/api/v2/events/${event_uuid}/agenda/sessions`,
    /** DELETE — Events V2 — Agenda */
    DELETE_SESSION: (event_uuid: string | number, session_uuid: string | number) => `/api/v2/events/${event_uuid}/agenda/sessions/${session_uuid}`,
    /** PATCH — Events V2 — Agenda */
    UPDATE_SESSION: (event_uuid: string | number, session_uuid: string | number) => `/api/v2/events/${event_uuid}/agenda/sessions/${session_uuid}`,
    /** POST — Events V2 — Agenda */
    SESSION_CHECK_IN: (event_uuid: string | number, session_uuid: string | number) => `/api/v2/events/${event_uuid}/agenda/sessions/${session_uuid}/check-in`,
    /** DELETE — Events V2 — Agenda */
    CANCEL_RSVP: (event_uuid: string | number, session_uuid: string | number) => `/api/v2/events/${event_uuid}/agenda/sessions/${session_uuid}/rsvp`,
    /** POST — Events V2 — Agenda */
    RSVP_TO_SESSION: (event_uuid: string | number, session_uuid: string | number) => `/api/v2/events/${event_uuid}/agenda/sessions/${session_uuid}/rsvp`,
    /** POST — Events V2 — Agenda */
    CREATE_SPEAKER: (event_uuid: string | number) => `/api/v2/events/${event_uuid}/agenda/speakers`,
    /** DELETE — Events V2 — Agenda */
    DELETE_SPEAKER: (event_uuid: string | number, speaker_uuid: string | number) => `/api/v2/events/${event_uuid}/agenda/speakers/${speaker_uuid}`,
    /** PATCH — Events V2 — Agenda */
    UPDATE_SPEAKER: (event_uuid: string | number, speaker_uuid: string | number) => `/api/v2/events/${event_uuid}/agenda/speakers/${speaker_uuid}`,
    /** POST — Events V2 — Agenda */
    CREATE_TRACK: (event_uuid: string | number) => `/api/v2/events/${event_uuid}/agenda/tracks`,
    /** DELETE — Events V2 — Agenda */
    DELETE_TRACK: (event_uuid: string | number, track_uuid: string | number) => `/api/v2/events/${event_uuid}/agenda/tracks/${track_uuid}`,
    /** PATCH — Events V2 — Agenda */
    UPDATE_TRACK: (event_uuid: string | number, track_uuid: string | number) => `/api/v2/events/${event_uuid}/agenda/tracks/${track_uuid}`,
    /** GET — Events V2 — Approvals */
    LIST_PENDING: (event_uuid: string | number) => `/api/v2/events/${event_uuid}/approvals`,
    /** POST — Events V2 — Approvals */
    APPROVE: (event_uuid: string | number, participant_uuid: string | number) => `/api/v2/events/${event_uuid}/approvals/${participant_uuid}/approve`,
    /** POST — Events V2 — Approvals */
    REJECT: (event_uuid: string | number, participant_uuid: string | number) => `/api/v2/events/${event_uuid}/approvals/${participant_uuid}/reject`,
    /** POST — V2 Event Transport */
    BOARD_PARTICIPANT: (event_uuid: string | number, stop_uuid: string | number) => `/api/v2/events/${event_uuid}/transport/stops/${stop_uuid}/board`,
    /** POST — V2 Event Transport */
    BOARD_PARTICIPANTS_BULK: (event_uuid: string | number, stop_uuid: string | number) => `/api/v2/events/${event_uuid}/transport/stops/${stop_uuid}/board/bulk`,
    /** GET — V2 Event Transport */
    GET_MANIFEST: (event_uuid: string | number, stop_uuid: string | number) => `/api/v2/events/${event_uuid}/transport/stops/${stop_uuid}/manifest`,
    /** GET — V2 Event Transport */
    LIST_OUTREACH: (event_uuid: string | number, stop_uuid: string | number) => `/api/v2/events/${event_uuid}/transport/stops/${stop_uuid}/outreach`,
    /** POST — V2 Event Transport */
    CREATE_OUTREACH: (event_uuid: string | number, stop_uuid: string | number) => `/api/v2/events/${event_uuid}/transport/stops/${stop_uuid}/outreach`,
    /** GET — V2 Event Venues */
    LIST_EVENT_VENUES: (event_uuid: string | number) => `/api/v2/events/${event_uuid}/venues`,
    /** POST — V2 Event Venues */
    ADD_EVENT_VENUE: (event_uuid: string | number) => `/api/v2/events/${event_uuid}/venues`,
    /** DELETE — V2 Event Venues */
    DELETE_EVENT_VENUE: (event_uuid: string | number, venue_uuid: string | number) => `/api/v2/events/${event_uuid}/venues/${venue_uuid}`,
    /** PATCH — V2 Event Venues */
    UPDATE_EVENT_VENUE: (event_uuid: string | number, venue_uuid: string | number) => `/api/v2/events/${event_uuid}/venues/${venue_uuid}`,
    /** GET — V2 Event Venues */
    LIST_VENUE_PARTICIPANTS: (event_uuid: string | number, venue_uuid: string | number) => `/api/v2/events/${event_uuid}/venues/${venue_uuid}/participants`,
    /** DELETE — V2 Events */
    DELETE_EVENT: (uuid: string | number) => `/api/v2/events/${uuid}`,
    /** GET — V2 Events */
    GET_EVENT: (uuid: string | number) => `/api/v2/events/${uuid}`,
    /** PATCH — V2 Events */
    UPDATE_EVENT: (uuid: string | number) => `/api/v2/events/${uuid}`,
    /** GET — V2 Event Participants */
    GET_EVENT_AUDIT_LOG: (uuid: string | number) => `/api/v2/events/${uuid}/audit-log`,
    /** POST — V2 Event Participants */
    CHECK_IN_PARTICIPANT: (uuid: string | number) => `/api/v2/events/${uuid}/check-in`,
    /** POST — V2 Events */
    CLONE_EVENT: (uuid: string | number) => `/api/v2/events/${uuid}/clone`,
    /** POST — V2 Events */
    EXPAND_RECURRENCE: (uuid: string | number) => `/api/v2/events/${uuid}/expand-recurrence`,
    /** GET — V2 Event Feedback */
    LIST_FEEDBACK: (uuid: string | number) => `/api/v2/events/${uuid}/feedback`,
    /** POST — V2 Event Feedback */
    SUBMIT_FEEDBACK: (uuid: string | number) => `/api/v2/events/${uuid}/feedback`,
    /** PATCH — V2 Event Feedback */
    SET_FEEDBACK_VISIBILITY: (uuid: string | number, feedback_uuid: string | number) => `/api/v2/events/${uuid}/feedback/${feedback_uuid}`,
    /** POST — V2 Event Feedback */
    REPORT_FEEDBACK: (uuid: string | number, feedback_uuid: string | number) => `/api/v2/events/${uuid}/feedback/${feedback_uuid}/report`,
    /** PATCH — V2 Event Feedback */
    EDIT_MY_FEEDBACK: (uuid: string | number) => `/api/v2/events/${uuid}/feedback/mine`,
    /** GET — V2 Event Feedback */
    LIST_FEEDBACK_REPORTS: (uuid: string | number) => `/api/v2/events/${uuid}/feedback/reports`,
    /** PATCH — V2 Event Feedback */
    RESOLVE_FEEDBACK_REPORT: (uuid: string | number, report_uuid: string | number) => `/api/v2/events/${uuid}/feedback/reports/${report_uuid}`,
    /** GET — V2 Event Feedback */
    GET_FEEDBACK_SUMMARY: (uuid: string | number) => `/api/v2/events/${uuid}/feedback/summary`,
    /** GET — V2 Events */
    GET_EVENT_ICS_AUTHENTICATED: (uuid: string | number) => `/api/v2/events/${uuid}/ics`,
    /** GET — V2 Event Invitations */
    LIST_INVITATIONS: (uuid: string | number) => `/api/v2/events/${uuid}/invitations`,
    /** POST — V2 Event Invitations */
    CREATE_INVITATION: (uuid: string | number) => `/api/v2/events/${uuid}/invitations`,
    /** DELETE — V2 Event Invitations */
    REVOKE_INVITATION: (uuid: string | number, invitation_uuid: string | number) => `/api/v2/events/${uuid}/invitations/${invitation_uuid}`,
    /** POST — V2 Event Invitations */
    CREATE_INVITATIONS_BULK: (uuid: string | number) => `/api/v2/events/${uuid}/invitations/bulk`,
    /** GET — V2 Event Media */
    LIST_EVENT_MEDIA: (uuid: string | number) => `/api/v2/events/${uuid}/media`,
    /** POST — V2 Event Media */
    UPLOAD_EVENT_MEDIA: (uuid: string | number) => `/api/v2/events/${uuid}/media`,
    /** DELETE — V2 Event Media */
    DELETE_EVENT_MEDIA: (uuid: string | number, media_uuid: string | number) => `/api/v2/events/${uuid}/media/${media_uuid}`,
    /** PATCH — V2 Event Media */
    UPDATE_EVENT_MEDIA: (uuid: string | number, media_uuid: string | number) => `/api/v2/events/${uuid}/media/${media_uuid}`,
    /** GET — V2 Event Certificates */
    GET_MY_CERTIFICATE: (uuid: string | number) => `/api/v2/events/${uuid}/my-certificate`,
    /** GET — V2 Event Participants */
    GET_MY_TICKET: (uuid: string | number) => `/api/v2/events/${uuid}/my-ticket`,
    /** GET — V2 Event Participants */
    LIST_EVENT_PARTICIPANTS: (uuid: string | number) => `/api/v2/events/${uuid}/participants`,
    /** GET — V2 Event Certificates */
    GET_PARTICIPANT_CERTIFICATE: (uuid: string | number, participant_uuid: string | number) => `/api/v2/events/${uuid}/participants/${participant_uuid}/certificate`,
    /** POST — V2 Event Participants */
    BULK_PARTICIPANT_ACTION: (uuid: string | number) => `/api/v2/events/${uuid}/participants/bulk`,
    /** GET — V2 Event Participants */
    EXPORT_EVENT_PARTICIPANTS: (uuid: string | number) => `/api/v2/events/${uuid}/participants/export`,
    /** POST — V2 Event Participants */
    PARSE_CSV: (uuid: string | number) => `/api/v2/events/${uuid}/participants/import`,
    /** POST — V2 Event Participants */
    REGISTER_FOR_EVENT: (uuid: string | number) => `/api/v2/events/${uuid}/register`,
    /** GET — V2 Event Sponsors */
    LIST_EVENT_SPONSORS: (uuid: string | number) => `/api/v2/events/${uuid}/sponsors`,
    /** POST — V2 Event Sponsors */
    CREATE_EVENT_SPONSOR: (uuid: string | number) => `/api/v2/events/${uuid}/sponsors`,
    /** DELETE — V2 Event Sponsors */
    DELETE_EVENT_SPONSOR: (uuid: string | number, sponsor_uuid: string | number) => `/api/v2/events/${uuid}/sponsors/${sponsor_uuid}`,
    /** PATCH — V2 Event Sponsors */
    UPDATE_EVENT_SPONSOR: (uuid: string | number, sponsor_uuid: string | number) => `/api/v2/events/${uuid}/sponsors/${sponsor_uuid}`,
    /** GET — V2 Event Participants */
    GET_EVENT_STATS: (uuid: string | number) => `/api/v2/events/${uuid}/stats`,
    /** POST — V2 Event Streaming */
    STREAMING_WEBHOOK: (uuid: string | number) => `/api/v2/events/${uuid}/streaming/webhook`,
    /** POST — V2 Event Participants */
    REVOKE_EVENT_TICKET: (uuid: string | number) => `/api/v2/events/${uuid}/tickets/revoke`,
    /** GET — V2 Event Participants */
    LIST_REVOKED_TICKETS: (uuid: string | number) => `/api/v2/events/${uuid}/tickets/revoked`,
    /** GET — V2 Event Transport */
    LIST_TRANSPORT_STOPS: (uuid: string | number) => `/api/v2/events/${uuid}/transport`,
    /** POST — V2 Event Transport */
    ADD_TRANSPORT_STOP: (uuid: string | number) => `/api/v2/events/${uuid}/transport`,
    /** DELETE — V2 Event Transport */
    DELETE_TRANSPORT_STOP: (uuid: string | number, stop_uuid: string | number) => `/api/v2/events/${uuid}/transport/${stop_uuid}`,
    /** PATCH — V2 Event Transport */
    UPDATE_TRANSPORT_STOP: (uuid: string | number, stop_uuid: string | number) => `/api/v2/events/${uuid}/transport/${stop_uuid}`,
    /** GET — V2 Event Transport */
    LIST_AVAILABLE_TRANSPORT: (uuid: string | number) => `/api/v2/events/${uuid}/transport/available`,
    /** POST — V2 Event Boarding */
    POST_EVENTS_UUID_TRANSPORT_BOARD_PARTICIPANT_UUID: (uuid: string | number, participant_uuid: string | number) => `/api/v2/events/${uuid}/transport/board/${participant_uuid}`,
    /** GET — V2 Event Boarding */
    GET_EVENTS_UUID_TRANSPORT_MANIFEST: (uuid: string | number) => `/api/v2/events/${uuid}/transport/manifest`,
    /** POST — V2 Event Boarding */
    MARK_NO_SHOW: (uuid: string | number, participant_uuid: string | number) => `/api/v2/events/${uuid}/transport/no-show/${participant_uuid}`,
    /** GET — V2 Event Boarding */
    GET_OUTREACH_LOG: (uuid: string | number) => `/api/v2/events/${uuid}/transport/outreach`,
    /** POST — V2 Event Boarding */
    SEND_OUTREACH: (uuid: string | number, participant_uuid: string | number) => `/api/v2/events/${uuid}/transport/outreach/${participant_uuid}`,
    /** GET — V2 Event Transport */
    AUTO_SUGGEST_TRANSPORT: (uuid: string | number) => `/api/v2/events/${uuid}/transport/suggest`,
    /** GET — V2 Event Certificates */
    VERIFY_CERTIFICATE_CODE: (code: string | number) => `/api/v2/events/certificates/verify/${code}`,
    /** POST — V2 Event Templates */
    CREATE_EVENT_FROM_TEMPLATE: (template_uuid: string | number) => `/api/v2/events/from-template/${template_uuid}`,
    /** GET — V2 Event Invitations */
    PREVIEW_INVITATION: (token: string | number) => `/api/v2/events/invitations/${token}`,
    /** POST — V2 Event Invitations */
    REDEEM_INVITATION: (token: string | number) => `/api/v2/events/invitations/${token}/redeem`,
    /** GET — V2 Events */
    LIST_MY_EVENTS: "/api/v2/events/my-events",
    /** GET — V2 Events */
    GET_MY_EVENTS_SUMMARY: "/api/v2/events/my-events/summary",
    /** GET — V2 Events */
    LIST_EVENTS_PUBLIC: "/api/v2/events/public",
    /** GET — V2 Events */
    GET_EVENT_PUBLIC: (uuid: string | number) => `/api/v2/events/public/${uuid}`,
    /** GET — V2 Events */
    GET_EVENT_ICS: (uuid: string | number) => `/api/v2/events/public/${uuid}/calendar.ics`,
    /** GET — V2 Events */
    GET_EVENT_SHARE_HTML: (uuid: string | number) => `/api/v2/events/public/${uuid}/share`,
    /** GET — V2 Events */
    GET_EVENTS_SUMMARY: "/api/v2/events/summary",
    /** GET — V2 Event Templates */
    LIST_TEMPLATES: "/api/v2/events/templates",
    /** POST — V2 Event Templates */
    CREATE_TEMPLATE: "/api/v2/events/templates",
    /** DELETE — V2 Event Templates */
    DELETE_TEMPLATE: (template_uuid: string | number) => `/api/v2/events/templates/${template_uuid}`,
    /** GET — V2 Event Templates */
    GET_TEMPLATE: (template_uuid: string | number) => `/api/v2/events/templates/${template_uuid}`,
    /** PATCH — V2 Event Templates */
    UPDATE_TEMPLATE: (template_uuid: string | number) => `/api/v2/events/templates/${template_uuid}`,
    /** POST — V2 Event Templates */
    CREATE_TEMPLATE_FROM_EVENT: (event_uuid: string | number) => `/api/v2/events/templates/from-event/${event_uuid}`,
  },
  faq: {
    /** GET — V2 FAQ */
    ADMIN_LIST_ARTICLES: "/api/v2/faq/admin/articles",
    /** POST — V2 FAQ */
    ADMIN_CREATE_ARTICLE: "/api/v2/faq/admin/articles",
    /** DELETE — V2 FAQ */
    ADMIN_DELETE_ARTICLE: (article_uuid: string | number) => `/api/v2/faq/admin/articles/${article_uuid}`,
    /** PATCH — V2 FAQ */
    ADMIN_UPDATE_ARTICLE: (article_uuid: string | number) => `/api/v2/faq/admin/articles/${article_uuid}`,
    /** POST — V2 FAQ */
    ADMIN_MARK_ARTICLE_REVIEWED: (article_uuid: string | number) => `/api/v2/faq/admin/articles/${article_uuid}/mark-reviewed`,
    /** POST — V2 FAQ */
    ADMIN_CREATE_RESOURCE: (article_uuid: string | number) => `/api/v2/faq/admin/articles/${article_uuid}/resources`,
    /** POST — V2 FAQ */
    ADMIN_RESTORE_ARTICLE: (article_uuid: string | number) => `/api/v2/faq/admin/articles/${article_uuid}/restore`,
    /** POST — V2 FAQ */
    ADMIN_RETRANSLATE_ARTICLE: (article_uuid: string | number) => `/api/v2/faq/admin/articles/${article_uuid}/retranslate`,
    /** GET — V2 FAQ */
    ADMIN_LIST_ARTICLE_REVISIONS: (article_uuid: string | number) => `/api/v2/faq/admin/articles/${article_uuid}/revisions`,
    /** POST — V2 FAQ */
    CREATE_CATEGORY: "/api/v2/faq/admin/categories",
    /** DELETE — V2 FAQ */
    DELETE_CATEGORY: (category_uuid: string | number) => `/api/v2/faq/admin/categories/${category_uuid}`,
    /** PATCH — V2 FAQ */
    UPDATE_CATEGORY: (category_uuid: string | number) => `/api/v2/faq/admin/categories/${category_uuid}`,
    /** POST — V2 FAQ */
    CREATE_GLOSSARY_TERM: "/api/v2/faq/admin/glossary",
    /** DELETE — V2 FAQ */
    DELETE_GLOSSARY_TERM: (term_uuid: string | number) => `/api/v2/faq/admin/glossary/${term_uuid}`,
    /** PATCH — V2 FAQ */
    UPDATE_GLOSSARY_TERM: (term_uuid: string | number) => `/api/v2/faq/admin/glossary/${term_uuid}`,
    /** POST — V2 FAQ */
    ADMIN_MIGRATION_COMMIT: "/api/v2/faq/admin/migration/commit",
    /** POST — V2 FAQ */
    ADMIN_MIGRATION_DRY_RUN: "/api/v2/faq/admin/migration/dry-run",
    /** GET — V2 FAQ */
    ADMIN_MIGRATION_STATUS: "/api/v2/faq/admin/migration/status",
    /** DELETE — V2 FAQ */
    ADMIN_DELETE_RESOURCE: (resource_uuid: string | number) => `/api/v2/faq/admin/resources/${resource_uuid}`,
    /** PATCH — V2 FAQ */
    ADMIN_UPDATE_RESOURCE: (resource_uuid: string | number) => `/api/v2/faq/admin/resources/${resource_uuid}`,
    /** POST — V2 FAQ */
    ADMIN_RE_ENRICH_RESOURCE: (resource_uuid: string | number) => `/api/v2/faq/admin/resources/${resource_uuid}/re-enrich`,
    /** GET — V2 FAQ */
    ADMIN_SEARCH_GAPS: "/api/v2/faq/admin/search-gaps",
    /** GET — V2 FAQ */
    LIST_ARTICLES: "/api/v2/faq/articles",
    /** POST — V2 FAQ */
    POST_ARTICLE_FEEDBACK: (article_uuid: string | number) => `/api/v2/faq/articles/${article_uuid}/feedback`,
    /** GET — V2 FAQ */
    GET_ARTICLE_RELATED: (article_uuid: string | number) => `/api/v2/faq/articles/${article_uuid}/related`,
    /** POST — V2 FAQ */
    POST_ARTICLE_VIEW: (article_uuid: string | number) => `/api/v2/faq/articles/${article_uuid}/view`,
    /** GET — V2 FAQ */
    GET_ARTICLE_DETAIL: (slug: string | number) => `/api/v2/faq/articles/${slug}`,
    /** GET — V2 FAQ */
    ARTICLE_PDF: (slug: string | number) => `/api/v2/faq/articles/${slug}.pdf`,
    /** GET — V2 FAQ */
    GET_CATEGORIES: "/api/v2/faq/categories",
    /** GET — V2 FAQ */
    LIST_GLOSSARY: "/api/v2/faq/glossary",
    /** GET — V2 FAQ */
    GET_GLOSSARY_TERM: (term: string | number) => `/api/v2/faq/glossary/${term}`,
    /** GET — V2 FAQ */
    SEARCH: "/api/v2/faq/search",
    /** GET — V2 FAQ */
    SEARCH_SUGGEST: "/api/v2/faq/search/suggest",
  },
  galleries: {
    /** GET — V2 Galleries */
    LIST_GALLERIES: "/api/v2/galleries",
    /** POST — V2 Galleries */
    CREATE_GALLERY: "/api/v2/galleries",
    /** GET — V2 Galleries. Anonymous, no JWT. Query: page, page_size, q?, tag?, lang?. SITIMM-40. */
    LIST_PUBLIC_GALLERIES: "/api/v2/galleries/public",
    /** GET — V2 Galleries. Anonymous, no JWT. NOTE explicit `/entity/` segment (disambiguates from the `{uuid_or_slug}` detail route below). Query: lang?. SITIMM-40. */
    LIST_PUBLIC_ENTITY_GALLERIES: (entity_type: string | number, entity_uuid: string | number) => `/api/v2/galleries/public/entity/${entity_type}/${entity_uuid}`,
    /** GET — V2 Galleries. Anonymous, no JWT. `uuid_or_slug`: tries UUID parse+lookup first, falls back to slug. Query: lang?. SITIMM-40. */
    GET_PUBLIC_GALLERY: (uuid_or_slug: string | number) => `/api/v2/galleries/public/${uuid_or_slug}`,
    /** DELETE — V2 Galleries */
    DELETE_GALLERY: (gallery_uuid: string | number) => `/api/v2/galleries/${gallery_uuid}`,
    /** GET — V2 Galleries */
    GET_GALLERY: (gallery_uuid: string | number) => `/api/v2/galleries/${gallery_uuid}`,
    /** PATCH — V2 Galleries */
    UPDATE_GALLERY: (gallery_uuid: string | number) => `/api/v2/galleries/${gallery_uuid}`,
    /** POST — V2 Galleries */
    ATTACH_GALLERY: (gallery_uuid: string | number) => `/api/v2/galleries/${gallery_uuid}/attach`,
    /** DELETE — V2 Galleries */
    DETACH_GALLERY: (gallery_uuid: string | number, entity_type: string | number, entity_uuid: string | number) => `/api/v2/galleries/${gallery_uuid}/attach/${entity_type}/${entity_uuid}`,
    /** POST — V2 Galleries */
    ADD_ITEM: (gallery_uuid: string | number) => `/api/v2/galleries/${gallery_uuid}/items`,
    /** PATCH — V2 Galleries */
    REORDER_ITEMS: (gallery_uuid: string | number) => `/api/v2/galleries/${gallery_uuid}/items/reorder`,
    /** GET — V2 Galleries. Admin (galleries:update). SITIMM-40. */
    LIST_GALLERY_TRANSLATIONS: (gallery_uuid: string | number) => `/api/v2/galleries/${gallery_uuid}/translations`,
    /** PUT — V2 Galleries. Admin (galleries:update). Body: GalleryTranslationBodyV2. SITIMM-40. */
    UPSERT_GALLERY_TRANSLATION: (gallery_uuid: string | number, lang: string | number) => `/api/v2/galleries/${gallery_uuid}/translations/${lang}`,
    /** POST — V2 Galleries — Contributions. `galleries:contribute` (EMPLOYEE+) + visibility gate. Body: GalleryContributeRequest. 201. SITIMM-45/46. */
    CONTRIBUTE_TO_GALLERY: (gallery_uuid: string | number) => `/api/v2/galleries/${gallery_uuid}/contribute`,
    /** GET — V2 Galleries — Contributions. `galleries:moderate` (ADMIN_COMMUNICATION+). Query: gallery_uuid?, page, page_size. SITIMM-45/46. */
    LIST_MODERATION_PENDING: "/api/v2/galleries/moderation/pending",
    /** GET — V2 Galleries — Contributions. Any authed caller (self-scoped, contributedBy === caller.id). Query: page, page_size. SITIMM-45/46. */
    LIST_MY_CONTRIBUTIONS: "/api/v2/galleries/me/contributions",
  },
  galleryItems: {
    /** DELETE — V2 Galleries */
    DELETE_ITEM: (item_uuid: string | number) => `/api/v2/gallery-items/${item_uuid}`,
    /** PATCH — V2 Galleries */
    UPDATE_ITEM: (item_uuid: string | number) => `/api/v2/gallery-items/${item_uuid}`,
    /** GET — V2 Galleries. Admin (galleries:update). SITIMM-40. */
    LIST_GALLERY_ITEM_TRANSLATIONS: (item_uuid: string | number) => `/api/v2/gallery-items/${item_uuid}/translations`,
    /** PUT — V2 Galleries. Admin (galleries:update). Body: GalleryItemTranslationBodyV2. SITIMM-40. */
    UPSERT_GALLERY_ITEM_TRANSLATION: (item_uuid: string | number, lang: string | number) => `/api/v2/gallery-items/${item_uuid}/translations/${lang}`,
    /** POST — V2 Galleries — Contributions. `galleries:moderate`. Body: GalleryModerationActionBody. Refuses (409 scan_not_clean) unless scanStatus="clean". SITIMM-45/46. */
    APPROVE_CONTRIBUTION: (item_uuid: string | number) => `/api/v2/gallery-items/${item_uuid}/approve`,
    /** POST — V2 Galleries — Contributions. `galleries:moderate`. Body: GalleryModerationActionBody (same shape as approve). SITIMM-45/46. */
    REJECT_CONTRIBUTION: (item_uuid: string | number) => `/api/v2/gallery-items/${item_uuid}/reject`,
    /** GET — V2 Galleries — Contributions. Any authed caller — gated to contributor OR `galleries:moderate` (404, not 403, for anyone else). Short-TTL (~300s) presigned preview of quarantined bytes. SITIMM-45/46. */
    GET_CONTRIBUTION_PREVIEW_URL: (item_uuid: string | number) => `/api/v2/gallery-items/${item_uuid}/preview-url`,
    /** DELETE — V2 Galleries — Contributions. Any authed caller (ownership-checked). Own pending/rejected only — 403 on an approved item. SITIMM-45/46. */
    WITHDRAW_CONTRIBUTION: (item_uuid: string | number) => `/api/v2/gallery-items/${item_uuid}/withdraw`,
    /** PATCH — V2 Galleries — Contributions. Any authed caller (ownership + pending-only checked). Body: GalleryContributionMetadataUpdateInput. SITIMM-45/46. */
    UPDATE_CONTRIBUTION_METADATA: (item_uuid: string | number) => `/api/v2/gallery-items/${item_uuid}/contribution`,
  },
  headquarters: {
    /** GET — V2 Headquarters */
    LIST_HEADQUARTERS: "/api/v2/headquarters/",
    /** POST — V2 Headquarters */
    CREATE_HEADQUARTER: "/api/v2/headquarters/",
    /** DELETE — V2 Headquarters */
    DELETE_HEADQUARTER: (hq_uuid: string | number) => `/api/v2/headquarters/${hq_uuid}`,
    /** GET — V2 Headquarters */
    GET_HEADQUARTER: (hq_uuid: string | number) => `/api/v2/headquarters/${hq_uuid}`,
    /** PATCH — V2 Headquarters */
    UPDATE_HEADQUARTER: (hq_uuid: string | number) => `/api/v2/headquarters/${hq_uuid}`,
    /** GET — V2 Headquarters */
    SINGLE_HQ_METRICS: (hq_uuid: string | number) => `/api/v2/headquarters/${hq_uuid}/metrics`,
    /** GET — V2 Headquarters */
    HQ_METRICS_HISTORY: (hq_uuid: string | number) => `/api/v2/headquarters/${hq_uuid}/metrics/history`,
    /** GET — V2 Headquarters */
    ALL_HQ_METRICS: "/api/v2/headquarters/metrics",
  },
  magazines: {
    /** GET — V2 Magazines, V2 Magazines */
    LIST_MAGAZINES: "/api/v2/magazines",
    /** POST — V2 Magazines, V2 Magazines */
    CREATE_MAGAZINE: "/api/v2/magazines",
    /** POST — V2 Magazines, V2 Magazines */
    ADMIN_BACKFILL_TOC: "/api/v2/magazines/_admin/backfill-toc",
    /** GET — V2 Magazines, V2 Magazines */
    ADMIN_NON_TOC_HASH: "/api/v2/magazines/_admin/non-toc-hash",
    /** POST — Engagement — magazine */
    ADMIN_PAUSE_COMMENTS: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/admin/comments/pause`,
    /** POST — Engagement — magazine */
    ADMIN_RESUME_COMMENTS: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/admin/comments/resume`,
    /** POST — Engagement — magazine */
    ADMIN_PAUSE_REACTIONS: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/admin/reactions/pause`,
    /** POST — Engagement — magazine */
    ADMIN_RESUME_REACTIONS: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/admin/reactions/resume`,
    /** GET — Engagement — magazine */
    ADMIN_GET_SETTINGS: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/admin/settings`,
    /** PATCH — Engagement — magazine */
    ADMIN_PATCH_SETTINGS: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/admin/settings`,
    /** GET — Engagement — magazine */
    ADMIN_LIST_SUSPENSION_LOG: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/admin/suspension-log`,
    /** DELETE — Engagement — magazine */
    REMOVE_BOOKMARK: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/bookmark`,
    /** POST — Engagement — magazine */
    ADD_BOOKMARK: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/bookmark`,
    /** GET — Engagement — magazine */
    LIST_COMMENTS: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/comments`,
    /** POST — Engagement — magazine */
    CREATE_COMMENT: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/comments`,
    /** POST — Engagement — magazine */
    DOWNLOAD: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/download`,
    /** DELETE — Engagement — magazine */
    UNLIKE: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/like`,
    /** POST — Engagement — magazine */
    LIKE: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/like`,
    /** POST — Engagement — magazine */
    LIKE_PUBLIC: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/like/public`,
    /** POST — Engagement — magazine */
    TOGGLE_REACTION: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/reactions`,
    /** POST — Engagement — magazine */
    REPORT: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/report`,
    /** POST — Engagement — magazine */
    RECORD_SHARE: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/share`,
    /** GET — Engagement — magazine */
    STATS: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/stats`,
    /** POST — Engagement — magazine */
    RECORD_VIEW: (subject_uuid: string | number) => `/api/v2/magazines/${subject_uuid}/view`,
    /** DELETE — V2 Magazines, V2 Magazines */
    DELETE_MAGAZINE: (uuid: string | number) => `/api/v2/magazines/${uuid}`,
    /** GET — V2 Magazines, V2 Magazines */
    GET_MAGAZINE: (uuid: string | number) => `/api/v2/magazines/${uuid}`,
    /** PATCH — V2 Magazines, V2 Magazines */
    UPDATE_MAGAZINE: (uuid: string | number) => `/api/v2/magazines/${uuid}`,
    /** GET — V2 Magazines, V2 Magazines */
    LIST_MAGAZINE_PAGES: (uuid: string | number) => `/api/v2/magazines/${uuid}/pages`,
    /** GET — V2 Magazines, V2 Magazines */
    GET_MAGAZINE_PAGE_TEXT: (uuid: string | number, page_number: string | number) => `/api/v2/magazines/${uuid}/pages/${page_number}/text`,
    /** POST — V2 Magazines, V2 Magazines */
    RETRANSLATE_MAGAZINE: (uuid: string | number) => `/api/v2/magazines/${uuid}/retranslate`,
    /** GET — V2 Magazines, V2 Magazines */
    LIST_MAGAZINE_TRANSLATIONS: (uuid: string | number) => `/api/v2/magazines/${uuid}/translations`,
    /** PUT — V2 Magazines, V2 Magazines */
    UPSERT_MAGAZINE_TRANSLATION: (uuid: string | number, lang: string | number) => `/api/v2/magazines/${uuid}/translations/${lang}`,
    /** POST — V2 Magazines, V2 Magazines */
    BULK_MAGAZINES: "/api/v2/magazines/bulk",
    /** POST — V2 Magazines, V2 Magazines */
    BULK_IMPORT_MAGAZINES: "/api/v2/magazines/bulk-import",
    /** GET — V2 Magazines, V2 Magazines */
    LIST_CATEGORIES: "/api/v2/magazines/categories",
    /** DELETE — Engagement — magazine */
    DELETE_OWN_COMMENT: (comment_uuid: string | number) => `/api/v2/magazines/comments/${comment_uuid}`,
    /** GET — V2 Magazines, V2 Magazines */
    LIST_LIKED_MAGAZINES: "/api/v2/magazines/liked",
    /** GET — V2 Magazines, V2 Magazines */
    LIST_MAGAZINES_PUBLIC: "/api/v2/magazines/public",
    /** GET — V2 Magazines, V2 Magazines */
    GET_MAGAZINE_PUBLIC: (uuid: string | number) => `/api/v2/magazines/public/${uuid}`,
    /** GET — V2 Magazines, V2 Magazines */
    LIST_MAGAZINE_PAGES_PUBLIC: (uuid: string | number) => `/api/v2/magazines/public/${uuid}/pages`,
    /** GET — V2 Magazines, V2 Magazines */
    ADMIN_STATS: "/api/v2/magazines/stats",
    /** GET — Engagement — magazine */
    DOWNLOADS_CSV: "/api/v2/magazines/stats/downloads.csv",
  },
  meEngagement: {
    /** GET — Engagement Me */
    LIST_MY_BOOKMARKS: "/api/v2/me/engagement/bookmarks",
    /** GET — Engagement Me */
    LIST_MY_COMMENTS: "/api/v2/me/engagement/comments",
    /** GET — Engagement Me */
    GET_MY_NOTIFICATION_PREFS: "/api/v2/me/engagement/notification-preferences",
    /** PATCH — Engagement Me */
    PATCH_MY_NOTIFICATION_PREFS: "/api/v2/me/engagement/notification-preferences",
    /** GET — Engagement Me */
    LIST_MY_NOTIFICATIONS: "/api/v2/me/engagement/notifications",
  },
  meFaqBookmarks: {
    /** GET — V2 FAQ - me */
    LIST_MY_BOOKMARKS: "/api/v2/me/faq-bookmarks",
    /** DELETE — V2 FAQ - me */
    REMOVE_MY_BOOKMARK: (article_uuid: string | number) => `/api/v2/me/faq-bookmarks/${article_uuid}`,
    /** POST — V2 FAQ - me */
    ADD_MY_BOOKMARK: (article_uuid: string | number) => `/api/v2/me/faq-bookmarks/${article_uuid}`,
  },
  meFaqSubscriptions: {
    /** GET — V2 FAQ - me */
    LIST_MY_SUBSCRIPTIONS: "/api/v2/me/faq-subscriptions",
    /** DELETE — V2 FAQ - me */
    REMOVE_MY_SUBSCRIPTION: (category_uuid: string | number) => `/api/v2/me/faq-subscriptions/${category_uuid}`,
    /** POST — V2 FAQ - me */
    ADD_MY_SUBSCRIPTION: (category_uuid: string | number) => `/api/v2/me/faq-subscriptions/${category_uuid}`,
  },
  polymorphic: {
    /** GET — V2 Galleries */
    LIST_ENTITY_GALLERIES: (entity_type: string | number, entity_uuid: string | number) => `/api/v2/${entity_type}/${entity_uuid}/galleries`,
  },
  programs: {
    /** GET — V2 Programs */
    LIST_PROGRAMS: "/api/v2/programs",
    /** POST — V2 Programs */
    CREATE_PROGRAM: "/api/v2/programs",
    /** DELETE — V2 Programs */
    DELETE_PROGRAM: (program_uuid: string | number) => `/api/v2/programs/${program_uuid}`,
    /** GET — V2 Programs */
    GET_PROGRAM: (program_uuid: string | number) => `/api/v2/programs/${program_uuid}`,
    /** PATCH — V2 Programs */
    UPDATE_PROGRAM: (program_uuid: string | number) => `/api/v2/programs/${program_uuid}`,
    /** POST — V2 Programs */
    ADD_SUBPROGRAM: (program_uuid: string | number) => `/api/v2/programs/${program_uuid}/subprograms`,
    /** PATCH — V2 Programs */
    REORDER_SUBPROGRAMS: (program_uuid: string | number) => `/api/v2/programs/${program_uuid}/subprograms/reorder`,
    /** GET — V2 Programs */
    LIST_PROGRAM_TRANSLATIONS: (program_uuid: string | number) => `/api/v2/programs/${program_uuid}/translations`,
    /** PUT — V2 Programs */
    BULK_UPSERT_PROGRAM_TRANSLATIONS: (program_uuid: string | number) => `/api/v2/programs/${program_uuid}/translations`,
    /** DELETE — V2 Programs */
    DELETE_PROGRAM_TRANSLATION: (program_uuid: string | number, lang: string | number) => `/api/v2/programs/${program_uuid}/translations/${lang}`,
    /** PUT — V2 Programs */
    UPSERT_PROGRAM_TRANSLATION: (program_uuid: string | number, lang: string | number) => `/api/v2/programs/${program_uuid}/translations/${lang}`,
    /** GET — V2 Programs */
    LIST_PROGRAMS_PUBLIC: "/api/v2/programs/public",
    /** POST — V2 Programs */
    UPLOAD_PROGRAM_IMAGE: "/api/v2/programs/upload-image",
  },
  subprograms: {
    /** DELETE — V2 Programs */
    DELETE_SUBPROGRAM: (sub_uuid: string | number) => `/api/v2/subprograms/${sub_uuid}`,
    /** PATCH — V2 Programs */
    UPDATE_SUBPROGRAM: (sub_uuid: string | number) => `/api/v2/subprograms/${sub_uuid}`,
    /** GET — V2 Programs */
    LIST_SUBPROGRAM_TRANSLATIONS: (sub_uuid: string | number) => `/api/v2/subprograms/${sub_uuid}/translations`,
    /** PUT — V2 Programs */
    BULK_UPSERT_SUBPROGRAM_TRANSLATIONS: (sub_uuid: string | number) => `/api/v2/subprograms/${sub_uuid}/translations`,
    /** DELETE — V2 Programs */
    DELETE_SUBPROGRAM_TRANSLATION: (sub_uuid: string | number, lang: string | number) => `/api/v2/subprograms/${sub_uuid}/translations/${lang}`,
    /** PUT — V2 Programs */
    UPSERT_SUBPROGRAM_TRANSLATION: (sub_uuid: string | number, lang: string | number) => `/api/v2/subprograms/${sub_uuid}/translations/${lang}`,
  },
  users: {
    /** GET — V2 Users */
    GET_ME: "/api/v2/users/me",
    /** PATCH — V2 Users */
    UPDATE_ME: "/api/v2/users/me",
    /** DELETE — V2 Users */
    DELETE_AVATAR: "/api/v2/users/me/avatar",
    /** POST — V2 Users */
    UPLOAD_AVATAR: "/api/v2/users/me/avatar",
    /** POST — V2 Users */
    SET_DEFAULT_AVATAR: "/api/v2/users/me/avatar/default",
    /** POST — V2 Users */
    UPLOAD_AVATAR_FROM_URL: "/api/v2/users/me/avatar/from-url",
  },
} as const;

export type V2EndpointFeature = keyof typeof V2_ENDPOINTS_GENERATED;
