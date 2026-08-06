"use client";

import Link from "next/link";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { authenticate, type LoginState } from "@/app/login/actions";

const initialState: LoginState = { status: "idle", message: "" };

function SubmitActions({ configured }: { configured: boolean }) {
  const { pending } = useFormStatus();

  return (
    <div className="login-actions">
      <button
        className="button button-primary"
        disabled={!configured || pending}
        name="intent"
        type="submit"
        value="login"
      >
        {pending ? <LoaderCircle className="spin" size={16} /> : null}
        Log in
      </button>
      <button
        className="button button-quiet"
        disabled={!configured || pending}
        name="intent"
        type="submit"
        value="signup"
      >
        Create account
      </button>
    </div>
  );
}

export function LoginForm({
  configured,
  next = "",
}: {
  configured: boolean;
  next?: string;
}) {
  const [state, formAction] = useActionState(authenticate, initialState);
  const setupMessage = configured
    ? "Use your business email. New accounts create their organization after sign-in."
    : "The application is built, but its Supabase project settings have not been connected yet.";

  return (
    <form action={formAction} className="login-form">
      <input name="next" type="hidden" value={next} />
      <div className="login-form-icon"><LockKeyhole size={23} /></div>
      <h2>Scantap workspace</h2>
      <p>{setupMessage}</p>
      <label htmlFor="login-email">Business email</label>
      <input autoComplete="email" id="login-email" name="email" placeholder="you@business.com" required type="email" />
      <label htmlFor="login-password">Password</label>
      <input autoComplete="current-password" id="login-password" minLength={8} name="password" placeholder="At least 8 characters" required type="password" />
      <SubmitActions configured={configured} />
      {state.message && (
        <p className={`login-status ${state.status}`} role="status">{state.message}</p>
      )}
      <Link className="text-link-arrow" href="/dashboard">Explore the public demo <ArrowRight size={15} /></Link>
    </form>
  );
}
