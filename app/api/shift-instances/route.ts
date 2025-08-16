import { prisma } from "@/src/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId");
  if (!tenantId) return new Response("tenantId required", { status: 400 });
  const shifts = await prisma.shiftInstance.findMany({
    where: { tenantId },
    orderBy: { startsAt: "asc" },
    include: { assignments: true }
  });
  return new Response(JSON.stringify(shifts), { headers: { "Content-Type": "application/json" } });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { tenantId, name, startsAt, endsAt, zoneId } = body as any;
  if (!tenantId || !startsAt || !endsAt) return new Response("tenantId, startsAt, endsAt required", { status: 400 });
  const s = await prisma.shiftInstance.create({
    data: {
      tenantId,
      name: name ?? null,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      zoneId: zoneId ?? null
    }
  });
  return new Response(JSON.stringify(s), { headers: { "Content-Type": "application/json" } });
}
