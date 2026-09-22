export function generateUniqueTitle(prefix = 'task'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);

  return `${prefix}-${timestamp}-${random}`;
}
