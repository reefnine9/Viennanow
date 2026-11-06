"""RETIRED: Phase 24 legacy app.js-to-HTML synchronization.

This script previously overwrote public/index.html from app.js, which can destroy
newer ViennaNow features. Production source is public/index.html; the old root
HTML has been frozen as index_old.html. Never auto-sync both.
"""
raise SystemExit("Retired legacy script: do NOT overwrite public/index.html from app.js. Edit the production public/index.html directly.")
