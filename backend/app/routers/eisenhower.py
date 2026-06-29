from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.deps import AuthedUser, get_authed_user

router = APIRouter(prefix="/eisenhower-tasks", tags=["eisenhower"])

Quadrant = Literal["do", "decide", "delegate", "delete"]


class Task(BaseModel):
    id: str
    quadrant: Quadrant
    text: str
    completed: bool


class CreateTaskPayload(BaseModel):
    quadrant: Quadrant
    text: str


class UpdateTaskPayload(BaseModel):
    text: str | None = None
    completed: bool | None = None


@router.get("", response_model=list[Task])
def list_tasks(authed: AuthedUser = Depends(get_authed_user)):
    result = (
        authed.client.table("eisenhower_tasks")
        .select("id, quadrant, text, completed")
        .eq("user_id", authed.user_id)
        .order("created_at")
        .execute()
    )
    return result.data


@router.post("", response_model=Task)
def create_task(
    payload: CreateTaskPayload, authed: AuthedUser = Depends(get_authed_user)
):
    result = (
        authed.client.table("eisenhower_tasks")
        .insert(
            {
                "user_id": authed.user_id,
                "quadrant": payload.quadrant,
                "text": payload.text,
            }
        )
        .execute()
    )
    return result.data[0]


@router.patch("/{task_id}", response_model=Task)
def update_task(
    task_id: str,
    payload: UpdateTaskPayload,
    authed: AuthedUser = Depends(get_authed_user),
):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = (
        authed.client.table("eisenhower_tasks")
        .update(updates)
        .eq("id", task_id)
        .eq("user_id", authed.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return result.data[0]


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: str, authed: AuthedUser = Depends(get_authed_user)):
    authed.client.table("eisenhower_tasks").delete().eq("id", task_id).eq(
        "user_id", authed.user_id
    ).execute()
