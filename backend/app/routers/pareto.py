from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.db import get_db_client
from app.deps import AuthedUser, get_authed_user

router = APIRouter(prefix="/pareto-items", tags=["pareto"])
db = get_db_client()


class Item(BaseModel):
    id: str
    text: str
    vital: bool


class CreateItemPayload(BaseModel):
    text: str


class UpdateItemPayload(BaseModel):
    text: str | None = None
    vital: bool | None = None


@router.get("", response_model=list[Item])
def list_items(authed: AuthedUser = Depends(get_authed_user)):
    resp = db.get(
        "/pareto_items",
        params={
            "select": "id,text,vital",
            "user_id": f"eq.{authed.user_id}",
            "order": "created_at",
        },
        headers=authed.headers(),
    )
    resp.raise_for_status()
    return resp.json()


@router.post("", response_model=Item)
def create_item(
    payload: CreateItemPayload, authed: AuthedUser = Depends(get_authed_user)
):
    resp = db.post(
        "/pareto_items",
        headers={**authed.headers(), "Prefer": "return=representation"},
        json={"user_id": authed.user_id, "text": payload.text},
    )
    resp.raise_for_status()
    return resp.json()[0]


@router.patch("/{item_id}", response_model=Item)
def update_item(
    item_id: str,
    payload: UpdateItemPayload,
    authed: AuthedUser = Depends(get_authed_user),
):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    resp = db.patch(
        "/pareto_items",
        params={"id": f"eq.{item_id}", "user_id": f"eq.{authed.user_id}"},
        headers={**authed.headers(), "Prefer": "return=representation"},
        json=updates,
    )
    resp.raise_for_status()
    rows = resp.json()
    if not rows:
        raise HTTPException(status_code=404, detail="Item not found")
    return rows[0]


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: str, authed: AuthedUser = Depends(get_authed_user)):
    resp = db.delete(
        "/pareto_items",
        params={"id": f"eq.{item_id}", "user_id": f"eq.{authed.user_id}"},
        headers=authed.headers(),
    )
    resp.raise_for_status()
