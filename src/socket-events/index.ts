/**
 * Socket.IO event name constants for real-time consultation messaging.
 *
 * Backend: app/infrastructure/websocket/ in mini-back
 *
 * Used by sitimmApp (socketService.ts) and new_dashboard (useConsultationSocket.ts).
 *
 * Connection: wss://{host}/ws/socket.io (SOCKET_CONFIG.PATH)
 * Auth: JWT token passed in `auth.token` on connect.
 * Rooms: Each consultation has a room named by its UUID.
 *
 * For event payload types, see `consultations` module (Ws*Payload interfaces).
 */

// -- Server -> Client events --

/**
 * Events emitted by the server to connected clients.
 * Each event has a typed payload — see `consultations` module for Ws*Payload interfaces.
 */
export const SERVER_EVENTS = {
  /** New or replayed message. Payload: WsNewMessagePayload. */
  NEW_MESSAGE: "new_message",
  /** Advisor took a consultation. Payload: WsConsultationTakenPayload. Triggers state 1→2. */
  CONSULTATION_TAKEN: "consultation_taken",
  /** Advisor proposed closing. Payload: WsCloseProposedPayload. Triggers state 2→4 or 5→4. */
  CLOSE_PROPOSED: "close_proposed",
  /** Employee confirmed closure. Payload: WsCloseConfirmedPayload. Triggers state 4→3. */
  CLOSE_CONFIRMED: "close_confirmed",
  /** Employee rejected close proposal. Payload: WsCloseRejectedPayload. Triggers state 4→5. */
  CLOSE_REJECTED: "close_rejected",
  /** Employee rated a closed consultation. Payload: WsConsultationRatedPayload. */
  CONSULTATION_RATED: "consultation_rated",
  /** Celery auto-expired a proposal (72h TTL). Payload: WsAutoExpiredPayload. */
  AUTO_EXPIRED: "auto_expired",
  /** User joined/left a room. Payload: WsPresencePayload { user_id, status }. */
  PRESENCE: "presence",
  /** User started typing. Payload: WsTypingPayload { user_id, consultation_uuid }. */
  TYPING_START: "typing_start",
  /** User stopped typing. Payload: WsTypingPayload { user_id, consultation_uuid }. */
  TYPING_STOP: "typing_stop",
  /** Read receipt relay. Payload: WsAckPayload { user_id, message_uuid, consultation_uuid }. */
  ACK: "ack",
  /** Heartbeat response. No payload (empty). */
  PONG: "pong",
  /** Server error. Payload: WsErrorPayload { message }. */
  ERROR: "error",
} as const;

// -- Client -> Server events --

/**
 * Events emitted by the client to the server.
 *
 * - `join_consultation` — Send `{ consultation_uuid }` to join a room. Server replays recent messages.
 * - `leave_consultation` — Send `{ consultation_uuid }` to leave a room.
 * - `typing_start` / `typing_stop` — Send `{ consultation_uuid }`. Server broadcasts to others (skip_sid).
 * - `ack` — Send `{ consultation_uuid, message_uuid }` as read receipt.
 * - `ping` — Heartbeat. Server responds with "pong". Send every HEARTBEAT_INTERVAL_MS.
 */
export const CLIENT_EVENTS = {
  /** Join a consultation room. Send: { consultation_uuid: string }. */
  JOIN_CONSULTATION: "join_consultation",
  /** Leave a consultation room. Send: { consultation_uuid: string }. */
  LEAVE_CONSULTATION: "leave_consultation",
  /** Start typing indicator. Send: { consultation_uuid: string }. */
  TYPING_START: "typing_start",
  /** Stop typing indicator. Send: { consultation_uuid: string }. */
  TYPING_STOP: "typing_stop",
  /** Read receipt. Send: { consultation_uuid: string, message_uuid: string }. */
  ACK: "ack",
  /** Heartbeat ping. Send: empty. Server responds with "pong". */
  PING: "ping",
} as const;

/**
 * Events that indicate a consultation state change.
 * Use this to trigger cache invalidation (RTK Query tag invalidation, etc.).
 */
export const STATE_CHANGE_EVENTS = [
  SERVER_EVENTS.CONSULTATION_TAKEN,
  SERVER_EVENTS.CLOSE_PROPOSED,
  SERVER_EVENTS.CLOSE_CONFIRMED,
  SERVER_EVENTS.CLOSE_REJECTED,
  SERVER_EVENTS.CONSULTATION_RATED,
  SERVER_EVENTS.AUTO_EXPIRED,
] as const;

export type ServerEvent = (typeof SERVER_EVENTS)[keyof typeof SERVER_EVENTS];
export type ClientEvent = (typeof CLIENT_EVENTS)[keyof typeof CLIENT_EVENTS];
export type StateChangeEvent = (typeof STATE_CHANGE_EVENTS)[number];

/**
 * Socket.IO connection configuration shared across frontends.
 * These values must match mini-back's socketio_app.py configuration.
 */
export const SOCKET_CONFIG = {
  /** WebSocket path (appended to the base URL). Backend: socketio.ASGIApp mount path. */
  PATH: "/ws/socket.io",
  /** Client heartbeat interval in ms. Send "ping" at this rate. Backend PRESENCE_TTL = 35s. */
  HEARTBEAT_INTERVAL_MS: 25_000,
  /** Typing indicator timeout in ms. Auto-stop typing after this duration of inactivity. */
  TYPING_TIMEOUT_MS: 3_000,
} as const;
