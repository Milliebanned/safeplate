/** "Hummus & Pita" → "hummus-pita", for stable data-testid values. */
export function testIdFor(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
