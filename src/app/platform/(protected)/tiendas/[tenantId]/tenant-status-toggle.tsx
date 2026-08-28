"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setTenantStatus } from "./actions";

export function TenantStatusToggle({
  tenantId,
  status,
}: {
  tenantId: string;
  status: "ACTIVE" | "SUSPENDED";
}) {
  const [pending, startTransition] = useTransition();
  const nextStatus = status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  return (
    <Button
      type="button"
      variant={status === "ACTIVE" ? "outline" : "default"}
      disabled={pending}
      onClick={() => startTransition(() => setTenantStatus(tenantId, nextStatus))}
    >
      {status === "ACTIVE" ? "Suspender tienda" : "Reactivar tienda"}
    </Button>
  );
}
