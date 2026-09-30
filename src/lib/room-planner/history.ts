export type History<T> = { past: T[]; present: T; future: T[] };
export const createHistory = <T,>(initial: T): History<T> => ({ past: [], present: initial, future: [] });
export function commit<T>(history: History<T>, next: T): History<T> {
  return next === history.present ? history : { past: [...history.past, history.present], present: next, future: [] };
}
export function undo<T>(history: History<T>): History<T> {
  if (!history.past.length) return history;
  return { past: history.past.slice(0, -1), present: history.past.at(-1)!, future: [history.present, ...history.future] };
}
export function redo<T>(history: History<T>): History<T> {
  if (!history.future.length) return history;
  return { past: [...history.past, history.present], present: history.future[0], future: history.future.slice(1) };
}
