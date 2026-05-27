#!/usr/bin/env node
/**
 * Convert mini-back V2 routes JSON into a typed TS constants module.
 *
 * Invoked by ``scripts/import-v2-endpoints.sh``. Do not run directly unless
 * you know what you are doing.
 *
 * Args:
 *   process.argv[2] — input JSON path (from ``make dump-v2-routes``)
 *   process.argv[3] — output TS path (usually ``src/endpoints/v2_endpoints_generated.ts``)
 *
 * Generated file layout:
 *   - Feature key = first path segment after ``/api/v2/``, camelCased.
 *   - Each leaf is either a literal string (no path params) or a function
 *     builder ``(uuid: string) => string`` for parameterised paths.
 *   - Endpoint key = SCREAMING_SNAKE_CASE derived from the route name when
 *     unique inside the feature, else from the path tail + method.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [, , inputPathArg, outputPathArg] = process.argv;

if (!inputPathArg || !outputPathArg) {
  console.error(
    "Usage: import-v2-endpoints.mjs <input-json> <output-ts>",
  );
  process.exit(1);
}

const inputPath = resolve(inputPathArg);
const outputPath = resolve(outputPathArg);

const raw = JSON.parse(readFileSync(inputPath, "utf8"));

if (!Array.isArray(raw.routes)) {
  console.error("ERROR: input JSON missing `routes` array");
  process.exit(2);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Convert a string like ``event-participants`` or ``advisor_assignments``
 * into the camelCase feature key ``eventParticipants`` / ``advisorAssignments``.
 */
function toCamelCase(segment) {
  return segment
    .toLowerCase()
    .replace(/[-_]+(.)/g, (_, ch) => ch.toUpperCase());
}

/**
 * Convert a string into SCREAMING_SNAKE_CASE suitable for a TS constant key.
 */
function toScreamingSnakeCase(value) {
  return value
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toUpperCase()
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Quote a TS string literal — single line, no template literals.
 */
function tsString(value) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`;
}

/**
 * Extract param names from a FastAPI path template (``{uuid}``, ``{slug}``).
 */
function extractParams(path) {
  const params = [];
  for (const match of path.matchAll(/\{(\w+)\}/g)) {
    params.push(match[1]);
  }
  return params;
}

/**
 * Convert ``/api/v2/events/{uuid}/clone`` → template-literal body
 * ``/api/v2/events/${uuid}/clone`` for use inside a backtick literal.
 */
function pathToTemplateLiteral(path) {
  return path.replace(/\{(\w+)\}/g, (_, name) => `\${${name}}`);
}

/**
 * Derive the feature group from a path.
 *
 * Special cases:
 *  - ``/api/v2/{entity_type}/...`` → ``polymorphic``
 *  - ``/api/v2/me/<rest>/...`` → ``me<Rest>`` (e.g. me/engagement → meEngagement)
 *  - everything else → camelCase of the first segment
 */
function featureKey(path) {
  const stripped = path.replace(/^\/api\/v2\//, "");
  const [first, second] = stripped.split("/");

  if (first === "{entity_type}") {
    return "polymorphic";
  }

  if (first === "me" && second) {
    // me/faq-bookmarks → meFaqBookmarks
    return toCamelCase(`me-${second}`);
  }

  return toCamelCase(first);
}

/**
 * Build an endpoint constant key for a route.
 *
 * Preference order:
 *  1. Use the route ``name`` (function name) if non-empty and unique.
 *  2. Fall back to path tail + method.
 */
function endpointKey(route, usedKeys) {
  const candidate = route.name ? toScreamingSnakeCase(route.name) : "";
  if (candidate && !usedKeys.has(candidate)) {
    usedKeys.add(candidate);
    return candidate;
  }

  // Fallback — derive from path + method.
  const tail = route.path.replace(/^\/api\/v2\//, "").replace(/\{(\w+)\}/g, "$1");
  const tailKey = toScreamingSnakeCase(tail);
  const method = route.methods[0] || "GET";
  let key = `${method}_${tailKey}`;
  let i = 2;
  while (usedKeys.has(key)) {
    key = `${method}_${tailKey}_${i++}`;
  }
  usedKeys.add(key);
  return key;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Grouping
 * ────────────────────────────────────────────────────────────────────────── */

/** @type {Map<string, {key: string, route: any, paramList: string[]}[]>} */
const grouped = new Map();

// One entry per (path, method) — each FastAPI route may bundle multiple methods.
const flattened = [];
for (const r of raw.routes) {
  for (const method of r.methods) {
    flattened.push({ ...r, methods: [method] });
  }
}

flattened.sort((a, b) =>
  a.path === b.path
    ? a.methods[0].localeCompare(b.methods[0])
    : a.path.localeCompare(b.path),
);

const featureKeyCollisions = new Map(); // feature → Set<endpointKey>

for (const route of flattened) {
  const feature = featureKey(route.path);
  if (!grouped.has(feature)) {
    grouped.set(feature, []);
    featureKeyCollisions.set(feature, new Set());
  }
  const used = featureKeyCollisions.get(feature);
  const key = endpointKey(route, used);
  grouped.get(feature).push({
    key,
    route,
    paramList: extractParams(route.path),
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * Emit
 * ────────────────────────────────────────────────────────────────────────── */

const generatedAt = raw.generated_at || new Date().toISOString();
const sourceVersion = raw.version || "unknown";
const routeCount = raw.route_count || flattened.length;

const lines = [];
lines.push("/* AUTO-GENERATED — do not edit by hand.");
lines.push(" * Source: mini-back ``scripts/dump_v2_routes.py``");
lines.push(" * Regenerate via:");
lines.push(" *   cd <mini-back> && make dump-v2-routes");
lines.push(" *   cd <sitimm-shared-types> && ./scripts/import-v2-endpoints.sh");
lines.push(" *");
lines.push(` * Source version : ${sourceVersion}`);
lines.push(` * Generated at   : ${generatedAt}`);
lines.push(` * Route count    : ${routeCount} (${flattened.length} method-rows across ${grouped.size} feature groups)`);
lines.push(" *");
lines.push(" * Path params (e.g. {uuid}, {id}, {slug}) are emitted as");
lines.push(" * arrow-function builders: ``(uuid: string) => string``.");
lines.push(" */");
lines.push("");
lines.push("export const V2_ENDPOINTS_GENERATED = {");

const sortedFeatures = [...grouped.keys()].sort();

for (const feature of sortedFeatures) {
  const entries = grouped.get(feature);
  lines.push(`  ${feature}: {`);
  for (const { key, route, paramList } of entries) {
    const method = route.methods[0];
    const tags = (route.tags || []).join(", ");
    const meta = `${method} — ${tags || "(no tag)"}${route.operationId ? ` [${route.operationId}]` : ""}`;
    lines.push(`    /** ${meta} */`);

    if (paramList.length === 0) {
      lines.push(`    ${key}: ${tsString(route.path)},`);
    } else {
      const signature = paramList
        .map((p) => `${p}: string | number`)
        .join(", ");
      const body = pathToTemplateLiteral(route.path);
      lines.push(`    ${key}: (${signature}) => \`${body}\`,`);
    }
  }
  lines.push("  },");
}

lines.push("} as const;");
lines.push("");
lines.push("export type V2EndpointFeature = keyof typeof V2_ENDPOINTS_GENERATED;");
lines.push("");

writeFileSync(outputPath, lines.join("\n"), "utf8");

console.log(
  `Wrote ${flattened.length} routes across ${grouped.size} feature groups to ${outputPath}`,
);
