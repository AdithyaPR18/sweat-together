const RAW_BACKEND = import.meta.env.VITE_BACKEND_URL as string | undefined;
const RAW_WS = import.meta.env.VITE_WS_BACKEND_URL as string | undefined;

function reqEnv(name: string, val?: string) {
  if (!val) throw new Error(`Missing ${name}. Create a .env with ${name}=... and restart dev server.`);
  return val.replace(/\/+$/, "");
}

export const BACKEND = reqEnv("VITE_BACKEND_URL", RAW_BACKEND);
export const WS_BACKEND = reqEnv("VITE_WS_BACKEND_URL", RAW_WS);

export const tokenStore = {
  get: () => localStorage.getItem("token") || "",
  set: (t: string) => localStorage.setItem("token", t),
  clear: () => localStorage.removeItem("token"),
};

export const meStore = {
  get: () => { try { return JSON.parse(localStorage.getItem("me") || "null"); } catch { return null; } },
  set: (u: any) => localStorage.setItem("me", JSON.stringify(u)),
  clear: () => localStorage.removeItem("me"),
};

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: "Bearer " + tokenStore.get(),
});

const url = (p: string) => `${BACKEND}${p.startsWith("/") ? p : `/${p}`}`;

async function safeErr(r: Response) {
  try { return await r.json(); } catch { return { detail: r.statusText, status: r.status }; }
}

export const api = {
  get: async <T>(path: string): Promise<T> => {
    const r = await fetch(url(path), { headers: headers() });
    if (!r.ok) throw await safeErr(r);
    return r.json();
  },
  post: async <T>(path: string, body: any): Promise<T> => {
    const r = await fetch(url(path), { method: "POST", headers: headers(), body: JSON.stringify(body) });
    if (!r.ok) throw await safeErr(r);
    return r.json();
  },
};
