import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const dateFormatter = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" });

type Subscriber = {
  id: string;
  createdAt: Date;
  user: { name: string | null; email: string };
};

// Una fila por dispositivo/navegador suscripto, no por persona: si un
// cliente activó notificaciones en el celu y en la compu, aparece dos
// veces — es lo mismo que cuenta "Enviar a N clientes" en la otra pestaña.
export function SubscribersTable({ subscribers }: { subscribers: Subscriber[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      {subscribers.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Todavía nadie activó notificaciones.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Activadas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>{sub.user.name || "Sin nombre"}</TableCell>
                <TableCell>{sub.user.email}</TableCell>
                <TableCell>{dateFormatter.format(sub.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
