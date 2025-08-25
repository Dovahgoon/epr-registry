
// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="hero">
      <div>
        <h1>404 — Page not found</h1>
        <p className="muted">The page you’re looking for doesn’t exist.</p>
      </div>
      <Link href="/" className="btn">Go home</Link>
    </div>
  );
}
