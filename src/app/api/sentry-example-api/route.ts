import { NextResponse } from "next/server";

// Una ruta GET simple que lanza un error intencionadamente para probar la integración de Sentry
export const dynamic = "force-dynamic";

export async function GET() {
  throw new Error("Sentry Test Error: This is a controlled exception to verify Sentry configuration.");
  
  // This code will never be reached, but satisfies TypeScript
  return NextResponse.json({ success: true });
}
