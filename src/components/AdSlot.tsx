// Inactive until the owner configures consent and approves a real provider.
export function AdSlot({
  enabled = false,
  filled = false,
}: {
  enabled?: boolean;
  filled?: boolean;
}) {
  if (!enabled || !filled) return null;
  return <aside aria-label="Advertisement" style={{ minHeight: 250 }} />;
}
