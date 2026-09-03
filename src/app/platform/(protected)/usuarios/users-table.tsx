"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";

import { useAdminTheme } from "@/components/admin/admin-theme-root";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DeleteUserButton } from "./delete-user-button";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  referralCode: string | null;
  resellerDeactivatedAt: string | null;
  tenant: { id: string; subdomain: string } | null;
};

type AccountType = "all" | "customer" | "store" | "store_reseller" | "reseller" | "super_admin";
type ResellerStatus = "all" | "active" | "inactive";
type Age = "all" | "7" | "30" | "90";
type Sort = "newest" | "oldest" | "name" | "email" | "store";

const dateFormatter = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" });

function normalize(value: string | null | undefined) {
  return value?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim() ?? "";
}

function accountType(user: UserRow): Exclude<AccountType, "all"> {
  if (user.role === "SUPER_ADMIN") return "super_admin";
  const hasStore = user.role === "ADMIN" && Boolean(user.tenant);
  const isReseller = Boolean(user.referralCode);
  if (hasStore && isReseller) return "store_reseller";
  if (hasStore) return "store";
  if (isReseller) return "reseller";
  return "customer";
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const { containerRef } = useAdminTheme();
  const [mountedAt] = useState(() => Date.now());
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [type, setType] = useState<AccountType>("all");
  const [store, setStore] = useState("all");
  const [resellerStatus, setResellerStatus] = useState<ResellerStatus>("all");
  const [age, setAge] = useState<Age>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const deferredQuery = useDeferredValue(query);

  const stores = useMemo(
    () => Array.from(new Map(users.flatMap((user) => user.tenant ? [[user.tenant.id, user.tenant.subdomain] as const] : [])))
      .sort((a, b) => a[1].localeCompare(b[1], "es")),
    [users],
  );

  const suggestions = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return users
      .filter((user) => [user.name, user.email, user.tenant?.subdomain, user.referralCode].some((value) => normalize(value).includes(q)))
      .slice(0, 6);
  }, [query, users]);

  const filtered = useMemo(() => {
    const q = normalize(deferredQuery);
    const minimumDate = age === "all" ? null : mountedAt - Number(age) * 86_400_000;
    const result = users.filter((user) => {
      const userType = accountType(user);
      const matchesQuery = !q || [user.name, user.email, user.tenant?.subdomain, user.referralCode]
        .some((value) => normalize(value).includes(q));
      const matchesType = type === "all" || userType === type;
      const matchesStore = store === "all" || user.tenant?.id === store;
      const matchesReseller = resellerStatus === "all"
        || (Boolean(user.referralCode) && (resellerStatus === "inactive") === Boolean(user.resellerDeactivatedAt));
      const matchesAge = minimumDate === null || new Date(user.createdAt).getTime() >= minimumDate;
      return matchesQuery && matchesType && matchesStore && matchesReseller && matchesAge;
    });

    return result.sort((a, b) => {
      if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
      if (sort === "name") return (a.name ?? "").localeCompare(b.name ?? "", "es");
      if (sort === "email") return a.email.localeCompare(b.email, "es");
      if (sort === "store") return (a.tenant?.subdomain ?? "zzzz").localeCompare(b.tenant?.subdomain ?? "zzzz", "es");
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [age, deferredQuery, mountedAt, resellerStatus, sort, store, type, users]);

  const hasFilters = Boolean(query) || type !== "all" || store !== "all" || resellerStatus !== "all" || age !== "all" || sort !== "newest";

  function clearFilters() {
    setQuery("");
    setType("all");
    setStore("all");
    setResellerStatus("all");
    setAge("all");
    setSort("newest");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border bg-card/30 p-3">
        <div className="relative max-w-xl">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 150)}
            placeholder="Buscar por nombre, email, tienda o código..."
            className="bg-background pl-9 pr-9"
            autoComplete="off"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Limpiar búsqueda" className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
              <XIcon className="size-4" />
            </button>
          )}
          {focused && suggestions.length > 0 && (
            <div className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-30 overflow-hidden rounded-lg border bg-popover shadow-xl">
              {suggestions.map((user) => (
                <button key={user.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setQuery(user.email); setFocused(false); }} className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-muted">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{user.name ?? "Sin nombre"}</span>
                    <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                  </span>
                  {user.tenant && <Badge className="shrink-0" variant="secondary">{user.tenant.subdomain}</Badge>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
          <Select value={type} onValueChange={(value) => setType(value as AccountType)}>
            <SelectTrigger size="sm" className="bg-background"><SelectValue placeholder="Tipo de cuenta" /></SelectTrigger>
            <SelectContent container={containerRef} alignItemWithTrigger={false}>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="customer">Cliente</SelectItem>
              <SelectItem value="store">Tienda</SelectItem>
              <SelectItem value="store_reseller">Tienda + revendedor</SelectItem>
              <SelectItem value="reseller">Revendedor</SelectItem>
              <SelectItem value="super_admin">Super admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={store} onValueChange={(value) => setStore(String(value))}>
            <SelectTrigger size="sm" className="bg-background"><SelectValue placeholder="Tienda" /></SelectTrigger>
            <SelectContent container={containerRef} alignItemWithTrigger={false}>
              <SelectItem value="all">Todas las tiendas</SelectItem>
              {stores.map(([id, subdomain]) => <SelectItem key={id} value={id}>{subdomain}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={resellerStatus} onValueChange={(value) => setResellerStatus(value as ResellerStatus)}>
            <SelectTrigger size="sm" className="bg-background"><SelectValue placeholder="Revendedores" /></SelectTrigger>
            <SelectContent container={containerRef} alignItemWithTrigger={false}>
              <SelectItem value="all">Cualquier estado</SelectItem>
              <SelectItem value="active">Revendedores activos</SelectItem>
              <SelectItem value="inactive">Revendedores desactivados</SelectItem>
            </SelectContent>
          </Select>

          <Select value={age} onValueChange={(value) => setAge(value as Age)}>
            <SelectTrigger size="sm" className="bg-background"><SelectValue placeholder="Fecha de alta" /></SelectTrigger>
            <SelectContent container={containerRef} alignItemWithTrigger={false}>
              <SelectItem value="all">Cualquier fecha</SelectItem>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(value) => setSort(value as Sort)}>
            <SelectTrigger size="sm" className="bg-background"><SelectValue placeholder="Orden" /></SelectTrigger>
            <SelectContent container={containerRef} alignItemWithTrigger={false}>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="oldest">Más antiguos</SelectItem>
              <SelectItem value="name">Nombre A–Z</SelectItem>
              <SelectItem value="email">Email A–Z</SelectItem>
              <SelectItem value="store">Tienda A–Z</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && <Button type="button" variant="ghost" size="sm" onClick={clearFilters}><XIcon className="size-3.5" />Limpiar</Button>}
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>Mostrando {filtered.length} de {users.length} {users.length === 1 ? "cuenta" : "cuentas"}</span>
        {deferredQuery !== query && <span>Buscando…</span>}
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader><TableRow><TableHead>Usuario</TableHead><TableHead>Servicios</TableHead><TableHead>Alta</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.map((user) => {
              const userType = accountType(user);
              const hasStore = userType === "store" || userType === "store_reseller";
              const isReseller = userType === "reseller" || userType === "store_reseller";
              const isSuperAdmin = userType === "super_admin";
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium"><div className="flex flex-col"><span>{user.name ?? "Sin nombre"}</span><span className="text-xs font-normal text-muted-foreground">{user.email}</span></div></TableCell>
                  <TableCell><div className="flex flex-wrap gap-1.5">
                    {isSuperAdmin && <Badge variant="outline">Super admin</Badge>}
                    {hasStore && user.tenant && <Link href={`/platform/tiendas/${user.tenant.id}`}><Badge>Tienda: {user.tenant.subdomain}</Badge></Link>}
                    {isReseller && <Badge variant="secondary" className={cn(user.resellerDeactivatedAt && "opacity-60")}>Revendedor{user.resellerDeactivatedAt ? " (desactivado)" : ""}</Badge>}
                    {userType === "customer" && <Badge variant="outline">Cliente</Badge>}
                  </div></TableCell>
                  <TableCell className="text-muted-foreground">{dateFormatter.format(new Date(user.createdAt))}</TableCell>
                  <TableCell className="text-right">{isSuperAdmin ? <span className="text-xs text-muted-foreground">—</span> : <DeleteUserButton userId={user.id} label={user.name ?? user.email} hasStore={hasStore} isReseller={isReseller} />}</TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && <TableRow><TableCell colSpan={4} className="h-28 text-center text-muted-foreground">No hay usuarios que coincidan con esos filtros.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
