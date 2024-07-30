import type { Metadata } from "next";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "demo",
};

export default function DemoLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <section>
        {children}
      </section>
    )
  }