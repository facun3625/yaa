"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

export function YaaFaqList({ items }: { items: string[][] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const listId = useId();

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white px-5 shadow-[0_14px_40px_rgba(29,23,19,.04)] md:px-7">
      {items.map(([question, answer], index) => {
        const open = openIndex === index;
        const contentId = `${listId}-answer-${index}`;
        return (
          <div key={question} className={index ? "border-t border-black/10" : ""}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={contentId}
              onClick={() => setOpenIndex(open ? null : index)}
              className="group flex w-full items-center justify-between gap-6 py-5 text-left font-bold outline-none transition-colors hover:text-[#e84220] focus-visible:text-[#e84220]"
            >
              <span>{question}</span>
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${open ? "rotate-180 bg-[#ff5a36] text-white" : "bg-[#ff5a36]/10 text-[#e84220] group-hover:bg-[#ff5a36]/20"}`}>
                <ChevronDown className="size-4" />
              </span>
            </button>
            <div
              id={contentId}
              className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <p className={`max-w-3xl pr-10 text-sm leading-relaxed text-black/55 transition-[padding] duration-500 motion-reduce:transition-none ${open ? "pb-6" : "pb-0"}`}>{answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
