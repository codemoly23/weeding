/** Strip HTML tags and compute reading time at 200 wpm. Returns minutes as a number. */
export function calculateReadingTime(text: string | null): number {
  if (!text) return 1;
  const words = text.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
