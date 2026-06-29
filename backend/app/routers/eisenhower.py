from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.db import get_db_client
from app.deps import AuthedUser, get_authed_user

router = APIRouter(prefix="/eisenhower-tasks", tags=["eisenhower"])
db = get_db_client()

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
    resp = db.get(
        "/eisenhower_tasks",
        params={
            "select": "id,quadrant,text,completed",
            "user_id": f"eq.{authed.user_id}",
            "order": "created_at",
        },
        headers=authed.headers(),
    )
    resp.raise_for_status()
    return resp.json()


@router.post("", response_model=Task)
def create_task(
    payload: CreateTaskPayload, authed: AuthedUser = Depends(get_authed_user)
):
    resp = db.post(
        "/eisenhower_tasks",
        headers={**authed.headers(), "Prefer": "return=representation"},
        json={
            "user_id": authed.user_id,
            "quadrant": payload.quadrant,
            "text": payload.text,
        },
    )
    resp.raise_for_status()
    return resp.json()[0]


@router.patch("/{task_id}", response_model=Task)
def update_task(
    task_id: str,
    payload: UpdateTaskPayload,
    authed: AuthedUser = Depends(get_authed_user),
):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    resp = db.patch(
        "/eisenhower_tasks",
        params={"id": f"eq.{task_id}", "user_id": f"eq.{authed.user_id}"},
        headers={**authed.headers(), "Prefer": "return=representation"},
        json=updates,
    )
    resp.raise_for_status()
    rows = resp.json()
    if not rows:
        raise HTTPException(status_code=404, detail="Task not found")
    return rows[0]


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: str, authed: AuthedUser = Depends(get_authed_user)):
    resp = db.delete(
        "/eisenhower_tasks",
        params={"id": f"eq.{task_id}", "user_id": f"eq.{authed.user_id}"},
        headers=authed.headers(),
    )
    resp.raise_for_status()
