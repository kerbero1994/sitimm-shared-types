/**
 * Event types — V2 participant system.
 *
 * Backend: app/presentation/schemas/event.py (V2 endpoints)
 */

export interface EventParticipantV2 {
  uuid: string;
  event_uuid: string;
  user_uuid: string;
  modality: "presencial" | "virtual" | "mixto";
  status: "registered" | "confirmed" | "cancelled";
  campus_uuid: string | null;
  bus_stop_uuid: string | null;
  is_alternative: boolean;
  confirmation_date: string | null;
  created_at: string;
  updated_at: string;
  event: {
    uuid: string;
    title: string;
    date_start: string;
    date_end: string;
    location: string | null;
    image_url: string | null;
    modality: string;
  };
}

export interface CreateParticipantV2Request {
  event_uuid: string;
  modality: "presencial" | "virtual" | "mixto";
  campus_uuid?: string;
  bus_stop_uuid?: string;
  is_alternative?: boolean;
}

export interface UpdateParticipantV2Request {
  uuid: string;
  modality?: "presencial" | "virtual" | "mixto";
  campus_uuid?: string;
  bus_stop_uuid?: string;
}

export interface DeleteParticipantV2Request {
  uuid: string;
}

export interface ConfirmParticipantV2Request {
  uuid: string;
}

export interface MyEventsV2Response {
  participants: EventParticipantV2[];
  total: number;
}
