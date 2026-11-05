export const ROOM_PLANNER_CONTACT_STORAGE_KEY = "dlmns-room-planner-contact-handoff-v1";

export interface RoomPlannerContactHandoff {
  subject: string;
  message: string;
}

export function storeRoomPlannerContactHandoff(handoff: RoomPlannerContactHandoff) {
  try {
    window.sessionStorage.setItem(ROOM_PLANNER_CONTACT_STORAGE_KEY, JSON.stringify(handoff));
  } catch {
    // Die Navigation bleibt auch bei blockiertem Browser-Speicher nutzbar.
  }
}

export function readRoomPlannerContactHandoff(): RoomPlannerContactHandoff | null {
  let stored: string | null;
  try {
    stored = window.sessionStorage.getItem(ROOM_PLANNER_CONTACT_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!stored) return null;

  try {
    const value = JSON.parse(stored) as Partial<RoomPlannerContactHandoff>;
    if (typeof value.subject !== "string" || typeof value.message !== "string") return null;
    return { subject: value.subject.slice(0, 200), message: value.message.slice(0, 5000) };
  } catch {
    clearRoomPlannerContactHandoff();
    return null;
  }
}

export function clearRoomPlannerContactHandoff() {
  try {
    window.sessionStorage.removeItem(ROOM_PLANNER_CONTACT_STORAGE_KEY);
  } catch {
    // Bereits blockierter Speicher muss nicht bereinigt werden.
  }
}
