"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

export default function ZoneEditor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || (process.env.MAPBOX_TOKEN as string);
    // In Next dev, process.env on client only exposes NEXT_PUBLIC_*
    // We'll rely on MAPBOX_TOKEN passed via inline script on the page.
    const _token = (window as any).__MAPBOX_TOKEN__ as string | undefined;
    if (!_token) return;

    mapboxgl.accessToken = _token;
    const map = new mapboxgl.Map({
      container: ref.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [33.3642, 35.1856],
      zoom: 11
    });

    new mapboxgl.Marker().setLngLat([33.3642, 35.1856]).addTo(map);

    return () => { map.remove(); };
  }, []);

  return <div ref={ref} style={{ width: "100%", height: 400, border: "1px solid #ddd" }} />;
}
