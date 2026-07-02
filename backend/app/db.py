import httpx

from app.config import SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL

# A single, connection-pooled client shared across every request. Creating a
# fresh client (and therefore a fresh TCP+TLS handshake) per request was
# adding ~1s of latency to every API call - this reuses the same pooled
# connections instead.
_client = httpx.Client(
    base_url=f"{SUPABASE_URL}/rest/v1",
    headers={"apikey": SUPABASE_ANON_KEY},
    timeout=10.0,
)

# Separate pooled client authenticated with the service-role key, which
# bypasses row-level security. Only used where there's no user JWT to
# authenticate as (the Spotify OAuth callback) - every other route must keep
# using get_db_client() + the caller's own token so RLS stays enforced.
_service_client = httpx.Client(
    base_url=f"{SUPABASE_URL}/rest/v1",
    headers={
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    },
    timeout=10.0,
)


def get_db_client() -> httpx.Client:
    return _client


def get_service_db_client() -> httpx.Client:
    return _service_client
