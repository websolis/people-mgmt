import { prisma } from "@/src/lib/db";

export async function GET() {
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: "asc" } });
  return new Response(JSON.stringify(tenants), { headers: { "Content-Type": "application/json" } });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { name, slug } = body as { name: string; slug: string };
  if (!name || !slug) return new Response("Missing name/slug", { status: 400 });
  const t = await prisma.tenant.create({ data: { name, slug } });
  return new Response(JSON.stringify(t), { headers: { "Content-Type": "application/json" } });
}
