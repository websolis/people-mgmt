import React from "react";

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/10 p-4 mb-4">
      <div className="font-semibold mb-2">{title}</div>
      <div>{children}</div>
    </div>
  );
}
