import { cache } from "react";
import { createClient } from "./supabase/server";

// Who is logged in, and are they an admin. Used by pages and server actions
// before they do anything privileged.
//
// This is the app-side half of the check. The database half is the is_admin()
// function in supabase/schema.sql, which the RLS policies call. Both exist on
// purpose: this one lets the UI show or hide things, that one actually stops
// unauthorised rows from moving.

export type Role = "customer" | "admin";

export type CurrentUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: Role;
};

// Two round trips: auth.getUser() validates the session token with Supabase
// Auth, then the profiles lookup fetches the role, which lives in our own
// table rather than in auth.users.
//
// cache() collapses this to one lookup per render, which matters because the
// header, the page and any server action all call it.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // maybeSingle(), not single(): the profile row is created by a trigger, and
  // a missing one should degrade to the customer default rather than throw.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    // Name falls back to the signup metadata, then to null.
    fullName:
      profile?.full_name ??
      (user.user_metadata?.full_name as string | undefined) ??
      null,
    // Default to the least privileged role whenever the profile is missing.
    role: (profile?.role as Role) ?? "customer",
  };
});

export const isAdmin = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.role === "admin";
});
