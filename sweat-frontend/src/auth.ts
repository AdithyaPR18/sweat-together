import { BACKEND } from "./api";

export async function login(email: string, password: string) {
  const res = await fetch(`${BACKEND}/api/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await res.json().catch(() => new Error("Login failed"));
  const data = await res.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("me", JSON.stringify(data.user));
  return data.user as { id: number; name: string; email: string };
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${BACKEND}/api/register`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw await res.json().catch(() => new Error("Registration failed"));
  const data = await res.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("me", JSON.stringify(data.user));
  return data.user as { id: number; name: string; email: string };
}
