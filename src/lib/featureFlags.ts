import { prisma } from "./db";

export type FlagKey =
  | "people_profiles"
  | "roles_requirements"
  | "scheduler_manual"
  | "scheduler_auto"
  | "maps_zones"
  | "dashboards_basic"
  | "dashboards_advanced"
  | "swaps_bidding"
  | "leave_mgmt"
  | "time_clock"
  | "comms"
  | "integrations"
  | "compliance_tools"
  | "ai_assist";

export const ALL_FLAGS: FlagKey[] = [
  "people_profiles","roles_requirements","scheduler_manual","scheduler_auto",
  "maps_zones","dashboards_basic","dashboards_advanced","swaps_bidding",
  "leave_mgmt","time_clock","comms","integrations","compliance_tools","ai_assist"
];

const parseList = (v?: string | null) =>
  (v ?? "").split(",").map(s => s.trim()).filter(Boolean);

const GLOBAL_ON = new Set(parseList(process.env.FEATURE_FLAGS_GLOBAL));
const GLOBAL_OFF = new Set(parseList(process.env.FEATURE_FLAGS_GLOBAL_OFF));

export async function getMergedFlags(tenantId?: string) {
  const record = Object.fromEntries(
    ALL_FLAGS.map(k => {
      if (GLOBAL_OFF.has(k)) return [k, "off"];
      if (GLOBAL_ON.has(k)) return [k, "on"];
      return [k, "off"];
    })
  ) as Record<FlagKey, "on" | "off">;

  // DB globals (tenantId null)
  const globals = await prisma.featureFlag.findMany({ where: { tenantId: null } });
  for (const f of globals) {
    if ((ALL_FLAGS as string[]).includes(f.key)) record[f.key as FlagKey] = f.value as any;
  }

  if (tenantId) {
    const tenantFlags = await prisma.featureFlag.findMany({ where: { tenantId } });
    for (const f of tenantFlags) {
      if ((ALL_FLAGS as string[]).includes(f.key)) record[f.key as FlagKey] = f.value as any;
    }
  }

  return record;
}
