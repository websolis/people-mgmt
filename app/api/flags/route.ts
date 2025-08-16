import { prisma } from "@/src/lib/db";
import { getMergedFlags } from "@/src/lib/featureFlags";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tenantSlug = url.searchParams.get("tenantSlug") ?? "default";
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  const flags = await getMergedFlags(tenant?.id);
  return new Response(JSON.stringify(flags), { headers: { "Content-Type": "application/json" } });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { key, value, tenantSlug } = body as { key: string; value: "on" | "off"; tenantSlug?: string | null };
  if (!key || (value !== "on" && value !== "off")) return new Response("Invalid payload", { status: 400 });

  let tenantId: string | null = null;
  if (tenantSlug) {
    const t = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!t) return new Response("Tenant not found", { status: 404 });
    tenantId = t.id;
  }

  // find-first then update/create (nullable tenantId is not good for upsert uniqueness)
  const existing = await prisma.featureFlag.findFirst({ where: { key, tenantId: tenantId ?? undefined } });
  if (existing) {
    await prisma.featureFlag.update({ where: { id: existing.id }, data: { value } });
  } else {
    await prisma.featureFlag.create({ data: { key, value, tenantId: tenantId ?? undefined } });
  }

  return new Response("ok");
}
