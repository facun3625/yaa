"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircleIcon, SendIcon, XIcon } from "lucide-react";

type ChatMessage = { role: "user" | "model"; text: string; needsHuman?: boolean };

const GREETING: ChatMessage = {
  role: "model",
  text: "¡Hola! Soy el asistente de YAA 👋 ¿Qué querés saber sobre precios, funciones o cómo armar tu tienda?",
};

export function SalesChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || pending) return;

    const next = [...messages, { role: "user", text } as ChatMessage];
    setMessages(next);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/sales-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: "model", text: data.reply, needsHuman: data.needsHuman }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "No pudimos responder ahora mismo — escribinos a hola@yaa.com.ar." },
      ]);
    } finally {
      setPending(false);
    }
  }

  const lastMessage = messages[messages.length - 1];
  const showContactForm = lastMessage?.role === "model" && lastMessage.needsHuman;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar chat" : "Abrir chat de YAA"}
        // Apilado arriba del botón de WhatsApp (que vive en bottom-5/7
        // right-5/7) para no superponerse — los dos quedan del lado derecho.
        className="fixed right-5 bottom-24 z-[100] flex size-14 items-center justify-center rounded-full bg-[#ff5a36] text-white shadow-[0_12px_36px_rgba(255,90,54,0.35)] transition duration-300 hover:-translate-y-1 hover:bg-[#e84220] sm:right-7 sm:bottom-28"
      >
        {open ? <XIcon className="size-6" /> : <MessageCircleIcon className="size-6" />}
      </button>

      {open && (
        <div className="fixed right-5 bottom-[168px] z-[100] flex h-[70vh] max-h-[520px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl bg-[#0b1220] shadow-2xl ring-1 ring-white/10 sm:right-7 sm:bottom-[184px]">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">Asistente de YAA</span>
              <span className="text-xs text-white/50">Responde en segundos</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="text-white/50 hover:text-white">
              <XIcon className="size-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-[#ff5a36] px-3.5 py-2 text-sm text-white"
                    : "mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-white/10 px-3.5 py-2 text-sm text-white"
                }
              >
                {m.text}
              </div>
            ))}
            {pending && (
              <div className="mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-white/10 px-3.5 py-2 text-sm text-white/50">
                Escribiendo…
              </div>
            )}
            {showContactForm && conversationId && (
              <ContactForm conversationId={conversationId} />
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Escribí tu pregunta…"
              disabled={pending}
              className="h-10 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#ff7658] disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={pending || !input.trim()}
              aria-label="Enviar"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#ff5a36] text-white disabled:opacity-40"
            >
              <SendIcon className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ContactForm({ conversationId }: { conversationId: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/sales-bot/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo enviar");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-emerald-500/15 px-3.5 py-2 text-sm text-emerald-300">
        ¡Gracias! Te vamos a escribir por WhatsApp a la brevedad.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mr-auto flex w-[85%] flex-col gap-2 rounded-2xl rounded-bl-sm bg-white/10 p-3">
      <span className="text-xs text-white/60">Dejanos tu nombre y WhatsApp y te contactamos:</span>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre"
        required
        className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#ff7658]"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Tu WhatsApp"
        required
        className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#ff7658]"
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg bg-[#ff5a36] text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}
