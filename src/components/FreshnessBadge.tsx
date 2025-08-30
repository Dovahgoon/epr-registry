// e.g., src/components/FreshnessBadge.tsx
export function FreshnessBadge({ generatedAt }: { generatedAt?: string }) {
  if (!generatedAt) return null;
  const d = new Date(generatedAt);
  return <span className="rounded-full px-3 py-1 text-xs bg-white/5">
    Data updated: {d.toLocaleDateString()}
  </span>;
}
