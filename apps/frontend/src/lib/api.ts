import "server-only";
import { API_URL } from "./env";

type GetOpts = {
  revalidate?: number;
  noStore?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
};

function buildQuery(q: GetOpts["query"]) {
  if (!q) return "";
  const p = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v == undefined) return;
    p.set(k, String(v));
  });
  const s = p.toString();

  return s ? `?${s}` : "";
}

export async function apiGET<T>(path: string, opts: GetOpts = {}): Promise<T> {
  const url = `${API_URL}${path}${buildQuery(opts.query)}`;
  const nextConfig = opts.noStore
    ? { cache: "no-store" as const }
    : { next: { revalidate: opts.revalidate } };

  const res = await fetch(url, {
    ...nextConfig,
    headers: {
      Accept: "Application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GET  ${path} ${res.status}: ${body || res.statusText} `);
  }
  return (await res.json()) as T;
}
