export type Env = "demo" | "prod" | "sandbox";

export function baseUrl(env: Env): string {
  if (env === "prod") return "https://api.airwallex.com";
  return "https://api-demo.airwallex.com";
}
// note: Airwallex demo/sandbox share the same host. `api.sandbox.airwallex.com`
// also works but resolves to the same environment. We use `api-demo` since the
// SDK is initialized with `env: 'demo'` and this pairing is documented.

export async function login(env: Env, clientId: string, apiKey: string) {
  const res = await fetch(`${baseUrl(env)}/api/v1/authentication/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": clientId,
      "x-api-key": apiKey,
    },
    cache: "no-store",
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

export function uuid(): string {
  const g: any = globalThis;
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  return "req_" + Date.now() + "_" + Math.random().toString(16).slice(2, 10);
}

export function jsonError(status: number, message: string, detail?: unknown) {
  return new Response(
    JSON.stringify({ error: message, detail: detail ?? null }),
    { status, headers: { "Content-Type": "application/json" } },
  );
}
