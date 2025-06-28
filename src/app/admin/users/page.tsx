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
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

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

  // Filtrado en frontend
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      roleFilter === "all" ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen">
        <main className="flex flex-col items-center mt-8 flex-grow">
          <div className="w-full max-w-5xl">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden p-8 md:p-12">
              <h1 className="text-2xl font-bold mb-6 text-center">Gestión de Usuarios</h1>
              
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border rounded px-3 py-2 w-full md:w-1/2"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "user")}
                  className="border rounded px-3 py-2 w-full md:w-1/4"
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Administrador</option>
                  <option value="user">Usuario</option>
                </select>
              </div>

              {isLoading ? (
                <p>Cargando...</p>
              ) : (
                <div className="w-full overflow-x-auto rounded-lg">
                  <table className="min-w-full bg-white rounded-lg shadow overflow-hidden text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                        <th className="px-2 md:px-4 py-3 text-left font-semibold whitespace-nowrap">Nombre</th>
                        <th className="px-2 md:px-4 py-3 text-left font-semibold whitespace-nowrap">Email</th>
                        <th className="px-2 md:px-4 py-3 text-left font-semibold whitespace-nowrap hidden sm:table-cell">Teléfono</th>
                        <th className="px-2 md:px-4 py-3 text-left font-semibold whitespace-nowrap">Rol</th>
                        <th className="px-2 md:px-4 py-3 text-left font-semibold whitespace-nowrap">Bloqueado</th>
                        <th className="px-2 md:px-4 py-3 text-center font-semibold whitespace-nowrap">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((u, idx) => (
                        <tr
                          key={u.id}
                          className={idx % 2 === 0 ? "bg-gray-50 hover:bg-blue-50" : "bg-white hover:bg-blue-50"}
                        >
                          <td className="px-2 md:px-4 py-2">{u.name}</td>
                          <td className="px-2 md:px-4 py-2">{u.email}</td>
                          <td className="px-2 md:px-4 py-2 hidden sm:table-cell">{u.phone}</td>
                          <td className="px-2 md:px-4 py-2">
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
                          <td className="px-2 md:px-4 py-2 text-center">
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
                          <td className="px-2 md:px-4 py-2 text-center">
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
                </div>
              )}
              <div className="mt-4">
                <span className="text-sm text-gray-700">
                  Página {currentPage} de {totalPages}
                </span>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-blue-500 text-white text-sm font-semibold shadow hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-blue-500 text-white text-sm font-semibold shadow hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
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