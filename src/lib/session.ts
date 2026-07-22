// Simulated auth session. Reemplazar por autenticación real más adelante.
const KEY = "hirefly-session";

export function signIn(email: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify({ email, at: Date.now() }));
  }
}
export function signOut() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}
export function isSignedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(KEY);
}