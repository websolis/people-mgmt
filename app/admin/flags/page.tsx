import { prisma, getDefaultTenant } from "@/src/lib/db";
import { ALL_FLAGS, getMergedFlags } from "@/src/lib/featureFlags";

async function setFlag(formData: FormData) {
  "use server";
  const key = formData.get("key") as string;
  const value = formData.get("value") as string;
  const scope = formData.get("scope") as string; // "global" or "tenant"
  const tenant = await getDefaultTenant();
  const tenantId = scope === "tenant" ? tenant?.id : null;

  // Upsert-like logic for nullable tenantId
  const existing = await prisma.featureFlag.findFirst({
    where: { key, tenantId: tenantId ?? undefined }
  });
  if (existing) {
    await prisma.featureFlag.update({ where: { id: existing.id }, data: { value } });
  } else {
    await prisma.featureFlag.create({ data: { key, value, tenantId: tenantId ?? undefined } });
  }
}

export default async function FlagsPage() {
  const tenant = await getDefaultTenant();
  const merged = await getMergedFlags(tenant?.id);

  return (
    <div>
      <h2>Feature Flags</h2>
      <p>Toggle flags globally or for the default tenant.</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16 }}>
        {ALL_FLAGS.map(k => (
          <form key={k} action={setFlag} style={{ border:"1px solid #eee", padding: 12, borderRadius: 8 }}>
            <div style={{ fontWeight: 600 }}>{k}</div>
            <div>Effective: <code>{merged[k]}</code></div>
            <div style={{ display:"flex", gap: 8, marginTop: 8 }}>
              <input type="hidden" name="key" value={k} />
              <select name="value" defaultValue={merged[k]}>
                <option value="on">on</option>
                <option value="off">off</option>
              </select>
              <select name="scope" defaultValue="tenant">
                <option value="global">global</option>
                <option value="tenant">tenant</option>
              </select>
              <button type="submit">Save</button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
