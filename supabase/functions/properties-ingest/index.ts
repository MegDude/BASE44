import { createClient } from "npm:@supabase/supabase-js";

type ExtractedProperty = {
  slug?: string;
  name: string;
  address: string;
  totalUnits?: number;
  occupiedUnits?: number;
  underMaintenanceUnits?: number;
  amenities?: string[];
  coverPhoto?: string;
};

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function normalize(input: ExtractedProperty, workspaceId: string) {
  const total = Number(input.totalUnits ?? 0);
  const occupied = Number(input.occupiedUnits ?? 0);
  const maintenance = Number(input.underMaintenanceUnits ?? 0);
  return {
    workspace_id: workspaceId,
    slug: input.slug || slugify(input.name || "untitled-property"),
    title: input.name || "Untitled Property",
    type: "property",
    address: input.address || "Unknown",
    lat: null,
    lng: null,
    status: "live",
    metrics: {},
    pulse: {
      total_units: total,
      occupied_units: occupied,
      available_units: Math.max(0, total - occupied - maintenance),
      under_maintenance_units: maintenance,
      amenities: input.amenities || [],
    },
    cover_photo: input.coverPhoto || null,
  };
}

Deno.serve(async (req) => {
  try {
    const { workspaceId, properties } = await req.json();
    if (!workspaceId || !Array.isArray(properties)) {
      return new Response(JSON.stringify({ error: "workspaceId and properties[] are required" }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const normalized = properties.map((property: ExtractedProperty) => normalize(property, workspaceId));
    const { error } = await supabase.from("entities").insert(normalized).select("id");
    if (error) throw error;
    await supabase.from("audit_logs").insert({
      actor_user_id: null,
      action: "properties_ingest",
      target: workspaceId,
      meta: { ingested: normalized.length },
    });
    return new Response(JSON.stringify({ ingested: normalized.length }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "ingest failed" }), { status: 500 });
  }
});

