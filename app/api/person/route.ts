import { prisma } from "@/src/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId");
  if (!tenantId) return new Response("tenantId required", { status: 400 });
  const people = await prisma.person.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
  return new Response(JSON.stringify(people), { headers: { "Content-Type": "application/json" } });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { tenantId, name, email } = body as { tenantId?: string; name?: string; email?: string | null };
  if (!tenantId || !name) return new Response("tenantId and name required", { status: 400 });
  const p = await prisma.person.create({ data: { tenantId, name, email: email ?? null } });
  return new Response(JSON.stringify(p), { headers: { "Content-Type": "application/json" } });
}
