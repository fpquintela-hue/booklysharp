import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const dsnExists = !!dsn;
  const dsnLength = dsn?.length || 0;
  const dsnStart = dsn ? dsn.substring(0, 20) + "..." : "none";

  return NextResponse.json({
    message: "Verificación de DSN de Sentry",
    dsnExists,
    dsnLength,
    dsnStart,
    nodeEnv: process.env.NODE_ENV
  });
}
