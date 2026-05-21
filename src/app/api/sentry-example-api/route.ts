import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const dsnExists = !!dsn;

  if (dsnExists) {
    // Si el DSN ya existe, forzamos un error de prueba para verificar que llega a Sentry
    throw new Error("Sentry Test Error: Conexión exitosa desde el servidor VPS");
  }

  const dsnLength = dsn?.length || 0;
  const dsnStart = dsn ? dsn.substring(0, 20) + "..." : "none";

  return NextResponse.json({
    message: "Verificación de DSN de Sentry (Falta configurar el .env en VPS)",
    dsnExists,
    dsnLength,
    dsnStart,
    nodeEnv: process.env.NODE_ENV
  });
}
