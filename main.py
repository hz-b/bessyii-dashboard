from fastapi import FastAPI, Request
from pymongo import MongoClient
from starlette.templating import Jinja2Templates

# from bact_bessyii_bluesky.applib.bba.api import router as api_router
from src.controller.index_controller import router as api_router
import uvicorn
from fastapi import APIRouter
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/static", StaticFiles(directory="."), name="static")
templates = Jinja2Templates(directory="src/templates")

@app.on_event("startup")
def startup_db_client():
    app.mongodb_client = MongoClient("mongodb://127.0.0.1:27017/")
    app.database = app.mongodb_client["bessyii"]


@app.on_event("shutdown")
def shutdown_db_client():
    pass

app.include_router(api_router, tags=["measurements"], prefix="")

@app.get("/favicon.ico")
async def favicon():
    return ""

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
