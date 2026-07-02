import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from app.config import (
    FRONTEND_URL,
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URI,
)
from app.db import get_service_db_client
from app.deps import AuthedUser, get_authed_user

router = APIRouter(prefix="/spotify", tags=["spotify"])
service_db = get_service_db_client()

SCOPES = (
    "streaming user-read-email user-read-private "
    "user-modify-playback-state user-read-playback-state "
    "user-library-read playlist-read-private"
)
STATE_TTL = timedelta(minutes=10)
TOKEN_REFRESH_SKEW = timedelta(seconds=60)


def _require_configured() -> None:
    if not (SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET):
        raise HTTPException(
            status_code=501,
            detail="Spotify integration is not configured on this server",
        )


class LoginResponse(BaseModel):
    authorize_url: str


class StatusResponse(BaseModel):
    connected: bool
    premium: bool


class TokenResponse(BaseModel):
    access_token: str
    expires_in: int


def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()


def _fetch_token_row(user_id: str) -> dict | None:
    resp = service_db.get(
        "/spotify_tokens",
        params={"select": "*", "user_id": f"eq.{user_id}"},
    )
    resp.raise_for_status()
    rows = resp.json()
    return rows[0] if rows else None


def _upsert_token_row(row: dict) -> None:
    resp = service_db.post(
        "/spotify_tokens",
        params={"on_conflict": "user_id"},
        headers={"Prefer": "resolution=merge-duplicates"},
        json=row,
    )
    resp.raise_for_status()


def _delete_token_row(user_id: str) -> None:
    resp = service_db.delete(
        "/spotify_tokens",
        params={"user_id": f"eq.{user_id}"},
    )
    resp.raise_for_status()


def _exchange_code_for_tokens(code: str) -> dict:
    resp = httpx.post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": SPOTIFY_REDIRECT_URI,
            "client_id": SPOTIFY_CLIENT_ID,
            "client_secret": SPOTIFY_CLIENT_SECRET,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=10.0,
    )
    resp.raise_for_status()
    return resp.json()


def _refresh_access_token(refresh_token: str) -> dict:
    resp = httpx.post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": SPOTIFY_CLIENT_ID,
            "client_secret": SPOTIFY_CLIENT_SECRET,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=10.0,
    )
    resp.raise_for_status()
    return resp.json()


def _fetch_is_premium(access_token: str) -> bool:
    resp = httpx.get(
        "https://api.spotify.com/v1/me",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10.0,
    )
    resp.raise_for_status()
    return resp.json().get("product") == "premium"


@router.get("/login", response_model=LoginResponse)
def login(authed: AuthedUser = Depends(get_authed_user)):
    _require_configured()

    state = secrets.token_urlsafe(24)
    expires_at = datetime.now(timezone.utc) + STATE_TTL
    resp = service_db.post(
        "/spotify_oauth_state",
        json={
            "state": state,
            "user_id": authed.user_id,
            "expires_at": _iso(expires_at),
        },
    )
    resp.raise_for_status()

    params = {
        "response_type": "code",
        "client_id": SPOTIFY_CLIENT_ID,
        "scope": SCOPES,
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "state": state,
        # Force the consent screen so newly-added scopes are actually granted
        # on reconnect (Spotify otherwise silently reuses prior consent).
        "show_dialog": "true",
    }
    return LoginResponse(
        authorize_url=f"https://accounts.spotify.com/authorize?{urlencode(params)}"
    )


@router.get("/callback")
def callback(code: str | None = None, state: str | None = None, error: str | None = None):
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/?spotify=error&reason=denied")
    if not code or not state:
        return RedirectResponse(f"{FRONTEND_URL}/?spotify=error&reason=state")

    resp = service_db.get(
        "/spotify_oauth_state",
        params={"select": "*", "state": f"eq.{state}"},
    )
    resp.raise_for_status()
    rows = resp.json()
    service_db.delete("/spotify_oauth_state", params={"state": f"eq.{state}"})

    if not rows:
        return RedirectResponse(f"{FRONTEND_URL}/?spotify=error&reason=state")

    state_row = rows[0]
    expires_at = datetime.fromisoformat(state_row["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        return RedirectResponse(f"{FRONTEND_URL}/?spotify=error&reason=state")

    try:
        tokens = _exchange_code_for_tokens(code)
        is_premium = _fetch_is_premium(tokens["access_token"])
    except httpx.HTTPStatusError:
        return RedirectResponse(f"{FRONTEND_URL}/?spotify=error&reason=exchange")

    token_expires_at = datetime.now(timezone.utc) + timedelta(
        seconds=tokens["expires_in"]
    )
    _upsert_token_row(
        {
            "user_id": state_row["user_id"],
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "expires_at": _iso(token_expires_at),
            "is_premium": is_premium,
            "scope": tokens.get("scope", SCOPES),
            "updated_at": _iso(datetime.now(timezone.utc)),
        }
    )

    return RedirectResponse(f"{FRONTEND_URL}/?spotify=connected")


@router.get("/status", response_model=StatusResponse)
def status(authed: AuthedUser = Depends(get_authed_user)):
    row = _fetch_token_row(authed.user_id)
    if not row:
        return StatusResponse(connected=False, premium=False)
    return StatusResponse(connected=True, premium=row["is_premium"])


@router.post("/token", response_model=TokenResponse)
def get_token(authed: AuthedUser = Depends(get_authed_user)):
    row = _fetch_token_row(authed.user_id)
    if not row:
        raise HTTPException(status_code=404, detail="Spotify not connected")

    expires_at = datetime.fromisoformat(row["expires_at"])
    if datetime.now(timezone.utc) < expires_at - TOKEN_REFRESH_SKEW:
        return TokenResponse(
            access_token=row["access_token"],
            expires_in=int((expires_at - datetime.now(timezone.utc)).total_seconds()),
        )

    try:
        tokens = _refresh_access_token(row["refresh_token"])
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 400:
            _delete_token_row(authed.user_id)
            raise HTTPException(
                status_code=409, detail="Spotify connection expired, please reconnect"
            ) from exc
        raise

    new_expires_at = datetime.now(timezone.utc) + timedelta(seconds=tokens["expires_in"])
    _upsert_token_row(
        {
            "user_id": authed.user_id,
            "access_token": tokens["access_token"],
            # Spotify only returns a new refresh_token sometimes - keep the
            # old one if it didn't send a replacement.
            "refresh_token": tokens.get("refresh_token", row["refresh_token"]),
            "expires_at": _iso(new_expires_at),
            "is_premium": row["is_premium"],
            "scope": tokens.get("scope", row["scope"]),
            "updated_at": _iso(datetime.now(timezone.utc)),
        }
    )
    return TokenResponse(access_token=tokens["access_token"], expires_in=tokens["expires_in"])


@router.post("/disconnect")
def disconnect(authed: AuthedUser = Depends(get_authed_user)):
    _delete_token_row(authed.user_id)
    return {"ok": True}
