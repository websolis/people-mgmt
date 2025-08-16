"use client";
import React from "react";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "px-3 py-2 rounded-md border border-black/10 shadow-sm hover:bg-black/5 " +
        (props.className ?? "")
      }
    />
  );
}
