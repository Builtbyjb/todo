from typing import Annotated
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlmodel import Session, select
from database import create_db_and_tables, get_session, Tasks
import uvicorn


HOST = "127.0.0.1"
PORT = 8000

# Create database on startup
@asynccontextmanager
async def on_startup(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=on_startup)

templates  = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Task schema
class Task(BaseModel):
    task: str

"""
Using int because Javascript representation of boolean values
is different from the python representation
"""
class Stage(BaseModel):
    is_completed: int

# Creates database instance
Db = Annotated[Session, Depends(get_session)]

@app.get("/")
async def get_tasks(request: Request, db: Db):
    # Get all tasks from that database is decending order
    tasks = db.exec(select(Tasks).order_by(Tasks.id.desc())).all()
    return templates.TemplateResponse("index.html", {
        "request": request,
        "tasks": tasks,
    })


@app.post("/create")
async def create_task(request: Task, db: Db):
    task = Tasks(task = request.task)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.put("/edit/{id}")
async def edit_task(id: int, request: Task, db: Db):
    task = db.exec(select(Tasks).where(Tasks.id==id)).one()
    task.task = request.task
    db.add(task)
    db.commit()
    db.refresh(task)
    return "success"


@app.put("/stage/{id}")
async def task_stage(id: int, request: Stage, db: Db ):
    task = db.exec(select(Tasks).where(Tasks.id==id)).one()
    task.is_completed = request.is_completed
    db.add(task)
    db.commit()
    db.refresh(task)
    return "success"


@app.delete("/delete/{id}")
async def delete_task(id: int, db: Db):
    task = db.exec(select(Tasks).where(Tasks.id==id)).one()
    db.delete(task)
    db.commit()
    return "success"


if __name__ == "__main__":
    uvicorn.run(
        "server:app", 
        host=HOST, 
        port=PORT, 
        reload=True,
        log_level="info"
    )