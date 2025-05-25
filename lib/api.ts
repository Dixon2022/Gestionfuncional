const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9002";

// GET todos los usuarios
export async function getUsers() {
  const res = await fetch(`${BASE_URL}/api/user`, { cache: "no-store" });
  return res.json();
}

// GET usuario por ID
export async function getUser(id: string) {
  const res = await fetch(`${BASE_URL}/api/user/${id}`, { cache: "no-store" });
  return res.json();
}

// POST crear usuario
export async function createUser(user: { name: string; email: string; phone: string }) {
  const res = await fetch(`${BASE_URL}/api/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
}

// PUT actualizar usuario
export async function updateUser(id: string, user: { name: string; email: string; phone: string }) {
  const res = await fetch(`${BASE_URL}/api/user/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
}

// DELETE eliminar usuario
export async function deleteUser(id: string) {
  const res = await fetch(`${BASE_URL}/api/user/${id}`, { method: "DELETE" });
  return res.json();
}
