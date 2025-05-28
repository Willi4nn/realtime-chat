import { Timestamp } from "firebase/firestore";

export function formatTime(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false, });
}
