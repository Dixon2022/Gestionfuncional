"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "user";
  blocked: boolean;
}

export default function UsersAdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
      toast({
        title: "Acceso denegado",
        description: "Solo los administradores pueden ver esta página.",
        variant: "destructive",
      });
      return;
    }
  }, [loading, user, router, toast]);

  useEffect(() => {
    const fetchUsers = async () => {
      const ownerId = await getOwnerIdByEmail(user?.email ?? "");
      if (user?.role !== "admin") return;
      setIsLoading(true);
      const res = await fetch(`/api/admin/users?excludeId=${ownerId}`);
      const data = await res.json();
      console.log("Fetched users:", data.users);
       console.log("Fetched patooo:", user);
      setUsers(Array.isArray(data.users) ? data.users : []);
      setIsLoading(false);
    };
    fetchUsers();
  }, [user]);

  const handleBlockToggle = async (id: number, blocked: boolean) => {
    const res = await fetch("/api/admin/users/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, blocked: !blocked }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, blocked: !blocked } : u))
      );
      toast({
        title: "Actualizado",
        description: `El usuario ha sido ${!blocked ? "bloqueado" : "desbloqueado"}.`,
      });
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen">
        <main className="flex flex-col items-center mt-8 flex-grow">
          <div className="w-full max-w-5xl">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden p-8 md:p-12">
              <h1 className="text-2xl font-bold mb-6 text-center">Gestión de Usuarios</h1>
              {isLoading ? (
                <p>Cargando...</p>
              ) : (
                <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                      <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                      <th className="px-4 py-3 text-left font-semibold">Email</th>
                      <th className="px-4 py-3 text-left font-semibold">Teléfono</th>
                      <th className="px-4 py-3 text-left font-semibold">Rol</th>
                      <th className="px-4 py-3 text-left font-semibold">Bloqueado</th>
                      <th className="px-4 py-3 text-center font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, idx) => (
                      <tr
                        key={u.id}
                        className={idx % 2 === 0 ? "bg-gray-50 hover:bg-blue-50" : "bg-white hover:bg-blue-50"}
                      >
                        <td className="px-4 py-2">{u.name}</td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2">{u.phone}</td>
                        <td className="px-4 py-2">
                          <select
                            value={u.role}
                            onChange={async (e) => {
                              const newRole = e.target.value as "admin" | "user";
                              if (newRole === u.role) return;
                              const res = await fetch("/api/admin/users/role", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: u.id, role: newRole }),
                              });
                              if (res.ok) {
                                setUsers((prev) =>
                                  prev.map((user) =>
                                    user.id === u.id ? { ...user, role: newRole } : user
                                  )
                                );
                                toast({
                                  title: "Rol actualizado",
                                  description: `El usuario ahora es ${newRole}.`,
                                });
                              }
                            }}
                            className={`px-2 py-1 rounded text-xs font-bold border ${
                              u.role === "admin"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 text-center">
                          {u.blocked ? (
                            <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                              Sí
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleBlockToggle(u.id, u.blocked)}
                            className={`px-3 py-1 rounded font-semibold text-xs shadow transition
                              ${u.blocked
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-red-500 hover:bg-red-600 text-white"}
                            `}
                          >
                            {u.blocked ? "Desbloquear" : "Bloquear"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

async function getOwnerIdByEmail(email: string): Promise<number | null> {
  try {
    const res = await fetch(
      `/api/user/by-email?email=${encodeURIComponent(email)}`
    );
    if (!res.ok) return null;
    const user = await res.json();
    return user.id ?? null;
  } catch {
    return null;
  }
}