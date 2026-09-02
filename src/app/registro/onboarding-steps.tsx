import Image from "next/image";
import { cn } from "@/lib/utils";

const STEPS = ["Cuenta", "Plan", "Tu tienda"];

export function OnboardingSteps({ current }: { current: number }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <Image src="/yaa-logo-clean.svg" alt="YAA" width={835} height={478} className="h-8 w-auto object-contain" priority />
      <div className="mx-auto flex w-full max-w-md items-center justify-between">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  done ? "bg-[#ff5a36] text-white" : active ? "bg-[#ff5a36]/20 text-[#ff7658] ring-1 ring-[#ff5a36]" : "bg-white/5 text-white/40",
                )}
              >
                {step}
              </span>
              <span className={cn("text-[10px] font-medium", active || done ? "text-white/80" : "text-white/35")}>{label}</span>
            </div>
            {step < STEPS.length && (
              <span className={cn("mx-2 h-px flex-1", done ? "bg-[#ff5a36]" : "bg-white/10")} />
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
