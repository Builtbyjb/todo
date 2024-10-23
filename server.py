from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn


HOST = "127.0.0.1"
PORT = 8000

app = FastAPI()

templates  = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

tasks = [{"text": "task 1"}, {"text": "task 2"}]

class Task(BaseModel):
    task: str

@app.get("/")
async def get_tasks(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
        "tasks": tasks,
    })


@app.post("/create")
async def create_task(request: Task):
    ...


@app.put("/edit")
async def edit_task():
    ...


@app.delete("/delete")
async def delete_task():
    ...



if __name__ == "__main__":
    uvicorn.run(
        "server:app", 
        host=HOST, 
        port=PORT, 
        reload=True,
        log_level="info"
    )