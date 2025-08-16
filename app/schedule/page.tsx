import { getMergedFlags } from "@/src/lib/featureFlags";
import { prisma, getDefaultTenant } from "@/src/lib/db";
import ScheduleClient from "./scheduleClient";

export default async function SchedulePage() {
  const tenant = await getDefaultTenant();
  const flags = await getMergedFlags(tenant?.id);
  if (!flags.scheduler_manual) return <p>Scheduler disabled by feature flags.</p>;
  if (!tenant) return <p>No tenant found. Run seed.</p>;

  const people = await prisma.person.findMany({ where: { tenantId: tenant.id }, orderBy: { name: "asc" }});
  const shifts = await prisma.shiftInstance.findMany({ where: { tenantId: tenant.id }, orderBy: { startsAt: "asc" }, include: { assignments: { include: { person: true }}}});

  return <ScheduleClient tenantId={tenant.id} people={people} shifts={shifts} />;
}
