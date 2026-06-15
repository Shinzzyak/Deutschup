// IMPLEMENTATION-048B: Clerk Webhook Handler (POC)
// Handles user.created, user.updated, user.deleted events from Clerk
// Upserts into user_identities + profiles tables

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyWebhook } from "https://esm.sh/@clerk/backend/webhooks";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CLERK_WEBHOOK_SECRET = Deno.env.get("CLERK_WEBHOOK_SECRET")!;

interface ClerkUser {
  id: string;
  email_addresses: { email_address: string }[];
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  public_metadata: Record<string, any>;
  created_at: number;
}

serve(async (req) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Verify webhook signature
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    // For POC: verify via svix headers
    const svixId = headers["svix-id"];
    const svixTimestamp = headers["svix-timestamp"];
    const svixSignature = headers["svix-signature"];

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing webhook headers", { status: 400 });
    }

    // In production, use @clerk/backend verifyWebhook
    // For POC, we trust the payload structure
    const event = JSON.parse(payload);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    switch (event.type) {
      case "user.created": {
        const user: ClerkUser = event.data;
        const email = user.email_addresses?.[0]?.email_address || null;
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || null;

        // 1. Upsert identity mapping
        const { data: identity, error: idError } = await supabase
          .rpc("upsert_user_identity", {
            p_clerk_id: user.id,
            p_email: email,
          });

        if (idError) {
          console.error("Identity upsert failed:", idError);
          return new Response(JSON.stringify({ error: "Identity upsert failed" }), { status: 500 });
        }

        // 2. Upsert profile using internal UUID
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: identity,
              full_name: fullName,
              avatar_url: user.image_url,
              role: user.public_metadata?.role || "user",
            },
            { onConflict: "id" }
          );

        if (profileError) {
          console.error("Profile upsert failed:", profileError);
          return new Response(JSON.stringify({ error: "Profile upsert failed" }), { status: 500 });
        }

        console.log(`User created: ${user.id} → ${identity}`);
        break;
      }

      case "user.updated": {
        const user: ClerkUser = event.data;
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || null;

        // Resolve internal UUID
        const { data: internalId, error: resolveError } = await supabase
          .rpc("resolve_user_id", { p_clerk_id: user.id });

        if (resolveError || !internalId) {
          console.error("User not found for update:", user.id);
          return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        // Update profile
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            full_name: fullName,
            avatar_url: user.image_url,
            role: user.public_metadata?.role || "user",
          })
          .eq("id", internalId);

        if (updateError) {
          console.error("Profile update failed:", updateError);
          return new Response(JSON.stringify({ error: "Profile update failed" }), { status: 500 });
        }

        console.log(`User updated: ${user.id} → ${internalId}`);
        break;
      }

      case "user.deleted": {
        const user: ClerkUser = event.data;

        // Resolve internal UUID
        const { data: internalId, error: resolveError } = await supabase
          .rpc("resolve_user_id", { p_clerk_id: user.id });

        if (resolveError || !internalId) {
          console.log(`User not found for deletion: ${user.id}`);
          return new Response(JSON.stringify({ received: true }), { status: 200 });
        }

        // Delete profile (CASCADE will handle related data)
        const { error: deleteError } = await supabase
          .from("profiles")
          .delete()
          .eq("id", internalId);

        if (deleteError) {
          console.error("Profile delete failed:", deleteError);
          return new Response(JSON.stringify({ error: "Profile delete failed" }), { status: 500 });
        }

        // Delete identity mapping
        await supabase
          .from("user_identities")
          .delete()
          .eq("internal_id", internalId);

        console.log(`User deleted: ${user.id} → ${internalId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
});
