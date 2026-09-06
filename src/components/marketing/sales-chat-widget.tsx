"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircleIcon, SendIcon, XIcon } from "lucide-react";

type ChatMessage = { role: "user" | "model"; text: string };

const GREETING: ChatMessage = {
  role: "model",
  text: "¡Hola! Soy el asistente de YAA 👋 ¿Qué querés saber sobre precios, funciones o cómo armar tu tienda?",
};

export function SalesChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
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
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");
      setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "No pudimos responder ahora mismo — escribinos a hola@yaa.com.ar." },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar chat" : "Abrir chat de YAA"}
        className="fixed bottom-5 left-5 z-[100] flex size-14 items-center justify-center rounded-full bg-[#ff5a36] text-white shadow-[0_12px_36px_rgba(255,90,54,0.35)] transition duration-300 hover:-translate-y-1 hover:bg-[#e84220] sm:bottom-7 sm:left-7"
      >
        {open ? <XIcon className="size-6" /> : <MessageCircleIcon className="size-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 left-5 z-[100] flex h-[70vh] max-h-[520px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl bg-[#0b1220] shadow-2xl ring-1 ring-white/10 sm:bottom-28 sm:left-7">
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
