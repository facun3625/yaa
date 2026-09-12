"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendCustomerBroadcast } from "./actions";

export function NotificationForm({ subscriberCount }: { subscriberCount: number }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const { sent } = await sendCustomerBroadcast(formData);
        if (sent === 0) {
          toast.error("Nadie recibió el mensaje — todavía no hay clientes con notificaciones activadas.");
          return;
        }
        toast.success(`Enviado a ${sent} cliente${sent === 1 ? "" : "s"}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "No se pudo enviar");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" maxLength={60} required placeholder="Ej: ¡Tenemos promo!" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="body">Mensaje</Label>
        <Textarea id="body" name="body" maxLength={160} required placeholder="Ej: 2x1 en pizzas hasta las 22hs 🍕" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="url">Link (opcional)</Label>
        <Input id="url" name="url" placeholder="/ (por defecto abre el inicio de la tienda)" />
      </div>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Enviando..." : `Enviar a ${subscriberCount} cliente${subscriberCount === 1 ? "" : "s"}`}
      </Button>
    </form>
  );
}
