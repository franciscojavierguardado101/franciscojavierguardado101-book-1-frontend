const AP_MONTHS = [
  "Jan.", "Feb.", "March", "April", "May", "June",
  "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec.",
];

export function formatApDate(iso: string): string {
  const d = new Date(iso);
  return `${AP_MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function stripHtmlAndTruncate(html: string, max: number): string {
  const plain = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  const cut = plain.lastIndexOf(" ", max);
  return plain.slice(0, cut > 0 ? cut : max) + "…";
}
