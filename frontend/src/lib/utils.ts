/**
 * Simple conditional class names merger.
 */
export function cn(...classes: (string | boolean | undefined | null | {[key: string]: boolean})[]) {
  const result: string[] = [];
  
  for (const item of classes) {
    if (!item) continue;
    if (typeof item === 'string') {
      result.push(item);
    } else if (typeof item === 'object') {
      for (const [key, value] of Object.entries(item)) {
        if (value) {
          result.push(key);
        }
      }
    }
  }
  
  return result.join(' ');
}

/**
 * Format date string into a localized readable date.
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format ISO-8601 warning conflict time string to readable interval.
 */
export function formatConflictTime(conflictTime?: string | null): string {
  if (!conflictTime) return 'N/A';
  // Example: 2026-06-15T12:00:00Z to 2026-06-15T13:00:00Z
  const parts = conflictTime.split(' to ');
  if (parts.length !== 2) return conflictTime;
  
  try {
    const start = new Date(parts[0]);
    const end = new Date(parts[1]);
    const dateStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const startTimeStr = start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} (${startTimeStr} - ${endTimeStr})`;
  } catch {
    return conflictTime;
  }
}
