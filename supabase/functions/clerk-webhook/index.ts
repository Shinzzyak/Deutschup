// IMPLEMENTATION-048F: Hardened Clerk Webhook Handler
// Security: svix signature verification, replay protection, event deduplication
// Lifecycle: soft-delete with 30-day cleanup
// Audit: full event logging

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyWebhook } from "https://esm.sh/@clerk/backend/webhooks";

// ─── Configuration ──────────────────────────────────────────────────────────

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CLERK_WEBHOOK_SECRET = Deno.env.get("CLERK_WEBHOOK_SECRET")!;

// Security thresholds
const MAX_TIMESTAMP_DRIFT_MS = 5 * 60 * 1000; // 5 minutes
const EVENT_RETENTION_DAYS = 7; // Keep processed events for 7 days
const SOFT_DELETE_RETENTION_DAYS = 30; // Keep soft-deleted users for 30 days

// ─── Types ──────────────────────────────────────────────────────────────────

interface ClerkUser {
  id: string;
  email_addresses: { email_address: string }[];
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  public_metadata: Record<string, any>;
  created_at: number;
}

interface WebhookAuditEvent {
  event_id: string;
  event_type: string;
  clerk_user_id: string | null;
  internal_user_id: string | null;
  status: "success" | "error" | "duplicate" | "stale" | "invalid_signature";
  execution_result: string;
  error_message: string | null;
  timestamp: string;
  ip_address: string | null;
}

// ─── Security Helpers ───────────────────────────────────────────────────────

/**
 * Verify Svix webhook signature.
 * Returns true if signature is valid.
 */
async function verifySvixSignature(
  req: Request,
  secret: string
): Promise<{ valid: boolean; error?: string; event?: any }> {
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return { valid: false, error: "Missing Svix headers" };
  }

  try {
    // Use Clerk's official verification — pass raw Request object
    const evt = await verifyWebhook(req, { signingSecret: secret });
    return { valid: true, event: evt };
  } catch (error) {
    return { valid: false, error: `Verification failed: ${error}` };
  }
}

/**
 * Check timestamp freshness.
 * Reject events older than MAX_TIMESTAMP_DRIFT_MS or from the future.
 */
function checkTimestampFreshness(svixTimestamp: string): {
  fresh: boolean;
  error?: string;
  timestampMs: number;
} {
  const eventTime = parseInt(svixTimestamp, 10) * 1000; // Convert to ms
  const now = Date.now();
  const drift = now - eventTime;

  if (drift > MAX_TIMESTAMP_DRIFT_MS) {
    return {
      fresh: false,
      error: `Event too old: ${drift}ms ago (max: ${MAX_TIMESTAMP_DRIFT_MS}ms)`,
      timestampMs: eventTime,
    };
  }

  if (drift < -MAX_TIMESTAMP_DRIFT_MS) {
    return {
      fresh: false,
      error: `Event from future: ${Math.abs(drift)}ms ahead`,
      timestampMs: eventTime,
    };
  }

  return { fresh: true, timestampMs: eventTime };
}

// ─── Deduplication ──────────────────────────────────────────────────────────

/**
 * Check if event has already been processed.
 * Returns true if duplicate.
 */
async function isDuplicateEvent(
  supabase: ReturnType<typeof createClient>,
  eventId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("webhook_events")
    .select("event_id")
    .eq("event_id", eventId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = not found (expected for new events)
    console.error("Duplicate check failed:", error);
    return false; // On error, allow processing (fail open for availability)
  }

  return data !== null;
}

/**
 * Record processed event for deduplication.
 */
async function recordProcessedEvent(
  supabase: ReturnType<typeof createClient>,
  event: WebhookAuditEvent
): Promise<void> {
  const { error } = await supabase.from("webhook_events").upsert(
    {
      event_id: event.event_id,
      event_type: event.event_type,
      clerk_user_id: event.clerk_user_id,
      internal_user_id: event.internal_user_id,
      status: event.status,
      execution_result: event.execution_result,
      error_message: event.error_message,
      processed_at: event.timestamp,
      ip_address: event.ip_address,
    },
    { onConflict: "event_id" }
  );

  if (error) {
    console.error("Failed to record event:", error);
  }
}

// ─── Audit Logging ──────────────────────────────────────────────────────────

/**
 * Log webhook event for audit trail.
 */
async function logAuditEvent(
  supabase: ReturnType<typeof createClient>,
  event: WebhookAuditEvent
): Promise<void> {
  const { error } = await supabase.from("webhook_audit_log").insert({
    event_id: event.event_id,
    event_type: event.event_type,
    clerk_user_id: event.clerk_user_id,
    internal_user_id: event.internal_user_id,
    status: event.status,
    execution_result: event.execution_result,
    error_message: event.error_message,
    processed_at: event.timestamp,
    ip_address: event.ip_address,
  });

  if (error) {
    console.error("Audit log failed:", error);
  }
}

// ─── Lifecycle Handlers ─────────────────────────────────────────────────────

async function handleUserCreated(
  supabase: ReturnType<typeof createClient>,
  user: ClerkUser,
  auditEvent: Partial<WebhookAuditEvent>
): Promise<{ success: boolean; error?: string }> {
  const email = user.email_addresses?.[0]?.email_address || null;
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || null;

  // 1. Upsert identity mapping
  const { data: identity, error: idError } = await supabase.rpc("upsert_user_identity", {
    p_clerk_id: user.id,
    p_email: email,
  });

  if (idError) {
    console.error("Identity upsert failed:", idError);
    return { success: false, error: `Identity upsert failed: ${idError.message}` };
  }

  // 2. Upsert profile using internal UUID
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: identity,
      full_name: fullName,
      avatar_url: user.image_url,
      // Security: role is NEVER read from public_metadata — attacker-controlled
      // if the webhook signing secret leaks (it did: public git history, 2026-07
      // docs). Single admin = ADMIN_EMAIL, provisioned via SQL directly.
      role: "user",
    },
    { onConflict: "id" }
  );

  if (profileError) {
    console.error("Profile upsert failed:", profileError);
    return { success: false, error: `Profile upsert failed: ${profileError.message}` };
  }

  // 3. Create users row (ROOT of cascade chain)
  const { error: usersError } = await supabase.from("users").upsert(
    {
      id: identity,
      xp: 0,
      streak: 0,
      tier: "Free",
      full_name: fullName,
      avatar_url: user.image_url,
    },
    { onConflict: "id" }
  );

  if (usersError) {
    console.error("Users row creation failed:", usersError);
    // Non-fatal — profile exists, can be retried
  }

  console.log(`User created: ${user.id} → ${identity}`);
  auditEvent.internal_user_id = identity;
  return { success: true };
}

async function handleUserUpdated(
  supabase: ReturnType<typeof createClient>,
  user: ClerkUser,
  auditEvent: Partial<WebhookAuditEvent>
): Promise<{ success: boolean; error?: string }> {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || null;

  // Resolve internal UUID
  const { data: internalId, error: resolveError } = await supabase.rpc("resolve_user_id", {
    p_clerk_id: user.id,
  });

  if (resolveError || !internalId) {
    console.error("User not found for update:", user.id);
    return { success: false, error: "User not found" };
  }

  // Update profile (role NEVER touched — admin via SQL only, see handleUserCreated)
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      avatar_url: user.image_url,
    })
    .eq("id", internalId);

  if (updateError) {
    console.error("Profile update failed:", updateError);
    return { success: false, error: `Profile update failed: ${updateError.message}` };
  }

  // Update users row
  await supabase
    .from("users")
    .update({
      full_name: fullName,
      avatar_url: user.image_url,
    })
    .eq("id", internalId);

  console.log(`User updated: ${user.id} → ${internalId}`);
  auditEvent.internal_user_id = internalId;
  return { success: true };
}

async function handleUserDeleted(
  supabase: ReturnType<typeof createClient>,
  user: ClerkUser,
  auditEvent: Partial<WebhookAuditEvent>
): Promise<{ success: boolean; error?: string }> {
  // Resolve internal UUID
  const { data: internalId, error: resolveError } = await supabase.rpc("resolve_user_id", {
    p_clerk_id: user.id,
  });

  if (resolveError || !internalId) {
    console.log(`User not found for deletion: ${user.id}`);
    return { success: true }; // Idempotent — already deleted
  }

  const now = new Date().toISOString();

  // 1. Soft-delete profiles (leaf node)
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ deleted_at: now })
    .eq("id", internalId)
    .is("deleted_at", null); // Only if not already soft-deleted

  if (profileError) {
    console.error("Profile soft-delete failed:", profileError);
    return { success: false, error: `Profile soft-delete failed: ${profileError.message}` };
  }

  // 2. Soft-delete users (ROOT — cascade will handle dependents on hard delete)
  const { error: usersError } = await supabase
    .from("users")
    .update({ deleted_at: now })
    .eq("id", internalId)
    .is("deleted_at", null);

  if (usersError) {
    console.error("Users soft-delete failed:", usersError);
    // Non-fatal — profile already soft-deleted
  }

  // 3. Soft-delete identity mapping
  await supabase
    .from("user_identities")
    .update({ deleted_at: now })
    .eq("internal_id", internalId)
    .is("deleted_at", null);

  console.log(`User soft-deleted: ${user.id} → ${internalId}`);
  auditEvent.internal_user_id = internalId;
  return { success: true };
}

// ─── Main Handler ───────────────────────────────────────────────────────────

serve(async (req) => {
  const startTime = Date.now();
  const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;

  // Only accept POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // ── Step 1: Verify Svix Signature ───────────────────────────────────────
    const signatureResult = await verifySvixSignature(req, CLERK_WEBHOOK_SECRET);

    if (!signatureResult.valid) {
      console.error("Webhook signature invalid:", signatureResult.error);

      const auditEvent: WebhookAuditEvent = {
        event_id: req.headers.get("svix-id") || "unknown",
        event_type: "unknown",
        clerk_user_id: null,
        internal_user_id: null,
        status: "invalid_signature",
        execution_result: "rejected",
        error_message: signatureResult.error,
        timestamp: new Date().toISOString(),
        ip_address: ipAddress,
      };

      await logAuditEvent(supabase, auditEvent);

      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
    }

    // ── Step 2: Check Timestamp Freshness ───────────────────────────────────
    const timestampResult = checkTimestampFreshness(req.headers.get("svix-timestamp")!);

    if (!timestampResult.fresh) {
      console.error("Webhook timestamp stale:", timestampResult.error);

      const auditEvent: WebhookAuditEvent = {
        event_id: req.headers.get("svix-id"),
        event_type: "unknown",
        clerk_user_id: null,
        internal_user_id: null,
        status: "stale",
        execution_result: "rejected",
        error_message: timestampResult.error,
        timestamp: new Date().toISOString(),
        ip_address: ipAddress,
      };

      await logAuditEvent(supabase, auditEvent);

      return new Response(JSON.stringify({ error: "Event too old" }), { status: 400 });
    }

    // ── Step 3: Parse Event ─────────────────────────────────────────────────
    // If verification succeeded, use the verified event from Clerk
    const event = signatureResult.event as { type: string; data: ClerkUser; id: string };

    const eventId = event.id || req.headers.get("svix-id");
    const clerkUserId = event.data?.id || null;

    // ── Step 4: Deduplication ───────────────────────────────────────────────
    const isDupe = await isDuplicateEvent(supabase, eventId);
    if (isDupe) {
      console.log(`Duplicate event rejected: ${eventId}`);

      const auditEvent: WebhookAuditEvent = {
        event_id: eventId,
        event_type: event.type,
        clerk_user_id: clerkUserId,
        internal_user_id: null,
        status: "duplicate",
        execution_result: "skipped",
        error_message: "Event already processed",
        timestamp: new Date().toISOString(),
        ip_address: ipAddress,
      };

      await logAuditEvent(supabase, auditEvent);

      return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
    }

    // ── Step 5: Process Event ───────────────────────────────────────────────
    const auditEvent: WebhookAuditEvent = {
      event_id: eventId,
      event_type: event.type,
      clerk_user_id: clerkUserId,
      internal_user_id: null,
      status: "success",
      execution_result: "processed",
      error_message: null,
      timestamp: new Date().toISOString(),
      ip_address: ipAddress,
    };

    let result: { success: boolean; error?: string };

    switch (event.type) {
      case "user.created":
        result = await handleUserCreated(supabase, event.data, auditEvent);
        break;
      case "user.updated":
        result = await handleUserUpdated(supabase, event.data, auditEvent);
        break;
      case "user.deleted":
        result = await handleUserDeleted(supabase, event.data, auditEvent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
        result = { success: true }; // Accept unknown events (idempotent)
    }

    // ── Step 6: Record & Audit ──────────────────────────────────────────────
    if (!result.success) {
      auditEvent.status = "error";
      auditEvent.execution_result = "failed";
      auditEvent.error_message = result.error;
    }

    await recordProcessedEvent(supabase, auditEvent);
    await logAuditEvent(supabase, auditEvent);

    const durationMs = Date.now() - startTime;
    console.log(`Webhook processed: ${event.type} (${durationMs}ms) [${auditEvent.status}]`);

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);

    const auditEvent: WebhookAuditEvent = {
      event_id: req.headers.get("svix-id") || "unknown",
      event_type: "unknown",
      clerk_user_id: null,
      internal_user_id: null,
      status: "error",
      execution_result: "exception",
      error_message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      ip_address: ipAddress,
    };

    await logAuditEvent(supabase, auditEvent);

    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
});
