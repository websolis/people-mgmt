import { prisma } from "@/src/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { tenantId, personId, shiftId } = body as { tenantId?: string; personId?: string; shiftId?: string };
  if (!tenantId || !personId || !shiftId) return new Response("tenantId, personId, shiftId required", { status: 400 });

  const shift = await prisma.shiftInstance.findUnique({ where: { id: shiftId } });
  if (!shift || shift.tenantId !== tenantId) return new Response("Shift not found", { status: 404 });

  // overlap check: same person has assignment overlapping this shift
  const overlaps = await prisma.assignment.findMany({
    where: {
      tenantId,
      personId,
      shift: {
        OR: [
          { startsAt: { lte: shift.endsAt }, endsAt: { gte: shift.startsAt } }
        ]
      }
    },
    include: { shift: true }
  });
  if (overlaps.length > 0) return new Response("Person already assigned to overlapping shift", { status: 409 });

  const a = await prisma.assignment.create({ data: { tenantId, personId, shiftId } });
  return new Response(JSON.stringify(a), { headers: { "Content-Type": "application/json" } });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response("id required", { status: 400 });
  await prisma.assignment.delete({ where: { id } }).catch(()=>{});
  return new Response("ok");
}
