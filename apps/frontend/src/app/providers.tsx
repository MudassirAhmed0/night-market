"use client";

import { RQProvider } from "@/lib/rq";
import { DehydratedState } from "@tanstack/react-query";
import { ReactNode } from "react";

export default function Providers({
  children,
  state,
}: {
  children: ReactNode;
  state: DehydratedState | null | undefined;
}) {
  return <RQProvider state={state}>{children}</RQProvider>;
}
