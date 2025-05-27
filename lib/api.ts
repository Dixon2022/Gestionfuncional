import type { Property } from '../src/lib/types';

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

// GET todas las propiedades
export async function getProperties(): Promise<Property[]> {
  const res = await fetch(`${BASE_URL}/api/property`, { cache: "no-store" });
  const data = await res.json();

  if (!Array.isArray(data)) {
    console.warn("La respuesta de propiedades no es un array", data);
    return [];
  }

  return data;
}

// GET propiedad por ID
export async function getProperty(id: string): Promise<Property> {
  const res = await fetch(`${BASE_URL}/api/property/${id}`, { cache: "no-store" });
  return res.json();
}

// POST crear propiedad
export async function createProperty(property: Omit<Property, "id">): Promise<Property> {
  const res = await fetch(`${BASE_URL}/api/property`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(property),
  });
  return res.json();
}

// PUT actualizar propiedad
export async function updateProperty(id: string, updated: Partial<Property>): Promise<Property> {
  const res = await fetch(`${BASE_URL}/api/property/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });
  return res.json();
}

// DELETE eliminar propiedad
export async function deleteProperty(id: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/api/property/${id}`, { method: "DELETE" });
  return res.json();
}