import { prisma, getDefaultTenant } from "@/src/lib/db";
import { getMergedFlags } from "@/src/lib/featureFlags";

function isBetween(d: Date, start: Date, end: Date) {
  return d >= start && d <= end;
}

export default async function DashboardPage() {
  const tenant = await getDefaultTenant();
  const flags = await getMergedFlags(tenant?.id);
  if (!flags.dashboards_basic) {
    return <p>Dashboards disabled by feature flags.</p>;
  }

  if (!tenant) return <p>No tenant found. Run seed.</p>;

  const now = new Date();
  const upcoming = await prisma.shiftInstance.findMany({
    where: { tenantId: tenant.id, startsAt: { gte: new Date(now.getTime() - 24*3600*1000) } },
    include: { assignments: { include: { person: true } } },
    orderBy: { startsAt: "asc" }
  });

  const current = upcoming.filter(s => isBetween(now, s.startsAt, s.endsAt));
  const gaps = upcoming.filter(s => s.assignments.length < 1);

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div>
          <h3>Coverage (next 7 days)</h3>
          <ul>
            {upcoming.slice(0, 12).map(s => (
              <li key={s.id}>
                {s.name ?? "Shift"} — {s.startsAt.toISOString().slice(0,16).replace("T"," ")} → {s.endsAt.toISOString().slice(0,16).replace("T"," ")}
                {" "}| assigned {s.assignments.length}/1
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Gaps</h3>
          <ul>
            {gaps.slice(0, 12).map(s => (
              <li key={s.id}>{s.name ?? "Shift"} @ {s.startsAt.toISOString().slice(11,16)} needs 1</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Now</h3>
          <ul>
            {current.map(s => (
              <li key={s.id}>
                {s.name ?? "Shift"} — {s.assignments.map(a => a.person.name).join(", ") || "Unfilled"}
              </li>
            ))}
            {current.length === 0 && <li>No active shifts.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
