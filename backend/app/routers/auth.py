from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from supabase import create_client

from app.config import SUPABASE_ANON_KEY, SUPABASE_URL

router = APIRouter(prefix="/auth", tags=["auth"])


class Credentials(BaseModel):
    email: EmailStr
    password: str


class Session(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    email: str


class RefreshPayload(BaseModel):
    refresh_token: str


@router.post("/signup")
def signup(credentials: Credentials):
    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    try:
        result = client.auth.sign_up(
            {"email": credentials.email, "password": credentials.password}
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not result.session:
        # Email confirmation is enabled — signup succeeded but the user must
        # verify their email before they can log in.
        return JSONResponse(
            status_code=202,
            content={"confirm_email": True},
        )

    return Session(
        access_token=result.session.access_token,
        refresh_token=result.session.refresh_token,
        user_id=result.user.id,
        email=result.user.email,
    )


@router.post("/refresh", response_model=Session)
def refresh(payload: RefreshPayload):
    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    try:
        result = client.auth.refresh_session(payload.refresh_token)
    except Exception as exc:
        raise HTTPException(
            status_code=401, detail="Invalid or expired refresh token"
        ) from exc

    if not result.session:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    return Session(
        access_token=result.session.access_token,
        refresh_token=result.session.refresh_token,
        user_id=result.user.id,
        email=result.user.email,
    )


@router.post("/login", response_model=Session)
def login(credentials: Credentials):
    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    try:
        result = client.auth.sign_in_with_password(
            {"email": credentials.email, "password": credentials.password}
        )
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid email or password") from exc

    return Session(
        access_token=result.session.access_token,
        refresh_token=result.session.refresh_token,
        user_id=result.user.id,
        email=result.user.email,
    )
