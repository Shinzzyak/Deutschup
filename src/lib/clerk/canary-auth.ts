// IMPLEMENTATION-048G: Canary Auth Functions
// Clerk-aware login/logout for canary users

import { shouldUseClerk } from "./canary";

// Login with Google via appropriate provider
export async function canaryLoginWithGoogle(email?: string): Promise<void> {
  if (shouldUseClerk(email)) {
    // Clerk login - redirect to Clerk hosted Google OAuth
    // This will be handled by ClerkProvider when available
    console.log("[CANARY] Clerk login requested for:", email);
    // For now, fall back to Supabase until Clerk project is configured
    const { supabase } = await import("../supabase");
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  } else {
    // Supabase login (default)
    const { supabase } = await import("../supabase");
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  }
}

// Logout from appropriate provider
export async function canaryLogout(email?: string): Promise<void> {
  if (shouldUseClerk(email)) {
    console.log("[CANARY] Clerk logout requested for:", email);
    // Clerk logout will be handled by useAuth() when Clerk is active
    // For now, also sign out from Supabase to be safe
    const { supabase } = await import("../supabase");
    await supabase.auth.signOut();
  } else {
    // Supabase logout (default)
    const { supabase } = await import("../supabase");
    await supabase.auth.signOut();
  }
}
