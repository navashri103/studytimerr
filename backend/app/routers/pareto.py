from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.deps import AuthedUser, get_authed_user

router = APIRouter(prefix="/pareto-items", tags=["pareto"])


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
    result = (
        authed.client.table("pareto_items")
        .select("id, text, vital")
        .eq("user_id", authed.user_id)
        .order("created_at")
        .execute()
    )
    return result.data


@router.post("", response_model=Item)
def create_item(
    payload: CreateItemPayload, authed: AuthedUser = Depends(get_authed_user)
):
    result = (
        authed.client.table("pareto_items")
        .insert({"user_id": authed.user_id, "text": payload.text})
        .execute()
    )
    return result.data[0]


@router.patch("/{item_id}", response_model=Item)
def update_item(
    item_id: str,
    payload: UpdateItemPayload,
    authed: AuthedUser = Depends(get_authed_user),
):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = (
        authed.client.table("pareto_items")
        .update(updates)
        .eq("id", item_id)
        .eq("user_id", authed.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Item not found")
    return result.data[0]


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: str, authed: AuthedUser = Depends(get_authed_user)):
    authed.client.table("pareto_items").delete().eq("id", item_id).eq(
        "user_id", authed.user_id
    ).execute()
