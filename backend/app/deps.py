import base64
import json
from dataclasses import dataclass

from fastapi import Header, HTTPException


@dataclass
class AuthedUser:
    token: str
    user_id: str

    def headers(self) -> dict:
        return {"Authorization": f"Bearer {self.token}"}


def _user_id_from_token(token: str) -> str:
    try:
        payload_segment = token.split(".")[1]
        padded = payload_segment + "=" * (-len(payload_segment) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded))
        return payload["sub"]
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc


def get_authed_user(authorization: str | None = Header(default=None)) -> AuthedUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.removeprefix("Bearer ")

    # The actual signature/expiry check happens server-side at Supabase's
    # PostgREST layer on the data call below (an invalid token surfaces as
    # an error there). We only decode the payload here to read the user id.
    user_id = _user_id_from_token(token)
    return AuthedUser(token=token, user_id=user_id)
