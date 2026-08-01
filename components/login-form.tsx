"use client";

import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Customer accounts are not connected yet. You can explore the dashboard demo now.");
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-form-icon"><LockKeyhole size={23} /></div>
      <h2>Customer login</h2>
      <p>Account access will open when the live customer dashboard is connected.</p>
      <label htmlFor="login-email">Email address</label>
      <input autoComplete="email" id="login-email" name="email" placeholder="you@business.com…" required type="email" />
      <label htmlFor="login-password">Password</label>
      <input autoComplete="current-password" id="login-password" name="password" placeholder="Your password…" required type="password" />
      <button className="button button-primary" type="submit">Log in</button>
      {message && <p className="login-status" role="status">{message}</p>}
      <Link className="text-link-arrow" href="/dashboard">Explore the demo instead <ArrowRight size={15} /></Link>
    </form>
  );
}
