# Scantap domain and email cutover

Last reviewed: 2026-08-18

## Current state

The intended names are reserved in the repository, but they are not live:

| Purpose | Intended value | Current state |
| --- | --- | --- |
| Public website | `https://scantapreviews.com` | Domain not purchased |
| Website alias | `https://www.scantapreviews.com` | Not configured |
| Supabase API/Auth/Storage | `https://api.scantapreviews.com` | Oracle and DNS pending |
| Independent status page | `https://status.scantapreviews.com` | Reserved for later |
| Main human mailbox | `contact@scantapreviews.com` | Mailbox not configured |

`config/production-targets.json` is the non-secret source of truth for these planned values. Do not change its pending-state fields until the corresponding external verification has actually passed.

## Purchase and ownership gate

1. Buy `scantapreviews.com` through an account controlled by Scantap.
2. Enable registrar MFA, recovery codes, transfer lock, and renewal notifications.
3. Turn on automatic renewal with a valid payment method and record the registrar outside source control.
4. Verify registrant and recovery details without putting private account data in the repository.
5. Do not change Vercel, Oracle, OAuth, or SMTP production settings before ownership is confirmed.

## DNS plan

Create records only after the destination is known and verified:

- Apex and `www`: use the exact records Vercel displays for the connected project. Redirect `www` to the apex or the apex to `www`; Scantap's canonical choice is the apex.
- `api`: point an `A` record to the verified Oracle public IPv4. Do not create an `AAAA` record unless IPv6 is configured and tested end to end.
- `status`: keep absent until a status service outside the Oracle failure domain exists.
- Use a low TTL during cutover, then raise it after the verification window.

DNS ownership does not prove application readiness. Before directing traffic, verify the Oracle instance identity, firewall, Caddy/Envoy path, and the exact Vercel project.

## TLS and callback order

1. Configure `api.scantapreviews.com` in the self-hosted Supabase environment.
2. Point the `api` DNS record at the verified Oracle IP.
3. Open only ports 80 and 443 after Caddy is ready; keep 5432, 6543, 8000, and Studio private.
4. Obtain a valid public certificate and verify `https://api.scantapreviews.com/auth/v1/health`.
5. Add `scantapreviews.com` to Vercel and wait for its valid certificate.
6. Set Supabase Auth `SITE_URL` and the exact redirect allowlist to the HTTPS website origin.
7. Set the Google OAuth redirect URI to `https://scantapreviews.com/api/integrations/google/callback` only after that route is live.
8. Run `pnpm verify:deployment -- --full` with explicit app and API origins.

Do not use an Oracle IP address, a self-signed certificate, or an unverified host header as a production Auth/OAuth callback.

## Human mailbox and transactional email are separate

`contact@scantapreviews.com` is the public inbox for people. Supabase Auth also needs a production SMTP service for confirmations, invitations, resets, and security messages. They may use the same domain, but they are separate operational systems.

Before publishing the contact address:

1. Create the mailbox or forwarding destination.
2. Send inbound tests from at least two unrelated providers.
3. Send outbound tests and verify replies return to the expected inbox.
4. Configure SPF and the mailbox provider's DKIM records.
5. Add DMARC in monitoring mode first and review reports before moving to quarantine or reject.
6. Keep registrar, DNS, mailbox, and SMTP recovery access documented outside source control.

Before inviting external users through Supabase Auth:

1. Select a transactional SMTP provider and verify the sending domain.
2. Configure server-only `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_ADMIN_EMAIL`, and `SMTP_SENDER_NAME` values in the root-owned Supabase environment.
3. Use a sender identity that can receive replies or clearly directs support to the active contact mailbox.
4. Apply conservative Auth email rate limits.
5. Exercise invitation, confirmation, password-reset, and security-notification flows with test accounts.
6. Inspect delivery, spam placement, links, expiry, and failure behavior before onboarding a pilot.

Never commit DNS-provider credentials, SMTP credentials, recovery codes, email API keys, or mailbox passwords.

## Cutover completion evidence

The domain/email step is complete only when all applicable evidence exists:

- registrar ownership and renewal controls verified;
- Vercel and Oracle DNS answers match their intended destinations;
- public certificates are valid;
- app and API production verification passes;
- Google callback uses the exact HTTPS URI;
- contact mailbox receives and sends successfully;
- Auth emails are delivered through production SMTP;
- SPF and DKIM pass, and DMARC monitoring is active;
- no internal service port is publicly reachable.
