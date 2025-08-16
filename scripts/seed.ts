import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  let tenant = await prisma.tenant.findUnique({ where: { slug: "default" } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: { name: "Default Tenant", slug: "default" }
    });
  }

  // Global flags example (no tenantId)
  await prisma.featureFlag.createMany({
    data: [
      { key: "people_profiles", value: "on" },
      { key: "roles_requirements", value: "on" },
      { key: "scheduler_manual", value: "on" },
      { key: "dashboards_basic", value: "on" }
    ],
    skipDuplicates: true
  });

  // Tenant flag override example
  await prisma.featureFlag.create({
    data: { key: "people_profiles", value: "on", tenantId: tenant.id }
  }).catch(() => {});

  // People
  const [alice, bob] = await Promise.all([
    prisma.person.upsert({
      where: { id: "seed-alice" },
      create: { id: "seed-alice", name: "Alice", tenantId: tenant.id, email: "alice@example.com" },
      update: {}
    }),
    prisma.person.upsert({
      where: { id: "seed-bob" },
      create: { id: "seed-bob", name: "Bob", tenantId: tenant.id, email: "bob@example.com" },
      update: {}
    })
  ]);

  // Shifts today and tomorrow
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0, 0);
  const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 18, 0, 0);

  const s1 = await prisma.shiftInstance.create({
    data: { tenantId: tenant.id, name: "Front Desk AM", startsAt: todayStart, endsAt: todayEnd }
  });
  const s2 = await prisma.shiftInstance.create({
    data: { tenantId: tenant.id, name: "Floor Patrol PM", startsAt: tomorrowStart, endsAt: tomorrowEnd, zoneId: "Ground-Floor" }
  });

  await prisma.assignment.create({
    data: { tenantId: tenant.id, shiftId: s1.id, personId: alice.id }
  });

  console.log("Seed complete for tenant:", tenant.slug);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
