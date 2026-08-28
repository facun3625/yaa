"use client";

import { useEffect, useRef, useState } from "react";

type Direction = "left" | "right" | "up";

const hiddenClass: Record<Direction, string> = {
  left: "-translate-x-10",
  right: "translate-x-10",
  up: "translate-y-8",
};

export function YaaReveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.unobserve(entry.target);
      },
      { threshold: 0.12, rootMargin: "0px 0px -7%" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transform-gpu transition-[opacity,transform] duration-700 ease-out motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
        visible ? "translate-x-0 translate-y-0 opacity-100" : `${hiddenClass[direction]} opacity-0`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
