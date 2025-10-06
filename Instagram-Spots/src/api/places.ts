// src/api/places.ts
import axios from "axios";
import { MAPBOX_TOKEN, UNSPLASH_KEY } from "../env";

export type LatLng = { lat: number; lng: number };

export type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
  distanceKm?: number;
  photo?: string;
};

// ---------- math ----------
function toRad(n: number) {
  return (n * Math.PI) / 180;
}
function distKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
}
function uniqBy<T, K extends keyof any>(arr: T[], by: (x: T) => K) {
  const seen = new Set<K>();
  const out: T[] = [];
  for (const it of arr) {
    const k = by(it);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
}

// ---------- helpers ----------
function adminFromFeature(f: any) {
  const ctx = f.context ?? [];
  const city = ctx.find((c: any) => c.id?.startsWith("place"))?.text;
  const state = ctx.find((c: any) => c.id?.startsWith("region"))?.text;
  const country = ctx.find((c: any) => c.id?.startsWith("country"))?.text;
  return { city, state, country };
}

async function fetchPhoto(q: string): Promise<string | undefined> {
  if (!UNSPLASH_KEY) return undefined;
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      q
    )}&per_page=1&orientation=portrait&content_filter=high`;
    const res = await axios.get(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
      timeout: 10000,
    });
    const hit = res.data?.results?.[0];
    return hit?.urls?.regular || hit?.urls?.small;
  } catch (e: any) {
    console.warn("[unsplash] photo fetch failed:", e?.message || e);
    return undefined;
  }
}

// Build a bbox around the origin; Mapbox wants minLon,minLat,maxLon,maxLat
function bboxAround(lat: number, lng: number, radiusKm: number) {
  const dLat = radiusKm / 110.574; // km per deg lat
  const dLng = radiusKm / (111.320 * Math.cos((lat * Math.PI) / 180) || 1e-6);
  const minLng = lng - dLng;
  const minLat = lat - dLat;
  const maxLng = lng + dLng;
  const maxLat = lat + dLat;
  return `${minLng},${minLat},${maxLng},${maxLat}`;
}

// Build the geocoding URL (NO types=poi; include bbox and proximity)
function mkGeoURL(query: string, origin: LatLng, radiusKm: number, limit = 10) {
  const proximity = `${origin.lng},${origin.lat}`;
  const bbox = bboxAround(origin.lat, origin.lng, radiusKm);
  return `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?access_token=${MAPBOX_TOKEN}&proximity=${proximity}&bbox=${bbox}&limit=${limit}&language=en`;
}

async function getStateForPoint(pt: LatLng): Promise<string | undefined> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${pt.lng},${pt.lat}.json?access_token=${MAPBOX_TOKEN}&types=region&limit=1`;
    const res = await axios.get(url, { timeout: 8000 });
    return res.data?.features?.[0]?.text;
  } catch {
    return undefined;
  }
}

// ---------- main ----------
/**
 * Fetch places around the origin with robust fallbacks.
 * - mode 'drive' constrains by driveMinutes; 'fly' by flyHours.
 * - outOfState=false prefers same state but won’t over-filter to empty.
 * - Returns up to minCount+ (deduped) with optional Unsplash photos.
 */
export async function fetchNearbyPlaces(
  origin: LatLng,
  vibe: string,
  mode: "drive" | "fly",
  driveMinutes: number,
  flyHours: number,
  outOfState: boolean,
  minCount = 50
): Promise<Place[]> {
  if (!MAPBOX_TOKEN) {
    console.error("❌ MAPBOX token missing");
    return [];
  }

  const radiusKm =
    mode === "drive"
      ? Math.max(60, Math.round(driveMinutes * 0.9)) // ~0.9 km/min
      : Math.max(300, Math.round(flyHours * 800)); // ~800 km/h

  const keywordsPrimary =
    vibe === "nature"
      ? ["scenic overlook", "viewpoint", "national park", "park", "trailhead"]
      : vibe === "city"
      ? ["landmark", "observation deck", "historic district", "square", "museum"]
      : vibe === "foodie"
      ? ["famous restaurant", "food hall", "market", "iconic cafe"]
      : vibe === "art"
      ? ["mural", "public art", "art installation", "gallery"]
      : vibe === "nightlife"
      ? ["rooftop bar", "speakeasy", "club"]
      : [
          "instagram spot",
          "tourist attraction",
          "iconic view",
          "landmark",
          "mural",
          "viewpoint",
          "photo spot",
          "observation deck",
        ];

  const keywordsFallback = ["park", "landmark", "tourist attraction", "viewpoint"];
  const allKeywords = [keywordsPrimary, keywordsFallback, ["poi"]];

  console.log(
    `[places] origin=(${origin.lat.toFixed(5)},${origin.lng.toFixed(
      5
    )}) vibe="${vibe}" mode=${mode} outOfState=${outOfState} radiusKm~${radiusKm}`
  );

  let collected: Place[] = [];

  const stateOfOrigin = await getStateForPoint(origin);

  // Layered keyword search
  for (const group of allKeywords) {
    for (const kw of group) {
      try {
        const url = mkGeoURL(kw, origin, radiusKm, 10);
        const res = await axios.get(url, { timeout: 12000 });
        const feats: any[] = res.data?.features ?? [];
        console.log(`[places] kw="${kw}" features=${feats.length}`);

        const mapped = feats
          .map((f) => {
            const [lng, lat] = f.center || [];
            if (typeof lat !== "number" || typeof lng !== "number") return null;
            const { city, state, country } = adminFromFeature(f);
            const p: Place = {
              id: f.id,
              name: f.text || f.place_name || "Unknown",
              lat,
              lng,
              city,
              state,
              country,
              distanceKm: distKm(origin, { lat, lng }),
            };
            return p;
          })
          .filter(Boolean) as Place[];

        collected = collected.concat(mapped);
        if (collected.length >= minCount) break;
      } catch (e: any) {
        console.warn(`[places] kw="${kw}" failed:`, e?.message || e);
      }
    }
    if (collected.length >= minCount) break;
  }

  // dedupe + distance filter
  collected = uniqBy(collected, (p) => p.id).filter(
    (p) => (p.distanceKm ?? 1e9) <= radiusKm * 1.2
  );

  // Prefer in-state when requested, but don’t starve the list.
  if (!outOfState && stateOfOrigin) {
    const kept = collected.filter((p) => !p.state || p.state === stateOfOrigin);
    if (kept.length > 0) collected = kept;
  }

  console.log(`[places] after filters count=${collected.length}`);

  // Attach Unsplash images (optional)
  const withImages: Place[] = [];
  for (const p of collected.slice(0, Math.max(minCount, 80))) {
    if (UNSPLASH_KEY) {
      const q = [p.name, p.city, p.state].filter(Boolean).join(", ");
      p.photo = await fetchPhoto(q);
    }
    withImages.push(p);
  }

  return withImages;
}
