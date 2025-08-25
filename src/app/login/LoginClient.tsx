"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginClient() {
  const sessionApi: any = (useSession as any)?.();
  const session = sessionApi?.data ?? null;
  const status: string = sessionApi?.status ?? "unauthenticated";

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4 rounded-2xl border p-6 bg-white">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="text-sm text-slate-600">
        Status: <span className="font-mono">{status}</span>
      </p>
      {session ? (
        <div className="space-y-3">
          <p className="text-sm">
            Signed in as{" "}
            <strong>{session.user?.email ?? session.user?.name ?? "user"}</strong>
          </p>
          <button
            onClick={() => signOut()}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm">You are not signed in.</p>
          <button
            onClick={() => signIn()}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
          >
            Sign in
          </button>
        </div>
      )}
    </div>
  );
}
