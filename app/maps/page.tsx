import { getDefaultTenant } from "@/src/lib/db";
import { getMergedFlags } from "@/src/lib/featureFlags";
import dynamic from "next/dynamic";

const ZoneEditor = dynamic(() => import("@/src/maps/ZoneEditor"), { ssr: false });

export default async function MapsPage() {
  const tenant = await getDefaultTenant();
  const flags = await getMergedFlags(tenant?.id);
  const token = process.env.MAPBOX_TOKEN;
  if (!flags.maps_zones) return <p>Maps disabled by feature flags.</p>;
  if (!token) return <p>MAPBOX_TOKEN not set. Add it in Secrets.</p>;

  return (
    <div>
      <h2>Maps & Zones (preview)</h2>
      {/* Inject token for client */}
      <script dangerouslySetInnerHTML={{__html:`window.__MAPBOX_TOKEN__ = ${JSON.stringify(token)};`}} />
      <ZoneEditor />
      <p style={{marginTop:8}}>This is a basic map preview. Zone drawing can be added later.</p>
    </div>
  );
}
