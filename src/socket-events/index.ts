/**
 * Socket.IO event name constants for real-time consultation messaging.
 *
 * Backend: app/infrastructure/websocket/ in mini-back
 *
 * Used by sitimmApp (socketService.ts) and new_dashboard (useConsultationSocket.ts).
 */

// -- Server -> Client events --

export const SERVER_EVENTS = {
  NEW_MESSAGE: "new_message",
  CONSULTATION_TAKEN: "consultation_taken",
  CLOSE_PROPOSED: "close_proposed",
  CLOSE_CONFIRMED: "close_confirmed",
  CLOSE_REJECTED: "close_rejected",
  CONSULTATION_RATED: "consultation_rated",
  AUTO_EXPIRED: "auto_expired",
  PRESENCE: "presence",
  TYPING_START: "typing_start",
  TYPING_STOP: "typing_stop",
  ACK: "ack",
  PONG: "pong",
  ERROR: "error",
} as const;

// -- Client -> Server events --

export const CLIENT_EVENTS = {
  JOIN_CONSULTATION: "join_consultation",
  LEAVE_CONSULTATION: "leave_consultation",
  TYPING_START: "typing_start",
  TYPING_STOP: "typing_stop",
  ACK: "ack",
  PING: "ping",
} as const;

/** Events that indicate a consultation state change (trigger cache invalidation) */
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

/** Socket.IO connection configuration shared across frontends */
export const SOCKET_CONFIG = {
  PATH: "/ws/socket.io",
  HEARTBEAT_INTERVAL_MS: 25_000,
  TYPING_TIMEOUT_MS: 3_000,
} as const;
