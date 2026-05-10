"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerificarContent({ tenantAlias }: { tenantAlias: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token no encontrado.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, tenantAlias }),
        });

        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage("Cuenta verificada con éxito. Redirigiendo al login...");
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Error al verificar la cuenta.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Error de red o del servidor.");
      }
    };

    verify();
  }, [token, tenantAlias, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Verificación de Cuenta</h2>
        {status === "loading" && <p className="text-gray-600">Verificando tu cuenta...</p>}
        {status === "success" && <p className="text-green-600 font-medium">{message}</p>}
        {status === "error" && <p className="text-red-500 font-medium">{message}</p>}
      </div>
    </div>
  );
}

import * as React from "react";

export default function VerificarPage({ params }: { params: Promise<{ alias: string }> }) {
  const { alias } = React.use(params);
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerificarContent tenantAlias={alias} />
    </Suspense>
  );
}
