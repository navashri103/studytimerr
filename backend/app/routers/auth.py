from fastapi import APIRouter, HTTPException
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


@router.post("/signup", response_model=Session)
def signup(credentials: Credentials):
    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    try:
        result = client.auth.sign_up(
            {"email": credentials.email, "password": credentials.password}
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not result.session:
        raise HTTPException(
            status_code=400,
            detail=(
                "Signup succeeded but no session was returned. Disable "
                '"Confirm email" under Authentication > Sign In / Providers '
                "in the Supabase dashboard for this demo."
            ),
        )

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
