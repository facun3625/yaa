import { Suspense } from "react";
import { PlatformLoginForm } from "./login-form";

export default function PlatformLoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-semibold">Panel de plataforma</h1>
        <p className="text-sm text-muted-foreground">Acceso solo para administración</p>
      </div>
      <Suspense>
        <PlatformLoginForm />
      </Suspense>
    </div>
  );
}
