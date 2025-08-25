export const dynamic = "force-dynamic";
export const revalidate = false;

import VaultClient from "./VaultClient";

export default function VaultPage() {
  return <VaultClient />;
}
