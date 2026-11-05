# Phase 37 — Native WebView API connectivity

The native build stages Cloudflare API URLs, but deployment requires testing cross-origin calls from iOS and Android WebViews.

## Verification plan

1. Confirm the actual app origin on both platforms and record request/response headers.
2. Review Cloudflare API responses for preflight handling, origin allowlisting, cache variation, and rejection of unexpected origins.
3. Preserve the browser site's same-origin behavior and avoid exposing routing secrets.
4. Test OGD, diagnostics and routing endpoints on real devices, including failures and retry states.
5. Run automated regression tests before publishing.

No device verification or store submission is claimed by this document.
