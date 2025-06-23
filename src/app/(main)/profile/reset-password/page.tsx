"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordByTokenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const securePasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&()\-_=+{}[\]|\\;:'",.<>\/]).{6,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (!token) {
      setMsg("Token inválido.");
      return;
    }
    if (!currentPassword || !newPassword || !confirm) {
      setMsg("Completa todos los campos.");
      return;
    }

    if (newPassword === currentPassword) {
      setMsg("La nueva contraseña no puede ser igual a la anterior.");
      return;
    }

    if (newPassword !== confirm) {
      setMsg("Las contraseñas nuevas no coinciden.");
      return;
    }

    if (!securePasswordRegex.test(newPassword)) {
      setMsg(
        "La nueva contraseña debe tener al menos 6 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("¡Contraseña cambiada! Ahora puedes iniciar sesión.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMsg(data.message || "Error al cambiar la contraseña.");
      }
    } catch {
      setMsg("Error de red.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 md:py-12">
      <Card className="max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Restablecer Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Contraseña Actual</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Nueva Contraseña</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Confirmar Nueva Contraseña</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg hover:from-green-500 hover:to-blue-600 hover:scale-105 transition-transform duration-200" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
            {msg && <div className="text-center text-sm mt-2">{msg}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
