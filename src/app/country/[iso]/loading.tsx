// src/app/country/[iso]/loading.tsx
export default function LoadingCountry() {
  return (
    <main className="p-8 space-y-4">
      <div className="animate-pulse h-6 w-64 bg-gray-200 rounded" />
      <div className="space-y-2">
        <div className="animate-pulse h-4 w-48 bg-gray-200 rounded" />
        <div className="animate-pulse h-4 w-80 bg-gray-200 rounded" />
      </div>
    </main>
  );
}
