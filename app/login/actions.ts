"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { authenticatedLandingPath } from "@/lib/control";

export type LoginState = {
  status: "idle" | "error" | "notice";
  message: string;
};

const credentialsSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least eight characters."),
  next: z.string().optional(),
  intent: z.enum(["login", "signup"]),
});

function safeNext(value: string | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : undefined;
}

export async function authenticate(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      status: "error",
      message: "Account services still need their Supabase project settings.",
    };
  }

  if (parsed.data.intent === "signup") {
    const headerStore = await headers();
    const origin = headerStore.get("origin") || process.env.NEXT_PUBLIC_SITE_URL;
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: origin
          ? `${origin}/auth/callback${safeNext(parsed.data.next) ? `?next=${encodeURIComponent(safeNext(parsed.data.next)!)}` : ""}`
          : undefined,
      },
    });

    if (error) return { status: "error", message: error.message };
    if (data.session && data.user) {
      redirect(await authenticatedLandingPath(supabase, data.user, safeNext(parsed.data.next)));
    }

    return {
      status: "notice",
      message: "Check your email to confirm your account, then return here to sign in.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { status: "error", message: "That email and password did not match." };
  redirect(await authenticatedLandingPath(supabase, data.user, safeNext(parsed.data.next)));
}
