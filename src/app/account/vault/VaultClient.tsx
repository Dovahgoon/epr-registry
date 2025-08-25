"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function VaultClient() {
  const sessionApi: any = (useSession as any)?.();
  const session = sessionApi?.data ?? null;

  if (!session) {
    return (
      <div className="max-w-xl mx-auto mt-10 rounded-2xl border bg-white p-6">
        <h1 className="text-xl font-semibold">Vault</h1>
        <p className="mt-2 text-sm text-slate-600">
          This area requires authentication.
        </p>
        <div className="mt-4">
          <Link href="/login" className="underline">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 rounded-2xl border bg-white p-6">
      <h1 className="text-xl font-semibold">Vault</h1>
      <p className="mt-2 text-sm text-slate-600">Secure area (placeholder)</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-4">Document 1</div>
        <div className="rounded-xl border p-4">Document 2</div>
      </div>
    </div>
  );
}
